import { BaseMove, CompleteMoveRecord } from "../../types/game"
import { toDisplayFormat } from "../../utils/featureManager"

interface GameLogProps {
  moveHistory: BaseMove[]
  winner: number | null
  gameState: GameState
}

export default function GameLog({ moveHistory, winner, gameState }: GameLogProps) {
  if (!moveHistory?.length) {
    return null
  }

  // Convert moves to display format
  const displayHistory = moveHistory.map((move, index) =>
    toDisplayFormat(move, gameState, index)
  )

  return (
    <div className="card">
      <h2>Move History</h2>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left border">Turn</th>
              <th className="p-2 text-left border">Player</th>
              <th className="p-2 text-left border">Strategy</th>
              <th className="p-2 text-left border">Move</th>
              <th className="p-2 text-left border">Pile Before</th>
              <th className="p-2 text-left border">Pile After</th>
            </tr>
          </thead>
          <tbody>
            {displayHistory.map((record) => (
              <tr
                key={`move-${record.turn}`}
                className="hover:bg-gray-50 transition-colors duration-200"
              >
                <td className="p-2 border font-mono">{record.turn}</td>
                <td className="p-2 border">
                  <span
                    className="font-medium"
                    style={{ color: record.player === 1 ? "var(--color-accent)" : undefined }}
                  >
                    {record.player === 1 ? "Player 1" : "Player 2"}
                  </span>
                </td>
                <td className="p-2 border">
                  <span className="inline-flex items-center">
                    {record.strategy}
                    {record.timeout && (
                      <span className="ml-2 text-red-600 text-sm transition-opacity duration-200">
                        (Timeout - Forced Greedy)
                      </span>
                    )}
                  </span>
                </td>
                <td className="p-2 border">
                  {record.pilesBeforeMove.length > 1 ? (
                    <span className="font-medium">
                      Take {record.coinsToTake} from Pile {record.pileIndex + 1}
                    </span>
                  ) : (
                    <span className="font-medium">Take {record.coinsToTake}</span>
                  )}
                </td>
                <td className="p-2 border">
                  {record.pilesBeforeMove.length > 1 ? (
                    <div className="flex gap-1">
                      {record.pilesBeforeMove.map((pile, index) => (
                        <span
                          key={`${record.turn}-before-${index}`}
                          className={`px-2 py-1 rounded-md text-sm ${index === record.pileIndex
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                            }`}
                        >
                          {pile}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="font-mono">{record.pilesBeforeMove[0]}</span>
                  )}
                </td>
                <td className="p-2 border">
                  {record.pilesAfterMove.length > 1 ? (
                    <div className="flex gap-1">
                      {record.pilesAfterMove.map((pile, index) => (
                        <span
                          key={`${record.turn}-after-${index}`}
                          className="px-2 py-1 bg-gray-100 text-gray-800 rounded-md text-sm"
                        >
                          {pile}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="font-mono">{record.pilesAfterMove[0]}</span>
                  )}
                </td>
              </tr>
            ))}
            {winner !== null && (
              <tr className="bg-green-50 transition-colors duration-200">
                <td colSpan={6} className="p-2 border text-center">
                  <span className="font-bold text-green-800">
                    Player {winner} Wins!
                  </span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
