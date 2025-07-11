export default function PlaygroundPage() {
  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Playground - Feature Development Status</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Planned Features (Swapped with Implemented) */}
        <div className="card bg-blue-700/20">
          <h2 className="text-xl font-semibold mb-4 text-blue-800">Planned Features</h2>
          <ul className="space-y-3 text-gray-600 font-semibold">
            <li>
              <h3 className="font-bold text-white">Custom Game Rule Editor / Variant Creator</h3>
              <ul className="list-disc list-inside ml-4 text-gray-800 space-y-1">
                <li>User interface for defining custom win/loss conditions and move restrictions</li>
              </ul>
            </li>
            <li>
              <h3 className="font-bold text-white">Real-time Multiplayer / Online Arena</h3>
              <ul className="list-disc list-inside ml-4 text-gray-800 space-y-1">
                <li>Enabling two users to play against each other online</li>
                <li>Matchmaking and lobby system</li>
              </ul>
            </li>
            <li>
              <h3 className="font-bold text-white">Grundy Numbers Visualization</h3>
              <ul className="list-disc list-inside ml-4 text-gray-800 space-y-1">
                <li>Interactive visualizations of Grundy numbers and nimbers</li>
              </ul>
            </li>
            <li>
              <h3 className="font-bold text-white">Enhanced Game Variants</h3>
              <ul className="list-disc list-inside ml-4 text-gray-800 space-y-1">
                <li>Misère play</li>
                <li>Asymmetric moves</li>
                <li>Dynamic pile sizes</li>
              </ul>
            </li>
            <li>
              <h3 className="font-bold text-white">Advanced Analytics</h3>
              <ul className="list-disc list-inside ml-4 text-gray-800 space-y-1">
                <li>Deeper statistical analysis of game outcomes</li>
                <li>Exporting results for analysis</li>
              </ul>
            </li>
          </ul>
        </div>

        {/* Under Development (Slightly Larger & Standout) */}
        <div className="card bg-yellow-700/30 scale-105 shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-yellow-600">Under Development</h2>
          <ul className="space-y-3 text-gray-600 font-semibold">
            <li>
              <h3 className="font-bold text-white">General Game Restrictions System</h3>
              <ul className="list-disc list-inside ml-4 text-gray-800 space-y-1">
                <li>Framework for defining and managing various game restrictions</li>
                <li>(Future: Even Pile Only, Minimum Move Size etc.)</li>
              </ul>
            </li>
          </ul>
        </div>

        {/* Implemented Features (Swapped with Planned) */}
        <div className="card bg-green-700/20">
          <h2 className="text-xl font-semibold mb-4 text-green-800">Implemented Features</h2>
          <ul className="space-y-3 text-gray-600 font-semibold">
            <li>
              <h3 className="font-bold text-white">Custom Algorithm Coding</h3>
              <ul className="list-disc list-inside ml-4 text-gray-800 space-y-1">
                <li>User-friendly code editor for strategies</li>
                <li>Console integration for strategy debugging</li>
                <li>Step-by-step game execution</li>
                <li>Game configuration (Piles, Allowed Moves, Starting Player)</li>
                <li>Random Game Configuration Generator</li>
                <li>Comprehensive Move History Table</li>
                <li>Visual Player Turn Indicator</li>
                <li>Ability to apply strategy templates</li>
                <li>Reset to Default Strategy button</li>
              </ul>
            </li>
            <li>
              <h3 className="font-bold text-white">General Game Restrictions System</h3>
              <ul className="list-disc list-inside ml-4 text-gray-800 space-y-1">
                <li>Initial implementation for "No Consecutive Moves from Same Pile" restriction</li>
              </ul>
            </li>
          </ul>
        </div>
      </div>

      <div className="text-center mt-8">
        <p className="text-gray-600 italic">Have suggestions for other features? Please keep it to yourself!</p>
      </div>
    </div>
  )
}
