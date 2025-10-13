import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Step1 from '../components/Wizard/Step1';
import Step2 from '../components/Wizard/Step2';
import Step3 from '../components/Wizard/Step3';
import Step4 from '../components/Wizard/Step4';
import { AppState, Batch, Teacher, Room, Course } from '../types';

const Wizard: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [wizardData, setWizardData] = useState<Partial<AppState> & { numBatches?: number; numTeachers?: number; numRooms?: number; activeBatchIndicesByDay?: Record<string, number[]> }>({
    universityName: '',
    departmentName: '',
    effectiveFrom: '',
    batches: [],
    teachers: [],
    rooms: [],
    courses: [],
    numBatches: 0,
    numTeachers: 0,
    numRooms: 0,
  });

  const handleStep1Next = (data: { universityName: string; departmentName: string; numBatches: number; numTeachers: number; numRooms: number; effectiveFrom: string }) => {
    setWizardData(prev => ({ ...prev, ...data }));
    setCurrentStep(2);
  };

  const handleStep2Next = (data: { batches: Batch[]; teachers: Teacher[]; rooms: Room[] }) => {
    setWizardData(prev => ({ ...prev, ...data }));
    setCurrentStep(3);
  };

  const handleStep3Next = (courses: Course[]) => {
    setWizardData(prev => ({ ...prev, courses }));
    setCurrentStep(4);
  };

  const handleStep4Next = (activeBatchIndicesByDay: Record<string, number[]>) => {
    const finalAppState: AppState = {
      universityName: wizardData.universityName || '',
      departmentName: wizardData.departmentName || '',
      effectiveFrom: wizardData.effectiveFrom || '',
      batches: wizardData.batches || [],
      teachers: wizardData.teachers || [],
      rooms: wizardData.rooms || [],
      courses: wizardData.courses || [],
      grid: {
        saturday: [],
        sunday: [],
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: []
      },
      mergedRanges: [],
      activeBatchIndicesByDay: activeBatchIndicesByDay as any,
    };
    navigate('/editor', { state: { appState: finalAppState } });
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1 onNext={handleStep1Next} initialData={wizardData as any} />;
      case 2:
        return (
          <Step2
            onNext={handleStep2Next}
            onPrevious={() => setCurrentStep(1)}
            initialData={wizardData as any}
            numBatches={wizardData.numBatches || 1}
            numTeachers={wizardData.numTeachers || 1}
            numRooms={wizardData.numRooms || 1}
          />
        );
      case 3:
        return (
          <Step3
            onNext={handleStep3Next}
            onPrevious={() => setCurrentStep(2)}
            initialData={wizardData.courses}
            batches={wizardData.batches || []}
            teachers={wizardData.teachers || []}
          />
        );
      case 4:
        return (
          <Step4
            onNext={handleStep4Next}
            onPrevious={() => setCurrentStep(3)}
            batches={wizardData.batches || []}
            initialSelection={wizardData.activeBatchIndicesByDay as any}
          />
        );
      default:
        return <Step1 onNext={handleStep1Next} initialData={wizardData as any} />;
    }
  };

  return (
    <div className="container mx-auto p-4">
      {/* Navigation Breadcrumb */}
      <nav className="flex space-x-2 text-sm mb-4">
        <Link to="/" className="text-blue-600 hover:text-blue-800">Home</Link>
        <span className="text-gray-400">›</span>
        <span className="text-gray-600">Step {currentStep}</span>
      </nav>
      
      <h1 className="text-3xl font-bold mb-6">Create New Routine - Step {currentStep}</h1>
      <div className="bg-white shadow-md rounded-lg p-6">
        {renderStep()}
      </div>
    </div>
  );
};

export default Wizard;