import React from 'react';
import { Link } from 'react-router-dom';

const HowToUse: React.FC = () => {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-center">How to Use Easy Peasy Routine</h1>
      
      <div className="space-y-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-blue-600">Step 1: Basic Information</h2>
          <p className="mb-4">Start by clicking "Create New Routine" and provide basic details:</p>
          <ol className="list-decimal list-inside space-y-2 ml-4">
            <li><strong>University Name:</strong> Enter your institution's full name</li>
            <li><strong>Department Name:</strong> Specify your department (e.g., "ICT", "CSE")</li>
            <li><strong>Number of Batches:</strong> How many student batches (1-20)</li>
            <li><strong>Number of Teachers:</strong> Total faculty members (1-50)</li>
            <li><strong>Number of Rooms:</strong> Available classrooms (1-30)</li>
            <li><strong>Effective Date:</strong> When this routine starts</li>
          </ol>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-green-600">Step 2: Details Setup</h2>
          <p className="mb-4">Configure specific information for each entity:</p>
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-lg">Batch Details:</h3>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Enter batch names (e.g., "21st", "22nd")</li>
                <li>Specify number of courses for each batch</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg">Teacher Information:</h3>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Full name (e.g., "Dr. John Smith")</li>
                <li>Short name for display (e.g., "JS")</li>
                <li>Designation & Department (e.g., "Assistant Professor, Dept. of ICT")</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg">Room Names:</h3>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Enter room identifiers (e.g., "301", "Lab-1", "Seminar Hall")</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-purple-600">Step 3: Course Assignment</h2>
          <p className="mb-4">Define courses for each batch:</p>
          <ol className="list-decimal list-inside space-y-2 ml-4">
            <li><strong>Course Code:</strong> Unique identifier (e.g., "ICT-3101")</li>
            <li><strong>Course Name:</strong> Full course title</li>
            <li><strong>Teacher Assignment:</strong> Select assigned teacher or "Not Specific"</li>
            <li>System will notify if any course is left without a teacher</li>
          </ol>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-indigo-600">Step 4: Routine Editor</h2>
          <p className="mb-4">In the editor interface, you can:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li><strong>Click any cell</strong> in the grid to open the cell editor</li>
            <li><strong>Select Course:</strong> Choose from available courses for that batch</li>
            <li><strong>Select Room:</strong> Pick a room or "Not Specific"</li>
            <li><strong>Merge cells:</strong> Check "Merge with next cell" for 2-hour classes</li>
            <li><strong>Clear cell:</strong> Remove assignments from a time slot</li>
            <li><strong>Conflict Detection:</strong> System automatically warns about:
              <ul className="list-disc list-inside ml-6 mt-1">
                <li>Teacher teaching in multiple rooms at same time</li>
                <li>Room being used by multiple batches simultaneously</li>
              </ul>
            </li>
            <li><strong>Override conflicts</strong> if scheduling is intentional</li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-red-600">Step 5: Export Options</h2>
          <p className="mb-4">Two PDF export options are available:</p>
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-lg">Full Routine PDF:</h3>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Complete routine with course lists and teacher information</li>
                <li>Includes all course details and teacher assignments</li>
                <li>Best for administrative records</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg">Minimal Routine PDF:</h3>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Compact version optimized for printing</li>
                <li>Grid height automatically compressed to fit on page</li>
                <li>All rows guaranteed to be visible above chairman signature</li>
                <li>Maximum grid height: 6.4 inches</li>
                <li>Best for posting on notice boards</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-teal-600">Step 6: Save & Load</h2>
          <p className="mb-4">Manage your routine versions:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li><strong>Save Snapshot:</strong> Export routine as JSON file for backup</li>
            <li><strong>Load Snapshot:</strong> Import previously saved routine</li>
            <li><strong>View Existing Routines:</strong> Open saved routine files from home page</li>
            <li><strong>Auto-save:</strong> Editor automatically saves changes locally</li>
          </ul>
        </div>

        <div className="bg-yellow-50 p-6 rounded-lg border-l-4 border-yellow-400">
          <h3 className="text-lg font-semibold mb-2 text-yellow-800">💡 Important Notes</h3>
          <ul className="list-disc list-inside space-y-1 ml-4 text-yellow-700">
            <li><strong>Browser Compatibility:</strong> Optimized for Chrome, works in Edge and Brave</li>
            <li><strong>PDF Grid Compression:</strong> Routine grid automatically compresses to ensure all rows are visible</li>
            <li><strong>Prayer/Lunch Break:</strong> 01:00-02:00 slot is pre-configured as break time</li>
            <li><strong>Time Slots:</strong> 8 slots per day (09:00-04:50) with 50-minute classes</li>
            <li><strong>"Not Specific" Option:</strong> Use when teacher or room is not yet determined</li>
            <li><strong>Save frequently:</strong> Use snapshots to preserve different versions</li>
            <li><strong>Conflict Override:</strong> You can force assignments despite conflicts if needed</li>
          </ul>
        </div>

        <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-400">
          <h3 className="text-lg font-semibold mb-2 text-blue-800">📋 Technical Specifications</h3>
          <ul className="list-disc list-inside space-y-1 ml-4 text-blue-700">
            <li><strong>PDF Format:</strong> Legal size (14" × 8.5") landscape orientation</li>
            <li><strong>Minimal PDF Layout:</strong>
              <ul className="list-disc list-inside ml-6 mt-1">
                <li>Top margin: 0.2 inch</li>
                <li>Header section: 0.8 inch</li>
                <li>Routine grid: Maximum 6.4 inches (auto-compressed)</li>
                <li>Chairman signature: 0.8 inch</li>
                <li>Bottom margin: 0.2 inch</li>
              </ul>
            </li>
            <li><strong>Grid Compression:</strong> Automatic row height adjustment (12-24px)</li>
            <li><strong>Font sizes:</strong> Dynamic based on available space (8-13px)</li>
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