import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import {
  DexterTask,
  ExtraTask,
  DailyCheck,
  WeeklyReview,
  MonthlyReview,
  OpportunityFirewallItem,
  TimeSession,
  ActiveTimerState
} from '../types/dexter';

export interface UserCloudData {
  settings: {
    startDate: string;
    isConfigured: boolean;
    currentDate?: string;
    updatedAt?: string;
  } | null;
  tasks: DexterTask[];
  extraTasks: ExtraTask[];
  dailyChecks: DailyCheck[];
  weeklyReviews: WeeklyReview[];
  monthlyReviews: MonthlyReview[];
  firewallLogs: OpportunityFirewallItem[];
  timeSessions: TimeSession[];
  activeTimer: ActiveTimerState | null;
}

/**
 * Fetch all cloud progress for a user
 */
export async function fetchUserCloudData(userId: string): Promise<UserCloudData | null> {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      return null;
    }

    const settingsData = userDocSnap.data();

    // Fetch tasks
    const tasksSnapshot = await getDocs(collection(db, 'users', userId, 'tasks'));
    const cloudTasks: any[] = [];
    tasksSnapshot.forEach((d) => cloudTasks.push(d.data()));

    // Fetch extraTasks
    const extraSnapshot = await getDocs(collection(db, 'users', userId, 'extraTasks'));
    const cloudExtraTasks: ExtraTask[] = [];
    extraSnapshot.forEach((d) => cloudExtraTasks.push(d.data() as ExtraTask));

    // Fetch dailyChecks
    const checksSnapshot = await getDocs(collection(db, 'users', userId, 'dailyChecks'));
    const cloudChecks: DailyCheck[] = [];
    checksSnapshot.forEach((d) => cloudChecks.push(d.data() as DailyCheck));

    // Fetch weeklyReviews
    const weeklySnapshot = await getDocs(collection(db, 'users', userId, 'weeklyReviews'));
    const cloudWeeklyReviews: WeeklyReview[] = [];
    weeklySnapshot.forEach((d) => cloudWeeklyReviews.push(d.data() as WeeklyReview));

    // Fetch monthlyReviews
    const monthlySnapshot = await getDocs(collection(db, 'users', userId, 'monthlyReviews'));
    const cloudMonthlyReviews: MonthlyReview[] = [];
    monthlySnapshot.forEach((d) => cloudMonthlyReviews.push(d.data() as MonthlyReview));

    // Fetch firewallLogs
    const firewallSnapshot = await getDocs(collection(db, 'users', userId, 'firewallLogs'));
    const cloudFirewall: OpportunityFirewallItem[] = [];
    firewallSnapshot.forEach((d) => cloudFirewall.push(d.data() as OpportunityFirewallItem));

    // Fetch timeSessions
    const timeSessionsSnapshot = await getDocs(collection(db, 'users', userId, 'timeSessions'));
    const cloudTimeSessions: TimeSession[] = [];
    timeSessionsSnapshot.forEach((d) => cloudTimeSessions.push(d.data() as TimeSession));

    // Fetch activeTimer singleton
    let cloudActiveTimer: ActiveTimerState | null = null;
    try {
      const activeTimerDoc = await getDoc(doc(db, 'users', userId, 'activeTimer', 'current'));
      if (activeTimerDoc.exists()) {
        cloudActiveTimer = activeTimerDoc.data() as ActiveTimerState;
      }
    } catch (e) {
      console.warn('Could not load active timer singleton', e);
    }

    return {
      settings: {
        startDate: settingsData.startDate,
        isConfigured: settingsData.isConfigured,
        currentDate: settingsData.currentDate,
        updatedAt: settingsData.updatedAt
      },
      tasks: cloudTasks,
      extraTasks: cloudExtraTasks,
      dailyChecks: cloudChecks,
      weeklyReviews: cloudWeeklyReviews,
      monthlyReviews: cloudMonthlyReviews,
      firewallLogs: cloudFirewall,
      timeSessions: cloudTimeSessions,
      activeTimer: cloudActiveTimer
    };
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `users/${userId}`);
    return null;
  }
}

/**
 * Persist user settings to cloud
 */
