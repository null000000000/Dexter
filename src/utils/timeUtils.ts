/**
 * Time calculation, session duration accounting, midnight split, and formatter utilities
 * Source of truth: UTC timestamps.
 * Display and daily grouping: user's local timezone.
 */

import { PausedInterval, TimeSession } from '../types/dexter';

/**
 * Format total seconds into Clockify-style string (e.g., 01:24:35 or 45:10)
 */
export function formatDurationHMS(totalSeconds: number): string {
  const sec = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(sec / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  const seconds = sec % 60;

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Format total seconds into friendly human duration (e.g., "1h 45m" or "25m")
 */
export function formatFriendlyDuration(totalSeconds: number): string {
  const sec = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(sec / 3600);
  const minutes = Math.floor((sec % 3600) / 60);

  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
  if (minutes > 0) {
    return `${minutes}m`;
  }
  return `${sec}s`;
}

/**
 * Calculate active elapsed seconds for a session or active timer state up to now
 */
export function calculateElapsedSeconds(
  startTimeISO: string,
  endTimeISO: string | null,
  pausedIntervals: PausedInterval[] = [],
  isCurrentlyPaused: boolean = false,
  pausedAtISO?: string | null,
  nowISO: string = new Date().toISOString()
): number {
  const start = new Date(startTimeISO).getTime();
  if (isNaN(start)) return 0;

  const end = endTimeISO ? new Date(endTimeISO).getTime() : new Date(nowISO).getTime();
  const totalGrossMs = Math.max(0, end - start);

  // Sum pause durations in milliseconds
  let totalPauseMs = 0;
  for (const interval of pausedIntervals) {
    if (interval.resumedAt) {
      const pStart = new Date(interval.pausedAt).getTime();
      const pEnd = new Date(interval.resumedAt).getTime();
      if (!isNaN(pStart) && !isNaN(pEnd) && pEnd > pStart) {
        totalPauseMs += pEnd - pStart;
      }
    } else if (interval.pausedAt) {
      // Currently in pause
      const pStart = new Date(interval.pausedAt).getTime();
      const pEnd = endTimeISO ? new Date(endTimeISO).getTime() : new Date(nowISO).getTime();
      if (!isNaN(pStart) && pEnd > pStart) {
        totalPauseMs += pEnd - pStart;
      }
    }
  }

  // If flagged as paused but interval not yet recorded in array
  if (isCurrentlyPaused && pausedAtISO) {
    const pStart = new Date(pausedAtISO).getTime();
    const pEnd = endTimeISO ? new Date(endTimeISO).getTime() : new Date(nowISO).getTime();
    if (!isNaN(pStart) && pEnd > pStart) {
      // Check if already accounted for
      const alreadyInList = pausedIntervals.some(
        (i) => i.pausedAt === pausedAtISO
      );
      if (!alreadyInList) {
        totalPauseMs += pEnd - pStart;
      }
    }
  }

  const netActiveMs = Math.max(0, totalGrossMs - totalPauseMs);
  return Math.floor(netActiveMs / 1000);
}

/**
 * Convert local Date to YYYY-MM-DD in user's local timezone
 */
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Convert ISO UTC string to local time display (e.g., "14:32")
 */
export function formatLocalTime(isoStr: string): string {
  try {
    const d = new Date(isoStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '--:--';
  }
}

/**
 * Midnight Split Accounting:
 * For daily reports, split a multi-day or midnight-spanning session into separate daily segments
 * while preserving the original session ID and total elapsed focus duration.
 */
export interface DailyTimeSegment {
  sessionId: string;
  date: string; // local date YYYY-MM-DD
  activeSeconds: number;
  taskId: string | null;
  taskTitle: string;
  kpiId?: string | null;
  source: 'timer' | 'manual';
  session: TimeSession;
}

export function splitSessionByLocalCalendarDays(session: TimeSession): DailyTimeSegment[] {
  if (session.totalElapsedSeconds <= 0) return [];
  const start = new Date(session.startTime);
  const end = session.endTime ? new Date(session.endTime) : new Date();

  // If start and end are on the same local day or duration is manual
  const startDateStr = getLocalDateString(start);
  const endDateStr = getLocalDateString(end);

  if (startDateStr === endDateStr || session.source === 'manual') {
    return [
      {
        sessionId: session.id,
        date: startDateStr || session.taskDate,
        activeSeconds: session.totalElapsedSeconds,
        taskId: session.taskId,
        taskTitle: session.taskTitle,
        kpiId: session.kpiId,
        source: session.source,
        session
      }
    ];
  }

  // Cross-midnight split:
  // Calculate relative proportion of time on each calendar day
  const segments: DailyTimeSegment[] = [];
  let currentCursor = new Date(start);
  const totalGrossMs = Math.max(1, end.getTime() - start.getTime());

  while (currentCursor < end) {
    const dayStr = getLocalDateString(currentCursor);
    // Find next midnight in local timezone
    const nextMidnight = new Date(
      currentCursor.getFullYear(),
      currentCursor.getMonth(),
      currentCursor.getDate() + 1,
      0, 0, 0, 0
    );

    const segmentEnd = nextMidnight < end ? nextMidnight : end;
    const segmentGrossMs = Math.max(0, segmentEnd.getTime() - currentCursor.getTime());
    const proportion = segmentGrossMs / totalGrossMs;
    const segmentActiveSeconds = Math.round(session.totalElapsedSeconds * proportion);

    if (segmentActiveSeconds > 0) {
      segments.push({
        sessionId: session.id,
        date: dayStr,
        activeSeconds: segmentActiveSeconds,
        taskId: session.taskId,
        taskTitle: session.taskTitle,
        kpiId: session.kpiId,
        source: session.source,
        session
      });
    }

    currentCursor = nextMidnight;
  }

  // Safeguard: if segments is empty for any reason, return standard
  if (segments.length === 0) {
    return [
      {
        sessionId: session.id,
        date: session.taskDate,
        activeSeconds: session.totalElapsedSeconds,
        taskId: session.taskId,
        taskTitle: session.taskTitle,
        kpiId: session.kpiId,
        source: session.source,
        session
      }
    ];
  }

  return segments;
}

/**
 * Format seconds to hours with decimals (e.g., 2.5h)
 */
export function formatHoursDecimal(seconds: number): string {
  const hours = seconds / 3600;
  return `${hours.toFixed(1)}h`;
}
