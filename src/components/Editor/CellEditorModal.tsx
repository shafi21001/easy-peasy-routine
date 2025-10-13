import React, { useState, useEffect } from 'react';
import { Cell, Course, Room } from '../../types';

interface CellEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (cellData: Cell, mergeWithNext: boolean) => void;
  initialCellData: Cell;
  availableCourses: Course[];
  availableRooms: Room[];
  day: string;
  batchName: string;
  timeslotIndex: number;
  canMerge: boolean;
}

const CellEditorModal: React.FC<CellEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialCellData,
  availableCourses,
  availableRooms,
  day,
  batchName,
  timeslotIndex,
  canMerge,
}) => {
  const [selectedCourseCode, setSelectedCourseCode] = useState(initialCellData.courseCode || '');
  const [selectedRoom, setSelectedRoom] = useState(initialCellData.room || '');
  const [mergeWithNext, setMergeWithNext] = useState(false);

  useEffect(() => {
    setSelectedCourseCode(initialCellData.courseCode || '');
    setSelectedRoom(initialCellData.room || '');
    setMergeWithNext(initialCellData.merged ? true : false);
  }, [initialCellData]);

  if (!isOpen) return null;

  const handleSave = () => {
    const selectedCourse = availableCourses.find(c => c.courseCode === selectedCourseCode);
    const newCellData: Cell = {
      courseCode: selectedCourse?.courseCode,
      teacherShort: selectedCourse?.teacherShort,
      room: selectedRoom,
    };
    onSave(newCellData, mergeWithNext);
  };

  const handleClear = () => {
    onSave({}, false); // Clear the cell
  };

  return (
    <div className="fixed top-[56px] left-0 bottom-0 w-[420px] z-30 bg-green-100 border-r-4 border-green-400 overflow-auto shadow-2xl" style={{backgroundColor: '#dcfce7'}}>
      <div className="p-6">
        {/* Header Section */}
        <div className="bg-green-600 text-white rounded-lg p-4 mb-6 shadow-md">
          <h2 className="text-2xl font-bold mb-1">Edit Cell</h2>
          <p className="text-green-100 text-sm">
            <span className="font-semibold capitalize">{day}</span> • {batchName} • Slot {timeslotIndex + 1}
          </p>
        </div>

        {/* Form Section */}
        <div className="space-y-5">
          {/* Course Selection */}
          <div className="bg-white rounded-lg p-4 shadow-md border border-green-200">
            <label htmlFor="course" className="block text-sm font-semibold text-gray-800 mb-2">
              📚 Course
            </label>
            <select
              id="course"
              value={selectedCourseCode}
              onChange={(e) => setSelectedCourseCode(e.target.value)}
              className="w-full border-2 border-green-300 rounded-lg p-3 bg-white focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none text-gray-800"
            >
              <option value="">Select Course</option>
              {availableCourses.map(course => (
                <option key={course.courseCode} value={course.courseCode}>
                  {course.courseCode} - {course.courseName} ({course.teacherShort})
                </option>
              ))}
            </select>
          </div>

          {/* Room Selection */}
          <div className="bg-white rounded-lg p-4 shadow-md border border-green-200">
            <label htmlFor="room" className="block text-sm font-semibold text-gray-800 mb-2">
              🏫 Room
            </label>
            <select
              id="room"
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
              className="w-full border-2 border-green-300 rounded-lg p-3 bg-white focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none text-gray-800"
            >
              <option value="">Select Room</option>
              {availableRooms.map(room => (
                <option key={room.name} value={room.name}>
                  {room.name}
                </option>
              ))}
            </select>
          </div>

          {/* Merge Option */}
          {canMerge && (
            <div className="bg-white rounded-lg p-4 shadow-md border border-green-200">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="mergeWithNext"
                  checked={mergeWithNext}
                  onChange={(e) => setMergeWithNext(e.target.checked)}
                  className="h-5 w-5 text-green-600 border-2 border-green-300 rounded focus:ring-2 focus:ring-green-200 cursor-pointer"
                />
                <label htmlFor="mergeWithNext" className="ml-3 text-sm font-semibold text-gray-800 cursor-pointer">
                  🔗 Merge with next cell
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-end space-x-3">
          <button
            onClick={handleClear}
            className="px-5 py-2.5 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 active:bg-red-700 shadow-md hover:shadow-lg transition-all transform hover:scale-105"
          >
            🗑️ Clear
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-gray-400 text-white rounded-lg font-semibold hover:bg-gray-500 active:bg-gray-600 shadow-md hover:shadow-lg transition-all transform hover:scale-105"
          >
            ✖️ Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 active:bg-green-800 shadow-md hover:shadow-lg transition-all transform hover:scale-105"
          >
            ✓ Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default CellEditorModal;