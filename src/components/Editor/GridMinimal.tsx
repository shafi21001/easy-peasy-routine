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

  // Calculate exact sizing to fit within 6.3 inches (604.8px at 96 DPI)
  // Maximum possible rows: 32 body rows + 1 header row = 33 total
  const totalRows = daysOfWeek.reduce((acc, d) => {
    const dayRows = activeBatchIndicesByDay?.[d]?.length || batches.length;
    return acc + dayRows;
  }, 0);
  
  // Calculate row height: 6.3 inches = 604.8px at 96 DPI
  // All rows (including header) should have same height
  // Account for borders (1px per row)
  const totalRowsWithHeader = totalRows + 1; // +1 for header row
  const availableHeight = 605; // 6.3 inches in pixels
  const calculatedRowHeight = Math.floor((availableHeight - totalRowsWithHeader) / Math.max(totalRowsWithHeader, 1));
  
  // Set row height with minimum of 16px to maintain readability
  // For 31 rows (30 body + 1 header): (605-31)/31 = 18.5px per row
  const rowHeightPx = Math.max(Math.min(calculatedRowHeight, 30), 16);
  
  // Maximize font sizes for better print visibility
  // Use larger fonts since we have more space (6.3 inches)
  const textSizeClass = rowHeightPx <= 17 ? 'text-[9px]' : rowHeightPx <= 19 ? 'text-[10px]' : rowHeightPx <= 22 ? 'text-[11px]' : 'text-[12px]';
  const cellPaddingY = rowHeightPx > 20 ? 'py-0.5' : ''; // Add padding for larger rows
  const headerPaddingY = cellPaddingY; // Same padding for header

  // Determine total number of body rows across all days to support a single merged lunch column
  const activeIndicesByDay: Record<DayType, number[]> = Object.fromEntries(
    daysOfWeek.map((d) => [d, activeBatchIndicesByDay?.[d] ?? batches.map((_, i) => i)])
  ) as Record<DayType, number[]>;
  const totalBodyRows = totalRows;
  let lunchCellRendered = false;

  // Helper function to get teacher short name from teachers list
  const getTeacherShortName = (teacherShort?: string): string => {
    if (!teacherShort) return '';
    const teacher = teachers.find(t => t.shortName === teacherShort);
    return teacher ? teacher.shortName : teacherShort;
  };

  return (
    <div className="w-full" style={{ height: '100%', maxHeight: '6.3in' }}>
      <table className={`w-full table-fixed border-collapse ${textSizeClass}`} style={{ tableLayout: 'fixed' }}>
        <colgroup>
          <col style={{ width: '7%' }} />
          <col style={{ width: '11%' }} />
          {timeHeaders.map((_, i) => (
            <col key={i} style={i === LUNCH_INDEX ? { width: '7%' } : { width: '12.5%' }} />
          ))}
        </colgroup>
        <thead>
          <tr>
            <th className={`border border-gray-800 ${headerPaddingY} align-middle text-gray-900 font-bold`} style={{ fontSize: '11px', height: `${rowHeightPx}px`, padding: '2px' }}>Time</th>
            <th className={`border border-gray-800 ${headerPaddingY} align-middle text-gray-900 font-bold`} style={{ fontSize: '11px', height: `${rowHeightPx}px`, padding: '2px' }}>All Year</th>
            {timeHeaders.map((h, i) => (
              <th
                key={h}
                className={`border border-gray-800 ${headerPaddingY} text-center text-gray-900 font-bold ${i === LUNCH_INDEX ? 'bg-yellow-50' : 'bg-gray-100'}`}
                style={{ fontSize: '11px', height: `${rowHeightPx}px`, padding: '2px' }}
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
                // Use the calculated row height
                const rowHeightStyle: React.CSSProperties = { 
                  height: `${rowHeightPx}px`,
                  padding: '1px',
                  lineHeight: 1.1
                };
                return activeIndices.map((batchIndex, rowIdx) => {
                  const batch = batches[batchIndex];
                  // Determine whether to render the day cell with rowSpan
                  const renderDayCell = rowIdx === 0;
                  return (
                    <tr key={`${day}-${batch.name}`}>
                      {renderDayCell && (
                        <td rowSpan={activeIndices.length} className="border border-gray-800 text-center font-bold uppercase align-middle bg-gray-50 text-gray-900" style={{ fontSize: '10px', ...rowHeightStyle, padding: '1px 2px' }}>
                          {day === 'saturday' && 'SAT'}
                          {day === 'sunday' && 'SUN'}
                          {day === 'monday' && 'MON'}
                          {day === 'tuesday' && 'TUE'}
                          {day === 'wednesday' && 'WED'}
                        </td>
                      )}
                      <td className={`border border-gray-800 ${cellPaddingY} text-center font-bold bg-gray-50 text-gray-900`} style={{ ...rowHeightStyle, fontSize: '10px', padding: '1px 2px' }}>{batch.name}</td>

                      {timeHeaders.map((_, timeslotIndex) => {
                        if (timeslotIndex === LUNCH_INDEX) {
                          // Render the lunch/prayer break once for the entire tbody, spanning all body rows
                          if (!lunchCellRendered) {
                            lunchCellRendered = true;
                            return (
                              <td
                                key={`global-lunch`}
                                rowSpan={totalBodyRows}
                                className={`border border-gray-800 text-center font-bold align-middle bg-yellow-50 text-gray-900 relative`}
                                style={{ ...rowHeightStyle }}
                              >
                                <div
                                  style={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%) rotate(90deg)',
                                    transformOrigin: 'center',
                                    fontSize: rowHeightPx <= 18 ? '14px' : rowHeightPx <= 20 ? '16px' : '18px',
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
                            className={`border border-gray-800 ${cellPaddingY} text-center align-middle ${cellData.courseCode ? 'bg-blue-50' : 'bg-white'} text-gray-900`}
                            style={{ ...rowHeightStyle }}
                          >
                            {cellContent && (
                              <span className="font-semibold grid-cell-text" data-max="11" data-min="8" style={{ fontSize: `${Math.max(rowHeightPx * 0.55, 9)}px`, color: '#000000', fontWeight: '600', lineHeight: 1.1, display: 'block', padding: '0 1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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
