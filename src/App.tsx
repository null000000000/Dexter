import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { DexterProvider, useDexter } from './context/DexterContext';
import { Header } from './components/Header';
import { DailyExecutionView } from './components/DailyExecutionView';
import { CalendarView } from './components/CalendarView';
import { WeeklyReviewView } from './components/WeeklyReviewView';
import { MonthlyDashboardView } from './components/MonthlyDashboardView';
import { EvidenceVaultView } from './components/EvidenceVaultView';
import { TaskDatabaseView } from './components/TaskDatabaseView';
import { SettingsView } from './components/SettingsView';
import { StartDateModal } from './components/StartDateModal';
import { TimeAnalyticsView } from './components/TimeAnalyticsView';
import { GlobalTimerBar } from './components/GlobalTimerBar';

function DexterApp() {
  // UX Rule: Default destination MUST be 'today'
  const [currentTab, setCurrentTab] = useState<string>('today');
  const [reviewSubTab, setReviewSubTab] = useState<'weekly' | 'monthly'>('weekly');
  const { isConfigured, startDate, endDate, currentDayNumber } = useDexter();

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      <Header currentTab={currentTab} onTabChange={setCurrentTab} />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8">
        {/* First-launch onboarding modal if start date is not configured */}
        <StartDateModal isOpen={!isConfigured} isInitialSetup={true} />

        {currentTab === 'today' && <DailyExecutionView />}

        {currentTab === 'week' && (
          <CalendarView onNavigateTab={setCurrentTab} defaultMode="week" />
        )}

        {currentTab === 'plan' && (
          <CalendarView onNavigateTab={setCurrentTab} defaultMode="plan" />
        )}

        {currentTab === 'analytics' && <TimeAnalyticsView />}

        {currentTab === 'kpis' && <TaskDatabaseView />}

        {currentTab === 'deliverables' && <EvidenceVaultView />}

        {currentTab === 'reviews' && (
          <div className="space-y-6">
            {/* Sub-navigation between Weekly Guided Review and Monthly Dashboards */}
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-1 rounded-lg bg-neutral-900 p-1 border border-neutral-800 text-xs font-mono">
                <button
                  onClick={() => setReviewSubTab('weekly')}
                  className={`px-3 py-1.5 rounded-md transition ${
                    reviewSubTab === 'weekly'
                      ? 'bg-neutral-800 text-emerald-400 font-bold'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  Weekly Guided Review
                </button>
                <button
                  onClick={() => setReviewSubTab('monthly')}
                  className={`px-3 py-1.5 rounded-md transition ${
                    reviewSubTab === 'monthly'
                      ? 'bg-neutral-800 text-emerald-400 font-bold'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  4 Monthly Dashboards & Audits
                </button>
              </div>
            </div>

            {reviewSubTab === 'weekly' ? <WeeklyReviewView /> : <MonthlyDashboardView />}
          </div>
        )}

        {currentTab === 'settings' && <SettingsView />}
      </main>

      {/* Persistent System Footer */}
      <footer className="border-t border-neutral-800/80 bg-neutral-950 py-6 text-center text-xs text-neutral-500 font-mono mb-12">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <span>OPERATION DEXTER // DAY {currentDayNumber} OF 112 ({startDate || '...'} → {endDate || '...'})</span>
          </div>
          <div>
            <span>16-Week Low-Friction Daily Operating System</span>
          </div>
        </div>
      </footer>

      {/* Global Clockify-Inspired Persistent Timer Bar */}
      <GlobalTimerBar />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DexterProvider>
        <DexterApp />
      </DexterProvider>
    </AuthProvider>
  );
}
