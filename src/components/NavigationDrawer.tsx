import React, { useEffect } from 'react';
import { useDexter } from '../context/DexterContext';
import { useAuth } from '../context/AuthContext';
import {
  CheckCircle2,
  Calendar,
  Layers,
  Timer,
  Target,
  FileText,
  Clock,
  Settings,
  X,
  Cloud,
  ChevronRight,
  Shield,
  Activity,
  Flame,
  CalendarDays
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: 'emerald' | 'neutral';
}

interface NavCategory {
  category: string;
  items: NavItem[];
}

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  isOpen,
  onClose,
  currentTab,
  onTabChange
}) => {
  const {
    currentDate,
    currentDayNumber,
    currentWeek,
    currentMonth,
    stats,
    cloudSyncStatus,
    activeTimer,
    activeTimerElapsedSeconds
  } = useDexter();

  const { user } = useAuth();

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background scrolling when open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const navCategories: NavCategory[] = [
    {
      category: 'DAILY EXECUTION',
      items: [
        {
          id: 'today',
          label: 'Today Execution',
          description: `Day ${currentDayNumber} · 4h CPTS Anchor`,
          icon: CheckCircle2,
          badge: stats ? `${stats.completedTasksCount}/${stats.totalTasksCount}` : undefined
        },
        {
          id: 'analytics',
          label: 'Time Analytics & Clockify',
          description: activeTimer ? 'Timer Active Now' : 'Track task sessions & reports',
          icon: Timer,
          badge: activeTimer ? 'Active' : undefined,
          badgeColor: 'emerald'
        }
      ]
    },
    {
      category: 'PLANNING & CALENDAR',
      items: [
        {
          id: 'week',
          label: 'Week View',
          description: `Week ${currentWeek} Schedule`,
          icon: Calendar
        },
        {
          id: 'plan',
          label: '16-Week Master Plan',
          description: '112 Calendar Days Architecture',
          icon: Layers
        }
      ]
    },
    {
      category: 'KPIS & VERIFICATION',
      items: [
        {
          id: 'kpis',
          label: 'KPIs & Task Database',
          description: '11 Core KPIs & 21 System Spec Query',
          icon: Target
        },
        {
          id: 'deliverables',
          label: 'Evidence Vault',
          description: 'Verified outputs, GitHub & URLs',
          icon: FileText
        }
      ]
    },
    {
      category: 'AUDIT & PROTOCOLS',
      items: [
        {
          id: 'reviews',
          label: 'Guided Reviews',
          description: 'Weekly & Monthly Audit Dashboards',
          icon: Clock
        },
        {
          id: 'settings',
          label: 'Settings & Firewall',
          description: 'Opportunity Firewall & Backups',
          icon: Settings
        }
      ]
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ease-out"
        aria-hidden="true"
      />

      {/* Drawer Sidebar Panel */}
      <div
        className="relative z-50 flex h-full w-80 max-w-[85vw] flex-col border-r border-neutral-800 bg-neutral-950 p-0 text-neutral-100 shadow-2xl transition-transform duration-300 ease-out font-mono animate-in slide-in-from-left"
        role="dialog"
        aria-modal="true"
        aria-label="Dexter Navigation Drawer"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-neutral-800/80 px-4 py-3.5 bg-neutral-900/60">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded border border-emerald-500/40 bg-emerald-950/50 text-emerald-400 text-xs font-bold font-mono">
              DX
            </span>
            <div>
              <span className="text-sm font-bold tracking-wider text-neutral-100 uppercase">
                OPERATION DEXTER
              </span>
              <span className="text-[10px] text-neutral-400 block font-mono">
                DAY {currentDayNumber} · WEEK {currentWeek} · MONTH {currentMonth}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100 transition"
            title="Close Menu (Esc)"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Quick System Status Pill */}
        <div className="border-b border-neutral-800/80 bg-neutral-950 px-4 py-2.5 text-[11px]">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>LOCK-IN STATUS</span>
            </span>
            <span className="text-emerald-400 font-bold">NOMINAL</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[10px] text-neutral-500">
            <span>Date: {currentDate}</span>
            <span>Cloud: {cloudSyncStatus === 'synced' ? 'Synced' : 'Active'}</span>
          </div>
        </div>

        {/* Navigation Categories and Links */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4 no-scrollbar">
          {navCategories.map((cat, catIdx) => (
            <div key={catIdx} className="space-y-1">
              <span className="px-2.5 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                {cat.category}
              </span>
              <div className="space-y-0.5 pt-1">
                {cat.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onTabChange(item.id);
                        onClose();
                      }}
                      className={`group flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition ${
                        isActive
                          ? 'border border-emerald-500/30 bg-emerald-950/40 text-emerald-300 font-semibold shadow-sm'
                          : 'border border-transparent text-neutral-300 hover:bg-neutral-900 hover:text-neutral-100'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          className={`h-4 w-4 shrink-0 transition ${
                            isActive ? 'text-emerald-400' : 'text-neutral-400 group-hover:text-emerald-400'
                          }`}
                        />
                        <div className="min-w-0 truncate">
                          <span className="block text-xs truncate leading-tight font-sans font-semibold">
                            {item.label}
                          </span>
                          <span className="block text-[10px] text-neutral-500 truncate leading-tight mt-0.5">
                            {item.description}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        {item.badge && (
                          <span
                            className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                              item.badgeColor === 'emerald'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : 'bg-neutral-800 text-neutral-400'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                        <ChevronRight
                          className={`h-3.5 w-3.5 text-neutral-600 transition ${
                            isActive ? 'text-emerald-400 translate-x-0.5' : 'group-hover:text-neutral-400'
                          }`}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Drawer Bottom Info Footer */}
        <div className="border-t border-neutral-800/80 bg-neutral-900/60 p-3.5 text-[11px] space-y-2">
          {user && (
            <div className="flex items-center justify-between text-neutral-400 text-[10px]">
              <span className="truncate max-w-[170px] text-neutral-300">
                {user.displayName || user.email}
              </span>
              <span className="text-emerald-400">Authenticated</span>
            </div>
          )}
          <div className="text-[10px] text-neutral-500 leading-normal">
            Low-friction personal operating system for Operation Dexter (112 Days).
          </div>
        </div>
      </div>
    </div>
  );
};
