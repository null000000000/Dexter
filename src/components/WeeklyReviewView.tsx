import React, { useState, useEffect } from 'react';
import { useDexter } from '../context/DexterContext';
import { WEEKLY_OBJECTIVES } from '../data/weeklyObjectives';
import { WeeklyReview } from '../types/dexter';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Save,
  Check,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  ArrowRight,
  ArrowLeft,
  FileCheck,
  HelpCircle
} from 'lucide-react';

export const WeeklyReviewView: React.FC = () => {
  const {
    currentWeek,
    saveWeeklyReview,
    getWeeklyReviewForWeek,
    tasks
  } = useDexter();

  const [selectedWeek, setSelectedWeek] = useState<number>(currentWeek);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const weekObj = WEEKLY_OBJECTIVES[selectedWeek - 1] || WEEKLY_OBJECTIVES[0];

  // Tasks in this week
  const weekTasks = tasks.filter((t) => t.weekNumber === selectedWeek);
  const completedTasks = weekTasks.filter((t) => t.status === 'done');
  const missedTasks = weekTasks.filter((t) => t.status !== 'done' && t.status !== 'cancelled');
  const taskPercent = weekTasks.length > 0 ? Math.round((completedTasks.length / weekTasks.length) * 100) : 0;

  // Existing review state
  const existingReview = getWeeklyReviewForWeek(selectedWeek);

  const [step1Completed, setStep1Completed] = useState(
    existingReview?.plannedVsActual || `${completedTasks.length} of ${weekTasks.length} planned tasks verified complete.`
  );
  const [step2Missed, setStep2Missed] = useState(
    existingReview?.delayedTasks || (missedTasks.length === 0 ? 'Zero missed tasks. Full adherence.' : `${missedTasks.length} tasks incomplete.`)
  );
  const [step3Friction, setStep3Friction] = useState(
    existingReview?.friction || ''
  );
  const [step4Move, setStep4Move] = useState(
    existingReview?.restructureDecisions || 'Redistribute missed components into upcoming buffer slots.'
  );
  const [step5Drop, setStep5Drop] = useState(
    existingReview?.capacityIssue || 'No work dropped; capacity sustainable at 6h/day baseline.'
  );
  const [step6NextPlan, setStep6NextPlan] = useState(
    existingReview?.nextWeekObjectives || `Advance to Week ${Math.min(16, selectedWeek + 1)} objectives.`
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync state if week changes
  useEffect(() => {
    const rev = getWeeklyReviewForWeek(selectedWeek);
    if (rev) {
      setStep1Completed(rev.plannedVsActual);
      setStep2Missed(rev.delayedTasks);
      setStep3Friction(rev.friction);
      setStep4Move(rev.restructureDecisions);
      setStep5Drop(rev.capacityIssue);
      setStep6NextPlan(rev.nextWeekObjectives);
    }
  }, [selectedWeek]);

  const handleSaveReview = () => {
    const review: WeeklyReview = {
      weekNumber: selectedWeek,
      startDate: weekObj.startDate || '',
      endDate: weekObj.endDate || '',
      kpiMovement: `Completed ${completedTasks.length}/${weekTasks.length} tasks (${taskPercent}% pace).`,
      plannedVsActual: step1Completed,
      cptsProgress: '24h CPTS progression maintained.',
      ctfProgress: 'CTF targets completed with full writeups.',
      projectProgress: weekObj.projectTarget,
      cs50Progress: weekObj.cs50Target,
      cjcaProgress: weekObj.cjcaTarget,
      mckinseyProgress: weekObj.mckinseyTarget,
      awsProgress: weekObj.awsTarget,
      universityProgress: weekObj.universityTarget,
      vulnexProgress: weekObj.vulnexTarget,
      friction: step3Friction,
      capacityIssue: step5Drop,
      delayedTasks: step2Missed,
      restructureDecisions: step4Move,
      nextWeekObjectives: step6NextPlan,
      completionScorePercent: taskPercent,
      isCompleted: true,
      updatedAt: new Date().toISOString()
    };

    saveWeeklyReview(review);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const STEPS = [
    { number: 1, title: 'What did you complete?' },
    { number: 2, title: 'What was missed or delayed?' },
    { number: 3, title: 'What caused friction?' },
    { number: 4, title: 'What must move?' },
    { number: 5, title: 'What should be removed / dropped?' },
    { number: 6, title: 'Confirm next week’s plan' }
  ];

  return (
    <div className="space-y-6">
      {/* Header & Week Switcher */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-widest">
              <span>Section 25 & 26 System Spec</span>
            </div>
            <h1 className="mt-1 text-2xl font-bold text-neutral-100 tracking-tight">
              Guided Weekly Review (Step-by-Step)
            </h1>
            <p className="mt-0.5 text-xs text-neutral-400">
              Low-friction 6-step guided flow. Audit output, eliminate debt accumulation, and calibrate the upcoming week.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <button
              onClick={() => setSelectedWeek((w) => Math.max(1, w - 1))}
              disabled={selectedWeek <= 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900 text-neutral-300 hover:text-neutral-100 disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="font-bold text-neutral-100 px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800">
              Week {selectedWeek} of 16
            </span>
            <button
              onClick={() => setSelectedWeek((w) => Math.min(16, w + 1))}
              disabled={selectedWeek >= 16}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900 text-neutral-300 hover:text-neutral-100 disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Step Progress Indicators */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs font-mono text-neutral-400 mb-2">
            <span>Step {currentStep} of 6: <strong className="text-emerald-400">{STEPS[currentStep - 1].title}</strong></span>
            <span>Completion: {taskPercent}%</span>
          </div>

          <div className="grid grid-cols-6 gap-1.5">
            {STEPS.map((s) => (
              <button
                key={s.number}
                onClick={() => setCurrentStep(s.number)}
                className={`h-2 rounded-full transition ${
                  s.number === currentStep
                    ? 'bg-emerald-500 ring-2 ring-emerald-500/40'
                    : s.number < currentStep
                    ? 'bg-emerald-700'
                    : 'bg-neutral-800'
                }`}
                title={s.title}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Guided Step Container */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-6 space-y-4">
        {/* STEP 1: What did you complete? */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div>
              <span className="text-xs font-mono text-emerald-400 uppercase font-semibold">Step 1 of 6</span>
              <h2 className="text-lg font-bold text-neutral-100 mt-1">
                What did you complete this week?
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Review your completed deliverables. Verify what actually shipped against Definition of Done.
              </p>
            </div>

            {/* Auto-detected completed deliverables */}
            <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-4">
              <span className="text-[11px] font-mono text-neutral-500 uppercase block mb-2">
                Verified Completed Tasks ({completedTasks.length} / {weekTasks.length}):
              </span>
              {completedTasks.length === 0 ? (
                <p className="text-xs text-neutral-500 italic">No tasks marked complete for Week {selectedWeek} yet.</p>
              ) : (
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-2">
                  {completedTasks.map((t) => (
                    <div key={t.id} className="flex items-center gap-2 text-xs text-neutral-300">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      <span className="font-mono text-emerald-400 uppercase font-bold text-[10px]">{t.kpiId}</span>
                      <span className="truncate">{t.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-mono text-neutral-300 mb-1">
                Your Completion Summary / Key Deliverables:
              </label>
              <textarea
                rows={3}
                value={step1Completed}
                onChange={(e) => setStep1Completed(e.target.value)}
                placeholder="e.g. Delivered Project 1 parser, solved 3 HTB machines, completed CS50 lecture."
                className="w-full rounded-lg border border-neutral-800 bg-neutral-950 p-3 text-xs text-neutral-200 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* STEP 2: What was missed? */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div>
              <span className="text-xs font-mono text-emerald-400 uppercase font-semibold">Step 2 of 6</span>
              <h2 className="text-lg font-bold text-neutral-100 mt-1">
                What was missed or delayed?
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Identify incomplete tasks objectively. Health and unexpected disruptions carry zero moral debt.
              </p>
            </div>

            <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-4">
              <span className="text-[11px] font-mono text-neutral-500 uppercase block mb-2">
                Unfinished Tasks ({missedTasks.length}):
              </span>
              {missedTasks.length === 0 ? (
                <p className="text-xs text-emerald-400 font-mono">Zero uncompleted tasks! 100% adherence.</p>
              ) : (
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-2">
                  {missedTasks.map((t) => (
                    <div key={t.id} className="flex items-center gap-2 text-xs text-neutral-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                      <span className="font-mono text-amber-400 uppercase font-bold text-[10px]">{t.kpiId}</span>
                      <span className="truncate">{t.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-mono text-neutral-300 mb-1">
                Why were these delayed? (Root cause):
              </label>
              <textarea
                rows={3}
                value={step2Missed}
                onChange={(e) => setStep2Missed(e.target.value)}
                placeholder="e.g. Subprocess parsing required more debugging than anticipated."
                className="w-full rounded-lg border border-neutral-800 bg-neutral-950 p-3 text-xs text-neutral-200 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* STEP 3: What caused friction? */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div>
              <span className="text-xs font-mono text-emerald-400 uppercase font-semibold">Step 3 of 6</span>
              <h2 className="text-lg font-bold text-neutral-100 mt-1">
                What caused friction this week?
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Pinpoint tooling snags, cognitive exhaustion, or scheduling friction before they compound.
              </p>
            </div>

            <div>
              <label className="block text-xs font-mono text-neutral-300 mb-1">
                Friction Description:
              </label>
              <textarea
                rows={4}
                value={step3Friction}
                onChange={(e) => setStep3Friction(e.target.value)}
                placeholder="e.g. Setting up AST parser dependencies took 45m longer than planned. Switched to Alpine packages."
                className="w-full rounded-lg border border-neutral-800 bg-neutral-950 p-3 text-xs text-neutral-200 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* STEP 4: What must move? */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <div>
              <span className="text-xs font-mono text-emerald-400 uppercase font-semibold">Step 4 of 6</span>
              <h2 className="text-lg font-bold text-neutral-100 mt-1">
                What must move to upcoming slots?
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Redistribution rule: Protect CPTS 4h and academic deadlines. Shift secondary tasks into open buffers. Never create 12-hour recovery days.
              </p>
            </div>

            <div>
              <label className="block text-xs font-mono text-neutral-300 mb-1">
                Redistribution Decisions:
              </label>
              <textarea
                rows={4}
                value={step4Move}
                onChange={(e) => setStep4Move(e.target.value)}
                placeholder="e.g. Move missed CTF box to Day 2 of Week 3. Keep CPTS on regular 4h cadence."
                className="w-full rounded-lg border border-neutral-800 bg-neutral-950 p-3 text-xs text-neutral-200 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* STEP 5: What should be removed? */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <div>
              <span className="text-xs font-mono text-emerald-400 uppercase font-semibold">Step 5 of 6</span>
              <h2 className="text-lg font-bold text-neutral-100 mt-1">
                What should be removed / simplified?
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                If capacity was squeezed, drop optional derived work first (Brand posts, extra portfolio redesign, extra outreach).
              </p>
            </div>

            <div>
              <label className="block text-xs font-mono text-neutral-300 mb-1">
                Capacity Trimming & Drops:
              </label>
              <textarea
                rows={4}
                value={step5Drop}
                onChange={(e) => setStep5Drop(e.target.value)}
                placeholder="e.g. Dropped extra blog styling to ensure Project 1 test cases were clean."
                className="w-full rounded-lg border border-neutral-800 bg-neutral-950 p-3 text-xs text-neutral-200 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* STEP 6: Confirm next week's plan */}
        {currentStep === 6 && (
          <div className="space-y-4">
            <div>
              <span className="text-xs font-mono text-emerald-400 uppercase font-semibold">Step 6 of 6</span>
              <h2 className="text-lg font-bold text-neutral-100 mt-1">
                Confirm Week {Math.min(16, selectedWeek + 1)} Plan & Calibration
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Lock in your focus for the upcoming week. Ensure all core anchors are primed.
              </p>
            </div>

            <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-4 space-y-2 text-xs">
              <span className="font-mono text-emerald-400 font-bold block uppercase text-[11px]">
                Upcoming Week Objectives:
              </span>
              <p className="text-neutral-300">
                CPTS: 24h contiguous section progress + interactive labs
              </p>
              <p className="text-neutral-400">
                Project Milestone: {WEEKLY_OBJECTIVES[Math.min(15, selectedWeek)].projectTarget}
              </p>
              <p className="text-neutral-400">
                VULNEX Milestone: {WEEKLY_OBJECTIVES[Math.min(15, selectedWeek)].vulnexTarget}
              </p>
            </div>

            <div>
              <label className="block text-xs font-mono text-neutral-300 mb-1">
                Your Calibration Notes for Next Week:
              </label>
              <textarea
                rows={3}
                value={step6NextPlan}
                onChange={(e) => setStep6NextPlan(e.target.value)}
                placeholder="e.g. Maintain strict morning start time for CPTS 4h block."
                className="w-full rounded-lg border border-neutral-800 bg-neutral-950 p-3 text-xs text-neutral-200 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Step Navigation Bar */}
        <div className="pt-4 border-t border-neutral-800 flex items-center justify-between">
          <button
            type="button"
            disabled={currentStep <= 1}
            onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
            className="flex items-center gap-1 px-3.5 py-2 rounded-lg border border-neutral-800 bg-neutral-900 text-xs text-neutral-300 hover:text-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed font-mono transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Previous</span>
          </button>

          {currentStep < 6 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((s) => Math.min(6, s + 1))}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-100 font-bold text-xs font-mono transition"
            >
              <span>Next Step</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSaveReview}
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-bold text-xs font-mono transition shadow-sm"
            >
              <Check className="h-4 w-4 stroke-[3]" />
              <span>Finalize & Save Review</span>
            </button>
          )}
        </div>

        {savedSuccess && (
          <div className="rounded-lg border border-emerald-500/50 bg-emerald-950/40 p-3 text-xs font-mono text-emerald-300 text-center font-bold">
            ✓ Week {selectedWeek} Review saved to persistent storage!
          </div>
        )}
      </div>
    </div>
  );
};
