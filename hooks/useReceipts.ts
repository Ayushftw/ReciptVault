import { useEffect, useState, useCallback } from 'react';
import { subscribeToReceipts } from '../services/receiptsService';
import { useAppStore } from '../store/useAppStore';

/**
 * Hook that subscribes to real-time receipt updates from Firestore
 */
export function useReceipts() {
  const { currentUser, setReceipts } = useAppStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!currentUser?.uid) return;

    const unsubscribe = subscribeToReceipts(
      currentUser.uid,
      (receipts) => {
        setReceipts(receipts);
        setRefreshing(false);
      },
      (error) => {
        console.error('Receipts subscription error:', error);
        setRefreshing(false);
      }
    );

    return unsubscribe;
  }, [currentUser?.uid]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // The onSnapshot listener will automatically fire with fresh data
    // Set a timeout to stop refreshing if Firestore doesn't respond
    setTimeout(() => setRefreshing(false), 5000);
  }, []);

  return { refreshing, onRefresh };
}
