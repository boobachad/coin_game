import { Link, useLocation } from "react-router-dom"
import { useState } from "react"

export default function Navbar() {
  const location = useLocation()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const isActive = (path: string) => {
    return location.pathname === path ? "text-blue-600" : ""
  }

  return (
    <nav className="bg-white shadow">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold text-gray-800">Coin Game</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              to="/how-to-play"
              className={`text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium ${isActive("/how-to-play")}`}
            >
              How to Play
            </Link>
            <Link
              to="/arena"
              className={`text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium ${isActive("/arena")}`}
            >
              Arena
            </Link>
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium flex items-center ${location.pathname.startsWith("/playground") ||
                  location.pathname.startsWith("/variation-testing") ||
                  location.pathname.startsWith("/algorithm-testing")
                  ? "text-blue-600"
                  : ""
                  }`}
              >
                Playground
                <svg
                  className={`ml-2 h-4 w-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isDropdownOpen && (
                <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                  <div className="py-1" role="menu" aria-orientation="vertical">
                    <Link
                      to="/playground"
                      className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${location.pathname === "/playground" ? "bg-gray-100" : ""
                        }`}
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Overview
                    </Link>
                    <Link
                      to="/variation-testing"
                      className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${location.pathname === "/variation-testing" ? "bg-gray-100" : ""
                        }`}
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Variation Testing
                    </Link>
                    <Link
                      to="/algorithm-testing"
                      className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${location.pathname === "/algorithm-testing" ? "bg-gray-100" : ""
                        }`}
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Algorithm Testing
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
