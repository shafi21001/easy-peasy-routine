export type Day = 'saturday' | 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';

export type Cell = {
  courseCode?: string;
  teacherShort?: string;
  room?: string;
  merged?: { startCol: number; colspan: number } | null;
};

export type GridData = Record<Day, Cell[][]>;

export type MergedRange = {
  day: Day;
  row: number;
  startCol: number;
  colspan: number;
};

export type Teacher = {
  fullName: string;
  shortName: string;
  department: string;
};

export type Room = {
  name: string;
};

export type Course = {
  batchName: string;
  courseCode: string;
  courseName: string;
  teacherShort: string;
};

export type Batch = {
  name: string;
  numCourses: number;
};

export type AppState = {
  universityName: string;
  departmentName: string;
  batches: Batch[];
  teachers: Teacher[];
  rooms: Room[];
  courses: Course[];
  effectiveFrom: string;
  grid: GridData;
  mergedRanges: MergedRange[];
  activeBatchIndicesByDay?: Record<Day, number[]>;
};

export type Snapshot = {
  id: string;
  name: string;
  date: string;
  appState: AppState;
};