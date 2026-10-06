import React, { useState } from 'react';
import { useDexter } from '../context/DexterContext';
import { DexterTask, TaskStatus, DailyCheck } from '../types/dexter';
import { formatFriendlyDate, addDays } from '../utils/dateUtils';
import { formatFriendlyDuration } from '../utils/timeUtils';
import { TaskTimeTracker } from './TaskTimeTracker';
import {
  CheckCircle2,
  Circle,
  Clock,
  Play,
  Pause,
  AlertCircle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  FileCheck,
  Save,
  Check,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Layers,
  Flag,
  Plus,
  Trash2,
  Edit2,
  ListPlus
} from 'lucide-react';

export const DailyExecutionView: React.FC = () => {
  const {
    currentDate,
    currentDayNumber,
    currentWeek,
    relativeDayInWeek,
    startDate,
    endDate,
    setCurrentDate,
    tasks,
    extraTasks,
    updateTaskStatus,
    updateTaskEvidence,
    updateTaskNotes,
    addExtraTask,
    toggleExtraTask,
    updateExtraTask,
    deleteExtraTask,
    activeTaskFocus,
    setActiveTaskFocus,
    finishDay,
    getDailyCheckForDate,
    getRecoveryRecommendation,
    getTimeTrackedForDate
  } = useDexter();

  // Tasks for the selected date
  const dailyTasks = tasks.filter((t) => t.date === currentDate);
  const isVulnexDay = relativeDayInWeek === 7;
  const isUniversityDay = relativeDayInWeek === 1 || relativeDayInWeek === 5 || relativeDayInWeek === 6;

  // Extra tasks for the selected date
  const todayExtraTasks = extraTasks.filter((t) => t.date === currentDate);
  const completedExtraCount = todayExtraTasks.filter((t) => t.completed).length;

  // Extra task creation and editing state
  const [newExtraTitle, setNewExtraTitle] = useState('');
  const [newExtraPriority, setNewExtraPriority] = useState<'P1 - High' | 'P2 - Normal' | 'P3 - Low'>('P2 - Normal');
  const [newExtraNotes, setNewExtraNotes] = useState('');
  const [showExtraNotes, setShowExtraNotes] = useState(false);
  const [editingExtraId, setEditingExtraId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editPriority, setEditPriority] = useState<'P1 - High' | 'P2 - Normal' | 'P3 - Low'>('P2 - Normal');

  // Task expansion states
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  // Evidence editor state
  const [editingEvidenceTaskId, setEditingEvidenceTaskId] = useState<string | null>(null);
  const [tempEvidenceUrl, setTempEvidenceUrl] = useState('');
  const [tempEvidenceNotes, setTempEvidenceNotes] = useState('');

  // Daily Check / Finish Day modal state
  const [showFinishDayModal, setShowFinishDayModal] = useState(false);
  const existingCheck = getDailyCheckForDate(currentDate);

  const [cptsCheck, setCptsCheck] = useState<'Done' | 'Partial' | 'Missed'>(
    existingCheck?.cptsStatus || 'Done'
  );
  const [secondaryCheck, setSecondaryCheck] = useState<'Done' | 'Partial' | 'Missed'>(
    existingCheck?.secondaryStatus || 'Done'
  );
  const [mainOutput, setMainOutput] = useState(existingCheck?.mainOutput || '');
  const [mainFriction, setMainFriction] = useState(existingCheck?.mainFriction || '');
  const [energyLevel, setEnergyLevel] = useState<1 | 2 | 3 | 4 | 5>(
    existingCheck?.energyLevel || 4
  );
  const [tomorrowTask, setTomorrowTask] = useState(existingCheck?.tomorrowFirstTask || '');

  // Progress calculations
  const totalTasks = dailyTasks.length;
  const completedTasks = dailyTasks.filter((t) => t.status === 'done');
  const completedCount = completedTasks.length;
  const dailyProgressPercent = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;
  const allTasksCompleted = totalTasks > 0 && completedCount === totalTasks;

  // Next Action calculation
  const nextIncompleteTask = dailyTasks.find((t) => t.status !== 'done' && t.status !== 'cancelled');

  // Recovery recommendation check
  const recoveryInfo = getRecoveryRecommendation(currentDate);

  // Active task object
  const activeTask = activeTaskFocus ? dailyTasks.find((t) => t.id === activeTaskFocus.taskId) : null;

  // Day navigation
  const handlePrevDay = () => {
    if (!startDate) return;
    const prevStr = addDays(currentDate, -1);
    if (prevStr >= startDate) {
      setCurrentDate(prevStr);
    }
  };

  const handleNextDay = () => {
    if (!endDate) return;
    const nextStr = addDays(currentDate, 1);
    if (nextStr <= endDate) {
      setCurrentDate(nextStr);
    }
  };

  // Start Active Focus on a task
  const handleStartTask = (task: DexterTask) => {
    updateTaskStatus(task.id, 'in-progress');
    setActiveTaskFocus({
      taskId: task.id,
      startedAt: new Date().toISOString(),
      notes: '',
      dodChecklist: {}
    });
  };

  const handleCompleteActiveTask = () => {
    if (activeTask) {
      updateTaskStatus(activeTask.id, 'done');
      setActiveTaskFocus(null);
    }
  };

  // 1-Click fast task completion
  const handleToggleTaskStatus = (task: DexterTask, e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus: TaskStatus = task.status === 'done' ? 'not-started' : 'done';
    updateTaskStatus(task.id, newStatus);
  };

  // Extra Tasks Handlers
  const handleAddExtraTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExtraTitle.trim()) return;
    addExtraTask({
      title: newExtraTitle.trim(),
      date: currentDate,
      priority: newExtraPriority,
      notes: newExtraNotes.trim() || undefined
    });
    setNewExtraTitle('');
    setNewExtraNotes('');
    setShowExtraNotes(false);
  };

  const handleSaveEditExtra = (id: string) => {
    if (!editTitle.trim()) return;
    updateExtraTask(id, {
      title: editTitle.trim(),
      priority: editPriority,
      notes: editNotes.trim()
    });
    setEditingExtraId(null);
  };

  // Finish Day Submission
  const handleFinishDaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const check: DailyCheck = {
      date: currentDate,
      dayNumber: currentDayNumber,
      cptsStatus: cptsCheck,
      secondaryStatus: secondaryCheck,
      mainOutput: mainOutput || 'Completed daily deliverables according to schedule.',
      mainFriction: mainFriction || 'None.',
      energyLevel,
      tomorrowFirstTask: tomorrowTask || 'CPTS 4h contiguous anchor.',
      timestamp: new Date().toISOString()
    };

    finishDay(currentDate, check);
    setShowFinishDayModal(false);
  };

  const dayWeekdayName = dailyTasks.length > 0 ? dailyTasks[0].dayOfWeek : 'Operating Day';

  return (
    <div className="space-y-6">
      {/* 1. ORIENTATION & DAILY HUD */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-widest">
              <span>DAY {currentDayNumber} OF 112 · WEEK {currentWeek}</span>
              {isVulnexDay && (
                <span className="rounded bg-cyan-950 px-2 py-0.5 text-cyan-300 border border-cyan-800 text-[10px] font-bold">
                  REST + VULNEX DEEP WORK
                </span>
              )}
              {isUniversityDay && !isVulnexDay && (
                <span className="rounded bg-indigo-950 px-2 py-0.5 text-indigo-300 border border-indigo-800 text-[10px] font-bold">
                  UNIVERSITY STUDY DAY
                </span>
              )}
            </div>
            <h1 className="mt-1 text-2xl font-bold text-neutral-100 tracking-tight flex items-center gap-3">
              <span>{dayWeekdayName}, {formatFriendlyDate(currentDate)}</span>
            </h1>
            <p className="mt-0.5 text-xs text-neutral-400">
              {isVulnexDay
                ? 'Friday / Day 7 is outside the 6 operating days. Dedicated to 6 hours continuous-context VULNEX engineering.'
                : isUniversityDay
                ? 'Operating Day with protected academic GPA study block. Execute CPTS anchor and University tasks.'
                : 'Standard Operating Day. Protect the 4h CPTS anchor and execute rotated deliverables.'}
            </p>
          </div>

          {/* Day Navigation Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevDay}
              disabled={startDate ? currentDate <= startDate : false}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900 text-neutral-300 hover:text-neutral-100 hover:border-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed transition"
              title="Previous Day"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-1.5 text-xs text-neutral-200 font-mono flex items-center gap-2">
              <span className="text-emerald-400 font-bold">Day {currentDayNumber}</span>
              <span className="text-neutral-600">·</span>
              <span>{currentDate}</span>
            </div>
            <button
              onClick={handleNextDay}
              disabled={endDate ? currentDate >= endDate : false}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900 text-neutral-300 hover:text-neutral-100 hover:border-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed transition"
              title="Next Day"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Daily Progress Gauge */}
        <div className="mt-4 pt-1">
          <div className="flex items-center justify-between text-xs font-mono mb-1.5">
            <span className="text-neutral-400">
              Today's Execution Progress: <strong className="text-neutral-200">{completedCount} of {totalTasks} tasks complete</strong>
            </span>
            <span className="text-emerald-400 font-bold tabular-nums">
              {dailyProgressPercent}%
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-neutral-950 overflow-hidden border border-neutral-800">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${dailyProgressPercent}%` }}
            />
          </div>
        </div>

        {/* Daily Actions Bar */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-neutral-800/80">
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-neutral-400">
            <span>Workload: <strong className="text-neutral-200">{dailyTasks.reduce((a, t) => a + t.durationHours, 0).toFixed(1)}h planned</strong></span>
            <span aria-hidden="true" className="text-neutral-700">·</span>
            <span>Anchor: <strong className="text-neutral-200">{isVulnexDay ? 'VULNEX (6h)' : 'CPTS (4h)'}</strong></span>
            <span aria-hidden="true" className="text-neutral-700">·</span>
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <Clock className="h-3.5 w-3.5" />
              <span>Tracked Today: {formatFriendlyDuration(getTimeTrackedForDate(currentDate))}</span>
            </span>
            {todayExtraTasks.length > 0 && (
              <>
                <span aria-hidden="true" className="text-neutral-700">·</span>
                <span className="text-cyan-400 font-semibold">{completedExtraCount}/{todayExtraTasks.length} extra tasks</span>
              </>
            )}
          </div>

          <button
            onClick={() => setShowFinishDayModal(true)}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-semibold text-neutral-950 transition shadow-sm font-mono"
          >
            <Check className="h-4 w-4 stroke-[3]" />
            <span>Finish Day</span>
          </button>
        </div>
      </div>

      {/* 2. RECOVERY RECOMMENDATION BANNER (If previous day had missed tasks) */}
      {recoveryInfo && (
        <div className="rounded-xl border border-amber-900/50 bg-amber-950/20 p-4 space-y-2">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-bold uppercase">
            <AlertCircle className="h-4 w-4" />
            <span>Intelligent Recovery Recommendation ({recoveryInfo.missedTaskCount} uncompleted from {recoveryInfo.date})</span>
          </div>
          <p className="text-xs text-neutral-300 leading-relaxed font-sans">
            {recoveryInfo.guidanceText}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs font-mono">
            {recoveryInfo.keepItems.length > 0 && (
              <div className="rounded border border-neutral-800 bg-neutral-950/60 p-2 text-neutral-300">
                <span className="text-emerald-400 font-bold block text-[10px] uppercase">KEEP (Priority 1)</span>
                {recoveryInfo.keepItems[0]}
              </div>
            )}
            {recoveryInfo.moveItems.length > 0 && (
              <div className="rounded border border-neutral-800 bg-neutral-950/60 p-2 text-neutral-300">
                <span className="text-amber-400 font-bold block text-[10px] uppercase">MOVE (Buffer)</span>
                {recoveryInfo.moveItems[0]}
              </div>
            )}
            {recoveryInfo.dropItems.length > 0 && (
              <div className="rounded border border-neutral-800 bg-neutral-950/60 p-2 text-neutral-300">
                <span className="text-neutral-500 font-bold block text-[10px] uppercase">DROP (Derived)</span>
                {recoveryInfo.dropItems[0]}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. NEXT ACTION / ACTIVE TASK FOCUS MODE */}
      {activeTask ? (
        /* Active Focus Container */
        <div className="rounded-xl border border-emerald-500/60 bg-gradient-to-r from-neutral-900 via-neutral-900/90 to-emerald-950/20 p-5 shadow-lg">
          <div className="flex items-start justify-between gap-3 pb-3 border-b border-neutral-800">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase font-semibold">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                <span>ACTIVE FOCUS TASK // {activeTask.kpiId.toUpperCase()}</span>
                <span className="text-neutral-600">·</span>
                <span>{activeTask.durationHours >= 1 ? `${activeTask.durationHours}h target` : `${Math.round(activeTask.durationHours * 60)}m target`}</span>
              </div>
              <h2 className="text-lg font-bold text-neutral-100 mt-1">
                {activeTask.title}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <TaskTimeTracker
                taskId={activeTask.id}
                taskTitle={activeTask.title}
                taskDate={activeTask.date}
                isExtraTask={false}
                kpiId={activeTask.kpiId}
                plannedDurationHours={activeTask.durationHours}
              />
              <button
                onClick={() => setActiveTaskFocus(null)}
                className="px-3 py-1.5 rounded-lg border border-neutral-700 bg-neutral-800 text-xs text-neutral-300 hover:text-neutral-100 font-mono transition"
              >
                Pause Focus
              </button>
              <button
                onClick={handleCompleteActiveTask}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-bold text-xs font-mono transition shadow-sm"
              >
                <Check className="h-4 w-4 stroke-[3]" />
                <span>Mark Complete</span>
              </button>
            </div>
          </div>

          <div className="mt-4 space-y-3 text-xs">
            <div>
              <span className="text-neutral-400 font-mono uppercase text-[10px] block">Outcome:</span>
              <p className="text-neutral-200 text-sm mt-0.5">{activeTask.action}</p>
            </div>

            <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-3">
              <span className="text-emerald-400 font-mono uppercase text-[11px] font-bold block mb-1">
                Definition of Done:
              </span>
              <p className="text-neutral-300">{activeTask.definitionOfDone}</p>
            </div>

            <div className="flex items-center justify-between text-xs text-neutral-400 pt-1">
              <span>Expected Output: <strong className="text-emerald-300">{activeTask.expectedOutput}</strong></span>
              <button
                onClick={() => updateTaskStatus(activeTask.id, 'blocked')}
                className="text-amber-400 hover:underline font-mono text-[11px]"
              >
                Mark as Blocked
              </button>
            </div>
          </div>
        </div>
      ) : nextIncompleteTask ? (
        /* Next Action Ready Banner */
        <div className="rounded-xl border border-neutral-800 bg-gradient-to-r from-neutral-900 to-neutral-900/80 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase font-semibold">
              <Sparkles className="h-3.5 w-3.5" />
              <span>NEXT ACTION TO EXECUTE</span>
            </div>
            <h3 className="text-base font-bold text-neutral-100 mt-0.5">
              {nextIncompleteTask.title}
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5 line-clamp-1">
              {nextIncompleteTask.expectedOutput}
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2 sm:gap-3">
            <TaskTimeTracker
              taskId={nextIncompleteTask.id}
              taskTitle={nextIncompleteTask.title}
              taskDate={nextIncompleteTask.date}
              isExtraTask={false}
              kpiId={nextIncompleteTask.kpiId}
              plannedDurationHours={nextIncompleteTask.durationHours}
            />
            <button
              onClick={() => handleStartTask(nextIncompleteTask)}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3.5 py-2 text-xs font-bold text-neutral-950 transition font-mono shadow-sm"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>Start Task</span>
            </button>
          </div>
        </div>
      ) : allTasksCompleted ? (
        /* Day Complete Banner */
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/20 p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-neutral-950 font-bold">
              <Check className="h-5 w-5 stroke-[3]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-100 font-mono">
                DAY COMPLETE — ALL TASKS FINISHED
              </h3>
              <p className="text-xs text-neutral-300">
                Excellent execution. Complete the 2-minute daily check and finish the day.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowFinishDayModal(true)}
            className="rounded-lg bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-bold text-neutral-950 font-mono transition"
          >
            Complete Daily Check
          </button>
        </div>
      ) : null}

      {/* 4. TODAY'S TASK LIST (Progressive Disclosure & 1-Click Completion) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between pb-1">
          <h2 className="text-base font-bold text-neutral-100 tracking-tight">
            Today's Task List ({dailyTasks.length})
          </h2>
          <span className="text-xs text-neutral-500 font-mono">
            Click checkbox to complete · Click row to expand
          </span>
        </div>

        {dailyTasks.map((task) => {
          const isDone = task.status === 'done';
          const isExpanded = expandedTaskId === task.id;
          const isAnchor = task.kpiId === 'cpts' || task.kpiId === 'vulnex';

          return (
            <div
              key={task.id}
              className={`rounded-xl border transition ${
                isDone
                  ? 'border-neutral-800/60 bg-neutral-950/40 opacity-80'
                  : isAnchor
                  ? 'border-emerald-500/30 bg-neutral-900/90 shadow-sm'
                  : 'border-neutral-800 bg-neutral-900/70 hover:border-neutral-700'
              }`}
            >
              {/* Compact 1-Line Row */}
              <div
                onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                className="cursor-pointer p-4 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* 1-Click Fast Checkbox */}
                  <button
                    type="button"
                    onClick={(e) => handleToggleTaskStatus(task, e)}
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition ${
                      isDone
                        ? 'border-emerald-500 bg-emerald-600 text-neutral-950'
                        : 'border-neutral-600 hover:border-emerald-400 text-transparent'
                    }`}
                    title={isDone ? 'Mark as Incomplete' : 'Mark as Done'}
                  >
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                  </button>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-400">
                      <span className="font-bold text-emerald-400 uppercase">{task.kpiId}</span>
                      <span aria-hidden="true" className="text-neutral-700">·</span>
                      <span className="tabular-nums font-semibold text-neutral-300">
                        {task.durationHours >= 1 ? `${task.durationHours}h` : `${Math.round(task.durationHours * 60)}m`}
                      </span>
                      <span aria-hidden="true" className="text-neutral-700">·</span>
                      <span>{task.priority}</span>
                    </div>

                    <h4
                      className={`text-sm font-semibold truncate ${
                        isDone ? 'text-neutral-500 line-through' : 'text-neutral-100'
                      }`}
                    >
                      {task.title}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Task-Level Clockify Time Tracker */}
                  <TaskTimeTracker
                    taskId={task.id}
                    taskTitle={task.title}
                    taskDate={task.date}
                    isExtraTask={false}
                    kpiId={task.kpiId}
                    plannedDurationHours={task.durationHours}
                    compact={true}
                  />

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                      task.status === 'done'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/80'
                        : task.status === 'in-progress'
                        ? 'bg-amber-950 text-amber-400 border border-amber-800/80'
                        : task.status === 'blocked'
                        ? 'bg-rose-950 text-rose-400 border border-rose-800/80'
                        : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                    }`}
                  >
                    {task.status}
                  </span>

                  <button
                    type="button"
                    className="text-neutral-500 hover:text-neutral-300 p-1"
                  >
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Expanded Detailed Metadata (Progressive Disclosure) */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-1 border-t border-neutral-800/80 text-xs text-neutral-300 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-neutral-500 block">Action & Execution:</span>
                      <p className="mt-0.5 text-neutral-200 leading-relaxed">{task.action}</p>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono uppercase text-neutral-500 block">Expected Output:</span>
                      <p className="mt-0.5 text-emerald-300 font-medium">{task.expectedOutput}</p>
                    </div>
                  </div>

                  <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-3">
                    <span className="text-[10px] font-mono uppercase text-emerald-400 font-semibold block mb-1">
                      Definition of Done:
                    </span>
                    <p className="text-neutral-300">{task.definitionOfDone}</p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-800/60 font-mono text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="text-neutral-500">Evidence:</span>
                      {task.evidenceUrl ? (
                        <a
                          href={task.evidenceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-400 hover:underline flex items-center gap-1"
                        >
                          <ExternalLink className="h-3 w-3" />
                          <span>Link Attached</span>
                        </a>
                      ) : (
                        <span className="text-neutral-600 italic">None attached</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingEvidenceTaskId(task.id);
                          setTempEvidenceUrl(task.evidenceUrl || '');
                          setTempEvidenceNotes(task.evidenceNotes || '');
                        }}
                        className="rounded border border-neutral-700 bg-neutral-800 px-2.5 py-1 text-neutral-200 hover:bg-neutral-700 transition"
                      >
                        {task.evidenceUrl ? 'Edit Evidence' : '+ Attach Evidence'}
                      </button>

                      {!isDone && (
                        <button
                          onClick={() => handleStartTask(task)}
                          className="rounded bg-emerald-600 hover:bg-emerald-500 px-3 py-1 font-bold text-neutral-950 transition"
                        >
                          Focus Active Task
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 5. DAILY EXTRA TASKS (Authorized Feature) */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase font-semibold">
              <ListPlus className="h-4 w-4" />
              <span>DAILY EXTRA TASKS</span>
              <span className="text-neutral-600">·</span>
              <span className="text-neutral-400">NON-KPI AD-HOC ACTIONS</span>
            </div>
            <h2 className="text-base font-bold text-neutral-100 mt-0.5">
              Daily Incidental & Operational Tasks
            </h2>
            <p className="text-xs text-neutral-400">
              Track spontaneous errands, admin actions, or side tasks for {formatFriendlyDate(currentDate)} without polluting the 11 Core Dexter KPIs.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-lg border border-neutral-800 bg-neutral-950 px-2.5 py-1 text-xs font-mono text-neutral-300">
              <strong className="text-cyan-400">{completedExtraCount}</strong> of <strong className="text-neutral-100">{todayExtraTasks.length}</strong> complete
            </span>
          </div>
        </div>

        {/* Quick Add Form */}
        <form onSubmit={handleAddExtraTask} className="space-y-2">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              type="text"
              value={newExtraTitle}
              onChange={(e) => setNewExtraTitle(e.target.value)}
              placeholder="Add an extra task for today... (e.g., submit homework, backup config, order adapter)"
              className="flex-1 rounded-lg border border-neutral-800 bg-neutral-950 px-3.5 py-2 text-xs text-neutral-100 placeholder:text-neutral-600 focus:border-cyan-500 focus:outline-none font-sans"
            />

            <div className="flex items-center gap-2">
              <select
                value={newExtraPriority}
                onChange={(e) => setNewExtraPriority(e.target.value as any)}
                className="rounded-lg border border-neutral-800 bg-neutral-950 px-2.5 py-2 text-xs font-mono text-neutral-300 focus:border-cyan-500 focus:outline-none"
              >
                <option value="P1 - High">P1 - High</option>
                <option value="P2 - Normal">P2 - Normal</option>
                <option value="P3 - Low">P3 - Low</option>
              </select>

              <button
                type="button"
                onClick={() => setShowExtraNotes(!showExtraNotes)}
                className={`px-2.5 py-2 rounded-lg border text-xs font-mono transition ${
                  showExtraNotes || newExtraNotes
                    ? 'border-cyan-500/50 bg-cyan-950/30 text-cyan-300'
                    : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-neutral-200'
                }`}
                title="Add Notes"
              >
                {showExtraNotes || newExtraNotes ? 'Notes ✓' : '+ Notes'}
              </button>

              <button
                type="submit"
                disabled={!newExtraTitle.trim()}
                className="flex items-center gap-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-30 disabled:cursor-not-allowed px-3.5 py-2 text-xs font-bold text-neutral-950 font-mono transition shrink-0"
              >
                <Plus className="h-3.5 w-3.5 stroke-[3]" />
                <span>Add Task</span>
              </button>
            </div>
          </div>

          {/* Optional inline notes expander */}
          {showExtraNotes && (
            <div className="pt-1">
              <textarea
                rows={2}
                value={newExtraNotes}
                onChange={(e) => setNewExtraNotes(e.target.value)}
                placeholder="Optional details, links, or context for this extra task..."
                className="w-full rounded-lg border border-neutral-800 bg-neutral-950 p-2 text-xs text-neutral-200 focus:border-cyan-500 focus:outline-none font-sans"
              />
            </div>
          )}
        </form>

        {/* Extra Task List */}
        {todayExtraTasks.length === 0 ? (
          <div className="rounded-lg border border-dashed border-neutral-800/80 bg-neutral-950/40 p-4 text-center">
            <p className="text-xs text-neutral-500 font-mono">
              No extra tasks logged for today. Core Dexter schedule remains fully unencumbered.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {todayExtraTasks.map((extra) => {
              const isEditing = editingExtraId === extra.id;

              if (isEditing) {
                return (
                  <div
                    key={extra.id}
                    className="rounded-lg border border-cyan-800 bg-neutral-950 p-3 space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="flex-1 rounded border border-neutral-700 bg-neutral-900 px-2.5 py-1.5 text-xs text-neutral-100 focus:border-cyan-500 focus:outline-none"
                      />
                      <select
                        value={editPriority}
                        onChange={(e) => setEditPriority(e.target.value as any)}
                        className="rounded border border-neutral-700 bg-neutral-900 px-2 py-1.5 text-xs font-mono text-neutral-300"
                      >
                        <option value="P1 - High">P1 - High</option>
                        <option value="P2 - Normal">P2 - Normal</option>
                        <option value="P3 - Low">P3 - Low</option>
                      </select>
                    </div>
                    <textarea
                      rows={2}
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      placeholder="Notes or context..."
                      className="w-full rounded border border-neutral-700 bg-neutral-900 p-2 text-xs text-neutral-200 focus:border-cyan-500 focus:outline-none"
                    />
                    <div className="flex justify-end gap-2 text-xs font-mono">
                      <button
                        type="button"
                        onClick={() => setEditingExtraId(null)}
                        className="px-2.5 py-1 text-neutral-400 hover:text-neutral-200"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveEditExtra(extra.id)}
                        className="rounded bg-cyan-600 hover:bg-cyan-500 px-3 py-1 font-bold text-neutral-950"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={extra.id}
                  className={`rounded-lg border p-3 flex items-start justify-between gap-3 transition ${
                    extra.completed
                      ? 'border-neutral-800/60 bg-neutral-950/40 opacity-70'
                      : 'border-neutral-800 bg-neutral-950/80 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <button
                      type="button"
                      onClick={() => toggleExtraTask(extra.id)}
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition mt-0.5 ${
                        extra.completed
                          ? 'border-cyan-500 bg-cyan-600 text-neutral-950'
                          : 'border-neutral-600 hover:border-cyan-400 text-transparent'
                      }`}
                      title={extra.completed ? 'Mark incomplete' : 'Mark done'}
                    >
                      <Check className="h-3 w-3 stroke-[3]" />
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-medium ${
                            extra.completed ? 'text-neutral-500 line-through' : 'text-neutral-200'
                          }`}
                        >
                          {extra.title}
                        </span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                            extra.priority?.includes('P1')
                              ? 'bg-rose-950 text-rose-300 border border-rose-800'
                              : extra.priority?.includes('P3')
                              ? 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                              : 'bg-cyan-950 text-cyan-300 border border-cyan-800/60'
                          }`}
                        >
                          {extra.priority?.split(' - ')[1] || 'Normal'}
                        </span>
                      </div>

                      {extra.notes && (
                        <p className="mt-1 text-xs text-neutral-400 font-sans leading-relaxed">
                          {extra.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 text-neutral-500">
                    {/* Time Tracking on Extra Tasks */}
                    <TaskTimeTracker
                      taskId={extra.id}
                      taskTitle={extra.title}
                      taskDate={extra.date}
                      isExtraTask={true}
                      compact={true}
                    />

                    <button
                      type="button"
                      onClick={() => {
                        setEditingExtraId(extra.id);
                        setEditTitle(extra.title);
                        setEditNotes(extra.notes || '');
                        setEditPriority(extra.priority || 'P2 - Normal');
                      }}
                      className="p-1 hover:text-cyan-400 transition"
                      title="Edit task"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteExtraTask(extra.id)}
                      className="p-1 hover:text-rose-400 transition"
                      title="Delete task"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 6. FINISH DAY RAPID DAILY CHECK MODAL (< 2 min) */}
      {showFinishDayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <form
            onSubmit={handleFinishDaySubmit}
            className="w-full max-w-lg rounded-xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div>
                <h3 className="text-base font-bold text-neutral-100 font-mono uppercase">
                  FINISH DAY {currentDayNumber}
                </h3>
                <p className="text-xs text-neutral-400">
                  Rapid 2-minute daily check. Prepares tomorrow and calculates completion.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowFinishDayModal(false)}
                className="text-neutral-400 hover:text-neutral-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-neutral-300">
              {/* CPTS Status */}
              <div>
                <label className="block font-mono text-neutral-300 mb-1">
                  CPTS 4h Anchor:
                </label>
                <div className="flex items-center gap-2">
                  {(['Done', 'Partial', 'Missed'] as const).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setCptsCheck(opt)}
                      className={`flex-1 py-1.5 rounded-lg font-mono text-xs border transition ${
                        cptsCheck === opt
                          ? 'border-emerald-500 bg-emerald-950 text-emerald-300 font-bold'
                          : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Extra Tasks Summary (if any exist for today) */}
              {todayExtraTasks.length > 0 && (
                <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-2.5 flex items-center justify-between font-mono text-xs">
                  <span className="text-neutral-400">Daily Extra Tasks:</span>
                  <span className="text-cyan-400 font-bold">
                    {completedExtraCount} of {todayExtraTasks.length} completed
                  </span>
                </div>
              )}

              {/* Main Output */}
              <div>
                <label className="block font-mono text-neutral-300 mb-1">
                  Today's Main Output:
                </label>
                <input
                  type="text"
                  required
                  value={mainOutput}
                  onChange={(e) => setMainOutput(e.target.value)}
                  placeholder="e.g. Finished CPTS module labs, tested Project 1 parser."
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs text-neutral-200 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {/* Main Friction */}
              <div>
                <label className="block font-mono text-neutral-300 mb-1">
                  Main Friction Encountered:
                </label>
                <input
                  type="text"
                  value={mainFriction}
                  onChange={(e) => setMainFriction(e.target.value)}
                  placeholder="e.g. Subprocess timeout in python script."
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs text-neutral-200 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {/* Energy Rating 1-5 */}
              <div>
                <label className="block font-mono text-neutral-300 mb-1">
                  Energy Level:
                </label>
                <div className="flex items-center gap-2">
                  {([1, 2, 3, 4, 5] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setEnergyLevel(lvl)}
                      className={`flex-1 py-2 rounded-lg font-mono text-xs border transition ${
                        energyLevel === lvl
                          ? 'border-emerald-500 bg-emerald-950 text-emerald-300 font-bold'
                          : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tomorrow's First Task */}
              <div>
                <label className="block font-mono text-neutral-300 mb-1">
                  Tomorrow's First Action:
                </label>
                <input
                  type="text"
                  required
                  value={tomorrowTask}
                  onChange={(e) => setTomorrowTask(e.target.value)}
                  placeholder="e.g. CPTS 4h Anchor: Complete next contiguous section."
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs text-neutral-200 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-800 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowFinishDayModal(false)}
                className="px-3.5 py-2 rounded-lg text-xs text-neutral-400 hover:text-neutral-200 font-mono"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-bold text-neutral-950 font-mono transition"
              >
                <span>Save & Finish Day</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 6. ATTACH EVIDENCE MODAL */}
      {editingEvidenceTaskId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-xl border border-neutral-800 bg-neutral-900 p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
              <h3 className="text-sm font-bold text-neutral-100 font-mono">
                Attach Task Evidence
              </h3>
              <button
                onClick={() => setEditingEvidenceTaskId(null)}
                className="text-neutral-400 hover:text-neutral-200 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-400 font-mono mb-1">
                  Evidence URL (GitHub commit/PR, writeup doc, notes):
                </label>
                <input
                  type="text"
                  value={tempEvidenceUrl}
                  onChange={(e) => setTempEvidenceUrl(e.target.value)}
                  placeholder="https://github.com/... or https://notes.dexter.local/..."
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-950 p-2 text-neutral-200 focus:border-emerald-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-neutral-400 font-mono mb-1">
                  Verification Notes / Flag Proof:
                </label>
                <textarea
                  rows={3}
                  value={tempEvidenceNotes}
                  onChange={(e) => setTempEvidenceNotes(e.target.value)}
                  placeholder="e.g. Verified lab flag captured; test suite 100% passed."
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-950 p-2 text-neutral-200 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-neutral-800 flex justify-end gap-2">
              <button
                onClick={() => setEditingEvidenceTaskId(null)}
                className="px-3 py-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 text-xs font-mono"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  updateTaskEvidence(editingEvidenceTaskId, tempEvidenceUrl, tempEvidenceNotes);
                  setEditingEvidenceTaskId(null);
                }}
                className="rounded-lg bg-emerald-600 hover:bg-emerald-500 px-4 py-1.5 font-bold text-neutral-950 text-xs font-mono transition"
              >
                Save Evidence
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
