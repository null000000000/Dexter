import React, { useState } from 'react';
import { useDexter } from '../context/DexterContext';
import { TimeSession } from '../types/dexter';
import { formatDurationHMS, formatFriendlyDuration, formatLocalTime } from '../utils/timeUtils';
import {
  Play,
  Pause,
  Square,
  Clock,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  AlertTriangle,
  History,
  Info
} from 'lucide-react';

interface TaskTimeTrackerProps {
  taskId: string | null;
  taskTitle: string;
  taskDate: string;
  isExtraTask?: boolean;
  kpiId?: any;
  projectNumber?: number | null;
  plannedDurationHours?: number; // for planned vs actual comparison
  compact?: boolean;
}

export const TaskTimeTracker: React.FC<TaskTimeTrackerProps> = ({
  taskId,
  taskTitle,
  taskDate,
  isExtraTask = false,
  kpiId,
  projectNumber,
  plannedDurationHours,
  compact = false
}) => {
  const {
    activeTimer,
    activeTimerElapsedSeconds,
    startTaskTimer,
    pauseActiveTimer,
    resumeActiveTimer,
    stopActiveTimer,
    timeSessions,
    addManualTimeEntry,
    updateTimeSession,
    deleteTimeSession,
    getTimeTrackedForTask
  } = useDexter();

  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualMinutes, setManualMinutes] = useState<number>(30);
  const [manualNotes, setManualNotes] = useState('');
  const [sessionNotes, setSessionNotes] = useState('');
  const [editingSession, setEditingSession] = useState<TimeSession | null>(null);
  const [editMinutes, setEditMinutes] = useState<number>(0);
  const [editReason, setEditReason] = useState('');

  // Is THIS task currently being timed?
  const isThisTaskActive =
    Boolean(activeTimer) &&
    ((taskId && activeTimer?.taskId === taskId) ||
      (!taskId && activeTimer?.taskTitle === taskTitle && activeTimer?.taskDate === taskDate));

  const isRunning = isThisTaskActive && activeTimer?.status === 'running';
  const isPaused = isThisTaskActive && activeTimer?.status === 'paused';

  // Total accumulated seconds tracked for this task (historical + active)
  const totalTrackedSeconds = taskId
    ? getTimeTrackedForTask(taskId)
    : timeSessions
        .filter((s) => s.taskTitle === taskTitle && s.taskDate === taskDate && s.status === 'completed')
        .reduce((sum, s) => sum + s.totalElapsedSeconds, 0) +
      (isThisTaskActive ? activeTimerElapsedSeconds : 0);

  // Associated sessions for this task
  const taskSessions = timeSessions.filter((s) => {
    if (taskId) return s.taskId === taskId;
    return s.taskTitle === taskTitle && s.taskDate === taskDate;
  });

  const handleStartOrResume = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPaused) {
      await resumeActiveTimer();
    } else {
      await startTaskTimer(taskId, taskTitle, taskDate, isExtraTask, kpiId, projectNumber);
    }
  };

  const handlePause = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await pauseActiveTimer();
  };

  const handleStop = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await stopActiveTimer(sessionNotes);
    setSessionNotes('');
  };

  const handleAddManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (manualMinutes <= 0) return;
    await addManualTimeEntry({
      taskId,
      taskTitle,
      taskDate,
      durationMinutes: manualMinutes,
      kpiId,
      projectNumber,
      notes: manualNotes
    });
    setManualMinutes(30);
    setManualNotes('');
    setShowManualModal(false);
  };

  const handleSaveEditSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSession || editMinutes <= 0) return;
    await updateTimeSession(editingSession.id, {
      totalElapsedSeconds: Math.round(editMinutes * 60),
      editReason: editReason || 'Manual duration adjustment'
    });
    setEditingSession(null);
    setEditReason('');
  };

  // Planned vs Actual Variance Calculation
  const plannedSeconds = plannedDurationHours ? plannedDurationHours * 3600 : null;
  const varianceSeconds = plannedSeconds !== null ? totalTrackedSeconds - plannedSeconds : null;
  const variancePercent = plannedSeconds && plannedSeconds > 0
    ? Math.round(((totalTrackedSeconds - plannedSeconds) / plannedSeconds) * 100)
    : null;

  return (
    <>
      <div className={`flex items-center gap-2 font-mono ${compact ? 'text-xs' : 'text-xs'}`}>
        {/* Active Timer Display & Controls */}
        {isThisTaskActive ? (
          <div className="flex items-center gap-1.5 rounded-lg border border-emerald-500/50 bg-emerald-950/40 px-2 py-1 text-emerald-300 shadow-sm animate-pulse">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="font-bold tabular-nums tracking-wide">
              {formatDurationHMS(activeTimerElapsedSeconds)}
            </span>
            <span className="text-[10px] uppercase text-emerald-500 font-semibold ml-0.5">
              {isPaused ? 'PAUSED' : 'TRACKING'}
            </span>

            {/* Pause / Resume button */}
            {isRunning ? (
              <button
                onClick={handlePause}
                title="Pause Timer"
                className="p-1 rounded hover:bg-emerald-800/50 text-emerald-300 transition"
              >
                <Pause className="h-3 w-3 fill-current" />
              </button>
            ) : (
              <button
                onClick={handleStartOrResume}
                title="Resume Timer"
                className="p-1 rounded hover:bg-emerald-800/50 text-emerald-300 transition"
              >
                <Play className="h-3 w-3 fill-current" />
              </button>
            )}

            {/* Stop button */}
            <button
              onClick={handleStop}
              title="Stop & Save Session"
              className="p-1 rounded hover:bg-rose-900/60 text-rose-300 transition"
            >
              <Square className="h-3 w-3 fill-current" />
            </button>
          </div>
        ) : (
          /* Idle Timer Quick Start Button */
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleStartOrResume}
              title="Start Tracked Focus Session"
              className="flex items-center gap-1 rounded-md border border-neutral-800 bg-neutral-900/80 px-2.5 py-1 text-[11px] text-neutral-300 hover:text-emerald-400 hover:border-emerald-500/40 hover:bg-emerald-950/20 transition group"
            >
              <Play className="h-3 w-3 text-emerald-500 group-hover:scale-110 transition-transform fill-current" />
              <span>Track Time</span>
            </button>
          </div>
        )}

        {/* Accumulated Time Badge & Sessions Counter */}
        {totalTrackedSeconds > 0 && (
          <button
            onClick={() => setShowHistoryModal(true)}
            title="View Recorded Time Sessions"
            className="flex items-center gap-1 rounded-md border border-neutral-800 bg-neutral-950 px-2 py-1 text-[11px] text-neutral-400 hover:text-neutral-200 hover:border-neutral-700 transition"
          >
            <Clock className="h-3 w-3 text-cyan-400" />
            <span className="font-semibold text-neutral-200 tabular-nums">
              {formatFriendlyDuration(totalTrackedSeconds)}
            </span>
            <span className="text-neutral-600">({taskSessions.length})</span>
          </button>
        )}

        {/* Planned vs Actual Comparison Tag (If estimate exists) */}
        {plannedDurationHours !== undefined && plannedDurationHours > 0 && totalTrackedSeconds > 0 && (
          <div
            className={`hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono border ${
              varianceSeconds && varianceSeconds > 1800 // > 30m over
                ? 'border-amber-800/60 bg-amber-950/30 text-amber-300'
                : 'border-neutral-800 bg-neutral-900 text-neutral-400'
            }`}
            title={`Planned: ${plannedDurationHours}h (${plannedDurationHours * 60}m) | Tracked: ${formatFriendlyDuration(totalTrackedSeconds)} | Variance: ${variancePercent && variancePercent > 0 ? `+${variancePercent}%` : `${variancePercent}%`}`}
          >
            <span>{variancePercent && variancePercent > 0 ? `+${variancePercent}% vs plan` : `${variancePercent}%`}</span>
          </div>
        )}

        {/* Manual Time Entry Modal Trigger */}
        <button
          onClick={() => setShowManualModal(true)}
          title="Add Manual Time Entry"
          className="p-1 text-neutral-500 hover:text-neutral-300 rounded hover:bg-neutral-800/50 transition"
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>

      {/* Manual Entry Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl border border-neutral-800 bg-neutral-900 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-bold uppercase">
                <Clock className="h-4 w-4" />
                <span>Manual Time Entry</span>
              </div>
              <button
                onClick={() => setShowManualModal(false)}
                className="text-neutral-500 hover:text-neutral-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase text-neutral-500 block">Task:</span>
              <p className="text-xs font-semibold text-neutral-200 truncate mt-0.5">{taskTitle}</p>
            </div>

            <form onSubmit={handleAddManualSubmit} className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-neutral-400 mb-1">Duration (Minutes):</label>
                <input
                  type="number"
                  min="1"
                  max="1440"
                  value={manualMinutes}
                  onChange={(e) => setManualMinutes(parseInt(e.target.value, 10) || 0)}
                  className="w-full rounded border border-neutral-800 bg-neutral-950 px-3 py-1.5 text-neutral-100 focus:border-cyan-500 focus:outline-none"
                  required
                />
                <div className="flex gap-1.5 mt-1.5">
                  {[15, 30, 45, 60, 120].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setManualMinutes(m)}
                      className="px-2 py-0.5 rounded border border-neutral-800 bg-neutral-950 text-[10px] text-neutral-400 hover:text-neutral-200"
                    >
                      {m}m
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Notes / Description (Optional):</label>
                <textarea
                  rows={2}
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  placeholder="What was completed during this work session?"
                  className="w-full rounded border border-neutral-800 bg-neutral-950 p-2 text-neutral-100 placeholder:text-neutral-600 focus:border-cyan-500 focus:outline-none text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-3 py-1.5 rounded border border-neutral-800 text-neutral-400 hover:text-neutral-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 font-bold text-neutral-950 transition"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tracked Sessions History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl border border-neutral-800 bg-neutral-900 p-5 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800 shrink-0">
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold uppercase">
                <History className="h-4 w-4" />
                <span>Tracked Sessions ({taskSessions.length})</span>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-neutral-500 hover:text-neutral-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="shrink-0 bg-neutral-950 p-3 rounded-lg border border-neutral-800">
              <span className="text-[10px] font-mono uppercase text-neutral-500 block">Target:</span>
              <p className="text-xs font-bold text-neutral-100 mt-0.5">{taskTitle}</p>
              <div className="flex items-center gap-4 mt-2 text-xs font-mono">
                <span className="text-neutral-400">
                  Total Focus Time: <strong className="text-emerald-400">{formatFriendlyDuration(totalTrackedSeconds)}</strong>
                </span>
                {plannedDurationHours && (
                  <span className="text-neutral-400">
                    Planned: <strong className="text-neutral-200">{plannedDurationHours}h</strong>
                  </span>
                )}
              </div>
            </div>

            {/* Sessions List */}
            <div className="overflow-y-auto space-y-2 flex-1 pr-1 font-mono text-xs">
              {taskSessions.length === 0 ? (
                <div className="text-center py-6 text-neutral-500">
                  No recorded sessions yet for this task.
                </div>
              ) : (
                taskSessions.map((session) => (
                  <div
                    key={session.id}
                    className="p-3 rounded-lg border border-neutral-800 bg-neutral-950/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400 font-bold">
                          {formatFriendlyDuration(session.totalElapsedSeconds)}
                        </span>
                        <span className="text-neutral-600">·</span>
                        <span className="text-[10px] uppercase text-neutral-500">
                          {session.source === 'timer' ? 'Timer' : 'Manual'}
                        </span>
                        {session.wasManuallyEdited && (
                          <span className="text-[10px] bg-amber-950/50 border border-amber-800/60 text-amber-300 px-1.5 py-0.2 rounded">
                            Edited
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-neutral-400 mt-1">
                        <span>{session.taskDate}</span>
                        {session.startTime && (
                          <span className="text-neutral-600 ml-1.5">
                            ({formatLocalTime(session.startTime)}
                            {session.endTime ? ` → ${formatLocalTime(session.endTime)}` : ''})
                          </span>
                        )}
                      </div>
                      {session.notes && (
                        <p className="text-[11px] text-neutral-300 mt-1 italic font-sans">
                          "{session.notes}"
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          setEditingSession(session);
                          setEditMinutes(Math.round(session.totalElapsedSeconds / 60));
                          setEditReason(session.editReason || '');
                        }}
                        title="Edit Duration"
                        className="p-1 text-neutral-400 hover:text-neutral-200 rounded hover:bg-neutral-800 transition"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Delete this recorded time session? This cannot be undone.')) {
                            deleteTimeSession(session.id);
                          }
                        }}
                        title="Delete Recorded Session"
                        className="p-1 text-neutral-500 hover:text-rose-400 rounded hover:bg-rose-950/30 transition"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Edit Session Inline Form */}
            {editingSession && (
              <form onSubmit={handleSaveEditSession} className="shrink-0 p-3 rounded-lg border border-cyan-800/60 bg-cyan-950/20 space-y-2 font-mono text-xs">
                <span className="text-cyan-400 font-bold block">Edit Session Duration</span>
                <div className="flex items-center gap-2">
                  <label className="text-neutral-400">Minutes:</label>
                  <input
                    type="number"
                    min="1"
                    max="1440"
                    value={editMinutes}
                    onChange={(e) => setEditMinutes(parseInt(e.target.value, 10) || 0)}
                    className="w-24 rounded border border-neutral-700 bg-neutral-900 px-2 py-1 text-neutral-100"
                  />
                  <input
                    type="text"
                    placeholder="Reason for adjustment..."
                    value={editReason}
                    onChange={(e) => setEditReason(e.target.value)}
                    className="flex-1 rounded border border-neutral-700 bg-neutral-900 px-2 py-1 text-neutral-100"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingSession(null)}
                    className="px-2 py-1 text-neutral-400 hover:text-neutral-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 rounded bg-cyan-600 text-neutral-950 font-bold hover:bg-cyan-500"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            )}

            <div className="pt-2 border-t border-neutral-800 flex justify-end shrink-0">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-1.5 rounded-lg border border-neutral-800 bg-neutral-950 text-neutral-300 hover:text-neutral-100 text-xs font-mono"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
