import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, firebaseEnabled, handleFirestoreError, OperationType } from './firebaseClient.ts';

function requireFirebase(): void {
  if (!firebaseEnabled) {
    throw new Error('Firebase is not configured. Add your project settings to .env.local and restart the dev server.');
  }
}

export interface CaregiverUserProfile {
  uid: string;
  email: string;
  displayName: string;
  circleId?: string;
  createdAt: string;
}

export const authService = {
  /**
   * Authenticates using Google Popup (default supported provider for Firebase provisioning)
   */
  async loginWithGoogle(): Promise<FirebaseUser> {
    requireFirebase();
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const credential = await signInWithPopup(auth, provider);
    const user = credential.user;

    // Ensure user record exists in Firestore
    const userRef = doc(db, 'users', user.uid);
    const circleId = `circle-${user.uid.slice(0, 8)}`;
    try {
      const snap = await getDoc(userRef);
      if (!snap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || 'Caregiver',
          circleId,
          createdAt: new Date().toISOString(),
        });
      }

      // Ensure Care Circle document exists in Firestore
      const circleRef = doc(db, 'careCircles', circleId);
      const circleSnap = await getDoc(circleRef);
      if (!circleSnap.exists()) {
        await setDoc(
          circleRef,
          {
            id: circleId,
            name: 'Aita Family Care Circle',
            primaryCaregiverUid: user.uid,
            memberUids: [user.uid],
            planVersion: 1,
            createdAt: new Date().toISOString(),
          },
          { merge: true }
        );
      }
    } catch (err) {
      console.warn('Could not sync user profile or circle to Firestore:', err);
    }

    return user;
  },

  /**
   * Registers a new caregiver user
   */
  async register(email: string, password: string, displayName: string): Promise<FirebaseUser> {
    requireFirebase();
    const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
    const user = credential.user;

    if (displayName.trim()) {
      await updateProfile(user, { displayName: displayName.trim() });
    }

    // Initialize user profile in Firestore
    const userRef = doc(db, 'users', user.uid);
    const circleId = `circle-${user.uid.slice(0, 8)}`;
    try {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email || email,
        displayName: displayName.trim() || 'Caregiver',
        circleId,
        role: 'primary_caregiver',
        createdAt: new Date().toISOString(),
      });

      // Initialize Care Circle in Firestore
      const circleRef = doc(db, 'careCircles', circleId);
      await setDoc(
        circleRef,
        {
          id: circleId,
          name: displayName.trim() ? `${displayName.trim()}'s Care Circle` : 'Aita Family Care Circle',
          primaryCaregiverUid: user.uid,
          memberUids: [user.uid],
          planVersion: 1,
          createdAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
    }

    return user;
  },

  /**
   * Authenticates an existing caregiver
   */
  async login(email: string, password: string): Promise<FirebaseUser> {
    requireFirebase();
    const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
    const user = credential.user;

    // Ensure user record and circle exist
    const userRef = doc(db, 'users', user.uid);
    const circleId = `circle-${user.uid.slice(0, 8)}`;
    try {
      const snap = await getDoc(userRef);
      if (!snap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email || email,
          displayName: user.displayName || 'Caregiver',
          circleId,
          role: 'primary_caregiver',
          createdAt: new Date().toISOString(),
        });
      }

      const circleRef = doc(db, 'careCircles', circleId);
      const circleSnap = await getDoc(circleRef);
      if (!circleSnap.exists()) {
        await setDoc(
          circleRef,
          {
            id: circleId,
            name: 'Aita Family Care Circle',
            primaryCaregiverUid: user.uid,
            memberUids: [user.uid],
            planVersion: 1,
            createdAt: new Date().toISOString(),
          },
          { merge: true }
        );
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
    }

    return user;
  },

  /**
   * Logs out the current user
   */
  async logout(): Promise<void> {
    await signOut(auth);
  },

  /**
   * Subscribes to auth state transitions
   */
  onAuthChange(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, callback);
  },

  /**
   * Retrieves profile document from Firestore
   */
  async getUserProfile(uid: string): Promise<CaregiverUserProfile | null> {
    const userRef = doc(db, 'users', uid);
    try {
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        return snap.data() as CaregiverUserProfile;
      }
      return null;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `users/${uid}`);
    }
  },

  /**
   * Current user helper
   */
  getCurrentUser(): FirebaseUser | null {
    return auth.currentUser;
  },
};
