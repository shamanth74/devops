import React from 'react';
import { Link, useLocation } from 'react-router-dom';

/**
 * Navbar — persistent dark top navigation bar.
 * Shows app title on the left, nav links on the right.
 * Highlights the currently active link.
 */
function Navbar() {
  const location = useLocation();

  // Helper to determine if a link is active
  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const linkClass = (path) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive(path)
        ? 'bg-gray-800 text-white'
        : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
    }`;

  return (
    <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left — Brand */}
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-2xl" role="img" aria-label="rocket">
              🚀
            </span>
            <span className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
              CI/CD Approvals
            </span>
          </Link>

          {/* Right — Navigation links */}
          <div className="flex items-center gap-2">
            <Link to="/" className={linkClass('/')}>
              Dashboard
            </Link>
            <Link to="/history" className={linkClass('/history')}>
              History
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
