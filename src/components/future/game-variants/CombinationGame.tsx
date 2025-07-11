"use client"

import { useState, useEffect } from "react"
import DangerousNumbersStats from "./DangerousNumbersStats"

interface GameState {
    totalCoins: number
    currentPlayer: 1 | 2
    gameOver: boolean
    winner: 1 | 2 | null
    moveHistory: Array<{
        player: 1 | 2
        coinsTaken: number
        remainingCoins: number
        ruleTriggered?: string
    }>
}

interface GameRules {
    dangerousNumber: number
    isPrimeEnabled: boolean
    isFibonacciEnabled: boolean
    isPerfectSquareEnabled: boolean
}

// Utility functions
const isPrime = (num: number): boolean => {
    if (num <= 1) return false
    if (num <= 3) return true
    if (num % 2 === 0 || num % 3 === 0) return false

    for (let i = 5; i * i <= num; i += 6) {
        if (num % i === 0 || num % (i + 2) === 0) return false
    }
    return true
}

const isFibonacci = (num: number): boolean => {
    if (num <= 0) return false
    if (num === 1) return true

    let a = 1, b = 1
    while (b < num) {
        const temp = a + b
        a = b
        b = temp
    }
    return b === num
}

const isPerfectSquare = (num: number): boolean => {
    const sqrt = Math.sqrt(num)
    return sqrt === Math.floor(sqrt)
}

