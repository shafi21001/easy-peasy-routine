import { describe, it, expect } from 'vitest';
import { checkConflicts } from '../src/lib/conflicts';
import { GridData, Day } from '../src/types';

describe('checkConflicts', () => {
  const mockGridData: GridData = {
    saturday: [
      [
        { courseCode: 'CS101', teacherShort: 'T1', room: 'R1' },
        { courseCode: 'CS101', teacherShort: 'T1', room: 'R1', merged: { startCol: 0, colspan: 2 } },
        { courseCode: 'MA101', teacherShort: 'T2', room: 'R2' },
        { courseCode: 'PH101', teacherShort: 'T3', room: 'R3' },
        { courseCode: 'CH101', teacherShort: 'T4', room: 'R4' },
        { courseCode: 'BI101', teacherShort: 'T5', room: 'R5' },
        { courseCode: 'AR101', teacherShort: 'T6', room: 'R6' },
        { courseCode: 'HI101', teacherShort: 'T7', room: 'R7' },
      ],
      [
        { courseCode: 'CS102', teacherShort: 'T8', room: 'R8' },
        { courseCode: 'CS102', teacherShort: 'T8', room: 'R8', merged: { startCol: 0, colspan: 2 } },
        { courseCode: 'MA102', teacherShort: 'T9', room: 'R9' },
        { courseCode: 'PH102', teacherShort: 'T10', room: 'R10' },
        { courseCode: 'CH102', teacherShort: 'T11', room: 'R11' },
        { courseCode: 'BI102', teacherShort: 'T12', room: 'R12' },
        { courseCode: 'AR102', teacherShort: 'T13', room: 'R13' },
        { courseCode: 'HI102', teacherShort: 'T14', room: 'R14' },
      ],
    ],
    sunday: [
      [
        { courseCode: 'CS103', teacherShort: 'T1', room: 'R1' },
        { courseCode: 'CS103', teacherShort: 'T1', room: 'R1', merged: { startCol: 0, colspan: 2 } },
        { courseCode: 'MA103', teacherShort: 'T2', room: 'R2' },
        { courseCode: 'PH103', teacherShort: 'T3', room: 'R3' },
        { courseCode: 'CH103', teacherShort: 'T4', room: 'R4' },
        { courseCode: 'BI103', teacherShort: 'T5', room: 'R5' },
        { courseCode: 'AR103', teacherShort: 'T6', room: 'R6' },
        { courseCode: 'HI103', teacherShort: 'T7', room: 'R7' },
      ],
    ],
    monday: [],
    tuesday: [],
    wednesday: [],
  };

  it('should return no conflicts if no overlapping assignments', () => {
    const result = checkConflicts(mockGridData, 'saturday', 0, 2, 1, { teacherShort: 'T15', room: 'R15' });
    expect(result.teacherConflicts).toEqual([]);
    expect(result.roomConflicts).toEqual([]);
  });

  it('should detect teacher conflict for overlapping time slot', () => {
    const result = checkConflicts(mockGridData, 'saturday', 1, 0, 1, { teacherShort: 'T1', room: 'R15' });
    expect(result.teacherConflicts).toEqual(['Teacher T1 is already assigned to Batch 1 at saturday, slot 1']);
    expect(result.roomConflicts).toEqual([]);
  });

  it('should detect room conflict for overlapping time slot', () => {
    const result = checkConflicts(mockGridData, 'saturday', 1, 0, 1, { teacherShort: 'T15', room: 'R1' });
    expect(result.roomConflicts).toEqual(['Room R1 is already occupied by Batch 1 at saturday, slot 1']);
    expect(result.teacherConflicts).toEqual([]);
  });

  it('should detect both teacher and room conflicts', () => {
    const result = checkConflicts(mockGridData, 'saturday', 1, 0, 1, { teacherShort: 'T1', room: 'R1' });
    expect(result.teacherConflicts).toEqual(['Teacher T1 is already assigned to Batch 1 at saturday, slot 1']);
    expect(result.roomConflicts).toEqual(['Room R1 is already occupied by Batch 1 at saturday, slot 1']);
  });

  it('should handle merged cells correctly for conflicts', () => {
    // T1 is assigned to slot 0 and 1 (merged)
    const result = checkConflicts(mockGridData, 'saturday', 1, 1, 1, { teacherShort: 'T1', room: 'R15' });
    expect(result.teacherConflicts).toEqual(['Teacher T1 is already assigned to Batch 1 at saturday, slot 1']);
    expect(result.roomConflicts).toEqual([]);
  });

  it('should not conflict with itself when editing the same cell', () => {
    const result = checkConflicts(mockGridData, 'saturday', 0, 0, 1, { teacherShort: 'T1', room: 'R1' });
    expect(result.teacherConflicts).toEqual([]);
    expect(result.roomConflicts).toEqual([]);
  });

  it('should detect conflict across merged cells', () => {
    // T1 is in batch 0, slots 0-1. Try to assign T1 to batch 1, slot 0-1 (merged)
    const result = checkConflicts(mockGridData, 'saturday', 1, 0, 2, { teacherShort: 'T1', room: 'R15' });
    expect(result.teacherConflicts).toEqual(['Teacher T1 is already assigned to Batch 1 at saturday, slot 1']);
    expect(result.roomConflicts).toEqual([]);
  });

  it('should detect conflict when new assignment spans over existing merged cell', () => {
    // T1 is in batch 0, slots 0-1. Try to assign T1 to batch 1, slot 0 (single)
    const result = checkConflicts(mockGridData, 'saturday', 1, 0, 1, { teacherShort: 'T1', room: 'R15' });
    expect(result.teacherConflicts).toEqual(['Teacher T1 is already assigned to Batch 1 at saturday, slot 1']);
    expect(result.roomConflicts).toEqual([]);
  });
});