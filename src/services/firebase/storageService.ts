import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, firebaseEnabled } from './firebaseClient.ts';

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export interface UploadResult {
  downloadUrl: string;
  storagePath: string;
  sizeBytes: number;
}

export const storageService = {
  /**
   * Validates and uploads a memory photo to Firebase Storage
   */
  async uploadMemoryPhoto(circleId: string, file: File): Promise<UploadResult> {
    if (!firebaseEnabled) {
      throw new Error('Firebase Storage is not configured. Add your Firebase web config to .env.local.');
    }
    // 1. MIME type validation
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      throw new Error(`Invalid file type (${file.type}). Allowed formats: JPEG, PNG, WebP.`);
    }

    // 2. File size validation (max 5 MB)
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      throw new Error(`File size (${sizeMB} MB) exceeds maximum limit of 5 MB.`);
    }

    // 3. Safe filename generation
    const sanitizedName = file.name
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .toLowerCase()
      .slice(0, 64);
    const timestamp = Date.now();
    const safeCircleId = circleId.replace(/[^a-zA-Z0-9_-]/g, '');
    const storagePath = `careCircles/${safeCircleId}/memories/${timestamp}_${sanitizedName}`;

    // 4. Upload to Firebase Storage
    const storageRef = ref(storage, storagePath);
    const snapshot = await uploadBytes(storageRef, file, {
      contentType: file.type,
      customMetadata: {
        circleId: safeCircleId,
        uploadedAt: new Date().toISOString(),
      },
    });

    // 5. Retrieve permanent download URL
    const downloadUrl = await getDownloadURL(snapshot.ref);

    return {
      downloadUrl,
      storagePath,
      sizeBytes: file.size,
    };
  },
};
