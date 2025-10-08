import React from 'react';
import { Link } from 'react-router-dom';

const HowToUse: React.FC = () => {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-center">How to Use Easy Peasy Routine</h1>
      
      <div className="space-y-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-blue-600">Step 1: Create a New Routine</h2>
          <p className="mb-4">Click on "Create a New Routine" to start the guided wizard process.</p>
          <ol className="list-decimal list-inside space-y-2 ml-4">
            <li>Enter your university name, department name, and effective date</li>
            <li>Specify the number of batches, teachers, and rooms you need</li>
            <li>Define batch details, teacher information, and room names</li>
            <li>Create courses and assign them to batches and teachers</li>
          </ol>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-green-600">Step 2: Edit Your Routine</h2>
          <p className="mb-4">Once in the editor, you can:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li><strong>Click any cell</strong> to assign a course, teacher, and room</li>
            <li><strong>Merge cells</strong> for multi-slot classes (e.g., 2-hour lectures)</li>
            <li><strong>View conflicts</strong> - the system will warn you about scheduling conflicts</li>
            <li><strong>Override conflicts</strong> if intentional</li>
            <li><strong>Save snapshots</strong> to create different versions of your routine</li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-purple-600">Step 3: Export and Print</h2>
          <p className="mb-4">When your routine is ready:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li><strong>Download PDF</strong> for official printing in Legal format</li>
            <li><strong>Export JSON</strong> to backup or share your routine data</li>
            <li><strong>Load snapshots</strong> to switch between different routine versions</li>
          </ul>
        </div>

        <div className="bg-yellow-50 p-6 rounded-lg border-l-4 border-yellow-400">
          <h3 className="text-lg font-semibold mb-2 text-yellow-800">💡 Tips for Best Results</h3>
          <ul className="list-disc list-inside space-y-1 ml-4 text-yellow-700">
            <li>Start with a small number of batches and gradually add more</li>
            <li>Use descriptive short names for teachers (e.g., "Dr. Smith" → "DS")</li>
            <li>Plan your time slots carefully to avoid conflicts</li>
            <li>Save snapshots frequently to avoid losing work</li>
            <li>Use the conflict detection to ensure no double-booking</li>
          </ul>
        </div>

        <div className="text-center">
          <Link 
            to="/wizard" 
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start Creating Your Routine
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HowToUse;