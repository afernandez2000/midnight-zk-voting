import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import CreateProposal from './pages/CreateProposal';
import VotePage from './pages/VotePage';
import Results from './pages/Results';
import VerificationPage from './pages/VerificationPage';
import DoubleVoteDemo from './pages/DoubleVoteDemo';
import { useMidnight } from './contexts/MidnightContext';

function App() {
  const { isConnected, isLoading } = useMidnight();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading Midnight...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"></div>
        <div className="absolute top-0 left-0 w-full h-full opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-500 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>
      </div>

      <Header />
      
      <main className="container mx-auto px-4 py-12 relative z-10">
        {!isConnected ? (
          <div className="text-center py-20">
            <div className="animate-fade-in-up">
              <div className="mb-8">
                <div className="text-8xl mb-6 animate-float">🌙</div>
                <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                  Midnight ZK Voting
                </h1>
                <p className="text-2xl mb-8 text-gray-300 max-w-2xl mx-auto leading-relaxed">
                  Privacy-preserving voting using zero-knowledge proofs
                </p>
              </div>
              
              <div className="glass-card max-w-md mx-auto p-8 animate-pulse-glow">
                <div className="text-6xl mb-4">🔒</div>
                <h3 className="text-xl font-semibold mb-4">Connect Your Wallet</h3>
                <p className="text-gray-400 mb-6">
                  Connect your Midnight wallet to participate in privacy-preserving governance
                </p>
                <div className="flex justify-center">
                  <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in-up">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/create" element={<CreateProposal />} />
              <Route path="/vote/:proposalId" element={<VotePage />} />
              <Route path="/results/:proposalId" element={<Results />} />
              <Route path="/verification" element={<VerificationPage />} />
              <Route path="/double-vote-demo" element={<DoubleVoteDemo />} />
            </Routes>
          </div>
        )}
      </main>
      
      <footer className="mt-20 py-12 border-t border-white/10 backdrop-blur-sm relative z-10">
        <div className="container mx-auto px-4 text-center">
          <div className="glass-card max-w-2xl mx-auto p-8">
            <div className="flex items-center justify-center space-x-4 mb-4">
              <span className="text-2xl">🌙</span>
              <span className="text-lg font-semibold">Midnight ZK Technology</span>
            </div>
            <p className="text-gray-400 mb-2">
              Built with zero-knowledge technology for complete privacy
            </p>
            <p className="text-sm text-gray-500">
              Your vote is private, but your participation is verified
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;