import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMidnight } from '../contexts/MidnightContext';
import { nullifierService } from '../services/nullifierService';

interface Proposal {
  id: string;
  title: string;
  description: string;
  deadline: number;
  active: boolean;
}

function VotePage() {
  const { proposalId } = useParams<{ proposalId: string }>();
  const navigate = useNavigate();
  const { contract, generateVoteProof } = useMidnight();
  
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [showPrivacyInfo, setShowPrivacyInfo] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // New state for duplicate vote detection
  const [voterSecret, setVoterSecret] = useState('current_user_secret_123'); // In real app, from wallet
  const [voteStatus, setVoteStatus] = useState<any>(null);
  const [isCheckingEligibility, setIsCheckingEligibility] = useState(false);
  
  // For testing different scenarios
  const [showTestControls, setShowTestControls] = useState(false);

  useEffect(() => {
    loadProposal();
  }, [proposalId, contract]);

  // Check vote eligibility when proposal loads or voter changes
  useEffect(() => {
    if (proposal && proposalId) {
      checkVoteEligibility();
    }
  }, [proposal, proposalId, voterSecret]);

  const checkVoteEligibility = async () => {
    if (!proposalId) return;
    
    setIsCheckingEligibility(true);
    try {
      // Simulate checking eligibility
      await new Promise(resolve => setTimeout(resolve, 500));
      const status = nullifierService.getVoteStatus(voterSecret, proposalId);
      setVoteStatus(status);
    } catch (error) {
      console.error('Failed to check vote eligibility:', error);
    } finally {
      setIsCheckingEligibility(false);
    }
  };

  const loadProposal = async () => {
    if (!proposalId || !contract) return;

    try {
      // Mock proposal data - in real implementation, fetch from contract
      const mockProposal: Proposal = {
        id: proposalId,
        title: 'Implement Privacy-First Governance',
        description: 'Should we adopt privacy-preserving voting mechanisms for all future governance decisions? This proposal aims to enhance user privacy while maintaining the integrity and transparency of our voting process.',
        deadline: Date.now() + 7 * 24 * 60 * 60 * 1000,
        active: true
      };

      setProposal(mockProposal);
    } catch (error) {
      console.error('Failed to load proposal:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async () => {
    if (!proposal || selectedChoice === null || !contract || !proposalId) return;

    // Check for duplicate vote before proceeding
    const eligibilityCheck = nullifierService.checkVoteEligibility(voterSecret, proposalId);
    if (!eligibilityCheck.canVote) {
      alert(`Cannot vote: ${eligibilityCheck.reason}`);
      return;
    }

    setIsVoting(true);
    try {
      // Generate zero-knowledge proof
      const zkProof = await generateVoteProof({
        proposalId: proposal.id,
        choice: selectedChoice,
        voterSecret,
        nullifier: eligibilityCheck.nullifier
      });

      // Record the vote (in real system, this would be done by smart contract)
      const voteResult = nullifierService.recordVote(voterSecret, proposalId);
      
      if (!voteResult.canVote) {
        throw new Error(voteResult.reason || 'Vote was rejected');
      }

      // Simulate transaction delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update vote status
      setVoteStatus(nullifierService.getVoteStatus(voterSecret, proposalId));

      alert('Vote submitted successfully! Your privacy has been preserved.');
      navigate('/');
    } catch (error) {
      console.error('Failed to submit vote:', error);
      alert('Failed to submit vote. Please try again.');
    } finally {
      setIsVoting(false);
    }
  };

  const formatTimeRemaining = (deadline: number) => {
    const now = Date.now();
    const diff = deadline - now;
    
    if (diff <= 0) return 'Voting ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} days ${hours} hours remaining`;
    return `${hours} hours remaining`;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="text-xl">Loading proposal...</div>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="text-center py-20">
        <h3 className="text-xl font-semibold mb-2">Proposal not found</h3>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
        >
          Back to Proposals
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => navigate('/')}
        className="mb-8 btn-ghost group"
      >
        <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span>
        Back to Proposals
      </button>

      <div className="card animate-fade-in-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4 animate-float">🗳️</div>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            {proposal.title}
          </h1>
          <p className="text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto">{proposal.description}</p>
        </div>

        {/* Deadline Info */}
        <div className="glass-card p-6 mb-8 text-center">
          <div className="flex items-center justify-center space-x-4">
            <span className="text-3xl">⏰</span>
            <div>
              <div className="text-sm text-gray-400 mb-1">Voting deadline</div>
              <div className="text-xl font-bold">{formatTimeRemaining(proposal.deadline)}</div>
            </div>
          </div>
        </div>

        {/* Test Controls (Demo Purpose) */}
        <div className="mb-6">
          <button
            onClick={() => setShowTestControls(!showTestControls)}
            className="btn-ghost text-sm"
          >
            🧪 {showTestControls ? 'Hide' : 'Show'} Test Controls
          </button>
          
          {showTestControls && (
            <div className="mt-4 glass-card p-4">
              <h4 className="font-bold mb-3">Test Different Voter Scenarios:</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <button
                  onClick={() => setVoterSecret('new_voter_123')}
                  className={`p-2 rounded text-sm transition-all ${
                    voterSecret === 'new_voter_123' 
                      ? 'bg-green-500/20 border border-green-500' 
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  New Voter
                </button>
                <button
                  onClick={() => setVoterSecret('demo_voter_alice')}
                  className={`p-2 rounded text-sm transition-all ${
                    voterSecret === 'demo_voter_alice' 
                      ? 'bg-red-500/20 border border-red-500' 
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  Alice (Voted)
                </button>
                <button
                  onClick={() => setVoterSecret('demo_voter_bob')}
                  className={`p-2 rounded text-sm transition-all ${
                    voterSecret === 'demo_voter_bob' 
                      ? 'bg-red-500/20 border border-red-500' 
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  Bob (Voted)
                </button>
                <button
                  onClick={() => setVoterSecret('current_user_secret_123')}
                  className={`p-2 rounded text-sm transition-all ${
                    voterSecret === 'current_user_secret_123' 
                      ? 'bg-blue-500/20 border border-blue-500' 
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  Default User
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Switch between different voters to see how double vote prevention works
              </p>
            </div>
          )}
        </div>

        {/* Vote Eligibility Status */}
        <div className="mb-8">
          {isCheckingEligibility ? (
            <div className="glass-card p-6 text-center">
              <div className="flex items-center justify-center space-x-3">
                <div className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-gray-400">Checking vote eligibility...</span>
              </div>
            </div>
          ) : voteStatus ? (
            <div className={`glass-card p-6 border-2 ${
              voteStatus.status === 'can-vote' 
                ? 'border-green-500/50 bg-green-500/10' 
                : 'border-red-500/50 bg-red-500/10'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-4xl">
                    {voteStatus.status === 'can-vote' ? '✅' : '🚫'}
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold ${
                      voteStatus.status === 'can-vote' ? 'text-green-300' : 'text-red-300'
                    }`}>
                      {voteStatus.message}
                    </h3>
                    <p className="text-gray-400 text-sm mt-1">
                      {voteStatus.status === 'can-vote' 
                        ? 'This will be your first vote on this proposal'
                        : `You voted ${voteStatus.details?.timeAgo || 'previously'}`
                      }
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-xs text-gray-500 mb-1">Your Nullifier:</div>
                  <div className="font-mono text-xs bg-black/30 px-3 py-1 rounded">
                    {voteStatus.details?.nullifier.substring(0, 16)}...
                  </div>
                </div>
              </div>
              
              {voteStatus.status === 'already-voted' && (
                <div className="mt-4 p-4 bg-black/20 rounded-lg">
                  <h4 className="text-sm font-medium text-red-300 mb-2">🔒 Double Vote Prevention Active</h4>
                  <p className="text-xs text-gray-400">
                    Your vote was recorded using nullifier-based cryptography. The same nullifier cannot be used twice, 
                    ensuring one vote per person while maintaining your privacy.
                  </p>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Privacy Information */}
        <div className="glass-card p-6 mb-8 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <span className="text-3xl">🔒</span>
              <div>
                <h3 className="text-xl font-bold text-purple-300">Privacy Protected</h3>
                <p className="text-sm text-gray-400">Zero-knowledge voting ensures complete anonymity</p>
              </div>
            </div>
            <button
              onClick={() => setShowPrivacyInfo(!showPrivacyInfo)}
              className="btn-secondary text-sm group"
            >
              {showPrivacyInfo ? 'Hide Details' : 'How it works'}
              <span className="ml-2 group-hover:rotate-180 transition-transform">ℹ️</span>
            </button>
          </div>
          
          {showPrivacyInfo && (
            <div className="mt-6 space-y-3 animate-fade-in-up">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="glass-card p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <span>🔐</span>
                    <span className="font-medium">Encrypted Votes</span>
                  </div>
                  <p className="text-sm text-gray-400">Your vote choice is encrypted using zero-knowledge proofs</p>
                </div>
                
                <div className="glass-card p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <span>👤</span>
                    <span className="font-medium">Anonymous Identity</span>
                  </div>
                  <p className="text-sm text-gray-400">Your identity remains completely anonymous</p>
                </div>
                
                <div className="glass-card p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <span>✅</span>
                    <span className="font-medium">Verified Eligibility</span>
                  </div>
                  <p className="text-sm text-gray-400">System verifies you're eligible without revealing who you are</p>
                </div>
                
                <div className="glass-card p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <span>🚫</span>
                    <span className="font-medium">Double-Vote Prevention</span>
                  </div>
                  <p className="text-sm text-gray-400">Cryptographic nullifiers prevent multiple votes</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Voting Options */}
        <div className="mb-8">
          <h3 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-green-400 to-red-400 bg-clip-text text-transparent">
            Cast Your Vote
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <label className={`floating-card cursor-pointer group ${
              selectedChoice === 1 ? 'ring-2 ring-green-500 bg-green-500/10' : ''
            }`}>
              <input
                type="radio"
                name="vote"
                value={1}
                checked={selectedChoice === 1}
                onChange={() => setSelectedChoice(1)}
                className="sr-only"
              />
              <div className="text-center">
                <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">✅</div>
                <h4 className="text-2xl font-bold text-green-400 mb-2">Yes</h4>
                <p className="text-gray-400">Support this proposal</p>
                {selectedChoice === 1 && (
                  <div className="mt-4 px-4 py-2 bg-green-500/20 border border-green-500/40 rounded-full">
                    <span className="text-green-300 font-medium">Selected</span>
                  </div>
                )}
              </div>
            </label>
            
            <label className={`floating-card cursor-pointer group ${
              selectedChoice === 0 ? 'ring-2 ring-red-500 bg-red-500/10' : ''
            }`}>
              <input
                type="radio"
                name="vote"
                value={0}
                checked={selectedChoice === 0}
                onChange={() => setSelectedChoice(0)}
                className="sr-only"
              />
              <div className="text-center">
                <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">❌</div>
                <h4 className="text-2xl font-bold text-red-400 mb-2">No</h4>
                <p className="text-gray-400">Reject this proposal</p>
                {selectedChoice === 0 && (
                  <div className="mt-4 px-4 py-2 bg-red-500/20 border border-red-500/40 rounded-full">
                    <span className="text-red-300 font-medium">Selected</span>
                  </div>
                )}
              </div>
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="text-center">
          <button
            onClick={handleVote}
            disabled={
              selectedChoice === null || 
              isVoting || 
              !proposal.active || 
              (voteStatus && voteStatus.status === 'already-voted')
            }
            className={`relative px-12 py-6 rounded-2xl font-bold text-xl transition-all duration-300 ${
              selectedChoice !== null && 
              proposal.active && 
              !isVoting && 
              voteStatus?.status === 'can-vote'
                ? 'btn-primary text-2xl animate-pulse-glow'
                : 'bg-gray-600/50 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isVoting ? (
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Generating ZK Proof...</span>
                <div className="text-2xl animate-pulse">🔐</div>
              </div>
            ) : !proposal.active ? (
              <div className="flex items-center space-x-2">
                <span>⏹️</span>
                <span>Voting Ended</span>
              </div>
            ) : voteStatus?.status === 'already-voted' ? (
              <div className="flex items-center space-x-2">
                <span>🚫</span>
                <span>Already Voted</span>
              </div>
            ) : selectedChoice === null ? (
              <div className="flex items-center space-x-2">
                <span>🤔</span>
                <span>Select an option to vote</span>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🗳️</span>
                <span>Submit Anonymous Vote</span>
                <span className="text-2xl">🔒</span>
              </div>
            )}
          </button>

          {selectedChoice !== null && !isVoting && (
            <div className="mt-6 glass-card p-4 max-w-md mx-auto animate-fade-in-up">
              <div className="flex items-center justify-center space-x-3">
                <span className="text-2xl">
                  {selectedChoice === 1 ? '✅' : '❌'}
                </span>
                <div>
                  <div className="text-sm text-gray-400">Your choice:</div>
                  <div className="text-lg font-bold">
                    {selectedChoice === 1 ? 'Yes - Support' : 'No - Reject'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default VotePage;