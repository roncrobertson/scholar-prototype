// Course data - this would eventually come from your API/LMS integration
export const courses = [
  {
    id: 'bio201',
    code: 'BIO 201',
    name: 'Cell Biology',
    color: '#10B981',
    instructor: {
      name: 'Dr. Sarah Martinez',
      initials: 'SM',
      style: 'Emphasizes conceptual understanding. Loves diagram-based questions.',
      tip: 'Exam questions come from lecture examples, not just textbook.'
    },
    grade: 78,
    target: 85,
    schedule: 'MWF 10am',
    room: 'Science 204',
    nextClass: 'Tomorrow 10am',
    latePolicy: { type: 'penalty', details: '10% per day, max 3 days' },
    missingWork: [
      { name: 'Lab Report #2', original: 30, recoverable: 21, deadline: 'Feb 8' }
    ],
    masteryTopics: [
      { name: 'Cell Membrane', mastery: 92 },
      { name: 'Protein Synthesis', mastery: 78 },
      { name: 'Cell Division', mastery: 65 },
      { name: 'Cell Signaling', mastery: 45 }
    ],
    upcoming: [
      { type: 'exam', name: 'Midterm', due: 'Feb 18', points: 100, weight: '25%' },
      { type: 'lab', name: 'Lab Report #3', due: 'Feb 10', points: 30 }
    ]
  },
  {
    id: 'psych101',
    code: 'PSYCH 101',
    name: 'Intro to Psychology',
    color: '#8B5CF6',
    instructor: {
      name: 'Prof. James Wright',
      initials: 'JW',
      style: 'Discussion-heavy. Participation counts.',
      tip: 'Come with one question from reading—he notices engagement.'
    },
    grade: 88,
    target: 90,
    schedule: 'TTh 2pm',
    room: 'Psych 110',
    nextClass: 'Today 2pm',
    latePolicy: { type: 'flexible', details: '2 free late passes per semester' },
    missingWork: [],
    masteryTopics: [
      { name: 'Research Methods', mastery: 95 },
      { name: 'Biological Bases', mastery: 85 },
      { name: 'Learning', mastery: 72 },
      { name: 'Memory', mastery: 40 }
    ],
    upcoming: [
      { type: 'quiz', name: 'Quiz #4', due: 'Feb 6', points: 20 },
      { type: 'paper', name: 'Case Study', due: 'Feb 15', points: 50 }
    ]
  },
  {
    id: 'econ202',
    code: 'ECON 202',
    name: 'Microeconomics',
    color: '#F59E0B',
    instructor: {
      name: 'Dr. Lisa Chen',
      initials: 'LC',
      style: 'Quantitative focus. Problem sets are key.',
      tip: 'Problem sets are harder than exams—master those first.'
    },
    grade: 82,
    target: 85,
    schedule: 'MWF 1pm',
    room: 'Business 301',
    nextClass: 'Tomorrow 1pm',
    latePolicy: { type: 'strict', details: 'No late work accepted' },
    missingWork: [],
    masteryTopics: [
      { name: 'Supply & Demand', mastery: 90 },
      { name: 'Elasticity', mastery: 85 },
      { name: 'Consumer Theory', mastery: 70 },
      { name: 'Market Structures', mastery: 55 }
    ],
    upcoming: [
      { type: 'homework', name: 'Problem Set #5', due: 'Feb 7', points: 25 }
    ]
  },
  {
    id: 'eng215',
    code: 'ENG 215',
    name: 'American Literature',
    color: '#EC4899',
    instructor: {
      name: 'Prof. Michael Torres',
      initials: 'MT',
      style: 'Values original interpretation. Close reading is essential.',
      tip: 'Connect texts to each other and contemporary issues.'
    },
    grade: 91,
    target: 93,
    schedule: 'TTh 11am',
    room: 'Humanities 205',
    nextClass: 'Today 11am',
    latePolicy: { type: 'penalty', details: '5% per day, up to 1 week' },
    missingWork: [],
    masteryTopics: [
      { name: 'Literary Analysis', mastery: 88 },
      { name: 'American Romanticism', mastery: 85 },
      { name: 'Modernism', mastery: 70 }
    ],
    upcoming: [
      { type: 'reading', name: 'Gatsby Ch. 5-7', due: 'Today', points: 0 },
      { type: 'paper', name: 'Comparative Essay', due: 'Feb 12', points: 40 }
    ]
  }
];

