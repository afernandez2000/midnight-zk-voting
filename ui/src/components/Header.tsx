import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useMidnight } from '../contexts/MidnightContext';

function Header() {
  const { isConnected, connect, disconnect } = useMidnight();
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/5 border-b border-white/10">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-12">
            <Link to="/" className="group flex items-center space-x-3">
              <div className="text-3xl group-hover:scale-110 transition-transform duration-300">🌙</div>
              <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Midnight Vote
              </div>
            </Link>
            
            {isConnected && (
              <nav className="hidden md:flex space-x-8">
                <Link 
                  to="/" 
                  className={`relative px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                    location.pathname === '/' 
                      ? 'text-white bg-white/10 shadow-lg' 
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="flex items-center space-x-2">
                    <span>📋</span>
                    <span>Proposals</span>
                  </span>
                  {location.pathname === '/' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full"></div>
                  )}
                </Link>
                <Link 
                  to="/create" 
                  className={`relative px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                    location.pathname === '/create' 
                      ? 'text-white bg-white/10 shadow-lg' 
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="flex items-center space-x-2">
                    <span>✨</span>
                    <span>Create</span>
                  </span>
                  {location.pathname === '/create' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full"></div>
                  )}
                </Link>
                <Link 
                  to="/verification" 
                  className={`relative px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                    location.pathname === '/verification' 
                      ? 'text-white bg-white/10 shadow-lg' 
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="flex items-center space-x-2">
                    <span>🔍</span>
                    <span>Verification</span>
                  </span>
                  {location.pathname === '/verification' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full"></div>
                  )}
                </Link>
              </nav>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {isConnected ? (
              <div className="flex items-center space-x-4">
                <div className="glass-card px-4 py-2 flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    <div className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-ping opacity-75"></div>
                  </div>
                  <span className="text-sm font-medium">Connected</span>
                </div>
                <button
                  onClick={disconnect}
                  className="btn-secondary group"
                >
                  <span className="group-hover:scale-110 transition-transform">🔌</span>
                  <span className="ml-2">Disconnect</span>
                </button>
              </div>
            ) : (
              <button
                onClick={connect}
                className="btn-primary group"
              >
                <span className="group-hover:scale-110 transition-transform">🔗</span>
                <span className="ml-2">Connect Wallet</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;