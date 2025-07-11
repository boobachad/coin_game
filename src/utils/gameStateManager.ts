import { GameState, BaseMove, GameConfig, Strategy } from '../types/game'
import { validateMove } from './validationUtils'
import { isFeatureEnabled, calculatePilesAfter } from './featureManager'

export function initializeGameState(config: GameConfig): GameState {
    return {
        piles: [...config.pileSizes],
        currentPlayer: 1,
        gameOver: false,
        winner: null,
        moveHistory: [],
        timeRemaining: config.moveTimeLimit > 0 ? config.moveTimeLimit : null,
        allowedMoves: config.allowedMoves,
        hasValidMoves: true,
        lastValidMovePlayer: null,
        lastMove: null,
        enabledRestrictions: [],
        player1Strategy: config.player1Strategy,
        player2Strategy: config.player2Strategy
    }
}

export function hasValidMoves(state: GameState, player: number): boolean {
    // If all piles are empty, no valid moves
    if (state.piles.every(pile => pile === 0)) {
        return false
    }

    // Check each pile for valid moves
    for (let i = 0; i < state.piles.length; i++) {
        // Skip if this pile was used in the last move (consecutive pile restriction)
        if (state.lastMove && state.lastMove.pileIndex === i) {
            continue;
        }

        // Check if any allowed move is valid for this pile
        for (const move of state.allowedMoves) {
            if (state.piles[i] >= move) {
                // Verify this move doesn't leave the opponent with no valid moves
                const newPiles = [...state.piles]
                newPiles[i] = Math.max(0, newPiles[i] - move)

                // If this move would leave the opponent with no valid moves, it's not a valid move
                const opponentHasValidMoves = hasValidMovesForOpponent(newPiles, state.allowedMoves, i)
                if (opponentHasValidMoves) {
                    return true
                }
            }
        }
    }
    return false
}

// Helper function to check if opponent has valid moves after a potential move
function hasValidMovesForOpponent(piles: number[], allowedMoves: number[], lastPileIndex: number): boolean {
    // If all piles are empty, no valid moves
    if (piles.every(pile => pile === 0)) {
        return false
    }

    // Check each pile for valid moves
    for (let i = 0; i < piles.length; i++) {
        // Skip if this pile was used in the last move
        if (i === lastPileIndex) {
            continue;
        }

        // Check if any allowed move is valid for this pile
        for (const move of allowedMoves) {
            if (piles[i] >= move) {
                return true
            }
        }
    }
    return false
}

// Core move logic that never changes
function makeBaseMove(state: GameState, move: BaseMove): GameState {
    const newPiles = calculatePilesAfter(move, state.piles)
    const nextPlayer = state.currentPlayer === 1 ? 2 : 1

    return {
        ...state,
        piles: newPiles,
        currentPlayer: nextPlayer,
        moveHistory: [...state.moveHistory, move],
        lastMove: move
    }
}

// Feature-enhanced move logic
export function makeMove(
    state: GameState,
    move: BaseMove,
    strategy: Strategy,
    timeout: boolean = false
): GameState {
    // Start with base move
    let newState = makeBaseMove(state, move)

    // Check if next player has valid moves
    const nextPlayerHasValidMoves = hasValidMoves(newState, newState.currentPlayer)

    // Update game state with feature-specific logic
    newState = {
        ...newState,
        gameOver: !nextPlayerHasValidMoves,
        winner: !nextPlayerHasValidMoves ? state.currentPlayer : null,
        timeRemaining: null,
        hasValidMoves: nextPlayerHasValidMoves,
        lastValidMovePlayer: state.currentPlayer,
        player1Strategy: state.player1Strategy,
        player2Strategy: state.player2Strategy,
        enabledRestrictions: state.enabledRestrictions
    }

    return newState
}

export function resetGameState(config: GameConfig): GameState {
    return initializeGameState(config)
} 