export default function CombinationGame() {
    const [gameState, setGameState] = useState<GameState>({
        totalCoins: 21,
        currentPlayer: 1,
        gameOver: false,
        winner: null,
        moveHistory: []
    })
    const [allowedMoves, setAllowedMoves] = useState([1, 2, 3, 4])
    const [isConfiguring, setIsConfiguring] = useState(true)
    const [showStats, setShowStats] = useState(true)
    const [rules, setRules] = useState<GameRules>({
        dangerousNumber: 5,
        isPrimeEnabled: true,
        isFibonacciEnabled: true,
        isPerfectSquareEnabled: true
    })

    const checkLosingCondition = (num: number): { isLosing: boolean; rule?: string } => {
        if (num % rules.dangerousNumber === 0) {
            return { isLosing: true, rule: `Multiple of ${rules.dangerousNumber}` }
        }
        if (rules.isPrimeEnabled && isPrime(num)) {
            return { isLosing: true, rule: "Prime Number" }
        }
        if (rules.isFibonacciEnabled && isFibonacci(num)) {
            return { isLosing: true, rule: "Fibonacci Number" }
        }
        if (rules.isPerfectSquareEnabled && isPerfectSquare(num)) {
            return { isLosing: true, rule: "Perfect Square" }
        }
        return { isLosing: false }
    }

    const handleStartGame = () => {
        setGameState({
            totalCoins: 21,
            currentPlayer: 1,
            gameOver: false,
            winner: null,
            moveHistory: []
        })
        setIsConfiguring(false)
    }

    const handleMakeMove = (coinsTaken: number) => {
        if (gameState.gameOver) return

        const newTotalCoins = gameState.totalCoins - coinsTaken
        const { isLosing, rule } = checkLosingCondition(newTotalCoins)

        const newGameState: GameState = {
            totalCoins: newTotalCoins,
            currentPlayer: gameState.currentPlayer === 1 ? 2 : 1,
            gameOver: isLosing,
            winner: isLosing ? (gameState.currentPlayer === 1 ? 2 : 1) : null,
            moveHistory: [
                ...gameState.moveHistory,
                {
                    player: gameState.currentPlayer,
                    coinsTaken,
                    remainingCoins: newTotalCoins,
                    ruleTriggered: rule
                }
            ]
        }

        setGameState(newGameState)
    }

    const handleReset = () => {
        setIsConfiguring(true)
    }

    return (
        <div className="space-y-6">
            <div className="card">
                {isConfiguring ? (
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Combination Game</h2>
                        <p className="text-gray-600 mb-4">
                            In this variant, players lose if they leave a number that matches any of the enabled rules.
                            Choose which rules to enable and configure the game!
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="label">Dangerous Number</label>
                                <input
                                    type="number"
                                    min="2"
                                    max="10"
                                    value={rules.dangerousNumber}
                                    onChange={(e) => setRules({
                                        ...rules,
                                        dangerousNumber: Math.max(2, Math.min(10, Number(e.target.value)))
                                    })}
                                    className="input"
                                />
                                <p className="text-sm text-gray-600 mt-1">
                                    Player loses if they leave a multiple of this number
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label className="label">Enable Rules</label>
                                <div className="space-y-2">
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            checked={rules.isPrimeEnabled}
                                            onChange={(e) => setRules({
                                                ...rules,
                                                isPrimeEnabled: e.target.checked
                                            })}
                                            className="form-checkbox"
                                        />
                                        <span>Prime Numbers</span>
                                    </label>
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            checked={rules.isFibonacciEnabled}
                                            onChange={(e) => setRules({
                                                ...rules,
                                                isFibonacciEnabled: e.target.checked
                                            })}
                                            className="form-checkbox"
                                        />
                                        <span>Fibonacci Numbers</span>
                                    </label>
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            checked={rules.isPerfectSquareEnabled}
                                            onChange={(e) => setRules({
                                                ...rules,
                                                isPerfectSquareEnabled: e.target.checked
                                            })}
                                            className="form-checkbox"
                                        />
                                        <span>Perfect Squares</span>
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="label">Allowed Moves</label>
                                <input
                                    type="text"
                                    value={allowedMoves.join(",")}
                                    onChange={(e) => {
                                        const moves = e.target.value.split(",").map(Number).filter(n => !isNaN(n) && n > 0)
                                        setAllowedMoves(moves)
                                    }}
                                    className="input"
                                    placeholder="e.g., 1,2,3,4"
                                />
                                <p className="text-sm text-gray-600 mt-1">
                                    Enter comma-separated numbers for valid moves
                                </p>
                            </div>
                        </div>

                        <button onClick={handleStartGame} className="btn btn-primary mt-4">
                            Start Game
                        </button>
                    </div>
                ) : (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold">Combination Game</h2>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setShowStats(!showStats)}
                                    className="btn btn-secondary"
                                >
                                    {showStats ? "Hide Stats" : "Show Stats"}
                                </button>
                                <button onClick={handleReset} className="btn btn-secondary">
                                    Reset Game
                                </button>
                            </div>
                        </div>

                        <div className="mb-6">
                            <div className="text-2xl font-bold text-center mb-2">
                                {gameState.totalCoins} coins remaining
                            </div>
                            <div className="text-center text-gray-600">
                                {gameState.gameOver
                                    ? `Game Over! Player ${gameState.winner} wins!`
                                    : `Player ${gameState.currentPlayer}'s turn`}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            {allowedMoves.map((move) => {
                                const remaining = gameState.totalCoins - move
                                const { isLosing } = checkLosingCondition(remaining)
                                return (
                                    <button
                                        key={move}
                                        onClick={() => handleMakeMove(move)}
                                        disabled={gameState.gameOver || move > gameState.totalCoins}
                                        className={`btn ${isLosing ? "btn-danger" : "btn-primary"}`}
                                    >
                                        Take {move}
                                    </button>
                                )
                            })}
                        </div>

                        {gameState.moveHistory.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Move History</h3>
                                <div className="bg-gray-50 p-4 rounded-md">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left pb-2">Player</th>
                                                <th className="text-right pb-2">Coins Taken</th>
                                                <th className="text-right pb-2">Remaining</th>
                                                <th className="text-right pb-2">Rule Triggered</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {gameState.moveHistory.map((move, index) => (
                                                <tr key={index} className="border-b last:border-b-0">
                                                    <td className="py-2">Player {move.player}</td>
                                                    <td className="text-right py-2">{move.coinsTaken}</td>
                                                    <td className="text-right py-2">{move.remainingCoins}</td>
                                                    <td className="text-right py-2">
                                                        {move.ruleTriggered && (
                                                            <span className="text-red-500">{move.ruleTriggered}</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {!isConfiguring && showStats && (
                <DangerousNumbersStats
                    moveHistory={gameState.moveHistory}
                    gameOver={gameState.gameOver}
                    winner={gameState.winner}
                    dangerousNumber={rules.dangerousNumber}
                />
            )}
        </div>
    )
} 