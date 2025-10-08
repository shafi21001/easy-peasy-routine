import { describe, it, expect, beforeEach } from 'vitest';
import { AppState, Cell, GridData, Day } from '../src/types';

describe('Editor Cell Logic (Merging/Unmerging)', () => {
  let mockAppState: AppState;
  const daysOfWeek: Day[] = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday'];
  const timeSlots = Array.from({ length: 8 }, (_, i) => i);

  beforeEach(() => {
    mockAppState = {
      universityName: 'Test Uni',
      departmentName: 'Test Dept',
      batches: [{ name: 'Batch 1', numCourses: 5 }, { name: 'Batch 2', numCourses: 5 }],
      teachers: [{ fullName: 'Dr. Test', shortName: 'DT', department: 'CS' }],
      rooms: [{ name: 'R1' }],
      courses: [{ batchName: 'Batch 1', courseCode: 'TC101', courseName: 'Test Course', teacherShort: 'DT' }],
      effectiveFrom: '2025-01-01',
      grid: {},
      mergedRanges: [],
    };

    // Initialize grid
    const newGrid: GridData = {};
    daysOfWeek.forEach(day => {
      newGrid[day] = Array(mockAppState.batches.length).fill(null).map(() => Array(timeSlots.length).fill({}));
    });
    mockAppState.grid = newGrid;
  });

  // Helper function to simulate applyCellChange logic for testing
  const simulateApplyCellChange = (
    appState: AppState,
    day: Day,
    batchIndex: number,
    timeslotIndex: number,
    newCellData: Cell,
    mergeWithNext: boolean
  ): AppState => {
    const newGrid = JSON.parse(JSON.stringify(appState.grid)); // Deep copy
    const newMergedRanges = JSON.parse(JSON.stringify(appState.mergedRanges)); // Deep copy

    // Clear existing merge if this cell was part of one
    const existingMergeIndex = newMergedRanges.findIndex(
      mr => mr.day === day && mr.row === batchIndex && mr.startCol <= timeslotIndex && (mr.startCol + mr.colspan) > timeslotIndex
    );
    if (existingMergeIndex !== -1) {
      const existingMerge = newMergedRanges[existingMergeIndex];
      for (let i = 0; i < existingMerge.colspan; i++) {
        const colToClear = existingMerge.startCol + i;
        if (newGrid[day]?.[batchIndex]?.[colToClear]) {
          newGrid[day][batchIndex][colToClear] = {};
        }
      }
      newMergedRanges.splice(existingMergeIndex, 1);
    }

    let cellToUpdate: Cell = { ...newCellData };

    if (mergeWithNext && timeslotIndex < timeSlots.length - 1) {
      cellToUpdate.merged = { startCol: timeslotIndex, colspan: 2 };

      // Mark the next cell as merged into this one
      if (newGrid[day]?.[batchIndex]?.[timeslotIndex + 1]) {
        newGrid[day][batchIndex][timeslotIndex + 1] = { ...newGrid[day][batchIndex][timeslotIndex + 1], merged: { startCol: timeslotIndex, colspan: 2 } };
      }
      newMergedRanges.push({ day, row: batchIndex, startCol: timeslotIndex, colspan: 2 });
    }

    if (newGrid[day]?.[batchIndex]) {
      newGrid[day][batchIndex][timeslotIndex] = cellToUpdate;
    }

    return { ...appState, grid: newGrid, mergedRanges: newMergedRanges };
  };

  it('should merge two cells horizontally', () => {
    const day: Day = 'saturday';
    const batchIndex = 0;
    const timeslotIndex = 0;
    const newCellData: Cell = { courseCode: 'TC101', teacherShort: 'DT', room: 'R1' };

    const updatedAppState = simulateApplyCellChange(mockAppState, day, batchIndex, timeslotIndex, newCellData, true);

    expect(updatedAppState.grid[day][batchIndex][timeslotIndex].merged).toEqual({ startCol: 0, colspan: 2 });
    expect(updatedAppState.grid[day][batchIndex][timeslotIndex + 1].merged).toEqual({ startCol: 0, colspan: 2 });
    expect(updatedAppState.mergedRanges).toEqual([{ day, row: batchIndex, startCol: 0, colspan: 2 }]);
  });

  it('should unmerge cells and clear absorbed cells', () => {
    const day: Day = 'saturday';
    const batchIndex = 0;
    const timeslotIndex = 0;
    const newCellData: Cell = { courseCode: 'TC101', teacherShort: 'DT', room: 'R1' };

    // First, merge cells
    let updatedAppState = simulateApplyCellChange(mockAppState, day, batchIndex, timeslotIndex, newCellData, true);

    // Now, unmerge by saving the first cell without mergeWithNext
    updatedAppState = simulateApplyCellChange(updatedAppState, day, batchIndex, timeslotIndex, { courseCode: 'TC101', teacherShort: 'DT', room: 'R1' }, false);

    expect(updatedAppState.grid[day][batchIndex][timeslotIndex].merged).toBeUndefined();
    expect(updatedAppState.grid[day][batchIndex][timeslotIndex + 1]).toEqual({}); // Should be cleared
    expect(updatedAppState.mergedRanges).toEqual([]);
  });

  it('should replace content of a merged cell when unmerging', () => {
    const day: Day = 'saturday';
    const batchIndex = 0;
    const timeslotIndex = 0;
    const newCellData: Cell = { courseCode: 'TC101', teacherShort: 'DT', room: 'R1' };

    // First, merge cells
    let updatedAppState = simulateApplyCellChange(mockAppState, day, batchIndex, timeslotIndex, newCellData, true);

    // Now, save the first cell with different content and unmerge
    const newContent: Cell = { courseCode: 'TC102', teacherShort: 'DT', room: 'R1' };
    updatedAppState = simulateApplyCellChange(updatedAppState, day, batchIndex, timeslotIndex, newContent, false);

    expect(updatedAppState.grid[day][batchIndex][timeslotIndex]).toEqual(newContent);
    expect(updatedAppState.grid[day][batchIndex][timeslotIndex].merged).toBeUndefined();
    expect(updatedAppState.grid[day][batchIndex][timeslotIndex + 1]).toEqual({});
    expect(updatedAppState.mergedRanges).toEqual([]);
  });

  it('should handle saving a single cell without merging', () => {
    const day: Day = 'saturday';
    const batchIndex = 0;
    const timeslotIndex = 0;
    const newCellData: Cell = { courseCode: 'TC101', teacherShort: 'DT', room: 'R1' };

    const updatedAppState = simulateApplyCellChange(mockAppState, day, batchIndex, timeslotIndex, newCellData, false);

    expect(updatedAppState.grid[day][batchIndex][timeslotIndex]).toEqual(newCellData);
    expect(updatedAppState.grid[day][batchIndex][timeslotIndex].merged).toBeUndefined();
    expect(updatedAppState.mergedRanges).toEqual([]);
  });

  it('should clear a cell', () => {
    const day: Day = 'saturday';
    const batchIndex = 0;
    const timeslotIndex = 0;
    const initialCellData: Cell = { courseCode: 'TC101', teacherShort: 'DT', room: 'R1' };

    // Set initial cell data
    mockAppState.grid[day][batchIndex][timeslotIndex] = initialCellData;

    const updatedAppState = simulateApplyCellChange(mockAppState, day, batchIndex, timeslotIndex, {}, false);

    expect(updatedAppState.grid[day][batchIndex][timeslotIndex]).toEqual({});
    expect(updatedAppState.mergedRanges).toEqual([]);
  });
});