export type KpiId =
  | 'cpts'
  | 'gpa'
  | 'projects'
  | 'ctfs'
  | 'portfolio'
  | 'personal_brand'
  | 'first_customer'
  | 'cjca'
  | 'aws'
  | 'mckinsey'
  | 'cs50';

export type TrackType =
  | 'Core Anchor'
  | 'Deep Work'
  | 'Capability & Evidence'
  | 'Parallel Foundation'
  | 'University Academic'
  | 'Micro-Track'
  | 'Market & Derived';

export type PriorityTier = 'Tier 1 — Core' | 'Tier 2 — Capability & Evidence' | 'Tier 3 — Parallel Foundation' | 'Derived Output';

export type TaskStatus =
  | 'not-started'
  | 'in-progress'
  | 'done'
  | 'partial'
  | 'blocked'
  | 'deferred'
  | 'cancelled';

export interface KPI {
  id: KpiId;
  number: number;
  name: string;
  type: string;
  priorityTier: PriorityTier;
  finalTarget: string;
  monthlyTarget: string;
  weeklyTarget: string;
  currentProgressDescription: string;
  totalPlannedHours: number;
  unit: string;
  targetCount: number;
  status: 'Nominal' | 'In Progress' | 'Attention' | 'Complete';
  startDate: string;
  endDate: string;
  evidence: string;
  notes: string;
  dependencies: string;
  definitionOfDone: string;
}

export interface DexterTask {
  id: string;
  date: string; // YYYY-MM-DD
  plannedDate: string; // original plan date
  dayNumber: number; // 1 - 112
  relativeDayInWeek: number; // 1 - 7
  weekNumber: number; // 1 - 16
  monthNumber: number; // 1 - 4
  dayOfWeek: 'Saturday' | 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  kpiId: KpiId | 'vulnex';
  track: TrackType;
  title: string;
  action: string;
  durationHours: number;
  priority: 'P1 - Anchor' | 'P2 - High' | 'P3 - Foundation' | 'P4 - Derived';
  status: TaskStatus;
  definitionOfDone: string;
  expectedOutput: string;
  evidenceRequired: boolean;
  evidenceUrl?: string;
  evidenceNotes?: string;
  dependency: string;
  whatIfMissed: string;
  userNotes?: string;
  completedAt?: string;
  isUniversityDay?: boolean;
  isVulnexDay?: boolean;
}

export interface ExtraTask {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  createdAt: string;
  priority?: 'P1 - High' | 'P2 - Normal' | 'P3 - Low';
  notes?: string;
}

export interface ActiveTaskFocus {
  taskId: string;
  startedAt: string;
  notes: string;
  dodChecklist: { [itemIndex: number]: boolean };
}

export interface DailyCheck {
  date: string;
  dayNumber: number;
  cptsStatus: 'Done' | 'Partial' | 'Missed';
  secondaryStatus: 'Done' | 'Partial' | 'Missed';
  mainOutput: string;
  mainFriction: string;
  energyLevel: 1 | 2 | 3 | 4 | 5;
  tomorrowFirstTask: string;
  timestamp: string;
  finishedAt?: string;
}

export interface RecoveryRecommendation {
  date: string;
  missedTaskCount: number;
  keepItems: string[];
  moveItems: string[];
  dropItems: string[];
  guidanceText: string;
}

export interface WeeklyReview {
  weekNumber: number;
  startDate: string;
  endDate: string;
  kpiMovement: string;
  plannedVsActual: string;
  cptsProgress: string;
  ctfProgress: string;
  projectProgress: string;
  cs50Progress: string;
  cjcaProgress: string;
  mckinseyProgress: string;
  awsProgress: string;
  universityProgress: string;
  vulnexProgress: string;
  friction: string;
  capacityIssue: string;
  delayedTasks: string;
  restructureDecisions: string;
  nextWeekObjectives: string;
  completionScorePercent?: number;
  isCompleted: boolean;
  updatedAt?: string;
}

