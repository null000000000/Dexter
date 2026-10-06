import React, { useState } from 'react';
import { useDexter } from '../context/DexterContext';
import { StartDateModal } from './StartDateModal';
import { FirewallView } from './FirewallView';
import {
  Calendar,
  ShieldAlert,
  AlertTriangle,
  Download,
  Upload,
  RefreshCw,
  Clock,
  Layers,
  CheckCircle2,
  FileCheck
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    startDate,
    endDate,
    currentDate,
    currentDayNumber,
    exportDataToJson,
    importDataFromJson,
    resetToDefaults
  } = useDexter();

  const [showStartDateModal, setShowStartDateModal] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleExport = () => {
    const jsonStr = exportDataToJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `operation-dexter-state-${currentDate}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    setImportStatus(null);
    if (!importJsonText.trim()) {
      setImportStatus('error: Please paste valid JSON.');
      return;
    }
    const ok = importDataFromJson(importJsonText);
    if (ok) {
      setImportStatus('success: State imported and timeline synchronized.');
      setImportJsonText('');
    } else {
      setImportStatus('error: Corrupted JSON or invalid schema.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Settings Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-100 tracking-tight">
          System Settings & Protocols
        </h1>
        <p className="text-xs text-neutral-400 mt-0.5">
          Configure execution parameters, manage start date recalibration, enforce the opportunity firewall, and backup data.
        </p>
      </div>

      {/* 1. START DATE & 16-WEEK TIMELINE RECALCULATION */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase font-semibold">
              <Calendar className="h-4 w-4" />
              <span>Section 3 & 8 System Spec</span>
            </div>
            <h2 className="text-base font-bold text-neutral-100 mt-0.5">
              Dexter Execution Start Date
            </h2>
            <p className="text-xs text-neutral-400">
              Day 1 begins on your chosen date and anchors the 16-week (112-day) personal operating system.
            </p>
          </div>

          <button
            onClick={() => setShowStartDateModal(true)}
            className="rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 px-4 py-2 text-xs text-neutral-200 font-mono font-semibold transition"
          >
            Change Start Date
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
          <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-3">
            <span className="text-neutral-500 uppercase text-[10px] block">Start Date (Day 1)</span>
            <span className="text-emerald-400 font-bold text-sm block mt-0.5">{startDate || 'Not Set'}</span>
          </div>

          <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-3">
            <span className="text-neutral-500 uppercase text-[10px] block">Calculated End Date (Day 112)</span>
            <span className="text-neutral-200 font-bold text-sm block mt-0.5">{endDate || 'Not Set'}</span>
          </div>

          <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-3">
            <span className="text-neutral-500 uppercase text-[10px] block">Current Execution Position</span>
            <span className="text-neutral-200 font-bold text-sm block mt-0.5">
              Day {currentDayNumber} of 112
            </span>
          </div>
        </div>
      </div>

      {/* 2. OPPORTUNITY-COST FIREWALL & RECOVERY PROTOCOLS */}
      <FirewallView />

      {/* 3. DATA BACKUP & RESTORE */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-4">
        <div className="pb-3 border-b border-neutral-800">
          <h2 className="text-base font-bold text-neutral-100">
            Data Persistence & Portability
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            All your task statuses, focus time sessions, notes, evidence URLs, daily checks, and reviews are stored reliably in the database and browser.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 px-4 py-2 text-xs font-semibold text-neutral-200 font-mono transition"
          >
            <Download className="h-4 w-4 text-emerald-400" />
            <span>Export Complete JSON Backup</span>
          </button>

          <button
            onClick={() => {
              if (confirm('Reset all progress to Day 1 default state? This cannot be undone.')) {
                resetToDefaults();
              }
            }}
            className="flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-950 hover:bg-rose-950/40 text-neutral-400 hover:text-rose-400 px-3.5 py-2 text-xs font-mono transition"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Reset to Clean Slate</span>
          </button>
        </div>

        <div className="pt-2">
          <label className="block text-xs font-mono text-neutral-400 mb-1">
            Import JSON Backup:
          </label>
          <textarea
            rows={3}
            value={importJsonText}
            onChange={(e) => setImportJsonText(e.target.value)}
            placeholder="Paste exported Dexter JSON payload here..."
            className="w-full rounded-lg border border-neutral-800 bg-neutral-950 p-2 text-xs font-mono text-neutral-200 focus:border-emerald-500 focus:outline-none"
          />
          {importStatus && (
            <p className={`mt-1 text-xs font-mono ${importStatus.startsWith('success') ? 'text-emerald-400' : 'text-rose-400'}`}>
              {importStatus}
            </p>
          )}
          <div className="mt-2 flex justify-end">
            <button
              onClick={handleImport}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-4 py-1.5 text-xs font-bold text-neutral-950 font-mono transition"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Apply Backup Import</span>
            </button>
          </div>
        </div>
      </div>

      {/* Start Date Modal */}
      <StartDateModal
        isOpen={showStartDateModal}
        isInitialSetup={false}
        onClose={() => setShowStartDateModal(false)}
      />
    </div>
  );
};
