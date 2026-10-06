import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  DexterTask,
  ExtraTask,
  KPI,
  DailyCheck,
  WeeklyReview,
  MonthlyReview,
  OpportunityFirewallItem,
  TaskStatus,
  ActiveTaskFocus,
  RecoveryRecommendation,
  TimeSession,
  ActiveTimerState
} from '../types/dexter';
import { INITIAL_KPIS } from '../data/kpiData';
import { generateAllDexterTasks, INITIAL_FIREWALL_LOGS } from '../data/initialTasks';
import { addDays, diffDays, getEndExecutionDate } from '../utils/dateUtils';
import { calculateElapsedSeconds } from '../utils/timeUtils';
import { useAuth } from './AuthContext';
import {
  fetchUserCloudData,
  saveUserCloudSettings,
  saveCloudTask,
  saveCloudExtraTask,
  deleteCloudExtraTask,
  saveCloudDailyCheck,
  saveCloudWeeklyReview,
  saveCloudMonthlyReview,
  saveCloudFirewallLog,
  deleteCloudFirewallLog,
  migrateLocalDataToCloud,
  saveCloudTimeSession,
  deleteCloudTimeSession,
  saveCloudActiveTimer
} from '../lib/dexterSyncService';

interface DexterContextType {
  startDate: string | null;
  endDate: string | null;
  isConfigured: boolean;
  currentDate: string;
  currentDayNumber: number;
  currentWeek: number;
  currentMonth: number;
  relativeDayInWeek: number;
  tasks: DexterTask[];
  extraTasks: ExtraTask[];
  kpis: KPI[];
  dailyChecks: DailyCheck[];
  weeklyReviews: WeeklyReview[];
  monthlyReviews: MonthlyReview[];
  firewallLogs: OpportunityFirewallItem[];
  activeTaskFocus: ActiveTaskFocus | null;
  // Time Tracking (Clockify-inspired)
  timeSessions: TimeSession[];
  activeTimer: ActiveTimerState | null;
  activeTimerElapsedSeconds: number;
  longRunningPrompt: {
    isOpen: boolean;
    runningMinutes: number;
    timerState: ActiveTimerState | null;
  } | null;
  confirmStopPrompt: {
    isOpen: boolean;
    pendingAction: () => void;
    currentTaskTitle: string;
  } | null;
  startTaskTimer: (
    taskId: string | null,
    taskTitle: string,
    taskDate: string,
    isExtraTask?: boolean,
    kpiId?: any,
    projectNumber?: number | null
  ) => Promise<boolean>;
  pauseActiveTimer: () => Promise<void>;
  resumeActiveTimer: () => Promise<void>;
  stopActiveTimer: (notes?: string) => Promise<TimeSession | null>;
  discardActiveTimer: () => Promise<void>;
  addManualTimeEntry: (entry: {
    taskId: string | null;
    taskTitle: string;
    taskDate: string;
    durationMinutes: number;
    kpiId?: any;
    projectNumber?: number | null;
    notes?: string;
  }) => Promise<TimeSession>;
  updateTimeSession: (
    sessionId: string,
    updates: {
      totalElapsedSeconds?: number;
      taskTitle?: string;
      notes?: string;
      editReason?: string;
    }
  ) => Promise<void>;
  deleteTimeSession: (sessionId: string) => Promise<void>;
  resolveLongRunningSession: (decision: 'keep' | 'trim-standard' | 'discard') => Promise<void>;
  dismissConfirmStopPrompt: () => void;
  getTimeTrackedForTask: (taskId: string) => number;
  getTimeTrackedForDate: (date: string) => number;
  cloudSyncStatus: 'idle' | 'syncing' | 'synced' | 'error';
  syncError: string | null;
  triggerManualCloudSync: () => Promise<void>;
  migrateToCloud: () => Promise<{ success: boolean; error?: string }>;
  setStartDate: (newStartDate: string, preserveHistory?: boolean) => void;
  setCurrentDate: (date: string) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  updateTaskEvidence: (taskId: string, evidenceUrl?: string, evidenceNotes?: string) => void;
  updateTaskNotes: (taskId: string, notes: string) => void;
  addExtraTask: (task: {
    title: string;
    date: string;
    priority?: 'P1 - High' | 'P2 - Normal' | 'P3 - Low';
    notes?: string;
  }) => void;
  toggleExtraTask: (id: string) => void;
  updateExtraTask: (
    id: string,
    updates: Partial<Omit<ExtraTask, 'id' | 'createdAt'>>
  ) => void;
  deleteExtraTask: (id: string) => void;
  setActiveTaskFocus: (focus: ActiveTaskFocus | null) => void;
  saveDailyCheck: (check: DailyCheck) => void;
  getDailyCheckForDate: (date: string) => DailyCheck | undefined;
  finishDay: (date: string, check: DailyCheck) => void;
  getRecoveryRecommendation: (date: string) => RecoveryRecommendation | null;
  saveWeeklyReview: (review: WeeklyReview) => void;
  getWeeklyReviewForWeek: (weekNumber: number) => WeeklyReview | undefined;
  saveMonthlyReview: (review: MonthlyReview) => void;
  addFirewallItem: (item: Omit<OpportunityFirewallItem, 'id'>) => void;
  deleteFirewallItem: (id: string) => void;
  stats: DexterStats;
  exportDataToJson: () => string;
  importDataFromJson: (jsonStr: string) => boolean;
  resetToDefaults: () => void;
}

export interface DexterStats {
  daysElapsed: number;
  daysRemaining: number;
  totalDays: number;
  overallCompletionPercent: number;
  totalTasksCount: number;
  completedTasksCount: number;
  cptsHours: { completed: number; total: number; percent: number };
  ctfCount: { completed: number; total: number; writeups: number };
  vulnexHours: { completed: number; total: number; percent: number };
  projectMilestones: { completed: number; total: number };
  awsSessions: { completed: number; total: number };
  cs50Weeks: { completed: number; total: number };
  cjcaHours: { completed: number; total: number };
  mckinseyHours: { completed: number; total: number };
  gpaHours: { completed: number; total: number };
  adherenceScore: number;
}

