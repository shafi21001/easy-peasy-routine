import React, { useEffect, useState } from 'react';
import { Batch, Day as DayType } from '../../types';

interface Step4Props {
  batches: Batch[];
  initialSelection?: Record<string, number[]>;
  onPrevious: () => void;
  onNext: (activeBatchIndicesByDay: Record<string, number[]>) => void;
}

const days: DayType[] = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday'];

const Step4: React.FC<Step4Props> = ({ batches, initialSelection, onPrevious, onNext }) => {
  const [selection, setSelection] = useState<Record<string, number[]>>(() => {
    const init: Record<string, number[]> = {};
    days.forEach(d => {
      init[d] = initialSelection?.[d] ?? batches.map((_, idx) => idx);
    });
    return init;
  });

  useEffect(() => {
    // If batches change in length, ensure indices are clamped
    setSelection(prev => {
      const next: Record<string, number[]> = {};
      days.forEach(d => {
        const allowed = new Set(batches.map((_, i) => i));
        next[d] = (prev[d] ?? []).filter(i => allowed.has(i));
      });
      return next;
    });
  }, [batches.length]);

  const toggle = (day: DayType, idx: number) => {
    setSelection(prev => {
      const current = new Set(prev[day] ?? []);
      if (current.has(idx)) current.delete(idx); else current.add(idx);
      return { ...prev, [day]: Array.from(current).sort((a, b) => a - b) };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext(selection);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-4">
      <h2 className="text-xl font-semibold">Step 4: Select Active Batches Per Day</h2>
      <p className="text-sm text-gray-600">Choose which batches have classes on each day. Only selected batches will appear as rows for that day in the editor and PDF.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {days.map((day) => (
          <div key={day} className="border rounded-md p-3">
            <h3 className="font-semibold mb-2 uppercase">{day}</h3>
            <div className="flex flex-wrap gap-3">
              {batches.map((b, i) => (
                <label key={i} className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={(selection[day] || []).includes(i)}
                    onChange={() => toggle(day, i)}
                    className="h-4 w-4"
                  />
                  <span className="text-sm">{b.name}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between mt-6">
        <button type="button" onClick={onPrevious} className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md shadow-md hover:bg-gray-400">Previous</button>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700">Generate Routine</button>
      </div>
    </form>
  );
};

export default Step4;


