"use client"

import { useState, useEffect } from "react"

interface GameStats {
    totalGames: number
    player1Wins: number
    player2Wins: number
    averageGameLength: number
    mostCommonMoves: Record<number, number>
    dangerousNumbersHit: number
    longestGame: number
    shortestGame: number
}

interface DangerousNumbersStatsProps {
    moveHistory: Array<{
        player: 1 | 2
        coinsTaken: number
        remainingCoins: number
    }>
    gameOver: boolean
    winner: 1 | 2 | null
    dangerousNumber: number
}

export default function DangerousNumbersStats({
    moveHistory,
    gameOver,
    winner,
    dangerousNumber
}: DangerousNumbersStatsProps) {
    const [stats, setStats] = useState<GameStats>({
        totalGames: 0,
        player1Wins: 0,
        player2Wins: 0,
        averageGameLength: 0,
        mostCommonMoves: {},
        dangerousNumbersHit: 0,
        longestGame: 0,
        shortestGame: 0
    })

    useEffect(() => {
        if (gameOver && winner) {
            const newStats = { ...stats }

            // Update total games and wins
            newStats.totalGames++
            if (winner === 1) newStats.player1Wins++
            else newStats.player2Wins++

            // Update game lengths
            const gameLength = moveHistory.length
            newStats.averageGameLength = ((newStats.averageGameLength * (newStats.totalGames - 1)) + gameLength) / newStats.totalGames
            newStats.longestGame = Math.max(newStats.longestGame, gameLength)
            newStats.shortestGame = newStats.shortestGame === 0 ? gameLength : Math.min(newStats.shortestGame, gameLength)

            // Update move distribution
            moveHistory.forEach(move => {
                newStats.mostCommonMoves[move.coinsTaken] = (newStats.mostCommonMoves[move.coinsTaken] || 0) + 1
            })

            // Count dangerous numbers hit
            const dangerousHits = moveHistory.filter(move => move.remainingCoins % dangerousNumber === 0).length
            newStats.dangerousNumbersHit += dangerousHits

            setStats(newStats)
        }
    }, [gameOver, winner, moveHistory, dangerousNumber])

    return (
        <div className="card">
            <h3 className="text-lg font-semibold mb-4">Game Statistics</h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-md">
                    <div className="text-sm text-gray-600">Total Games</div>
                    <div className="text-xl font-bold">{stats.totalGames}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-md">
                    <div className="text-sm text-gray-600">Player 1 Wins</div>
                    <div className="text-xl font-bold">{stats.player1Wins}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-md">
                    <div className="text-sm text-gray-600">Player 2 Wins</div>
                    <div className="text-xl font-bold">{stats.player2Wins}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-md">
                    <div className="text-sm text-gray-600">Win Rate (P1)</div>
                    <div className="text-xl font-bold">
                        {stats.totalGames > 0 ? ((stats.player1Wins / stats.totalGames) * 100).toFixed(1) : 0}%
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-md">
                    <div className="text-sm text-gray-600">Avg. Game Length</div>
                    <div className="text-xl font-bold">{stats.averageGameLength.toFixed(1)} moves</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-md">
                    <div className="text-sm text-gray-600">Longest Game</div>
                    <div className="text-xl font-bold">{stats.longestGame} moves</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-md">
                    <div className="text-sm text-gray-600">Shortest Game</div>
                    <div className="text-xl font-bold">{stats.shortestGame} moves</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-md">
                    <div className="text-sm text-gray-600">Dangerous Hits</div>
                    <div className="text-xl font-bold">{stats.dangerousNumbersHit}</div>
                </div>
            </div>

            <div className="mb-6">
                <h4 className="font-medium mb-2">Most Common Moves</h4>
                <div className="bg-gray-50 p-4 rounded-md">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(stats.mostCommonMoves)
                            .sort((a, b) => b[1] - a[1])
                            .map(([move, count]) => (
                                <div key={move}>
                                    <div className="text-sm text-gray-600">Take {move}</div>
                                    <div className="font-bold">{count} times</div>
                                </div>
                            ))}
                    </div>
                </div>
            </div>
        </div>
    )
} 