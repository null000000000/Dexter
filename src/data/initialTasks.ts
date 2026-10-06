import { DexterTask } from '../types/dexter';
import { CTF_SCHEDULE } from './ctfData';
import { VULNEX_SCHEDULE } from './vulnexData';
import { PROJECTS_SCHEDULE } from './projectData';
import { addDays, getWeekdayName } from '../utils/dateUtils';

export function generateAllDexterTasks(
  startDateStr: string,
  existingTasks?: DexterTask[]
): DexterTask[] {
  const tasks: DexterTask[] = [];

  // Create lookup of existing completed tasks to preserve execution history
  const historyMap = new Map<string, DexterTask>();
  if (existingTasks) {
    for (const t of existingTasks) {
      // Key by task identifier without the absolute calendar date
      const relativeKey = `${t.weekNumber}-${t.relativeDayInWeek}-${t.kpiId}-${t.title.slice(0, 15)}`;
      historyMap.set(relativeKey, t);
    }
  }

  for (let dayIndex = 1; dayIndex <= 112; dayIndex++) {
    const weekNumber = Math.floor((dayIndex - 1) / 7) + 1;
    const relativeDayInWeek = ((dayIndex - 1) % 7) + 1; // 1 to 7
    const monthNumber = Math.floor((weekNumber - 1) / 4) + 1;

    const dateStr = addDays(startDateStr, dayIndex - 1);
    const dayOfWeek = getWeekdayName(dateStr);

    const project = PROJECTS_SCHEDULE[monthNumber - 1];
    const projectWeeklyMilestone = project.weeklyMilestones[(weekNumber - 1) % 4];
    const awsStartSession = (weekNumber - 1) * 5 + 1;

    // Helper to check preserved history
    const applyHistory = (baseTask: DexterTask): DexterTask => {
      const relativeKey = `${weekNumber}-${relativeDayInWeek}-${baseTask.kpiId}-${baseTask.title.slice(0, 15)}`;
      const prev = historyMap.get(relativeKey);
      if (prev && (prev.status === 'done' || prev.status === 'in-progress' || prev.evidenceUrl || prev.evidenceNotes)) {
        return {
          ...baseTask,
          status: prev.status,
          evidenceUrl: prev.evidenceUrl || baseTask.evidenceUrl,
          evidenceNotes: prev.evidenceNotes || baseTask.evidenceNotes,
          userNotes: prev.userNotes || baseTask.userNotes,
          completedAt: prev.completedAt || baseTask.completedAt
        };
      }
      return baseTask;
    };

    // DAY 7 OF WEEK: Rest Day + VULNEX Deep Work Day ONLY
    if (relativeDayInWeek === 7) {
      const vulnexMilestone = VULNEX_SCHEDULE[weekNumber - 1];

      const vulnexTask: DexterTask = {
        id: `task-w${weekNumber}-d7-vulnex`,
        date: dateStr,
        plannedDate: dateStr,
        dayNumber: dayIndex,
        relativeDayInWeek,
        weekNumber,
        monthNumber,
        dayOfWeek,
        kpiId: 'vulnex',
        track: 'Deep Work',
        title: `VULNEX Deep Work — Milestone: ${vulnexMilestone.milestone}`,
        action: `Execute 6-hour continuous-context engineering block. Output: ${vulnexMilestone.expectedOutput}`,
        durationHours: 6,
        priority: 'P1 - Anchor',
        status: 'not-started',
        definitionOfDone: vulnexMilestone.definitionOfDone,
        expectedOutput: vulnexMilestone.expectedOutput,
        evidenceRequired: true,
        evidenceUrl: vulnexMilestone.evidenceUrl || '',
        evidenceNotes: vulnexMilestone.actualResult || '',
        dependency: weekNumber === 1 ? 'Environment sandbox setup' : `Week ${weekNumber - 1} VULNEX deliverables`,
        whatIfMissed: 'Friday/Rest Day deep work is protected. If interrupted, complete remaining hours; do not bleed into Day 1 operating schedule.',
        isVulnexDay: true
      };

      tasks.push(applyHistory(vulnexTask));
      continue;
    }

    // OPERATING DAYS (Days 1 to 6 of each week)

    // 1. CPTS ANCHOR (Every operating day: exactly 4 hours non-negotiable)
    const cptsTask: DexterTask = {
      id: `task-w${weekNumber}-d${relativeDayInWeek}-cpts`,
      date: dateStr,
      plannedDate: dateStr,
      dayNumber: dayIndex,
      relativeDayInWeek,
      weekNumber,
      monthNumber,
      dayOfWeek,
      kpiId: 'cpts',
      track: 'Core Anchor',
      title: `CPTS Anchor — Contiguous Module Progression (Day ${relativeDayInWeek})`,
      action: `Complete the next contiguous CPTS section set from current official position + interactive lab + structured notes.`,
      durationHours: 4,
      priority: 'P1 - Anchor',
      status: 'not-started',
      definitionOfDone: 'Theory read + interactive lab target flagged + obsidian notes captured + skills assessment solved where present.',
      expectedOutput: `4h continuous progression: target flags submitted and verified module concepts captured.`,
      evidenceRequired: true,
      dependency: 'Prior contiguous section completed sequentially. CPTS order is never reordered.',
      whatIfMissed: 'NON-NEGOTIABLE ANCHOR. If missed, immediately protect tomorrow’s 4h block. Never double to 8h.'
    };
    tasks.push(applyHistory(cptsTask));

    // 2. DAY-SPECIFIC ROTATION TASKS

    // DAY 1: University Study Day & Scope Kickoff (CPTS 4h + GPA 1.5h + CJCA 1h + McK 1h + Project 1h = 8.5h)
    if (relativeDayInWeek === 1) {
      // University / GPA (Saturday equivalent)
      tasks.push(
        applyHistory({
          id: `task-w${weekNumber}-d1-gpa`,
          date: dateStr,
          plannedDate: dateStr,
          dayNumber: dayIndex,
          relativeDayInWeek,
          weekNumber,
          monthNumber,
          dayOfWeek,
          kpiId: 'gpa',
          track: 'University Academic',
          title: `GPA / University — Academic Input & Reading (W${weekNumber})`,
          action: `Read/watch assigned TM112/TM129 weekly chapters; extract core concepts and problem models.`,
          durationHours: 1.5,
          priority: 'P1 - Anchor',
          status: 'not-started',
          definitionOfDone: 'Required reading completed + notes summarized in academic workspace.',
          expectedOutput: 'Summarized lecture/chapter notes and identified assignment requirements.',
          evidenceRequired: true,
          dependency: 'Course syllabus timeline.',
          whatIfMissed: 'University study is protected. Do not postpone; complete during Day 6 study session.',
          isUniversityDay: true
        })
      );

      // CJCA (Weeks 1-10)
      if (weekNumber <= 10) {
        tasks.push(
          applyHistory({
            id: `task-w${weekNumber}-d1-cjca`,
            date: dateStr,
            plannedDate: dateStr,
            dayNumber: dayIndex,
            relativeDayInWeek,
            weekNumber,
            monthNumber,
            dayOfWeek,
            kpiId: 'cjca',
            track: 'Parallel Foundation',
            title: `CJCA — Foundation Module Block (W${weekNumber} Session 1/3)`,
            action: `Study next analyst foundation block + interactive activities + concise notes.`,
            durationHours: 1,
            priority: 'P3 - Foundation',
            status: 'not-started',
            definitionOfDone: 'Section reading complete + knowledge check submitted.',
            expectedOutput: 'Module block passed with concise check notes.',
            evidenceRequired: true,
            dependency: 'Previous CJCA foundation section.',
            whatIfMissed: 'Parallel track: redistribute to Day 3 or Day 5.'
          })
        );
      }

      // McKinsey Forward (Weeks 1-10)
      if (weekNumber <= 10) {
        tasks.push(
          applyHistory({
            id: `task-w${weekNumber}-d1-mckinsey`,
            date: dateStr,
            plannedDate: dateStr,
            dayNumber: dayIndex,
            relativeDayInWeek,
            weekNumber,
            monthNumber,
            dayOfWeek,
            kpiId: 'mckinsey',
            track: 'Parallel Foundation',
            title: `McKinsey Forward — Core Leadership Track (W${weekNumber} Part 1/2)`,
            action: `Complete structured digital learning module and reflection exercise on portal.`,
            durationHours: 1,
            priority: 'P3 - Foundation',
            status: 'not-started',
            definitionOfDone: 'Module interactive exercise submitted + reflection log saved.',
            expectedOutput: 'Completed McKinsey module segment with reflection notes.',
            evidenceRequired: true,
            dependency: 'McKinsey Forward cohort curriculum.',
            whatIfMissed: 'Do not drop; finish in Day 3 session.'
          })
        );
      }

      // Project (1h Kickoff)
      tasks.push(
        applyHistory({
          id: `task-w${weekNumber}-d1-project`,
          date: dateStr,
          plannedDate: dateStr,
          dayNumber: dayIndex,
          relativeDayInWeek,
          weekNumber,
          monthNumber,
          dayOfWeek,
          kpiId: 'projects',
          track: 'Capability & Evidence',
          title: `Project ${project.projectNumber} — Weekly Scope Kickoff & Setup`,
          action: `Define week ${weekNumber} architecture goals: ${projectWeeklyMilestone.outputs[0]}`,
          durationHours: 1,
          priority: 'P2 - High',
          status: 'not-started',
          definitionOfDone: 'Architecture spec written and task issues created in Git.',
          expectedOutput: projectWeeklyMilestone.outputs[0],
          evidenceRequired: true,
          dependency: `Project ${project.projectNumber} prior milestone.`,
          whatIfMissed: 'Combine with Day 3 2h engineering block.'
        })
      );
    }

    // DAY 2: CTF 1 + CS50 Lecture + AWS (CPTS 4h + CTF 2h + CS50 2h + AWS ~50m)
    if (relativeDayInWeek === 2) {
      const ctfIndex = (weekNumber - 1) * 3;
      const ctf = CTF_SCHEDULE[ctfIndex] || CTF_SCHEDULE[0];

      tasks.push(
        applyHistory({
          id: `task-w${weekNumber}-d2-ctf`,
          date: dateStr,
          plannedDate: dateStr,
          dayNumber: dayIndex,
          relativeDayInWeek,
          weekNumber,
          monthNumber,
          dayOfWeek,
          kpiId: 'ctfs',
          track: 'Capability & Evidence',
          title: `CTF 1/3 — Solve ${ctf.boxName} (${ctf.os} - ${ctf.difficulty}) + Full Writeup`,
          action: `Solve ${ctf.boxName}: complete recon → initial foothold → privilege escalation → capture proofs → complete writeup. Focus: ${ctf.skillsFocus}.`,
          durationHours: 2,
          priority: 'P2 - High',
          status: 'not-started',
          definitionOfDone: 'Box solved + user/root flags captured + reproducible technical writeup written.',
          expectedOutput: `User & Root proof evidence + structured writeup for ${ctf.boxName}.`,
          evidenceRequired: true,
          dependency: 'HTB lab connectivity & pentest methodology.',
          whatIfMissed: 'Do not drop writeup. Reschedule box to Day 4 or weekend buffer.'
        })
      );

      if (weekNumber <= 14) {
        tasks.push(
          applyHistory({
            id: `task-w${weekNumber}-d2-cs50`,
            date: dateStr,
            plannedDate: dateStr,
            dayNumber: dayIndex,
            relativeDayInWeek,
            weekNumber,
            monthNumber,
            dayOfWeek,
            kpiId: 'cs50',
            track: 'Parallel Foundation',
            title: `CS50x Week ${weekNumber} — Lecture & Algorithmic Notes (Part 1/2)`,
            action: `Watch CS50 Week ${weekNumber} lecture (2h); transcribe algorithms, data structures, and core principles.`,
            durationHours: 2,
            priority: 'P2 - High',
            status: 'not-started',
            definitionOfDone: 'Full lecture watched + annotated code samples archived in CS50 folder.',
            expectedOutput: `Annotated notes & algorithm diagrams for CS50 Week ${weekNumber}.`,
            evidenceRequired: true,
            dependency: `CS50 Week ${weekNumber - 1} concepts.`,
            whatIfMissed: 'Mandatory parallel foundation. Do not postpone; prepare for Day 4 problem set.'
          })
        );
      }

      if (weekNumber <= 8) {
        tasks.push(
          applyHistory({
            id: `task-w${weekNumber}-d2-aws`,
            date: dateStr,
            plannedDate: dateStr,
            dayNumber: dayIndex,
            relativeDayInWeek,
            weekNumber,
            monthNumber,
            dayOfWeek,
            kpiId: 'aws',
            track: 'Micro-Track',
            title: `AWS Foundation — Session ${awsStartSession}/40 (~50 min)`,
            action: `Complete AWS Cloud Practitioner module lesson + practice knowledge check questions.`,
            durationHours: 0.83,
            priority: 'P3 - Foundation',
            status: 'not-started',
            definitionOfDone: 'Lesson video finished + knowledge check 100% correct + architecture summary captured.',
            expectedOutput: `AWS session ${awsStartSession} notes & quiz pass.`,
            evidenceRequired: true,
            dependency: 'Previous AWS lesson.',
            whatIfMissed: 'Light micro-track: complete alongside Day 3 session.'
          })
        );
      }
    }

    // DAY 3: Project Core + CJCA + McK + AWS (CPTS 4h + Project 2h + CJCA 1h + McK 1h + AWS ~50m)
    if (relativeDayInWeek === 3) {
      tasks.push(
        applyHistory({
          id: `task-w${weekNumber}-d3-project`,
          date: dateStr,
          plannedDate: dateStr,
          dayNumber: dayIndex,
          relativeDayInWeek,
          weekNumber,
          monthNumber,
          dayOfWeek,
          kpiId: 'projects',
          track: 'Capability & Evidence',
          title: `Project ${project.projectNumber} — Core Implementation Block: ${projectWeeklyMilestone.outputs[1] || 'Core Engine'}`,
          action: `Implement and test: ${projectWeeklyMilestone.outputs[1] || 'Core functional module'}. Write unit tests.`,
          durationHours: 2,
          priority: 'P2 - High',
          status: 'not-started',
          definitionOfDone: 'Code implemented, clean git commit pushed, verified with test invocation.',
          expectedOutput: projectWeeklyMilestone.outputs[1] || 'Functional code module & test suite.',
          evidenceRequired: true,
          dependency: `Project ${project.projectNumber} architecture plan.`,
          whatIfMissed: 'Absorb into Day 5 2h project block.'
        })
      );

      if (weekNumber <= 10) {
        tasks.push(
          applyHistory({
            id: `task-w${weekNumber}-d3-cjca`,
            date: dateStr,
            plannedDate: dateStr,
            dayNumber: dayIndex,
            relativeDayInWeek,
            weekNumber,
            monthNumber,
            dayOfWeek,
            kpiId: 'cjca',
            track: 'Parallel Foundation',
            title: `CJCA — Foundation Module Block (W${weekNumber} Session 2/3)`,
            action: `Complete next security analyst learning unit + lab simulation exercises.`,
            durationHours: 1,
            priority: 'P3 - Foundation',
            status: 'not-started',
            definitionOfDone: 'Learning unit completed + practical exercise verified.',
            expectedOutput: 'Completed learning unit and lab result.',
            evidenceRequired: true,
            dependency: 'Day 1 CJCA session.',
            whatIfMissed: 'Merge with Day 5 CJCA session.'
          })
        );

        tasks.push(
          applyHistory({
            id: `task-w${weekNumber}-d3-mckinsey`,
            date: dateStr,
            plannedDate: dateStr,
            dayNumber: dayIndex,
            relativeDayInWeek,
            weekNumber,
            monthNumber,
            dayOfWeek,
            kpiId: 'mckinsey',
            track: 'Parallel Foundation',
            title: `McKinsey Forward — Leadership & Synthesis (W${weekNumber} Part 2/2)`,
            action: `Complete weekly McKinsey Forward case application and action plan.`,
            durationHours: 1,
            priority: 'P3 - Foundation',
            status: 'not-started',
            definitionOfDone: 'Action plan submitted + peer review checkpoint completed.',
            expectedOutput: 'Weekly McKinsey Forward program milestone complete.',
            evidenceRequired: true,
            dependency: 'Day 1 McKinsey session.',
            whatIfMissed: 'Never postpone across weeks; complete before Day 6 review.'
          })
        );
      }

      if (weekNumber <= 8) {
        tasks.push(
          applyHistory({
            id: `task-w${weekNumber}-d3-aws`,
            date: dateStr,
            plannedDate: dateStr,
            dayNumber: dayIndex,
            relativeDayInWeek,
            weekNumber,
            monthNumber,
            dayOfWeek,
            kpiId: 'aws',
            track: 'Micro-Track',
            title: `AWS Foundation — Session ${awsStartSession + 1}/40 (~50 min)`,
            action: `Complete AWS Cloud Practitioner module lesson + practice knowledge check questions.`,
            durationHours: 0.83,
            priority: 'P3 - Foundation',
            status: 'not-started',
            definitionOfDone: 'Lesson video finished + knowledge check 100% correct.',
            expectedOutput: `AWS session ${awsStartSession + 1} notes & quiz pass.`,
            evidenceRequired: true,
            dependency: 'Day 2 AWS session.',
            whatIfMissed: 'Light micro-track: complete in Day 4 slot.'
          })
        );
      }
    }

    // DAY 4: CTF 2 + CS50 Problem Set + AWS (CPTS 4h + CTF 2h + CS50 2h + AWS ~50m)
    if (relativeDayInWeek === 4) {
      const ctfIndex = (weekNumber - 1) * 3 + 1;
      const ctf = CTF_SCHEDULE[ctfIndex] || CTF_SCHEDULE[1];

      tasks.push(
        applyHistory({
          id: `task-w${weekNumber}-d4-ctf`,
          date: dateStr,
          plannedDate: dateStr,
          dayNumber: dayIndex,
          relativeDayInWeek,
          weekNumber,
          monthNumber,
          dayOfWeek,
          kpiId: 'ctfs',
          track: 'Capability & Evidence',
          title: `CTF 2/3 — Solve ${ctf.boxName} (${ctf.os} - ${ctf.difficulty}) + Full Writeup`,
          action: `Solve ${ctf.boxName}: recon → foothold → privesc → proof capture → writeup. Focus: ${ctf.skillsFocus}.`,
          durationHours: 2,
          priority: 'P2 - High',
          status: 'not-started',
          definitionOfDone: 'Box solved + flags logged + writeup completed.',
          expectedOutput: `Root flag evidence and complete writeup for ${ctf.boxName}.`,
          evidenceRequired: true,
          dependency: 'HTB methodology.',
          whatIfMissed: 'Reschedule box to Day 6 slot.'
        })
      );

      if (weekNumber <= 14) {
        tasks.push(
          applyHistory({
            id: `task-w${weekNumber}-d4-cs50`,
            date: dateStr,
            plannedDate: dateStr,
            dayNumber: dayIndex,
            relativeDayInWeek,
            weekNumber,
            monthNumber,
            dayOfWeek,
            kpiId: 'cs50',
            track: 'Parallel Foundation',
            title: `CS50x Week ${weekNumber} — Problem Set Execution (Part 2/2)`,
            action: `Implement Week ${weekNumber} problem set; debug edge cases and verify 100% test pass via check50.`,
            durationHours: 2,
            priority: 'P2 - High',
            status: 'not-started',
            definitionOfDone: 'Problem set code compiled clean and passed 100% with check50 + submitted via submit50.',
            expectedOutput: `Verified check50 score report for Week ${weekNumber}.`,
            evidenceRequired: true,
            dependency: 'Day 2 CS50 lecture.',
            whatIfMissed: 'Critical foundation: finish problem set before next week lecture.'
          })
        );
      }

      if (weekNumber <= 8) {
        tasks.push(
          applyHistory({
            id: `task-w${weekNumber}-d4-aws`,
            date: dateStr,
            plannedDate: dateStr,
            dayNumber: dayIndex,
            relativeDayInWeek,
            weekNumber,
            monthNumber,
            dayOfWeek,
            kpiId: 'aws',
            track: 'Micro-Track',
            title: `AWS Foundation — Session ${awsStartSession + 2}/40 (~50 min)`,
            action: `Complete AWS Cloud Practitioner module lesson + practice knowledge check questions.`,
            durationHours: 0.83,
            priority: 'P3 - Foundation',
            status: 'not-started',
            definitionOfDone: 'Lesson video finished + knowledge check verified.',
            expectedOutput: `AWS session ${awsStartSession + 2} notes & quiz pass.`,
            evidenceRequired: true,
            dependency: 'Day 3 AWS session.',
            whatIfMissed: 'Light micro-track: complete during Day 5.'
          })
        );
      }
    }

    // DAY 5: Project Integration + CJCA + AWS (CPTS 4h + Project 2h + CJCA 1h + AWS ~50m)
    if (relativeDayInWeek === 5) {
      tasks.push(
        applyHistory({
          id: `task-w${weekNumber}-d5-project`,
          date: dateStr,
          plannedDate: dateStr,
          dayNumber: dayIndex,
          relativeDayInWeek,
          weekNumber,
          monthNumber,
          dayOfWeek,
          kpiId: 'projects',
          track: 'Capability & Evidence',
          title: `Project ${project.projectNumber} — Integration & Testing: ${projectWeeklyMilestone.outputs[2] || 'Integration'}`,
          action: `Implement and verify: ${projectWeeklyMilestone.outputs[2] || 'Integration module'}. Run full integration tests.`,
          durationHours: 2,
          priority: 'P2 - High',
          status: 'not-started',
          definitionOfDone: 'Integration code committed with passing test assertions.',
          expectedOutput: projectWeeklyMilestone.outputs[2] || 'Integration deliverable with tests.',
          evidenceRequired: true,
          dependency: 'Day 3 project code.',
          whatIfMissed: 'Wrap up during Day 6 1h slot.'
        })
      );

      if (weekNumber <= 10) {
        tasks.push(
          applyHistory({
            id: `task-w${weekNumber}-d5-cjca`,
            date: dateStr,
            plannedDate: dateStr,
            dayNumber: dayIndex,
            relativeDayInWeek,
            weekNumber,
            monthNumber,
            dayOfWeek,
            kpiId: 'cjca',
            track: 'Parallel Foundation',
            title: `CJCA — Foundation Module Block (W${weekNumber} Session 3/3)`,
            action: `Complete weekly CJCA synthesis, review questions, and week completion check.`,
            durationHours: 1,
            priority: 'P3 - Foundation',
            status: 'not-started',
            definitionOfDone: 'Weekly review check passed 100% on portal.',
            expectedOutput: `Weekly CJCA milestone completion (3h weekly quota met).`,
            evidenceRequired: true,
            dependency: 'Day 3 CJCA unit.',
            whatIfMissed: 'Complete on Day 6 buffer before week closure.'
          })
        );
      }

      if (weekNumber <= 8) {
        tasks.push(
          applyHistory({
            id: `task-w${weekNumber}-d5-aws`,
            date: dateStr,
            plannedDate: dateStr,
            dayNumber: dayIndex,
            relativeDayInWeek,
            weekNumber,
            monthNumber,
            dayOfWeek,
            kpiId: 'aws',
            track: 'Micro-Track',
            title: `AWS Foundation — Session ${awsStartSession + 3}/40 (~50 min)`,
            action: `Complete AWS Cloud Practitioner module lesson + practice knowledge check questions.`,
            durationHours: 0.83,
            priority: 'P3 - Foundation',
            status: 'not-started',
            definitionOfDone: 'Lesson video finished + knowledge check verified.',
            expectedOutput: `AWS session ${awsStartSession + 3} notes & quiz pass.`,
            evidenceRequired: true,
            dependency: 'Day 4 AWS session.',
            whatIfMissed: 'Complete during Day 6 session.'
          })
        );
      }
    }

    // DAY 6: University Study Day & Weekly Review (CPTS 4h + Project 1h + CTF 2h + GPA 1h + AWS ~50m + Weekly Review)
    if (relativeDayInWeek === 6) {
      const ctfIndex = (weekNumber - 1) * 3 + 2;
      const ctf = CTF_SCHEDULE[ctfIndex] || CTF_SCHEDULE[2];

      tasks.push(
        applyHistory({
          id: `task-w${weekNumber}-d6-ctf`,
          date: dateStr,
          plannedDate: dateStr,
          dayNumber: dayIndex,
          relativeDayInWeek,
          weekNumber,
          monthNumber,
          dayOfWeek,
          kpiId: 'ctfs',
          track: 'Capability & Evidence',
          title: `CTF 3/3 — Solve ${ctf.boxName} (${ctf.os} - ${ctf.difficulty}) + Full Writeup`,
          action: `Solve ${ctf.boxName}: recon → foothold → privesc → proof capture → writeup. Focus: ${ctf.skillsFocus}.`,
          durationHours: 2,
          priority: 'P2 - High',
          status: 'not-started',
          definitionOfDone: 'Box solved + proofs captured + writeup completed.',
          expectedOutput: `User & Root proof evidence + writeup for ${ctf.boxName}. (3/3 for W${weekNumber})`,
          evidenceRequired: true,
          dependency: 'HTB lab connectivity.',
          whatIfMissed: 'Weekly CTF target at risk. Log in Day 6 deep review.'
        })
      );

      tasks.push(
        applyHistory({
          id: `task-w${weekNumber}-d6-project`,
          date: dateStr,
          plannedDate: dateStr,
          dayNumber: dayIndex,
          relativeDayInWeek,
          weekNumber,
          monthNumber,
          dayOfWeek,
          kpiId: 'projects',
          track: 'Capability & Evidence',
          title: `Project ${project.projectNumber} — Weekly Output Packaging & DoD Check`,
          action: `Finalize week ${weekNumber} deliverable: ${projectWeeklyMilestone.outputs[3] || 'Weekly integration deliverable'}. Verify Definition of Done.`,
          durationHours: 1,
          priority: 'P2 - High',
          status: 'not-started',
          definitionOfDone: 'All 4 weekly outputs verified and pushed to repo branch.',
          expectedOutput: projectWeeklyMilestone.outputs[3] || 'Weekly milestone completion artifact.',
          evidenceRequired: true,
          dependency: 'Day 5 project code.',
          whatIfMissed: 'Flag in Weekly Review; reduce derived portfolio overhead.'
        })
      );

      // University Academic Closure (Mandatory Day 6 — Thursday equivalent)
      tasks.push(
        applyHistory({
          id: `task-w${weekNumber}-d6-gpa`,
          date: dateStr,
          plannedDate: dateStr,
          dayNumber: dayIndex,
          relativeDayInWeek,
          weekNumber,
          monthNumber,
          dayOfWeek,
          kpiId: 'gpa',
          track: 'University Academic',
          title: `GPA / University — Academic Closure & Assessment Check`,
          action: `Complete weekly academic closure: log completed material, unresolved questions, assessment deadlines, and next actions.`,
          durationHours: 1.5,
          priority: 'P1 - Anchor',
          status: 'not-started',
          definitionOfDone: 'Academic closure log completed: 1) Completed sections, 2) Unresolved material, 3) Assessment status, 4) Next required task.',
          expectedOutput: 'Weekly Academic Closure record in university study log.',
          evidenceRequired: true,
          dependency: 'Day 1 & Day 5 study sessions.',
          whatIfMissed: 'Non-negotiable academic requirement. Do not skip; academic health is Tier 1.',
          isUniversityDay: true
        })
      );

      if (weekNumber <= 8) {
        tasks.push(
          applyHistory({
            id: `task-w${weekNumber}-d6-aws`,
            date: dateStr,
            plannedDate: dateStr,
            dayNumber: dayIndex,
            relativeDayInWeek,
            weekNumber,
            monthNumber,
            dayOfWeek,
            kpiId: 'aws',
            track: 'Micro-Track',
            title: `AWS Foundation — Session ${awsStartSession + 4}/40 (~50 min)`,
            action: `Complete AWS Cloud Practitioner weekly capstone lesson + domain quiz.`,
            durationHours: 0.83,
            priority: 'P3 - Foundation',
            status: 'not-started',
            definitionOfDone: `Weekly 5-session AWS quota achieved (5/5 for Week ${weekNumber}).`,
            expectedOutput: `AWS session ${awsStartSession + 4} notes & weekly quiz pass.`,
            evidenceRequired: true,
            dependency: 'Day 5 AWS session.',
            whatIfMissed: 'Must be completed before Day 7 deep work.'
          })
        );
      }

      // Day 6 Weekly Deep Review Task
      tasks.push(
        applyHistory({
          id: `task-w${weekNumber}-d6-review`,
          date: dateStr,
          plannedDate: dateStr,
          dayNumber: dayIndex,
          relativeDayInWeek,
          weekNumber,
          monthNumber,
          dayOfWeek,
          kpiId: 'cpts',
          track: 'Core Anchor',
          title: `Weekly Deep Review & Next Week Restructure (Week ${weekNumber})`,
          action: `Conduct comprehensive review: KPI movement, Planned vs Actual, friction, capacity analysis, delayed tasks, and next week objectives.`,
          durationHours: 0.5,
          priority: 'P1 - Anchor',
          status: 'not-started',
          definitionOfDone: 'All review steps completed in Weekly Review console.',
          expectedOutput: `Week ${weekNumber} Deep Review record & finalized Week ${weekNumber + 1} task pool.`,
          evidenceRequired: false,
          dependency: 'Completion of Day 6 operating tasks.',
          whatIfMissed: 'Must be done before starting next week.'
        })
      );
    }
  }

  return tasks;
}

