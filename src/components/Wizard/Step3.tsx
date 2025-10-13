import React, { useState, useEffect } from 'react';
import { Batch, Teacher, Course } from '../../types';

interface Step3Props {
  onNext: (courses: Course[]) => void;
  onPrevious: () => void;
  initialData?: Course[];
  batches: Batch[];
  teachers: Teacher[];
}

const Step3: React.FC<Step3Props> = ({ onNext, onPrevious, initialData, batches, teachers }) => {
  const [courses, setCourses] = useState<Course[]>(initialData || []);

  useEffect(() => {
    // Initialize courses based on batches and their numCourses
    const newCourses: Course[] = [];
    batches.forEach(batch => {
      for (let i = 0; i < batch.numCourses; i++) {
        const courseCode = `C${batch.name.replace(/\s+/g, '')}${i + 1}`;
        const existingCourse = courses.find(c => c.batchName === batch.name && c.courseCode === courseCode);
        newCourses.push(existingCourse || {
          batchName: batch.name,
          courseCode: courseCode,
          courseName: `Course ${i + 1}`,
          teacherShort: '',
        });
      }
    });
    setCourses(newCourses);
  }, [batches]); // Only re-run if batches change

  const handleCourseChange = (index: number, field: keyof Course, value: string) => {
    const newCourses = [...courses];
    (newCourses[index] as any)[field] = value;
    setCourses(newCourses);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation for courses
    for (const course of courses) {
      if (!course.courseCode || !course.courseName || !course.teacherShort) {
        alert('Please fill in all course details.');
        return;
      }
    }
    onNext(courses);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-4">
      <h2 className="text-xl font-semibold">Define Courses</h2>
      {batches.map(batch => (
        <div key={batch.name} className="border p-4 rounded-md">
          <h3 className="text-lg font-medium mb-4">Batch: {batch.name}</h3>
          {courses.filter(c => c.batchName === batch.name).map((course) => {
            const courseIndex = courses.indexOf(course);
            return (
              <div key={courseIndex} className="grid grid-cols-4 gap-3 items-center mb-2">
                <label className="text-sm font-medium text-gray-700">Course Code:</label>
                <input
                  type="text"
                  value={course.courseCode}
                  onChange={(e) => handleCourseChange(courseIndex, 'courseCode', e.target.value)}
                  className="border border-gray-300 rounded-md shadow-sm px-2 py-1 w-full"
                  required
                />
                <label className="text-sm font-medium text-gray-700">Course Name:</label>
                <input
                  type="text"
                  value={course.courseName}
                  onChange={(e) => handleCourseChange(courseIndex, 'courseName', e.target.value)}
                  className="border border-gray-300 rounded-md shadow-sm px-2 py-1 w-full"
                  required
                />
                <label className="text-sm font-medium text-gray-700">Assign Teacher:</label>
                <select
                  value={course.teacherShort}
                  onChange={(e) => handleCourseChange(courseIndex, 'teacherShort', e.target.value)}
                  className="border border-gray-300 rounded-md shadow-sm px-2 py-1 w-full"
                  required
                >
                  <option value="">Select Teacher</option>
                  {teachers.map(teacher => (
                    <option key={teacher.shortName} value={teacher.shortName}>
                      {teacher.shortName} - {teacher.fullName}
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>
      ))}

      <div className="flex justify-between mt-6">
        <button type="button" onClick={onPrevious} className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md shadow-md hover:bg-gray-400">Previous</button>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700">Next</button>
      </div>
    </form>
  );
};

export default Step3;