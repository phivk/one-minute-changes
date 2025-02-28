import React, { useState, useEffect } from "react";
import { PlusCircle, MinusCircle, Play, Square, Save } from "lucide-react";

type ChordChange = {
  id: string;
  date: string;
  fromChord: string;
  toChord: string;
  count: number;
};

interface PracticeViewProps {
  history: ChordChange[];
  setHistory: React.Dispatch<React.SetStateAction<ChordChange[]>>;
}

const PracticeView: React.FC<PracticeViewProps> = ({ history, setHistory }) => {
  // State for timer
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [isActive, setIsActive] = useState<boolean>(false);

  // State for chord changes
  const [count, setCount] = useState<number>(0);
  const [inputValue, setInputValue] = useState<string>("0");
  const [fromChord, setFromChord] = useState<string>("A");
  const [toChord, setToChord] = useState<string>("D");

  // Timer effect
  useEffect(() => {
    let interval: number | undefined;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      // Play sound when timer ends
      const audio = new Audio(
        "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3"
      );
      audio.play();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft]);

  // Start timer
  const startTimer = () => {
    setIsActive(true);
    setCount(0);
    setInputValue("0");
  };

  // Reset timer
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(60);
    setCount(0);
    setInputValue("0");
  };

  // Increment/decrement count
  const incrementCount = () => {
    const newCount = count + 1;
    setCount(newCount);
    setInputValue(newCount.toString());
  };

  const decrementCount = () => {
    if (count > 0) {
      const newCount = count - 1;
      setCount(newCount);
      setInputValue(newCount.toString());
    }
  };

  // Handle direct count input
  const handleCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    if (value === "") {
      setCount(0);
    } else {
      const numValue = parseInt(value);
      if (!isNaN(numValue) && numValue >= 0) {
        setCount(numValue);
      }
    }
  };

  // Save current session
  const saveSession = () => {
    if (count > 0) {
      const newEntry: ChordChange = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        fromChord,
        toChord,
        count,
      };

      setHistory((prev) => [newEntry, ...prev]);
      resetTimer();
    }
  };

  // Common chord options
  const chordOptions = ["A", "Am", "C", "D", "Dm", "E", "Em", "F", "G"];

  return (
    <div className="max-w-md mx-auto bg-white/10 backdrop-blur-sm p-6 rounded-lg shadow-lg">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="w-1/2 pr-2">
            <label className="block text-sm mb-1">From Chord</label>
            <select
              value={fromChord}
              onChange={(e) => setFromChord(e.target.value)}
              className="w-full p-2 rounded bg-indigo-800 text-white"
            >
              {chordOptions.map((chord) => (
                <option key={chord} value={chord}>
                  {chord}
                </option>
              ))}
            </select>
          </div>
          <div className="w-1/2 pl-2">
            <label className="block text-sm mb-1">To Chord</label>
            <select
              value={toChord}
              onChange={(e) => setToChord(e.target.value)}
              className="w-full p-2 rounded bg-indigo-800 text-white"
            >
              {chordOptions.map((chord) => (
                <option key={chord} value={chord}>
                  {chord}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-center mb-4">
          <div className="text-6xl font-bold mb-2">
            {String(Math.floor(timeLeft / 60)).padStart(2, "0")}:
            {String(timeLeft % 60).padStart(2, "0")}
          </div>
          <div className="flex justify-center gap-4">
            {!isActive ? (
              <button
                onClick={startTimer}
                disabled={isActive}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full flex items-center gap-1"
              >
                <Play className="h-5 w-5" /> Start
              </button>
            ) : (
              <button
                onClick={resetTimer}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full flex items-center gap-1"
              >
                <Square className="h-5 w-5" /> Stop
              </button>
            )}
          </div>
        </div>

        <div className="text-center mb-6">
          <p className="text-sm mb-2">Chord Changes</p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={decrementCount}
              className="bg-indigo-700 hover:bg-indigo-800 p-2 rounded-full"
            >
              <MinusCircle className="h-6 w-6" />
            </button>

            {/* Direct input field for count with hidden controls */}
            <div className="relative w-20">
              <input
                type="text"
                inputMode="numeric"
                value={inputValue}
                onChange={handleCountChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.currentTarget.blur();
                    saveSession();
                  }
                }}
                onFocus={(e) => {
                  if (e.target.value === "0") {
                    setInputValue("");
                  }
                }}
                onBlur={(e) => {
                  if (e.target.value === "") {
                    setInputValue("0");
                  }
                }}
                className="w-full text-4xl font-bold text-center bg-transparent border-b-2 border-indigo-500 focus:border-indigo-300 focus:outline-none"
                aria-label="Number of chord changes"
              />
            </div>

            <button
              onClick={incrementCount}
              className="bg-indigo-700 hover:bg-indigo-800 p-2 rounded-full"
            >
              <PlusCircle className="h-6 w-6" />
            </button>
          </div>
        </div>

        <button
          onClick={saveSession}
          disabled={count === 0}
          className={`w-full py-3 rounded-md flex items-center justify-center gap-2 ${
            count === 0 ? "bg-gray-600" : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          <Save className="h-5 w-5" /> Save Progress
        </button>
      </div>

      {history.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Recent Progress</h3>
          <div className="bg-black/20 p-3 rounded-md">
            {history.slice(0, 3).map((entry) => (
              <div key={entry.id} className="mb-2 last:mb-0">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium">
                      {entry.fromChord} → {entry.toChord}
                    </span>
                    <span className="text-sm text-gray-300 ml-2">
                      {new Date(entry.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="font-bold">{entry.count}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PracticeView;
