import React from 'react';
import { Teacher } from '../../types';

interface TeacherListProps {
  teachers: Teacher[];
  onTeacherClick: (shortName: string) => void;
}

const TeacherList: React.FC<TeacherListProps> = ({ teachers, onTeacherClick }) => {
  const textSizeClass = teachers.length >= 10 ? 'text-[11px]' : 'text-[12px]';
  return (
    <div className="p-1 border border-gray-400">
      <div className="space-y-0.5">
        {teachers.map((teacher) => (
          <div
            key={teacher.shortName}
            className={`cursor-pointer hover:bg-gray-100 py-0.5 rounded-md ${textSizeClass}`}
            onClick={() => onTeacherClick(teacher.shortName)}
            style={{ paddingLeft: '2px', paddingRight: '2px' }}
          >
            <p className="leading-tight font-semibold" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {teacher.shortName} = {teacher.fullName}
            </p>
            <p className="leading-tight text-gray-700" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {teacher.department}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeacherList;