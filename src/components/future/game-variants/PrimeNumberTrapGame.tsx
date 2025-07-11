"use client"

import { useState, useEffect } from "react"
import DangerousNumbersStats from "./DangerousNumbersStats"
import DangerousNumbersHelper from "./DangerousNumbersHelper"

interface GameState {
    totalCoins: number
    currentPlayer: 1 | 2
    gameOver: boolean
    winner: 1 | 2 | null
    moveHistory: Array<{
        player: 1 | 2
        coinsTaken: number
        remainingCoins: number
    }>
}

// Function to check if a number is prime
const isPrime = (num: number): boolean => {
    if (num <= 1) return false
    if (num <= 3) return true
    if (num % 2 === 0 || num % 3 === 0) return false

    for (let i = 5; i * i <= num; i += 6) {
        if (num % i === 0 || num % (i + 2) === 0) return false
    }
    return true
}

export default function PrimeNumberTrapGame() {
    const [gameState, setGameState] = useState<GameState>({
        totalCoins: 21,
        currentPlayer: 1,
        gameOver: false,
        winner: null,
        moveHistory: []
    })
    const [allowedMoves, setAllowedMoves] = useState([1, 2, 3, 4])
    const [isConfiguring, setIsConfiguring] = useState(true)
    const [showHelper, setShowHelper] = useState(true)
    const [showStats, setShowStats] = useState(true)

    const isPrimeNumber = (num: number) => isPrime(num)

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
        const isPrime = isPrimeNumber(newTotalCoins)

        const newGameState: GameState = {
            totalCoins: newTotalCoins,
            currentPlayer: gameState.currentPlayer === 1 ? 2 : 1,
            gameOver: isPrime,
            winner: isPrime ? (gameState.currentPlayer === 1 ? 2 : 1) : null,
            moveHistory: [
                ...gameState.moveHistory,
                {
                    player: gameState.currentPlayer,
                    coinsTaken,
                    remainingCoins: newTotalCoins
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
                        <h2 className="text-xl font-semibold mb-4">Prime Number Trap</h2>
                        <p className="text-gray-600 mb-4">
                            In this variant, players lose if they leave a prime number of coins.
                            Plan your moves carefully to avoid leaving prime numbers!
                        </p>
                        <div className="mb-4">
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
                        <button onClick={handleStartGame} className="btn btn-primary">
                            Start Game
                        </button>
                    </div>
                ) : (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold">Prime Number Trap</h2>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setShowHelper(!showHelper)}
                                    className="btn btn-secondary"
                                >
                                    {showHelper ? "Hide Helper" : "Show Helper"}
                                </button>
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
                            {allowedMoves.map((move) => (
                                <button
                                    key={move}
                                    onClick={() => handleMakeMove(move)}
                                    disabled={gameState.gameOver || move > gameState.totalCoins}
                                    className={`btn ${isPrimeNumber(gameState.totalCoins - move)
                                        ? "btn-danger"
                                        : "btn-primary"
                                        }`}
                                >
                                    Take {move}
                                </button>
                            ))}
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
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {gameState.moveHistory.map((move, index) => (
                                                <tr key={index} className="border-b last:border-b-0">
                                                    <td className="py-2">Player {move.player}</td>
                                                    <td className="text-right py-2">{move.coinsTaken}</td>
                                                    <td className="text-right py-2">
                                                        {move.remainingCoins}
                                                        {isPrimeNumber(move.remainingCoins) && (
                                                            <span className="text-red-500 ml-2">(Prime!)</span>
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

            {!isConfiguring && showHelper && (
                <DangerousNumbersHelper
                    totalCoins={gameState.totalCoins}
                    dangerousNumber={2} // Using 2 as a placeholder since we're using isPrime instead
                    allowedMoves={allowedMoves}
                    currentPlayer={gameState.currentPlayer}
                />
            )}

            {!isConfiguring && showStats && (
                <DangerousNumbersStats
                    moveHistory={gameState.moveHistory}
                    gameOver={gameState.gameOver}
                    winner={gameState.winner}
                    dangerousNumber={2} // Using 2 as a placeholder since we're using isPrime instead
                />
            )}
        </div>
    )
} 