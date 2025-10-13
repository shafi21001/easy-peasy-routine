import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Header from '../components/Editor/Header';
import Grid from '../components/Editor/Grid';
import TeacherList from '../components/Editor/TeacherList';
import CourseBoxes from '../components/Editor/CourseBoxes';
import PrintPreview from '../components/Editor/PrintPreview';
import CellEditorModal from '../components/Editor/CellEditorModal';
import { AppState, Cell, GridData, Day as DayType, Snapshot } from '../types';
import { checkConflicts } from '../lib/conflicts';
import { exportAsLegalPdf } from '../lib/pdf';
import { saveState, loadState, saveSnapshot, listSnapshots, loadSnapshot as loadSpecificSnapshot } from '../lib/storage';
import debounce from 'lodash.debounce';

const Editor: React.FC = () => {
  const location = useLocation();
  const initialAppState = location.state?.appState as AppState;

  const [appState, setAppState] = useState<AppState>(() => {
    if (initialAppState) {
      return {
        ...initialAppState,
        grid: initialAppState.grid || {
          saturday: [],
          sunday: [],
          monday: [],
          tuesday: [],
          wednesday: [],
          thursday: [],
          friday: []
        },
        mergedRanges: initialAppState.mergedRanges || [],
      };
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
  const [showLoadSnapshotModal, setShowLoadSnapshotModal] = useState(false);
  const [availableSnapshots, setAvailableSnapshots] = useState<Snapshot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [highlightTeacher, setHighlightTeacher] = useState<string | null>(null);

  const daysOfWeek: DayType[] = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday'];
  const timeSlots = Array.from({ length: 8 }, (_, i) => i);
  const LUNCH_INDEX = 4;

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
    if (!appState.grid || Object.keys(appState.grid).length === 0 || appState.batches.length > 0) {
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
        if (appState.batches.length > 0) {
          newGrid[day] = Array(appState.batches.length).fill(null).map(() => Array(timeSlots.length).fill({}));
        } else {
          newGrid[day] = [];
        }
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
        saveSnapshot(snapshotName.trim(), appState);
        alert("Routine saved as snapshot!");
      } catch (error) {
        console.error("Error saving snapshot:", error);
        setError("Failed to save snapshot. Please try again.");
      }
    } else if (snapshotName !== null) {
      alert("Please enter a valid snapshot name.");
    }
  };

  const handleLoadSnapshot = () => {
    setAvailableSnapshots(listSnapshots());
    setShowLoadSnapshotModal(true);
  };

  const handleSelectSnapshotToLoad = (id: string) => {
    const loadedState = loadSpecificSnapshot(id);
    if (loadedState) {
      setAppState(loadedState);
      alert("Snapshot loaded successfully!");
      setShowLoadSnapshotModal(false);
    } else {
      alert("Failed to load snapshot.");
    }
  };

  const handleDownloadPdf = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const printElement = document.getElementById('print-preview');
      if (printElement) {
        const filename = `Routine_${appState.departmentName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
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

      {/* Printable Layout */}
      <div className="flex-1 p-2 overflow-auto">
        <PrintPreview>
          <Header
            universityName={appState.universityName}
            departmentName={appState.departmentName}
            effectiveFrom={appState.effectiveFrom}
          />

          <div className="flex" style={{ gap: '0.2in', boxShadow: 'none' }}>
            <div style={{ width: '10in', boxShadow: 'none' }}>
              <Grid
                gridData={appState.grid}
                batches={appState.batches}
                onCellClick={handleCellClick}
                activeBatchIndicesByDay={appState.activeBatchIndicesByDay as any}
            highlightTeacher={highlightTeacher || undefined}
              />
            </div>

            {/* Right-center: Teachers list */}
            <div style={{ width: '3.8in', boxShadow: 'none' }} className="border border-gray-300 p-2">
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
      </div>

      {/* Actions at footer */}
      <div className="fixed left-0 right-0 bottom-0 bg-white border-t border-gray-200 no-print">
        <div className="max-w-screen-2xl mx-auto px-4 py-2 flex justify-center gap-3">
          <button onClick={handleSaveSnapshot} className="px-4 py-2 bg-indigo-600 text-white rounded-md shadow-md hover:bg-indigo-700">Save Snapshot</button>
          <button onClick={handleLoadSnapshot} className="px-4 py-2 bg-indigo-600 text-white rounded-md shadow-md hover:bg-indigo-700">Load Snapshot</button>
          <button 
            onClick={handleDownloadPdf} 
            disabled={isLoading}
            className={`${
              isLoading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-red-600 hover:bg-red-700'
            } px-4 py-2 rounded-md shadow-md text-white`}
          >
            {isLoading ? 'Generating PDF...' : 'Download PDF'}
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

      {showLoadSnapshotModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <h2 className="text-xl font-bold mb-4">Load Routine Snapshot</h2>
            {availableSnapshots.length === 0 ? (
              <p>No snapshots available.</p>
            ) : (
              <ul className="space-y-2 mb-4">
                {availableSnapshots.map(snapshot => (
                  <li key={snapshot.id} className="flex justify-between items-center p-2 border rounded-md">
                    <span>{snapshot.name} ({new Date(snapshot.date).toLocaleDateString()})</span>
                    <button
                      onClick={() => handleSelectSnapshotToLoad(snapshot.id)}
                      className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                    >
                      Load
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex justify-end">
              <button
                onClick={() => setShowLoadSnapshotModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md shadow-md hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Editor;
