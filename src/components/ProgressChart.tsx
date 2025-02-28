import React, { useMemo, useState } from "react";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

type ChordChange = {
  id: string;
  date: string;
  fromChord: string;
  toChord: string;
  count: number;
};

type ChordPair = string;
type ChordData = {
  dates: string[];
  counts: number[];
};

type Props = {
  history: ChordChange[];
};

const ProgressChart: React.FC<Props> = ({ history }) => {
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

  // Process data for the selected chord pair
  const chartData = useMemo(() => {
    if (!selectedPair) return { dates: [], counts: [] };

    const [fromChord, toChord] = selectedPair.split("-");

    const filteredEntries = history
      .filter(
        (entry) => entry.fromChord === fromChord && entry.toChord === toChord
      )
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return {
      dates: filteredEntries.map((entry) =>
        new Date(entry.date).toLocaleDateString()
      ),
      counts: filteredEntries.map((entry) => entry.count),
    };
  }, [history, selectedPair]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (chartData.counts.length === 0)
      return { max: 0, avg: 0, trend: "neutral" };

    const max = Math.max(...chartData.counts);
    const avg = Math.round(
      chartData.counts.reduce((sum, count) => sum + count, 0) /
        chartData.counts.length
    );

    // Calculate trend based on last 5 entries
    let trend: "up" | "down" | "neutral" = "neutral";
    if (chartData.counts.length >= 3) {
      const recent = chartData.counts.slice(-3);
      const firstAvg = recent[0];
      const lastAvg = recent[recent.length - 1];

      if (lastAvg > firstAvg) trend = "up";
      else if (lastAvg < firstAvg) trend = "down";
    }

    return { max, avg, trend };
  }, [chartData]);

  // Find the max value for scaling the chart
  const maxValue = Math.max(...chartData.counts, 1) * 1.1;

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

          {chartData.counts.length > 0 ? (
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

              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Progress Chart</h3>
                <div className="h-64 relative">
                  {/* Y-axis labels */}
                  <div className="absolute left-0 top-0 bottom-0 w-10 flex flex-col justify-between text-xs text-gray-400">
                    <span>{Math.round(maxValue)}</span>
                    <span>{Math.round(maxValue * 0.75)}</span>
                    <span>{Math.round(maxValue * 0.5)}</span>
                    <span>{Math.round(maxValue * 0.25)}</span>
                    <span>0</span>
                  </div>

                  {/* Chart grid */}
                  <div className="absolute left-10 right-0 top-0 bottom-0 border-l border-b border-indigo-700/50">
                    {[0.25, 0.5, 0.75].map((pos) => (
                      <div
                        key={pos}
                        className="absolute left-0 right-0 border-t border-indigo-700/30"
                        style={{ top: `${pos * 100}%` }}
                      />
                    ))}

                    {/* Bars */}
                    <div className="absolute left-0 right-0 top-0 bottom-0 flex items-end">
                      {chartData.counts.map((count, index) => {
                        const height = (count / maxValue) * 100;
                        const barWidth =
                          100 / Math.max(chartData.counts.length * 2, 1);

                        return (
                          <div
                            key={index}
                            className="flex flex-col items-center mx-1"
                            style={{ width: `${barWidth}%` }}
                          >
                            <div
                              className="w-full bg-gradient-to-t from-indigo-600 to-blue-400 rounded-t"
                              style={{ height: `${height}%` }}
                            />
                            {chartData.counts.length <= 10 && (
                              <div className="text-xs mt-1 text-gray-300 transform -rotate-45 origin-top-left">
                                {chartData.dates[index]}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
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
                      {chartData.counts.map((count, index) => (
                        <tr
                          key={index}
                          className="border-b border-indigo-900/20 last:border-0"
                        >
                          <td className="p-1">{chartData.dates[index]}</td>
                          <td className="p-1 text-right font-medium">
                            {count}
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