export const getCourseById = (id) => courses.find(c => c.id === id);
export const getTodaysClasses = () => courses.filter(c => c.nextClass.includes('Today'));
export const getCoursesWithMissingWork = () => courses.filter(c => c.missingWork.length > 0);

/** Number of courses where grade >= target - 3 */
export const getOnTrackCount = () =>
  courses.filter((c) => c.grade >= c.target - 3).length;

/** True when student has no missing work and all courses are on track (grade >= target - 3). Scholar "stays quiet" in this state. */
export function isOnTrack() {
  if (getCoursesWithMissingWork().length > 0) return false;
  return getOnTrackCount() === courses.length;
}

/** Count of high-level "tasks to stay on track": missing work + prep for exams + practice weak areas. Capped for display. */
export function getTasksToStayOnTrackCount() {
  const missingCount = courses.reduce((s, c) => s + c.missingWork.length, 0);
  const hasExamSoon = courses.some((c) => c.upcoming?.some((u) => u.type === 'exam' || u.type === 'quiz'));
  const hasCourseBelowTarget = courses.some((c) => c.grade < c.target - 3);
  let n = missingCount + (hasExamSoon ? 1 : 0) + (hasCourseBelowTarget ? 1 : 0);
  return Math.min(n, 9);
}

/** Focus time available today (hours). Prototype: constant. */
export const FOCUS_TIME_HOURS = 4.5;
export function getFocusTimeAvailable() {
  return FOCUS_TIME_HOURS;
}

/** Course with soonest recoverable work; else course with nearest exam; else lowest avg mastery */
export function getRecommendedNext() {
  const withMissing = getCoursesWithMissingWork();
  if (withMissing.length > 0) {
    const c = withMissing[0];
    const work = c.missingWork[0];
    return { type: 'recovery', course: c, label: `Submit ${work.name}`, sublabel: `${c.code} • Due ${work.deadline}` };
  }
  const withExams = courses.filter((c) => c.upcoming.some((u) => u.type === 'exam'));
  if (withExams.length > 0) {
    const c = withExams[0];
    const exam = c.upcoming.find((u) => u.type === 'exam');
    return { type: 'prep', course: c, label: `Prep for ${exam.name}`, sublabel: `${c.code} • Due ${exam.due}` };
  }
  const avgMastery = (c) => c.masteryTopics.reduce((s, t) => s + t.mastery, 0) / c.masteryTopics.length;
  const byMastery = [...courses].sort((a, b) => avgMastery(a) - avgMastery(b));
  const c = byMastery[0];
  const low = c.masteryTopics.find((t) => t.mastery < 70) || c.masteryTopics[c.masteryTopics.length - 1];
  return { type: 'practice', course: c, label: 'Practice weak areas', sublabel: `${c.code} • ${low.name} (${low.mastery}%)` };
}

/** Grade trajectory for "Here's your path to a B+": current, target, focus areas (lowest mastery topics). */
export function getGradeTrajectory(course) {
  if (!course?.masteryTopics?.length) return { current: course?.grade, target: course?.target, focusAreas: [], targetLabel: course?.target ? `${course.target}%` : 'target' };
  const sorted = [...course.masteryTopics].sort((a, b) => a.mastery - b.mastery);
  const focusAreas = sorted.slice(0, 2).map((t) => ({ name: t.name, mastery: t.mastery }));
  const targetLabel = course.target >= 90 ? 'A' : course.target >= 80 ? 'B+' : course.target >= 70 ? 'C+' : `${course.target}%`;
  return {
    current: course.grade,
    target: course.target,
    focusAreas,
    targetLabel,
    gap: Math.max(0, course.target - course.grade),
  };
}
