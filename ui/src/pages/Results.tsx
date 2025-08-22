import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMidnight } from '../contexts/MidnightContext';

interface ProposalResults {
  id: string;
  title: string;
  description: string;
  deadline: number;
  yesVotes: number;
  noVotes: number;
  totalWeight: number;
  active: boolean;
}

function Results() {
  const { proposalId } = useParams<{ proposalId: string }>();
  const navigate = useNavigate();
  const { contract } = useMidnight();
  
  const [results, setResults] = useState<ProposalResults | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResults();
  }, [proposalId, contract]);

  const loadResults = async () => {
    if (!proposalId || !contract) return;

    try {
      // Mock results data - in real implementation, fetch from contract
      const mockResults: ProposalResults = {
        id: proposalId,
        title: 'Zero-Knowledge Identity System',
        description: 'Implement a ZK-based identity verification system for platform access.',
        deadline: Date.now() - 1 * 24 * 60 * 60 * 1000, // 1 day ago
        yesVotes: 847,
        noVotes: 153,
        totalWeight: 1000,
        active: false
      };

      setResults(mockResults);
    } catch (error) {
      console.error('Failed to load results:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="text-xl">Loading results...</div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="text-center py-20">
        <h3 className="text-xl font-semibold mb-2">Results not found</h3>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
        >
          Back to Proposals
        </button>
      </div>
    );
  }

  const yesPercentage = Math.round((results.yesVotes / results.totalWeight) * 100);
  const noPercentage = Math.round((results.noVotes / results.totalWeight) * 100);
  const passed = results.yesVotes > results.noVotes;

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => navigate('/')}
        className="mb-6 text-purple-400 hover:text-purple-300 transition-colors"
      >
        ← Back to Proposals
      </button>

      <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold">{results.title}</h1>
            <div className={`px-4 py-2 rounded-full font-medium ${
              passed 
                ? 'bg-green-900 text-green-300' 
                : 'bg-red-900 text-red-300'
            }`}>
              {passed ? 'Passed' : 'Failed'}
            </div>
          </div>
          <p className="text-gray-300 text-lg leading-relaxed">{results.description}</p>
        </div>

        {/* Privacy Notice */}
        <div className="mb-8 p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-purple-400">🔒</span>
            <span className="font-medium">Privacy Preserved</span>
          </div>
          <p className="text-sm text-gray-300">
            These results were computed using zero-knowledge proofs. Individual votes remain 
            completely anonymous while maintaining verifiable integrity.
          </p>
        </div>

        {/* Results Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-700 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">
              {results.yesVotes}
            </div>
            <div className="text-gray-300">Yes Votes</div>
            <div className="text-2xl font-semibold text-green-400 mt-1">
              {yesPercentage}%
            </div>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-red-400 mb-2">
              {results.noVotes}
            </div>
            <div className="text-gray-300">No Votes</div>
            <div className="text-2xl font-semibold text-red-400 mt-1">
              {noPercentage}%
            </div>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">
              {results.totalWeight}
            </div>
            <div className="text-gray-300">Total Votes</div>
            <div className="text-sm text-gray-400 mt-1">
              100% Participation
            </div>
          </div>
        </div>

        {/* Visual Results */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Vote Distribution</h3>
          <div className="bg-gray-700 rounded-lg p-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-green-400">Yes ({yesPercentage}%)</span>
              <span className="text-red-400">No ({noPercentage}%)</span>
            </div>
            <div className="bg-gray-600 rounded-full h-6 overflow-hidden">
              <div 
                className="bg-green-500 h-full transition-all duration-1000 ease-out"
                style={{ width: `${yesPercentage}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span>{results.yesVotes} votes</span>
              <span>{results.noVotes} votes</span>
            </div>
          </div>
        </div>

        {/* Technical Details */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Technical Details</h3>
          <div className="bg-gray-700 rounded-lg p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Voting Method</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Zero-knowledge proof verification</li>
                  <li>• Anonymous vote casting</li>
                  <li>• Cryptographic nullifiers</li>
                  <li>• Merkle tree voter registry</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-3">Security Features</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Double-voting prevention</li>
                  <li>• Identity protection</li>
                  <li>• Verifiable results</li>
                  <li>• Tamper-proof counting</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Voting Timeline</h3>
          <div className="bg-gray-700 rounded-lg p-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Proposal Created</span>
                <span className="text-sm text-gray-400">
                  {new Date(results.deadline - 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Voting Ended</span>
                <span className="text-sm text-gray-400">
                  {new Date(results.deadline).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Results Published</span>
                <span className="text-sm text-gray-400">
                  {new Date(results.deadline).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
          >
            View All Proposals
          </button>
          <button
            onClick={() => navigate('/create')}
            className="px-6 py-3 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors"
          >
            Create New Proposal
          </button>
        </div>
      </div>
    </div>
  );
}

export default Results;