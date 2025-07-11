import { GameState, BaseMove, CompleteMoveRecord } from '../types/game'

export interface FeatureFlags {
    useEnhancedMoveHistory: boolean
    useRestrictions: boolean
    usePlayerTracking: boolean
}

export const FEATURES: FeatureFlags = {
    useEnhancedMoveHistory: true,
    useRestrictions: true,
    usePlayerTracking: true
}

export function isFeatureEnabled(feature: keyof FeatureFlags): boolean {
    return FEATURES[feature]
}

export function calculatePilesAfter(move: BaseMove, currentPiles: number[]): number[] {
    const newPiles = [...currentPiles]
    newPiles[move.pileIndex] = Math.max(0, newPiles[move.pileIndex] - move.coinsToTake)
    return newPiles
}

export function toDisplayFormat(move: BaseMove, state: GameState, moveIndex: number): CompleteMoveRecord {
    // Calculate the player who made this move
    const movePlayer = moveIndex % 2 === 0 ? 1 : 2

    // Get the strategy for this move's player
    const moveStrategy = movePlayer === 1 ? state.player1Strategy : state.player2Strategy

    // Calculate the state at the time of this move
    let pilesBefore = [...state.piles]
    if (moveIndex > 0) {
        // Replay moves up to this point to get the correct state
        for (let i = 0; i < moveIndex; i++) {
            const prevMove = state.moveHistory[i]
            pilesBefore = calculatePilesAfter(prevMove, pilesBefore)
        }
    }

    // Calculate the state after this move
    const pilesAfter = calculatePilesAfter(move, pilesBefore)

    return {
        ...move,
        player: movePlayer,
        strategy: moveStrategy,
        timeout: false,
        pilesBeforeMove: pilesBefore,
        pilesAfterMove: pilesAfter,
        turn: moveIndex + 1
    }
}

export function toRestrictionFormat(move: BaseMove): BaseMove {
    return {
        pileIndex: move.pileIndex,
        coinsToTake: move.coinsToTake
    }
} 