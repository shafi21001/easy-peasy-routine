import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { importSnapshotFromJson } from '../lib/storage';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleViewExistingRoutines = () => {
    // Directly trigger file picker
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const appState = importSnapshotFromJson(text);

      if (appState) {
        // Navigate to editor with the loaded state
        navigate('/editor', { state: { loadedAppState: appState } });
      } else {
        alert('Invalid routine file. Please select a valid routine snapshot file.');
      }
    } catch (error) {
      console.error('Error loading file:', error);
      alert('Failed to load routine file. Please make sure it is a valid JSON file.');
    }

    // Reset the input so the same file can be selected again
    event.target.value = '';
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center py-16">
        <h1 className="text-6xl font-extrabold mb-4 text-gray-900 text-center" style={{ fontFamily: 'cursive' }}>Easy Peasy Routine</h1>
        <p className="text-lg text-gray-600 mb-8 text-center max-w-2xl">
          Create, manage, and export university class schedules with ease.
          No more complex spreadsheets or manual conflict checking.
        </p>

        <div className="flex flex-col items-center gap-4">
          <button
            onClick={() => navigate('/wizard')}
            className="inline-flex items-center justify-center min-w-[18rem] px-8 py-4 text-lg text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-200 font-semibold"
          >
            Create New Routine
          </button>
          <button
            onClick={handleViewExistingRoutines}
            className="inline-flex items-center justify-center min-w-[18rem] px-8 py-4 text-lg text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-200 font-semibold"
          >
            View Existing Routines
          </button>
          <button
            onClick={() => navigate('/how-to-use')}
            className="inline-flex items-center justify-center min-w-[18rem] px-8 py-4 text-lg text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-200 font-semibold"
          >
            How to Use
          </button>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Guided Setup</h3>
              <p className="text-gray-600">Step-by-step wizard to set up your routine with all necessary details.</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Conflict Detection</h3>
              <p className="text-gray-600">Automatic detection of scheduling conflicts for teachers and rooms.</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📄</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">PDF Export</h3>
              <p className="text-gray-600">Generate professional PDFs in Legal format for official printing.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden file input for loading snapshots */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />


      {/* Developer Credits */}
      <div className="mt-12 py-6 border-t border-gray-200">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Developed By:</h3>
          <div className="text-gray-600 space-y-1">
            <a
              href="https://shafi21001.github.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="block no-underline hover:text-blue-600 transition-colors"
            >
              1. Md. Shafi Mahmud (IT-21001)
            </a>
            <span className="block">
              2. Md. Emon Hasan (IT-21015)
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Home;