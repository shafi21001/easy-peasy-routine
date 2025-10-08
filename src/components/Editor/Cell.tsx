import React from 'react';
import { Cell as CellType } from '../../types';

interface CellProps {
  cellData: CellType;
  day: string;
  batchIndex: number;
  timeslotIndex: number;
  onClick: (day: string, batchIndex: number, timeslotIndex: number) => void;
}

const Cell: React.FC<CellProps> = ({ cellData, day, batchIndex, timeslotIndex, onClick }) => {
  const { courseCode, teacherShort, room, merged } = cellData;

  const handleClick = () => {
    onClick(day, batchIndex, timeslotIndex);
  };

  if (merged && merged.startCol !== timeslotIndex) {
    // This cell is part of a merged block but not the starting cell, so don't render it.
    return null;
  }

  const colSpan = merged ? merged.colspan : 1;

  return (
    <div
      className={`border p-2 text-center flex flex-col justify-center items-center overflow-hidden cursor-pointer hover:bg-gray-50
        ${courseCode ? 'bg-blue-100 border-blue-300' : 'bg-white'}
        ${merged ? 'border-r-2 border-r-blue-400' : ''}
      `}
      data-day={day}
      data-row={batchIndex}
      data-col={timeslotIndex}
      onClick={handleClick}
      style={merged ? { gridColumn: `${timeslotIndex + 1} / span ${colSpan}` } : {}}
    >
      {courseCode && <span className="font-semibold text-sm">{courseCode}</span>}
      {teacherShort && <span className="text-xs text-gray-700">{teacherShort}</span>}
      {room && <span className="text-xs text-gray-600">{room}</span>}
      {!courseCode && !teacherShort && !room && (
        <span className="text-xs text-gray-400">Click to edit</span>
      )}
    </div>
  );
};

export default Cell;