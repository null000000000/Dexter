import React, { useState } from 'react';
import { useDexter } from '../context/DexterContext';
import { KPI } from '../types/dexter';
import { VULNEX_TRACK_INFO } from '../data/kpiData';
import { VULNEX_SCHEDULE } from '../data/vulnexData';
import {
  Shield,
  Activity,
  Flame,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Code2,
  Terminal,
  BookOpen,
  Briefcase,
  GraduationCap,
  Cloud,
  Compass,
  Cpu,
  Layers,
  ChevronRight,
  ExternalLink,
  Lock
} from 'lucide-react';

interface DashboardViewProps {
  onNavigateTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigateTab }) => {
  const {
    currentDate,
    currentWeek,
    currentMonth,
    stats,
    kpis,
    tasks
  } = useDexter();

  const [selectedKpi, setSelectedKpi] = useState<KPI | null>(null);
  const [showVulnexDetail, setShowVulnexDetail] = useState(false);

  // Today's summary tasks
  const todayTasks = tasks.filter((t) => t.date === currentDate);
  const todayCompleted = todayTasks.filter((t) => t.status === 'done');
  const isAllTodayDone = todayTasks.length > 0 && todayCompleted.length === todayTasks.length;

  const currentVulnexMilestone = VULNEX_SCHEDULE[currentWeek - 1] || VULNEX_SCHEDULE[0];

  // Icon mapping for KPIs
  const getKpiIcon = (id: string) => {
    switch (id) {
      case 'cpts': return Terminal;
      case 'gpa': return GraduationCap;
      case 'projects': return Code2;
      case 'ctfs': return Shield;
      case 'portfolio': return Layers;
      case 'personal_brand': return Compass;
      case 'first_customer': return Briefcase;
      case 'cjca': return Activity;
      case 'aws': return Cloud;
      case 'mckinsey': return BookOpen;
      case 'cs50': return Cpu;
      default: return Activity;
    }
  };

  return (
    <div className="space-y-6">
      {/* Level 1: Master Operation Header & Vital Stats */}
      <div className="rounded-lg border border-neutral-800 bg-neutral-900/60 p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-neutral-800/80">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-widest">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>OPERATION DEXTER // 16-WEEK LOCK-IN</span>
            </div>
            <h1 className="mt-1 text-2xl font-bold text-neutral-100 tracking-tight">
              4-Month Master Execution Dashboard
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-neutral-400 font-mono">
              <span>Date: {currentDate}</span>
              <span aria-hidden="true" className="text-neutral-700">·</span>
              <span>Dexter Week: <strong className="text-neutral-200">W{currentWeek} of 16</strong></span>
              <span aria-hidden="true" className="text-neutral-700">·</span>
              <span>Month: <strong className="text-neutral-200">M{currentMonth} of 4</strong></span>
              <span aria-hidden="true" className="text-neutral-700">·</span>
              <span>26 Sep 2026 → 15 Jan 2027</span>
            </div>
          </div>

          {/* Quick Execution Action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigateTab('today')}
              className="flex items-center gap-2 rounded bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 text-xs font-semibold text-neutral-950 transition shadow-sm hover:shadow"
            >
              <span>Execute Today's Tasks</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* 4-Month Macro Progress Bar */}
        <div className="mt-4 pt-1">
          <div className="flex items-center justify-between text-xs font-mono mb-1.5">
            <span className="text-neutral-400">16-Week Total Operation Timeline</span>
            <span className="text-neutral-300 font-medium">
              Day <span className="tabular-nums text-emerald-400 font-bold">{stats.daysElapsed}</span> / {stats.totalDays} ({Math.round((stats.daysElapsed / stats.totalDays) * 100)}% elapsed · <span className="tabular-nums">{stats.daysRemaining}</span> days remaining)
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-neutral-950 overflow-hidden border border-neutral-800">
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${Math.min(100, Math.round((stats.daysElapsed / stats.totalDays) * 100))}%` }}
            />
          </div>
        </div>

        {/* High-Level Metric Tiles (Tabular Figures) */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          <div className="rounded border border-neutral-800/80 bg-neutral-950/60 p-3">
            <div className="text-[11px] font-mono text-neutral-400 uppercase">Days Remaining</div>
            <div className="mt-1 text-2xl font-bold font-mono text-neutral-100 tabular-nums">
              {stats.daysRemaining}
            </div>
            <div className="text-[11px] text-neutral-500 mt-0.5">out of 112 days</div>
          </div>

          <div className="rounded border border-neutral-800/80 bg-neutral-950/60 p-3">
            <div className="text-[11px] font-mono text-neutral-400 uppercase">CPTS Target</div>
            <div className="mt-1 text-2xl font-bold font-mono text-emerald-400 tabular-nums">
              {stats.cptsHours.completed}<span className="text-xs text-neutral-500 font-normal">/384h</span>
            </div>
            <div className="text-[11px] text-neutral-500 mt-0.5">24h/week anchor</div>
          </div>

          <div className="rounded border border-neutral-800/80 bg-neutral-950/60 p-3">
            <div className="text-[11px] font-mono text-neutral-400 uppercase">CTFs Solved</div>
            <div className="mt-1 text-2xl font-bold font-mono text-neutral-100 tabular-nums">
              {stats.ctfCount.completed}<span className="text-xs text-neutral-500 font-normal">/48</span>
            </div>
            <div className="text-[11px] text-neutral-500 mt-0.5">{stats.ctfCount.writeups} writeups done</div>
          </div>

          <div className="rounded border border-neutral-800/80 bg-neutral-950/60 p-3">
            <div className="text-[11px] font-mono text-neutral-400 uppercase">Projects Progress</div>
            <div className="mt-1 text-2xl font-bold font-mono text-neutral-100 tabular-nums">
              1<span className="text-xs text-neutral-500 font-normal">/4</span>
            </div>
            <div className="text-[11px] text-neutral-500 mt-0.5">P1 Recon in build</div>
          </div>

          <div className="rounded border border-neutral-800/80 bg-neutral-950/60 p-3">
            <div className="text-[11px] font-mono text-neutral-400 uppercase">VULNEX Deep Work</div>
            <div className="mt-1 text-2xl font-bold font-mono text-cyan-400 tabular-nums">
              {stats.vulnexHours.completed}<span className="text-xs text-neutral-500 font-normal">/96h</span>
            </div>
            <div className="text-[11px] text-neutral-500 mt-0.5">Friday deep track</div>
          </div>

          <div className="rounded border border-neutral-800/80 bg-neutral-950/60 p-3">
            <div className="text-[11px] font-mono text-neutral-400 uppercase">Schedule Adherence</div>
            <div className="mt-1 text-2xl font-bold font-mono text-emerald-400 tabular-nums">
              {stats.adherenceScore}%
            </div>
            <div className="text-[11px] text-neutral-500 mt-0.5">task completion pace</div>
          </div>
        </div>
      </div>

      {/* VULNEX Special Engineering Track Banner (Explicitly NOT KPI #12) */}
      <div className="rounded-lg border border-cyan-900/40 bg-gradient-to-r from-neutral-900 via-neutral-900/90 to-cyan-950/30 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="rounded border border-cyan-500/30 bg-cyan-950/40 p-2 text-cyan-400 mt-0.5">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-neutral-100 font-mono">
                  VULNEX — Autonomous Security Engine
                </h3>
                <span className="text-[10px] font-mono uppercase tracking-wide text-cyan-400 bg-cyan-950/60 border border-cyan-800/40 px-1.5 py-0.5 rounded">
                  Separate Track (Not KPI #12)
                </span>
              </div>
              <p className="mt-1 text-xs text-neutral-400 max-w-2xl">
                6 hours of continuous-context deep work every Friday (outside the 6 operating days). 16 milestones · 96 total hours.
              </p>
              <div className="mt-2 text-xs font-mono text-neutral-300">
                Current W{currentWeek} Milestone: <strong className="text-cyan-300">{currentVulnexMilestone.milestone}</strong> · Status: {currentVulnexMilestone.status}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block font-mono">
              <div className="text-xs text-neutral-400">Total Complete</div>
              <div className="text-lg font-bold text-cyan-400 tabular-nums">
                {stats.vulnexHours.completed} / 96h
              </div>
            </div>
            <button
              onClick={() => setShowVulnexDetail(true)}
              className="flex items-center gap-1.5 rounded border border-cyan-800/60 bg-cyan-950/40 hover:bg-cyan-900/40 px-3 py-1.5 text-xs text-cyan-200 transition"
            >
              <span>View 16 Milestones</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Level 2: The 11 Core KPIs Database Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-bold text-neutral-100 tracking-tight">
              The 11 Official Dexter KPIs
            </h2>
            <p className="text-xs text-neutral-400">
              Single source of truth: 3 Tiers + Derived Outputs. Click any KPI card to inspect Definition of Done & dependencies.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('kpis')}
            className="text-xs font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-mono"
          >
            <span>Full KPI Database</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {kpis.map((kpi) => {
            const Icon = getKpiIcon(kpi.id);
            return (
              <div
                key={kpi.id}
                onClick={() => setSelectedKpi(kpi)}
                className="group cursor-pointer rounded-lg border border-neutral-800 bg-neutral-900/70 p-4 transition hover:border-neutral-700 hover:bg-neutral-900 focus-visible:outline-none"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="rounded border border-neutral-700/80 bg-neutral-800 p-2 text-emerald-400 transition group-hover:border-emerald-500/40">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-[11px] font-mono text-neutral-400">
                        KPI #{kpi.number} · {kpi.priorityTier.split('—')[0].trim()}
                      </div>
                      <h3 className="text-sm font-semibold text-neutral-100 group-hover:text-emerald-400 transition">
                        {kpi.name}
                      </h3>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400">
                    {kpi.status}
                  </span>
                </div>

                <div className="mt-3 text-xs text-neutral-300 line-clamp-2">
                  {kpi.currentProgressDescription}
                </div>

                <div className="mt-3 pt-3 border-t border-neutral-800/80 flex items-center justify-between text-[11px] font-mono text-neutral-400">
                  <span>Target: {kpi.weeklyTarget.split('(')[0].trim()}</span>
                  <span className="text-neutral-500 group-hover:text-neutral-300 flex items-center gap-1">
                    Details <ChevronRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4-Month Master Phases Map */}
      <div className="rounded-lg border border-neutral-800 bg-neutral-900/60 p-5">
        <h2 className="text-base font-bold text-neutral-100 tracking-tight mb-1">
          4-Month Progressive Architecture
        </h2>
        <p className="text-xs text-neutral-400 mb-4">
          Each 4-week block builds directly on preceding capabilities and evidence.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Month 1 */}
          <div className={`rounded border p-3.5 ${currentMonth === 1 ? 'border-emerald-500/50 bg-emerald-950/20' : 'border-neutral-800 bg-neutral-950/40'}`}>
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-emerald-400 font-bold">MONTH 1</span>
              <span className="text-neutral-500">Weeks 1–4</span>
            </div>
            <h4 className="mt-1 text-sm font-semibold text-neutral-200">
              Foundation & System Activation
            </h4>
            <ul className="mt-2.5 space-y-1.5 text-xs text-neutral-400">
              <li>· Project 1: Adaptive Recon Framework</li>
              <li>· 12 CTFs + 12 Full Writeups</li>
              <li>· AWS Sessions 1–20 (Mid-way)</li>
              <li>· VULNEX: AST Parser & GitHub Integration</li>
              <li>· Service definition & Evidence Hub</li>
            </ul>
          </div>

          {/* Month 2 */}
          <div className={`rounded border p-3.5 ${currentMonth === 2 ? 'border-emerald-500/50 bg-emerald-950/20' : 'border-neutral-800 bg-neutral-950/40'}`}>
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-emerald-400 font-bold">MONTH 2</span>
              <span className="text-neutral-500">Weeks 5–8</span>
            </div>
            <h4 className="mt-1 text-sm font-semibold text-neutral-200">
              Web & Evidence
            </h4>
            <ul className="mt-2.5 space-y-1.5 text-xs text-neutral-400">
              <li>· Project 2: Web Security Lab & Report</li>
              <li>· +12 CTFs (24 cumulative)</li>
              <li>· AWS Sessions 21–40 (AWS Complete!)</li>
              <li>· VULNEX: Data-flow analysis & CLI MVP</li>
              <li>· Offer profile & sample pentest report</li>
            </ul>
          </div>

          {/* Month 3 */}
          <div className={`rounded border p-3.5 ${currentMonth === 3 ? 'border-emerald-500/50 bg-emerald-950/20' : 'border-neutral-800 bg-neutral-950/40'}`}>
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-emerald-400 font-bold">MONTH 3</span>
              <span className="text-neutral-500">Weeks 9–12</span>
            </div>
            <h4 className="mt-1 text-sm font-semibold text-neutral-200">
              AD & Professionalization
            </h4>
            <ul className="mt-2.5 space-y-1.5 text-xs text-neutral-400">
              <li>· Project 3: AD Assessment Toolkit</li>
              <li>· +12 CTFs (36 cumulative)</li>
              <li>· CJCA Complete & McKinsey Complete</li>
              <li>· VULNEX: Patch generation & PR engine</li>
              <li>· Customer outreach pipeline active</li>
            </ul>
          </div>

          {/* Month 4 */}
          <div className={`rounded border p-3.5 ${currentMonth === 4 ? 'border-emerald-500/50 bg-emerald-950/20' : 'border-neutral-800 bg-neutral-950/40'}`}>
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-emerald-400 font-bold">MONTH 4</span>
              <span className="text-neutral-500">Weeks 13–16</span>
            </div>
            <h4 className="mt-1 text-sm font-semibold text-neutral-200">
              Delivery & Market Launch
            </h4>
            <ul className="mt-2.5 space-y-1.5 text-xs text-neutral-400">
              <li>· Project 4: End-to-End Pentest Engagement</li>
              <li>· +12 CTFs (48 Total Complete)</li>
              <li>· CS50 Complete (W14) & CPTS 100%</li>
              <li>· VULNEX 1.0 Final Delivery (96h Total)</li>
              <li>· First customer contract push</li>
            </ul>
          </div>
        </div>
      </div>

      {/* KPI Detail Modal Drawer */}
      {selectedKpi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-lg border border-neutral-800 bg-neutral-900 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-4 border-b border-neutral-800">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase">
                  <span>KPI #{selectedKpi.number}</span>
                  <span className="text-neutral-600">·</span>
                  <span>{selectedKpi.priorityTier}</span>
                </div>
                <h3 className="text-lg font-bold text-neutral-100 mt-1">
                  {selectedKpi.name} — {selectedKpi.type}
                </h3>
              </div>
              <button
                onClick={() => setSelectedKpi(null)}
                className="text-neutral-400 hover:text-neutral-200 p-1"
              >
                ✕
              </button>
            </div>

            <div className="mt-5 space-y-4 text-xs text-neutral-300">
              <div className="rounded border border-neutral-800 bg-neutral-950/60 p-3">
                <span className="text-[11px] font-mono text-neutral-400 uppercase block mb-1">
                  Current Execution Status
                </span>
                <p className="text-neutral-200 font-medium">{selectedKpi.currentProgressDescription}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
                <div className="rounded border border-neutral-800 p-3 bg-neutral-950/40">
                  <span className="text-neutral-500 uppercase block text-[10px]">Weekly Cadence</span>
                  <span className="text-neutral-200 mt-0.5 block">{selectedKpi.weeklyTarget}</span>
                </div>
                <div className="rounded border border-neutral-800 p-3 bg-neutral-950/40">
                  <span className="text-neutral-500 uppercase block text-[10px]">Final Target</span>
                  <span className="text-neutral-200 mt-0.5 block">{selectedKpi.finalTarget}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-neutral-200 uppercase font-mono tracking-wider mb-1">
                  Definition of Done
                </h4>
                <p className="rounded border border-neutral-800 bg-neutral-950 p-2.5 text-neutral-300 leading-relaxed">
                  {selectedKpi.definitionOfDone}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-neutral-200 uppercase font-mono tracking-wider mb-1">
                  Evidence Standard
                </h4>
                <p className="text-neutral-400">
                  {selectedKpi.evidence}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-neutral-200 uppercase font-mono tracking-wider mb-1">
                  Dependencies & Non-Negotiable Rules
                </h4>
                <p className="text-neutral-400">
                  {selectedKpi.dependencies}
                </p>
                <p className="mt-1 text-amber-400/90 font-mono text-[11px]">
                  Rule: {selectedKpi.notes}
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-neutral-800 flex justify-end">
              <button
                onClick={() => setSelectedKpi(null)}
                className="px-4 py-2 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VULNEX 16-Milestone Modal */}
      {showVulnexDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-3xl rounded-lg border border-cyan-800/80 bg-neutral-900 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-neutral-800">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase">
                  <span>Engineering Deep Work Track</span>
                  <span className="text-neutral-600">·</span>
                  <span>96 Hours Total</span>
                </div>
                <h3 className="text-lg font-bold text-neutral-100 mt-1 font-mono">
                  VULNEX — 16-Week Friday Roadmap
                </h3>
              </div>
              <button
                onClick={() => setShowVulnexDetail(false)}
                className="text-neutral-400 hover:text-neutral-200 p-1"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-2 text-xs">
              {VULNEX_SCHEDULE.map((m) => (
                <div
                  key={m.weekNumber}
                  className={`rounded border p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    m.weekNumber === currentWeek
                      ? 'border-cyan-500/80 bg-cyan-950/20'
                      : m.status === 'done'
                      ? 'border-neutral-800 bg-neutral-950/60'
                      : 'border-neutral-800/70 bg-neutral-950/30 text-neutral-400'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-cyan-400 font-bold">W{m.weekNumber}</span>
                      <span className="text-neutral-600">·</span>
                      <span className="text-neutral-400">{m.date}</span>
                      <span className="text-neutral-600">·</span>
                      <strong className="text-neutral-200">{m.milestone}</strong>
                    </div>
                    <p className="text-neutral-300 text-xs">{m.expectedOutput}</p>
                    <div className="text-[11px] text-neutral-500 font-mono">
                      DoD: {m.definitionOfDone}
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2 font-mono">
                    <span className={`px-2 py-0.5 rounded text-[11px] ${
                      m.status === 'done' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                      m.status === 'in-progress' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' :
                      'bg-neutral-900 text-neutral-500'
                    }`}>
                      {m.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-3 border-t border-neutral-800 flex justify-end">
              <button
                onClick={() => setShowVulnexDetail(false)}
                className="px-4 py-2 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium"
              >
                Close Roadmap
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
