import { GameRestriction, GameState, Move } from '../types/game'

export const ALL_GAME_RESTRICTIONS: GameRestriction[] = [
    {
        id: 'noConsecutivePiles',
        name: 'No Consecutive Pile Picks',
        description: 'Cannot pick from the same pile twice in a row',
        initialConfig: {},
        validate: (state: GameState, move: Move) => {
            if (!state.lastMove) return true
            return state.lastMove.pileIndex !== move.pileIndex
        },
        getValidMoves: (state: GameState) => {
            const validMoves: Move[] = []
            for (let pileIndex = 0; pileIndex < state.piles.length; pileIndex++) {
                if (state.lastMove && state.lastMove.pileIndex === pileIndex) continue
                for (const coinsToTake of state.allowedMoves) {
                    if (coinsToTake <= state.piles[pileIndex]) {
                        validMoves.push({ pileIndex, coinsToTake })
                    }
                }
            }
            return validMoves
        }
    },
    {
        id: 'maxCoinsInRow',
        name: 'Maximum Coins in Row',
        description: 'Cannot take more than X coins in a row',
        initialConfig: { maxCoins: 3 },
        validate: (state: GameState, move: Move, config: { maxCoins: number }) => {
            if (!state.lastMove) return true
            if (state.lastMove.player !== state.currentPlayer) return true
            return move.coinsToTake <= config.maxCoins
        }
    },
    {
        id: 'alternateEvenOdd',
        name: 'Alternate Even/Odd',
        description: 'Must alternate between even and odd number of coins',
        initialConfig: {},
        validate: (state: GameState, move: Move) => {
            if (!state.lastMove) return true
            const lastMoveWasEven = state.lastMove.coinsToTake % 2 === 0
            const currentMoveIsEven = move.coinsToTake % 2 === 0
            return lastMoveWasEven !== currentMoveIsEven
        }
    }
] 