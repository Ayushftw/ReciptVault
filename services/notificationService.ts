import * as Notifications from 'expo-notifications';
import { subDays } from 'date-fns';
import { Receipt } from '../types';

// Configure how notifications are handled when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Request notification permissions
 */
export async function requestNotificationPermission(): Promise<boolean> {
  try {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();

    if (existingStatus === 'granted') return true;

    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Notification permission error:', error);
    return false;
  }
}

/**
 * Schedule warranty expiry notifications for a receipt
 * Returns notification IDs for 30-day and 7-day warnings
 */
export async function scheduleWarrantyNotifications(
  receipt: Receipt
): Promise<{ id30Days?: string; id7Days?: string }> {
  if (!receipt.hasWarranty || !receipt.warrantyExpiryDate) {
    return {};
  }

  const expiryDate = new Date(receipt.warrantyExpiryDate);
  const now = new Date();
  const results: { id30Days?: string; id7Days?: string } = {};

  try {
    // Schedule 30-day warning
    const thirtyDayWarning = subDays(expiryDate, 30);
    if (thirtyDayWarning > now) {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: '⚠️ Warranty Expiring Soon',
          body: `${receipt.productName} warranty expires in 30 days. Get any issues fixed now!`,
          data: { receiptId: receipt.id },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: thirtyDayWarning,
        },
      });
      results.id30Days = id;
    }

    // Schedule 7-day warning
    const sevenDayWarning = subDays(expiryDate, 7);
    if (sevenDayWarning > now) {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: '🚨 Warranty Expires in 7 Days!',
          body: `${receipt.productName} warranty expires soon. Last chance to make a claim!`,
          data: { receiptId: receipt.id },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: sevenDayWarning,
        },
      });
      results.id7Days = id;
    }
  } catch (error) {
    console.error('Schedule notification error:', error);
  }

  return results;
}

/**
 * Cancel warranty notifications when a receipt is deleted
 */
export async function cancelWarrantyNotifications(
  notificationIds: string[]
): Promise<void> {
  try {
    for (const id of notificationIds) {
      if (id) {
        await Notifications.cancelScheduledNotificationAsync(id);
      }
    }
  } catch (error) {
    console.error('Cancel notification error:', error);
  }
}
