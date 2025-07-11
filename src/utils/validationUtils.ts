import { GameState, Move, GameRestriction } from '../types/game'

export function validateMove(
    state: GameState,
    move: Move,
    allRestrictions: GameRestriction[],
    enabledRestrictions: { [id: string]: any }
): { isValid: boolean; error?: string } {
    // Basic move validation
    if (move.pileIndex < 0 || move.pileIndex >= state.piles.length) {
        return { isValid: false, error: 'Invalid pile index' }
    }

    if (move.coinsToTake <= 0) {
        return { isValid: false, error: 'Must take at least one coin' }
    }

    if (move.coinsToTake > state.piles[move.pileIndex]) {
        return { isValid: false, error: 'Cannot take more coins than available in pile' }
    }

    if (!state.allowedMoves.includes(move.coinsToTake)) {
        return { isValid: false, error: 'Invalid number of coins to take' }
    }

    // Check enabled restrictions
    for (const restriction of allRestrictions) {
        if (enabledRestrictions[restriction.id]) {
            const isValid = restriction.validate(state, move, enabledRestrictions[restriction.id])
            if (!isValid) {
                return {
                    isValid: false,
                    error: `Move violates restriction: ${restriction.name}`
                }
            }
        }
    }

    return { isValid: true }
}

export function getValidMoves(
    state: GameState,
    allRestrictions: GameRestriction[],
    enabledRestrictions: { [id: string]: any }
): Move[] {
    const validMoves: Move[] = []

    for (let pileIndex = 0; pileIndex < state.piles.length; pileIndex++) {
        for (const coinsToTake of state.allowedMoves) {
            if (coinsToTake <= state.piles[pileIndex]) {
                const move = { pileIndex, coinsToTake }
                const validation = validateMove(state, move, allRestrictions, enabledRestrictions)
                if (validation.isValid) {
                    validMoves.push(move)
                }
            }
        }
    }

    return validMoves
} 