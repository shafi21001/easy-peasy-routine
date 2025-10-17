import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { listSnapshots, loadSnapshot } from '../lib/storage';
import { Snapshot } from '../types';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [availableSnapshots, setAvailableSnapshots] = useState<Snapshot[]>([]);

  const handleViewExistingRoutines = () => {
    const snapshots = listSnapshots();
    if (snapshots.length === 0) {
      alert('No saved routines found. Please create a new routine first.');
      return;
    }
    setAvailableSnapshots(snapshots);
    setShowLoadModal(true);
  };

  const handleLoadSnapshot = (id: string) => {
    const appState = loadSnapshot(id);
    if (appState) {
      const processedState = {
        ...appState,
        grid: appState.grid || {
          saturday: [],
          sunday: [],
          monday: [],
          tuesday: [],
          wednesday: [],
          thursday: [],
          friday: []
        },
        mergedRanges: appState.mergedRanges || []
      };
      navigate('/editor', { state: { appState: processedState } });
    } else {
      alert('Could not load routine. Please try again.');
    }
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
        
        <div className="flex flex-col items-center gap-3">
          <Link to="/wizard" className="inline-flex items-center justify-center min-w-[16rem] px-6 py-3 text-white bg-blue-600 rounded-md shadow-md hover:bg-blue-700 transition-colors duration-200">
            Create New Routine
          </Link>
          <button 
            onClick={handleViewExistingRoutines}
            className="inline-flex items-center justify-center min-w-[16rem] px-6 py-3 text-white bg-green-600 rounded-md shadow-md hover:bg-green-700 transition-colors duration-200"
          >
            View Existing Routines
          </button>
          <Link to="/how-to-use" className="inline-flex items-center justify-center min-w-[16rem] px-6 py-3 text-white bg-purple-600 rounded-md shadow-md hover:bg-purple-700 transition-colors duration-200">
            How to Use
          </Link>
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

      {/* Load Snapshot Modal */}
      {showLoadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl max-h-[80vh] overflow-auto">
            <h2 className="text-2xl font-bold mb-4">Select a Routine to Load</h2>
            {availableSnapshots.length === 0 ? (
              <p className="text-gray-600">No snapshots available.</p>
            ) : (
              <div className="space-y-3">
                {availableSnapshots.map(snapshot => (
                  <div key={snapshot.id} className="border border-gray-300 rounded-lg p-3 hover:bg-gray-50">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold">{snapshot.name}</h3>
                        <p className="text-sm text-gray-600">{new Date(snapshot.date).toLocaleString()}</p>
                      </div>
                      <button
                        onClick={() => handleLoadSnapshot(snapshot.id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Load
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowLoadModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;