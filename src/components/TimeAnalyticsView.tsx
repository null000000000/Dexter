import React, { useState, useMemo } from 'react';
import { useDexter } from '../context/DexterContext';
import { TimeSession } from '../types/dexter';
import {
  formatDurationHMS,
  formatFriendlyDuration,
  formatHoursDecimal,
  formatLocalTime,
  splitSessionByLocalCalendarDays,
  getLocalDateString
} from '../utils/timeUtils';
import {
  Clock,
  Calendar,
  Layers,
  Target,
  BarChart3,
  TrendingUp,
  Download,
  Filter,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileText,
  CalendarRange
} from 'lucide-react';

export const TimeAnalyticsView: React.FC = () => {
  const {
    timeSessions,
    activeTimer,
    activeTimerElapsedSeconds,
    tasks,
    extraTasks,
    currentDate,
    startDate,
    endDate,
    addManualTimeEntry,
    updateTimeSession,
    deleteTimeSession
  } = useDexter();

  // Filter state
  const [dateRangeFilter, setDateRangeFilter] = useState<'day' | 'week' | 'month' | 'all' | 'custom'>('week');
  const [customStartDate, setCustomStartDate] = useState<string>(currentDate);
  const [customEndDate, setCustomEndDate] = useState<string>(currentDate);
  const [kpiFilter, setKpiFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all'); // all | timer | manual
  const [reportTab, setReportTab] = useState<'overview' | 'daily' | 'weekly' | 'monthly'>('overview');

  // Manual Entry Form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [manualTitle, setManualTitle] = useState('');
  const [manualDate, setManualDate] = useState(currentDate);
  const [manualMinutes, setManualMinutes] = useState(60);
  const [manualKpi, setManualKpi] = useState<string>('cpts');
  const [manualNotes, setManualNotes] = useState('');

  // Edit session state
  const [editingSession, setEditingSession] = useState<TimeSession | null>(null);
  const [editMinutes, setEditMinutes] = useState(0);
  const [editReason, setEditReason] = useState('');
  const [editNotes, setEditNotes] = useState('');

  // Compute Active Segments using Midnight Split Accounting
  // Split sessions crossing midnight across local calendar days
  const allSplitSegments = useMemo(() => {
    return timeSessions.flatMap((s) => splitSessionByLocalCalendarDays(s));
  }, [timeSessions]);

  // Date Boundaries Calculation
  const dateBounds = useMemo(() => {
    const today = new Date(currentDate);

    if (dateRangeFilter === 'day') {
      return { start: currentDate, end: currentDate };
    }

    if (dateRangeFilter === 'week') {
      // Current week (last 7 days up to selected date)
      const startD = new Date(today);
      startD.setDate(startD.getDate() - 6);
      return {
        start: getLocalDateString(startD),
        end: currentDate
      };
    }

    if (dateRangeFilter === 'month') {
      // Last 30 days
      const startD = new Date(today);
      startD.setDate(startD.getDate() - 29);
      return {
        start: getLocalDateString(startD),
        end: currentDate
      };
    }

    if (dateRangeFilter === 'custom') {
      return {
        start: customStartDate,
        end: customEndDate
      };
    }

    // All (16-week period)
    return {
      start: startDate || '2026-09-01',
      end: endDate || '2027-02-01'
    };
  }, [dateRangeFilter, currentDate, customStartDate, customEndDate, startDate, endDate]);

  // Filtered Sessions & Segments
  const filteredSegments = useMemo(() => {
    return allSplitSegments.filter((seg) => {
      // Date filter
      if (seg.date < dateBounds.start || seg.date > dateBounds.end) return false;

      // KPI filter
      if (kpiFilter !== 'all') {
        if (!seg.kpiId || seg.kpiId !== kpiFilter) return false;
      }

      // Source filter
      if (sourceFilter !== 'all' && seg.source !== sourceFilter) return false;

      return true;
    });
  }, [allSplitSegments, dateBounds, kpiFilter, sourceFilter]);

  // KPI Breakdown Aggregation
  const kpiBreakdown = useMemo(() => {
    const map: { [kpi: string]: { totalSeconds: number; sessionCount: number } } = {};
    for (const seg of filteredSegments) {
      const k = seg.kpiId || 'unassigned';
      if (!map[k]) map[k] = { totalSeconds: 0, sessionCount: 0 };
      map[k].totalSeconds += seg.activeSeconds;
      map[k].sessionCount += 1;
    }
    return Object.entries(map).sort((a, b) => b[1].totalSeconds - a[1].totalSeconds);
  }, [filteredSegments]);

  // Daily Trend Breakdown
  const dailyBreakdown = useMemo(() => {
    const map: { [date: string]: number } = {};
    for (const seg of filteredSegments) {
      map[seg.date] = (map[seg.date] || 0) + seg.activeSeconds;
    }
    return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0]));
  }, [filteredSegments]);

  // Summary Metrics
  const totalTrackedSeconds = filteredSegments.reduce((sum, s) => sum + s.activeSeconds, 0);
  const totalSessionsCount = filteredSegments.length;
  const averageSessionSeconds = totalSessionsCount > 0 ? Math.round(totalTrackedSeconds / totalSessionsCount) : 0;
  const timerTrackedSeconds = filteredSegments
    .filter((s) => s.source === 'timer')
    .reduce((sum, s) => sum + s.activeSeconds, 0);
  const manualTrackedSeconds = filteredSegments
    .filter((s) => s.source === 'manual')
    .reduce((sum, s) => sum + s.activeSeconds, 0);

  // Planned vs Actual Comparison for Tasks in this Range
  const plannedVsActualTasks = useMemo(() => {
    const taskMap = new Map<string, { plannedHours: number; trackedSeconds: number; title: string; kpiId: string }>();

    for (const t of tasks) {
      if (t.date >= dateBounds.start && t.date <= dateBounds.end && t.durationHours > 0) {
        taskMap.set(t.id, {
          plannedHours: t.durationHours,
          trackedSeconds: 0,
          title: t.title,
          kpiId: t.kpiId
        });
      }
    }

    for (const seg of filteredSegments) {
      if (seg.taskId && taskMap.has(seg.taskId)) {
        const item = taskMap.get(seg.taskId)!;
        item.trackedSeconds += seg.activeSeconds;
      }
    }

    return Array.from(taskMap.values())
      .filter((item) => item.trackedSeconds > 0)
      .map((item) => {
        const plannedSec = item.plannedHours * 3600;
        const varianceSec = item.trackedSeconds - plannedSec;
        const variancePct = Math.round((varianceSec / plannedSec) * 100);
        return {
          ...item,
          plannedSeconds: plannedSec,
          varianceSec,
          variancePct
        };
      })
      .sort((a, b) => b.trackedSeconds - a.trackedSeconds);
  }, [tasks, dateBounds, filteredSegments]);

  // CSV Export Generation
  const handleExportCSV = () => {
    const headers = [
      'Session ID',
      'Date',
      'Task Title',
      'KPI Track',
      'Source',
      'Duration (Seconds)',
      'Duration (Hours)',
      'Start Time (UTC)',
      'End Time (UTC)',
      'Was Edited',
      'Edit Reason',
      'Notes'
    ];

    const rows = filteredSegments.map((seg) => [
      `"${seg.sessionId}"`,
      `"${seg.date}"`,
      `"${seg.taskTitle.replace(/"/g, '""')}"`,
      `"${seg.kpiId || 'General'}"`,
      `"${seg.source}"`,
      seg.activeSeconds,
      (seg.activeSeconds / 3600).toFixed(2),
      `"${seg.session.startTime || ''}"`,
      `"${seg.session.endTime || ''}"`,
      seg.session.wasManuallyEdited ? 'Yes' : 'No',
      `"${(seg.session.editReason || '').replace(/"/g, '""')}"`,
      `"${(seg.session.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `dexter-time-analytics-${dateBounds.start}-to-${dateBounds.end}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreateManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle.trim() || manualMinutes <= 0) return;

    await addManualTimeEntry({
      taskId: null,
      taskTitle: manualTitle.trim(),
      taskDate: manualDate,
      durationMinutes: manualMinutes,
      kpiId: manualKpi,
      notes: manualNotes.trim()
    });

    setManualTitle('');
    setManualMinutes(60);
    setManualNotes('');
    setShowAddModal(false);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSession || editMinutes <= 0) return;

    await updateTimeSession(editingSession.id, {
      totalElapsedSeconds: Math.round(editMinutes * 60),
      editReason: editReason || 'Manual adjustment',
      notes: editNotes
    });

    setEditingSession(null);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Filters Toolbar */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest font-semibold">
              <Clock className="h-4 w-4" />
              <span>CLOCKIFY-INSPIRED TIME ENGINE</span>
              <span className="text-neutral-600">·</span>
              <span className="text-neutral-400">OPERATION DEXTER</span>
            </div>
            <h1 className="mt-1 text-2xl font-bold text-neutral-100 tracking-tight">
              Time Tracking & Analytics Dashboard
            </h1>
            <p className="mt-0.5 text-xs text-neutral-400">
              Precise, timestamp-backed focus accounting for cybersecurity, projects, and the 16-week execution plan.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 px-3 py-1.5 text-xs font-mono text-neutral-200 transition"
            >
              <Plus className="h-3.5 w-3.5 text-cyan-400" />
              <span>Add Manual Entry</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3.5 py-1.5 text-xs font-bold text-neutral-950 font-mono transition shadow-sm"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono pt-1">
          {/* Preset Range Tabs */}
          <div className="flex items-center gap-1 rounded-lg border border-neutral-800 bg-neutral-950 p-1">
            {(['day', 'week', 'month', 'all', 'custom'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setDateRangeFilter(r)}
                className={`px-3 py-1 rounded-md transition uppercase text-[11px] ${
                  dateRangeFilter === r
                    ? 'bg-neutral-800 text-cyan-400 font-bold'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {r === 'day' ? 'Day' : r === 'week' ? 'Week (7d)' : r === 'month' ? 'Month (30d)' : r === 'all' ? '16 Weeks' : 'Custom'}
              </button>
            ))}
          </div>

          {/* Custom Date Pickers */}
          {dateRangeFilter === 'custom' && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="rounded border border-neutral-800 bg-neutral-950 px-2 py-1 text-xs text-neutral-200 focus:outline-none"
              />
              <span className="text-neutral-600">→</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="rounded border border-neutral-800 bg-neutral-950 px-2 py-1 text-xs text-neutral-200 focus:outline-none"
              />
            </div>
          )}

          {/* Secondary Filters */}
          <div className="flex items-center gap-2">
            <select
              value={kpiFilter}
              onChange={(e) => setKpiFilter(e.target.value)}
              className="rounded-lg border border-neutral-800 bg-neutral-950 px-2.5 py-1.5 text-neutral-300 focus:outline-none text-xs"
            >
              <option value="all">All Tracks & KPIs</option>
              <option value="cpts">CPTS (Anchor)</option>
              <option value="projects">Projects</option>
              <option value="ctfs">CTFs</option>
              <option value="vulnex">VULNEX (Deep Work)</option>
              <option value="gpa">University GPA</option>
              <option value="cs50">CS50x</option>
              <option value="cjca">CJCA</option>
              <option value="aws">AWS Foundation</option>
              <option value="mckinsey">McKinsey Forward</option>
            </select>

            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="rounded-lg border border-neutral-800 bg-neutral-950 px-2.5 py-1.5 text-neutral-300 focus:outline-none text-xs"
            >
              <option value="all">All Sources</option>
              <option value="timer">Timer Recorded</option>
              <option value="manual">Manual Entry</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. Top Summary Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Time */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 font-mono">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Total Tracked Focus</span>
            <Clock className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-neutral-100 tabular-nums">
            {formatFriendlyDuration(totalTrackedSeconds)}
          </div>
          <div className="mt-1 text-[11px] text-neutral-500">
            {formatHoursDecimal(totalTrackedSeconds)} total recorded time
          </div>
        </div>

        {/* Total Sessions */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 font-mono">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Focus Sessions</span>
            <Layers className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-cyan-400 tabular-nums">
            {totalSessionsCount}
          </div>
          <div className="mt-1 text-[11px] text-neutral-500">
            Avg: {formatFriendlyDuration(averageSessionSeconds)} per session
          </div>
        </div>

        {/* Timer vs Manual */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 font-mono">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Timer vs Manual</span>
            <BarChart3 className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="mt-2 text-lg font-bold text-neutral-200">
            {formatFriendlyDuration(timerTrackedSeconds)} <span className="text-xs text-neutral-500">/ {formatFriendlyDuration(manualTrackedSeconds)}</span>
          </div>
          <div className="mt-1 text-[11px] text-neutral-500">
            {totalTrackedSeconds > 0 ? `${Math.round((timerTrackedSeconds / totalTrackedSeconds) * 100)}% timer recorded` : '0%'}
          </div>
        </div>

        {/* Top Activity Track */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 font-mono">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Primary Focus Anchor</span>
            <Target className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 text-lg font-bold text-emerald-400 uppercase truncate">
            {kpiBreakdown.length > 0 ? kpiBreakdown[0][0] : 'None'}
          </div>
          <div className="mt-1 text-[11px] text-neutral-500">
            {kpiBreakdown.length > 0 ? formatFriendlyDuration(kpiBreakdown[0][1].totalSeconds) : 'No time recorded'}
          </div>
        </div>
      </div>

      {/* 3. Sub-Navigation Tabs: Overview / Daily / Weekly / Monthly Reports */}
      <div className="border-b border-neutral-800">
        <div className="flex items-center gap-1 font-mono text-xs">
          {[
            { id: 'overview', label: 'Analytics Overview' },
            { id: 'daily', label: 'Daily Report' },
            { id: 'weekly', label: 'Weekly Report' },
            { id: 'monthly', label: 'Monthly Report' }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setReportTab(t.id as any)}
              className={`px-4 py-2 border-b-2 font-medium transition ${
                reportTab === t.id
                  ? 'border-emerald-500 text-emerald-400 font-bold'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Tab Content */}
      {reportTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Time by KPI Breakdown */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-4">
            <h2 className="text-sm font-bold text-neutral-100 font-mono flex items-center justify-between">
              <span>Time by KPI & Track</span>
              <span className="text-xs text-neutral-500 font-normal">Active Focus Hours</span>
            </h2>

            {kpiBreakdown.length === 0 ? (
              <div className="text-center py-8 text-neutral-500 font-mono text-xs">
                No time entries logged in selected period.
              </div>
            ) : (
              <div className="space-y-3 font-mono text-xs">
                {kpiBreakdown.map(([kpiName, data]) => {
                  const percent = totalTrackedSeconds > 0 ? Math.round((data.totalSeconds / totalTrackedSeconds) * 100) : 0;
                  return (
                    <div key={kpiName} className="space-y-1">
                      <div className="flex items-center justify-between text-neutral-300">
                        <span className="uppercase font-semibold text-emerald-400">{kpiName}</span>
                        <span>
                          <strong>{formatFriendlyDuration(data.totalSeconds)}</strong> ({percent}%) · {data.sessionCount} sessions
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-neutral-950 overflow-hidden border border-neutral-800">
                        <div
                          className="h-full bg-emerald-500 transition-all duration-300"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Daily Trend Overview */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-4">
            <h2 className="text-sm font-bold text-neutral-100 font-mono flex items-center justify-between">
              <span>Execution Trend</span>
              <span className="text-xs text-neutral-500 font-normal">Tracked Focus by Date</span>
            </h2>

            {dailyBreakdown.length === 0 ? (
              <div className="text-center py-8 text-neutral-500 font-mono text-xs">
                No daily sessions recorded in range.
              </div>
            ) : (
              <div className="space-y-2 font-mono text-xs max-h-[340px] overflow-y-auto pr-1">
                {dailyBreakdown.map(([dayDate, seconds]) => {
                  const hoursDec = (seconds / 3600).toFixed(1);
                  return (
                    <div
                      key={dayDate}
                      className="p-2.5 rounded-lg border border-neutral-800 bg-neutral-950 flex items-center justify-between"
                    >
                      <span className="text-neutral-300">{dayDate}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-emerald-400 font-bold tabular-nums">
                          {formatFriendlyDuration(seconds)}
                        </span>
                        <span className="text-neutral-500 text-[11px]">({hoursDec}h)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Planned vs Actual Comparison */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-4 lg:col-span-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-neutral-800">
              <div>
                <h2 className="text-sm font-bold text-neutral-100 font-mono">
                  Planned vs Actual Time Comparison
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Comparison between estimated schedule target and real recorded execution time. Does not automatically alter the 16-week master schedule.
                </p>
              </div>
              <span className="text-xs font-mono text-neutral-500">
                {plannedVsActualTasks.length} tasks evaluated
              </span>
            </div>

            {plannedVsActualTasks.length === 0 ? (
              <div className="text-center py-6 text-neutral-500 font-mono text-xs">
                No tasks with duration estimates tracked yet in this period.
              </div>
            ) : (
              <div className="overflow-x-auto font-mono text-xs">
                <table className="w-full text-left">
                  <thead className="border-b border-neutral-800 text-[11px] uppercase text-neutral-500">
                    <tr>
                      <th className="py-2 pr-3">Task Name</th>
                      <th className="py-2 px-3">Track</th>
                      <th className="py-2 px-3 text-right">Planned Target</th>
                      <th className="py-2 px-3 text-right">Actual Tracked</th>
                      <th className="py-2 pl-3 text-right">Variance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60">
                    {plannedVsActualTasks.slice(0, 10).map((item, idx) => (
                      <tr key={idx} className="hover:bg-neutral-950/40">
                        <td className="py-2 pr-3 text-neutral-200 font-medium truncate max-w-xs">
                          {item.title}
                        </td>
                        <td className="py-2 px-3 uppercase text-emerald-400">
                          {item.kpiId}
                        </td>
                        <td className="py-2 px-3 text-right text-neutral-400">
                          {item.plannedHours}h
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-neutral-100">
                          {formatFriendlyDuration(item.trackedSeconds)}
                        </td>
                        <td className="py-2 pl-3 text-right">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                              item.variancePct > 15
                                ? 'bg-amber-950/60 text-amber-300 border border-amber-800/80'
                                : item.variancePct < -15
                                ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-800/80'
                                : 'bg-neutral-900 text-neutral-400'
                            }`}
                          >
                            {item.variancePct > 0 ? `+${item.variancePct}%` : `${item.variancePct}%`}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. Daily Report Tab */}
      {reportTab === 'daily' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div>
                <h2 className="text-base font-bold text-neutral-100 font-mono">
                  Daily Execution Audit Log ({currentDate})
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Detailed timeline of focus intervals and sessions recorded for this calendar date.
                </p>
              </div>
              <div className="text-right font-mono text-xs">
                <span className="text-neutral-500 block">Day Total</span>
                <span className="text-base font-bold text-emerald-400">
                  {formatFriendlyDuration(filteredSegments.filter((s) => s.date === currentDate).reduce((a, b) => a + b.activeSeconds, 0))}
                </span>
              </div>
            </div>

            {/* List of sessions on current date */}
            <div className="space-y-2 font-mono text-xs">
              {filteredSegments.filter((s) => s.date === currentDate).length === 0 ? (
                <div className="text-center py-8 text-neutral-500">
                  No time recorded yet for {currentDate}. Start the timer or log manual work above.
                </div>
              ) : (
                filteredSegments
                  .filter((s) => s.date === currentDate)
                  .map((seg, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-lg border border-neutral-800 bg-neutral-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-emerald-400">
                            {formatFriendlyDuration(seg.activeSeconds)}
                          </span>
                          <span className="text-neutral-600">·</span>
                          <span className="text-neutral-200 font-semibold">{seg.taskTitle}</span>
                          {seg.kpiId && (
                            <span className="text-[10px] uppercase text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-1.5 py-0.2 rounded">
                              {seg.kpiId}
                            </span>
                          )}
                          <span className="text-[10px] text-neutral-500 uppercase">
                            ({seg.source})
                          </span>
                        </div>
                        <div className="text-[11px] text-neutral-500 mt-1">
                          {seg.session.startTime && (
                            <span>
                              {formatLocalTime(seg.session.startTime)}
                              {seg.session.endTime ? ` → ${formatLocalTime(seg.session.endTime)}` : ''}
                            </span>
                          )}
                          {seg.session.notes && (
                            <span className="text-neutral-300 ml-2 italic">"{seg.session.notes}"</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => {
                            setEditingSession(seg.session);
                            setEditMinutes(Math.round(seg.activeSeconds / 60));
                            setEditNotes(seg.session.notes || '');
                            setEditReason(seg.session.editReason || '');
                          }}
                          className="p-1 text-neutral-400 hover:text-neutral-200 rounded hover:bg-neutral-800"
                          title="Correct Duration"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Delete this recorded time session?')) {
                              deleteTimeSession(seg.sessionId);
                            }
                          }}
                          className="p-1 text-neutral-500 hover:text-rose-400 rounded hover:bg-rose-950/30"
                          title="Delete Session"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 6. Weekly Report Tab */}
      {reportTab === 'weekly' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-4">
            <h2 className="text-base font-bold text-neutral-100">
              Weekly Allocation Summary ({dateBounds.start} → {dateBounds.end})
            </h2>
            <p className="text-xs text-neutral-400 font-sans">
              Daily distribution and track proportion. Tracked time reflects recorded engagement, distinct from completed deliverables.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-lg border border-neutral-800 bg-neutral-950 space-y-2">
                <span className="text-neutral-500 uppercase text-[10px] block">Weekly Volume</span>
                <div className="text-xl font-bold text-emerald-400">
                  {formatFriendlyDuration(totalTrackedSeconds)}
                </div>
                <div className="text-neutral-400">
                  Daily Average: {formatFriendlyDuration(Math.round(totalTrackedSeconds / 7))} / day
                </div>
              </div>

              <div className="p-4 rounded-lg border border-neutral-800 bg-neutral-950 space-y-2">
                <span className="text-neutral-500 uppercase text-[10px] block">Anchor Adherence</span>
                <div className="text-xl font-bold text-cyan-400">
                  {kpiBreakdown.find(([k]) => k === 'cpts')
                    ? formatFriendlyDuration(kpiBreakdown.find(([k]) => k === 'cpts')![1].totalSeconds)
                    : '0h'}{' '}
                  <span className="text-xs text-neutral-500">CPTS Anchor</span>
                </div>
                <div className="text-neutral-400">
                  Target: 24h/week (6 days × 4h)
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. Monthly Report Tab */}
      {reportTab === 'monthly' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-4">
            <h2 className="text-base font-bold text-neutral-100">
              Monthly Macro Time Allocation Audit
            </h2>
            <p className="text-xs text-neutral-400 font-sans">
              Long-term focus consistency over the 4-week operating cycle.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 rounded-lg border border-neutral-800 bg-neutral-950">
                <span className="text-[10px] text-neutral-500 block uppercase">Total Tracked</span>
                <div className="text-lg font-bold text-emerald-400 mt-1">
                  {formatHoursDecimal(totalTrackedSeconds)}
                </div>
              </div>

              <div className="p-3.5 rounded-lg border border-neutral-800 bg-neutral-950">
                <span className="text-[10px] text-neutral-500 block uppercase">Recorded Sessions</span>
                <div className="text-lg font-bold text-cyan-400 mt-1">
                  {totalSessionsCount}
                </div>
              </div>

              <div className="p-3.5 rounded-lg border border-neutral-800 bg-neutral-950">
                <span className="text-[10px] text-neutral-500 block uppercase">Timer Compliance</span>
                <div className="text-lg font-bold text-indigo-400 mt-1">
                  {totalTrackedSeconds > 0 ? `${Math.round((timerTrackedSeconds / totalTrackedSeconds) * 100)}%` : '0%'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Manual Time Entry */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-neutral-800 bg-neutral-900 p-5 shadow-2xl space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
              <span className="text-cyan-400 font-bold uppercase">Log Manual Focus Time</span>
              <button onClick={() => setShowAddModal(false)} className="text-neutral-500 hover:text-neutral-300">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateManual} className="space-y-3">
              <div>
                <label className="block text-neutral-400 mb-1">Task / Activity Title:</label>
                <input
                  type="text"
                  placeholder="e.g., CPTS Network Enumeration or CTF Writeup..."
                  value={manualTitle}
                  onChange={(e) => setManualTitle(e.target.value)}
                  className="w-full rounded border border-neutral-800 bg-neutral-950 px-3 py-1.5 text-neutral-100 focus:border-cyan-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-neutral-400 mb-1">Calendar Date:</label>
                  <input
                    type="date"
                    value={manualDate}
                    onChange={(e) => setManualDate(e.target.value)}
                    className="w-full rounded border border-neutral-800 bg-neutral-950 px-2 py-1.5 text-neutral-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">Duration (Minutes):</label>
                  <input
                    type="number"
                    min="1"
                    max="1440"
                    value={manualMinutes}
                    onChange={(e) => setManualMinutes(parseInt(e.target.value, 10) || 0)}
                    className="w-full rounded border border-neutral-800 bg-neutral-950 px-2 py-1.5 text-neutral-200"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">KPI Track:</label>
                <select
                  value={manualKpi}
                  onChange={(e) => setManualKpi(e.target.value)}
                  className="w-full rounded border border-neutral-800 bg-neutral-950 px-2 py-1.5 text-neutral-200"
                >
                  <option value="cpts">CPTS (Anchor)</option>
                  <option value="projects">Projects</option>
                  <option value="ctfs">CTFs</option>
                  <option value="vulnex">VULNEX (Deep Work)</option>
                  <option value="gpa">University GPA</option>
                  <option value="cs50">CS50x</option>
                  <option value="cjca">CJCA</option>
                  <option value="aws">AWS Foundation</option>
                  <option value="mckinsey">McKinsey Forward</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Notes / Description:</label>
                <textarea
                  rows={2}
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  placeholder="Summary of outputs produced..."
                  className="w-full rounded border border-neutral-800 bg-neutral-950 p-2 text-neutral-200 placeholder:text-neutral-600 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded border border-neutral-800 text-neutral-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 font-bold text-neutral-950"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Existing Session Duration & Audit Trail */}
      {editingSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-neutral-800 bg-neutral-900 p-5 shadow-2xl space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
              <span className="text-cyan-400 font-bold uppercase">Edit Recorded Session</span>
              <button onClick={() => setEditingSession(null)} className="text-neutral-500 hover:text-neutral-300">
                ✕
              </button>
            </div>

            <div>
              <span className="text-[10px] text-neutral-500 uppercase block">Session:</span>
              <p className="text-neutral-200 font-bold truncate mt-0.5">{editingSession.taskTitle}</p>
              <p className="text-neutral-500 text-[11px] mt-0.5">Recorded date: {editingSession.taskDate}</p>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <label className="block text-neutral-400 mb-1">Adjusted Duration (Minutes):</label>
                <input
                  type="number"
                  min="1"
                  max="1440"
                  value={editMinutes}
                  onChange={(e) => setEditMinutes(parseInt(e.target.value, 10) || 0)}
                  className="w-full rounded border border-neutral-800 bg-neutral-950 px-3 py-1.5 text-neutral-100 focus:border-cyan-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Audit Reason for Manual Correction:</label>
                <input
                  type="text"
                  placeholder="e.g., stepped away from computer without pausing..."
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  className="w-full rounded border border-neutral-800 bg-neutral-950 px-3 py-1.5 text-neutral-100 placeholder:text-neutral-600 focus:border-cyan-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Session Notes:</label>
                <textarea
                  rows={2}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full rounded border border-neutral-800 bg-neutral-950 p-2 text-neutral-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setEditingSession(null)}
                  className="px-3 py-1.5 rounded border border-neutral-800 text-neutral-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 font-bold text-neutral-950"
                >
                  Update & Audit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
