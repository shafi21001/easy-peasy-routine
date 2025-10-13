import { GridData, Day, MergedRange } from '../types';

interface TentativeAssignment {
  teacherShort?: string;
  room?: string;
}

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
          const timeSlot = `${cellStartCol + 8}:00-${cellStartCol + cellColspan + 8}:00`;
          teacherConflicts.add(`Teacher ${teacherShort} is already assigned to ${batchName} at ${currentDay}, ${timeSlot}`);
        }
        if (room && cell.room === room) {
          const batchName = `Batch ${batchIndex + 1}`;
          const timeSlot = `${cellStartCol + 8}:00-${cellStartCol + cellColspan + 8}:00`;
          roomConflicts.add(`Room ${room} is already occupied by ${batchName} at ${currentDay}, ${timeSlot}`);
        }
      }
    }
  }

  return { teacherConflicts: Array.from(teacherConflicts), roomConflicts: Array.from(roomConflicts) };
};