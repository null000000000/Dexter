import React, { useState, useMemo } from 'react';
import { useDexter } from '../context/DexterContext';
import { TaskStatus, DexterTask, KpiId } from '../types/dexter';
import {
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronDown,
  ArrowUpDown,
  FileCheck
} from 'lucide-react';

export const TaskDatabaseView: React.FC = () => {
  const {
    tasks,
    updateTaskStatus,
    updateTaskEvidence,
    setCurrentDate,
    currentDate
  } = useDexter();

  const [searchTerm, setSearchTerm] = useState('');
  const [kpiFilter, setKpiFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [weekFilter, setWeekFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedTask, setSelectedTask] = useState<DexterTask | null>(null);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchesSearch =
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.expectedOutput.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.date.includes(searchTerm);
      if (!matchesSearch) return false;

      if (kpiFilter !== 'all' && t.kpiId !== kpiFilter) return false;
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (weekFilter !== 'all' && t.weekNumber !== parseInt(weekFilter, 10)) return false;
      if (priorityFilter !== 'all' && !t.priority.includes(priorityFilter)) return false;

      return true;
    });
  }, [tasks, searchTerm, kpiFilter, statusFilter, weekFilter, priorityFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-lg border border-neutral-800 bg-neutral-900/60 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-widest">
              <span>Section 21 System Spec</span>
            </div>
            <h1 className="mt-1 text-2xl font-bold text-neutral-100 tracking-tight">
              Unified Task Database & Query Engine
            </h1>
            <p className="mt-0.5 text-xs text-neutral-400">
              Query, filter, and inspect all {tasks.length} concrete dated tasks across the entire 16-week Operation Dexter operating period.
            </p>
          </div>

          <div className="text-right font-mono text-xs">
            <span className="text-neutral-400 block">Matches Found</span>
            <span className="text-lg font-bold text-emerald-400 tabular-nums">
              {filteredTasks.length} / {tasks.length}
            </span>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 text-xs font-mono">
          {/* Search Input */}
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-neutral-500" />
            <input
              type="text"
              placeholder="Search keyword or date..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded border border-neutral-800 bg-neutral-950 pl-8 pr-3 py-1.5 text-xs text-neutral-200 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* KPI Filter */}
          <div>
            <select
              value={kpiFilter}
              onChange={(e) => setKpiFilter(e.target.value)}
              className="w-full rounded border border-neutral-800 bg-neutral-950 px-2 py-1.5 text-neutral-300 focus:outline-none"
            >
              <option value="all">All Tracks & KPIs</option>
              <option value="cpts">CPTS (Anchor)</option>
              <option value="projects">Projects</option>
              <option value="ctfs">CTFs</option>
              <option value="vulnex">VULNEX (Friday)</option>
              <option value="gpa">GPA / University</option>
              <option value="cs50">CS50x</option>
              <option value="cjca">CJCA</option>
              <option value="aws">AWS Foundation</option>
              <option value="mckinsey">McKinsey Forward</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded border border-neutral-800 bg-neutral-950 px-2 py-1.5 text-neutral-300 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="done">Done</option>
              <option value="in-progress">In Progress</option>
              <option value="not-started">Not Started</option>
              <option value="partial">Partial</option>
              <option value="blocked">Blocked</option>
              <option value="deferred">Deferred</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Week Filter */}
          <div>
            <select
              value={weekFilter}
              onChange={(e) => setWeekFilter(e.target.value)}
              className="w-full rounded border border-neutral-800 bg-neutral-950 px-2 py-1.5 text-neutral-300 focus:outline-none"
            >
              <option value="all">All 16 Weeks</option>
              {Array.from({ length: 16 }, (_, i) => i + 1).map((w) => (
                <option key={w} value={w.toString()}>
                  Week {w}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full rounded border border-neutral-800 bg-neutral-950 px-2 py-1.5 text-neutral-300 focus:outline-none"
            >
              <option value="all">All Priorities</option>
              <option value="Anchor">P1 - Anchor</option>
              <option value="High">P2 - High</option>
              <option value="Foundation">P3 - Foundation</option>
              <option value="Derived">P4 - Derived</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task Table */}
      <div className="rounded-lg border border-neutral-800 bg-neutral-900/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-neutral-800 bg-neutral-950 text-neutral-400 text-[11px] uppercase">
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-2">Week</th>
                <th className="py-3 px-2">KPI</th>
                <th className="py-3 px-4 font-sans font-semibold">Deliverable & Outcome Task</th>
                <th className="py-3 px-2 text-right">Duration</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/70 text-neutral-300">
              {filteredTasks.slice(0, 100).map((t) => {
                const isDone = t.status === 'done';
                return (
                  <tr
                    key={t.id}
                    className={`transition hover:bg-neutral-800/40 ${
                      t.date === currentDate ? 'bg-emerald-950/20' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3 text-neutral-400 whitespace-nowrap text-[11px]">
                      {t.date} <span className="text-neutral-500">({t.dayOfWeek.slice(0, 3)})</span>
                    </td>
                    <td className="py-2.5 px-2 text-neutral-400">
                      W{t.weekNumber}
                    </td>
                    <td className="py-2.5 px-2 uppercase font-bold text-emerald-400 text-[11px]">
                      {t.kpiId}
                    </td>
                    <td className="py-2.5 px-4 font-sans text-xs">
                      <div
                        className={`font-medium ${isDone ? 'text-neutral-500 line-through' : 'text-neutral-200'}`}
                      >
                        {t.title}
                      </div>
                      <div className="text-[11px] text-neutral-400 line-clamp-1 mt-0.5">
                        {t.expectedOutput}
                      </div>
                    </td>
                    <td className="py-2.5 px-2 text-right tabular-nums text-neutral-300">
                      {t.durationHours >= 1 ? `${t.durationHours}h` : `${Math.round(t.durationHours * 60)}m`}
                    </td>
                    <td className="py-2.5 px-3">
                      <select
                        value={t.status}
                        onChange={(e) => updateTaskStatus(t.id, e.target.value as TaskStatus)}
                        className={`rounded border text-[11px] px-2 py-0.5 font-mono focus:outline-none ${
                          t.status === 'done'
                            ? 'border-emerald-600/60 bg-emerald-950/40 text-emerald-400'
                            : t.status === 'in-progress'
                            ? 'border-amber-600/60 bg-amber-950/40 text-amber-400'
                            : 'border-neutral-700 bg-neutral-800 text-neutral-300'
                        }`}
                      >
                        <option value="not-started">Not Started</option>
                        <option value="in-progress">In Progress</option>
                        <option value="done">Done</option>
                        <option value="partial">Partial</option>
                        <option value="blocked">Blocked</option>
                        <option value="deferred">Deferred</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => setSelectedTask(t)}
                        className="rounded border border-neutral-700/80 bg-neutral-800 px-2 py-0.5 text-[11px] text-neutral-300 hover:text-neutral-100 hover:border-neutral-600 transition"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredTasks.length > 100 && (
            <div className="p-3 text-center text-xs text-neutral-500 font-mono border-t border-neutral-800">
              Showing first 100 matches of {filteredTasks.length}. Use filters above to narrow your query.
            </div>
          )}

          {filteredTasks.length === 0 && (
            <div className="p-8 text-center text-xs text-neutral-400 font-mono">
              No tasks match the active filter criteria.
            </div>
          )}
        </div>
      </div>

      {/* Task Inspection Drawer Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-lg border border-neutral-800 bg-neutral-900 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-neutral-800">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase">
                  <span>{selectedTask.kpiId.toUpperCase()}</span>
                  <span className="text-neutral-600">·</span>
                  <span>Week {selectedTask.weekNumber}</span>
                  <span className="text-neutral-600">·</span>
                  <span>{selectedTask.date}</span>
                </div>
                <h3 className="text-base font-bold text-neutral-100 mt-1">
                  {selectedTask.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="text-neutral-400 hover:text-neutral-200 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs text-neutral-300">
              <div>
                <span className="text-[11px] font-mono text-neutral-500 uppercase block">Action & Execution:</span>
                <p className="mt-0.5 text-neutral-200">{selectedTask.action}</p>
              </div>

              <div>
                <span className="text-[11px] font-mono text-neutral-500 uppercase block">Expected Output:</span>
                <p className="mt-0.5 text-emerald-300/90 font-medium">{selectedTask.expectedOutput}</p>
              </div>

              <div>
                <span className="text-[11px] font-mono text-neutral-500 uppercase block">Definition of Done:</span>
                <p className="mt-0.5 text-neutral-300 bg-neutral-950 p-2 rounded border border-neutral-800">
                  {selectedTask.definitionOfDone}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                <div className="rounded border border-neutral-800 p-2 bg-neutral-950">
                  <span className="text-neutral-500 uppercase block">Priority</span>
                  <span className="text-neutral-200">{selectedTask.priority}</span>
                </div>
                <div className="rounded border border-neutral-800 p-2 bg-neutral-950">
                  <span className="text-neutral-500 uppercase block">Duration</span>
                  <span className="text-neutral-200">{selectedTask.durationHours}h</span>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-mono text-neutral-500 uppercase block">Dependency:</span>
                <p className="mt-0.5 text-neutral-400">{selectedTask.dependency}</p>
              </div>

              <div>
                <span className="text-[11px] font-mono text-rose-400 uppercase block">What if Missed:</span>
                <p className="mt-0.5 text-neutral-400 italic">{selectedTask.whatIfMissed}</p>
              </div>

              {selectedTask.evidenceUrl && (
                <div>
                  <span className="text-[11px] font-mono text-neutral-500 uppercase block">Evidence URL:</span>
                  <a
                    href={selectedTask.evidenceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-400 hover:underline flex items-center gap-1 font-mono mt-0.5"
                  >
                    <span>{selectedTask.evidenceUrl}</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>

            <div className="mt-5 pt-3 border-t border-neutral-800 flex justify-between items-center">
              <button
                onClick={() => {
                  setCurrentDate(selectedTask.date);
                  setSelectedTask(null);
                }}
                className="text-xs text-emerald-400 hover:underline font-mono"
              >
                Set Active Date to {selectedTask.date}
              </button>
              <button
                onClick={() => setSelectedTask(null)}
                className="px-3 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-mono"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
