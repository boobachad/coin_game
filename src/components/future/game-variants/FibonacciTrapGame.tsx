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

// Function to check if a number is a Fibonacci number
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

// Generate Fibonacci numbers up to a limit
const generateFibonacciNumbers = (limit: number): number[] => {
    const fibs: number[] = [1, 1]
    let a = 1, b = 1
    while (b < limit) {
        const temp = a + b
        a = b
        b = temp
        fibs.push(b)
    }
    return fibs
}

export default function FibonacciTrapGame() {
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
    const [fibonacciNumbers, setFibonacciNumbers] = useState<number[]>([])

    useEffect(() => {
        setFibonacciNumbers(generateFibonacciNumbers(gameState.totalCoins))
    }, [gameState.totalCoins])

    const isFibonacciNumber = (num: number) => isFibonacci(num)

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
        const isFib = isFibonacciNumber(newTotalCoins)

        const newGameState: GameState = {
            totalCoins: newTotalCoins,
            currentPlayer: gameState.currentPlayer === 1 ? 2 : 1,
            gameOver: isFib,
            winner: isFib ? (gameState.currentPlayer === 1 ? 2 : 1) : null,
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
                        <h2 className="text-xl font-semibold mb-4">Fibonacci Trap</h2>
                        <p className="text-gray-600 mb-4">
                            In this variant, players lose if they leave a Fibonacci number of coins.
                            Fibonacci numbers are: 1, 1, 2, 3, 5, 8, 13, 21, 34, ...
                            Plan your moves carefully to avoid leaving Fibonacci numbers!
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
                            <h2 className="text-xl font-semibold">Fibonacci Trap</h2>
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
                                    className={`btn ${isFibonacciNumber(gameState.totalCoins - move)
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
                                                        {isFibonacciNumber(move.remainingCoins) && (
                                                            <span className="text-red-500 ml-2">(Fibonacci!)</span>
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
                <div className="card">
                    <h3 className="text-lg font-semibold mb-4">Strategy Helper</h3>
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-medium mb-2">Fibonacci Numbers to Avoid:</h4>
                            <div className="flex flex-wrap gap-2">
                                {fibonacciNumbers.map((num) => (
                                    <span
                                        key={num}
                                        className={`px-2 py-1 rounded ${num === gameState.totalCoins
                                                ? "bg-red-100 text-red-800"
                                                : "bg-gray-100"
                                            }`}
                                    >
                                        {num}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h4 className="font-medium mb-2">Safe Moves:</h4>
                            <div className="flex flex-wrap gap-2">
                                {allowedMoves
                                    .filter((move) => move <= gameState.totalCoins)
                                    .map((move) => {
                                        const remaining = gameState.totalCoins - move
                                        return (
                                            <span
                                                key={move}
                                                className={`px-2 py-1 rounded ${isFibonacciNumber(remaining)
                                                        ? "bg-red-100 text-red-800"
                                                        : "bg-green-100 text-green-800"
                                                    }`}
                                            >
                                                Take {move} → {remaining}
                                            </span>
                                        )
                                    })}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {!isConfiguring && showStats && (
                <DangerousNumbersStats
                    moveHistory={gameState.moveHistory}
                    gameOver={gameState.gameOver}
                    winner={gameState.winner}
                    dangerousNumber={2} // Using 2 as a placeholder since we're using isFibonacci instead
                />
            )}
        </div>
    )
} 