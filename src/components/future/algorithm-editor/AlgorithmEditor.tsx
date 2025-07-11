"use client"

import { useState, useEffect } from "react"
import MonacoEditor from "@monaco-editor/react"
import { GameState, GameRule } from "../../../utils/gameRules"

interface AlgorithmEditorProps {
    onSave: (code: string) => void
    initialCode?: string
}

const defaultCode = `// Write your custom strategy here
// Available game state:
// - state.piles: number[] (current pile sizes)
// - state.currentPlayer: 1 | 2
// - state.lastMove?: { player: 1 | 2, pileIndex: number, coinsTaken: number }
// - state.moveHistory: Array<{ player: 1 | 2, pileIndex: number, coinsTaken: number, resultingPiles: number[] }>

function customStrategy(state: GameState): { pileIndex: number; coinsToTake: number } {
  // Example: Take all coins from the largest pile
  const largestPileIndex = state.piles.indexOf(Math.max(...state.piles))
  return {
    pileIndex: largestPileIndex,
    coinsToTake: state.piles[largestPileIndex]
  }
}

export default customStrategy`

export default function AlgorithmEditor({ onSave, initialCode = defaultCode }: AlgorithmEditorProps) {
    const [code, setCode] = useState(initialCode)
    const [isValid, setIsValid] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const validateCode = (code: string) => {
        try {
            // Create a safe evaluation environment
            const safeEval = new Function(`
        "use strict";
        ${code}
        return typeof customStrategy === 'function';
      `)
            const isValid = safeEval()
            setIsValid(isValid)
            setError(null)
        } catch (err) {
            setIsValid(false)
            setError(err instanceof Error ? err.message : "Invalid code")
        }
    }

    useEffect(() => {
        validateCode(code)
    }, [code])

    const handleEditorChange = (value: string | undefined) => {
        if (value) {
            setCode(value)
        }
    }

    const handleSave = () => {
        if (isValid) {
            onSave(code)
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Custom Strategy Editor</h3>
                <button
                    onClick={handleSave}
                    disabled={!isValid}
                    className={`btn ${isValid ? "btn-primary" : "btn-disabled"}`}
                >
                    Save Strategy
                </button>
            </div>

            <div className="border rounded-lg overflow-hidden">
                <MonacoEditor
                    height="400px"
                    language="typescript"
                    theme="vs-dark"
                    value={code}
                    onChange={handleEditorChange}
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        lineNumbers: "on",
                        roundedSelection: false,
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                    }}
                />
            </div>

            {error && (
                <div className="text-red-500 text-sm">
                    Error: {error}
                </div>
            )}

            <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="font-medium mb-2">Strategy Template</h4>
                <p className="text-sm text-gray-600">
                    Your strategy should export a function that takes a GameState and returns an object with:
                </p>
                <ul className="list-disc list-inside text-sm text-gray-600 mt-2">
                    <li>pileIndex: number (index of the pile to take from)</li>
                    <li>coinsToTake: number (number of coins to take)</li>
                </ul>
            </div>
        </div>
    )
} 