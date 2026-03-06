import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { requestNotificationPermission } from '../services/notificationService';

/**
 * Hook to handle notification permissions and tap responses
 */
export function useNotifications() {
  const router = useRouter();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    // Request permission on mount
    requestNotificationPermission();

    // Handle notification tap — navigate to receipt detail
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const receiptId = response.notification.request.content.data?.receiptId;
        if (receiptId) {
          router.push(`/receipt/${receiptId}`);
        }
      });

    return () => {
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);
}
