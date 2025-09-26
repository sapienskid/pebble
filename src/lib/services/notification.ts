import { remindersStore, type Reminder } from '../stores/reminders';
import { settingsStore } from '../stores/settings';
import { addDays, addWeeks, addMonths } from 'date-fns';
import { get } from 'svelte/store';

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

export function showReminderNotification(reminder: Reminder) {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  try {
    const notification = new Notification(reminder.title, {
      body: reminder.description || 'Reminder',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: `reminder-${reminder.id}`, // Prevents duplicate notifications
      requireInteraction: true, // Keep notification visible until interacted with
      // Note: actions not supported in all browsers, using click for mark complete
    } as NotificationOptions);

    console.log('Notification created successfully');

    // Handle notification click - mark as complete
    notification.onclick = () => {
      console.log('Notification clicked for reminder:', reminder.id);
      markReminderComplete(reminder.id);
      window.focus();
      // Navigate to reminders tab
      window.location.hash = '#remind';
      notification.close();
    };

    // Auto-close after 10 minutes if not interacted with
    setTimeout(() => {
      console.log('Auto-closing notification for reminder:', reminder.id);
      notification.close();
    }, 10 * 60 * 1000);
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
}

async function sendNtfyNotification(reminder: Reminder) {
  const ntfyServer = import.meta.env.VITE_NTFY_SERVER || 'https://ntfy.sh';
  const ntfyTopic = import.meta.env.VITE_NTFY_TOPIC;
  const ntfyUsername = import.meta.env.VITE_NTFY_USERNAME;
  const ntfyPassword = import.meta.env.VITE_NTFY_PASSWORD;

  if (!ntfyTopic) {
    console.error('Ntfy topic not configured in environment variables');
    return;
  }

  const url = `${ntfyServer}/${ntfyTopic}`;
  const body = reminder.description || 'Reminder';
  const headers: Record<string, string> = {
    'Title': reminder.title,
  };

  if (ntfyUsername && ntfyPassword) {
    const auth = btoa(`${ntfyUsername}:${ntfyPassword}`);
    headers['Authorization'] = `Basic ${auth}`;
  }

  try {
    console.log('Sending ntfy notification for reminder:', reminder.id);
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body,
    });

    if (response.ok) {
      console.log('Ntfy notification sent successfully');
    } else {
      console.error('Failed to send ntfy notification:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('Error sending ntfy notification:', error);
  }
}

function markReminderComplete(reminderId: string) {
  remindersStore.update(reminders => {
    return reminders.map(r => {
      if (r.id === reminderId) {
        return { ...r, completed: true, updatedAt: new Date().toISOString() };
      }
      return r;
    });
  });
}

export function checkDueReminders() {
  const settings = get(settingsStore);
  if (settings.notificationMethod !== 'browser' && settings.notificationMethod !== 'ntfy') {
    return;
  }

  const now = new Date();
  const currentReminders = get(remindersStore);

  currentReminders.forEach(reminder => {
    if (reminder.completed || reminder.notified) {
      return;
    }

    const scheduledTime = new Date(reminder.scheduledFor);
    if (scheduledTime <= now) {
      // Reminder is due
      if (settings.notificationMethod === 'browser') {
        showReminderNotification(reminder);
      } else if (settings.notificationMethod === 'ntfy') {
        sendNtfyNotification(reminder);
      }

      // Mark as notified
      remindersStore.update(reminders => {
        return reminders.map(r => {
          if (r.id === reminder.id) {
            const updated = { ...r, notified: true, updatedAt: new Date().toISOString() };

            // Handle recurring reminders
            if (reminder.reminderType === 'recurring' && reminder.recurring) {
              const nextReminder = createNextRecurringReminder(reminder);
              reminders.push(nextReminder);
            }

            return updated;
          }
          return r;
        });
      });
    }
  });
}

function createNextRecurringReminder(reminder: Reminder): Reminder {
  let nextScheduled: Date;
  const current = new Date(reminder.scheduledFor);

  switch (reminder.recurring) {
    case 'daily':
      nextScheduled = addDays(current, 1);
      break;
    case 'weekly':
      nextScheduled = addWeeks(current, 1);
      break;
    case 'monthly':
      nextScheduled = addMonths(current, 1);
      break;
    default:
      nextScheduled = addDays(current, 1);
  }

  const now = new Date().toISOString();
  return {
    ...reminder,
    id: crypto.randomUUID(), // Generate new ID
    scheduledFor: nextScheduled.toISOString(),
    notified: false,
    completed: false,
    timestamp: now,
    createdAt: now,
    updatedAt: now,
    synced: false
  };
}