import React, { useState } from 'react';
import { useDexter } from '../context/DexterContext';
import { CTF_SCHEDULE } from '../data/ctfData';
import { PROJECTS_SCHEDULE } from '../data/projectData';
import { VULNEX_SCHEDULE } from '../data/vulnexData';
import {
  FileText,
  Shield,
  Code2,
  Cpu,
  ExternalLink,
  CheckCircle2,
  Circle,
  Layers,
  Compass,
  Briefcase,
  Search,
  Filter
} from 'lucide-react';

export const EvidenceVaultView: React.FC = () => {
  const { stats, updateTaskEvidence } = useDexter();

  const [activeTab, setActiveTab] = useState<'ctfs' | 'projects' | 'vulnex' | 'market'>('ctfs');
  const [ctfSearch, setCtfSearch] = useState('');
  const [ctfFilter, setCtfFilter] = useState<'all' | 'solved' | 'unsolved'>('all');

  // Filter CTFs
  const filteredCtfs = CTF_SCHEDULE.filter((ctf) => {
    const matchesSearch = ctf.boxName.toLowerCase().includes(ctfSearch.toLowerCase()) ||
      ctf.skillsFocus.toLowerCase().includes(ctfSearch.toLowerCase());
    if (!matchesSearch) return false;
    if (ctfFilter === 'solved') return ctf.solved;
    if (ctfFilter === 'unsolved') return !ctf.solved;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Evidence Vault Header */}
      <div className="rounded-lg border border-neutral-800 bg-neutral-900/60 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-widest">
              <span>Section 14, 15, 18, 31 & 34 System Spec</span>
            </div>
            <h1 className="mt-1 text-2xl font-bold text-neutral-100 tracking-tight">
              Evidence Vault & Capability Deliverables
            </h1>
            <p className="mt-0.5 text-xs text-neutral-400">
              "Never mark a major deliverable complete without verified evidence." Aggregates all 48 CTF writeups, 4 production projects, and VULNEX milestones.
            </p>
          </div>

          {/* Section Tabs */}
          <div className="flex items-center gap-1 rounded bg-neutral-950 p-1 border border-neutral-800 font-mono text-xs">
            <button
              onClick={() => setActiveTab('ctfs')}
              className={`px-3 py-1.5 rounded transition ${
                activeTab === 'ctfs'
                  ? 'bg-neutral-800 text-emerald-400 font-bold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              48 CTFs
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`px-3 py-1.5 rounded transition ${
                activeTab === 'projects'
                  ? 'bg-neutral-800 text-emerald-400 font-bold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              4 Projects
            </button>
            <button
              onClick={() => setActiveTab('vulnex')}
              className={`px-3 py-1.5 rounded transition ${
                activeTab === 'vulnex'
                  ? 'bg-neutral-800 text-cyan-400 font-bold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              VULNEX (16 Milestones)
            </button>
            <button
              onClick={() => setActiveTab('market')}
              className={`px-3 py-1.5 rounded transition ${
                activeTab === 'market'
                  ? 'bg-neutral-800 text-emerald-400 font-bold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Market & Derived
            </button>
          </div>
        </div>

        {/* Global Evidence Stat Badges */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
          <div className="rounded border border-neutral-800/80 bg-neutral-950/60 p-3">
            <span className="text-neutral-400 uppercase text-[11px] block">CTF Proofs & Writeups</span>
            <div className="mt-1 text-xl font-bold text-emerald-400 tabular-nums">
              {stats.ctfCount.writeups} / 48
            </div>
            <span className="text-[10px] text-neutral-500">3 per week anchor</span>
          </div>

          <div className="rounded border border-neutral-800/80 bg-neutral-950/60 p-3">
            <span className="text-neutral-400 uppercase text-[11px] block">Project Deliverables</span>
            <div className="mt-1 text-xl font-bold text-neutral-100 tabular-nums">
              1 / 4
            </div>
            <span className="text-[10px] text-neutral-500">P1 Adaptive Recon active</span>
          </div>

          <div className="rounded border border-neutral-800/80 bg-neutral-950/60 p-3">
            <span className="text-neutral-400 uppercase text-[11px] block">VULNEX Evidence Commits</span>
            <div className="mt-1 text-xl font-bold text-cyan-400 tabular-nums">
              {stats.vulnexHours.completed / 6} / 16
            </div>
            <span className="text-[10px] text-neutral-500">Friday deep work</span>
          </div>

          <div className="rounded border border-neutral-800/80 bg-neutral-950/60 p-3">
            <span className="text-neutral-400 uppercase text-[11px] block">Evidence Principle</span>
            <div className="mt-1 text-xs text-neutral-300 font-sans font-medium">
              Build → Document → Archive
            </div>
            <span className="text-[10px] text-neutral-500">Zero mock assertions</span>
          </div>
        </div>
      </div>

      {/* TAB 1: 48 CTF MACHINES & WRITEUPS */}
      {activeTab === 'ctfs' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-neutral-100">
                Hack The Box 48-Machine Core Curriculum
              </h2>
              <span className="text-xs text-neutral-500 font-mono">
                ({filteredCtfs.length} shown)
              </span>
            </div>

            {/* Filter & Search */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-neutral-500" />
                <input
                  type="text"
                  placeholder="Search machine or skill..."
                  value={ctfSearch}
                  onChange={(e) => setCtfSearch(e.target.value)}
                  className="rounded border border-neutral-800 bg-neutral-950 pl-8 pr-3 py-1.5 text-xs text-neutral-200 focus:border-emerald-500 focus:outline-none w-48 font-mono"
                />
              </div>

              <div className="flex items-center gap-1 rounded bg-neutral-900 p-0.5 border border-neutral-800 text-[11px] font-mono">
                {(['all', 'solved', 'unsolved'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setCtfFilter(mode)}
                    className={`px-2 py-1 rounded transition uppercase ${
                      ctfFilter === mode
                        ? 'bg-neutral-800 text-emerald-400 font-semibold'
                        : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredCtfs.map((ctf) => (
              <div
                key={ctf.id}
                className={`rounded-lg border p-4 transition ${
                  ctf.solved
                    ? 'border-neutral-800 bg-neutral-900/80'
                    : 'border-neutral-800/80 bg-neutral-950/40 text-neutral-400'
                }`}
              >
                <div className="flex items-start justify-between pb-2 border-b border-neutral-800/80">
                  <div>
                    <div className="flex items-center gap-2 font-mono text-[11px]">
                      <span className="text-emerald-400 font-semibold">W{ctf.weekNumber}</span>
                      <span className="text-neutral-600">·</span>
                      <span className="text-neutral-400">{ctf.dayScheduled}</span>
                      <span className="text-neutral-600">·</span>
                      <span className="text-neutral-500">{ctf.date}</span>
                    </div>
                    <h3 className="text-base font-bold text-neutral-100 mt-0.5">
                      {ctf.boxName}
                    </h3>
                  </div>

                  <div className="flex flex-col items-end gap-1 font-mono text-[10px]">
                    <span className="px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300">
                      {ctf.os}
                    </span>
                    <span className="text-neutral-500">
                      {ctf.difficulty}
                    </span>
                  </div>
                </div>

                <div className="mt-3 text-xs text-neutral-300">
                  <span className="text-neutral-500 font-mono block text-[10px] uppercase">
                    Skills Focus:
                  </span>
                  <p className="mt-0.5 leading-relaxed">{ctf.skillsFocus}</p>
                </div>

                {/* Evidence & Writeup Link */}
                <div className="mt-3 pt-2.5 border-t border-neutral-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-mono text-[11px]">
                    {ctf.solved ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>SOLVED</span>
                      </span>
                    ) : (
                      <span className="text-neutral-500 flex items-center gap-1">
                        <Circle className="h-3.5 w-3.5" />
                        <span>PENDING</span>
                      </span>
                    )}
                  </div>

                  {ctf.writeupUrl ? (
                    <a
                      href={ctf.writeupUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-400 hover:underline flex items-center gap-1 font-mono text-[11px]"
                    >
                      <span>Read Writeup</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <span className="text-neutral-600 font-mono text-[11px]">
                      Writeup Pending
                    </span>
                  )}
                </div>

                {ctf.evidenceNotes && (
                  <div className="mt-2 text-[11px] font-mono text-neutral-400 bg-neutral-950 p-1.5 rounded border border-neutral-800">
                    {ctf.evidenceNotes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: 4 PRODUCTION-GRADE PROJECTS */}
      {activeTab === 'projects' && (
        <div className="space-y-6">
          {PROJECTS_SCHEDULE.map((proj) => (
            <div
              key={proj.projectNumber}
              className="rounded-lg border border-neutral-800 bg-neutral-900/60 p-5 space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-neutral-800">
                <div>
                  <div className="flex items-center gap-2 font-mono text-xs text-emerald-400 uppercase">
                    <span>Project {proj.projectNumber}</span>
                    <span className="text-neutral-600">·</span>
                    <span>Month {proj.monthNumber} (Weeks {proj.weeks[0]}–{proj.weeks[3]})</span>
                    <span className="text-neutral-600">·</span>
                    <span>24h Total Engineering</span>
                  </div>
                  <h3 className="text-lg font-bold text-neutral-100 mt-1">
                    {proj.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2 font-mono text-xs">
                  {proj.githubUrl && (
                    <a
                      href={proj.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 rounded border border-neutral-800 bg-neutral-800 px-2.5 py-1 text-neutral-200 hover:text-emerald-400 transition"
                    >
                      <Code2 className="h-3.5 w-3.5" />
                      <span>GitHub Repo</span>
                    </a>
                  )}
                  {proj.caseStudyUrl && (
                    <a
                      href={proj.caseStudyUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 rounded border border-neutral-800 bg-neutral-800 px-2.5 py-1 text-neutral-200 hover:text-emerald-400 transition"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      <span>Technical Case Study</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Definition of Done */}
              <div className="rounded border border-neutral-800 bg-neutral-950 p-3 text-xs">
                <span className="text-[11px] font-mono text-emerald-400 uppercase font-semibold block mb-1">
                  Project Definition of Done
                </span>
                <p className="text-neutral-300 font-sans leading-relaxed">
                  {proj.definitionOfDone}
                </p>
              </div>

              {/* Weekly Milestone Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                {proj.weeklyMilestones.map((m) => (
                  <div
                    key={m.week}
                    className="rounded border border-neutral-800/80 bg-neutral-950/40 p-3 flex flex-col justify-between"
                  >
                    <div>
                      <div className="font-mono text-emerald-400 font-semibold mb-1">
                        Week {m.week}: {m.title}
                      </div>
                      <ul className="space-y-1 text-neutral-400 text-[11px] mt-2">
                        {m.outputs.map((out, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-neutral-600">·</span>
                            <span>{out}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: VULNEX 16 FRIDAY MILESTONES */}
      {activeTab === 'vulnex' && (
        <div className="space-y-4">
          <div className="rounded border border-cyan-900/60 bg-cyan-950/20 p-4">
            <h3 className="text-sm font-bold font-mono text-cyan-300 uppercase">
              VULNEX Autonomous Security Engine — 96 Hours Deep Work
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              Every Friday: 6 hours continuous context. Follows an end-to-end evolutionary roadmap from AST sandbox parsing through to automated PR creation and public delivery.
            </p>
          </div>

          <div className="space-y-2 text-xs">
            {VULNEX_SCHEDULE.map((m) => (
              <div
                key={m.weekNumber}
                className="rounded-lg border border-neutral-800 bg-neutral-900/60 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-cyan-400 font-bold">W{m.weekNumber}</span>
                    <span className="text-neutral-600">·</span>
                    <span className="text-neutral-400">{m.date}</span>
                    <span className="text-neutral-600">·</span>
                    <h4 className="font-bold text-neutral-100 text-sm">
                      {m.milestone}
                    </h4>
                  </div>
                  <p className="text-neutral-300 text-xs">
                    {m.expectedOutput}
                  </p>
                  <div className="text-[11px] text-neutral-500 font-mono">
                    DoD: {m.definitionOfDone}
                  </div>
                  {m.actualResult && (
                    <div className="text-[11px] text-emerald-400 font-mono mt-1">
                      Result: {m.actualResult}
                    </div>
                  )}
                </div>

                <div className="shrink-0 flex items-center gap-3 font-mono">
                  {m.evidenceUrl && (
                    <a
                      href={m.evidenceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-cyan-400 hover:underline flex items-center gap-1 text-[11px]"
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span>Commit Proof</span>
                    </a>
                  )}
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] ${
                      m.status === 'done'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : m.status === 'in-progress'
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                        : 'bg-neutral-900 text-neutral-500'
                    }`}
                  >
                    {m.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: MARKET & DERIVED PIPELINES */}
      {activeTab === 'market' && (
        <div className="space-y-6">
          {/* Portfolio Pipeline */}
          <div className="rounded-lg border border-neutral-800 bg-neutral-900/60 p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-emerald-400" />
                <h3 className="text-base font-bold text-neutral-100">
                  Evidence-Derived Portfolio Architecture (Section 14 & 18)
                </h3>
              </div>
              <span className="text-xs font-mono text-neutral-400">Zero Independent Overhead</span>
            </div>

            <p className="text-xs text-neutral-300">
              The portfolio is an aggregation layer generated directly from verified work. It demonstrates a progressive technical evolution:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs font-mono pt-2">
              <div className="rounded border border-neutral-800 bg-neutral-950/50 p-3">
                <span className="text-emerald-400 font-bold block mb-1">Month 1: Evidence Hub</span>
                <p className="text-neutral-400 text-xs font-sans">
                  Adaptive Recon tool repository, first 12 writeups, and base portfolio layout.
                </p>
              </div>

              <div className="rounded border border-neutral-800 bg-neutral-950/50 p-3">
                <span className="text-emerald-400 font-bold block mb-1">Month 2: Web Evidence</span>
                <p className="text-neutral-400 text-xs font-sans">
                  Web Security Assessment report artifact and 24 cumulative CTF writeups.
                </p>
              </div>

              <div className="rounded border border-neutral-800 bg-neutral-950/50 p-3">
                <span className="text-emerald-400 font-bold block mb-1">Month 3: AD Case Studies</span>
                <p className="text-neutral-400 text-xs font-sans">
                  Active Directory attack-path analysis, toolkit packaging, and 36 writeups.
                </p>
              </div>

              <div className="rounded border border-neutral-800 bg-neutral-950/50 p-3">
                <span className="text-emerald-400 font-bold block mb-1">Month 4: Final Showcase</span>
                <p className="text-neutral-400 text-xs font-sans">
                  End-to-End Pentest report, 48 writeups, VULNEX 1.0, and public launch.
                </p>
              </div>
            </div>
          </div>

          {/* Personal Brand Pipeline */}
          <div className="rounded-lg border border-neutral-800 bg-neutral-900/60 p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <Compass className="h-4 w-4 text-emerald-400" />
                <h3 className="text-base font-bold text-neutral-100">
                  Personal Brand Distribution (Section 15 & 19)
                </h3>
              </div>
              <span className="text-xs font-mono text-neutral-400">Rule: Build Once → Document → Distribute</span>
            </div>

            <p className="text-xs text-neutral-300">
              Brand content derives strictly from breakthrough moments during CTFs, project architecture decisions, or VULNEX research. No arbitrary motivational posts.
            </p>

            <div className="rounded border border-neutral-800 bg-neutral-950 p-3 text-xs font-mono">
              <div className="text-neutral-400 uppercase text-[10px] mb-1">Production Flow:</div>
              <div className="text-neutral-200">
                CTF Solved → Technical Writeup Created → Key Vulnerability Insight Extracted → High-Signal LinkedIn Post Published
              </div>
            </div>
          </div>

          {/* First Customer Pipeline */}
          <div className="rounded-lg border border-neutral-800 bg-neutral-900/60 p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-emerald-400" />
                <h3 className="text-base font-bold text-neutral-100">
                  First Customer Milestone Pipeline (Section 16 & 20)
                </h3>
              </div>
              <span className="text-xs font-mono text-neutral-400">Proof-Grounded Progression</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="rounded border border-neutral-800 bg-neutral-950/50 p-3">
                <span className="text-emerald-400 font-bold block mb-1">Month 1: Definition</span>
                <p className="text-neutral-400 text-xs font-sans">
                  Define service scope (External attack surface assessment), target customer (early-stage tech), and core pain point.
                </p>
              </div>

              <div className="rounded border border-neutral-800 bg-neutral-950/50 p-3">
                <span className="text-emerald-400 font-bold block mb-1">Month 2: Offer & Profile</span>
                <p className="text-neutral-400 text-xs font-sans">
                  Create clear service brief, sample redacted assessment findings, and professional landing page.
                </p>
              </div>

              <div className="rounded border border-neutral-800 bg-neutral-950/50 p-3">
                <span className="text-emerald-400 font-bold block mb-1">Month 3: Targeted Outreach</span>
                <p className="text-neutral-400 text-xs font-sans">
                  Warm outreach to 15 vetted startup founders/CTOs based on verified attack surface intelligence.
                </p>
              </div>

              <div className="rounded border border-neutral-800 bg-neutral-950/50 p-3">
                <span className="text-emerald-400 font-bold block mb-1">Month 4: Proposal Push</span>
                <p className="text-neutral-400 text-xs font-sans">
                  Deliver commercial assessment proposals, execute discovery calls, and sign initial engagement contract.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