export async function saveUserCloudSettings(
  userId: string,
  settings: { startDate: string; isConfigured: boolean; currentDate: string }
): Promise<void> {
  const path = `users/${userId}`;
  try {
    await setDoc(
      doc(db, 'users', userId),
      {
        userId,
        startDate: settings.startDate,
        isConfigured: settings.isConfigured,
        currentDate: settings.currentDate,
        updatedAt: new Date().toISOString()
      },
      { merge: true }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

/**
 * Persist single task status/evidence change to cloud
 */
export async function saveCloudTask(userId: string, task: DexterTask): Promise<void> {
  const path = `users/${userId}/tasks/${task.id}`;
  try {
    await setDoc(
      doc(db, 'users', userId, 'tasks', task.id),
      {
        id: task.id,
        userId,
        date: task.date,
        status: task.status,
        evidenceUrl: task.evidenceUrl || '',
        evidenceNotes: task.evidenceNotes || '',
        userNotes: task.userNotes || '',
        completedAt: task.completedAt || ''
      },
      { merge: true }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

/**
 * Persist extra task to cloud
 */
export async function saveCloudExtraTask(userId: string, extraTask: ExtraTask): Promise<void> {
  const path = `users/${userId}/extraTasks/${extraTask.id}`;
  try {
    await setDoc(doc(db, 'users', userId, 'extraTasks', extraTask.id), {
      ...extraTask,
      userId
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

/**
 * Delete extra task from cloud
 */
export async function deleteCloudExtraTask(userId: string, extraTaskId: string): Promise<void> {
  const path = `users/${userId}/extraTasks/${extraTaskId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'extraTasks', extraTaskId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

/**
 * Save daily check to cloud
 */
export async function saveCloudDailyCheck(userId: string, check: DailyCheck): Promise<void> {
  const path = `users/${userId}/dailyChecks/${check.date}`;
  try {
    await setDoc(doc(db, 'users', userId, 'dailyChecks', check.date), {
      ...check,
      userId
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

/**
 * Save weekly review to cloud
 */
export async function saveCloudWeeklyReview(userId: string, review: WeeklyReview): Promise<void> {
  const path = `users/${userId}/weeklyReviews/${review.weekNumber}`;
  try {
    await setDoc(doc(db, 'users', userId, 'weeklyReviews', String(review.weekNumber)), {
      ...review,
      userId
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

/**
 * Save monthly review to cloud
 */
export async function saveCloudMonthlyReview(userId: string, review: MonthlyReview): Promise<void> {
  const path = `users/${userId}/monthlyReviews/${review.monthNumber}`;
  try {
    await setDoc(doc(db, 'users', userId, 'monthlyReviews', String(review.monthNumber)), {
      ...review,
      userId
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

/**
 * Save firewall log to cloud
 */
export async function saveCloudFirewallLog(
  userId: string,
  item: OpportunityFirewallItem
): Promise<void> {
  const path = `users/${userId}/firewallLogs/${item.id}`;
  try {
    await setDoc(doc(db, 'users', userId, 'firewallLogs', item.id), {
      ...item,
      userId
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

/**
 * Delete firewall log from cloud
 */
export async function deleteCloudFirewallLog(userId: string, id: string): Promise<void> {
  const path = `users/${userId}/firewallLogs/${id}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'firewallLogs', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

/**
 * Save or update time session in cloud
 */
export async function saveCloudTimeSession(
  userId: string,
  session: TimeSession
): Promise<void> {
  const path = `users/${userId}/timeSessions/${session.id}`;
  try {
    await setDoc(doc(db, 'users', userId, 'timeSessions', session.id), {
      ...session,
      userId,
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

/**
 * Delete time session from cloud (with confirmation from caller)
 */
export async function deleteCloudTimeSession(userId: string, sessionId: string): Promise<void> {
  const path = `users/${userId}/timeSessions/${sessionId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'timeSessions', sessionId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

/**
 * Save or clear active timer singleton in cloud
 */
export async function saveCloudActiveTimer(
  userId: string,
  timerState: ActiveTimerState | null
): Promise<void> {
  const path = `users/${userId}/activeTimer/current`;
  try {
    if (timerState) {
      await setDoc(doc(db, 'users', userId, 'activeTimer', 'current'), {
        ...timerState,
        userId,
        updatedAt: new Date().toISOString()
      });
    } else {
      await deleteDoc(doc(db, 'users', userId, 'activeTimer', 'current'));
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

/**
 * Full safe migration of local data to cloud in chunked batches
 */
export async function migrateLocalDataToCloud(
  userId: string,
  localData: {
    startDate: string;
    isConfigured: boolean;
    currentDate: string;
    tasks: DexterTask[];
    extraTasks: ExtraTask[];
    dailyChecks: DailyCheck[];
    weeklyReviews: WeeklyReview[];
    monthlyReviews: MonthlyReview[];
    firewallLogs: OpportunityFirewallItem[];
    timeSessions?: TimeSession[];
    activeTimer?: ActiveTimerState | null;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Save settings
    await saveUserCloudSettings(userId, {
      startDate: localData.startDate,
      isConfigured: localData.isConfigured,
      currentDate: localData.currentDate
    });

    // 2. Filter tasks that have changes from initial status or have evidence/notes
    const activeTasks = localData.tasks.filter(
      (t) => t.status !== 'not-started' || t.evidenceUrl || t.evidenceNotes || t.userNotes
    );

    // Write in chunks of 200 (Firestore limit is 500 per batch)
    const chunkSize = 200;
    for (let i = 0; i < activeTasks.length; i += chunkSize) {
      const chunk = activeTasks.slice(i, i + chunkSize);
      const batch = writeBatch(db);
      for (const t of chunk) {
        const ref = doc(db, 'users', userId, 'tasks', t.id);
        batch.set(ref, {
          id: t.id,
          userId,
          date: t.date,
          status: t.status,
          evidenceUrl: t.evidenceUrl || '',
          evidenceNotes: t.evidenceNotes || '',
          userNotes: t.userNotes || '',
          completedAt: t.completedAt || ''
        });
      }
      await batch.commit();
    }

    // 3. Migrate extra tasks
    if (localData.extraTasks.length > 0) {
      const batch = writeBatch(db);
      for (const et of localData.extraTasks) {
        const ref = doc(db, 'users', userId, 'extraTasks', et.id);
        batch.set(ref, { ...et, userId });
      }
      await batch.commit();
    }

    // 4. Migrate daily checks
    if (localData.dailyChecks.length > 0) {
      const batch = writeBatch(db);
      for (const dc of localData.dailyChecks) {
        const ref = doc(db, 'users', userId, 'dailyChecks', dc.date);
        batch.set(ref, { ...dc, userId });
      }
      await batch.commit();
    }

    // 5. Migrate weekly reviews
    if (localData.weeklyReviews.length > 0) {
      const batch = writeBatch(db);
      for (const wr of localData.weeklyReviews) {
        const ref = doc(db, 'users', userId, 'weeklyReviews', String(wr.weekNumber));
        batch.set(ref, { ...wr, userId });
      }
      await batch.commit();
    }

    // 6. Migrate monthly reviews
    if (localData.monthlyReviews.length > 0) {
      const batch = writeBatch(db);
      for (const mr of localData.monthlyReviews) {
        const ref = doc(db, 'users', userId, 'monthlyReviews', String(mr.monthNumber));
        batch.set(ref, { ...mr, userId });
      }
      await batch.commit();
    }

    // 7. Migrate firewall logs
    if (localData.firewallLogs.length > 0) {
      const batch = writeBatch(db);
      for (const fw of localData.firewallLogs) {
        const ref = doc(db, 'users', userId, 'firewallLogs', fw.id);
        batch.set(ref, { ...fw, userId });
      }
      await batch.commit();
    }

    // 8. Migrate time sessions
    if (localData.timeSessions && localData.timeSessions.length > 0) {
      const chunkSize = 200;
      for (let i = 0; i < localData.timeSessions.length; i += chunkSize) {
        const chunk = localData.timeSessions.slice(i, i + chunkSize);
        const batch = writeBatch(db);
        for (const ts of chunk) {
          const ref = doc(db, 'users', userId, 'timeSessions', ts.id);
          batch.set(ref, { ...ts, userId });
        }
        await batch.commit();
      }
    }

    // 9. Migrate active timer if present
    if (localData.activeTimer) {
      await saveCloudActiveTimer(userId, localData.activeTimer);
    }

    return { success: true };
  } catch (err: any) {
    console.error('Migration failed:', err);
    return { success: false, error: err.message || 'Unknown migration error' };
  }
}
