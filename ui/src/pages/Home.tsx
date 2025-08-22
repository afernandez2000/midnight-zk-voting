import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useMidnight } from '../contexts/MidnightContext';

interface Proposal {
  id: string;
  title: string;
  description: string;
  deadline: number;
  active: boolean;
  yesVotes: number;
  noVotes: number;
  totalWeight: number;
}

function Home() {
  const { contract } = useMidnight();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProposals();
  }, [contract]);

  const loadProposals = async () => {
    if (!contract) return;

    try {
      // Mock proposals for demonstration
      const mockProposals: Proposal[] = [
        {
          id: '1',
          title: 'Implement Privacy-First Governance',
          description: 'Should we adopt privacy-preserving voting mechanisms for all future governance decisions?',
          deadline: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days from now
          active: true,
          yesVotes: 0,
          noVotes: 0,
          totalWeight: 0
        },
        {
          id: '2',
          title: 'Community Treasury Allocation',
          description: 'Allocate 10% of treasury funds to privacy research and development initiatives.',
          deadline: Date.now() + 5 * 24 * 60 * 60 * 1000, // 5 days from now
          active: true,
          yesVotes: 0,
          noVotes: 0,
          totalWeight: 0
        },
        {
          id: '3',
          title: 'Zero-Knowledge Identity System',
          description: 'Implement a ZK-based identity verification system for platform access.',
          deadline: Date.now() - 1 * 24 * 60 * 60 * 1000, // 1 day ago (completed)
          active: false,
          yesVotes: 847,
          noVotes: 153,
          totalWeight: 1000
        }
      ];

      setProposals(mockProposals);
    } catch (error) {
      console.error('Failed to load proposals:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeRemaining = (deadline: number) => {
    const now = Date.now();
    const diff = deadline - now;
    
    if (diff <= 0) return 'Voting ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h remaining`;
    return `${hours}h remaining`;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="text-xl">Loading proposals...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="animate-fade-in-up">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            Governance Proposals
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Participate in privacy-preserving governance. Your voice matters, your identity stays secret.
          </p>
          <Link
            to="/create"
            className="btn-primary inline-flex items-center group"
          >
            <span className="text-2xl mr-3 group-hover:rotate-12 transition-transform">✨</span>
            Create New Proposal
            <span className="ml-3 group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className="stat-card animate-fade-in-up animate-delay-100">
          <div className="text-4xl mb-3">🗳️</div>
          <div className="text-3xl font-bold text-purple-400 mb-2">{proposals.length}</div>
          <div className="text-gray-400">Total Proposals</div>
        </div>
        <div className="stat-card animate-fade-in-up animate-delay-200">
          <div className="text-4xl mb-3">🔒</div>
          <div className="text-3xl font-bold text-green-400 mb-2">100%</div>
          <div className="text-gray-400">Privacy Protected</div>
        </div>
        <div className="stat-card animate-fade-in-up animate-delay-300">
          <div className="text-4xl mb-3">⚡</div>
          <div className="text-3xl font-bold text-blue-400 mb-2">
            {proposals.filter(p => p.active).length}
          </div>
          <div className="text-gray-400">Active Votes</div>
        </div>
      </div>

      {/* Proposals Grid */}
      <div className="space-y-6">
        {proposals.map((proposal, index) => (
          <div
            key={proposal.id}
            className={`card-hover animate-fade-in-up animate-delay-${(index + 1) * 100}`}
          >
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="text-2xl">
                    {proposal.active ? '🗳️' : '📊'}
                  </div>
                  <h3 className="text-2xl font-bold text-white">{proposal.title}</h3>
                </div>
                <p className="text-gray-300 text-lg leading-relaxed mb-6">{proposal.description}</p>
                
                {/* Privacy Badge */}
                <div className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full mb-4">
                  <span className="text-purple-400">🔒</span>
                  <span className="text-sm font-medium text-purple-300">Zero-Knowledge Voting</span>
                </div>
              </div>
              
              <div className="ml-6 text-right">
                <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
                  proposal.active 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg' 
                    : 'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
                }`}>
                  {proposal.active ? '🟢 Active' : '⏹️ Completed'}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center mb-6">
              <div className="flex space-x-8 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">⏰</span>
                  <span className="text-gray-400">{formatTimeRemaining(proposal.deadline)}</span>
                </div>
                {!proposal.active && (
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">👥</span>
                    <span className="text-gray-400">{proposal.totalWeight} votes cast</span>
                  </div>
                )}
              </div>

              <div className="flex space-x-4">
                {proposal.active ? (
                  <Link
                    to={`/vote/${proposal.id}`}
                    className="btn-primary group"
                  >
                    <span className="text-xl mr-2 group-hover:scale-110 transition-transform">🗳️</span>
                    Vote Privately
                    <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                ) : (
                  <Link
                    to={`/results/${proposal.id}`}
                    className="btn-secondary group"
                  >
                    <span className="text-xl mr-2 group-hover:scale-110 transition-transform">📊</span>
                    View Results
                  </Link>
                )}
              </div>
            </div>

            {/* Results Preview for Completed Proposals */}
            {!proposal.active && (
              <div className="pt-6 border-t border-white/10">
                <div className="grid md:grid-cols-2 gap-6 mb-4">
                  <div className="glass-card p-4 text-center">
                    <div className="text-2xl mb-2">✅</div>
                    <div className="text-2xl font-bold text-green-400 mb-1">
                      {proposal.yesVotes}
                    </div>
                    <div className="text-sm text-gray-400">
                      Yes ({Math.round(proposal.yesVotes / proposal.totalWeight * 100)}%)
                    </div>
                  </div>
                  
                  <div className="glass-card p-4 text-center">
                    <div className="text-2xl mb-2">❌</div>
                    <div className="text-2xl font-bold text-red-400 mb-1">
                      {proposal.noVotes}
                    </div>
                    <div className="text-sm text-gray-400">
                      No ({Math.round(proposal.noVotes / proposal.totalWeight * 100)}%)
                    </div>
                  </div>
                </div>
                
                <div className="relative bg-white/5 rounded-full h-3 overflow-hidden">
                  <div 
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-1000 ease-out"
                    style={{ width: `${proposal.yesVotes / proposal.totalWeight * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {proposals.length === 0 && (
        <div className="text-center py-20">
          <div className="animate-fade-in-up">
            <div className="text-8xl mb-8 animate-float">📝</div>
            <h3 className="text-3xl font-bold mb-4 text-white">No proposals yet</h3>
            <p className="text-xl text-gray-400 mb-8 max-w-lg mx-auto">
              Be the first to create a privacy-preserving voting proposal and shape the future of governance
            </p>
            <Link
              to="/create"
              className="btn-primary group"
            >
              <span className="text-2xl mr-3 group-hover:rotate-12 transition-transform">✨</span>
              Create First Proposal
              <span className="ml-3 group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;