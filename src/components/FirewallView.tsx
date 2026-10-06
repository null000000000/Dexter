import React, { useState } from 'react';
import { useDexter } from '../context/DexterContext';
import { OpportunityFirewallItem } from '../types/dexter';
import {
  ShieldAlert,
  Flame,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Plus,
  Trash2,
  Clock,
  ArrowRight,
  ShieldCheck,
  ZapOff
} from 'lucide-react';

export const FirewallView: React.FC = () => {
  const {
    firewallLogs,
    addFirewallItem,
    deleteFirewallItem,
    currentDate
  } = useDexter();

  const [showAddForm, setShowAddForm] = useState(false);
  const [oppName, setOppName] = useState('');
  const [whatOffers, setWhatOffers] = useState('');
  const [whatConsumes, setWhatConsumes] = useState('');
  const [sacrificedKpi, setSacrificedKpi] = useState('CPTS 4h Anchor or Academic GPA');
  const [decision, setDecision] = useState<'Rejected' | 'Postponed' | 'Accepted (Rare)'>('Rejected');
  const [revisitDate, setRevisitDate] = useState('2027-01-16');
  const [notes, setNotes] = useState('');

  const handleCreateFirewallEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oppName.trim()) return;

    addFirewallItem({
      date: currentDate,
      opportunityName: oppName,
      whatItOffers: whatOffers,
      whatItWouldConsume: whatConsumes,
      sacrificedKpi,
      decision,
      revisitDate,
      notes
    });

    setOppName('');
    setWhatOffers('');
    setWhatConsumes('');
    setNotes('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Firewall Banner */}
      <div className="rounded-lg border border-rose-900/40 bg-gradient-to-r from-neutral-900 via-neutral-900/90 to-rose-950/20 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-rose-400 uppercase tracking-widest">
              <ShieldAlert className="h-4 w-4" />
              <span>Section 32 System Spec</span>
            </div>
            <h1 className="mt-1 text-2xl font-bold text-neutral-100 tracking-tight">
              Opportunity-Cost Firewall
            </h1>
            <p className="mt-0.5 text-xs text-neutral-400">
              The primary shield against scope creep, shiny object syndrome, and cognitive fragmentation.
            </p>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 rounded bg-rose-700 hover:bg-rose-600 px-4 py-2 text-xs font-semibold text-neutral-100 transition shrink-0"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Intercept New Opportunity</span>
          </button>
        </div>

        {/* The Golden Rule */}
        <div className="mt-4 rounded border border-rose-800/40 bg-neutral-950/80 p-4">
          <div className="text-xs font-mono text-rose-400 uppercase font-semibold">
            Non-Negotiable Operating Rule:
          </div>
          <blockquote className="mt-1 text-sm font-semibold text-neutral-100 italic">
            "What will I sacrifice if I accept this? If the sacrifice is unclear or threatens Tier 1 core anchors, postpone or reject it."
          </blockquote>
          <p className="mt-1.5 text-xs text-neutral-400">
            No random courses, no unvetted certifications, no spontaneous hackathons, and no social-media rabbit holes during the 16-week Dexter lock-in.
          </p>
        </div>
      </div>

      {/* Add Opportunity Interception Form */}
      {showAddForm && (
        <form
          onSubmit={handleCreateFirewallEntry}
          className="rounded-lg border border-neutral-800 bg-neutral-900 p-5 space-y-4"
        >
          <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
            <h3 className="text-sm font-bold text-neutral-200 font-mono uppercase">
              Filter Incoming Opportunity Through Firewall
            </h3>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-neutral-400 hover:text-neutral-200 text-xs"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="md:col-span-2">
              <label className="block text-neutral-300 font-mono mb-1">
                Opportunity Name / Description:
              </label>
              <input
                type="text"
                required
                value={oppName}
                onChange={(e) => setOppName(e.target.value)}
                placeholder="e.g. Invitation to join an ad-hoc 48-hour hackathon or buy a new training course."
                className="w-full rounded border border-neutral-800 bg-neutral-950 p-2 text-neutral-200 focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-neutral-300 font-mono mb-1">
                What does it promise / offer?
              </label>
              <input
                type="text"
                value={whatOffers}
                onChange={(e) => setWhatOffers(e.target.value)}
                placeholder="e.g. Extra networking, certificate badge, small prize."
                className="w-full rounded border border-neutral-800 bg-neutral-950 p-2 text-neutral-200 focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-neutral-300 font-mono mb-1">
                What would it consume (hours / mental bandwidth)?
              </label>
              <input
                type="text"
                value={whatConsumes}
                onChange={(e) => setWhatConsumes(e.target.value)}
                placeholder="e.g. 15 hours of focused work over Friday and Saturday."
                className="w-full rounded border border-neutral-800 bg-neutral-950 p-2 text-neutral-200 focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-neutral-300 font-mono mb-1">
                Which Dexter KPI would lose time?
              </label>
              <input
                type="text"
                value={sacrificedKpi}
                onChange={(e) => setSacrificedKpi(e.target.value)}
                placeholder="e.g. CPTS 4h daily anchor + VULNEX Friday deep work."
                className="w-full rounded border border-neutral-800 bg-neutral-950 p-2 text-neutral-200 focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-neutral-300 font-mono mb-1">
                Firewall Verdict:
              </label>
              <select
                value={decision}
                onChange={(e) => setDecision(e.target.value as any)}
                className="w-full rounded border border-neutral-800 bg-neutral-950 p-2 text-neutral-200 focus:border-rose-500 focus:outline-none font-mono"
              >
                <option value="Rejected">REJECTED (Default protocol)</option>
                <option value="Postponed">POSTPONED (Revisit after 15 Jan 2027)</option>
                <option value="Accepted (Rare)">ACCEPTED (Requires explicit trade-off)</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-neutral-300 font-mono mb-1">
                Reasoning & Decision Notes:
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Why is this rejected or postponed? How does this protect the 16-week outcome?"
                className="w-full rounded border border-neutral-800 bg-neutral-950 p-2 text-neutral-200 focus:border-rose-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="rounded bg-rose-700 hover:bg-rose-600 px-4 py-2 text-xs font-semibold text-neutral-100 transition font-mono"
            >
              Enforce Firewall Decision
            </button>
          </div>
        </form>
      )}

      {/* Logged Interceptions */}
      <div className="rounded-lg border border-neutral-800 bg-neutral-900/60 p-5">
        <h3 className="text-base font-bold text-neutral-100 mb-3">
          Intercepted Opportunity Log ({firewallLogs.length})
        </h3>

        {firewallLogs.length === 0 ? (
          <p className="text-xs text-neutral-500 italic">No opportunities logged yet.</p>
        ) : (
          <div className="space-y-3">
            {firewallLogs.map((item) => (
              <div
                key={item.id}
                className="rounded border border-neutral-800 bg-neutral-950/60 p-4 space-y-2 text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                        item.decision === 'Rejected'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : item.decision === 'Postponed'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}
                    >
                      {item.decision.toUpperCase()}
                    </span>
                    <h4 className="font-semibold text-neutral-100 text-sm">
                      {item.opportunityName}
                    </h4>
                  </div>

                  <div className="flex items-center gap-3 text-neutral-500 font-mono text-[11px]">
                    <span>Logged: {item.date}</span>
                    <button
                      onClick={() => deleteFirewallItem(item.id)}
                      className="text-neutral-500 hover:text-rose-400 p-1"
                      title="Remove entry"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-neutral-400 pt-1">
                  <div>
                    <span className="text-neutral-500 font-mono">Offers:</span> {item.whatItOffers}
                  </div>
                  <div>
                    <span className="text-neutral-500 font-mono">Consumes:</span> {item.whatItWouldConsume}
                  </div>
                  <div>
                    <span className="text-rose-400/90 font-mono">Sacrificed KPI:</span> {item.sacrificedKpi}
                  </div>
                  <div>
                    <span className="text-neutral-500 font-mono">Revisit Date:</span> {item.revisitDate}
                  </div>
                </div>

                {item.notes && (
                  <p className="text-neutral-300 bg-neutral-900/80 p-2 rounded border border-neutral-800/80 text-[11px]">
                    {item.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 28 & 29: LOST-DAY RECOVERY & RESTRUCTURE PROTOCOL */}
      <div className="rounded-lg border border-amber-900/40 bg-neutral-900/60 p-5 space-y-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
            <AlertTriangle className="h-4 w-4" />
            <span>Section 28 & 29 System Spec</span>
          </div>
          <h2 className="mt-1 text-lg font-bold text-neutral-100 tracking-tight">
            Lost-Day Recovery & System Restructure Protocol
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Strict algorithmic rules for recovering from missed days or low-completion weeks without creating catastrophic debt.
          </p>
        </div>

        {/* 6-Step Recovery Flowchart */}
        <div className="rounded border border-neutral-800 bg-neutral-950 p-4">
          <h4 className="text-xs font-mono text-emerald-400 uppercase font-bold mb-3">
            Algorithmic Sequence If An Operating Day Is Missed:
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
            <div className="rounded border border-neutral-800 bg-neutral-900 p-2.5">
              <div className="font-mono text-emerald-400 font-bold">Step 1 — Protect CPTS</div>
              <p className="text-neutral-400 mt-1">
                Resume the 4h anchor immediately on the next operating day. Do NOT double to 8h.
              </p>
            </div>

            <div className="rounded border border-neutral-800 bg-neutral-900 p-2.5">
              <div className="font-mono text-emerald-400 font-bold">Step 2 — Protect Academic GPA</div>
              <p className="text-neutral-400 mt-1">
                Maintain University TMA and study requirements. Academic health is Tier 1.
              </p>
            </div>

            <div className="rounded border border-neutral-800 bg-neutral-900 p-2.5">
              <div className="font-mono text-emerald-400 font-bold">Step 3 — Protect Basics</div>
              <p className="text-neutral-400 mt-1">
                Keep parallel tracks (CS50, CJCA, McKinsey, AWS) in their designated slots.
              </p>
            </div>

            <div className="rounded border border-neutral-800 bg-neutral-900 p-2.5">
              <div className="font-mono text-emerald-400 font-bold">Step 4 — Redistribute</div>
              <p className="text-neutral-400 mt-1">
                Move missed CTF or project micro-tasks into remaining buffer slots across the week.
              </p>
            </div>

            <div className="rounded border border-neutral-800 bg-neutral-900 p-2.5">
              <div className="font-mono text-emerald-400 font-bold">Step 5 — Trim Derived Overhead</div>
              <p className="text-neutral-400 mt-1">
                Temporarily drop derived work: Brand posts, Portfolio polishing, or optional Customer work.
              </p>
            </div>

            <div className="rounded border border-rose-900/60 bg-rose-950/20 p-2.5">
              <div className="font-mono text-rose-400 font-bold">Step 6 — NO 12-Hour Days</div>
              <p className="text-neutral-300 mt-1">
                Never create a 12-hour recovery day. Health misses carry zero moral debt.
              </p>
            </div>
          </div>
        </div>

        {/* Restructure Rules by Failure Severity */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="rounded border border-neutral-800 bg-neutral-950/50 p-3">
            <span className="font-mono text-amber-400 font-bold block mb-1">
              If 1 Week &lt; 70% Completion:
            </span>
            <p className="text-neutral-300">
              Do not redesign the system. Identify the specific bottleneck, reduce lower-tier load, and restore execution pace.
            </p>
          </div>

          <div className="rounded border border-neutral-800 bg-neutral-950/50 p-3">
            <span className="font-mono text-amber-400 font-bold block mb-1">
              If 2 Weeks Are Poor:
            </span>
            <p className="text-neutral-300">
              Cut all optional Brand overhead, Customer extras, and extra portfolio design. Focus 100% on Tier 1 and Tier 2.
            </p>
          </div>

          <div className="rounded border border-neutral-800 bg-neutral-950/50 p-3">
            <span className="font-mono text-amber-400 font-bold block mb-1">
              If 3 Weeks Are Poor:
            </span>
            <p className="text-neutral-300">
              Recalculate baseline capacity. Never casually reduce CPTS below the 4h anchor unless extraordinary circumstances occur.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
