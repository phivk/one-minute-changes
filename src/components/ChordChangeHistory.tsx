import React, { useState } from 'react';
import { Trash2, Filter } from 'lucide-react';

type ChordChange = {
  id: string;
  date: string;
  fromChord: string;
  toChord: string;
  count: number;
};

type Props = {
  history: ChordChange[];
  setHistory: React.Dispatch<React.SetStateAction<ChordChange[]>>;
};

const ChordChangeHistory: React.FC<Props> = ({ history, setHistory }) => {
  const [filterChord, setFilterChord] = useState<string>('');
  
  // Get unique chords from history
  const uniqueChords = Array.from(
    new Set(
      history.flatMap(entry => [entry.fromChord, entry.toChord])
    )
  ).sort();
  
  // Filter history based on selected chord
  const filteredHistory = filterChord 
    ? history.filter(entry => 
        entry.fromChord === filterChord || entry.toChord === filterChord
      )
    : history;
  
  // Delete an entry
  const deleteEntry = (id: string) => {
    if (confirm('Are you sure you want to delete this entry?')) {
      setHistory(prev => prev.filter(entry => entry.id !== id));
    }
  };
  
  // Clear all history
  const clearHistory = () => {
    if (confirm('Are you sure you want to clear all history? This cannot be undone.')) {
      setHistory([]);
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto bg-white/10 backdrop-blur-sm p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Practice History</h2>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <Filter className="absolute left-2 top-2.5 h-4 w-4 text-indigo-300" />
            <select
              value={filterChord}
              onChange={(e) => setFilterChord(e.target.value)}
              className="pl-8 pr-4 py-2 rounded bg-indigo-800 text-white appearance-none"
            >
              <option value="">All Chords</option>
              {uniqueChords.map(chord => (
                <option key={chord} value={chord}>{chord}</option>
              ))}
            </select>
          </div>
          
          {history.length > 0 && (
            <button
              onClick={clearHistory}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm"
            >
              Clear All
            </button>
          )}
        </div>
      </div>
      
      {filteredHistory.length === 0 ? (
        <div className="text-center py-8 text-gray-300">
          <p>No practice sessions recorded yet.</p>
          <p className="text-sm mt-2">Start practicing to see your history here!</p>
        </div>
      ) : (
        <div className="overflow-auto max-h-[60vh]">
          <table className="w-full">
            <thead className="bg-black/30 sticky top-0">
              <tr>
                <th className="text-left p-3">Date</th>
                <th className="text-left p-3">Chord Change</th>
                <th className="text-right p-3">Count</th>
                <th className="p-3 w-16"></th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map((entry) => (
                <tr key={entry.id} className="border-b border-indigo-900/30 hover:bg-white/5">
                  <td className="p-3">
                    {new Date(entry.date).toLocaleDateString()} 
                    <span className="text-xs text-gray-400 ml-1">
                      {new Date(entry.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </td>
                  <td className="p-3 font-medium">{entry.fromChord} → {entry.toChord}</td>
                  <td className="p-3 text-right font-bold">{entry.count}</td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => deleteEntry(entry.id)}
                      className="text-red-400 hover:text-red-300"
                      aria-label="Delete entry"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ChordChangeHistory;