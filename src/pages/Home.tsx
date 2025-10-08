import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
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
          <Link to="/view-routines" className="inline-flex items-center justify-center min-w-[16rem] px-6 py-3 text-white bg-green-600 rounded-md shadow-md hover:bg-green-700 transition-colors duration-200">
            View Existing Routines
          </Link>
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
    </div>
  );
};

export default Home;