export interface MonthlyReview {
  monthNumber: number;
  title: string;
  weeks: number[];
  kpiAssessment: string;
  cptsCumulative: string;
  ctfWriteupsCount: string;
  projectStatus: string;
  universityStatus: string;
  cs50Status: string;
  cjcaStatus: string;
  awsStatus: string;
  mckinseyStatus: string;
  vulnexStatus: string;
  portfolioEvidence: string;
  brandOutput: string;
  customerPipeline: string;
  masterTargetComparison: string;
  isCompleted: boolean;
  updatedAt?: string;
}

export interface OpportunityFirewallItem {
  id: string;
  date: string;
  opportunityName: string;
  whatItOffers: string;
  whatItWouldConsume: string;
  sacrificedKpi: string;
  decision: 'Rejected' | 'Postponed' | 'Accepted (Rare)';
  revisitDate: string;
  notes: string;
}

export interface VulnexMilestone {
  weekNumber: number;
  date?: string;
  milestone: string;
  expectedOutput: string;
  definitionOfDone: string;
  actualResult?: string;
  evidenceUrl?: string;
  status: TaskStatus;
}

export interface CtfItem {
  id: string;
  weekNumber: number;
  boxName: string;
  dayScheduled?: string;
  date?: string;
  os: 'Linux' | 'Windows';
  difficulty: 'Easy' | 'Medium' | 'Medium-Hard';
  skillsFocus: string;
  solved: boolean;
  writeupCompleted: boolean;
  writeupUrl?: string;
  evidenceNotes?: string;
}

export interface ProjectMilestone {
  projectNumber: 1 | 2 | 3 | 4;
  title: string;
  monthNumber: number;
  weeks: [number, number, number, number];
  definitionOfDone: string;
  weeklyMilestones: {
    week: number;
    title: string;
    outputs: string[];
  }[];
  githubUrl?: string;
  caseStudyUrl?: string;
  demoUrl?: string;
  status: 'Not Started' | 'In Progress' | 'Completed';
}

export interface WeeklyObjective {
  weekNumber: number;
  startDate?: string;
  endDate?: string;
  theme: string;
  cptsTarget: string;
  universityTarget: string;
  projectTarget: string;
  ctfTarget: string;
  cs50Target: string;
  cjcaTarget: string;
  mckinseyTarget: string;
  awsTarget: string;
  vulnexTarget: string;
  portfolioTarget: string;
  brandTarget: string;
  customerTarget: string;
  weeklyDefinitionOfDone: string;
}

export type TimeSessionStatus = 'completed' | 'running' | 'paused' | 'discarded';
export type TimeEntrySource = 'timer' | 'manual';

export interface PausedInterval {
  pausedAt: string; // ISO UTC string
  resumedAt: string | null; // ISO UTC string, or null if currently paused
  durationSeconds: number; // accumulated pause duration in seconds
}

export interface TimeSession {
  id: string; // unique session ID
  userId: string;
  taskId: string | null; // null if untracked / general session
  taskTitle: string; // historical title snapshot
  taskDate: string; // calendar date YYYY-MM-DD
  isExtraTask?: boolean;
  kpiId?: KpiId | 'vulnex' | null;
  projectNumber?: number | null;
  startTime: string; // ISO UTC timestamp
  endTime: string | null; // ISO UTC timestamp, null if running/paused
  totalElapsedSeconds: number; // active focus seconds excluding pauses
  status: TimeSessionStatus;
  source: TimeEntrySource;
  pausedIntervals: PausedInterval[];
  notes?: string;
  wasManuallyEdited?: boolean;
  editReason?: string;
  isArchivedTask?: boolean; // preserves history if task deleted
  createdAt: string; // ISO UTC
  updatedAt: string; // ISO UTC
}

export interface ActiveTimerState {
  sessionId: string;
  taskId: string | null;
  taskTitle: string;
  taskDate: string;
  isExtraTask?: boolean;
  kpiId?: KpiId | 'vulnex' | null;
  projectNumber?: number | null;
  startTime: string; // ISO UTC
  status: 'running' | 'paused';
  pausedAt?: string | null; // ISO UTC if currently paused
  accumulatedActiveSeconds: number; // calculated seconds before current active run/pause
  pausedIntervals: PausedInterval[];
  notes?: string;
}
