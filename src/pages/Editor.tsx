import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Header from '../components/Editor/Header';
import HeaderMinimal from '../components/Editor/HeaderMinimal';
import Grid from '../components/Editor/Grid';
import GridMinimal from '../components/Editor/GridMinimal';
import TeacherList from '../components/Editor/TeacherList';
import CourseBoxes from '../components/Editor/CourseBoxes';
import PrintPreview from '../components/Editor/PrintPreview';
import PrintPreviewMinimal from '../components/Editor/PrintPreviewMinimal';
import CellEditorModal from '../components/Editor/CellEditorModal';
import { AppState, Cell, GridData, Day as DayType } from '../types';
import { checkConflicts } from '../lib/conflicts';
import { exportAsLegalPdf } from '../lib/pdf';
import { saveState, loadState, importSnapshotFromJson } from '../lib/storage';
import debounce from 'lodash.debounce';

const Editor: React.FC = () => {
  const location = useLocation();
  const initialAppState = location.state?.appState as AppState;
  const loadedAppState = location.state?.loadedAppState as AppState;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [appState, setAppState] = useState<AppState>(() => {
    // Check if we have a loaded state from file picker (from Home page)
    if (loadedAppState) {
      // The loadedAppState from importSnapshotFromJson already has properly initialized grid
      return loadedAppState;
    }
    if (initialAppState) {
      // This is from ViewRoutines page, also already properly initialized
      return initialAppState;
    }
    // Try to load from localStorage first
    const savedState = loadState();
    if (savedState) return savedState;

    // Default empty state if no initialAppState (e.g., direct access to /editor)
    const emptyGrid: GridData = {
      saturday: [],
      sunday: [],
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: []
    };
    return {
      universityName: 'Your University',
      departmentName: 'Your Department',
      effectiveFrom: '2025-01-01',
      batches: [],
      teachers: [],
      rooms: [],
      courses: [],
      grid: emptyGrid,
      mergedRanges: [],
    };
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCellCoords, setCurrentCellCoords] = useState<{ day: DayType; batchIndex: number; timeslotIndex: number } | null>(null);
  const [conflictMessage, setConflictMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [highlightTeacher, setHighlightTeacher] = useState<string | null>(null);

  const daysOfWeek: DayType[] = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday'];
  const timeSlots = Array.from({ length: 8 }, (_, i) => i);
  const LUNCH_INDEX = 4;

  // Clear navigation state after loading
  useEffect(() => {
    if (location.state?.loadedAppState) {
      // Clear the state to prevent reloading on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Autosave effect
  useEffect(() => {
    const debouncedSave = debounce(() => {
      saveState(appState);
      console.log("Autosaved state.");
    }, 800);
    debouncedSave();
    return () => {
      debouncedSave.cancel();
    };
  }, [appState]);

  // Initialize grid if it's empty or not properly structured
  useEffect(() => {
    // Only initialize grid if it's truly empty or malformed
    // Don't reinitialize if we already have grid data (from loaded snapshot)
    const hasGridData = appState.grid && Object.keys(appState.grid).length > 0 && 
                       daysOfWeek.some(day => appState.grid[day] && appState.grid[day].length > 0);
    
    if (!hasGridData && appState.batches.length > 0) {
      const newGrid: GridData = {
        saturday: [],
        sunday: [],
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: []
      };
      daysOfWeek.forEach(day => {
        newGrid[day] = Array(appState.batches.length).fill(null).map(() => Array(timeSlots.length).fill(null).map(() => ({})));
      });
      setAppState(prev => ({ ...prev, grid: newGrid }));
    }
  }, [appState.batches.length]);

  const handleCellClick = (day: DayType, batchIndex: number, timeslotIndex: number) => {
    setCurrentCellCoords({ day, batchIndex, timeslotIndex });
    setIsModalOpen(true);
  };

  const applyCellChange = (newCellData: Cell, mergeWithNext: boolean, forceOverride: boolean = false) => {
    if (!currentCellCoords) return;

    const { day, batchIndex, timeslotIndex } = currentCellCoords;
    const newGrid = { ...appState.grid };
    const newMergedRanges = [...appState.mergedRanges];

    const selectedCourse = appState.courses.find(c => c.courseCode === newCellData.courseCode);
    const tentativeAssignment = {
      teacherShort: selectedCourse?.teacherShort,
      room: newCellData.room,
    };

    if (!forceOverride) {
      const { teacherConflicts, roomConflicts } = checkConflicts(
        appState.grid,
        day,
        batchIndex,
        timeslotIndex,
        mergeWithNext ? 2 : 1,
        tentativeAssignment
      );

      if (teacherConflicts.length > 0 || roomConflicts.length > 0) {
        setConflictMessage(
          `Conflicts detected:\n${teacherConflicts.join('\n')}\n${roomConflicts.join('\n')}\nDo you want to override?`
        );
        setIsModalOpen(false); // Hide the editor modal
        return;
      }
    }

    // Clear existing merge if this cell was part of one
    const existingMergeIndex = newMergedRanges.findIndex(
      mr => mr.day === day && mr.row === batchIndex && mr.startCol <= timeslotIndex && (mr.startCol + mr.colspan) > timeslotIndex
    );
    if (existingMergeIndex !== -1) {
      const existingMerge = newMergedRanges[existingMergeIndex];
      for (let i = 0; i < existingMerge.colspan; i++) {
        const colToClear = existingMerge.startCol + i;
        if (newGrid[day]?.[batchIndex]?.[colToClear]) {
          newGrid[day][batchIndex][colToClear] = {};
        }
      }
      newMergedRanges.splice(existingMergeIndex, 1);
    }

    let cellToUpdate: Cell = { ...newCellData };

    if (mergeWithNext && timeslotIndex < timeSlots.length - 1) {
      cellToUpdate.merged = { startCol: timeslotIndex, colspan: 2 };

      // Mark the next cell as merged into this one
      if (newGrid[day]?.[batchIndex]?.[timeslotIndex + 1]) {
        newGrid[day][batchIndex][timeslotIndex + 1] = { ...newGrid[day][batchIndex][timeslotIndex + 1], merged: { startCol: timeslotIndex, colspan: 2 } };
      }
      newMergedRanges.push({ day, row: batchIndex, startCol: timeslotIndex, colspan: 2 });
    }

    if (newGrid[day]?.[batchIndex]) {
      newGrid[day][batchIndex][timeslotIndex] = cellToUpdate;
    }

    setAppState(prev => ({ ...prev, grid: newGrid, mergedRanges: newMergedRanges }));
    setIsModalOpen(false);
    setConflictMessage(null);
  };

  const handleModalSave = (newCellData: Cell, mergeWithNext: boolean) => {
    applyCellChange(newCellData, mergeWithNext);
  };

  const handleOverrideConflict = () => {
    if (currentCellCoords) {
      const { day, batchIndex, timeslotIndex } = currentCellCoords;
      const currentCell = appState.grid[day]?.[batchIndex]?.[timeslotIndex] || {};
      applyCellChange(currentCell, currentCell.merged ? true : false, true); // Re-apply with override
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setCurrentCellCoords(null);
    setConflictMessage(null);
  };

  const handleSaveSnapshot = () => {
    const snapshotName = prompt("Enter a name for this routine snapshot:");
    if (snapshotName && snapshotName.trim()) {
      try {
        // Create filename with date
        const date = new Date().toISOString().split('T')[0];
        const filename = `routine-${snapshotName.trim().replace(/\s/g, '-')}-${date}.json`;
        
        // Create JSON string of the app state
        const dataStr = JSON.stringify(appState, null, 2);
        
        // Create blob and download link
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = filename;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(url);
        
        setSuccessMessage(`Routine saved as ${filename}`);
        setTimeout(() => setSuccessMessage(null), 3000);
      } catch (error) {
        console.error("Error saving snapshot:", error);
        setError("Failed to save snapshot. Please try again.");
      }
    } else if (snapshotName !== null) {
      alert("Please enter a valid snapshot name.");
    }
  };

  const handleLoadSnapshot = () => {
    // Directly trigger file picker
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const loadedState = importSnapshotFromJson(text);
      
      if (loadedState) {
        // Ensure grid data is properly initialized
        const processedState = {
          ...loadedState,
          grid: loadedState.grid || {
            saturday: [],
            sunday: [],
            monday: [],
            tuesday: [],
            wednesday: [],
            thursday: [],
            friday: []
          },
          mergedRanges: loadedState.mergedRanges || [],
        };
        setAppState(processedState);
        setSuccessMessage('Routine loaded successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
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


  const handleDownloadFullRoutine = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const printElement = document.getElementById('print-preview');
      if (printElement) {
        const filename = `Full_Routine_${appState.departmentName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
        await exportAsLegalPdf(printElement, filename);
      } else {
        setError("Print preview element not found. Please refresh the page and try again.");
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      setError("Failed to generate PDF. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadMinimalRoutine = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const printElement = document.getElementById('print-preview-minimal');
      if (printElement) {
        const filename = `Minimal_Routine_${appState.departmentName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
        await exportAsLegalPdf(printElement, filename);
      } else {
        setError("Print preview element not found. Please refresh the page and try again.");
      }
    } catch (error) {
      console.error("Error generating minimal PDF:", error);
      setError("Failed to generate minimal PDF. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const currentCellData = currentCellCoords
    ? appState.grid[currentCellCoords.day]?.[currentCellCoords.batchIndex]?.[currentCellCoords.timeslotIndex] || {}
    : {};

  const availableCoursesForBatch = currentCellCoords
    ? appState.courses.filter(course => course.batchName === appState.batches[currentCellCoords.batchIndex]?.name)
    : [];

  const canMerge = currentCellCoords
    ? (currentCellCoords.timeslotIndex < timeSlots.length - 1
      && currentCellCoords.timeslotIndex !== LUNCH_INDEX
      && currentCellCoords.timeslotIndex !== LUNCH_INDEX - 1)
    : false;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Breadcrumb just below menubar */}
      <div className="w-full absolute left-0 right-0" style={{ top: '56px' }}>
        <div className="container mx-auto px-4">
          <nav className="flex space-x-2 text-sm py-2">
            <Link to="/" className="text-gray-700 hover:text-gray-900">Home</Link>
            <span className="text-gray-500">›</span>
            <span className="text-gray-700">Editor</span>
          </nav>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
          <div className="flex">
            <div className="flex-1">
              <p className="text-sm">{error}</p>
            </div>
            <div className="ml-4">
              <button
                onClick={() => setError(null)}
                className="text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Message Display with Yellow Background */}
      {successMessage && (
        <div className="fixed top-4 right-4 bg-yellow-300 border-2 border-yellow-500 text-gray-900 px-5 py-4 rounded-lg z-50 shadow-xl">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-base font-semibold">{successMessage}</p>
            </div>
            <div className="ml-4">
              <button
                onClick={() => setSuccessMessage(null)}
                className="text-gray-700 hover:text-gray-900 text-xl font-bold"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable Layout */}
      <div className="flex-1 p-2 overflow-auto">
        <PrintPreview>
          <Header
            universityName={appState.universityName}
            departmentName={appState.departmentName}
            effectiveFrom={appState.effectiveFrom}
          />

          <div className="flex" style={{ gap: '0.1in' }}>
            <div style={{ width: '10.1in' }}>
              <Grid
                gridData={appState.grid}
                batches={appState.batches}
                onCellClick={handleCellClick}
                activeBatchIndicesByDay={appState.activeBatchIndicesByDay as any}
            highlightTeacher={highlightTeacher || undefined}
              />
            </div>

            {/* Right-center: Teachers list */}
            <div style={{ width: '3in' }}>
              <TeacherList
                teachers={appState.teachers}
                onTeacherClick={(shortName) => setHighlightTeacher(prev => prev === shortName ? null : shortName)}
              />
            </div>
          </div>

          {/* Courses list spanning full width (no heading) */}
          <div className="mt-2">
            <CourseBoxes courses={appState.courses} batches={appState.batches} />
          </div>

          {/* Signature moved inside CourseBoxes last cell */}
        </PrintPreview>
        
        {/* Hidden Minimal Print Preview for PDF generation */}
        <PrintPreviewMinimal>
          {/* Header section with logo - 0.8 inch */}
          <HeaderMinimal
            universityName={appState.universityName}
            departmentName={appState.departmentName}
            effectiveFrom={appState.effectiveFrom}
          />
          
          {/* Grid section - max 6.9 inch to ensure all rows visible */}
          <div style={{ 
            height: '6.9in', 
            maxHeight: '6.9in', 
            overflow: 'hidden', 
            position: 'relative',
            boxSizing: 'border-box',
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale'
          }}>
            <GridMinimal
              gridData={appState.grid}
              batches={appState.batches}
              teachers={appState.teachers}
              activeBatchIndicesByDay={appState.activeBatchIndicesByDay as any}
            />
          </div>
          
          {/* Chairman Signature section - 0.5 inch */}
          <div style={{ 
            height: '0.5in',
            width: '100%',
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'flex-end',
            paddingRight: '1in'
          }}>
            <div style={{ 
              width: '3in',
              textAlign: 'center'
            }}>
              <div style={{ 
                height: '30px',  // Empty space for signature (line 1)
                width: '100%'
              }} />
              <div style={{ 
                borderTop: '1px solid #000',  // Underline (line 2)
                width: '100%',
                marginBottom: '2px'
              }} />
              <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '2px' }}>Chairman</div>  {/* Line 3 */}
              <div style={{ fontSize: '12px' }}>Department of ICT, MBSTU</div>  {/* Line 4 */}
            </div>
          </div>
        </PrintPreviewMinimal>
      </div>

      {/* Actions at footer */}
      <div className="fixed left-0 right-0 bottom-0 bg-white border-t border-gray-200 no-print">
        <div className="max-w-screen-2xl mx-auto px-4 py-2 flex justify-center gap-3">
          <button onClick={handleSaveSnapshot} className="px-4 py-2 bg-indigo-600 text-white rounded-md shadow-md hover:bg-indigo-700">Save Snapshot</button>
          <button onClick={handleLoadSnapshot} className="px-4 py-2 bg-indigo-600 text-white rounded-md shadow-md hover:bg-indigo-700">Load Snapshot</button>
          <button 
            onClick={handleDownloadFullRoutine} 
            disabled={isLoading}
            className={`${
              isLoading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-red-600 hover:bg-red-700'
            } px-4 py-2 rounded-md shadow-md text-white`}
          >
            {isLoading ? 'Generating PDF...' : 'Download Full Routine'}
          </button>
          <button 
            onClick={handleDownloadMinimalRoutine} 
            disabled={isLoading}
            className={`${
              isLoading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-700'
            } px-4 py-2 rounded-md shadow-md text-white`}
          >
            {isLoading ? 'Generating PDF...' : 'Download Minimal Routine'}
          </button>
        </div>
      </div>

      {isModalOpen && currentCellCoords && (
        <CellEditorModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSave={handleModalSave}
          initialCellData={currentCellData}
          availableCourses={availableCoursesForBatch}
          availableRooms={appState.rooms}
          day={currentCellCoords.day}
          batchName={appState.batches[currentCellCoords.batchIndex]?.name || ''}
          timeslotIndex={currentCellCoords.timeslotIndex}
          canMerge={canMerge}
        />
      )}


      {conflictMessage && (
        <div className="fixed top-[56px] right-0 bottom-0 w-[420px] z-50 bg-red-100 border-l-4 border-red-400 overflow-auto shadow-2xl" style={{backgroundColor: '#fecaca'}}>
          <div className="p-6">
            {/* Header Section */}
            <div className="bg-red-600 text-white rounded-lg p-4 mb-6 shadow-md">
              <h2 className="text-2xl font-bold mb-1">⚠️ Conflict Detected!</h2>
              <p className="text-red-100 text-sm">Schedule overlap found</p>
            </div>

            {/* Conflict Message Section */}
            <div className="bg-white rounded-lg p-4 shadow-md border border-red-200 mb-6">
              <h3 className="text-sm font-semibold text-red-800 mb-3">Conflict Details:</h3>
              <div className="space-y-2">
                {conflictMessage.split('\n').filter(line => line.trim() && !line.includes('Do you want')).map((line, idx) => (
                  <div key={idx} className="flex items-start">
                    <span className="text-red-500 mr-2 mt-1">•</span>
                    <p className="text-sm text-gray-800 flex-1">{line}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Warning Box */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg mb-6 shadow-sm">
              <div className="flex items-start">
                <span className="text-yellow-600 text-xl mr-3">⚡</span>
                <div>
                  <h4 className="text-sm font-semibold text-yellow-800 mb-1">Override Warning</h4>
                  <p className="text-xs text-yellow-700">
                    Overriding will create scheduling conflicts. This may cause issues with teacher or room assignments.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleModalClose}
                className="px-5 py-2.5 bg-gray-400 text-white rounded-lg font-semibold hover:bg-gray-500 active:bg-gray-600 shadow-md hover:shadow-lg transition-all transform hover:scale-105"
              >
                ✖️ Close
              </button>
              <button
                onClick={handleOverrideConflict}
                className="px-5 py-2.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 active:bg-red-800 shadow-md hover:shadow-lg transition-all transform hover:scale-105"
              >
                ⚡ Override
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden file input for loading snapshots */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

    </div>
  );
};

export default Editor;
