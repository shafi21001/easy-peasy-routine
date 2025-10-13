import React from 'react';
import { Course, Batch } from '../../types';

interface CourseBoxesProps {
  courses: Course[];
  batches: Batch[];
}

const CourseBoxes: React.FC<CourseBoxesProps> = ({ courses, batches }) => {
  // Prepare up to 8 boxes (2 rows x 4 cols). Last cell (index 7) is for signature.
  const batchNames = batches.map(b => b.name);
  const boxes = Array.from({ length: 8 }).map((_, i) => {
    if (i === 7) return { type: 'signature' as const };
    const batchName = batchNames[i];
    return batchName ? { type: 'batch' as const, batchName } : { type: 'empty' as const };
  });

  return (
    <div className="mt-2">
      <div className="grid grid-cols-4 gap-2" style={{ width: '13in' }}>
        {boxes.map((box, idx) => {
          if (box.type === 'signature') {
            return (
              <div key={idx} className="p-2 flex flex-col justify-end">
                <div className="mt-8 text-center">
                  <div className="border-t border-gray-700 mx-6" />
                  <div className="text-sm leading-5 mt-1">
                    <div>Chairman</div>
                    <div>Department of {batches[0]?.name ? '' : ''}ICT, MBSTU</div>
                  </div>
                </div>
              </div>
            );
          }
          if (box.type === 'batch') {
            const batchCourses = courses.filter(c => c.batchName === box.batchName);
            return (
              <div key={idx} className="p-2 border border-gray-400">
                <ul className="text-[11px] list-disc pl-4 space-y-1">
                  {batchCourses.map(course => (
                    <li key={course.courseCode}>
                      {course.courseCode} - {course.courseName} ({course.teacherShort})
                    </li>
                  ))}
                </ul>
              </div>
            );
          }
          // Empty cells: remove borders when there are fewer than 7 batches
          const shouldShowBorder = batches.length >= 7 && idx !== 7; // Never show border on signature cell
          return (
            <div
              key={idx}
              className={`p-2 ${shouldShowBorder ? 'border border-gray-200' : ''}`}
            />
          );
        })}
      </div>
    </div>
  );
};

export default CourseBoxes;