import { GameState, Move, Strategy, Position, GameConfig } from '../types/game'
import { validateMove } from './validationUtils'
import { makeMove as makeGameMove, hasValidMoves } from './gameStateManager'

// Pre-compute winning/losing positions for single-pile games
export function computePositions(maxPileSize: number, allowedMoves: number[]): Position[] {
  const positions: Position[] = new Array(maxPileSize + 1).fill("losing")
  positions[0] = "losing" // Empty pile is a losing position

  for (let pile = 1; pile <= maxPileSize; pile++) {
    for (const move of allowedMoves) {
      if (pile - move >= 0 && positions[pile - move] === "losing") {
        positions[pile] = "winning"
        break
      }
    }
  }

  return positions
}

// Get optimal move for a single pile
export function getOptimalMove(pileSize: number, allowedMoves: number[], positions: Position[]): number | null {
  // Sort allowed moves to prefer smaller moves when multiple winning moves exist
  const sortedMoves = [...allowedMoves].sort((a, b) => a - b)

  // Try to find a move that leads to a losing position
  for (const move of sortedMoves) {
    if (pileSize - move >= 0 && positions[pileSize - move] === "losing") {
      return move
    }
  }

  // If no winning move, take the smallest valid move
  for (const move of sortedMoves) {
    if (pileSize - move >= 0) {
      return move
    }
  }

  return null // No valid move
}

// Get greedy move (largest valid move)
export function getGreedyMove(pileSize: number, allowedMoves: number[]): number | null {
  const validMoves = allowedMoves.filter((move) => move <= pileSize)
  if (validMoves.length === 0) return null

  return Math.max(...validMoves)
}

// Simplified optimal strategy for multi-pile games
export function getSimplifiedOptimalMove(
  piles: number[],
  allowedMoves: number[],
  positions: Position[],
): { pileIndex: number; move: number } | null {
  // Check each pile for a winning move
  for (let i = 0; i < piles.length; i++) {
    const pileSize = piles[i]
    const move = getOptimalMove(pileSize, allowedMoves, positions)

    if (move !== null) {
      return { pileIndex: i, move }
    }
  }

  // If no winning move found, use greedy on the largest pile
  const largestPileIndex = piles.indexOf(Math.max(...piles))
  const move = getGreedyMove(piles[largestPileIndex], allowedMoves)

  if (move !== null) {
    return { pileIndex: largestPileIndex, move }
  }

  return null // No valid move
}

// Check if the game is over
export function isGameOver(piles: number[]): boolean {
  return piles.every((pile) => pile === 0)
}

// Get a move based on the strategy
export function getStrategyMove(
  strategy: Strategy,
  piles: number[],
  pileIndex: number,
  allowedMoves: number[],
  positions: Position[],
): number | null {
  const pileSize = piles[pileIndex]

  switch (strategy) {
    case "Optimal":
      return getOptimalMove(pileSize, allowedMoves, positions)
    case "Greedy":
      return getGreedyMove(pileSize, allowedMoves)
    default:
      return null // Human strategy requires manual input
  }
}

// Save game configuration to localStorage
export function saveGameConfig(name: string, config: GameConfig): void {
  const savedConfigs = getSavedConfigs()
  savedConfigs[name] = config
  localStorage.setItem("coinGameConfigs", JSON.stringify(savedConfigs))
}

// Get all saved game configurations
export function getSavedConfigs(): Record<string, GameConfig> {
  const savedConfigsStr = localStorage.getItem("coinGameConfigs")
  return savedConfigsStr ? JSON.parse(savedConfigsStr) : {}
}

// Load a specific game configuration
export function loadGameConfig(name: string): GameConfig | null {
  const savedConfigs = getSavedConfigs()
  return savedConfigs[name] || null
}

// Delete a saved game configuration
export function deleteGameConfig(name: string): void {
  const savedConfigs = getSavedConfigs()
  delete savedConfigs[name]
  localStorage.setItem("coinGameConfigs", JSON.stringify(savedConfigs))
}

// Wrapper function to handle the different parameter format
export function makeMove(
  state: GameState,
  pileIndex: number,
  coinsToTake: number,
  strategy: Strategy,
  timeout: boolean = false
): GameState {
  return makeGameMove(state, { pileIndex, coinsToTake }, strategy, timeout)
}

// Re-export hasValidMoves from gameStateManager
export { hasValidMoves }
