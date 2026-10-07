import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase web configuration is public, but it must belong to the user's own project.
// Without it, a local-only demo app is initialized; no cloud request is made on boot.
export const firebaseEnabled = Boolean(
  import.meta.env.VITE_FIREBASE_API_KEY &&
  import.meta.env.VITE_FIREBASE_AUTH_DOMAIN &&
  import.meta.env.VITE_FIREBASE_PROJECT_ID &&
  import.meta.env.VITE_FIREBASE_APP_ID &&
  import.meta.env.VITE_FIREBASE_STORAGE_BUCKET
);

const firebaseConfig = firebaseEnabled
  ? {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    }
  : {
      apiKey: 'local-demo-only',
      authDomain: 'local-demo.invalid',
      projectId: 'local-demo',
      appId: 'local-demo',
      storageBucket: 'local-demo.invalid',
    };

const firestoreDatabaseId = import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || '(default)';
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firestore with long polling enabled for robust connectivity in web sandbox environments
let firestoreInstance;
try {
  firestoreInstance = initializeFirestore(app, {
    experimentalAutoDetectLongPolling: true,
  }, firestoreDatabaseId);
} catch {
  firestoreInstance = getFirestore(app, firestoreDatabaseId);
}

// Export core Firebase instances
export const auth = getAuth(app);
export const db = firestoreInstance;
export const storage = getStorage(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

/**
 * Robust error handler conforming to AI Studio error diagnostics
 */
export function logFirestoreError(error: unknown, operationType: OperationType, path: string | null): void {
  const errorMsg = error instanceof Error ? error.message : String(error);
  const errorCode = (error as { code?: string })?.code;

  // Gracefully handle expected transient offline/network conditions without alarm spam
  if (
    errorCode === 'unavailable' ||
    errorMsg.includes('unavailable') ||
    errorMsg.includes('the client is offline') ||
    errorMsg.includes('Could not reach Cloud Firestore backend')
  ) {
    console.warn(`[Firestore Offline Mode] Operation ${operationType} on ${path || 'unknown'} will sync once online.`);
    return;
  }

  const errInfo: FirestoreErrorInfo = {
    error: errorMsg,
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || false,
      isAnonymous: auth.currentUser?.isAnonymous || false,
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  logFirestoreError(error, operationType, path);
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || false,
      isAnonymous: auth.currentUser?.isAnonymous || false,
    },
    operationType,
    path,
  };
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Validates connection to Firestore backend gracefully
 */
export async function testFirestoreConnection(): Promise<boolean> {
  if (!firebaseEnabled) return false;
  try {
    // Attempt lightweight server fetch as specified in Firebase skill
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    const errorCode = (error as { code?: string })?.code;
    if (
      errorCode === 'unavailable' ||
      errorMsg.includes('the client is offline') ||
      errorMsg.includes('unavailable') ||
      errorMsg.includes('Could not reach Cloud Firestore backend')
    ) {
      console.warn('Firestore is currently running in offline client mode.');
      return false;
    }
    // Permissions error or missing doc is normal for test doc and indicates server was contacted
    return true;
  }
}
