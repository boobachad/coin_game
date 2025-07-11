export type Position = "winning" | "losing"

export type Strategy = "Optimal" | "Greedy" | "Human"

// Base types that never change
export interface BaseMove {
    pileIndex: number
    coinsToTake: number
}

// Extended types for specific features
export interface MoveWithHistory extends BaseMove {
    pilesBeforeMove: number[]
    pilesAfterMove: number[]
}

export interface MoveWithPlayer extends BaseMove {
    player: number
    strategy: Strategy
    timeout: boolean
}

// Complete move record combining all features
export interface CompleteMoveRecord extends BaseMove {
    player: number
    strategy: Strategy
    timeout: boolean
    pilesBeforeMove: number[]
    pilesAfterMove: number[]
    turn: number
}

// Version control for moves
export interface VersionedMove {
    version: number
    data: BaseMove | CompleteMoveRecord
}

export interface GameState {
    piles: number[]
    currentPlayer: number
    gameOver: boolean
    winner: number | null
    moveHistory: BaseMove[]  // Always use base type for core game logic
    timeRemaining: number | null
    allowedMoves: number[]
    hasValidMoves: boolean
    lastValidMovePlayer: number | null
    lastMove: BaseMove | null
    enabledRestrictions: {
        id: string
        config: any
    }[]
    player1Strategy: Strategy
    player2Strategy: Strategy
}

export interface GameConfig {
    numPiles: number
    pileSizes: number[]
    allowedMoves: number[]
    moveTimeLimit: number
    player1Strategy: Strategy
    player2Strategy: Strategy
}

export interface GameRestriction {
    id: string
    name: string
    description: string
    initialConfig: any
    validate: (state: GameState, move: BaseMove, config: any) => boolean
    getValidMoves?: (state: GameState, config: any) => BaseMove[]
    ConfigComponent?: React.ComponentType<RestrictionConfigProps>
}

export interface StrategyTemplate {
    name: string
    description: string
    code: string
}

export interface RestrictionConfigProps {
    currentConfig: any
    onConfigChange: (newConfig: any) => void
} 