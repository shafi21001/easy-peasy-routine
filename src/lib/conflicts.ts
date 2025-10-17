import { GridData, Day } from '../types';

interface TentativeAssignment {
  teacherShort?: string;
  room?: string;
}

// Time slots mapping based on the actual schedule
const timeSlots = [
  '09:00-09:50',
  '10:00-10:50',
  '11:00-11:50',
  '12:00-12:50',
  '01:00-02:00', // Lunch/Prayer Break
  '02:00-02:50',
  '03:00-03:50',
  '04:00-04:50',
];

const getTimeSlotString = (startCol: number, colspan: number): string => {
  const startTime = timeSlots[startCol] ? timeSlots[startCol].split('-')[0] : `${startCol + 9}:00`;
  const endIndex = startCol + colspan - 1;
  const endTime = timeSlots[endIndex] ? timeSlots[endIndex].split('-')[1] : `${endIndex + 10}:00`;
  return `${startTime}-${endTime}`;
};

export const checkConflicts = (
  gridData: GridData,
  currentDay: Day,
  currentRow: number,
  currentStartCol: number,
  currentColspan: number,
  tentativeAssignment: TentativeAssignment
): { teacherConflicts: string[]; roomConflicts: string[] } => {
  const teacherConflicts = new Set<string>();
  const roomConflicts = new Set<string>();

  const { teacherShort, room } = tentativeAssignment;

  if (!teacherShort && !room) {
    return { teacherConflicts: [], roomConflicts: [] };
  }

  const dayGrid = gridData[currentDay];
  if (!dayGrid || dayGrid.length === 0) return { teacherConflicts: [], roomConflicts: [] };

  for (let batchIndex = 0; batchIndex < dayGrid.length; batchIndex++) {
    const batchRow = dayGrid[batchIndex];
    if (!batchRow) continue;

    for (let colIndex = 0; colIndex < batchRow.length; colIndex++) {
      const cell = batchRow[colIndex];
      if (!cell || (!cell.courseCode && !cell.teacherShort && !cell.room)) continue; // Skip empty cells

      const cellStartCol = cell.merged?.startCol !== undefined ? cell.merged.startCol : colIndex;
      const cellColspan = cell.merged?.colspan || 1;

      // Skip the cell being currently edited
      const isCurrentCell = (batchIndex === currentRow && cellStartCol === currentStartCol);
      if (isCurrentCell) continue;

      // Check for overlap in time slots
      const overlap = (
        (currentStartCol < cellStartCol + cellColspan) &&
        (cellStartCol < currentStartCol + currentColspan)
      );

      if (overlap) {
        if (teacherShort && cell.teacherShort === teacherShort) {
          const batchName = `Batch ${batchIndex + 1}`;
          const timeSlot = getTimeSlotString(cellStartCol, cellColspan);
          teacherConflicts.add(`Teacher ${teacherShort} is already assigned to ${batchName} at ${currentDay}, ${timeSlot}`);
        }
        if (room && cell.room === room) {
          const batchName = `Batch ${batchIndex + 1}`;
          const timeSlot = getTimeSlotString(cellStartCol, cellColspan);
          roomConflicts.add(`Room ${room} is already occupied by ${batchName} at ${currentDay}, ${timeSlot}`);
        }
      }
    }
  }

  return { teacherConflicts: Array.from(teacherConflicts), roomConflicts: Array.from(roomConflicts) };
};