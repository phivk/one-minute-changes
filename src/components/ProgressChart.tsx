import React, { useMemo, useState, useRef, useEffect } from "react";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import useD3BeeswarmChart from "../hooks/useD3BeeswarmChart";

type ChordChange = {
  id: string;
  date: string;
  fromChord: string;
  toChord: string;
  count: number;
};

type ChordPair = string;

type Props = {
  history: ChordChange[];
};

const ProgressChart: React.FC<Props> = ({ history }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Get all unique chord pairs
  const chordPairs = useMemo(() => {
    const pairs = new Set<ChordPair>();
    history.forEach((entry) => {
      pairs.add(`${entry.fromChord}-${entry.toChord}`);
    });
    return Array.from(pairs);
  }, [history]);

  const [selectedPair, setSelectedPair] = useState<ChordPair>(
    chordPairs[0] || ""
  );

  // Process data for D3
  const chartData = useMemo(() => {
    if (!selectedPair) return [];

    const [fromChord, toChord] = selectedPair.split("-");

    return history
      .filter(
        (entry) => entry.fromChord === fromChord && entry.toChord === toChord
      )
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((entry) => ({
        date: new Date(entry.date).toLocaleDateString(),
        value: entry.count,
      }));
  }, [history, selectedPair]);

  // Update dimensions on mount and window resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: 250,
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const svgRef = useD3BeeswarmChart(
    chartData,
    dimensions.width,
    dimensions.height
  );

  // Calculate statistics
  const stats = useMemo(() => {
    if (chartData.length === 0) return { max: 0, avg: 0, trend: "neutral" };

    const max = Math.max(...chartData.map((d) => d.value));
    const avg = Math.round(
      chartData.reduce((sum, d) => sum + d.value, 0) / chartData.length
    );

    // Calculate trend based on last 5 entries
    let trend: "up" | "down" | "neutral" = "neutral";
    if (chartData.length >= 3) {
      const recent = chartData.slice(-3);
      const firstAvg = recent[0].value;
      const lastAvg = recent[recent.length - 1].value;

      if (lastAvg > firstAvg) trend = "up";
      else if (lastAvg < firstAvg) trend = "down";
    }

    return { max, avg, trend };
  }, [chartData]);

  return (
    <div className="max-w-2xl mx-auto bg-white/10 backdrop-blur-sm p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-6">Progress Stats</h2>

      {chordPairs.length === 0 ? (
        <div className="text-center py-8 text-gray-300">
          <p>No practice data available yet.</p>
          <p className="text-sm mt-2">
            Complete some practice sessions to see your progress!
          </p>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <label className="block text-sm mb-1">Select Chord Change</label>
            <select
              value={selectedPair}
              onChange={(e) => setSelectedPair(e.target.value)}
              className="w-full p-2 rounded bg-indigo-800 text-white"
            >
              {chordPairs.map((pair) => {
                const [from, to] = pair.split("-");
                return (
                  <option key={pair} value={pair}>
                    {from} → {to}
                  </option>
                );
              })}
            </select>
          </div>

          {chartData.length > 0 ? (
            <>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-indigo-800/50 p-4 rounded-lg">
                  <p className="text-sm text-indigo-300 mb-1">Best Score</p>
                  <p className="text-2xl font-bold">{stats.max}</p>
                </div>
                <div className="bg-indigo-800/50 p-4 rounded-lg">
                  <p className="text-sm text-indigo-300 mb-1">Average</p>
                  <p className="text-2xl font-bold">{stats.avg}</p>
                </div>
                <div className="bg-indigo-800/50 p-4 rounded-lg">
                  <p className="text-sm text-indigo-300 mb-1">Trend</p>
                  <p className="text-2xl font-bold flex items-center">
                    {stats.trend === "up" && (
                      <>
                        <ArrowUpRight className="text-green-400 mr-1 h-5 w-5" />{" "}
                        Improving
                      </>
                    )}
                    {stats.trend === "down" && (
                      <>
                        <ArrowDownRight className="text-red-400 mr-1 h-5 w-5" />{" "}
                        Declining
                      </>
                    )}
                    {stats.trend === "neutral" && (
                      <>
                        <Minus className="text-yellow-400 mr-1 h-5 w-5" />{" "}
                        Stable
                      </>
                    )}
                  </p>
                </div>
              </div>

              <div className="mt-6" ref={containerRef}>
                <h3 className="text-lg font-semibold mb-4">Progress Chart</h3>
                <svg
                  ref={svgRef}
                  width={dimensions.width}
                  height={dimensions.height}
                  className="w-full overflow-visible"
                />
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-2">Practice Log</h3>
                <div className="bg-black/20 p-3 rounded-md max-h-48 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="text-indigo-300">
                      <tr>
                        <th className="text-left p-1">Date</th>
                        <th className="text-right p-1">Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {chartData.map((d, index) => (
                        <tr
                          key={index}
                          className="border-b border-indigo-900/20 last:border-0"
                        >
                          <td className="p-1">{d.date}</td>
                          <td className="p-1 text-right font-medium">
                            {d.value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-gray-300">
              <p>No data available for this chord change.</p>
              <p className="text-sm mt-2">
                Practice more to see your progress!
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProgressChart;
