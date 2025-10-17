import React from 'react';
import { GridData, Batch, Day as DayType, Cell as CellType, Teacher } from '../../types';

interface GridMinimalProps {
  gridData: GridData;
  batches: Batch[];
  teachers: Teacher[];
  activeBatchIndicesByDay?: Record<DayType, number[]>;
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

const GridMinimal: React.FC<GridMinimalProps> = ({ gridData, batches, teachers, activeBatchIndicesByDay }) => {
  if (batches.length === 0) {
    return null;
  }

  // Tune sizing for typical 6–7 batches
  const manyBatches = batches.length >= 7;
  const textSizeClass = manyBatches ? 'text-[11px]' : 'text-[12px]';
  const cellPaddingY = manyBatches ? 'py-1' : 'py-1.5';
  const headerPaddingY = manyBatches ? 'py-1' : 'py-1.5';

  // Determine total number of body rows across all days to support a single merged lunch column
  const activeIndicesByDay: Record<DayType, number[]> = Object.fromEntries(
    daysOfWeek.map((d) => [d, activeBatchIndicesByDay?.[d] ?? batches.map((_, i) => i)])
  ) as Record<DayType, number[]>;
  const totalBodyRows = daysOfWeek.reduce((acc, d) => acc + (activeIndicesByDay[d]?.length || 0), 0);
  let lunchCellRendered = false;

  // Helper function to get teacher short name from teachers list
  const getTeacherShortName = (teacherShort?: string): string => {
    if (!teacherShort) return '';
    const teacher = teachers.find(t => t.shortName === teacherShort);
    return teacher ? teacher.shortName : teacherShort;
  };

  return (
    <div className="w-full">
      <table className={`w-full table-fixed border-collapse ${textSizeClass}`}>
        <colgroup>
          <col style={{ width: '7%' }} />
          <col style={{ width: '11%' }} />
          {timeHeaders.map((_, i) => (
            <col key={i} style={i === LUNCH_INDEX ? { width: '7%' } : { width: '12.5%' }} />
          ))}
        </colgroup>
        <thead>
          <tr>
            <th className={`border border-gray-800 ${headerPaddingY} px-1 align-middle text-gray-900 font-bold`} style={{ fontSize: '13px' }}>Time</th>
            <th className={`border border-gray-800 ${headerPaddingY} px-1 align-middle text-gray-900 font-bold`} style={{ fontSize: '13px' }}>All Year</th>
            {timeHeaders.map((h, i) => (
              <th
                key={h}
                className={`border border-gray-800 ${headerPaddingY} px-1 text-center text-gray-900 font-bold ${i === LUNCH_INDEX ? 'bg-yellow-50' : 'bg-gray-100'}`}
                style={{ fontSize: '13px' }}
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
                const rowHeightStyle: React.CSSProperties = { height: '38px' };
                return activeIndices.map((batchIndex, rowIdx) => {
                  const batch = batches[batchIndex];
                  // Determine whether to render the day cell with rowSpan
                  const renderDayCell = rowIdx === 0;
                  return (
                    <tr key={`${day}-${batch.name}`}>
                      {renderDayCell && (
                        <td rowSpan={activeIndices.length} className="border border-gray-800 p-1 text-center font-bold uppercase align-middle bg-gray-50 text-gray-900" style={{ fontSize: '13px', ...rowHeightStyle }}>
                          {day === 'saturday' && 'SAT'}
                          {day === 'sunday' && 'SUN'}
                          {day === 'monday' && 'MON'}
                          {day === 'tuesday' && 'TUE'}
                          {day === 'wednesday' && 'WED'}
                        </td>
                      )}
                      <td className={`border border-gray-800 ${cellPaddingY} px-1 text-center font-bold bg-gray-50 text-gray-900`} style={{ ...rowHeightStyle, fontSize: '12px' }}>{batch.name}</td>

                      {timeHeaders.map((_, timeslotIndex) => {
                        if (timeslotIndex === LUNCH_INDEX) {
                          // Render the lunch/prayer break once for the entire tbody, spanning all body rows
                          if (!lunchCellRendered) {
                            lunchCellRendered = true;
                            return (
                              <td
                                key={`global-lunch`}
                                rowSpan={totalBodyRows}
                                className={`border border-gray-800 ${cellPaddingY} px-1 text-center font-bold align-middle bg-yellow-50 text-gray-900 relative`}
                                style={{ ...rowHeightStyle }}
                              >
                                <div
                                  style={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%) rotate(90deg)',
                                    transformOrigin: 'center',
                                    fontSize: '24px',
                                    letterSpacing: '0.5px',
                                    whiteSpace: 'nowrap',
                                    fontWeight: 'bold',
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
                        
                        // Format cell content as: COURSE CODE (ROOM NO.) TEACHER SHORT NAME
                        let cellContent = '';
                        if (cellData.courseCode) {
                          cellContent = cellData.courseCode;
                          if (cellData.room) {
                            cellContent += ` (${cellData.room})`;
                          }
                          const teacherShort = getTeacherShortName(cellData.teacherShort);
                          if (teacherShort) {
                            cellContent += ` ${teacherShort}`;
                          }
                        }
                        
                        return (
                          <td
                            key={`${day}-${batchIndex}-${timeslotIndex}`}
                            colSpan={colSpan}
                            className={`border border-gray-800 ${cellPaddingY} px-1 text-center align-middle whitespace-nowrap ${cellData.courseCode ? 'bg-blue-50' : 'bg-white'} text-gray-900`}
                            style={{ ...rowHeightStyle }}
                          >
                            {cellContent && (
                              <span className="font-semibold grid-cell-text" data-max="12" data-min="8" style={{ fontSize: '11px', color: '#000000' }}>
                                {cellContent}
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

export default GridMinimal;
