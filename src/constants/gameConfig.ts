import { StrategyTemplate } from '../types/game'

export interface MoveRecord {
    player: 1 | 2;
    pileIndex: number;
    coinsTaken: number;
    pilesBeforeMove: number[];
    pilesAfterMove: number[];
}

export interface GameState {
    piles: number[];
    allowedMoves: number[];
    currentPlayer: 1 | 2;
    gameOver: boolean;
    winner: number | null;
    moveHistory: MoveRecord[];
    timeRemaining: number | null;
    hasValidMoves: boolean;
    lastValidMovePlayer: number | null;
}

export const INITIAL_GAME_STATE: GameState = {
    piles: [21, 102, 69, 99],
    allowedMoves: [1, 2, 3, 4, 5],
    currentPlayer: 1,
    gameOver: false,
    winner: null,
    moveHistory: [],
    timeRemaining: null,
    hasValidMoves: true,
    lastValidMovePlayer: null
};

export const STRATEGY_TEMPLATES: Record<string, StrategyTemplate> = {
    initialTemplate: {
        name: "Default Template",
        description: "A basic template for a new coin game strategy.",
        code: `
function myStrategy(state) {
    // Available State Properties:
    // state.piles - array of current pile sizes
    // state.allowedMoves - array of allowed move sizes
    // state.currentPlayer - current player (1 or 2)
    // state.lastMove - last move made { pileIndex, coinsToTake, player }
    // state.enabledRestrictions - list of active restrictions
    // state.moveHistory - array of previous moves

    // Common Patterns:
    // 1. Check last move to avoid consecutive picks
    // 2. Consider move history for pattern-based restrictions
    // 3. Use state.enabledRestrictions to adapt strategy

    // Example: Handling consecutive pile restriction
    // if (state.lastMove && state.lastMove.pileIndex === currentPileIndex) {
    //     // Skip this pile, try another
    // }

    const minCoins = Math.min(...state.allowedMoves);

    for (let i = 0; i < state.piles.length; i++) {
        // Skip if this pile was used in the last move (consecutive pile restriction)
        if (state.lastMove && state.lastMove.pileIndex === i) {
            continue;
        }
        
        if (state.piles[i] >= minCoins) {
            return { pileIndex: i, coinsToTake: minCoins };
        }
    }

    return null;
}`
    },
    alwaysTakeMinimum: {
        name: "Always Take Minimum",
        description: "Always takes the minimum allowed number of coins from the first available pile.",
        code: `
function myStrategy(state) {
    // Available State Properties:
    // state.piles - array of current pile sizes
    // state.allowedMoves - array of allowed move sizes
    // state.currentPlayer - current player (1 or 2)
    // state.lastMove - last move made { pileIndex, coinsToTake, player }
    // state.enabledRestrictions - list of active restrictions
    // state.moveHistory - array of previous moves

    // This strategy always takes the minimum allowed coins
    // It will be automatically validated against game restrictions
    
    const min = Math.min(...state.allowedMoves);

    for (let i = 0; i < state.piles.length; i++) {
        // Skip if this pile was used in the last move (consecutive pile restriction)
        if (state.lastMove && state.lastMove.pileIndex === i) {
            continue;
        }

        if (state.piles[i] >= min) {
            return { pileIndex: i, coinsToTake: min };
        }
    }
    return null;
}`
    },
    greedy: {
        name: "Greedy",
        description: "Takes the maximum allowed number of coins from the first available pile.",
        code: `
function myStrategy(state) {
    // Available State Properties:
    // state.piles - array of current pile sizes
    // state.allowedMoves - array of allowed move sizes
    // state.currentPlayer - current player (1 or 2)
    // state.lastMove - last move made { pileIndex, coinsToTake, player }
    // state.enabledRestrictions - list of active restrictions
    // state.moveHistory - array of previous moves

    // This strategy always takes the maximum allowed coins
    // It will be automatically validated against game restrictions
    
    const sortedMoves = [...state.allowedMoves].sort((a, b) => b - a);

    for (let i = 0; i < state.piles.length; i++) {
        // Skip if this pile was used in the last move (consecutive pile restriction)
        if (state.lastMove && state.lastMove.pileIndex === i) {
            continue;
        }

        for (const move of sortedMoves) {
            if (state.piles[i] >= move) {
                return { pileIndex: i, coinsToTake: move };
            }
        }
    }
    return null;
}`
    },
    optimal: {
        name: "Optimal Nim",
        description: "Uses the optimal Nim strategy, calculating XOR of pile sizes.",
        code: `
function myStrategy(state) {
    // Available State Properties:
    // state.piles - array of current pile sizes
    // state.allowedMoves - array of allowed move sizes
    // state.currentPlayer - current player (1 or 2)
    // state.lastMove - last move made { pileIndex, coinsToTake, player }
    // state.enabledRestrictions - list of active restrictions
    // state.moveHistory - array of previous moves

    // This strategy uses the optimal Nim strategy
    // It will be automatically validated against game restrictions
    
    const xorSum = state.piles.reduce((a, b) => a ^ b, 0);

    if (xorSum !== 0) {
        for (let i = 0; i < state.piles.length; i++) {
            // Skip if this pile was used in the last move (consecutive pile restriction)
            if (state.lastMove && state.lastMove.pileIndex === i) {
                continue;
            }

            for (const move of state.allowedMoves) {
                if (state.piles[i] >= move) {
                    const newPile = state.piles[i] - move;
                    const newXor = xorSum ^ state.piles[i] ^ newPile;
                    if (newXor === 0) {
                        return { pileIndex: i, coinsToTake: move };
                    }
                }
            }
        }
    }

    // If no winning move found or XOR sum is zero, take minimum from any valid pile
    const minCoins = Math.min(...state.allowedMoves);
    for (let i = 0; i < state.piles.length; i++) {
        // Skip if this pile was used in the last move (consecutive pile restriction)
        if (state.lastMove && state.lastMove.pileIndex === i) {
            continue;
        }

        if (state.piles[i] >= minCoins) {
            return { pileIndex: i, coinsToTake: minCoins };
        }
    }

    return null;
}`
    },
    defensive: {
        name: "Defensive",
        description: "Tries to maintain equal pile sizes when possible.",
        code: `
function myStrategy(state) {
    // Available State Properties:
    // state.piles - array of current pile sizes
    // state.allowedMoves - array of allowed move sizes
    // state.currentPlayer - current player (1 or 2)
    // state.lastMove - last move made { pileIndex, coinsToTake, player }
    // state.enabledRestrictions - list of active restrictions
    // state.moveHistory - array of previous moves

    // This strategy tries to maintain equal pile sizes
    // It will be automatically validated against game restrictions
    
    const avg = state.piles.reduce((a, b) => a + b, 0) / state.piles.length;

    for (let i = 0; i < state.piles.length; i++) {
        // Skip if this pile was used in the last move (consecutive pile restriction)
        if (state.lastMove && state.lastMove.pileIndex === i) {
            continue;
        }

        for (const move of state.allowedMoves) {
            if (state.piles[i] >= move) {
                const newPile = state.piles[i] - move;
                const newAvg = (state.piles.reduce((sum, p, idx) => sum + (idx === i ? newPile : p), 0)) / state.piles.length;
                if (Math.abs(newAvg - avg) < 2) {
                    return { pileIndex: i, coinsToTake: move };
                }
            }
        }
    }

    // If no equalizing move found, take minimum from largest pile
    const largestPileIndex = state.piles.indexOf(Math.max(...state.piles));
    const minCoins = Math.min(...state.allowedMoves);
    
    // Skip if largest pile was used in last move
    if (!(state.lastMove && state.lastMove.pileIndex === largestPileIndex) && 
        state.piles[largestPileIndex] >= minCoins) {
        return { pileIndex: largestPileIndex, coinsToTake: minCoins };
    }

    // If largest pile was used last, try second largest
    const secondLargestPileIndex = state.piles.indexOf(
        Math.max(...state.piles.filter((_, idx) => idx !== largestPileIndex))
    );
    if (state.piles[secondLargestPileIndex] >= minCoins) {
        return { pileIndex: secondLargestPileIndex, coinsToTake: minCoins };
    }

    return null;
}`
    }
};
