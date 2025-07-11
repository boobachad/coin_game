"use client"

import { useState, useEffect, useRef } from "react"
import { type GameConfig, type GameState, type Position, getStrategyMove, getGreedyMove } from "../../utils/gameLogic"

interface LiveGameBoardProps {
  gameConfig: GameConfig
  gameState: GameState
  positions: Position[]
  onMakeMove: (pileIndex: number, move: number, timeout: boolean) => void
}

export default function LiveGameBoard({ gameConfig, gameState, positions, onMakeMove }: LiveGameBoardProps) {
  const [selectedPileIndex, setSelectedPileIndex] = useState(0)
  const [moveAmount, setMoveAmount] = useState("")
  const [error, setError] = useState("")
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [helpMode, setHelpMode] = useState(false)

  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Set up timer if there's a time limit and current player is human
  useEffect(() => {
    const currentStrategy = gameState.currentPlayer === 1 ? gameConfig.player1Strategy : gameConfig.player2Strategy

    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    // Only set timer for human players with a time limit
    if (currentStrategy === "Human" && gameConfig.moveTimeLimit > 0 && !gameState.gameOver) {
      setTimeLeft(gameConfig.moveTimeLimit)

      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev === null || prev <= 0) {
            // Time's up - make a greedy move
            if (timerRef.current) {
              clearInterval(timerRef.current)
              timerRef.current = null
            }

            // For multi-pile games, find the largest pile
            if (gameConfig.numPiles > 1) {
              const largestPileIndex = gameState.piles.indexOf(Math.max(...gameState.piles))
              const move = getGreedyMove(gameState.piles[largestPileIndex], gameConfig.allowedMoves)
              if (move !== null) {
                onMakeMove(largestPileIndex, move, true)
              }
            } else {
              // For single-pile games
              const move = getGreedyMove(gameState.piles[0], gameConfig.allowedMoves)
              if (move !== null) {
                onMakeMove(0, move, true)
              }
            }
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [gameState.currentPlayer, gameConfig, gameState.gameOver, gameState.piles, onMakeMove])

  const handleMakeMove = () => {
    // Validate move
    const move = Number.parseInt(moveAmount)

    if (isNaN(move)) {
      setError("Please enter a valid number")
      return
    }

    if (!gameConfig.allowedMoves.includes(move)) {
      setError(`Move must be one of: ${gameConfig.allowedMoves.join(", ")}`)
      return
    }

    if (move > gameState.piles[selectedPileIndex]) {
      setError(`Cannot remove ${move} coins from a pile with ${gameState.piles[selectedPileIndex]} coins`)
      return
    }

    // Make the move
    onMakeMove(selectedPileIndex, move, false)
    setMoveAmount("")
    setError("")
  }

  // Handle Algo moves
  useEffect(() => {
    const currentStrategy = gameState.currentPlayer === 1 ? gameConfig.player1Strategy : gameConfig.player2Strategy

    // Only make Algo moves if it's not a human player and game is not over
    if (currentStrategy !== "Human" && !gameState.gameOver) {
      // Small delay for better UX
      const timeoutId = setTimeout(() => {
        if (gameConfig.numPiles === 1) {
          // Single pile game
          const move = getStrategyMove(currentStrategy, gameState.piles, 0, gameConfig.allowedMoves, positions)

          if (move !== null) {
            onMakeMove(0, move, false)
          }
        } else {
          // Multi-pile game - find the best pile to move from
          let bestPileIndex = 0
          let bestMove = 0

          // Try each pile
          for (let i = 0; i < gameState.piles.length; i++) {
            if (gameState.piles[i] === 0) continue

            const move = getStrategyMove(currentStrategy, gameState.piles, i, gameConfig.allowedMoves, positions)

            if (move !== null) {
              // For Greedy, prefer the largest move
              if (currentStrategy === "Greedy" && move > bestMove) {
                bestMove = move
                bestPileIndex = i
              }
              // For Optimal, take the first valid move (simplified)
              else if (currentStrategy === "Optimal" && bestMove === 0) {
                bestMove = move
                bestPileIndex = i
              }
            }
          }

          if (bestMove > 0) {
            onMakeMove(bestPileIndex, bestMove, false)
          }
        }
      }, 1000)

      return () => clearTimeout(timeoutId)
    }
  }, [gameState, gameConfig, positions, onMakeMove])

  // Determine if current player is human
  const isCurrentPlayerHuman =
    gameState.currentPlayer === 1 ? gameConfig.player1Strategy === "Human" : gameConfig.player2Strategy === "Human"

  return (
    <div className="card mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2>Live Game</h2>
        <button
          onClick={() => setHelpMode(!helpMode)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {helpMode ? "Disable Help" : "Enable Help"}
        </button>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div
            className={`text-lg font-medium ${gameState.currentPlayer === 1 ? "text-blue-600" : "text-gray-600"}`}
          >
            Player 1 ({gameConfig.player1Strategy})
          </div>
          <div className="text-lg">vs</div>
          <div
            className={`text-lg font-medium ${gameState.currentPlayer === 2 ? "text-blue-600" : "text-gray-600"}`}
          >
            Player 2 ({gameConfig.player2Strategy})
          </div>
        </div>

        <div className="bg-gray-100 p-4 rounded-md mb-4">
          <h3 className="text-lg font-medium mb-2">Current Piles</h3>
          <div className="flex flex-wrap gap-4">
            {gameState.piles.map((size, index) => {
              const isWinning = helpMode ? positions[size] === "winning" : false
              const winningMoves = helpMode && isWinning
                ? gameConfig.allowedMoves.filter(move => size - move >= 0 && positions[size - move] === "losing")
                : []

              return (
                <div
                  key={index}
                  className={`p-3 rounded-md transition-all duration-200 ${selectedPileIndex === index && isCurrentPlayerHuman
                    ? "bg-blue-50 border-2 border-blue-500"
                    : "bg-white border border-gray-300"
                    }`}
                  onClick={() => isCurrentPlayerHuman && setSelectedPileIndex(index)}
                >
                  <div className="flex justify-between items-center mb-1">
                    <div className="text-sm text-gray-600">Pile {index + 1}</div>
                    {helpMode && isCurrentPlayerHuman && winningMoves.length > 0 && (
                      <div className="text-xs text-green-600">
                        {winningMoves.length} winning move{winningMoves.length > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                  <div className="text-2xl font-bold">{size}</div>
                  {helpMode && isCurrentPlayerHuman && winningMoves.length > 0 && (
                    <div className="mt-2 text-xs text-gray-500">
                      Suggested: {winningMoves[0]}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {!gameState.gameOver ? (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="text-lg font-medium">
                Current Turn: Player {gameState.currentPlayer} (
                {gameState.currentPlayer === 1 ? gameConfig.player1Strategy : gameConfig.player2Strategy})
              </div>
              {timeLeft !== null && (
                <div className="flex items-center gap-2">
                  <div className="text-sm text-gray-600">Time Left:</div>
                  <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-md font-mono text-lg">
                    {timeLeft}s
                  </div>
                </div>
              )}
            </div>

            {isCurrentPlayerHuman && (
              <div className="bg-blue-50 p-4 rounded-md">
                <h4 className="font-medium mb-2">Make Your Move</h4>

                <div className="flex gap-3">
                  <div className="grow">
                    <label className="label">Coins to Remove</label>
                    <div className="relative">
                      <input
                        type="number"
                        className={`input ${error ? "border-red-500 focus:ring-red-500" : ""}`}
                        value={moveAmount}
                        onChange={(e) => setMoveAmount(e.target.value)}
                        min="1"
                        max={gameState.piles[selectedPileIndex]}
                      />
                      {helpMode && positions[gameState.piles[selectedPileIndex]] === "winning" && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-green-600">
                          Winning position
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-end">
                    <button
                      className="btn btn-primary"
                      onClick={handleMakeMove}
                    >
                      Make Move
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="text-red-600 mt-2">
                    {error}
                  </div>
                )}

                <div className="mt-3">
                  <div className="text-sm text-gray-600 mb-1">
                    Allowed moves: {gameConfig.allowedMoves.join(", ")}
                  </div>
                  {helpMode && positions[gameState.piles[selectedPileIndex]] === "winning" && (
                    <div className="text-sm text-green-600">
                      This is a winning position. Try to force your opponent into a losing position.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-green-100 p-4 rounded-md text-center">
            <h3 className="text-xl font-bold text-green-800">Game Over! Player {gameState.winner} Wins!</h3>
            <p className="mt-2 text-green-700">
              ({gameState.winner === 1 ? gameConfig.player1Strategy : gameConfig.player2Strategy} strategy)
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
