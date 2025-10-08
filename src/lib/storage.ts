import { AppState, Snapshot } from '../types';

const APP_STATE_KEY = 'easyPeasyRoutine_v1';
const SNAPSHOTS_KEY = 'easyPeasySnapshots_v1';

export const saveState = (state: AppState): void => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem(APP_STATE_KEY, serializedState);
  } catch (error) {
    console.error("Error saving state to localStorage:", error);
  }
};

export const loadState = (): AppState | undefined => {
  try {
    const serializedState = localStorage.getItem(APP_STATE_KEY);
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch (error) {
    console.error("Error loading state from localStorage:", error);
    return undefined;
  }
};

export const saveSnapshot = (name: string, state: AppState): void => {
  try {
    const snapshots = listSnapshots();
    const newSnapshot: Snapshot = {
      id: Date.now().toString(),
      name,
      date: new Date().toISOString(),
      appState: state,
    };
    snapshots.push(newSnapshot);
    localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(snapshots));
  } catch (error) {
    console.error("Error saving snapshot to localStorage:", error);
  }
};

export const listSnapshots = (): Snapshot[] => {
  try {
    const serializedSnapshots = localStorage.getItem(SNAPSHOTS_KEY);
    if (serializedSnapshots === null) {
      return [];
    }
    return JSON.parse(serializedSnapshots);
  } catch (error) {
    console.error("Error listing snapshots from localStorage:", error);
    return [];
  }
};

export const loadSnapshot = (id: string): AppState | undefined => {
  try {
    const snapshots = listSnapshots();
    const snapshot = snapshots.find(s => s.id === id);
    return snapshot?.appState;
  } catch (error) {
    console.error("Error loading snapshot from localStorage:", error);
    return undefined;
  }
};

export const deleteSnapshot = (id: string): void => {
  try {
    let snapshots = listSnapshots();
    snapshots = snapshots.filter(s => s.id !== id);
    localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(snapshots));
  } catch (error) {
    console.error("Error deleting snapshot from localStorage:", error);
  }
};

export const exportSnapshotAsJson = (snapshot: Snapshot): void => {
  const filename = `routine-${snapshot.name.replace(/\s/g, '-')}-${new Date(snapshot.date).toISOString().split('T')[0]}.json`;
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(snapshot.appState, null, 2));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", filename);
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
};

export const importSnapshotFromJson = (jsonString: string): AppState | undefined => {
  try {
    const importedState: AppState = JSON.parse(jsonString);
    // Basic validation to ensure it's an AppState object
    if (importedState.universityName && importedState.batches && importedState.teachers) {
      return importedState;
    }
    console.error("Invalid AppState structure in imported JSON.");
    return undefined;
  } catch (error) {
    console.error("Error importing snapshot from JSON:", error);
    return undefined;
  }
};