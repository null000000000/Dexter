/**
 * Date utilities for Operation Dexter
 * 16 Weeks = 112 Days
 * Day 1 = Start Date
 * Day 112 = Start Date + 111 days
 */

export function parseYMD(dateStr: string): { year: number; month: number; day: number } {
  const parts = dateStr.split('-').map(Number);
  return { year: parts[0], month: parts[1], day: parts[2] };
}

export function addDays(dateStr: string, days: number): string {
  const { year, month, day } = parseYMD(dateStr);
  const d = new Date(Date.UTC(year, month - 1, day + days));
  return d.toISOString().split('T')[0];
}

export function diffDays(dateA: string, dateB: string): number {
  const a = parseYMD(dateA);
  const b = parseYMD(dateB);
  const utcA = Date.UTC(a.year, a.month - 1, a.day);
  const utcB = Date.UTC(b.year, b.month - 1, b.day);
  return Math.floor((utcA - utcB) / (24 * 60 * 60 * 1000));
}

export function getEndExecutionDate(startDateStr: string): string {
  return addDays(startDateStr, 111); // exactly 112 days total: Day 1 + 111 = Day 112
}

export function formatFriendlyDate(dateStr: string): string {
  const { year, month, day } = parseYMD(dateStr);
  const d = new Date(Date.UTC(year, month - 1, day));
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC'
  });
}

export function getWeekdayName(dateStr: string): 'Saturday' | 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' {
  const { year, month, day } = parseYMD(dateStr);
  const d = new Date(Date.UTC(year, month - 1, day));
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;
  return dayNames[d.getUTCDay()] as any;
}
