"use client"

import { useState } from "react"
import DangerousNumbersGame from "../components/future/game-variants/DangerousNumbersGame"
import PrimeNumberTrapGame from "../components/future/game-variants/PrimeNumberTrapGame"
import FibonacciTrapGame from "../components/future/game-variants/FibonacciTrapGame"
import CombinationGame from "../components/future/game-variants/CombinationGame"

type GameVariant = "dangerous-numbers" | "prime-number-trap" | "fibonacci-trap" | "combination"

export default function VariationTestingPage() {
    const [selectedVariant, setSelectedVariant] = useState<GameVariant>("dangerous-numbers")

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Playground Testing</h1>

            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Select Game Variant</h2>
                <div className="flex flex-wrap gap-4">
                    <button
                        onClick={() => setSelectedVariant("dangerous-numbers")}
                        className={`btn ${selectedVariant === "dangerous-numbers" ? "btn-primary" : "btn-secondary"}`}
                    >
                        Dangerous Numbers
                    </button>
                    <button
                        onClick={() => setSelectedVariant("prime-number-trap")}
                        className={`btn ${selectedVariant === "prime-number-trap" ? "btn-primary" : "btn-secondary"}`}
                    >
                        Prime Number Trap
                    </button>
                    <button
                        onClick={() => setSelectedVariant("fibonacci-trap")}
                        className={`btn ${selectedVariant === "fibonacci-trap" ? "btn-primary" : "btn-secondary"}`}
                    >
                        Fibonacci Trap
                    </button>
                    <button
                        onClick={() => setSelectedVariant("combination")}
                        className={`btn ${selectedVariant === "combination" ? "btn-primary" : "btn-secondary"}`}
                    >
                        Combination Game
                    </button>
                </div>
            </div>

            <div className="card">
                {selectedVariant === "dangerous-numbers" && <DangerousNumbersGame />}
                {selectedVariant === "prime-number-trap" && <PrimeNumberTrapGame />}
                {selectedVariant === "fibonacci-trap" && <FibonacciTrapGame />}
                {selectedVariant === "combination" && <CombinationGame />}
            </div>
        </div>
    )
} 