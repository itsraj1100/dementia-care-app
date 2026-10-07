import { PlanItem } from '../../types.ts';

export interface WebReminderListener {
  (item: PlanItem): void;
}

/**
 * Web-specific Reminder Adapter
 * Isolates foreground polling, demo trigger, and HTML5 Web Notifications
 * without relying on Android-specific exact alarms.
 */
class WebReminderAdapter {
  private intervalId: number | null = null;
  private lastTriggeredMinute: string = '';
  private listeners: Set<WebReminderListener> = new Set();
  private getPlanItems: (() => PlanItem[]) | null = null;

  /**
   * Initializes foreground reminder checking on web
   */
  public start(getPlanItems: () => PlanItem[]) {
    this.getPlanItems = getPlanItems;
    if (typeof window === 'undefined' || this.intervalId !== null) return;

    // Check every 10 seconds for matching time in foreground
    this.intervalId = window.setInterval(() => {
      this.checkForegroundReminders();
    }, 10000);

    // Initial immediate check
    this.checkForegroundReminders();
  }

  public stop() {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  public subscribe(listener: WebReminderListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Checks current clock against active published plan items
   */
  private checkForegroundReminders() {
    if (!this.getPlanItems) return;
    const now = new Date();
    const currentHour = String(now.getHours()).padStart(2, '0');
    const currentMinute = String(now.getMinutes()).padStart(2, '0');
    const currentTimeStr = `${currentHour}:${currentMinute}`;

    if (this.lastTriggeredMinute === currentTimeStr) {
      return; // Already checked and triggered for this clock minute
    }

    const items = this.getPlanItems();
    const matching = items.find(
      (item) => item.active && item.status === 'upcoming' && item.time === currentTimeStr
    );

    if (matching) {
      this.lastTriggeredMinute = currentTimeStr;
      this.notify(matching);
    }
  }

  /**
   * Demo action: Fires the next upcoming reminder immediately
   */
  public fireNextReminder(planItems: PlanItem[]): PlanItem | null {
    const nextItem =
      planItems.find((p) => p.active && p.status === 'upcoming') ||
      planItems.find((p) => p.active) ||
      planItems[0];

    if (nextItem) {
      this.notify(nextItem);
      return nextItem;
    }
    return null;
  }

  /**
   * Dispatches reminder to registered listeners and browser Notification API if permitted
   */
  private notify(item: PlanItem) {
    this.listeners.forEach((listener) => {
      try {
        listener(item);
      } catch {
        // listener safe
      }
    });

    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        try {
          new Notification(item.titleAs || item.titleEn, {
            body: item.instructionAs || item.instructionEn,
            icon: item.photoUrl || undefined,
          });
        } catch {
          // browser notification blocked or muted
        }
      }
    }
  }

  /**
   * Requests browser notification permissions if available
   */
  public async requestNotificationPermission(): Promise<boolean> {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        const result = await Notification.requestPermission();
        return result === 'granted';
      }
      return Notification.permission === 'granted';
    }
    return false;
  }
}

export const webReminderAdapter = new WebReminderAdapter();
