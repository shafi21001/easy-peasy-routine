import React, { useState } from 'react';

interface Step1Props {
  onNext: (data: { universityName: string; departmentName: string; numBatches: number; numTeachers: number; numRooms: number; effectiveFrom: string }) => void;
  initialData?: { universityName: string; departmentName: string; numBatches: number; numTeachers: number; numRooms: number; effectiveFrom: string };
}

const Step1: React.FC<Step1Props> = ({ onNext, initialData }) => {
  const [universityName, setUniversityName] = useState(initialData?.universityName || '');
  const [departmentName, setDepartmentName] = useState(initialData?.departmentName || '');
  const [numBatches, setNumBatches] = useState(initialData?.numBatches || 1);
  const [numTeachers, setNumTeachers] = useState(initialData?.numTeachers || 1);
  const [numRooms, setNumRooms] = useState(initialData?.numRooms || 1);
  const [effectiveFrom, setEffectiveFrom] = useState(initialData?.effectiveFrom || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!universityName.trim()) {
      alert('Please enter a university name.');
      return;
    }
    if (!departmentName.trim()) {
      alert('Please enter a department name.');
      return;
    }
    if (!effectiveFrom) {
      alert('Please select an effective date.');
      return;
    }
    if (numBatches < 1 || numBatches > 20) {
      alert('Number of batches must be between 1 and 20.');
      return;
    }
    if (numTeachers < 1 || numTeachers > 50) {
      alert('Number of teachers must be between 1 and 50.');
      return;
    }
    if (numRooms < 1 || numRooms > 30) {
      alert('Number of rooms must be between 1 and 30.');
      return;
    }
    
    onNext({ 
      universityName: universityName.trim(), 
      departmentName: departmentName.trim(), 
      numBatches, 
      numTeachers, 
      numRooms, 
      effectiveFrom 
    });
  };

  const inputClass = "border-2 border-gray-300 rounded-md shadow-sm px-3 py-1.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none";
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 flex flex-col items-center">
      <div className="w-full max-w-2xl space-y-4">
        <div className="flex flex-col items-center gap-2">
          <label htmlFor="universityName" className="text-sm font-semibold text-gray-700">University Name:</label>
          <input
            type="text"
            id="universityName"
            value={universityName}
            onChange={(e) => setUniversityName(e.target.value)}
            className={`${inputClass}`}
            style={{ maxWidth: '288px', width: '100%' }}
            required
          />
        </div>
        <div className="flex flex-col items-center gap-2">
          <label htmlFor="departmentName" className="text-sm font-semibold text-gray-700">Department Name:</label>
          <input
            type="text"
            id="departmentName"
            value={departmentName}
            onChange={(e) => setDepartmentName(e.target.value)}
            className={`${inputClass}`}
            style={{ maxWidth: '288px', width: '100%' }}
            required
          />
        </div>
        <div className="flex flex-col items-center gap-2">
          <label htmlFor="numBatches" className="text-sm font-semibold text-gray-700">Number of Batches:</label>
          <input
            type="number"
            id="numBatches"
            value={numBatches}
            onChange={(e) => setNumBatches(parseInt(e.target.value) || 1)}
            min="1"
            max="20"
            className={`${inputClass} w-24`}
            required
          />
        </div>
        <div className="flex flex-col items-center gap-2">
          <label htmlFor="numTeachers" className="text-sm font-semibold text-gray-700">Number of Teachers:</label>
          <input
            type="number"
            id="numTeachers"
            value={numTeachers}
            onChange={(e) => setNumTeachers(parseInt(e.target.value) || 1)}
            min="1"
            max="50"
            className={`${inputClass} w-24`}
            required
          />
        </div>
        <div className="flex flex-col items-center gap-2">
          <label htmlFor="numRooms" className="text-sm font-semibold text-gray-700">Number of Rooms:</label>
          <input
            type="number"
            id="numRooms"
            value={numRooms}
            onChange={(e) => setNumRooms(parseInt(e.target.value) || 1)}
            min="1"
            max="30"
            className={`${inputClass} w-24`}
            required
          />
        </div>
        <div className="flex flex-col items-center gap-2">
          <label htmlFor="effectiveFrom" className="text-sm font-semibold text-gray-700">Effective From Date:</label>
          <input
            type="date"
            id="effectiveFrom"
            value={effectiveFrom}
            onChange={(e) => setEffectiveFrom(e.target.value)}
            className={`${inputClass} w-48`}
            required
          />
        </div>
        <div className="pt-2 flex justify-center">
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700">Next</button>
        </div>
      </div>
    </form>
  );
};

export default Step1;