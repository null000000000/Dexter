import React, { useState } from 'react';
import { useDexter } from '../context/DexterContext';
import { getEndExecutionDate, formatFriendlyDate } from '../utils/dateUtils';
import { Calendar, AlertTriangle, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';

interface StartDateModalProps {
  isOpen: boolean;
  isInitialSetup: boolean;
  onClose?: () => void;
}

export const StartDateModal: React.FC<StartDateModalProps> = ({
  isOpen,
  isInitialSetup,
  onClose
}) => {
  const { startDate, setStartDate } = useDexter();

  // Default to current startDate or today's local date
  const [selectedDate, setSelectedDate] = useState<string>(
    startDate || new Date().toISOString().split('T')[0]
  );
  const [confirmRecalculate, setConfirmRecalculate] = useState(false);

  if (!isOpen) return null;

  const calculatedEndDate = getEndExecutionDate(selectedDate);
  const hasExistingProgress = !isInitialSetup && !!startDate;
  const isDifferentDate = selectedDate !== startDate;

  const handleConfirm = () => {
    if (hasExistingProgress && !confirmRecalculate && isDifferentDate) {
      setConfirmRecalculate(true);
      return;
    }

    setStartDate(selectedDate, true);
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="w-full max-w-md rounded-xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl">
        <div className="flex items-center gap-3 pb-4 border-b border-neutral-800">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-950/40 text-emerald-400">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-neutral-100 font-mono tracking-tight">
              {isInitialSetup ? 'START DEXTER' : 'CHANGE START DATE'}
            </h2>
            <p className="text-xs text-neutral-400">
              {isInitialSetup
                ? 'Choose your first execution day. Day 1 starts here.'
                : 'Recalculate your 16-week execution timeline.'}
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-4 text-xs text-neutral-300">
          <div>
            <label className="block text-xs font-mono text-neutral-300 mb-1.5 uppercase font-medium">
              Choose your first execution day (Day 1):
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                if (e.target.value) {
                  setSelectedDate(e.target.value);
                  setConfirmRecalculate(false);
                }
              }}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3.5 py-2.5 text-sm text-neutral-100 font-mono focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Timeline Summary Box */}
          <div className="rounded-lg border border-neutral-800 bg-neutral-950/80 p-4 space-y-3 font-mono">
            <div className="text-[11px] text-emerald-400 font-semibold uppercase tracking-wider">
              Your 16-Week Dexter Period
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded border border-neutral-800/80 bg-neutral-900/60 p-2.5">
                <span className="text-neutral-500 text-[10px] uppercase block">Day 1 (Start)</span>
                <span className="text-neutral-100 font-bold block mt-0.5">
                  {formatFriendlyDate(selectedDate)}
                </span>
              </div>
              <div className="rounded border border-neutral-800/80 bg-neutral-900/60 p-2.5">
                <span className="text-neutral-500 text-[10px] uppercase block">Day 112 (Finish)</span>
                <span className="text-neutral-100 font-bold block mt-0.5">
                  {formatFriendlyDate(calculatedEndDate)}
                </span>
              </div>
            </div>

            <div className="text-[11px] text-neutral-400 pt-1 border-t border-neutral-800/80 flex items-center justify-between">
              <span>Duration: 16 Weeks</span>
              <span>112 Total Execution Days</span>
            </div>
          </div>

          {/* Warning notice when changing date */}
          {hasExistingProgress && isDifferentDate && (
            <div className="rounded-lg border border-amber-900/60 bg-amber-950/20 p-3.5 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-semibold">
                <AlertTriangle className="h-4 w-4" />
                <span>Recalculate Timeline Notice</span>
              </div>
              <p className="text-[11px] text-neutral-300 leading-relaxed font-sans">
                Moving your start date from <strong className="text-neutral-100">{startDate}</strong> to <strong className="text-neutral-100">{selectedDate}</strong> will shift all planned calendar dates forward/backward. Your completed task history will be preserved.
              </p>
              <ul className="text-[11px] text-neutral-400 space-y-0.5 list-disc pl-4 font-mono">
                <li>Weekly objectives reposition to new calendar weeks</li>
                <li>Project milestones & CTF schedule adjust</li>
                <li>VULNEX Friday deep work synchronizes to Day 7 of each week</li>
              </ul>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="mt-6 pt-4 border-t border-neutral-800 flex items-center justify-end gap-2.5">
          {!isInitialSetup && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg text-xs text-neutral-400 hover:text-neutral-200 transition font-mono"
            >
              Cancel
            </button>
          )}

          <button
            type="button"
            onClick={handleConfirm}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 text-xs font-semibold text-neutral-950 transition font-mono"
          >
            {isInitialSetup ? (
              <>
                <span>Start Dexter</span>
                <ArrowRight className="h-4 w-4" />
              </>
            ) : hasExistingProgress && isDifferentDate && !confirmRecalculate ? (
              <>
                <span>Review Recalculation</span>
                <ArrowRight className="h-4 w-4" />
              </>
            ) : (
              <>
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Recalculate Plan</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
