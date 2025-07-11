import { useState } from "react"

export default function HowToPlayPage() {
  const [showCppOptimal, setShowCppOptimal] = useState(true)

  return (
    <div className="max-w-4xl mx-auto">
      <h1>How to Play the Coin Game</h1>

      <div className="card">
        <h2>Basic Rules</h2>
        <p className="mb-4">The Coin Game is a mathematical game of strategy played with one or more piles of coins:</p>
        <ul className="list-disc pl-6 mb-6 space-y-2">
          <li>Players take turns removing coins from piles.</li>
          <li>On each turn, a player must remove a specific number of coins from a single pile.</li>
          <li>The allowed moves (number of coins that can be removed) are defined at the start of the game.</li>
          <li>The player who takes the last coin wins (normal play).</li>
        </ul>

        <h2 className="mt-8">Game Variations</h2>
        <div className="mb-6">
          <h3>Single-Pile Game</h3>
          <p>
            The classic version with just one pile. This is the most analyzed version where optimal strategies are
            well-understood.
          </p>

          <h3 className="mt-4">Multi-Pile Game</h3>
          <p>
            A more complex version with multiple piles. On your turn, you choose one pile and remove coins from it. The
            optimal strategy becomes more intricate in this variation.
          </p>
        </div>
      </div>

      <div className="card mt-8">
        <h2>Game Restrictions</h2>
        <p className="mb-4">
          The game can be configured with various restrictions to add complexity and new challenges. These restrictions
          are enforced by the game engine and can be enabled or disabled on the Algorithm Testing page.
        </p>
      </div>

      <div className="card mt-8">
        <h2>The Coin Game in Game Theory & DSA</h2>
        <p className="mb-4">
          The Coin Game, particularly its multi-pile variant, is a classic example in <span className="font-semibold">Combinatorial Game Theory</span>.
          It's often used to illustrate fundamental concepts crucial in <span className="font-semibold">Data Structures and Algorithms (DSA)</span>.
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-1">
          <li><span className="font-semibold">Winning/Losing Positions:</span> Identifying states that guarantee a win or a loss, often using concepts like Grundy Numbers (Nim-values).</li>
          <li><span className="font-semibold">Recursion & Backtracking:</span> Brute-forcing possible moves to find optimal paths, though computationally expensive for large games.</li>
          <li><span className="font-semibold">Dynamic Programming:</span> Storing and reusing results of subproblems (like pre-computing Grundy values for different pile sizes) to achieve efficient solutions.</li>
          <li><span className="font-semibold">Bitwise Operations:</span> Optimal strategies for Nim often involve the XOR sum of pile sizes (Nim-sum), which is a bitwise operation.</li>
        </ul>
        <p>
          Understanding these concepts allows you to move beyond simple heuristic strategies to developing truly optimal or highly effective players.
        </p>
      </div>

      <div className="card mt-8">
        <h2>C++ Strategy Examples</h2>
        <p className="mb-4">Here are basic C++ implementations of common strategies for the Coin Game (Nim variation):</p>
        <div className="flex space-x-4 mb-4">
          <button
            onClick={() => setShowCppOptimal(true)}
            className={`btn ${showCppOptimal ? 'btn-primary' : 'btn-secondary'}`}
          >
            Optimal Strategy (C++)
          </button>
          <button
            onClick={() => setShowCppOptimal(false)}
            className={`btn ${!showCppOptimal ? 'btn-primary' : 'btn-secondary'}`}
          >
            Greedy Strategy (C++)
          </button>
        </div>

        {showCppOptimal ? (
          <pre className="bg-gray-800 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
            <code className="language-cpp">{`
// Optimal Strategy for Nim (using Nim-sum)
#include <iostream>
#include <vector>
#include <numeric> // For std::accumulate

int calculateNimSum(const std::vector<int>& piles) {
    int nimSum = 0;
    for (int pile : piles) {
        nimSum ^= pile;
    }
    return nimSum;
}

// Finds an optimal move: pileIndex and coinsToTake
// Returns {-1, -1} if no optimal move is found (e.g., already in a losing position)
std::pair<int, int> findOptimalMove(std::vector<int> piles) {
    int nimSum = calculateNimSum(piles);

    if (nimSum == 0) {
        // Already a P-position (losing position), any valid move leads to N-position
        // Take 1 from the first non-empty pile as a fallback
        for (int i = 0; i < piles.size(); ++i) {
            if (piles[i] > 0) {
                return {i, 1};
            }
        }
        return {-1, -1}; // Should not happen in a valid game
    }

    for (int i = 0; i < piles.size(); ++i) {
        int pile = piles[i];
        int targetSize = pile ^ nimSum; // What the pile size *should* be for optimal move
        if (targetSize < pile) {
            // If targetSize is less than current pile, we can make an optimal move
            return {i, pile - targetSize};
        }
    }
    return {-1, -1}; // Should not happen if nimSum > 0 and a valid game state
}

/* Example Usage:
int main() {
    std::vector<int> gamePiles = {3, 4, 5};
    std::pair<int, int> move = findOptimalMove(gamePiles);

    if (move.first != -1) {
        std::cout << "Optimal move: Take " << move.second << " from pile " << move.first + 1 << std::endl;
    } else {
        std::cout << "No optimal move (already in a losing position)." << std::endl;
    }
    return 0;
}
*/
            `}
            </code>
          </pre>
        ) : (
          <pre className="bg-gray-800 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
            <code className="language-cpp">{`
// Greedy Strategy (take max allowed from first non-empty pile)
#include <iostream>
#include <vector>
#include <algorithm> // For std::max_element

// Finds a greedy move: pileIndex and coinsToTake
// Assumes allowedMoves is sorted
std::pair<int, int> findGreedyMove(const std::vector<int>& piles, const std::vector<int>& allowedMoves) {
    if (piles.empty() || allowedMoves.empty()) {
        return {-1, -1}; // Invalid state
    }

    for (int i = 0; i < piles.size(); ++i) {
        if (piles[i] > 0) {
            // Find the largest allowed move that is less than or equal to the current pile size
            int bestMove = 0;
            for (int move : allowedMoves) {
                if (move <= piles[i]) {
                    bestMove = std::max(bestMove, move);
                }
            }
            if (bestMove > 0) {
                return {i, bestMove};
            }
        }
    }
    return {-1, -1}; // No valid move found
}

/* Example Usage:
int main() {
    std::vector<int> gamePiles = {3, 4, 5};
    std::vector<int> allowed = {1, 2, 3};
    std::pair<int, int> move = findGreedyMove(gamePiles, allowed);

    if (move.first != -1) {
        std::cout << "Greedy move: Take " << move.second << " from pile " << move.first + 1 << std::endl;
    } else {
        std::cout << "No valid greedy move." << std::endl;
    }
    return 0;
}
*/
            `}
            </code>
          </pre>
        )}
      </div>

      <div className="card mt-8">
        <h2>Strategy Definition and Testing</h2>

        <div className="mb-6">
          <h3 className="text-blue-600">Custom Algorithm Coding</h3>
          <p>
            The primary way to define strategies is by writing your own JavaScript functions directly in the in-browser editor on the
            <span className="font-semibold"> Algorithm Testing</span> page. You can:
          </p>
          <ul className="list-disc pl-6 mt-2 mb-4 space-y-1">
            <li>Write your strategy logic based on the current game state.</li>
            <li>Use the integrated console for debugging your code.</li>
            <li>Execute the game step-by-step to observe your strategy's behavior.</li>
            <li>Test your custom algorithms against different game configurations and rules.</li>
          </ul>
          <p>Pre-defined strategies like "Optimal," "Greedy," and "Always Take One" are available as templates to get you started.</p>
        </div>
      </div>

      <div className="card mt-8">
        <h2>Strategy Tips</h2>
        <p className="mb-4">
          The key to mastering the Coin Game with various configurations and restrictions is experimentation. Use the
          <span className="font-semibold"> Algorithm Testing</span> page to:
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-1">
          <li>Experiment with different game configurations (piles, allowed moves).</li>
          <li>Test various strategies (your own and templates) against these configurations.</li>
          <li>Observe how different game restrictions impact optimal play.</li>
          <li>Analyze the move history and console output to refine your algorithms.</li>
        </ul>
        <p>
          Understanding the pattern of winning and losing positions, combined with adaptive strategies, will lead to mastery.
        </p>
      </div>
    </div>
  )
}
