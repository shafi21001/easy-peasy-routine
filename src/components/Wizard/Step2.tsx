import React, { useState, useEffect } from 'react';
import { Batch, Teacher, Room } from '../../types';

interface Step2Props {
  onNext: (data: { batches: Batch[]; teachers: Teacher[]; rooms: Room[] }) => void;
  onPrevious: () => void;
  initialData?: { batches: Batch[]; teachers: Teacher[]; rooms: Room[] };
  numBatches: number;
  numTeachers: number;
  numRooms: number;
}

const Step2: React.FC<Step2Props> = ({ onNext, onPrevious, initialData, numBatches, numTeachers, numRooms }) => {
  const [batches, setBatches] = useState<Batch[]>(initialData?.batches || Array.from({ length: numBatches }, (_, i) => ({ name: `Batch ${i + 1}`, numCourses: 1 })));
  const [teachers, setTeachers] = useState<Teacher[]>(initialData?.teachers || Array.from({ length: numTeachers }, (_, i) => ({ fullName: `Teacher ${i + 1}`, shortName: `T${i + 1}`, department: 'Designation, Department' })));
  const [rooms, setRooms] = useState<Room[]>(initialData?.rooms || Array.from({ length: numRooms }, (_, i) => ({ name: `Room ${i + 1}` })));

  useEffect(() => {
    setBatches(prev => Array.from({ length: numBatches }, (_, i) => prev[i] || { name: `Batch ${i + 1}`, numCourses: 1 }));
    setTeachers(prev => Array.from({ length: numTeachers }, (_, i) => prev[i] || { fullName: `Teacher ${i + 1}`, shortName: `T${i + 1}`, department: 'Designation, Department' }));
    setRooms(prev => Array.from({ length: numRooms }, (_, i) => prev[i] || { name: `Room ${i + 1}` }));
  }, [numBatches, numTeachers, numRooms]);

  const handleBatchChange = (index: number, field: keyof Batch, value: string | number) => {
    const newBatches = [...batches];
    (newBatches[index] as any)[field] = value;
    setBatches(newBatches);
  };

  const handleTeacherChange = (index: number, field: keyof Teacher, value: string) => {
    const newTeachers = [...teachers];
    (newTeachers[index] as any)[field] = value;
    setTeachers(newTeachers);
  };

  const handleRoomChange = (index: number, field: keyof Room, value: string) => {
    const newRooms = [...rooms];
    (newRooms[index] as any)[field] = value;
    setRooms(newRooms);
  };

  const validateAndSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const teacherShortNames = new Set<string>();
    for (const teacher of teachers) {
      if (!teacher.fullName || !teacher.shortName || !teacher.department) {
        alert('Please fill in all teacher details.');
        return;
      }
      if (teacherShortNames.has(teacher.shortName)) {
        alert(`Duplicate teacher short name: ${teacher.shortName}`);
        return;
      }
      teacherShortNames.add(teacher.shortName);
    }

    const roomNames = new Set<string>();
    for (const room of rooms) {
      if (!room.name) {
        alert('Please fill in all room names.');
        return;
      }
      if (roomNames.has(room.name)) {
        alert(`Duplicate room name: ${room.name}`);
        return;
      }
      roomNames.add(room.name);
    }

    for (const batch of batches) {
      if (!batch.name || batch.numCourses <= 0) {
        alert('Please fill in all batch details and ensure number of courses is positive.');
        return;
      }
    }

    onNext({ batches, teachers, rooms });
  };

  const inputClass = "border-2 border-gray-300 rounded-md shadow-sm px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none";
  
  return (
    <form onSubmit={validateAndSubmit} className="space-y-6 p-6">
      <h2 className="text-xl font-semibold mb-4">Batch Details</h2>
      {batches.map((batch, i) => (
        <div key={i} className="grid grid-cols-[150px_300px_150px_150px] gap-4 items-center">
          <label className="text-sm font-semibold text-gray-700 text-right">Batch {i + 1} Name:</label>
          <input
            type="text"
            value={batch.name}
            onChange={(e) => handleBatchChange(i, 'name', e.target.value)}
            className={inputClass}
            required
          />
          <label className="text-sm font-semibold text-gray-700 text-right">No. of Courses:</label>
          <input
            type="number"
            value={batch.numCourses}
            onChange={(e) => handleBatchChange(i, 'numCourses', parseInt(e.target.value))}
            min="1"
            className={`${inputClass} w-24`}
            required
          />
        </div>
      ))}

      <h2 className="text-xl font-semibold mt-6 mb-4">Teacher Details</h2>
      {teachers.map((teacher, i) => (
        <div key={i} className="grid grid-cols-[180px_250px_100px_120px_180px_250px] gap-3 items-center">
          <label className="text-sm font-semibold text-gray-700 text-right">Teacher {i + 1} Full Name:</label>
          <input
            type="text"
            value={teacher.fullName}
            onChange={(e) => handleTeacherChange(i, 'fullName', e.target.value)}
            className={inputClass}
            required
          />
          <label className="text-sm font-semibold text-gray-700 text-right">Short Name:</label>
          <input
            type="text"
            value={teacher.shortName}
            onChange={(e) => handleTeacherChange(i, 'shortName', e.target.value)}
            className={`${inputClass} w-24`}
            required
          />
          <label className="text-sm font-semibold text-gray-700 text-right">Designation & Dept:</label>
          <input
            type="text"
            value={teacher.department}
            onChange={(e) => handleTeacherChange(i, 'department', e.target.value)}
            className={inputClass}
            required
          />
        </div>
      ))}

      <h2 className="text-xl font-semibold mt-6 mb-4">Room Names</h2>
      {rooms.map((room, i) => (
        <div key={i} className="grid grid-cols-[150px_150px] gap-4 items-center">
          <label className="text-sm font-semibold text-gray-700 text-right">Room {i + 1} Name:</label>
          <input
            type="text"
            value={room.name}
            onChange={(e) => handleRoomChange(i, 'name', e.target.value)}
            className={`${inputClass} w-32`}
            required
          />
        </div>
      ))}

      <div className="flex justify-between mt-6">
        <button type="button" onClick={onPrevious} className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md shadow-md hover:bg-gray-400">Previous</button>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700">Next</button>
      </div>
    </form>
  );
};

export default Step2;