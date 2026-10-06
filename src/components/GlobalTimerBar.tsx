import React, { useState } from 'react';
import { useDexter } from '../context/DexterContext';
import { formatDurationHMS, formatFriendlyDuration } from '../utils/timeUtils';
import {
  Play,
  Pause,
  Square,
  Clock,
  AlertCircle,
  Plus,
  X,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export const GlobalTimerBar: React.FC = () => {
  const {
    activeTimer,
    activeTimerElapsedSeconds,
    pauseActiveTimer,
    resumeActiveTimer,
    stopActiveTimer,
    discardActiveTimer,
    longRunningPrompt,
    resolveLongRunningSession,
    confirmStopPrompt,
    dismissConfirmStopPrompt
  } = useDexter();

  const [stopNotes, setStopNotes] = useState('');
  const [showStopNotesInput, setShowStopNotesInput] = useState(false);

  if (!activeTimer && !longRunningPrompt && !confirmStopPrompt) {
    return null;
  }

  const isRunning = activeTimer?.status === 'running';
  const isPaused = activeTimer?.status === 'paused';

  const handleStop = async () => {
    await stopActiveTimer(stopNotes);
    setStopNotes('');
    setShowStopNotesInput(false);
  };

  return (
    <>
      {/* 1. Sticky Bottom Active Timer Banner */}
      {activeTimer && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-emerald-500/40 bg-neutral-950/95 backdrop-blur-md px-4 py-2.5 shadow-2xl transition-all font-mono">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 text-xs">
            {/* Task Info & Status */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${isRunning ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
                <span className="text-[11px] uppercase font-bold text-emerald-400 tracking-wider">
                  {isPaused ? 'TIMER PAUSED' : 'ACTIVE FOCUS'}
                </span>
              </div>
              <div className="truncate min-w-0">
                <span className="text-neutral-100 font-semibold truncate block">
                  {activeTimer.taskTitle}
                </span>
                <span className="text-[10px] text-neutral-500">
                  {activeTimer.taskDate} {activeTimer.kpiId ? `· ${activeTimer.kpiId.toUpperCase()}` : ''}
                </span>
              </div>
            </div>

            {/* Timer Counter & Action Controls */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Large Clockify counter */}
              <div className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1 font-bold text-neutral-100 text-sm sm:text-base tabular-nums shadow-inner">
                {formatDurationHMS(activeTimerElapsedSeconds)}
              </div>

              {/* Pause / Resume */}
              {isRunning ? (
                <button
                  onClick={() => pauseActiveTimer()}
                  className="flex items-center gap-1 rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-xs text-neutral-200 hover:bg-neutral-700 transition"
                  title="Pause active timer"
                >
                  <Pause className="h-3.5 w-3.5 fill-current" />
                  <span className="hidden sm:inline">Pause</span>
                </button>
              ) : (
                <button
                  onClick={() => resumeActiveTimer()}
                  className="flex items-center gap-1 rounded-lg border border-emerald-600 bg-emerald-950/50 px-3 py-1.5 text-xs text-emerald-300 hover:bg-emerald-900/60 transition"
                  title="Resume timer"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span className="hidden sm:inline">Resume</span>
                </button>
              )}

              {/* Optional session note toggle */}
              {!showStopNotesInput ? (
                <button
                  onClick={() => setShowStopNotesInput(true)}
                  className="hidden md:inline-flex px-2 py-1.5 text-[11px] text-neutral-500 hover:text-neutral-300"
                  title="Add note before stopping"
                >
                  + Note
                </button>
              ) : (
                <input
                  type="text"
                  placeholder="Session notes..."
                  value={stopNotes}
                  onChange={(e) => setStopNotes(e.target.value)}
                  className="w-32 sm:w-48 rounded border border-neutral-700 bg-neutral-900 px-2 py-1 text-xs text-neutral-100 placeholder:text-neutral-600"
                />
              )}

              {/* Stop & Save */}
              <button
                onClick={handleStop}
                className="flex items-center gap-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 px-3.5 py-1.5 text-xs font-bold text-neutral-950 transition shadow-sm"
                title="Stop and save session to database"
              >
                <Square className="h-3 w-3 fill-current" />
                <span>Stop</span>
              </button>

              {/* Discard */}
              <button
                onClick={() => {
                  if (confirm('Discard this active running session without saving?')) {
                    discardActiveTimer();
                  }
                }}
                className="p-1 text-neutral-600 hover:text-neutral-400 rounded transition"
                title="Discard session"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Confirm Stop Modal (When starting another task while timer is active) */}
      {confirmStopPrompt && confirmStopPrompt.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-neutral-800 bg-neutral-900 p-5 shadow-2xl space-y-4 font-mono text-xs">
            <div className="flex items-center gap-2 text-amber-400 font-bold uppercase text-xs">
              <AlertTriangle className="h-4 w-4" />
              <span>Active Timer Already Running</span>
            </div>

            <p className="text-neutral-300 font-sans text-xs leading-relaxed">
              You are currently tracking time on:
            </p>
            <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-3 text-neutral-200">
              <strong className="text-emerald-400">{confirmStopPrompt.currentTaskTitle}</strong>
              <div className="text-[11px] text-neutral-500 mt-1">
                Current duration: {formatDurationHMS(activeTimerElapsedSeconds)}
              </div>
            </div>

            <p className="text-neutral-400 font-sans text-xs">
              Only one timer may run at a time per account. Would you like to stop and save the current session to switch to the new task?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800">
              <button
                onClick={dismissConfirmStopPrompt}
                className="px-3 py-1.5 rounded border border-neutral-800 text-neutral-400 hover:text-neutral-200"
              >
                Cancel (Keep Current)
              </button>
              <button
                onClick={() => {
                  confirmStopPrompt.pendingAction();
                  dismissConfirmStopPrompt();
                }}
                className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 font-bold text-neutral-950 transition"
              >
                Stop, Save & Switch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Long Running Session Recovery Prompt (> 4 Hours) */}
      {longRunningPrompt && longRunningPrompt.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-xl border border-amber-500/50 bg-neutral-900 p-6 shadow-2xl space-y-4 font-mono text-xs">
            <div className="flex items-center gap-2 text-amber-400 font-bold uppercase text-xs">
              <AlertCircle className="h-5 w-5" />
              <span>Long-Running Timer Recovery Prompt</span>
            </div>

            <p className="text-neutral-200 font-sans text-sm leading-relaxed">
              The timer on <strong>"{longRunningPrompt.timerState?.taskTitle}"</strong> has been running for{' '}
              <strong className="text-amber-300 font-mono">
                {Math.floor(longRunningPrompt.runningMinutes / 60)}h {longRunningPrompt.runningMinutes % 60}m
              </strong>.
            </p>

            <p className="text-neutral-400 font-sans text-xs leading-relaxed">
              Tracked time measures recorded duration, not verified concentration. If you left the browser open overnight or stepped away, choose how you would like to account for this session without losing your data:
            </p>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => resolveLongRunningSession('keep')}
                className="w-full text-left p-3 rounded-lg border border-neutral-800 bg-neutral-950 hover:bg-neutral-800 transition"
              >
                <div className="font-bold text-neutral-100">Keep Full Duration</div>
                <div className="text-[11px] text-neutral-500 font-sans">
                  Confirm that the full recorded time was active work.
                </div>
              </button>

              <button
                onClick={() => resolveLongRunningSession('trim-standard')}
                className="w-full text-left p-3 rounded-lg border border-cyan-800/60 bg-cyan-950/20 hover:bg-cyan-900/30 transition"
              >
                <div className="font-bold text-cyan-300">Trim to 2 Hours (Standard Deep Work Block)</div>
                <div className="text-[11px] text-neutral-400 font-sans">
                  Caps the session at 2 hours and preserves an audit record that duration was trimmed.
                </div>
              </button>

              <button
                onClick={() => resolveLongRunningSession('discard')}
                className="w-full text-left p-3 rounded-lg border border-rose-950 bg-rose-950/20 hover:bg-rose-900/30 transition"
              >
                <div className="font-bold text-rose-400">Discard This Session</div>
                <div className="text-[11px] text-neutral-500 font-sans">
                  Discard the accidental timer without recording false focus time.
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
