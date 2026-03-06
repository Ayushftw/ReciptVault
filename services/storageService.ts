import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';

/**
 * Upload a receipt image to Firebase Storage
 * Returns the download URL
 */
export async function uploadReceiptImage(
  userId: string,
  receiptId: string,
  imageUri: string
): Promise<string> {
  try {
    // Convert URI to blob
    const response = await fetch(imageUri);
    const blob = await response.blob();

    // Create storage reference
    const storageRef = ref(storage, `receipts/${userId}/${receiptId}.jpg`);

    // Upload
    const uploadTask = uploadBytesResumable(storageRef, blob);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Progress tracking could be added here
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload: ${progress.toFixed(0)}%`);
        },
        (error) => {
          console.error('Upload failed:', error);
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          } catch (err) {
            reject(err);
          }
        }
      );
    });
  } catch (error) {
    console.error('Image upload error:', error);
    throw error;
  }
}

/**
 * Delete a receipt image from Firebase Storage
 */
export async function deleteReceiptImage(
  userId: string,
  receiptId: string
): Promise<void> {
  try {
    const storageRef = ref(storage, `receipts/${userId}/${receiptId}.jpg`);
    await deleteObject(storageRef);
  } catch (error: any) {
    // Ignore "object not found" errors
    if (error.code !== 'storage/object-not-found') {
      console.error('Delete image error:', error);
      throw error;
    }
  }
}
