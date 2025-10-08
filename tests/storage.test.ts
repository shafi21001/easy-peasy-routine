import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  saveState,
  loadState,
  saveSnapshot,
  listSnapshots,
  loadSnapshot as loadSpecificSnapshot,
  deleteSnapshot,
  exportSnapshotAsJson,
  importSnapshotFromJson,
} from '../src/lib/storage';
import { AppState, Snapshot } from '../src/types';

const mockAppState: AppState = {
  universityName: 'Test Uni',
  departmentName: 'Test Dept',
  batches: [{ name: 'Batch 1', numCourses: 5 }],
  teachers: [{ fullName: 'Dr. Test', shortName: 'DT', department: 'CS' }],
  rooms: [{ name: 'Lab 1' }],
  courses: [{ batchName: 'Batch 1', courseCode: 'TC101', courseName: 'Test Course', teacherShort: 'DT' }],
  effectiveFrom: '2025-01-01',
  grid: {},
  mergedRanges: [],
};

describe('storage.ts', () => {
  let localStorageMock: Record<string, string> = {};

  beforeEach(() => {
    localStorageMock = {};
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn((key: string) => localStorageMock[key] || null),
        setItem: vi.fn((key: string, value: string) => {
          localStorageMock[key] = value;
        }),
        removeItem: vi.fn((key: string) => {
          delete localStorageMock[key];
        }),
        clear: vi.fn(() => {
          localStorageMock = {};
        }),
        length: 0,
        key: vi.fn(),
      },
      writable: true,
    });
    vi.clearAllMocks();
  });

  describe('saveState and loadState', () => {
    it('should save and load AppState correctly', () => {
      saveState(mockAppState);
      expect(window.localStorage.setItem).toHaveBeenCalledWith('easyPeasyRoutine_v1', JSON.stringify(mockAppState));

      const loaded = loadState();
      expect(loaded).toEqual(mockAppState);
      expect(window.localStorage.getItem).toHaveBeenCalledWith('easyPeasyRoutine_v1');
    });

    it('should return undefined if no state is saved', () => {
      const loaded = loadState();
      expect(loaded).toBeUndefined();
    });
  });

  describe('snapshots', () => {
    it('should save a snapshot', () => {
      saveSnapshot('My First Routine', mockAppState);
      const snapshots = listSnapshots();
      expect(snapshots.length).toBe(1);
      expect(snapshots[0].name).toBe('My First Routine');
      expect(snapshots[0].appState).toEqual(mockAppState);
    });

    it('should list multiple snapshots', () => {
      saveSnapshot('Routine A', mockAppState);
      saveSnapshot('Routine B', { ...mockAppState, universityName: 'Another Uni' });
      const snapshots = listSnapshots();
      expect(snapshots.length).toBe(2);
      expect(snapshots[0].name).toBe('Routine A');
      expect(snapshots[1].name).toBe('Routine B');
    });

    it('should load a specific snapshot by ID', () => {
      saveSnapshot('Routine to Load', mockAppState);
      const snapshots = listSnapshots();
      const snapshotId = snapshots[0].id;

      const loadedState = loadSpecificSnapshot(snapshotId);
      expect(loadedState).toEqual(mockAppState);
    });

    it('should delete a snapshot by ID', () => {
      saveSnapshot('Routine to Delete', mockAppState);
      const snapshotsBefore = listSnapshots();
      const snapshotId = snapshotsBefore[0].id;

      deleteSnapshot(snapshotId);
      const snapshotsAfter = listSnapshots();
      expect(snapshotsAfter.length).toBe(0);
    });
  });

  describe('exportSnapshotAsJson and importSnapshotFromJson', () => {
    it('should export AppState as JSON and allow import', () => {
      const mockSnapshot: Snapshot = {
        id: '123',
        name: 'Export Test',
        date: new Date().toISOString(),
        appState: mockAppState,
      };

      // Mock URL.createObjectURL and document.createElement for download
      const mockCreateObjectURL = vi.fn(() => 'blob:testurl');
      const mockRevokeObjectURL = vi.fn();
      const mockAppendChild = vi.fn();
      const mockRemoveChild = vi.fn();
      const mockClick = vi.fn();

      Object.defineProperty(window.URL, 'createObjectURL', { value: mockCreateObjectURL });
      Object.defineProperty(window.URL, 'revokeObjectURL', { value: mockRevokeObjectURL });
      Object.defineProperty(document, 'createElement', { value: (tagName: string) => {
        if (tagName === 'a') {
          return { setAttribute: vi.fn(), click: mockClick, remove: vi.fn() };
        }
        return {};
      }});
      Object.defineProperty(document.body, 'appendChild', { value: mockAppendChild });
      Object.defineProperty(document.body, 'removeChild', { value: mockRemoveChild });

      exportSnapshotAsJson(mockSnapshot);
      expect(mockClick).toHaveBeenCalled();

      const exportedJson = JSON.stringify(mockAppState, null, 2);
      const importedState = importSnapshotFromJson(exportedJson);
      expect(importedState).toEqual(mockAppState);
    });

    it('should return undefined for invalid JSON import', () => {
      const importedState = importSnapshotFromJson('{ "invalid": "json" }');
      expect(importedState).toBeUndefined();
    });
  });
});