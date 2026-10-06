import React, { useState } from 'react';
import { useDexter } from '../context/DexterContext';
import { MonthlyReview } from '../types/dexter';
import {
  Layers,
  CheckCircle2,
  Clock,
  ArrowRight,
  Save,
  Check,
  TrendingUp,
  Award,
  Shield,
  FileCheck
} from 'lucide-react';

export const MonthlyDashboardView: React.FC = () => {
  const {
    currentMonth,
    tasks,
    kpis,
    monthlyReviews,
    saveMonthlyReview
  } = useDexter();

  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);

  const MONTHS_CONFIG = [
    {
      monthNumber: 1,
      title: 'Foundation & System Activation',
      weeks: [1, 2, 3, 4],
      focus: 'System activation, Project 1 (Adaptive Recon Framework), 12 CTFs + writeups, AWS sessions 1–20, VULNEX AST parser & testbed, Service definition.',
      deliverable: 'Project 1 working tool + 12 CTF writeups + Evidence Hub.'
    },
    {
      monthNumber: 2,
      title: 'Web Security & Evidence',
      weeks: [5, 6, 7, 8],
      focus: 'Project 2 (Web Security Assessment Lab & Report), 12 CTFs (24 cumulative), AWS completion (sessions 21–40 complete!), VULNEX CVSS & CLI MVP, Offer landing page.',
      deliverable: 'Project 2 Web Assessment Report + AWS Certified Practitioner readiness + 24 CTFs.'
    },
    {
      monthNumber: 3,
      title: 'Active Directory & Professionalization',
      weeks: [9, 10, 11, 12],
      focus: 'Project 3 (AD Assessment Toolkit & Attack-Path Analysis), 12 CTFs (36 cumulative), CJCA completion (30h complete!), McKinsey Forward completion (20h complete!), VULNEX PR engine, Customer outreach.',
      deliverable: 'Project 3 AD Toolkit + CJCA & McKinsey graduated + 36 CTFs.'
    },
    {
      monthNumber: 4,
      title: 'Delivery & Market Launch',
      weeks: [13, 14, 15, 16],
      focus: 'Project 4 (End-to-End Pentest Engagement), 12 CTFs (48 Total!), CS50 completion (14 weeks complete!), CPTS 100% exam readiness, VULNEX 1.0 Final Delivery (96h total), First customer contract.',
      deliverable: 'Complete Dexter Portfolio + 48 CTF writeups + 4 Projects + VULNEX 1.0 + CPTS 100%.'
    }
  ];

  const currentMonthConfig = MONTHS_CONFIG[selectedMonth - 1];

  // Tasks in this month
  const monthTasks = tasks.filter((t) => t.monthNumber === selectedMonth);
  const completedTasks = monthTasks.filter((t) => t.status === 'done');
  const percent = monthTasks.length > 0 ? Math.round((completedTasks.length / monthTasks.length) * 100) : 0;

  // Monthly review state
  const existingReview = monthlyReviews.find((m) => m.monthNumber === selectedMonth);

  const [kpiAssessment, setKpiAssessment] = useState(
    existingReview?.kpiAssessment || `Month ${selectedMonth} progress on track across all active KPIs.`
  );
  const [cptsCumulative, setCptsCumulative] = useState(
    existingReview?.cptsCumulative || `96h planned for Month ${selectedMonth} (${selectedMonth * 96}h cumulative target).`
  );
  const [ctfWriteupsCount, setCtfWriteupsCount] = useState(
    existingReview?.ctfWriteupsCount || `12 boxes target for Month ${selectedMonth} (cumulative ${selectedMonth * 12}/48).`
  );
  const [projectStatus, setProjectStatus] = useState(
    existingReview?.projectStatus || `Project ${selectedMonth} deliverables verified against Definition of Done.`
  );
  const [vulnexStatus, setVulnexStatus] = useState(
    existingReview?.vulnexStatus || `24h continuous deep work completed across 4 Fridays (cumulative ${selectedMonth * 24}/96h).`
  );
  const [portfolioEvidence, setPortfolioEvidence] = useState(
    existingReview?.portfolioEvidence || 'Evidence documents cataloged in local repository.'
  );
  const [brandOutput, setBrandOutput] = useState(
    existingReview?.brandOutput || 'Technical takeaways published from CTFs and project builds.'
  );
  const [customerPipeline, setCustomerPipeline] = useState(
    existingReview?.customerPipeline || 'Service offer definition and outreach tracking active.'
  );
  const [masterTargetComparison, setMasterTargetComparison] = useState(
    existingReview?.masterTargetComparison || 'Adheres strictly to the 4-month master plan.'
  );
  const [saveNotice, setSaveNotice] = useState(false);

  const handleSaveReview = () => {
    const review: MonthlyReview = {
      monthNumber: selectedMonth,
      title: currentMonthConfig.title,
      weeks: currentMonthConfig.weeks,
      kpiAssessment,
      cptsCumulative,
      ctfWriteupsCount,
      projectStatus,
      universityStatus: 'TM112 and TM129 academic tracks on schedule with closures.',
      cs50Status: selectedMonth <= 3 ? 'On schedule (4 weeks/month)' : 'Completed in Week 14',
      cjcaStatus: selectedMonth <= 2 ? 'On schedule (12h/month)' : 'Completed in Week 10',
      awsStatus: selectedMonth === 1 ? 'Sessions 1–20 complete' : selectedMonth === 2 ? 'Completed (Sessions 21–40)' : 'Complete',
      mckinseyStatus: selectedMonth <= 2 ? 'On schedule (8h/month)' : 'Completed in Week 10',
      vulnexStatus,
      portfolioEvidence,
      brandOutput,
      customerPipeline,
      masterTargetComparison,
      isCompleted: true,
      updatedAt: new Date().toISOString()
    };
    saveMonthlyReview(review);
    setSaveNotice(true);
    setTimeout(() => setSaveNotice(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Month Selector Header */}
      <div className="rounded-lg border border-neutral-800 bg-neutral-900/60 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-widest">
              <span>Section 24 & 27 System Spec</span>
            </div>
            <h1 className="mt-1 text-2xl font-bold text-neutral-100 tracking-tight">
              4 Monthly Dashboards & Reviews
            </h1>
            <p className="mt-0.5 text-xs text-neutral-400">
              High-level capability progression: Foundation → Web → Active Directory → Delivery.
            </p>
          </div>

          {/* Month Tabs */}
          <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded border border-neutral-800 font-mono text-xs">
            {MONTHS_CONFIG.map((m) => (
              <button
                key={m.monthNumber}
                onClick={() => setSelectedMonth(m.monthNumber)}
                className={`px-3 py-1.5 rounded transition ${
                  selectedMonth === m.monthNumber
                    ? 'bg-neutral-800 text-emerald-400 font-bold'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Month {m.monthNumber}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Month Banner */}
        <div className="mt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-emerald-400 font-bold">
                MONTH {selectedMonth} · WEEKS {currentMonthConfig.weeks[0]}–{currentMonthConfig.weeks[3]}
              </span>
              {selectedMonth === currentMonth && (
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-1.5 py-0.5 rounded">
                  CURRENT ACTIVE MONTH
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-neutral-100 mt-0.5">
              {currentMonthConfig.title}
            </h2>
            <p className="text-xs text-neutral-300 mt-1 max-w-2xl">
              {currentMonthConfig.focus}
            </p>
          </div>

          <div className="text-right font-mono shrink-0">
            <span className="text-xs text-neutral-400 uppercase block">Monthly Task Progress</span>
            <div className="text-2xl font-bold text-emerald-400 tabular-nums">
              {percent}%
            </div>
            <span className="text-[11px] text-neutral-500">
              {completedTasks.length} / {monthTasks.length} tasks completed
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-2 w-full rounded-full bg-neutral-950 overflow-hidden border border-neutral-800">
          <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${percent}%` }} />
        </div>
      </div>

      {/* Monthly Target Deliverables Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg border border-neutral-800 bg-neutral-900/60 p-4 font-mono text-xs">
          <span className="text-neutral-400 uppercase block text-[11px] mb-1">
            Offensive Security Anchor
          </span>
          <div className="text-sm font-bold text-neutral-100">
            96 Hours CPTS Progression
          </div>
          <p className="text-neutral-400 text-xs mt-1 font-sans">
            4 weeks × 24h/week. Contiguous module progression without reordering.
          </p>
        </div>

        <div className="rounded-lg border border-neutral-800 bg-neutral-900/60 p-4 font-mono text-xs">
          <span className="text-neutral-400 uppercase block text-[11px] mb-1">
            Production Engineering
          </span>
          <div className="text-sm font-bold text-neutral-100">
            Project {selectedMonth}: {currentMonthConfig.deliverable.split('+')[0]}
          </div>
          <p className="text-neutral-400 text-xs mt-1 font-sans">
            6h/week × 4 weeks = 24h total engineering. GitHub repository + case study.
          </p>
        </div>

        <div className="rounded-lg border border-neutral-800 bg-neutral-900/60 p-4 font-mono text-xs">
          <span className="text-neutral-400 uppercase block text-[11px] mb-1">
            CTF Exploitation Practice
          </span>
          <div className="text-sm font-bold text-neutral-100">
            12 HTB Machines + 12 Full Writeups
          </div>
          <p className="text-neutral-400 text-xs mt-1 font-sans">
            3 boxes/week. Writeup is required as part of the Definition of Done.
          </p>
        </div>
      </div>

      {/* Monthly Review Form (Section 27) */}
      <div className="rounded-lg border border-neutral-800 bg-neutral-900/60 p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div>
            <h3 className="text-base font-bold text-neutral-100">
              End-of-Month Review & Audit (Month {selectedMonth})
            </h3>
            <p className="text-xs text-neutral-400">
              Evaluated at the conclusion of Week {currentMonthConfig.weeks[3]} against the 4-month master targets.
            </p>
          </div>
          <button
            onClick={handleSaveReview}
            className="flex items-center gap-1.5 rounded bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-semibold text-neutral-950 transition"
          >
            <Save className="h-3.5 w-3.5" />
            <span>Save Monthly Review</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-mono text-neutral-300 mb-1">
              Overall KPI Movement & Milestone Health:
            </label>
            <textarea
              rows={2}
              value={kpiAssessment}
              onChange={(e) => setKpiAssessment(e.target.value)}
              className="w-full rounded border border-neutral-800 bg-neutral-950 p-2 text-neutral-200 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-mono text-neutral-300 mb-1">
              Cumulative CPTS Hours & Exam Readiness:
            </label>
            <textarea
              rows={2}
              value={cptsCumulative}
              onChange={(e) => setCptsCumulative(e.target.value)}
              className="w-full rounded border border-neutral-800 bg-neutral-950 p-2 text-neutral-200 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-mono text-neutral-300 mb-1">
              CTF Writeup Count & Evidence Quality:
            </label>
            <input
              type="text"
              value={ctfWriteupsCount}
              onChange={(e) => setCtfWriteupsCount(e.target.value)}
              className="w-full rounded border border-neutral-800 bg-neutral-950 p-2 text-neutral-200 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-mono text-neutral-300 mb-1">
              Project {selectedMonth} DoD Verification:
            </label>
            <input
              type="text"
              value={projectStatus}
              onChange={(e) => setProjectStatus(e.target.value)}
              className="w-full rounded border border-neutral-800 bg-neutral-950 p-2 text-neutral-200 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-mono text-neutral-300 mb-1">
              VULNEX Friday Deep Work Progress (24h/month):
            </label>
            <input
              type="text"
              value={vulnexStatus}
              onChange={(e) => setVulnexStatus(e.target.value)}
              className="w-full rounded border border-neutral-800 bg-neutral-950 p-2 text-neutral-200 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-mono text-neutral-300 mb-1">
              Portfolio & Evidence Hub Archive:
            </label>
            <input
              type="text"
              value={portfolioEvidence}
              onChange={(e) => setPortfolioEvidence(e.target.value)}
              className="w-full rounded border border-neutral-800 bg-neutral-950 p-2 text-neutral-200 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-mono text-neutral-300 mb-1">
              Personal Brand Distributions (Evidence-derived):
            </label>
            <input
              type="text"
              value={brandOutput}
              onChange={(e) => setBrandOutput(e.target.value)}
              className="w-full rounded border border-neutral-800 bg-neutral-950 p-2 text-neutral-200 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-mono text-neutral-300 mb-1">
              First Customer Commercial Pipeline:
            </label>
            <input
              type="text"
              value={customerPipeline}
              onChange={(e) => setCustomerPipeline(e.target.value)}
              className="w-full rounded border border-neutral-800 bg-neutral-950 p-2 text-neutral-200 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block font-mono text-neutral-300 mb-1">
              Comparison Against 4-Month Master Objectives:
            </label>
            <textarea
              rows={2}
              value={masterTargetComparison}
              onChange={(e) => setMasterTargetComparison(e.target.value)}
              className="w-full rounded border border-neutral-800 bg-neutral-950 p-2 text-neutral-200 focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="pt-3 border-t border-neutral-800 flex items-center justify-between">
          <span className="text-xs text-neutral-500 font-mono">
            {saveNotice ? (
              <span className="text-emerald-400 font-bold">Month {selectedMonth} Review saved!</span>
            ) : (
              'Save at the end of each 4-week block.'
            )}
          </span>
          <button
            onClick={handleSaveReview}
            className="flex items-center gap-1.5 rounded bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-semibold text-neutral-950 transition"
          >
            <Save className="h-3.5 w-3.5" />
            <span>Save Monthly Review</span>
          </button>
        </div>
      </div>
    </div>
  );
};
