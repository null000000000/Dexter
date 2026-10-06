import React, { useState } from 'react';
import { useDexter } from '../context/DexterContext';
import { WEEKLY_OBJECTIVES } from '../data/weeklyObjectives';
import { addDays, formatFriendlyDate } from '../utils/dateUtils';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Calendar as CalendarIcon,
  Layers,
  ArrowRight,
  Clock,
  Circle,
  AlertCircle,
  Shield,
  Code2,
  Terminal,
  Cpu
} from 'lucide-react';

interface CalendarViewProps {
  onNavigateTab: (tab: string) => void;
  defaultMode?: 'week' | 'plan';
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  onNavigateTab,
  defaultMode = 'week'
}) => {
  const {
    currentDate,
    currentWeek,
    startDate,
    setCurrentDate,
    tasks,
    extraTasks,
    updateTaskStatus
  } = useDexter();

  const [activeSubView, setActiveSubView] = useState<'week' | 'plan'>(defaultMode);
  const [selectedWeekNum, setSelectedWeekNum] = useState<number>(currentWeek);

  const weekObjective = WEEKLY_OBJECTIVES[selectedWeekNum - 1] || WEEKLY_OBJECTIVES[0];

  // Dynamic weekly start and end dates based on user's startDate
  const weekStartDate = startDate ? addDays(startDate, (selectedWeekNum - 1) * 7) : '2026-10-05';
  const weekEndDate = startDate ? addDays(startDate, (selectedWeekNum - 1) * 7 + 6) : '2026-10-11';

  // Tasks for the selected week
  const weekTasks = tasks.filter((t) => t.weekNumber === selectedWeekNum);
  const completedTasks = weekTasks.filter((t) => t.status === 'done');
  const weekPercent = weekTasks.length > 0 ? Math.round((completedTasks.length / weekTasks.length) * 100) : 0;

  // Track completion rates inside this week
  const cptsTasks = weekTasks.filter((t) => t.kpiId === 'cpts');
  const cptsDone = cptsTasks.filter((t) => t.status === 'done').length;
  const cptsPercent = cptsTasks.length > 0 ? Math.round((cptsDone / cptsTasks.length) * 100) : 0;

  const projTasks = weekTasks.filter((t) => t.kpiId === 'projects');
  const projDone = projTasks.filter((t) => t.status === 'done').length;
  const projPercent = projTasks.length > 0 ? Math.round((projDone / projTasks.length) * 100) : 0;

  const ctfTasks = weekTasks.filter((t) => t.kpiId === 'ctfs');
  const ctfDone = ctfTasks.filter((t) => t.status === 'done').length;
  const ctfPercent = ctfTasks.length > 0 ? Math.round((ctfDone / ctfTasks.length) * 100) : 0;

  const cs50Tasks = weekTasks.filter((t) => t.kpiId === 'cs50');
  const cs50Done = cs50Tasks.filter((t) => t.status === 'done').length;
  const cs50Percent = cs50Tasks.length > 0 ? Math.round((cs50Done / cs50Tasks.length) * 100) : 100;

  // Group by relative day in week (1 to 7)
  const daysInWeek = Array.from({ length: 7 }, (_, i) => {
    const dayRel = i + 1;
    const dayTasks = weekTasks.filter((t) => t.relativeDayInWeek === dayRel);
    const dayDate = dayTasks.length > 0 ? dayTasks[0].date : (startDate ? addDays(startDate, (selectedWeekNum - 1) * 7 + i) : '');
    const dayDone = dayTasks.filter((t) => t.status === 'done').length;
    const isAllDone = dayTasks.length > 0 && dayDone === dayTasks.length;
    const isToday = dayDate === currentDate;
    const isVulnex = dayRel === 7;
    const isUniversity = dayRel === 1 || dayRel === 5 || dayRel === 6;
    const dayExtraTasks = extraTasks.filter((e) => e.date === dayDate);

    return {
      dayRel,
      date: dayDate,
      weekday: dayTasks.length > 0 ? dayTasks[0].dayOfWeek : '',
      tasks: dayTasks,
      totalCount: dayTasks.length,
      doneCount: dayDone,
      isAllDone,
      isToday,
      isVulnex,
      isUniversity,
      extraCount: dayExtraTasks.length,
      extraDoneCount: dayExtraTasks.filter((e) => e.completed).length
    };
  });

  return (
    <div className="space-y-6">
      {/* Top Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-100 tracking-tight">
            {activeSubView === 'week' ? 'Week Execution View' : '16-Week Master Plan & Roadmap'}
          </h1>
          <p className="text-xs text-neutral-400">
            {activeSubView === 'week'
              ? 'Tactical 7-day overview · Direct day jump · Weekly track health & blockers.'
              : 'Full 16-week matrix across Projects, CTFs, CS50, CJCA, McKinsey, AWS, and VULNEX.'}
          </p>
        </div>

        <div className="flex items-center gap-1 rounded-lg bg-neutral-900 p-1 border border-neutral-800 text-xs font-mono">
          <button
            onClick={() => setActiveSubView('week')}
            className={`px-3 py-1.5 rounded-md transition ${
              activeSubView === 'week'
                ? 'bg-neutral-800 text-emerald-400 font-bold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Week View
          </button>
          <button
            onClick={() => setActiveSubView('plan')}
            className={`px-3 py-1.5 rounded-md transition ${
              activeSubView === 'plan'
                ? 'bg-neutral-800 text-emerald-400 font-bold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            16-Week Roadmap
          </button>
        </div>
      </div>

      {/* VIEW 1: WEEK VIEW */}
      {activeSubView === 'week' && (
        <div className="space-y-5">
          {/* Week Selector Bar & KPI Snapshot */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedWeekNum((w) => Math.max(1, w - 1))}
                  disabled={selectedWeekNum <= 1}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900 text-neutral-300 hover:text-neutral-100 disabled:opacity-30"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <h2 className="text-base font-bold font-mono text-neutral-100">
                  WEEK {selectedWeekNum} OF 16
                </h2>

                <button
                  onClick={() => setSelectedWeekNum((w) => Math.min(16, w + 1))}
                  disabled={selectedWeekNum >= 16}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900 text-neutral-300 hover:text-neutral-100 disabled:opacity-30"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>

                <span className="text-xs text-neutral-400 font-mono ml-2">
                  ({formatFriendlyDate(weekStartDate)} → {formatFriendlyDate(weekEndDate)})
                </span>
              </div>

              {selectedWeekNum !== currentWeek && (
                <button
                  onClick={() => setSelectedWeekNum(currentWeek)}
                  className="text-xs font-mono text-emerald-400 hover:underline"
                >
                  Jump to Current Week (W{currentWeek})
                </button>
              )}
            </div>

            {/* Overall Week Progress & Track Health */}
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs font-mono mb-1">
                  <span className="text-neutral-400">Weekly Completion Pace</span>
                  <span className="text-emerald-400 font-bold tabular-nums">{weekPercent}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-neutral-950 overflow-hidden border border-neutral-800">
                  <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${weekPercent}%` }} />
                </div>
              </div>

              {/* Priority KPI status row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-xs">
                <div className="rounded-lg border border-neutral-800/80 bg-neutral-950/60 p-2.5">
                  <span className="text-neutral-500 uppercase text-[10px] block">CPTS Anchor</span>
                  <div className="text-sm font-bold text-emerald-400 tabular-nums mt-0.5">
                    {cptsPercent}% <span className="text-neutral-500 text-[10px] font-normal">({cptsDone}/{cptsTasks.length} days)</span>
                  </div>
                </div>

                <div className="rounded-lg border border-neutral-800/80 bg-neutral-950/60 p-2.5">
                  <span className="text-neutral-500 uppercase text-[10px] block">Projects</span>
                  <div className="text-sm font-bold text-neutral-200 tabular-nums mt-0.5">
                    {projPercent}% <span className="text-neutral-500 text-[10px] font-normal">({projDone}/{projTasks.length} outputs)</span>
                  </div>
                </div>

                <div className="rounded-lg border border-neutral-800/80 bg-neutral-950/60 p-2.5">
                  <span className="text-neutral-500 uppercase text-[10px] block">CTF Exploitation</span>
                  <div className="text-sm font-bold text-neutral-200 tabular-nums mt-0.5">
                    {ctfPercent}% <span className="text-neutral-500 text-[10px] font-normal">({ctfDone}/{ctfTasks.length} boxes)</span>
                  </div>
                </div>

                <div className="rounded-lg border border-neutral-800/80 bg-neutral-950/60 p-2.5">
                  <span className="text-neutral-500 uppercase text-[10px] block">CS50x</span>
                  <div className="text-sm font-bold text-neutral-200 tabular-nums mt-0.5">
                    {cs50Percent}% <span className="text-neutral-500 text-[10px] font-normal">({cs50Done}/{cs50Tasks.length})</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 7-Day Matrix with Direct Jump */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
            {daysInWeek.map((day) => (
              <div
                key={day.dayRel}
                onClick={() => {
                  setCurrentDate(day.date);
                  onNavigateTab('today');
                }}
                className={`group cursor-pointer rounded-xl border p-3.5 flex flex-col justify-between transition hover:border-neutral-700 ${
                  day.isToday
                    ? 'border-emerald-500 bg-neutral-900/90 ring-1 ring-emerald-500/40 shadow-md'
                    : day.isVulnex
                    ? 'border-cyan-900/50 bg-cyan-950/20'
                    : 'border-neutral-800 bg-neutral-900/50 hover:bg-neutral-900'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                    <div>
                      <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-neutral-200 group-hover:text-emerald-400 transition">
                        <span>Day {day.dayRel}</span>
                        {day.isToday && (
                          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                        )}
                      </div>
                      <div className="text-[10px] text-neutral-400 font-mono">
                        {day.weekday.slice(0, 3)}, {day.date.slice(5)}
                      </div>
                    </div>

                    <div className="text-right font-mono text-[11px]">
                      {day.isAllDone ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      ) : day.doneCount > 0 ? (
                        <span className="text-amber-400 font-semibold">{day.doneCount}/{day.totalCount}</span>
                      ) : (
                        <Circle className="h-3.5 w-3.5 text-neutral-600" />
                      )}
                    </div>
                  </div>

                  {/* Day Badges */}
                  <div className="mt-2 mb-2 flex flex-col gap-1">
                    {day.isVulnex && (
                      <span className="text-[9px] font-mono text-cyan-300 bg-cyan-950/80 border border-cyan-800/60 px-1 py-0.5 rounded text-center">
                        VULNEX DEEP WORK
                      </span>
                    )}
                    {day.isUniversity && (
                      <span className="text-[9px] font-mono text-indigo-300 bg-indigo-950/80 border border-indigo-800/60 px-1 py-0.5 rounded text-center">
                        UNIVERSITY
                      </span>
                    )}
                    {day.extraCount > 0 && (
                      <span className="text-[9px] font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-800/50 px-1 py-0.5 rounded text-center">
                        +{day.extraCount} EXTRA ({day.extraDoneCount} DONE)
                      </span>
                    )}
                  </div>

                  {/* Task Titles */}
                  <div className="space-y-1 text-xs mt-1">
                    {day.tasks.map((t) => (
                      <div
                        key={t.id}
                        className={`text-[11px] truncate py-0.5 ${
                          t.status === 'done'
                            ? 'text-neutral-500 line-through'
                            : t.kpiId === 'cpts'
                            ? 'text-emerald-300/90 font-medium'
                            : 'text-neutral-300'
                        }`}
                      >
                        · {t.title.split('—')[1]?.trim() || t.title}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-neutral-800/80 flex items-center justify-between text-[10px] font-mono text-neutral-500 group-hover:text-emerald-400">
                  <span>Open Execution</span>
                  <ArrowRight className="h-3 w-3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 2: PLAN (16-Week Roadmap & Monthly blocks) */}
      {activeSubView === 'plan' && (
        <div className="space-y-6">
          {/* 16-Week Table Matrix */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 overflow-x-auto">
            <div className="min-w-[900px]">
              <div className="pb-3 border-b border-neutral-800 mb-3">
                <h3 className="text-sm font-bold text-neutral-100 font-mono uppercase">
                  16-Week Master Operational Board
                </h3>
                <p className="text-xs text-neutral-400">
                  Full 112-day curriculum across Projects, CTFs, CS50, CJCA, McKinsey, AWS, and VULNEX.
                </p>
              </div>

              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-neutral-800 bg-neutral-950/60 text-neutral-400 text-[11px] uppercase">
                    <th className="py-2.5 px-3">Week</th>
                    <th className="py-2.5 px-3">Project Track</th>
                    <th className="py-2.5 px-3">CTFs</th>
                    <th className="py-2.5 px-3">CS50x</th>
                    <th className="py-2.5 px-3">CJCA</th>
                    <th className="py-2.5 px-3">McKinsey</th>
                    <th className="py-2.5 px-3">AWS Micro</th>
                    <th className="py-2.5 px-3">VULNEX (Day 7)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60 text-neutral-300">
                  {WEEKLY_OBJECTIVES.map((w) => {
                    const isCurrent = w.weekNumber === currentWeek;
                    return (
                      <tr
                        key={w.weekNumber}
                        onClick={() => {
                          setSelectedWeekNum(w.weekNumber);
                          setActiveSubView('week');
                        }}
                        className={`cursor-pointer transition ${
                          isCurrent ? 'bg-emerald-950/30 text-emerald-300 font-bold' : 'hover:bg-neutral-800/40'
                        }`}
                      >
                        <td className="py-2.5 px-3 font-bold text-emerald-400">
                          W{w.weekNumber}
                        </td>
                        <td className="py-2.5 px-3">
                          {w.weekNumber <= 4 && `P1 W${w.weekNumber}`}
                          {w.weekNumber >= 5 && w.weekNumber <= 8 && `P2 W${w.weekNumber - 4}`}
                          {w.weekNumber >= 9 && w.weekNumber <= 12 && `P3 W${w.weekNumber - 8}`}
                          {w.weekNumber >= 13 && `P4 W${w.weekNumber - 12}`}
                        </td>
                        <td className="py-2.5 px-3 text-neutral-200">
                          3 boxes + writeups
                        </td>
                        <td className="py-2.5 px-3">
                          {w.weekNumber <= 14 ? `Week ${w.weekNumber}` : 'COMPLETE'}
                        </td>
                        <td className="py-2.5 px-3">
                          {w.weekNumber <= 10 ? '3h' : 'COMPLETE'}
                        </td>
                        <td className="py-2.5 px-3">
                          {w.weekNumber <= 10 ? '2h' : 'COMPLETE'}
                        </td>
                        <td className="py-2.5 px-3">
                          {w.weekNumber <= 8 ? `S${(w.weekNumber - 1) * 5 + 1}–${w.weekNumber * 5}` : 'COMPLETE'}
                        </td>
                        <td className="py-2.5 px-3 text-cyan-300 font-medium">
                          {w.vulnexTarget.split(':')[1]?.split('(')[0]?.trim() || w.vulnexTarget}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
