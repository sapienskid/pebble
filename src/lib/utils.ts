import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, "child"> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, "children"> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };

export function getTagIcon(tag: string): string {
    switch (tag) {
      case 'queries':
        return 'streamline-freehand:information-desk-question-help';
      case 'thought':
        return 'streamline-freehand:wireless-wifi-signal-pole';
      case 'idea':
        return 'streamline-freehand:creativity-idea-bulb';
      default:
        return 'streamline-freehand:wireless-wifi-signal-pole';
    }
}

export function getTimeSlot(timeString?: string): 'morning' | 'afternoon' | 'evening' {
  if (!timeString) return 'morning';

  let hour24: number;
  let minutes: number;

  if (timeString.includes('AM') || timeString.includes('PM')) {
    // 12-hour format: "9:30 AM"
    const [time, period] = timeString.split(' ');
    [hour24, minutes] = time.split(':').map(Number);
    if (period === 'PM' && hour24 !== 12) hour24 += 12;
    if (period === 'AM' && hour24 === 12) hour24 = 0;
  } else {
    // 24-hour format: "14:30"
    [hour24, minutes] = timeString.split(':').map(Number);
  }

  const totalHours = hour24 + minutes / 60;

  if (totalHours < 12) return 'morning';
  if (totalHours < 18) return 'afternoon';
  return 'evening';
}

export function formatTime12Hour(timeString?: string): string {
  if (!timeString) return '';

  // If already in 12-hour format (contains AM/PM), return as is
  if (timeString.includes('AM') || timeString.includes('PM')) {
    return timeString;
  }

  // Assume 24-hour format "HH:MM"
  const [hours, minutes] = timeString.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
}

export function getRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}
