import { useState } from "react"
import type { Position } from "../utils/gameLogic"

interface GameStateAnalysisProps {
  positions: Position[]
  maxPileSize: number
  allowedMoves: number[]
  numPiles: number
}

export default function GameStateAnalysis({ positions, maxPileSize, allowedMoves, numPiles }: GameStateAnalysisProps) {
  const [selectedPileSize, setSelectedPileSize] = useState<number | null>(null)
  const [helpMode, setHelpMode] = useState(false)

  // Get strategy recommendations
  const getStrategyRecommendations = (pileSize: number) => {
    if (positions[pileSize] === "losing") {
      return "This is a losing position. Try to force your opponent into this position."
    }

    const winningMoves = allowedMoves.filter(move =>
      pileSize - move >= 0 && positions[pileSize - move] === "losing"
    )

    if (winningMoves.length === 0) {
      return "No winning moves available. Try to minimize your losses."
    }

    return `Winning moves: ${winningMoves.join(", ")}. Take one of these amounts to force a win.`
  }

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-6">
        <h2>Position Analysis</h2>
        <button
          onClick={() => setHelpMode(!helpMode)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {helpMode ? "Disable Help" : "Enable Help"}
        </button>
      </div>

      {numPiles > 1 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <p className="text-sm">Note: Analysis reflects individual pile states, not multi-pile combinations.</p>
        </div>
      )}

      {helpMode && (
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-4">Game Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200 shadow-sm">
              <h4 className="font-medium mb-3 text-blue-800">Key Patterns</h4>
              <div className="space-y-4">
                <div className="bg-white p-3 rounded-md border border-blue-200">
                  <div className="text-sm font-medium text-blue-700 mb-2">Losing Positions</div>
                  <div className="flex flex-wrap gap-2">
                    {Array.from({ length: 5 }, (_, i) => (Math.max(...allowedMoves) + 1) * (i + 1) - 1).map((pos) => (
                      <span key={pos} className="font-mono bg-red-100 text-red-800 px-2 py-1 rounded">
                        {pos}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-blue-600 mt-2">
                    Positions divisible by {Math.max(...allowedMoves) + 1} minus 1 are losing positions
                  </p>
                </div>

                <div className="bg-white p-3 rounded-md border border-blue-200">
                  <div className="text-sm font-medium text-blue-700 mb-2">Safe Moves</div>
                  <div className="flex flex-wrap gap-2">
                    {allowedMoves.map((move) => (
                      <span key={move} className="font-mono bg-green-100 text-green-800 px-2 py-1 rounded">
                        {move}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-blue-600 mt-2">
                    Taking {Math.min(...allowedMoves)} coins is often a safe move
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200 shadow-sm">
              <h4 className="font-medium mb-3 text-green-800">Strategy Insights</h4>
              <div className="space-y-4">
                <div className="bg-white p-3 rounded-md border border-green-200">
                  <div className="text-sm font-medium text-green-700 mb-2">Current Position Analysis</div>
                  {selectedPileSize !== null && (
                    <div className="space-y-2">
                      <div className={`text-sm ${positions[selectedPileSize] === "winning" ? "text-green-600" : "text-red-600"}`}>
                        {positions[selectedPileSize] === "winning" ? "✓ Winning Position" : "✗ Losing Position"}
                      </div>
                      <div className="text-xs text-gray-600">
                        {getStrategyRecommendations(selectedPileSize)}
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-white p-3 rounded-md border border-green-200">
                  <div className="text-sm font-medium text-green-700 mb-2">Strategic Principles</div>
                  <ul className="space-y-2 text-sm text-green-900">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">•</span>
                      <span>Force opponent into losing positions by maintaining winning positions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">•</span>
                      <span>Watch for patterns in winning positions to predict optimal moves</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">•</span>
                      <span>Consider the maximum allowed move when planning your strategy</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white p-3 rounded-md border border-green-200">
                  <div className="text-sm font-medium text-green-700 mb-2">Move Analysis</div>
                  <div className="space-y-2">
                    {allowedMoves.map((move) => (
                      <div key={move} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Move {move}:</span>
                        <span className="text-green-600">
                          {move === Math.min(...allowedMoves) ? "Safe" : "Aggressive"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left border">Pile Size</th>
                  <th className="p-2 text-left border">Position State</th>
                  <th className="p-2 text-left border">Winning Moves</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: Math.min(20, maxPileSize + 1) }, (_, i) => i).map((pileSize) => (
                  <tr
                    key={pileSize}
                    className={`hover:bg-gray-50 cursor-pointer ${selectedPileSize === pileSize ? "bg-blue-50" : ""
                      }`}
                    onClick={() => setSelectedPileSize(pileSize)}
                  >
                    <td className="p-2 border">{pileSize}</td>
                    <td className="p-2 border">
                      <span
                        className={`inline-block px-2 py-1 rounded text-sm ${positions[pileSize] === "winning"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                          }`}
                      >
                        {positions[pileSize]}
                      </span>
                    </td>
                    <td className="p-2 border">
                      {positions[pileSize] === "winning"
                        ? allowedMoves
                          .filter((move) => pileSize - move >= 0 && positions[pileSize - move] === "losing")
                          .join(", ")
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="font-medium mb-2">Position Details</h3>
            {selectedPileSize !== null ? (
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-600">Current Position</div>
                  <div className="font-medium">{selectedPileSize} coins</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Position State</div>
                  <div
                    className={`inline-block px-2 py-1 rounded text-sm ${positions[selectedPileSize] === "winning"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                      }`}
                  >
                    {positions[selectedPileSize]}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Strategy</div>
                  <div className="text-sm">{getStrategyRecommendations(selectedPileSize)}</div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Select a position to view details</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
