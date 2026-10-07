import React, { useState } from 'react';
import { useDexter } from '../context/DexterContext';
import { useAuth } from '../context/AuthContext';
import {
  Menu,
  Cloud,
  LogIn,
  LogOut
} from 'lucide-react';
import { StartDateModal } from './StartDateModal';
import { NavigationDrawer } from './NavigationDrawer';

interface HeaderProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, onTabChange }) => {
  const {
    currentDate,
    currentDayNumber,
    currentWeek,
    cloudSyncStatus,
    syncError,
    triggerManualCloudSync
  } = useDexter();

  const { user, signInWithGoogle, signOut, loading: authLoading } = useAuth();

  const [showStartDateModal, setShowStartDateModal] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-neutral-800 bg-neutral-950/95 backdrop-blur-md">
        {/* Top Bar Contract: 3 zones */}
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Zone 1: Sidebar Toggle Button + Wordmark */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Sidebar Drawer Toggle Button */}
            <button
              onClick={() => setShowDrawer(true)}
              className="flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-900/90 px-2.5 py-1.5 text-xs text-neutral-300 hover:border-emerald-500/50 hover:bg-neutral-800 hover:text-emerald-400 font-mono transition shadow-sm group"
              title="Open Navigation Menu (القائمة الجانبية)"
              aria-label="Open Navigation Drawer"
            >
              <Menu className="h-4 w-4 text-emerald-400 group-hover:scale-105 transition-transform" />
              <span className="hidden sm:inline font-bold">MENU</span>
            </button>

            <button
              onClick={() => onTabChange('today')}
              className="group flex items-center gap-2 text-left focus-visible:outline-none"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded border border-emerald-500/30 bg-emerald-950/40 text-emerald-400 font-mono text-xs font-bold transition group-hover:border-emerald-400">
                DX
              </span>
              <div>
                <span className="font-mono text-sm font-semibold tracking-wider text-neutral-100 uppercase transition group-hover:text-emerald-400">
                  OPERATION DEXTER
                </span>
                <span className="hidden xl:inline text-xs text-neutral-500 ml-2 font-mono">
                  16-WEEK LOCK-IN
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: System Subtitle & Active Navigation Pill (Replaces horizontal row) */}
          <div className="hidden md:flex items-center gap-2 font-mono text-xs text-neutral-400">
            <span className="text-neutral-600">/</span>
            <span className="text-emerald-400 font-bold uppercase tracking-wider">
              {currentTab === 'today'
                ? 'TODAY EXECUTION'
                : currentTab === 'week'
                ? 'WEEK SCHEDULE'
                : currentTab === 'plan'
                ? '16-WEEK ROADMAP'
                : currentTab === 'analytics'
                ? 'TIME ANALYTICS'
                : currentTab === 'kpis'
                ? 'KPIS & DATABASE'
                : currentTab === 'deliverables'
                ? 'EVIDENCE VAULT'
                : currentTab === 'reviews'
                ? 'GUIDED REVIEWS'
                : currentTab === 'settings'
                ? 'SETTINGS & FIREWALL'
                : currentTab.toUpperCase()}
            </span>
          </div>

          {/* Zone 3: Active Day Status & Timeline Controls & Cloud Auth */}
          <div className="flex items-center gap-2 font-mono">
            {/* Cloud Sync Status & Auth Control */}
            {user ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => triggerManualCloudSync()}
                  title={
                    cloudSyncStatus === 'synced'
                      ? 'Cloud Synced via Firestore. Click to refresh.'
                      : cloudSyncStatus === 'syncing'
                      ? 'Syncing with Firestore...'
                      : syncError || 'Sync issue. Click to retry.'
                  }
                  className={`flex items-center gap-1.5 rounded-lg border px-2 py-1 text-[11px] transition ${
                    cloudSyncStatus === 'synced'
                      ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300'
                      : cloudSyncStatus === 'syncing'
                      ? 'border-cyan-500/40 bg-cyan-950/30 text-cyan-300 animate-pulse'
                      : 'border-amber-500/40 bg-amber-950/30 text-amber-300'
                  }`}
                >
                  <Cloud className="h-3 w-3 text-emerald-400" />
                  <span className="hidden sm:inline">
                    {cloudSyncStatus === 'synced'
                      ? 'Synced'
                      : cloudSyncStatus === 'syncing'
                      ? 'Syncing'
                      : 'Warning'}
                  </span>
                </button>

                {/* User avatar/name and sign out */}
                <div className="flex items-center gap-1 rounded-lg border border-neutral-800 bg-neutral-900/90 pl-2 pr-1 py-1 text-xs text-neutral-300">
                  <span className="max-w-[75px] sm:max-w-[120px] truncate text-[11px] text-neutral-300">
                    {user.displayName || user.email?.split('@')[0]}
                  </span>
                  <button
                    onClick={() => signOut()}
                    title="Sign Out"
                    className="p-1 text-neutral-400 hover:text-rose-400 transition"
                  >
                    <LogOut className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => signInWithGoogle()}
                disabled={authLoading}
                className="flex items-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-900 px-2.5 py-1 text-xs text-neutral-200 hover:border-emerald-500 hover:text-emerald-300 transition"
                title="Sign in with Google to enable cloud database persistence across devices"
              >
                <LogIn className="h-3.5 w-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}

            {/* Active Day & Start Date Button */}
            <button
              onClick={() => setShowStartDateModal(true)}
              className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900/90 px-2.5 py-1 text-xs text-neutral-300 hover:border-neutral-700 transition"
              title="Click to view or change Dexter Start Date"
            >
              <span className="text-emerald-400 font-bold">Day {currentDayNumber}</span>
              <span className="text-neutral-600">·</span>
              <span className="text-neutral-400">W{currentWeek}</span>
              <span className="text-neutral-600">·</span>
              <span className="text-neutral-200 hidden xl:inline">{currentDate}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Start Date Settings / Recalculation Modal */}
      <StartDateModal
        isOpen={showStartDateModal}
        isInitialSetup={false}
        onClose={() => setShowStartDateModal(false)}
      />

      {/* Side Navigation Drawer */}
      <NavigationDrawer
        isOpen={showDrawer}
        onClose={() => setShowDrawer(false)}
        currentTab={currentTab}
        onTabChange={onTabChange}
      />
    </>
  );
};
