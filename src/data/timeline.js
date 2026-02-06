// Semester timeline data
export const timeline = [
  { week: 4, date: 'Feb 3', current: true, items: [] },
  { week: 5, date: 'Feb 10', items: [{ course: 'BIO 201', name: 'Lab Report #3', type: 'lab' }] },
  { week: 6, date: 'Feb 17', items: [
    { course: 'BIO 201', name: 'Midterm', type: 'exam' },
    { course: 'PSYCH 101', name: 'Case Study', type: 'paper' }
  ]},
  { week: 8, date: 'Mar 3', items: [{ course: 'ECON 202', name: 'Midterm', type: 'exam' }] },
  { week: 10, date: 'Mar 17', items: [{ course: 'ENG 215', name: 'Research Paper', type: 'paper' }] },
  { week: 13, date: 'Apr 7', items: [
    { course: 'BIO 201', name: 'Final', type: 'exam' },
    { course: 'PSYCH 101', name: 'Final', type: 'exam' }
  ]},
  { week: 14, date: 'Apr 14', items: [
    { course: 'ECON 202', name: 'Final', type: 'exam' },
    { course: 'ENG 215', name: 'Final Essay', type: 'paper' }
  ]},
];

export const semesterInfo = {
  currentWeek: 4,
  totalWeeks: 14,
  startDate: 'Jan 13',
  endDate: 'Apr 14',
  percentComplete: 29
};
