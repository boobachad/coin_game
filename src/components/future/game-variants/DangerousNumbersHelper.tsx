"use client"

import { useState, useEffect } from "react"

interface DangerousNumbersHelperProps {
    totalCoins: number
    dangerousNumber: number
    allowedMoves: number[]
    currentPlayer: 1 | 2
}

export default function DangerousNumbersHelper({
    totalCoins,
    dangerousNumber,
    allowedMoves,
    currentPlayer
}: DangerousNumbersHelperProps) {
    const [safeMoves, setSafeMoves] = useState<number[]>([])
    const [dangerousMoves, setDangerousMoves] = useState<number[]>([])
    const [strategy, setStrategy] = useState<string>("")

    useEffect(() => {
        // Calculate safe and dangerous moves
        const safe: number[] = []
        const dangerous: number[] = []

        allowedMoves.forEach(move => {
            if (move <= totalCoins) {
                const remaining = totalCoins - move
                if (remaining % dangerousNumber === 0) {
                    dangerous.push(move)
                } else {
                    safe.push(move)
                }
            }
        })

        setSafeMoves(safe)
        setDangerousMoves(dangerous)

        // Generate strategy advice
        if (safe.length === 0) {
            setStrategy("No safe moves available. You must make a dangerous move.")
        } else if (dangerous.length === 0) {
            setStrategy("All available moves are safe. Choose any move.")
        } else {
            const bestMove = safe.reduce((best, current) => {
                const bestRemaining = totalCoins - best
                const currentRemaining = totalCoins - current
                return currentRemaining < bestRemaining ? current : best
            }, safe[0])

            setStrategy(`Best move: Take ${bestMove} coins. This leaves ${totalCoins - bestMove} coins, which is safe.`)
        }
    }, [totalCoins, dangerousNumber, allowedMoves])

    return (
        <div className="card">
            <h3 className="text-lg font-semibold mb-4">Strategy Helper</h3>

            <div className="mb-6">
                <h4 className="font-medium mb-2">Available Moves</h4>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-50 p-4 rounded-md">
                        <div className="text-sm text-green-600 mb-2">Safe Moves</div>
                        <div className="flex flex-wrap gap-2">
                            {safeMoves.map(move => (
                                <div key={move} className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
                                    Take {move}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-red-50 p-4 rounded-md">
                        <div className="text-sm text-red-600 mb-2">Dangerous Moves</div>
                        <div className="flex flex-wrap gap-2">
                            {dangerousMoves.map(move => (
                                <div key={move} className="bg-red-100 text-red-800 px-3 py-1 rounded-full">
                                    Take {move}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="mb-6">
                <h4 className="font-medium mb-2">Strategy Advice</h4>
                <div className="bg-blue-50 p-4 rounded-md">
                    <p className="text-blue-800">{strategy}</p>
                </div>
            </div>

            <div>
                <h4 className="font-medium mb-2">Game State</h4>
                <div className="bg-gray-50 p-4 rounded-md">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="text-sm text-gray-600">Current Player</div>
                            <div className="font-bold">Player {currentPlayer}</div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-600">Coins Remaining</div>
                            <div className="font-bold">{totalCoins}</div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-600">Dangerous Number</div>
                            <div className="font-bold">{dangerousNumber}</div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-600">Safe Moves</div>
                            <div className="font-bold">{safeMoves.length}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
} 