import { Link, useLocation } from "react-router-dom"
import { useState } from "react"

export default function Navbar() {
  const location = useLocation()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const isActive = (path: string) => {
    return location.pathname === path ? "text-blue-600" : ""
  }

  return (
    <nav
      style={{ backgroundColor: "var(--color-bg)" }}
      className="shadow"
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex items-center">
              <span style={{ color: "var(--color-accent)" }} className="text-xl font-bold">Coin Game</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              to="/how-to-play"
              style={{ color: location.pathname === "/how-to-play" ? "var(--color-accent)" : undefined }}
              className={`px-3 py-2 rounded-md text-sm font-medium`}
            >
              How to Play
            </Link>
            <Link
              to="/arena"
              style={{ color: location.pathname === "/arena" ? "var(--color-accent)" : undefined }}
              className={`px-3 py-2 rounded-md text-sm font-medium`}
            >
              Arena
            </Link>
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                style={{ color: (location.pathname.startsWith("/playground") || location.pathname.startsWith("/variation-testing") || location.pathname.startsWith("/algorithm-testing")) ? "var(--color-accent)" : undefined }}
                className={`px-3 py-2 rounded-md text-sm font-medium flex items-center`}
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
                <div style={{ backgroundColor: "var(--color-bg)" }} className="absolute left-0 mt-2 w-48 rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
                  <div className="py-1" role="menu" aria-orientation="vertical">
                    <Link
                      to="/playground"
                      style={{ backgroundColor: location.pathname === "/playground" ? "var(--color-accent)" : undefined }}
                      className={`block px-4 py-2 text-sm hover:opacity-80 ${location.pathname === "/playground" ? "text-white" : ""}`}
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Overview
                    </Link>
                    <Link
                      to="/variation-testing"
                      style={{ backgroundColor: location.pathname === "/variation-testing" ? "var(--color-accent)" : undefined }}
                      className={`block px-4 py-2 text-sm hover:opacity-80 ${location.pathname === "/variation-testing" ? "text-white" : ""}`}
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Variation Testing
                    </Link>
                    <Link
                      to="/algorithm-testing"
                      style={{ backgroundColor: location.pathname === "/algorithm-testing" ? "var(--color-accent)" : undefined }}
                      className={`block px-4 py-2 text-sm hover:opacity-80 ${location.pathname === "/algorithm-testing" ? "text-white" : ""}`}
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
