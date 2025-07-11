"use client"

import { useState, useEffect } from "react"
import { GameState, GameRule, RuleBuilder } from "../../../utils/gameRules"

interface StrategyTesterProps {
    strategyCode: string
    rules: GameRule[]
    initialPiles: number[]
}

interface TestResult {
    winner: 1 | 2
    moves: Array<{
        player: 1 | 2
        pileIndex: number
        coinsTaken: number
        resultingPiles: number[]
        ruleTriggered?: string
    }>
    duration: number
}

export default function StrategyTester({ strategyCode, rules, initialPiles }: StrategyTesterProps) {
    const [results, setResults] = useState<TestResult[]>([])
    const [isRunning, setIsRunning] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const runTest = async () => {
        setIsRunning(true)
        setError(null)

        try {
            // Create a safe evaluation environment for the strategy
            const strategyFn = new Function(`
        "use strict";
        ${strategyCode}
        return customStrategy;
      `)()

            const gameState: GameState = {
                piles: [...initialPiles],
                currentPlayer: 1,
                moveHistory: []
            }

            const moves: TestResult["moves"] = []
            const startTime = performance.now()

            while (gameState.piles.some(pile => pile > 0)) {
                // Get move from strategy
                const move = strategyFn(gameState)

                // Validate move
                if (move.pileIndex < 0 || move.pileIndex >= gameState.piles.length) {
                    throw new Error("Invalid pile index")
                }
                if (move.coinsToTake <= 0 || move.coinsToTake > gameState.piles[move.pileIndex]) {
                    throw new Error("Invalid number of coins to take")
                }

                // Apply move
                gameState.piles[move.pileIndex] -= move.coinsToTake
                gameState.lastMove = {
                    player: gameState.currentPlayer,
                    pileIndex: move.pileIndex,
                    coinsTaken: move.coinsToTake
                }

                // Check rules
                let ruleTriggered: string | undefined
                for (const rule of rules) {
                    if (rule.condition(gameState)) {
                        ruleTriggered = rule.name
                        break
                    }
                }

                // Record move
                moves.push({
                    player: gameState.currentPlayer,
                    pileIndex: move.pileIndex,
                    coinsTaken: move.coinsToTake,
                    resultingPiles: [...gameState.piles],
                    ruleTriggered
                })

                // Update game state
                gameState.moveHistory.push(moves[moves.length - 1])
                gameState.currentPlayer = gameState.currentPlayer === 1 ? 2 : 1

                // Check for game over
                if (ruleTriggered) {
                    break
                }
            }

            const endTime = performance.now()
            const result: TestResult = {
                winner: gameState.currentPlayer === 1 ? 2 : 1,
                moves,
                duration: endTime - startTime
            }

            setResults(prev => [...prev, result])
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error running strategy")
        } finally {
            setIsRunning(false)
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Strategy Tester</h3>
                <button
                    onClick={runTest}
                    disabled={isRunning}
                    className={`btn ${isRunning ? "btn-disabled" : "btn-primary"}`}
                >
                    {isRunning ? "Running..." : "Run Test"}
                </button>
            </div>

            {error && (
                <div className="text-red-500 text-sm">
                    Error: {error}
                </div>
            )}

            {results.length > 0 && (
                <div className="space-y-4">
                    <h4 className="font-medium">Test Results</h4>
                    {results.map((result, index) => (
                        <div key={index} className="card">
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <span className="font-medium">Winner: Player {result.winner}</span>
                                    <span className="text-gray-500 ml-2">
                                        (Duration: {result.duration.toFixed(2)}ms)
                                    </span>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left pb-2">Move</th>
                                            <th className="text-right pb-2">Player</th>
                                            <th className="text-right pb-2">Pile</th>
                                            <th className="text-right pb-2">Coins Taken</th>
                                            <th className="text-right pb-2">Resulting Piles</th>
                                            <th className="text-right pb-2">Rule Triggered</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {result.moves.map((move, moveIndex) => (
                                            <tr key={moveIndex} className="border-b last:border-b-0">
                                                <td className="py-2">{moveIndex + 1}</td>
                                                <td className="text-right py-2">Player {move.player}</td>
                                                <td className="text-right py-2">{move.pileIndex}</td>
                                                <td className="text-right py-2">{move.coinsTaken}</td>
                                                <td className="text-right py-2">
                                                    {move.resultingPiles.join(", ")}
                                                </td>
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
                    ))}
                </div>
            )}
        </div>
    )
} 