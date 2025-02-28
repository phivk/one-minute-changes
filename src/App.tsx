import { useState, useEffect } from "react";
import { History, Timer, Music, BarChart2 } from "lucide-react";
import ChordChangeHistory from "./components/ChordChangeHistory";
import ProgressChart from "./components/ProgressChart";
import PracticeView from "./components/PracticeView";

// Define types
type ChordChange = {
  id: string;
  date: string;
  fromChord: string;
  toChord: string;
  count: number;
};

function App() {
  // State for history
  const [history, setHistory] = useState<ChordChange[]>(() => {
    const savedHistory = localStorage.getItem("chordChangeHistory");
    return savedHistory ? JSON.parse(savedHistory) : [];
  });

  // State for view
  const [activeView, setActiveView] = useState<
    "practice" | "history" | "stats"
  >("practice");

  // Save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("chordChangeHistory", JSON.stringify(history));
  }, [history]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-indigo-900 text-white">
      <header className="p-4 bg-black/30 shadow-md">
        <h1 className="text-2xl font-bold text-center flex items-center justify-center gap-2">
          <Music className="h-6 w-6" /> One Minute Changes
        </h1>
      </header>

      <nav className="flex justify-around p-2 bg-black/20">
        <button
          onClick={() => setActiveView("practice")}
          className={`px-4 py-2 rounded-md flex items-center gap-1 ${
            activeView === "practice" ? "bg-indigo-700" : "hover:bg-indigo-800"
          }`}
        >
          <Timer className="h-4 w-4" /> Practice
        </button>
        <button
          onClick={() => setActiveView("history")}
          className={`px-4 py-2 rounded-md flex items-center gap-1 ${
            activeView === "history" ? "bg-indigo-700" : "hover:bg-indigo-800"
          }`}
        >
          <History className="h-4 w-4" /> History
        </button>
        <button
          onClick={() => setActiveView("stats")}
          className={`px-4 py-2 rounded-md flex items-center gap-1 ${
            activeView === "stats" ? "bg-indigo-700" : "hover:bg-indigo-800"
          }`}
        >
          <BarChart2 className="h-4 w-4" /> Stats
        </button>
      </nav>

      <main className="container mx-auto p-4">
        {activeView === "practice" && (
          <PracticeView history={history} setHistory={setHistory} />
        )}

        {activeView === "history" && (
          <ChordChangeHistory history={history} setHistory={setHistory} />
        )}

        {activeView === "stats" && <ProgressChart history={history} />}
      </main>

      <footer className="text-center p-4 text-sm text-indigo-300">
        <p>Keep practicing! Consistency is key to mastering chord changes.</p>
      </footer>
    </div>
  );
}

export default App;
