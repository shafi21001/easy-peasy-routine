import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { listSnapshots, deleteSnapshot, exportSnapshotAsJson, loadSnapshot } from '../lib/storage';
import { Snapshot } from '../types';

const ViewRoutines: React.FC = () => {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    setSnapshots(listSnapshots());
  }, []);

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this routine?')) {
      deleteSnapshot(id);
      setSnapshots(listSnapshots()); // Refresh the list
    }
  };

  const handleEdit = (id: string) => {
    const appState = loadSnapshot(id);
    if (appState) {
      navigate('/editor', { state: { appState } });
    } else {
      alert('Could not load routine for editing.');
    }
  };

  const handleExport = (snapshot: Snapshot) => {
    exportSnapshotAsJson(snapshot);
  };

  return (
    <div className="container mx-auto p-4">
      {/* Navigation Breadcrumb */}
      <nav className="flex space-x-2 text-sm mb-4">
        <Link to="/" className="text-blue-600 hover:text-blue-800">Home</Link>
        <span className="text-gray-400">›</span>
        <span className="text-gray-600">View Routines</span>
      </nav>
      
      <h1 className="text-3xl font-bold mb-6">View Existing Routines</h1>
      {snapshots.length === 0 ? (
        <p>No routines saved yet. Create one using the Wizard!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {snapshots.map(snapshot => (
            <div key={snapshot.id} className="bg-white p-4 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-2">{snapshot.name}</h2>
              <p className="text-gray-600 text-sm mb-4">Saved on: {new Date(snapshot.date).toLocaleString()}</p>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(snapshot.id)}
                  className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(snapshot.id)}
                  className="px-3 py-1 bg-red-600 text-white rounded-md text-sm hover:bg-red-700"
                >
                  Delete
                </button>
                <button
                  onClick={() => handleExport(snapshot)}
                  className="px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
                >
                  Export JSON
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ViewRoutines;