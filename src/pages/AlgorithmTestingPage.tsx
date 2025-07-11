"use client"

import { useState, useRef, useEffect } from "react"
import Editor from "@monaco-editor/react"
import { INITIAL_GAME_STATE, STRATEGY_TEMPLATES } from '../constants/gameConfig'
import { ALL_GAME_RESTRICTIONS } from '../constants/allGameRestrictions'
import { GameState, GameRestriction, RestrictionConfigProps } from '../types/game'
import { hasValidMoves } from '../utils/gameLogic'
import { makeMove as makeGameMove } from '../utils/gameStateManager'
import { validateMove } from '../utils/validationUtils'

interface ConsoleMessage {
    player: number
    message: string
    type: 'info' | 'error'
    timestamp: number
}

export default function AlgorithmTestingPage() {
    const [isGameRunning, setIsGameRunning] = useState(false)
    const executionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const isGameRunningRef = useRef(false)
    const [player1Console, setPlayer1Console] = useState<ConsoleMessage[]>([])
    const [player2Console, setPlayer2Console] = useState<ConsoleMessage[]>([])
    const strategyCache = useRef<{ [key: string]: Function }>({})
    const [player1Code, setPlayer1Code] = useState<string>(STRATEGY_TEMPLATES.initialTemplate.code)
    const [player2Code, setPlayer2Code] = useState<string>(STRATEGY_TEMPLATES.initialTemplate.code)
    const [gameState, setGameState] = useState<GameState>({
        ...INITIAL_GAME_STATE,
        allowedMoves: [1, 2, 3, 4, 5],
        timeRemaining: INITIAL_GAME_STATE.timeRemaining || null,
    })
    const [error, setError] = useState<string | null>(null)
    const currentPlayerRef = useRef(1)
    const [pilesInput, setPilesInput] = useState(INITIAL_GAME_STATE.piles.join(','))
    const [allowedMovesInput, setAllowedMovesInput] = useState(INITIAL_GAME_STATE.allowedMoves.join(','))
    const [startingPlayer, setStartingPlayer] = useState<1 | 2>(1)
    const [enabledRestrictions, setEnabledRestrictions] = useState<{ [id: string]: any }>({});

    const handleEditorChange = (player: number) => (value: string | undefined) => {
        if (value === undefined) return;
        if (player === 1) {
            setPlayer1Code(value)
        } else {
            setPlayer2Code(value)
        }
        setError(null)
    }

    const resetStrategy = (player: number) => {
        if (player === 1) {
            setPlayer1Code(STRATEGY_TEMPLATES.initialTemplate.code)
        } else {
            setPlayer2Code(STRATEGY_TEMPLATES.initialTemplate.code)
        }
        setError(null)
    }

    const clearConsole = () => {
        setPlayer1Console([])
        setPlayer2Console([])
    }

    const logToConsole = (player: 1 | 2, message: string, type: 'error' | 'info' | 'log') => {
        const newConsoleMessage: ConsoleMessage = {
            player,
            message,
            type,
            timestamp: Date.now()
        }

        if (player === 1) {
            setPlayer1Console(prev => [...prev, newConsoleMessage])
        } else {
            setPlayer2Console(prev => [...prev, newConsoleMessage])
        }
    }

    const generateRandomConfig = () => {
        // Generate 3-6 random piles between 10 and 200
        const numPiles = Math.floor(Math.random() * 4) + 3
        const piles = Array.from({ length: numPiles }, () =>
            Math.floor(Math.random() * 191) + 10
        )

        // Generate 2-5 random allowed moves between 1 and 10
        const numMoves = Math.floor(Math.random() * 4) + 2
        const allowedMovesSet = new Set<number>();
        while (allowedMovesSet.size < numMoves) {
            allowedMovesSet.add(Math.floor(Math.random() * 10) + 1);
        }
        const allowedMoves = Array.from(allowedMovesSet).sort((a, b) => a - b);

        // Random starting player
        const startPlayer = Math.random() < 0.5 ? 1 : 2

        setPilesInput(piles.join(','))
        setAllowedMovesInput(allowedMoves.join(','))
        setStartingPlayer(startPlayer)
    }

    const parseGameConfig = () => {
        try {
            const piles = pilesInput.split(',').map(num => {
                const parsed = parseInt(num.trim())
                if (isNaN(parsed) || parsed <= 0) {
                    throw new Error('Piles must be positive numbers')
                }
                return parsed
            })

            const allowedMoves = allowedMovesInput.split(',').map(num => {
                const parsed = parseInt(num.trim())
                if (isNaN(parsed) || parsed <= 0) {
                    throw new Error('Allowed moves must be positive numbers')
                }
                return parsed
            })

            if (piles.length === 0) {
                throw new Error('At least one pile is required')
            }
            if (allowedMoves.length === 0) {
                throw new Error('At least one allowed move is required')
            }

            return { piles, allowedMoves }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Invalid configuration')
            return null
        }
    }

    const startGame = () => {
        const config = parseGameConfig()
        if (!config) return

        const initialState: GameState = {
            ...INITIAL_GAME_STATE,
            piles: config.piles,
            allowedMoves: config.allowedMoves,
            currentPlayer: startingPlayer,
            timeRemaining: INITIAL_GAME_STATE.timeRemaining || null,
        }

        setGameState(initialState)
        isGameRunningRef.current = true
        setIsGameRunning(true)
        executeGameLoop(initialState)
    }

    const stopGame = () => {
        isGameRunningRef.current = false
        setIsGameRunning(false)
        if (executionTimeoutRef.current) {
            clearTimeout(executionTimeoutRef.current)
            executionTimeoutRef.current = null
        }
    }

    const executeMove = async (state: GameState, player: number) => {
        const code = player === 1 ? player1Code : player2Code
        const cacheKey = `${player}-${code}`

        let strategyFn: Function
        if (strategyCache.current[cacheKey]) {
            strategyFn = strategyCache.current[cacheKey]
        } else {
            try {
                // Create a new Function with the code
                strategyFn = new Function('state', `
                    ${code}
                    return myStrategy(state);
                `)
                strategyCache.current[cacheKey] = strategyFn
            } catch (err) {
                logToConsole(player, `Error compiling strategy: ${err}`, 'error')
                throw err
            }
        }

        try {
            // Check if player has any valid moves
            const playerHasValidMoves = hasValidMoves(state, player);
            if (!playerHasValidMoves) {
                // If no valid moves, the last player who made a valid move wins
                const lastValidMovePlayer = state.lastValidMovePlayer;
                return {
                    ...state,
                    gameOver: true,
                    winner: lastValidMovePlayer,
                    hasValidMoves: false,
                    lastValidMovePlayer
                };
            }

            const move = await strategyFn(state)
            logToConsole(player, `Strategy returned move: ${JSON.stringify({
                pileIndex: move ? move.pileIndex + 1 : null,
                coinsToTake: move ? move.coinsToTake : null
            })}`, 'info');

            if (!move || typeof move.pileIndex !== 'number' || typeof move.coinsToTake !== 'number') {
                throw new Error('Invalid move returned by strategy')
            }

            const validationResult = validateMove(state, move, ALL_GAME_RESTRICTIONS, enabledRestrictions)
            if (!validationResult.isValid) {
                throw new Error(validationResult.error || 'Invalid move')
            }

            return makeGameMove(state, move, 'Human', false)
        } catch (err) {
            logToConsole(player, `Error executing move: ${err}`, 'error')
            throw err
        }
    }

    const executeGameLoop = async (state: GameState) => {
        if (!isGameRunningRef.current || state.gameOver) {
            stopGame()
            return
        }

        try {
            const newState = await executeMove(state, state.currentPlayer)
            setGameState(newState)

            if (newState.gameOver) {
                stopGame()
                return
            }

            executionTimeoutRef.current = setTimeout(() => {
                executeGameLoop(newState)
            }, 1000) // Fixed 1 second delay
        } catch (err) {
            stopGame()
            setError(`Game stopped due to error: ${err}`)
        }
    }

    const resetGame = () => {
        stopGame()
        const config = parseGameConfig()
        if (!config) return

        setGameState({
            ...INITIAL_GAME_STATE,
            piles: config.piles,
            allowedMoves: config.allowedMoves,
            currentPlayer: startingPlayer,
            timeRemaining: INITIAL_GAME_STATE.timeRemaining || null,
        })
        setError(null)
        clearConsole()
        setEnabledRestrictions({}); // Reset restrictions on game reset
    }

    const applyTemplate = (player: number, templateKey: keyof typeof STRATEGY_TEMPLATES) => {
        const template = STRATEGY_TEMPLATES[templateKey]
        if (player === 1) {
            setPlayer1Code(template.code)
        } else {
            setPlayer2Code(template.code)
        }
        // Clear cache for this player
        Object.keys(strategyCache.current).forEach(key => {
            if (key.startsWith(`${player}-`)) {
                delete strategyCache.current[key]
            }
        })
    }

    const handleRestrictionToggle = (restrictionId: string, isChecked: boolean) => {
        setEnabledRestrictions(prev => {
            const newRestrictions = { ...prev };
            if (isChecked) {
                const restriction = ALL_GAME_RESTRICTIONS.find(r => r.id === restrictionId);
                if (restriction) {
                    newRestrictions[restrictionId] = restriction.initialConfig;
                }
            } else {
                delete newRestrictions[restrictionId];
            }
            return newRestrictions;
        });
    };

    const updateRestrictionConfig = (restrictionId: string, newConfig: any) => {
        setEnabledRestrictions(prev => ({
            ...prev,
            [restrictionId]: newConfig,
        }));
    };

    const renderGameState = () => {
        return (
            <div className="p-6 rounded-2xl mb-4">
                <div className="flex justify-between items-center mb-5">
                    <h3 className="text-2xl font-extrabold text-gray-800 tracking-tight">Game State</h3>
                    <div className="flex items-center space-x-2">
                        {gameState.gameOver && gameState.winner && (
                            <span className="px-4 py-1.5 rounded-full text-sm bg-blue-600 text-white font-semibold shadow-sm">
                                Winner: Player {gameState.winner}
                            </span>
                        )}
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-6">
                    <div>
                        <h4 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">Piles</h4>
                        <div className="flex flex-wrap gap-3">
                            {gameState.piles.map((pile, index) => {
                                const isLastUsedPile =
                                    gameState.moveHistory.length > 0 &&
                                    gameState.moveHistory[gameState.moveHistory.length - 1].pileIndex === index;
                                return (
                                    <div
                                        key={index}
                                        className={`px-5 py-2.5 rounded-xl text-base font-semibold border transition-all duration-200 
                                                ${isLastUsedPile ? 'ring-2 ring-offset-2 ring-blue-500 border-blue-400 bg-blue-100 text-blue-900' : ''} 
                                                ${pile === 0
                                                ? 'text-gray-400 border-gray-300 bg-gray-50'
                                                : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'}
                                            `}
                                    >
                                        {pile}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
                {gameState.gameOver && !gameState.winner && (
                    <div className="mt-5 text-blue-600 text-sm italic">
                        No valid moves available. Last player to make a valid move wins.
                    </div>
                )}
            </div>
        )
    }

    const renderMoveHistory = () => {
        return (
            <div className="card lg:col-span-2">
                <h2 className="text-xl font-semibold mb-4">Move History</h2>
                <div className="overflow-x-auto h-[300px] overflow-y-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="p-2 text-left border">Turn</th>
                                <th className="p-2 text-left border">Player</th>
                                <th className="p-2 text-left border">Move</th>
                                <th className="p-2 text-left border">Pile Before</th>
                                <th className="p-2 text-left border">Pile After</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-800">
                            {gameState.moveHistory.map((move, index) => (
                                <tr key={index} className="hover:bg-gray-50 transition-colors duration-200">
                                    <td className="p-2 border font-mono">{index + 1}</td>
                                    <td className="p-2 border">
                                        <span className={`font-medium ${move.player === 1 ? 'text-blue-600' : 'text-red-600'}`}>
                                            Player {move.player}
                                        </span>
                                    </td>
                                    <td className="p-2 border">
                                        <span className="font-medium">Took {move.coinsTaken} from Pile {move.pileIndex + 1}</span>
                                    </td>
                                    <td className="p-2 border">
                                        <div className="flex flex-wrap gap-1 items-center justify-center">
                                            {move.pilesBeforeMove.map((pile: number, pIdx: number) => (
                                                <span key={pIdx} className="bg-gray-200 text-gray-800 font-mono rounded px-2 py-1 text-xs">
                                                    {pile}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="p-2 border">
                                        <div className="flex flex-wrap gap-1 items-center justify-center">
                                            {move.pilesAfterMove.map((pile: number, pIdx: number) => (
                                                <span key={pIdx} className="bg-gray-200 text-gray-800 font-mono rounded px-2 py-1 text-xs">
                                                    {pile}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {gameState.moveHistory.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="py-3 px-6 text-center text-gray-500">No moves yet. Start a game!</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }

    useEffect(() => {
        return () => {
            if (executionTimeoutRef.current) {
                clearTimeout(executionTimeoutRef.current)
            }
        }
    }, [])

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-8">Algorithm Testing</h1>

            {/* Game Controls and Configuration */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Game Controls */}
                <div className="card">
                    <h2 className="text-xl font-semibold mb-4">Game Controls</h2>
                    <div className="flex flex-col gap-4">
                        <button
                            onClick={startGame}
                            disabled={isGameRunning}
                            className="btn btn-primary w-full transition-colors duration-150"
                        >
                            Start Game
                        </button>
                        <button
                            onClick={stopGame}
                            disabled={!isGameRunning}
                            className="btn btn-secondary w-full transition-colors duration-150"
                        >
                            Stop Game
                        </button>
                        <button
                            onClick={resetGame}
                            className="btn btn-secondary w-full transition-colors duration-150"
                        >
                            Reset Game
                        </button>

                        {/* Game Restrictions */}
                        <div className="mt-4">
                            <h3 className="text-lg font-semibold mb-2">Game Restrictions</h3>
                            <div className="space-y-2">
                                {ALL_GAME_RESTRICTIONS.map(restriction => (
                                    <div key={restriction.id} className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id={restriction.id}
                                            checked={!!enabledRestrictions[restriction.id]}
                                            onChange={(e) => handleRestrictionToggle(restriction.id, e.target.checked)}
                                            className="checkbox"
                                        />
                                        <label htmlFor={restriction.id} className="label cursor-pointer">
                                            {restriction.name}
                                        </label>
                                        {enabledRestrictions[restriction.id] && restriction.ConfigComponent && (
                                            <restriction.ConfigComponent
                                                currentConfig={enabledRestrictions[restriction.id]}
                                                onConfigChange={(newConfig) => updateRestrictionConfig(restriction.id, newConfig)}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Game Configuration */}
                <div className="card">
                    <h2 className="text-xl font-semibold mb-4">Game Configuration</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="label">Piles (comma-separated)</label>
                            <input
                                type="text"
                                value={pilesInput}
                                onChange={(e) => setPilesInput(e.target.value)}
                                className="input transition-colors duration-150"
                                placeholder="e.g., 21,102,69,99"
                            />
                        </div>
                        <div>
                            <label className="label">Allowed Moves (comma-separated)</label>
                            <input
                                type="text"
                                value={allowedMovesInput}
                                onChange={(e) => setAllowedMovesInput(e.target.value)}
                                className="input transition-colors duration-150"
                                placeholder="e.g., 1,2,3,4,5"
                            />
                        </div>
                        <div>
                            <label className="label">Starting Player</label>
                            <div className="strategy-selector">
                                <select
                                    value={startingPlayer}
                                    onChange={(e) => setStartingPlayer(Number(e.target.value) as 1 | 2)}
                                    className="input transition-colors duration-150"
                                >
                                    <option value={1}>Player 1</option>
                                    <option value={2}>Player 2</option>
                                </select>
                            </div>
                        </div>
                        <button
                            onClick={generateRandomConfig}
                            className="btn btn-primary w-full transition-colors duration-150"
                        >
                            Generate Random Config
                        </button>
                    </div>
                </div>
            </div>

            {/* Game State and Move History */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Game State */}
                <div className="card">
                    {renderGameState()}
                </div>

                {/* Move History */}
                {renderMoveHistory()}
            </div>

            {/* Strategy Editors */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Player 1 Editor */}
                <div className={`card ${gameState.currentPlayer === 1 && isGameRunning ? 'ring-2 ring-blue-500' : ''}`}>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Player 1 Strategy</h3>
                        <div className="flex gap-2">
                            <div className="strategy-selector">
                                <select
                                    className="input transition-colors duration-150"
                                    onChange={(e) => applyTemplate(1, e.target.value as keyof typeof STRATEGY_TEMPLATES)}
                                >
                                    <option value="">Select Template</option>
                                    {Object.entries(STRATEGY_TEMPLATES).map(([key, template]) => (
                                        <option key={key} value={key}>{template.name}</option>
                                    ))}
                                </select>
                            </div>
                            <button
                                onClick={() => setPlayer1Code(STRATEGY_TEMPLATES.initialTemplate.code)}
                                className="btn btn-secondary transition-colors duration-150"
                            >
                                Reset to Default
                            </button>
                        </div>
                    </div>
                    <div className="h-[300px] border rounded-lg overflow-hidden">
                        <Editor
                            height="100%"
                            defaultLanguage="javascript"
                            value={player1Code}
                            onChange={handleEditorChange(1)}
                            theme="vs-dark"
                            options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                lineNumbers: "on",
                                roundedSelection: false,
                                scrollBeyondLastLine: false,
                                automaticLayout: true
                            }}
                        />
                    </div>
                    <div className="mt-4">
                        <h3 className="text-lg font-semibold mb-2">Console Output</h3>
                        <div className="h-[200px] bg-gray-900 text-gray-100 p-4 rounded-lg overflow-y-auto font-mono text-sm">
                            {player1Console.map((msg, i) => (
                                <div
                                    key={i}
                                    className={`${msg.type === 'error' ? 'text-red-400' :
                                        msg.type === 'info' ? 'text-blue-400' :
                                            'text-gray-300'
                                        }`}
                                >
                                    {msg.message}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Player 2 Editor */}
                <div className={`card ${gameState.currentPlayer === 2 && isGameRunning ? 'ring-2 ring-blue-500' : ''}`}>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Player 2 Strategy</h3>
                        <div className="flex gap-2">
                            <div className="strategy-selector">
                                <select
                                    className="input transition-colors duration-150"
                                    onChange={(e) => applyTemplate(2, e.target.value as keyof typeof STRATEGY_TEMPLATES)}
                                >
                                    <option value="">Select Template</option>
                                    {Object.entries(STRATEGY_TEMPLATES).map(([key, template]) => (
                                        <option key={key} value={key}>{template.name}</option>
                                    ))}
                                </select>
                            </div>
                            <button
                                onClick={() => setPlayer2Code(STRATEGY_TEMPLATES.initialTemplate.code)}
                                className="btn btn-secondary transition-colors duration-150"
                            >
                                Reset to Default
                            </button>
                        </div>
                    </div>
                    <div className="h-[300px] border rounded-lg overflow-hidden">
                        <Editor
                            height="100%"
                            defaultLanguage="javascript"
                            value={player2Code}
                            onChange={handleEditorChange(2)}
                            theme="vs-dark"
                            options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                lineNumbers: "on",
                                roundedSelection: false,
                                scrollBeyondLastLine: false,
                                automaticLayout: true
                            }}
                        />
                    </div>
                    <div className="mt-4">
                        <h3 className="text-lg font-semibold mb-2">Console Output</h3>
                        <div className="h-[200px] bg-gray-900 text-gray-100 p-4 rounded-lg overflow-y-auto font-mono text-sm">
                            {player2Console.map((msg, i) => (
                                <div
                                    key={i}
                                    className={`${msg.type === 'error' ? 'text-red-400' :
                                        msg.type === 'info' ? 'text-blue-400' :
                                            'text-gray-300'
                                        }`}
                                >
                                    {msg.message}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}