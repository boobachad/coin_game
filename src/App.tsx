import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import LandingPage from "./pages/LandingPage"
import HowToPlayPage from "./pages/HowToPlayPage"
import ArenaPage from "./pages/ArenaPage"
import PlaygroundPage from "./pages/PlaygroundPage"
import VariationTestingPage from "./pages/VariationTestingPage"
import AlgorithmTestingPage from "./pages/AlgorithmTestingPage"
import Navbar from "./components/layout/Navbar"

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/how-to-play" element={<HowToPlayPage />} />
            <Route path="/arena" element={<ArenaPage />} />
            <Route path="/playground" element={<PlaygroundPage />} />
            <Route path="/variation-testing" element={<VariationTestingPage />} />
            <Route path="/algorithm-testing" element={<AlgorithmTestingPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}
