import React from 'react';
import { Teacher } from '../../types';

interface TeacherListProps {
  teachers: Teacher[];
  onTeacherClick: (shortName: string) => void;
}

const TeacherList: React.FC<TeacherListProps> = ({ teachers, onTeacherClick }) => {
  const textSizeClass = teachers.length >= 10 ? 'text-[12px]' : 'text-sm';
  return (
    <div className="p-2 border border-gray-400">
      <ul className="space-y-1">
        {teachers.map((teacher, index) => (
          <li
            key={teacher.shortName}
            className={`cursor-pointer hover:bg-gray-100 px-1 py-0.5 rounded-md ${textSizeClass}`}
            onClick={() => onTeacherClick(teacher.shortName)}
          >
            <p className="leading-tight whitespace-nowrap">{index + 1}. {teacher.shortName} = {teacher.fullName}</p>
            <p className="leading-tight text-gray-700 whitespace-nowrap">{teacher.department}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TeacherList;