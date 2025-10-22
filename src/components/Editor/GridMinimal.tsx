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

  // Calculate exact sizing to fit within 6.9 inches (662.4px at 96 DPI)
  // Maximum possible rows: 32 body rows + 1 header row = 33 total
  const totalRows = daysOfWeek.reduce((acc, d) => {
    const dayRows = activeBatchIndicesByDay?.[d]?.length || batches.length;
    return acc + dayRows;
  }, 0);
  
  // Calculate row height: 6.9 inches = 662.4px at 96 DPI
  // With maximum space available, ensure all rows fit comfortably
  const totalRowsWithHeader = totalRows + 1; // +1 for header row
  const isChromium = typeof window !== 'undefined' && (window as any).chrome;
  
  // With 6.9 inches, we have 662px available - MAXIMUM compression to fit all rows
  // For 29 rows + 1 header = 30 total rows, need MAXIMUM compression
  const availableHeight = totalRowsWithHeader >= 30 ? 620 : totalRowsWithHeader >= 28 ? 640 : totalRowsWithHeader >= 25 ? 650 : isChromium ? 655 : 655;
  const borderCompensation = totalRowsWithHeader * 1; // 1px border per row
  const calculatedRowHeight = Math.floor((availableHeight - borderCompensation) / Math.max(totalRowsWithHeader, 1));
  
  // MAXIMUM compression for 30+ rows - smallest possible size to fit all rows
  const minHeight = totalRowsWithHeader >= 30 ? 14 : totalRowsWithHeader >= 28 ? 15 : totalRowsWithHeader >= 25 ? 16 : totalRowsWithHeader >= 20 ? 17 : 19;
  const maxHeight = totalRowsWithHeader >= 30 ? 18 : totalRowsWithHeader >= 28 ? 19 : totalRowsWithHeader >= 25 ? 21 : totalRowsWithHeader >= 20 ? 23 : 25;
  const rowHeightPx = Math.max(Math.min(calculatedRowHeight, maxHeight), minHeight);
  
  // Dynamic font sizes based on row height for optimal visibility
  // With more space, we can use slightly larger fonts
  const textSizeClass = rowHeightPx <= 16 ? 'text-[9px]' : rowHeightPx <= 18 ? 'text-[10px]' : rowHeightPx <= 20 ? 'text-[11px]' : rowHeightPx <= 22 ? 'text-[12px]' : 'text-[13px]';
  const cellPaddingY = ''; // No padding to maximize space
  const headerPaddingY = ''; // No padding for headers either

  // Determine total number of body rows across all days to support a single merged lunch column
  const activeIndicesByDay: Record<DayType, number[]> = Object.fromEntries(
    daysOfWeek.map((d) => [d, activeBatchIndicesByDay?.[d] ?? batches.map((_, i) => i)])
  ) as Record<DayType, number[]>;
  const totalBodyRows = totalRows;
  let lunchCellRendered = false;

  // Helper function to get teacher short name from teachers list
  const getTeacherShortName = (teacherShort?: string): string => {
    if (!teacherShort || teacherShort === 'Not Specific') return '';
    const teacher = teachers.find(t => t.shortName === teacherShort);
    return teacher ? teacher.shortName : teacherShort;
  };

  return (
    <div className="w-full" style={{ 
      height: '100%', 
      maxHeight: '6.9in',
      WebkitFontSmoothing: 'subpixel-antialiased',
      MozOsxFontSmoothing: 'grayscale',
      textRendering: 'geometricPrecision'
    }}>
      <table className={`w-full table-fixed border-collapse ${textSizeClass}`} style={{ 
        tableLayout: 'fixed',
        borderSpacing: 0,
        WebkitFontSmoothing: 'subpixel-antialiased',
        textRendering: 'geometricPrecision'
      }}>
        <colgroup>
          <col style={{ width: '6%' }} />
          <col style={{ width: '10%' }} />
          {timeHeaders.map((_, i) => (
            <col key={i} style={i === LUNCH_INDEX ? { width: '9%' } : { width: '12.5%' }} />
          ))}
        </colgroup>
        <thead>
          <tr>
            <th className={`border border-gray-800 ${headerPaddingY} align-middle text-gray-900 font-bold`} style={{ fontSize: '12px', fontWeight: '800', height: `${rowHeightPx}px`, padding: '2px', fontFamily: 'Times New Roman, Times, serif' }}>Time</th>
            <th className={`border border-gray-800 ${headerPaddingY} align-middle text-gray-900 font-bold`} style={{ fontSize: '12px', fontWeight: '800', height: `${rowHeightPx}px`, padding: '2px', fontFamily: 'Times New Roman, Times, serif' }}>All Year</th>
            {timeHeaders.map((h, i) => (
              <th
                key={h}
                className={`border border-gray-800 ${headerPaddingY} text-center text-gray-900 font-bold ${i === LUNCH_INDEX ? 'bg-yellow-50' : 'bg-gray-100'}`}
                style={{ fontSize: '12px', fontWeight: '800', height: `${rowHeightPx}px`, padding: '2px', fontFamily: 'Times New Roman, Times, serif' }}
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
                        <td rowSpan={activeIndices.length} className="border border-gray-800 text-center font-bold uppercase align-middle bg-gray-50 text-gray-900" style={{ fontSize: '11px', fontWeight: '800', ...rowHeightStyle, padding: '1px 2px', fontFamily: 'Times New Roman, Times, serif' }}>
                          {day === 'saturday' && 'SAT'}
                          {day === 'sunday' && 'SUN'}
                          {day === 'monday' && 'MON'}
                          {day === 'tuesday' && 'TUE'}
                          {day === 'wednesday' && 'WED'}
                        </td>
                      )}
                      <td className={`border border-gray-800 ${cellPaddingY} text-center font-bold bg-gray-50 text-gray-900`} style={{ ...rowHeightStyle, fontSize: '11px', fontWeight: '800', padding: '1px 2px', fontFamily: 'Times New Roman, Times, serif' }}>{batch.name}</td>

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
                        // Skip 'Not Specific' values
                        let cellContent = '';
                        if (cellData.courseCode) {
                          cellContent = cellData.courseCode;
                          if (cellData.room && cellData.room !== 'Not Specific') {
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
                              <span style={{ 
                                fontSize: '11px', 
                                fontWeight: '800', 
                                fontFamily: 'Times New Roman, Times, serif',
                                display: 'block',
                                whiteSpace: 'nowrap', 
                                overflow: 'hidden', 
                                textOverflow: 'ellipsis'
                              }}>
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
