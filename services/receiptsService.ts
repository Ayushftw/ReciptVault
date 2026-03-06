import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  getDoc,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import { Receipt } from '../types';

/**
 * Get the receipts collection reference for a user
 */
function receiptsCol(userId: string) {
  return collection(db, 'users', userId, 'receipts');
}

/**
 * Add a new receipt
 */
export async function addReceipt(
  userId: string,
  receipt: Receipt
): Promise<void> {
  try {
    const docRef = doc(receiptsCol(userId), receipt.id);
    await setDoc(docRef, receipt);
  } catch (error) {
    console.error('Error adding receipt:', error);
    throw error;
  }
}

/**
 * Update an existing receipt
 */
export async function updateReceipt(
  userId: string,
  receiptId: string,
  data: Partial<Receipt>
): Promise<void> {
  try {
    const docRef = doc(receiptsCol(userId), receiptId);
    await updateDoc(docRef, { ...data, updatedAt: new Date().toISOString() });
  } catch (error) {
    console.error('Error updating receipt:', error);
    throw error;
  }
}

/**
 * Delete a receipt
 */
export async function deleteReceipt(
  userId: string,
  receiptId: string
): Promise<void> {
  try {
    const docRef = doc(receiptsCol(userId), receiptId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting receipt:', error);
    throw error;
  }
}

/**
 * Get a single receipt
 */
export async function getReceipt(
  userId: string,
  receiptId: string
): Promise<Receipt | null> {
  try {
    const docRef = doc(receiptsCol(userId), receiptId);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return snapshot.data() as Receipt;
    }
    return null;
  } catch (error) {
    console.error('Error getting receipt:', error);
    throw error;
  }
}

/**
 * Subscribe to real-time receipt updates for a user
 * Returns unsubscribe function
 */
export function subscribeToReceipts(
  userId: string,
  onData: (receipts: Receipt[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const q = query(receiptsCol(userId), orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const receipts: Receipt[] = [];
      snapshot.forEach((doc) => {
        receipts.push(doc.data() as Receipt);
      });
      onData(receipts);
    },
    (error) => {
      console.error('Receipts subscription error:', error);
      onError?.(error as Error);
    }
  );
}

/**
 * Generate a unique receipt ID
 */
export function generateReceiptId(): string {
  return doc(collection(db, '_')).id;
}