export const INITIAL_FIREWALL_LOGS = [
  {
    id: 'fw-1',
    date: '2026-10-06',
    opportunityName: 'Invitation to participate in external weekend Web3 capture-the-flag',
    whatItOffers: 'Networking with smart contract developers and prize pool chance.',
    whatItWouldConsume: 'Estimated 15–20 hours over the upcoming weekend.',
    sacrificedKpi: 'Would completely compromise CPTS 4h daily anchor and VULNEX deep work.',
    decision: 'Rejected' as const,
    revisitDate: '2027-01-20',
    notes: 'Classic high-context shiny distraction. Does not align with Operation Dexter core offensive track. Rejected immediately per firewall rule.'
  },
  {
    id: 'fw-2',
    date: '2026-10-09',
    opportunityName: '50% promotional voucher on secondary third-party certification exam',
    whatItOffers: 'Discounted certification attempt voucher valid for 90 days.',
    whatItWouldConsume: 'Preparation time (~40 hours) competing directly with CPTS curriculum.',
    sacrificedKpi: 'CPTS offensive anchor and Project 2 build.',
    decision: 'Postponed' as const,
    revisitDate: '2027-01-16',
    notes: 'Certification collecting trap. CPTS is the single non-negotiable core offensive anchor. Postponed until after 112-day lock-in.'
  }
];
