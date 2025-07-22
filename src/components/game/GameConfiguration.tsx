"use client"

import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { saveGameConfig, getSavedConfigs, loadGameConfig, deleteGameConfig } from "../../utils/gameLogic"

interface GameConfigurationProps {
  onStartGame: (config: GameConfig) => void
  isSimulating: boolean
}

export default function GameConfiguration({ onStartGame, isSimulating }: GameConfigurationProps) {
  const navigate = useNavigate()
  const location = useLocation()

  const [pileSizesStr, setPileSizesStr] = useState("21")
  const [allowedMovesStr, setAllowedMovesStr] = useState("1,3,4")
  const [moveTimeLimit, setMoveTimeLimit] = useState(0)
  const [player1Strategy, setPlayer1Strategy] = useState<"Optimal" | "Greedy" | "Human">("Optimal")
  const [player2Strategy, setPlayer2Strategy] = useState<"Optimal" | "Greedy" | "Human">("Human")
  const [configName, setConfigName] = useState("")
  const [savedConfigs, setSavedConfigs] = useState<Record<string, GameConfig>>({})
  const [validationError, setValidationError] = useState("")
  const [isAdvancedMode, setIsAdvancedMode] = useState(false)

  // Load saved configurations on mount
  useEffect(() => {
    setSavedConfigs(getSavedConfigs())
  }, [])

  // Parse URL parameters on mount
  useEffect(() => {
    const params = new URLSearchParams(location.search)

    if (params.has("sizes")) setPileSizesStr(params.get("sizes") || "21")
    if (params.has("moves")) setAllowedMovesStr(params.get("moves") || "1,3,4")
    if (params.has("player1")) setPlayer1Strategy((params.get("player1") as any) || "Optimal")
    if (params.has("player2")) setPlayer2Strategy((params.get("player2") as any) || "Human")

    // Clear URL parameters after reading them
    navigate(location.pathname, { replace: true })
  }, [location.search, navigate, location.pathname])

  const validateConfig = (): boolean => {
    // Parse pile sizes
    const pileSizes = pileSizesStr.split(",").map((size) => Number.parseInt(size.trim()))

    // Parse allowed moves
    const allowedMoves = allowedMovesStr.split(",").map((move) => Number.parseInt(move.trim()))

    // Validate pile sizes
    if (pileSizes.some(isNaN) || pileSizes.some((size) => size <= 0)) {
      setValidationError("All pile sizes must be positive numbers")
      return false
    }

    // Validate allowed moves
    if (allowedMoves.some(isNaN) || allowedMoves.some((move) => move <= 0)) {
      setValidationError("All allowed moves must be positive numbers")
      return false
    }

    // Validate time limit
    if (moveTimeLimit < 0) {
      setValidationError("Time limit must be non-negative")
      return false
    }

    setValidationError("")
    return true
  }

  const handleStartGame = () => {
    if (!validateConfig()) return

    const config: GameConfig = {
      numPiles: pileSizesStr.split(",").length,
      pileSizes: pileSizesStr.split(",").map((size) => Number.parseInt(size.trim())),
      allowedMoves: allowedMovesStr.split(",").map((move) => Number.parseInt(move.trim())),
      moveTimeLimit,
      player1Strategy,
      player2Strategy,
    }

    onStartGame(config)
  }

  const handleSaveConfig = () => {
    if (!configName.trim()) {
      setValidationError("Please enter a name for this configuration")
      return
    }

    if (!validateConfig()) return

    const config: GameConfig = {
      numPiles: pileSizesStr.split(",").length,
      pileSizes: pileSizesStr.split(",").map((size) => Number.parseInt(size.trim())),
      allowedMoves: allowedMovesStr.split(",").map((move) => Number.parseInt(move.trim())),
      moveTimeLimit,
      player1Strategy,
      player2Strategy,
    }

    saveGameConfig(configName, config)
    setSavedConfigs(getSavedConfigs())
    setConfigName("")
    setValidationError("")
  }

  const handleLoadConfig = (name: string) => {
    const config = loadGameConfig(name)
    if (!config) return

    setPileSizesStr(config.pileSizes.join(","))
    setAllowedMovesStr(config.allowedMoves.join(","))
    setMoveTimeLimit(config.moveTimeLimit)
    setPlayer1Strategy(config.player1Strategy)
    setPlayer2Strategy(config.player2Strategy)
  }

  const handleDeleteConfig = (name: string) => {
    deleteGameConfig(name)
    setSavedConfigs(getSavedConfigs())
  }

  return (
    <div className="card" style={{ backgroundColor: "var(--color-bg)" }}>
      <div className="flex justify-between items-center mb-6">
        <h2>Game Configuration</h2>
        <button
          onClick={() => setIsAdvancedMode(!isAdvancedMode)}
          style={{ color: "var(--color-accent)" }}
          className="text-sm"
        >
          {isAdvancedMode ? "Basic Mode" : "Advanced Mode"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="mb-4">
            <label htmlFor="pileSizes" className="label">
              Pile Sizes
            </label>
            <div className="flex items-center gap-2">
              <input
                id="pileSizes"
                type="text"
                className="input"
                value={pileSizesStr}
                onChange={(e) => setPileSizesStr(e.target.value)}
                placeholder="e.g., 21"
                disabled={isSimulating}
              />
              <button
                onClick={() => setPileSizesStr("21")}
                style={{ color: "var(--color-accent)" }}
                className="text-sm"
                title="Reset to default"
                disabled={isSimulating}
              >
                1ba
              </button>
            </div>
            <p className="text-sm mt-1" style={{ color: "var(--color-accent)" }}>
              Enter comma-separated numbers for pile sizes
            </p>
          </div>

          <div className="mb-4">
            <label htmlFor="allowedMoves" className="label">
              Allowed Moves
            </label>
            <div className="flex items-center gap-2">
              <input
                id="allowedMoves"
                type="text"
                className="input"
                value={allowedMovesStr}
                onChange={(e) => setAllowedMovesStr(e.target.value)}
                placeholder="e.g., 1,3,4"
                disabled={isSimulating}
              />
              <button
                onClick={() => setAllowedMovesStr("1,3,4")}
                style={{ color: "var(--color-accent)" }}
                className="text-sm"
                title="Reset to default"
                disabled={isSimulating}
              >
                1ba
              </button>
            </div>
            <p className="text-sm mt-1" style={{ color: "var(--color-accent)" }}>
              Enter comma-separated numbers for valid moves
            </p>
          </div>

          {isAdvancedMode && (
            <div className="mb-4">
              <label htmlFor="moveTimeLimit" className="label">
                Move Time Limit (seconds)
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="moveTimeLimit"
                  type="number"
                  min="0"
                  className="input"
                  value={moveTimeLimit}
                  onChange={(e) => setMoveTimeLimit(Math.max(0, Number.parseInt(e.target.value) || 0))}
                  disabled={isSimulating}
                />
                <button
                  onClick={() => setMoveTimeLimit(0)}
                  style={{ color: "var(--color-accent)" }}
                  className="text-sm"
                  title="Reset to default"
                  disabled={isSimulating}
                >
                  1ba
                </button>
              </div>
              <p className="text-sm mt-1" style={{ color: "var(--color-accent)" }}>
                0 = no time limit
              </p>
            </div>
          )}
        </div>

        <div>
          <div className="mb-4">
            <label htmlFor="player1Strategy" className="label">
              Player 1 Strategy
            </label>
            <select
              id="player1Strategy"
              className="input"
              value={player1Strategy}
              onChange={(e) => setPlayer1Strategy(e.target.value as any)}
              disabled={isSimulating}
            >
              <option value="Optimal">Optimal</option>
              <option value="Greedy">Greedy</option>
              <option value="Human">Human</option>
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="player2Strategy" className="label">
              Player 2 Strategy
            </label>
            <select
              id="player2Strategy"
              className="input"
              value={player2Strategy}
              onChange={(e) => setPlayer2Strategy(e.target.value as any)}
              disabled={isSimulating}
            >
              <option value="Optimal">Optimal</option>
              <option value="Greedy">Greedy</option>
              <option value="Human">Human</option>
            </select>
          </div>
        </div>
      </div>

      {validationError && (
        <div className="text-red-600 mb-4">{validationError}</div>
      )}

      <div className="flex gap-4">
        <button
          onClick={handleStartGame}
          className="btn btn-primary"
          style={{ backgroundColor: "var(--color-accent)", color: "white" }}
          disabled={isSimulating}
        >
          Start Game
        </button>
      </div>

      {/* Saved Configurations */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--color-accent)" }}>Saved Configurations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(savedConfigs).map(([name, config]) => (
            <div key={name} className="card p-4">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium">{name}</h4>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleLoadConfig(name)}
                    style={{ color: "var(--color-accent)" }}
                    className="text-sm"
                    disabled={isSimulating}
                  >
                    Load
                  </button>
                  <button
                    onClick={() => handleDeleteConfig(name)}
                    style={{ color: "var(--color-accent)" }}
                    className="text-sm"
                    disabled={isSimulating}
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                <p>Piles: {config.pileSizes.join(", ")}</p>
                <p>Moves: {config.allowedMoves.join(", ")}</p>
                <p>Player 1: {config.player1Strategy}</p>
                <p>Player 2: {config.player2Strategy}</p>
                {config.moveTimeLimit > 0 && (
                  <p>Time Limit: {config.moveTimeLimit}s</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Save Current Configuration */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Save Current Configuration</h3>
        <div className="flex gap-4">
          <input
            type="text"
            className="input flex-1"
            value={configName}
            onChange={(e) => setConfigName(e.target.value)}
            placeholder="Enter configuration name"
            disabled={isSimulating}
          />
          <button
            onClick={handleSaveConfig}
            className="btn btn-secondary"
            disabled={isSimulating}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
