import React from 'react';
import { GridData, Batch, Day as DayType, Cell as CellType } from '../../types';

interface GridProps {
  gridData: GridData;
  batches: Batch[];
  onCellClick: (day: DayType, batchIndex: number, timeslotIndex: number) => void;
  activeBatchIndicesByDay?: Record<DayType, number[]>;
  highlightTeacher?: string;
}

const daysOfWeek: DayType[] = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday'];

// Fixed headers matching the reference PDF
const timeHeaders = [
  '09:00-09:50',
  '10:00-10:50',
  '11:00-11:50',
  '12:00-12:50',
  '01:00-02:00', // Lunch/Prayer Break
  '02:00-02:50',
  '03:00-03:50',
  '04:00-04:50',
];

const LUNCH_INDEX = 4; // 0-based index for '01:00-02:00'

const Grid: React.FC<GridProps> = ({ gridData, batches, onCellClick, activeBatchIndicesByDay, highlightTeacher }) => {
  if (batches.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        <p>No batches available. Please create a routine using the Wizard first.</p>
      </div>
    );
  }

  // Tune sizing for typical 6–7 batches
  const manyBatches = batches.length >= 7;
  const textSizeClass = manyBatches ? 'text-[10px]' : 'text-[11px]';
  const cellPaddingY = manyBatches ? 'py-1.5' : 'py-2';
  const headerPaddingY = manyBatches ? 'py-1.5' : 'py-2';

  const handleCellClick = (day: DayType, batchIndex: number, timeslotIndex: number) => {
    if (timeslotIndex === LUNCH_INDEX) return; // Non-interactive lunch column
    onCellClick(day, batchIndex, timeslotIndex);
  };

  // Determine total number of body rows across all days to support a single merged lunch column
  const activeIndicesByDay: Record<DayType, number[]> = Object.fromEntries(
    daysOfWeek.map((d) => [d, activeBatchIndicesByDay?.[d] ?? batches.map((_, i) => i)])
  ) as Record<DayType, number[]>;
  const totalBodyRows = daysOfWeek.reduce((acc, d) => acc + (activeIndicesByDay[d]?.length || 0), 0);
  let lunchCellRendered = false;

  return (
    <div className="overflow-x-auto" style={{ boxShadow: 'none' }}>
      <table className={`w-full table-fixed border-collapse ${textSizeClass}`} style={{ boxShadow: 'none' }}>
        <colgroup>
          <col style={{ width: '7%' }} />
          <col style={{ width: '12%' }} />
          {timeHeaders.map((_, i) => (
            <col key={i} style={i === LUNCH_INDEX ? { width: '6%' } : {}} />
          ))}
        </colgroup>
        <thead>
          <tr>
            <th className={`border border-gray-700 ${headerPaddingY} px-1 align-middle text-gray-900`} style={{ fontSize: '12px' }}>Time</th>
            <th className={`border border-gray-700 ${headerPaddingY} px-1 align-middle text-gray-900`} style={{ fontSize: '12px' }}>All Year</th>
            {timeHeaders.map((h, i) => (
              <th
                key={h}
                className={`border border-gray-700 ${headerPaddingY} px-1 text-center text-gray-900 ${i === LUNCH_INDEX ? 'bg-yellow-50' : 'bg-gray-100'}`}
                style={{ fontSize: '12px' }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {daysOfWeek.map((day) => (
            <React.Fragment key={day}>
              {(() => {
                const activeIndices = activeIndicesByDay?.[day] ?? batches.map((_, i) => i);
                if (!activeIndices || activeIndices.length === 0) return null;
                const rowHeightStyle: React.CSSProperties = { height: '36px' };
                return activeIndices.map((batchIndex, rowIdx) => {
                  const batch = batches[batchIndex];
                // Determine whether to render the day cell with rowSpan
                  const renderDayCell = rowIdx === 0;
                  return (
                    <tr key={`${day}-${batch.name}`}>
                      {renderDayCell && (
                        <td rowSpan={activeIndices.length} className="border border-gray-700 p-1 text-center font-semibold uppercase align-middle bg-gray-50 text-gray-900" style={{ fontSize: '12px', ...rowHeightStyle }}>
                        {day === 'saturday' && 'SAT'}
                        {day === 'sunday' && 'SUN'}
                        {day === 'monday' && 'MON'}
                        {day === 'tuesday' && 'TUE'}
                        {day === 'wednesday' && 'WED'}
                        </td>
                      )}
                      <td className={`border border-gray-700 ${cellPaddingY} px-1 text-center font-semibold bg-gray-50 text-gray-900`} style={rowHeightStyle}>{batch.name}</td>

                      {timeHeaders.map((_, timeslotIndex) => {
                        if (timeslotIndex === LUNCH_INDEX) {
                          // Render the lunch/prayer break once for the entire tbody, spanning all body rows
                          if (!lunchCellRendered) {
                            lunchCellRendered = true;
                            return (
                              <td
                                key={`global-lunch`}
                                rowSpan={totalBodyRows}
                                className={`border border-gray-700 ${cellPaddingY} px-1 text-center font-bold align-middle bg-yellow-50 text-gray-900 relative`}
                                style={{ ...rowHeightStyle }}
                              >
                                <div
                                  style={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%) rotate(90deg)',
                                    transformOrigin: 'center',
                                    fontSize: '22px',
                                    letterSpacing: '0.5px',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  Prayer & Lunch Break
                                </div>
                              </td>
                            );
                          }
                          // Covered by the single merged lunch cell spanning all rows
                          return null;
                        }

                        const cellData: CellType = gridData[day]?.[batchIndex]?.[timeslotIndex] || {};

                        // Handle merged cells horizontally
                        if (cellData.merged && cellData.merged.startCol !== timeslotIndex) {
                          // Covered by a previous merged cell; skip
                          return null;
                        }

                        const colSpan = cellData.merged?.colspan || 1;
                        const isHighlighted = !!highlightTeacher && cellData.teacherShort === highlightTeacher;
                        const highlightClass = isHighlighted ? 'ring-2 ring-emerald-500 ring-offset-1 ring-offset-white' : '';
                        return (
                          <td
                            key={`${day}-${batchIndex}-${timeslotIndex}`}
                            colSpan={colSpan}
                            className={`border border-gray-700 ${cellPaddingY} px-1 text-center align-middle whitespace-nowrap ${cellData.courseCode ? 'bg-blue-50' : 'bg-white'} hover:bg-gray-50 cursor-pointer text-gray-900 ${highlightClass}`}
                            style={rowHeightStyle}
                            onClick={() => handleCellClick(day, batchIndex, timeslotIndex)}
                          >
                            {cellData.courseCode && (
                              <span className="font-semibold grid-cell-text" data-max="11" data-min="7" style={{ fontSize: '10px', color: '#111111' }}>
                                {cellData.courseCode}{cellData.room ? ` (${cellData.room})` : ''}
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                });
              })()}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Grid;