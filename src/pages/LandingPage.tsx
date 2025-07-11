import { Link } from "react-router-dom"

export default function LandingPage() {
  return (
    <div className="max-w-5xl mx-auto text-center p-4">
      <h1 className="text-4xl font-bold mb-4 text">Master Coin Game Strategies</h1>
      <p className="text-xl text-gray-800 mb-8">
        Explore Combinatorial Game Theory, write custom algorithms, and discover optimal strategies.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Feature Card: Algorithm Testing */}
        <div className="card bg-gray-100 p-6 rounded-lg shadow-lg flex flex-col items-center">
          <h3 className="text-2xl font-semibold mb-3 text-blue-400">Test Your Algorithms</h3>
          <p className="text-gray-800 mb-4">Write, debug, and test custom JavaScript strategies in an interactive environment.</p>
          <Link to="/algorithm-testing" className="btn btn-primary mt-auto">
            Start Coding Now
          </Link>
        </div>

        {/* Feature Card: Game Restrictions */}
        <div className="card bg-gray-100 p-6 rounded-lg shadow-lg flex flex-col items-center">
          <h3 className="text-2xl font-semibold mb-3 text-purple-400">Custom Game Rules</h3>
          <p className="text-gray-800 mb-4">Configure unique restrictions and explore new challenges in gameplay.</p>
          <Link to="/how-to-play" className="btn btn-secondary mt-auto">
            Learn About Rules
          </Link>
        </div>

        {/* Feature Card: Development Progress */}
        <div className="card bg-gray-100 p-6 rounded-lg shadow-lg flex flex-col items-center">
          <h3 className="text-2xl font-semibold mb-3 text-green-400">What's Next?</h3>
          <p className="text-gray-800 mb-4">See our development roadmap and upcoming features on the Playground.</p>
          <Link to="/playground" className="btn btn-secondary mt-auto">
            Visit Playground
          </Link>
        </div>
      </div>

      <div className="card bg-gray-100 p-6 rounded-lg shadow-lg mb-8">
        <h2 className="text-3xl font-semibold mb-4 text">Quick Start: Classic Coin Game</h2>
        <p className="text-lg text-gray-800 mb-6">
          Jump straight into a classic game: one pile of 21 coins, where you can take 1, 3, or 4 coins per turn.
        </p>
        <Link to="/arena?piles=1&sizes=21&moves=1,3,4&player1=Optimal&player2=Human" className="btn btn-primary btn-lg">
          Play Classic Game
        </Link>
      </div>
    </div>
  )
}
