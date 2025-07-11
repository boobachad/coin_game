"use client"

import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import GameConfiguration from "../components/game/GameConfiguration"
import LiveGameBoard from "../components/game/LiveGameBoard"
import GameLog from "../components/game/GameLog"
import GameStateAnalysis from "../components/game/GameStateAnalysis"
import { type GameConfig, type GameState, type Position, computePositions, makeMove } from "../utils/gameLogic"

export default function ArenaPage() {
  const navigate = useNavigate()
  const location = useLocation()

  // Game configuration
  const [gameConfig, setGameConfig] = useState<GameConfig | null>(null)

  // Game state
  const [gameState, setGameState] = useState<GameState | null>(null)

  // Pre-computed positions
  const [positions, setPositions] = useState<Position[]>([])

  // Reset all states
  const handleReset = () => {
    setGameConfig(null)
    setGameState(null)
    setPositions([])
  }

  // Compute positions when game config changes
  useEffect(() => {
    if (gameConfig) {
      // Find the maximum pile size for pre-computation
      const maxPileSize = Math.max(...gameConfig.pileSizes, 1000)

      // Pre-compute positions
      const newPositions = computePositions(maxPileSize, gameConfig.allowedMoves)
      setPositions(newPositions)
    }
  }, [gameConfig])

  // Load config from navigation state if available
  useEffect(() => {
    if (location.state?.config) {
      handleStartGame(location.state.config)
    }
  }, [location.state])

  const handleStartGame = (config: GameConfig) => {
    setGameConfig(config)

    // Initialize game state
    setGameState({
      piles: [...config.pileSizes],
      allowedMoves: config.allowedMoves,
      currentPlayer: 1,
      gameOver: false,
      winner: null,
      moveHistory: [],
      timeRemaining: config.moveTimeLimit > 0 ? config.moveTimeLimit : null,
      hasValidMoves: true,
      lastValidMovePlayer: null,
      lastMove: null,
      enabledRestrictions: [],
      player1Strategy: config.player1Strategy,
      player2Strategy: config.player2Strategy
    })
  }

  const handleMakeMove = (pileIndex: number, move: number, timeout: boolean) => {
    if (!gameState || !gameConfig) return

    // Determine the strategy used
    const strategy = gameState.currentPlayer === 1 ? gameConfig.player1Strategy : gameConfig.player2Strategy

    // Make the move
    const newGameState = makeMove(gameState, pileIndex, move, timeout ? "Greedy" : strategy, timeout)

    setGameState(newGameState)
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1>Arena</h1>
        <div className="flex gap-4">
          <button
            onClick={handleReset}
            className="btn btn-secondary"
            disabled={!gameConfig && !gameState}
          >
            Reset All
          </button>
        </div>
      </div>

      <GameConfiguration
        onStartGame={handleStartGame}
        isSimulating={false}
      />

      {gameState && gameConfig && (
        <LiveGameBoard
          gameConfig={gameConfig}
          gameState={gameState}
          positions={positions}
          onMakeMove={handleMakeMove}
        />
      )}

      {gameState && gameState.moveHistory && gameState.moveHistory.length > 0 && (
        <GameLog
          moveHistory={gameState.moveHistory}
          winner={gameState.winner}
          gameState={gameState}
        />
      )}

      {gameConfig && positions.length > 0 && (
        <GameStateAnalysis
          positions={positions}
          maxPileSize={Math.max(...gameConfig.pileSizes)}
          allowedMoves={gameConfig.allowedMoves}
          numPiles={gameConfig.numPiles}
        />
      )}
    </div>
  )
}