const STORAGE_KEYS = {
  START_DATE: 'dexter_start_date_v3',
  CONFIGURED: 'dexter_configured_v3',
  CURRENT_DATE: 'dexter_current_date_v3',
  TASKS: 'dexter_tasks_v3',
  EXTRA_TASKS: 'dexter_extra_tasks_v3',
  CHECKS: 'dexter_daily_checks_v3',
  REVIEWS_WEEK: 'dexter_weekly_reviews_v3',
  REVIEWS_MONTH: 'dexter_monthly_reviews_v3',
  FIREWALL: 'dexter_firewall_v3',
  ACTIVE_FOCUS: 'dexter_active_focus_v3',
  TIME_SESSIONS: 'dexter_time_sessions_v3',
  ACTIVE_TIMER: 'dexter_active_timer_v3'
};

const DexterContext = createContext<DexterContextType | null>(null);

export const DexterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const [syncError, setSyncError] = useState<string | null>(null);

  // Start date configuration: Default is October 5, 2026 (Day 1)
  const [startDate, setStartDateState] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEYS.START_DATE) || '2026-10-05';
  });

  const [isConfigured, setIsConfigured] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.CONFIGURED) === 'true';
  });

  const [currentDate, setCurrentDate] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_DATE) || startDate || '2026-10-05';
  });

  const [tasks, setTasks] = useState<DexterTask[]>(() => {
    const sDate = localStorage.getItem(STORAGE_KEYS.START_DATE) || '2026-10-05';
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TASKS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load tasks', e);
    }
    return generateAllDexterTasks(sDate);
  });

  const [extraTasks, setExtraTasks] = useState<ExtraTask[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.EXTRA_TASKS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to load extra tasks', e);
    }
    return [];
  });

  const [dailyChecks, setDailyChecks] = useState<DailyCheck[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CHECKS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to load daily checks', e);
    }
    return [];
  });

  const [weeklyReviews, setWeeklyReviews] = useState<WeeklyReview[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.REVIEWS_WEEK);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to load weekly reviews', e);
    }
    return [];
  });

  const [monthlyReviews, setMonthlyReviews] = useState<MonthlyReview[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.REVIEWS_MONTH);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to load monthly reviews', e);
    }
    return [];
  });

  const [firewallLogs, setFirewallLogs] = useState<OpportunityFirewallItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.FIREWALL);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to load firewall logs', e);
    }
    return INITIAL_FIREWALL_LOGS;
  });

  const [activeTaskFocus, setActiveTaskFocus] = useState<ActiveTaskFocus | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ACTIVE_FOCUS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to load active focus', e);
    }
    return null;
  });

  // Time Tracking State
  const [timeSessions, setTimeSessions] = useState<TimeSession[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TIME_SESSIONS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to load time sessions', e);
    }
    return [];
  });

  const [activeTimer, setActiveTimer] = useState<ActiveTimerState | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ACTIVE_TIMER);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to load active timer', e);
    }
    return null;
  });

  const [activeTimerElapsedSeconds, setActiveTimerElapsedSeconds] = useState<number>(0);
  const [longRunningPrompt, setLongRunningPrompt] = useState<{
    isOpen: boolean;
    runningMinutes: number;
    timerState: ActiveTimerState | null;
  } | null>(null);

  const [confirmStopPrompt, setConfirmStopPrompt] = useState<{
    isOpen: boolean;
    pendingAction: () => void;
    currentTaskTitle: string;
  } | null>(null);

  // Calculate End Date: startDate + 111 days (Day 112)
  const endDate = useMemo(() => {
    if (!startDate) return null;
    return getEndExecutionDate(startDate);
  }, [startDate]);

  // Derive Dexter relative coordinates
  const { currentDayNumber, currentWeek, currentMonth, relativeDayInWeek } = useMemo(() => {
    if (!startDate) {
      return { currentDayNumber: 1, currentWeek: 1, currentMonth: 1, relativeDayInWeek: 1 };
    }
    const diff = diffDays(currentDate, startDate);
    const dayNum = Math.max(1, Math.min(112, diff + 1));
    const week = Math.max(1, Math.min(16, Math.floor((dayNum - 1) / 7) + 1));
    const month = Math.max(1, Math.min(4, Math.floor((week - 1) / 4) + 1));
    const dayInWeek = ((dayNum - 1) % 7) + 1;
    return {
      currentDayNumber: dayNum,
      currentWeek: week,
      currentMonth: month,
      relativeDayInWeek: dayInWeek
    };
  }, [currentDate, startDate]);

  // Save changes to localStorage
  useEffect(() => {
    if (startDate) localStorage.setItem(STORAGE_KEYS.START_DATE, startDate);
  }, [startDate]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CONFIGURED, isConfigured ? 'true' : 'false');
  }, [isConfigured]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_DATE, currentDate);
  }, [currentDate]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    } catch (e) {
      console.error('Failed to save tasks', e);
    }
  }, [tasks]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.EXTRA_TASKS, JSON.stringify(extraTasks));
    } catch (e) {
      console.error('Failed to save extra tasks', e);
    }
  }, [extraTasks]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CHECKS, JSON.stringify(dailyChecks));
    } catch (e) {
      console.error('Failed to save checks', e);
    }
  }, [dailyChecks]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.REVIEWS_WEEK, JSON.stringify(weeklyReviews));
    } catch (e) {
      console.error('Failed to save weekly reviews', e);
    }
  }, [weeklyReviews]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.REVIEWS_MONTH, JSON.stringify(monthlyReviews));
    } catch (e) {
      console.error('Failed to save monthly reviews', e);
    }
  }, [monthlyReviews]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.FIREWALL, JSON.stringify(firewallLogs));
    } catch (e) {
      console.error('Failed to save firewall logs', e);
    }
  }, [firewallLogs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_FOCUS, JSON.stringify(activeTaskFocus));
    } catch (e) {
      console.error('Failed to save active focus', e);
    }
  }, [activeTaskFocus]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TIME_SESSIONS, JSON.stringify(timeSessions));
    } catch (e) {
      console.error('Failed to save time sessions', e);
    }
  }, [timeSessions]);

  useEffect(() => {
    try {
      if (activeTimer) {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_TIMER, JSON.stringify(activeTimer));
      } else {
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_TIMER);
      }
    } catch (e) {
      console.error('Failed to save active timer', e);
    }
  }, [activeTimer]);

  // Real-time ticking effect for active running timer (based on UTC timestamps, not increment counter)
  useEffect(() => {
    if (!activeTimer) {
      setActiveTimerElapsedSeconds(0);
      return;
    }

    const updateElapsed = () => {
      const elapsed = calculateElapsedSeconds(
        activeTimer.startTime,
        null,
        activeTimer.pausedIntervals,
        activeTimer.status === 'paused',
        activeTimer.pausedAt
      );
      setActiveTimerElapsedSeconds(elapsed);

      // Long running check: if running continuously for > 4 hours (240 minutes), trigger recovery prompt
      if (activeTimer.status === 'running' && elapsed > 4 * 3600) {
        const runningMins = Math.floor(elapsed / 60);
        setLongRunningPrompt((prev) => {
          if (prev?.isOpen && prev.timerState?.sessionId === activeTimer.sessionId) return prev;
          return {
            isOpen: true,
            runningMinutes: runningMins,
            timerState: activeTimer
          };
        });
      }
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [activeTimer]);

  // Synchronize with Firebase Firestore whenever authenticated user changes
  useEffect(() => {
    if (!user) {
      setCloudSyncStatus('idle');
      return;
    }

    let isCancelled = false;
    const syncWithCloud = async () => {
      setCloudSyncStatus('syncing');
      setSyncError(null);
      try {
        const cloudData = await fetchUserCloudData(user.uid);
        if (isCancelled) return;

        if (cloudData && cloudData.settings) {
          // Cloud profile exists: hydrate client state from cloud
          if (cloudData.settings.startDate) {
            setStartDateState(cloudData.settings.startDate);
          }
          if (cloudData.settings.isConfigured !== undefined) {
            setIsConfigured(cloudData.settings.isConfigured);
          }
          if (cloudData.settings.currentDate) {
            setCurrentDate(cloudData.settings.currentDate);
          }

          if (cloudData.tasks && cloudData.tasks.length > 0) {
            const baseTasks = generateAllDexterTasks(cloudData.settings.startDate || '2026-10-05');
            const taskMap = new Map<string, any>(cloudData.tasks.map((t: any) => [t.id, t]));
            const merged = baseTasks.map((t) => {
              const saved = taskMap.get(t.id);
              if (saved) {
                return {
                  ...t,
                  status: saved.status,
                  evidenceUrl: saved.evidenceUrl || t.evidenceUrl,
                  evidenceNotes: saved.evidenceNotes || t.evidenceNotes,
                  userNotes: saved.userNotes || t.userNotes,
                  completedAt: saved.completedAt || t.completedAt
                };
              }
              return t;
            });
            setTasks(merged);
          }

          if (cloudData.extraTasks) {
            setExtraTasks(cloudData.extraTasks);
          }
          if (cloudData.dailyChecks) {
            setDailyChecks(cloudData.dailyChecks);
          }
          if (cloudData.weeklyReviews) {
            setWeeklyReviews(cloudData.weeklyReviews);
          }
          if (cloudData.monthlyReviews) {
            setMonthlyReviews(cloudData.monthlyReviews);
          }
          if (cloudData.firewallLogs) {
            setFirewallLogs(cloudData.firewallLogs);
          }
          if (cloudData.timeSessions && cloudData.timeSessions.length > 0) {
            setTimeSessions(cloudData.timeSessions);
          }
          if (cloudData.activeTimer !== undefined) {
            setActiveTimer(cloudData.activeTimer);
          }
          setCloudSyncStatus('synced');
        } else {
          // First-time sign-in with no cloud documents yet: safely migrate existing local state!
          const res = await migrateLocalDataToCloud(user.uid, {
            startDate: startDate || '2026-10-05',
            isConfigured,
            currentDate,
            tasks,
            extraTasks,
            dailyChecks,
            weeklyReviews,
            monthlyReviews,
            firewallLogs,
            timeSessions,
            activeTimer
          });
          if (isCancelled) return;
          if (res.success) {
            setCloudSyncStatus('synced');
          } else {
            setCloudSyncStatus('error');
            setSyncError(res.error || 'Failed to initialize cloud record');
          }
        }
      } catch (err: any) {
        if (isCancelled) return;
        console.error('Error in cloud hydration:', err);
        setCloudSyncStatus('error');
        setSyncError(err.message || 'Cloud sync failed');
      }
    };

    syncWithCloud();

    return () => {
      isCancelled = true;
    };
  }, [user]);

  // Set start date and recalculate plan
  const setStartDate = (newStartDate: string, preserveHistory: boolean = true) => {
    setStartDateState(newStartDate);
    setIsConfigured(true);
    setCurrentDate(newStartDate); // jump to Day 1

    setTasks((prev) => {
      const updated = generateAllDexterTasks(newStartDate, preserveHistory ? prev : undefined);
      if (user) {
        saveUserCloudSettings(user.uid, {
          startDate: newStartDate,
          isConfigured: true,
          currentDate: newStartDate
        }).catch((e) => console.error(e));
      }
      return updated;
    });
  };

  // Task update handlers (Fast 1-click optimistic update + cloud sync)
  const updateTaskStatus = (taskId: string, status: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const nowStr = new Date().toISOString();
          const updated: DexterTask = {
            ...t,
            status,
            completedAt: status === 'done' ? nowStr : undefined
          };
          if (user) {
            saveCloudTask(user.uid, updated).catch((e) => console.error(e));
          }
          return updated;
        }
        return t;
      })
    );

    // If active focus matches this task and marked done, clear active focus
    if (activeTaskFocus?.taskId === taskId && status === 'done') {
      setActiveTaskFocus(null);
    }
  };

  const updateTaskEvidence = (taskId: string, evidenceUrl?: string, evidenceNotes?: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const updated: DexterTask = {
            ...t,
            evidenceUrl: evidenceUrl !== undefined ? evidenceUrl : t.evidenceUrl,
            evidenceNotes: evidenceNotes !== undefined ? evidenceNotes : t.evidenceNotes
          };
          if (user) {
            saveCloudTask(user.uid, updated).catch((e) => console.error(e));
          }
          return updated;
        }
        return t;
      })
    );
  };

  const updateTaskNotes = (taskId: string, notes: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const updated: DexterTask = { ...t, userNotes: notes };
          if (user) {
            saveCloudTask(user.uid, updated).catch((e) => console.error(e));
          }
          return updated;
        }
        return t;
      })
    );
  };

  const addExtraTask = (taskData: {
    title: string;
    date: string;
    priority?: 'P1 - High' | 'P2 - Normal' | 'P3 - Low';
    notes?: string;
  }) => {
    const newTask: ExtraTask = {
      id: `extra-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: taskData.title.trim(),
      date: taskData.date,
      completed: false,
      createdAt: new Date().toISOString(),
      priority: taskData.priority || 'P2 - Normal',
      notes: taskData.notes?.trim() || ''
    };
    setExtraTasks((prev) => [newTask, ...prev]);
    if (user) {
      saveCloudExtraTask(user.uid, newTask).catch((e) => console.error(e));
    }
  };

  const toggleExtraTask = (id: string) => {
    setExtraTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const updated = { ...t, completed: !t.completed };
          if (user) {
            saveCloudExtraTask(user.uid, updated).catch((e) => console.error(e));
          }
          return updated;
        }
        return t;
      })
    );
  };

  const updateExtraTask = (
    id: string,
    updates: Partial<Omit<ExtraTask, 'id' | 'createdAt'>>
  ) => {
    setExtraTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const updated = { ...t, ...updates };
          if (user) {
            saveCloudExtraTask(user.uid, updated).catch((e) => console.error(e));
          }
          return updated;
        }
        return t;
      })
    );
  };

  const deleteExtraTask = (id: string) => {
    setExtraTasks((prev) => prev.filter((t) => t.id !== id));
    if (user) {
      deleteCloudExtraTask(user.uid, id).catch((e) => console.error(e));
    }
  };

  const saveDailyCheck = (check: DailyCheck) => {
    setDailyChecks((prev) => {
      const filtered = prev.filter((c) => c.date !== check.date);
      return [check, ...filtered];
    });
    if (user) {
      saveCloudDailyCheck(user.uid, check).catch((e) => console.error(e));
    }
  };

  const getDailyCheckForDate = (date: string) => {
    return dailyChecks.find((c) => c.date === date);
  };

  // Finish Day: Save check, record completion, and advance to next day
  const finishDay = (date: string, check: DailyCheck) => {
    const finishedCheck: DailyCheck = {
      ...check,
      finishedAt: new Date().toISOString()
    };
    saveDailyCheck(finishedCheck);

    // Advance to next day if within range
    if (startDate) {
      const nextDate = addDays(date, 1);
      const endD = getEndExecutionDate(startDate);
      if (nextDate <= endD) {
        setCurrentDate(nextDate);
        if (user) {
          saveUserCloudSettings(user.uid, {
            startDate,
            isConfigured,
            currentDate: nextDate
          }).catch((e) => console.error(e));
        }
      }
    }
  };

  // Intelligent Recovery Calculation for a day
  const getRecoveryRecommendation = (date: string): RecoveryRecommendation | null => {
    if (!startDate) return null;
    const prevDate = addDays(date, -1);
    if (prevDate < startDate) return null;

    const prevTasks = tasks.filter((t) => t.date === prevDate);
    const uncompleted = prevTasks.filter((t) => t.status !== 'done' && t.status !== 'cancelled');

    if (uncompleted.length === 0) return null;

    const keepItems: string[] = [];
    const moveItems: string[] = [];
    const dropItems: string[] = [];

    uncompleted.forEach((t) => {
      if (t.kpiId === 'cpts') {
        keepItems.push(`CPTS 4h Anchor: Resume standard 4h block today. (Never double to 8h).`);
      } else if (t.kpiId === 'gpa') {
        keepItems.push(`University Study: Protect academic deadline; review in upcoming study day.`);
      } else if (t.kpiId === 'projects' || t.kpiId === 'ctfs' || t.kpiId === 'cs50') {
        moveItems.push(`${t.title}: Shift deliverable to weekend or buffer slot.`);
      } else {
        dropItems.push(`${t.title}: Trim optional derived overhead to keep core anchors intact.`);
      }
    });

    return {
      date: prevDate,
      missedTaskCount: uncompleted.length,
      keepItems,
      moveItems,
      dropItems,
      guidanceText: 'Protect CPTS and academic deadlines first. Never schedule a 12-hour recovery day.'
    };
  };

  const saveWeeklyReview = (review: WeeklyReview) => {
    setWeeklyReviews((prev) => {
      const filtered = prev.filter((r) => r.weekNumber !== review.weekNumber);
      return [review, ...filtered];
    });
    if (user) {
      saveCloudWeeklyReview(user.uid, review).catch((e) => console.error(e));
    }
  };

  const getWeeklyReviewForWeek = (weekNumber: number) => {
    return weeklyReviews.find((r) => r.weekNumber === weekNumber);
  };

  const saveMonthlyReview = (review: MonthlyReview) => {
    setMonthlyReviews((prev) => {
      const filtered = prev.filter((m) => m.monthNumber !== review.monthNumber);
      return [review, ...filtered];
    });
    if (user) {
      saveCloudMonthlyReview(user.uid, review).catch((e) => console.error(e));
    }
  };

  const addFirewallItem = (item: Omit<OpportunityFirewallItem, 'id'>) => {
    const newItem: OpportunityFirewallItem = {
      ...item,
      id: `fw-${Date.now()}`
    };
    setFirewallLogs((prev) => [newItem, ...prev]);
    if (user) {
      saveCloudFirewallLog(user.uid, newItem).catch((e) => console.error(e));
    }
  };

  const deleteFirewallItem = (id: string) => {
    setFirewallLogs((prev) => prev.filter((item) => item.id !== id));
    if (user) {
      deleteCloudFirewallLog(user.uid, id).catch((e) => console.error(e));
    }
  };

  // --- TIME TRACKING METHODS (Clockify-inspired) ---

  const getTimeTrackedForTask = (taskId: string): number => {
    const historical = timeSessions
      .filter((s) => s.taskId === taskId && s.status === 'completed')
      .reduce((sum, s) => sum + s.totalElapsedSeconds, 0);

    const currentRunning =
      activeTimer && activeTimer.taskId === taskId
        ? activeTimerElapsedSeconds
        : 0;

    return historical + currentRunning;
  };

  const getTimeTrackedForDate = (date: string): number => {
    const historical = timeSessions
      .filter((s) => s.taskDate === date && s.status === 'completed')
      .reduce((sum, s) => sum + s.totalElapsedSeconds, 0);

    const currentRunning =
      activeTimer && activeTimer.taskDate === date
        ? activeTimerElapsedSeconds
        : 0;

    return historical + currentRunning;
  };

  /**
   * Start timer for a task.
   * If another timer is running, requires explicit decision (shows confirmStopPrompt).
   */
  const startTaskTimer = async (
    taskId: string | null,
    taskTitle: string,
    taskDate: string,
    isExtraTask: boolean = false,
    kpiId?: any,
    projectNumber?: number | null
  ): Promise<boolean> => {
    if (activeTimer) {
      if (activeTimer.taskId === taskId) {
        // Already active on this task
        if (activeTimer.status === 'paused') {
          await resumeActiveTimer();
        }
        return true;
      }

      // Another timer is active: prompt user for decision
      setConfirmStopPrompt({
        isOpen: true,
        currentTaskTitle: activeTimer.taskTitle,
        pendingAction: async () => {
          await stopActiveTimer();
          await executeStartTimer(taskId, taskTitle, taskDate, isExtraTask, kpiId, projectNumber);
        }
      });
      return false;
    }

    return await executeStartTimer(taskId, taskTitle, taskDate, isExtraTask, kpiId, projectNumber);
  };

  const executeStartTimer = async (
    taskId: string | null,
    taskTitle: string,
    taskDate: string,
    isExtraTask: boolean = false,
    kpiId?: any,
    projectNumber?: number | null
  ): Promise<boolean> => {
    const nowIso = new Date().toISOString();
    const sessionId = `timer-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    const newTimerState: ActiveTimerState = {
      sessionId,
      taskId,
      taskTitle: taskTitle || 'Untracked Task',
      taskDate: taskDate || currentDate,
      isExtraTask,
      kpiId: kpiId || null,
      projectNumber: projectNumber || null,
      startTime: nowIso,
      status: 'running',
      accumulatedActiveSeconds: 0,
      pausedIntervals: []
    };

    setActiveTimer(newTimerState);
    setActiveTimerElapsedSeconds(0);

    if (user) {
      saveCloudActiveTimer(user.uid, newTimerState).catch((e) => console.error(e));
    }
    return true;
  };

  const pauseActiveTimer = async (): Promise<void> => {
    if (!activeTimer || activeTimer.status !== 'running') return;
    const nowIso = new Date().toISOString();

    const updated: ActiveTimerState = {
      ...activeTimer,
      status: 'paused',
      pausedAt: nowIso
    };

    setActiveTimer(updated);
    if (user) {
      saveCloudActiveTimer(user.uid, updated).catch((e) => console.error(e));
    }
  };

  const resumeActiveTimer = async (): Promise<void> => {
    if (!activeTimer || activeTimer.status !== 'paused') return;
    const nowIso = new Date().toISOString();
    const pausedAtIso = activeTimer.pausedAt || nowIso;

    const pauseDurationSeconds = Math.max(
      0,
      Math.floor((new Date(nowIso).getTime() - new Date(pausedAtIso).getTime()) / 1000)
    );

    const newIntervals = [
      ...activeTimer.pausedIntervals,
      {
        pausedAt: pausedAtIso,
        resumedAt: nowIso,
        durationSeconds: pauseDurationSeconds
      }
    ];

    const updated: ActiveTimerState = {
      ...activeTimer,
      status: 'running',
      pausedAt: null,
      pausedIntervals: newIntervals
    };

    setActiveTimer(updated);
    if (user) {
      saveCloudActiveTimer(user.uid, updated).catch((e) => console.error(e));
    }
  };

  const stopActiveTimer = async (notes?: string): Promise<TimeSession | null> => {
    if (!activeTimer) return null;
    const nowIso = new Date().toISOString();

    // Calculate definitive elapsed active focus duration
    const finalElapsedSeconds = calculateElapsedSeconds(
      activeTimer.startTime,
      nowIso,
      activeTimer.pausedIntervals,
      activeTimer.status === 'paused',
      activeTimer.pausedAt,
      nowIso
    );

    // If timer was running for less than 5 seconds and cancelled, ignore tiny accidental clicks
    if (finalElapsedSeconds < 5) {
      await discardActiveTimer();
      return null;
    }

    const session: TimeSession = {
      id: activeTimer.sessionId,
      userId: user?.uid || 'local',
      taskId: activeTimer.taskId,
      taskTitle: activeTimer.taskTitle,
      taskDate: activeTimer.taskDate,
      isExtraTask: activeTimer.isExtraTask,
      kpiId: activeTimer.kpiId,
      projectNumber: activeTimer.projectNumber,
      startTime: activeTimer.startTime,
      endTime: nowIso,
      totalElapsedSeconds: finalElapsedSeconds,
      status: 'completed',
      source: 'timer',
      pausedIntervals: activeTimer.pausedIntervals,
      notes: notes || activeTimer.notes || '',
      createdAt: activeTimer.startTime,
      updatedAt: nowIso
    };

    setTimeSessions((prev) => [session, ...prev]);
    setActiveTimer(null);
    setActiveTimerElapsedSeconds(0);
    setLongRunningPrompt(null);

    if (user) {
      await saveCloudTimeSession(user.uid, session).catch((e) => console.error(e));
      await saveCloudActiveTimer(user.uid, null).catch((e) => console.error(e));
    }

    return session;
  };

  const discardActiveTimer = async (): Promise<void> => {
    setActiveTimer(null);
    setActiveTimerElapsedSeconds(0);
    setLongRunningPrompt(null);
    if (user) {
      saveCloudActiveTimer(user.uid, null).catch((e) => console.error(e));
    }
  };

  const addManualTimeEntry = async (entry: {
    taskId: string | null;
    taskTitle: string;
    taskDate: string;
    durationMinutes: number;
    kpiId?: any;
    projectNumber?: number | null;
    notes?: string;
  }): Promise<TimeSession> => {
    const nowIso = new Date().toISOString();
    const sessionId = `manual-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const totalSeconds = Math.max(60, Math.round(entry.durationMinutes * 60));

    // Calculate synthetic start time based on task date and duration
    const session: TimeSession = {
      id: sessionId,
      userId: user?.uid || 'local',
      taskId: entry.taskId,
      taskTitle: entry.taskTitle.trim() || 'Manual Work Entry',
      taskDate: entry.taskDate,
      kpiId: entry.kpiId || null,
      projectNumber: entry.projectNumber || null,
      startTime: nowIso,
      endTime: nowIso,
      totalElapsedSeconds: totalSeconds,
      status: 'completed',
      source: 'manual',
      pausedIntervals: [],
      notes: entry.notes?.trim() || '',
      createdAt: nowIso,
      updatedAt: nowIso
    };

    setTimeSessions((prev) => [session, ...prev]);
    if (user) {
      await saveCloudTimeSession(user.uid, session).catch((e) => console.error(e));
    }
    return session;
  };

  const updateTimeSession = async (
    sessionId: string,
    updates: {
      totalElapsedSeconds?: number;
      taskTitle?: string;
      notes?: string;
      editReason?: string;
    }
  ): Promise<void> => {
    const nowIso = new Date().toISOString();
    let updatedRecord: TimeSession | null = null;

    setTimeSessions((prev) =>
      prev.map((s) => {
        if (s.id === sessionId) {
          const wasEdited =
            updates.totalElapsedSeconds !== undefined &&
            updates.totalElapsedSeconds !== s.totalElapsedSeconds;

          updatedRecord = {
            ...s,
            taskTitle: updates.taskTitle !== undefined ? updates.taskTitle : s.taskTitle,
            totalElapsedSeconds:
              updates.totalElapsedSeconds !== undefined
                ? updates.totalElapsedSeconds
                : s.totalElapsedSeconds,
            notes: updates.notes !== undefined ? updates.notes : s.notes,
            wasManuallyEdited: wasEdited ? true : s.wasManuallyEdited,
            editReason: updates.editReason || s.editReason,
            updatedAt: nowIso
          };
          return updatedRecord;
        }
        return s;
      })
    );

    if (user && updatedRecord) {
      await saveCloudTimeSession(user.uid, updatedRecord).catch((e) => console.error(e));
    }
  };

  const deleteTimeSession = async (sessionId: string): Promise<void> => {
    setTimeSessions((prev) => prev.filter((s) => s.id !== sessionId));
    if (user) {
      await deleteCloudTimeSession(user.uid, sessionId).catch((e) => console.error(e));
    }
  };

  const resolveLongRunningSession = async (
    decision: 'keep' | 'trim-standard' | 'discard'
  ): Promise<void> => {
    if (!longRunningPrompt || !activeTimer) return;

    if (decision === 'discard') {
      await discardActiveTimer();
    } else if (decision === 'trim-standard') {
      // Trim to standard 2-hour deep work session (7200 seconds)
      const nowIso = new Date().toISOString();
      const session: TimeSession = {
        id: activeTimer.sessionId,
        userId: user?.uid || 'local',
        taskId: activeTimer.taskId,
        taskTitle: activeTimer.taskTitle,
        taskDate: activeTimer.taskDate,
        isExtraTask: activeTimer.isExtraTask,
        kpiId: activeTimer.kpiId,
        projectNumber: activeTimer.projectNumber,
        startTime: activeTimer.startTime,
        endTime: nowIso,
        totalElapsedSeconds: 7200,
        status: 'completed',
        source: 'timer',
        pausedIntervals: activeTimer.pausedIntervals,
        notes: `${activeTimer.notes || ''} [Trimmed from long-running session]`.trim(),
        wasManuallyEdited: true,
        editReason: 'Trimmed long-running overnight session to 2 hours standard',
        createdAt: activeTimer.startTime,
        updatedAt: nowIso
      };

      setTimeSessions((prev) => [session, ...prev]);
      setActiveTimer(null);
      setActiveTimerElapsedSeconds(0);
      if (user) {
        await saveCloudTimeSession(user.uid, session).catch((e) => console.error(e));
        await saveCloudActiveTimer(user.uid, null).catch((e) => console.error(e));
      }
    } else {
      // keep: stop normally with recorded time
      await stopActiveTimer('Confirmed full session duration');
    }

    setLongRunningPrompt(null);
  };

  const dismissConfirmStopPrompt = () => {
    setConfirmStopPrompt(null);
  };

  const migrateToCloud = async (): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'User is not signed in.' };
    setCloudSyncStatus('syncing');
    setSyncError(null);
    const res = await migrateLocalDataToCloud(user.uid, {
      startDate: startDate || '2026-10-05',
      isConfigured,
      currentDate,
      tasks,
      extraTasks,
      dailyChecks,
      weeklyReviews,
      monthlyReviews,
      firewallLogs,
      timeSessions,
      activeTimer
    });
    if (res.success) {
      setCloudSyncStatus('synced');
    } else {
      setCloudSyncStatus('error');
      setSyncError(res.error || 'Migration failed');
    }
    return res;
  };

  const triggerManualCloudSync = async (): Promise<void> => {
    if (!user) return;
    setCloudSyncStatus('syncing');
    setSyncError(null);
    try {
      const cloudData = await fetchUserCloudData(user.uid);
      if (cloudData && cloudData.settings) {
        if (cloudData.settings.startDate) setStartDateState(cloudData.settings.startDate);
        if (cloudData.settings.isConfigured !== undefined) setIsConfigured(cloudData.settings.isConfigured);
        if (cloudData.settings.currentDate) setCurrentDate(cloudData.settings.currentDate);

        if (cloudData.tasks && cloudData.tasks.length > 0) {
          const baseTasks = generateAllDexterTasks(cloudData.settings.startDate || '2026-10-05');
          const taskMap = new Map<string, any>(cloudData.tasks.map((t: any) => [t.id, t]));
          const merged = baseTasks.map((t) => {
            const saved = taskMap.get(t.id);
            if (saved) {
              return {
                ...t,
                status: saved.status,
                evidenceUrl: saved.evidenceUrl || t.evidenceUrl,
                evidenceNotes: saved.evidenceNotes || t.evidenceNotes,
                userNotes: saved.userNotes || t.userNotes,
                completedAt: saved.completedAt || t.completedAt
              };
            }
            return t;
          });
          setTasks(merged);
        }
        if (cloudData.extraTasks) setExtraTasks(cloudData.extraTasks);
        if (cloudData.dailyChecks) setDailyChecks(cloudData.dailyChecks);
        if (cloudData.weeklyReviews) setWeeklyReviews(cloudData.weeklyReviews);
        if (cloudData.monthlyReviews) setMonthlyReviews(cloudData.monthlyReviews);
        if (cloudData.firewallLogs) setFirewallLogs(cloudData.firewallLogs);
        if (cloudData.timeSessions && cloudData.timeSessions.length > 0) {
          setTimeSessions(cloudData.timeSessions);
        }
        if (cloudData.activeTimer !== undefined) {
          setActiveTimer(cloudData.activeTimer);
        }
        setCloudSyncStatus('synced');
      } else {
        await migrateToCloud();
      }
    } catch (err: any) {
      setCloudSyncStatus('error');
      setSyncError(err.message || 'Sync failed');
    }
  };

  // Comprehensive Live Statistics derived from lower-level tasks
  const stats: DexterStats = useMemo(() => {
    const totalDays = 112;
    if (!startDate) {
      return {
        daysElapsed: 0,
        daysRemaining: 112,
        totalDays: 112,
        overallCompletionPercent: 0,
        totalTasksCount: tasks.length,
        completedTasksCount: 0,
        cptsHours: { completed: 0, total: 384, percent: 0 },
        ctfCount: { completed: 0, total: 48, writeups: 0 },
        vulnexHours: { completed: 0, total: 96, percent: 0 },
        projectMilestones: { completed: 0, total: 64 },
        awsSessions: { completed: 0, total: 40 },
        cs50Weeks: { completed: 0, total: 14 },
        cjcaHours: { completed: 0, total: 30 },
        mckinseyHours: { completed: 0, total: 20 },
        gpaHours: { completed: 0, total: 48 },
        adherenceScore: 100
      };
    }

    const diff = diffDays(currentDate, startDate);
    const daysElapsed = Math.max(0, Math.min(totalDays, diff + 1));
    const daysRemaining = Math.max(0, totalDays - daysElapsed);

    const totalTasksCount = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === 'done');
    const completedTasksCount = completedTasks.length;
    const overallCompletionPercent = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

    // Track hours & counts
    const cptsCompletedTasks = completedTasks.filter((t) => t.kpiId === 'cpts');
    const cptsHoursCompleted = cptsCompletedTasks.reduce((acc, t) => acc + t.durationHours, 0);

    const ctfCompletedTasks = completedTasks.filter((t) => t.kpiId === 'ctfs');
    const ctfWriteupsCompleted = ctfCompletedTasks.filter(
      (t) => !!t.evidenceUrl || (t.evidenceNotes && t.evidenceNotes.length > 5)
    );

    const vulnexCompletedTasks = completedTasks.filter((t) => t.kpiId === 'vulnex');
    const vulnexHoursCompleted = vulnexCompletedTasks.reduce((acc, t) => acc + t.durationHours, 0);

    const projectCompletedTasks = completedTasks.filter((t) => t.kpiId === 'projects');
    const awsCompletedTasks = completedTasks.filter((t) => t.kpiId === 'aws');
    const cs50CompletedTasks = completedTasks.filter((t) => t.kpiId === 'cs50');
    const cjcaCompletedTasks = completedTasks.filter((t) => t.kpiId === 'cjca');
    const mckinseyCompletedTasks = completedTasks.filter((t) => t.kpiId === 'mckinsey');
    const gpaCompletedTasks = completedTasks.filter((t) => t.kpiId === 'gpa');

    const expectedTasksToDate = tasks.filter((t) => t.date <= currentDate);
    const expectedCompleted = expectedTasksToDate.filter((t) => t.status === 'done').length;
    const adherenceScore =
      expectedTasksToDate.length > 0 ? Math.round((expectedCompleted / expectedTasksToDate.length) * 100) : 100;

    return {
      daysElapsed,
      daysRemaining,
      totalDays,
      overallCompletionPercent,
      totalTasksCount,
      completedTasksCount,
      cptsHours: {
        completed: cptsHoursCompleted,
        total: 384,
        percent: Math.min(100, Math.round((cptsHoursCompleted / 384) * 100))
      },
      ctfCount: {
        completed: ctfCompletedTasks.length,
        total: 48,
        writeups: ctfWriteupsCompleted.length
      },
      vulnexHours: {
        completed: vulnexHoursCompleted,
        total: 96,
        percent: Math.min(100, Math.round((vulnexHoursCompleted / 96) * 100))
      },
      projectMilestones: {
        completed: projectCompletedTasks.length,
        total: 64
      },
      awsSessions: {
        completed: awsCompletedTasks.length,
        total: 40
      },
      cs50Weeks: {
        completed: Math.floor(cs50CompletedTasks.length / 2),
        total: 14
      },
      cjcaHours: {
        completed: cjcaCompletedTasks.reduce((acc, t) => acc + t.durationHours, 0),
        total: 30
      },
      mckinseyHours: {
        completed: mckinseyCompletedTasks.reduce((acc, t) => acc + t.durationHours, 0),
        total: 20
      },
      gpaHours: {
        completed: gpaCompletedTasks.reduce((acc, t) => acc + t.durationHours, 0),
        total: 48
      },
      adherenceScore
    };
  }, [tasks, currentDate, startDate]);

  // Dynamic KPIs derived from lower-level tasks
  const kpis: KPI[] = useMemo(() => {
    return INITIAL_KPIS.map((kpi) => {
      let progressDesc = kpi.currentProgressDescription;
      let status: 'Nominal' | 'In Progress' | 'Attention' | 'Complete' = 'In Progress';

      if (kpi.id === 'cpts') {
        progressDesc = `${stats.cptsHours.completed}h logged / 384h total (${stats.cptsHours.percent}% complete)`;
        status = stats.cptsHours.completed > 0 ? 'Nominal' : 'In Progress';
      } else if (kpi.id === 'gpa') {
        progressDesc = `${stats.gpaHours.completed}h academic work / 48h planned (Protected)`;
        status = 'Nominal';
      } else if (kpi.id === 'projects') {
        progressDesc = `Project milestones: ${stats.projectMilestones.completed}/64 outputs verified`;
        status = 'Nominal';
      } else if (kpi.id === 'ctfs') {
        progressDesc = `${stats.ctfCount.completed}/48 boxes solved · ${stats.ctfCount.writeups}/48 writeups completed`;
        status = 'Nominal';
      } else if (kpi.id === 'cjca') {
        progressDesc = `${stats.cjcaHours.completed}h / 30h completed (${Math.round((stats.cjcaHours.completed / 30) * 100)}%)`;
        status = stats.cjcaHours.completed >= 30 ? 'Complete' : 'Nominal';
      } else if (kpi.id === 'aws') {
        progressDesc = `${stats.awsSessions.completed}/40 micro-sessions completed (${Math.round((stats.awsSessions.completed / 40) * 100)}%)`;
        status = stats.awsSessions.completed >= 40 ? 'Complete' : 'Nominal';
      } else if (kpi.id === 'mckinsey') {
        progressDesc = `${stats.mckinseyHours.completed}h / 20h completed (${Math.round((stats.mckinseyHours.completed / 20) * 100)}%)`;
        status = stats.mckinseyHours.completed >= 20 ? 'Complete' : 'Nominal';
      } else if (kpi.id === 'cs50') {
        progressDesc = `${stats.cs50Weeks.completed}/14 weeks completed (${Math.round((stats.cs50Weeks.completed / 14) * 100)}%)`;
        status = stats.cs50Weeks.completed >= 14 ? 'Complete' : 'Nominal';
      }

      return {
        ...kpi,
        currentProgressDescription: progressDesc,
        status
      };
    });
  }, [stats]);

  // Export / Import
  const exportDataToJson = () => {
    const payload = {
      exportVersion: 4,
      exportDate: new Date().toISOString(),
      startDate,
      isConfigured,
      currentDate,
      tasks,
      extraTasks,
      dailyChecks,
      weeklyReviews,
      monthlyReviews,
      firewallLogs,
      timeSessions
    };
    return JSON.stringify(payload, null, 2);
  };

  const importDataFromJson = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.startDate) setStartDateState(data.startDate);
      if (data.isConfigured !== undefined) setIsConfigured(data.isConfigured);
      if (data.currentDate) setCurrentDate(data.currentDate);
      if (data.tasks && Array.isArray(data.tasks)) setTasks(data.tasks);
      if (data.extraTasks && Array.isArray(data.extraTasks)) setExtraTasks(data.extraTasks);
      if (data.dailyChecks && Array.isArray(data.dailyChecks)) setDailyChecks(data.dailyChecks);
      if (data.weeklyReviews && Array.isArray(data.weeklyReviews)) setWeeklyReviews(data.weeklyReviews);
      if (data.monthlyReviews && Array.isArray(data.monthlyReviews)) setMonthlyReviews(data.monthlyReviews);
      if (data.firewallLogs && Array.isArray(data.firewallLogs)) setFirewallLogs(data.firewallLogs);
      if (data.timeSessions && Array.isArray(data.timeSessions)) setTimeSessions(data.timeSessions);
      return true;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  };

  const resetToDefaults = () => {
    localStorage.clear();
    const defaultStart = '2026-10-05';
    setStartDateState(defaultStart);
    setIsConfigured(true);
    setCurrentDate(defaultStart);
    setTasks(generateAllDexterTasks(defaultStart));
    setExtraTasks([]);
    setDailyChecks([]);
    setWeeklyReviews([]);
    setMonthlyReviews([]);
    setFirewallLogs(INITIAL_FIREWALL_LOGS);
    setTimeSessions([]);
    setActiveTimer(null);
    setActiveTaskFocus(null);
  };

  return (
    <DexterContext.Provider
      value={{
        startDate,
        endDate,
        isConfigured,
        currentDate,
        currentDayNumber,
        currentWeek,
        currentMonth,
        relativeDayInWeek,
        tasks,
        extraTasks,
        kpis,
        dailyChecks,
        weeklyReviews,
        monthlyReviews,
        firewallLogs,
        activeTaskFocus,
        // Time tracking
        timeSessions,
        activeTimer,
        activeTimerElapsedSeconds,
        longRunningPrompt,
        confirmStopPrompt,
        startTaskTimer,
        pauseActiveTimer,
        resumeActiveTimer,
        stopActiveTimer,
        discardActiveTimer,
        addManualTimeEntry,
        updateTimeSession,
        deleteTimeSession,
        resolveLongRunningSession,
        dismissConfirmStopPrompt,
        getTimeTrackedForTask,
        getTimeTrackedForDate,
        cloudSyncStatus,
        syncError,
        triggerManualCloudSync,
        migrateToCloud,
        setStartDate,
        setCurrentDate,
        updateTaskStatus,
        updateTaskEvidence,
        updateTaskNotes,
        addExtraTask,
        toggleExtraTask,
        updateExtraTask,
        deleteExtraTask,
        setActiveTaskFocus,
        saveDailyCheck,
        getDailyCheckForDate,
        finishDay,
        getRecoveryRecommendation,
        saveWeeklyReview,
        getWeeklyReviewForWeek,
        saveMonthlyReview,
        addFirewallItem,
        deleteFirewallItem,
        stats,
        exportDataToJson,
        importDataFromJson,
        resetToDefaults
      }}
    >
      {children}
    </DexterContext.Provider>
  );
};

export const useDexter = () => {
  const context = useContext(DexterContext);
  if (!context) {
    throw new Error('useDexter must be used within a DexterProvider');
  }
  return context;
};
