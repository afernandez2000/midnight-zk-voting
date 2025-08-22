import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Mock implementation for demo
interface VoteAttempt {
  proposalId: string;
  voterSecret: string;
  voteChoice: number;
  timestamp: number;
}

interface NullifierRecord {
  nullifier: string;
  proposalId: string;
  timestamp: number;
  blockNumber: number;
}

class DoubleVotePreventionSystem {
  private usedNullifiers: Map<string, NullifierRecord> = new Map();
  private nullifierHistory: NullifierRecord[] = [];

  generateNullifier(voterSecret: string, proposalId: string): string {
    const input = `${voterSecret}:${proposalId}:nullifier_salt`;
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return `nullifier_${Math.abs(hash).toString(16)}`;
  }

  attemptVote(voteAttempt: VoteAttempt) {
    const nullifier = this.generateNullifier(voteAttempt.voterSecret, voteAttempt.proposalId);
    const existingRecord = this.usedNullifiers.get(nullifier);
    
    if (existingRecord) {
      return {
        success: false,
        nullifier,
        reason: 'Double voting detected',
        previousVote: existingRecord
      };
    }

    const record: NullifierRecord = {
      nullifier,
      proposalId: voteAttempt.proposalId,
      timestamp: voteAttempt.timestamp,
      blockNumber: this.nullifierHistory.length + 1000
    };

    this.usedNullifiers.set(nullifier, record);
    this.nullifierHistory.push(record);

    return { success: true, nullifier };
  }

  getStats() {
    return {
      totalVotes: this.nullifierHistory.length,
      uniqueNullifiers: this.usedNullifiers.size
    };
  }

  reset() {
    this.usedNullifiers.clear();
    this.nullifierHistory = [];
  }

  getAllNullifiers() {
    return this.nullifierHistory;
  }
}

function DoubleVoteDemo() {
  const [preventionSystem] = useState(new DoubleVotePreventionSystem());
  const [selectedVoter, setSelectedVoter] = useState('alice_secret_123');
  const [selectedProposal, setSelectedProposal] = useState('proposal_1');
  const [selectedChoice, setSelectedChoice] = useState(1);
  const [voteHistory, setVoteHistory] = useState<any[]>([]);
  const [nullifiers, setNullifiers] = useState<NullifierRecord[]>([]);
  const [demoResults, setDemoResults] = useState<any>(null);

  const voters = [
    { id: 'alice_secret_123', name: 'Alice', color: 'text-purple-400' },
    { id: 'bob_secret_456', name: 'Bob', color: 'text-blue-400' },
    { id: 'carol_secret_789', name: 'Carol', color: 'text-green-400' },
    { id: 'dave_secret_101', name: 'Dave', color: 'text-yellow-400' }
  ];

  const proposals = [
    { id: 'proposal_1', name: 'Governance Proposal' },
    { id: 'proposal_2', name: 'Treasury Allocation' }
  ];

  const handleVoteAttempt = () => {
    const attempt: VoteAttempt = {
      proposalId: selectedProposal,
      voterSecret: selectedVoter,
      voteChoice: selectedChoice,
      timestamp: Date.now()
    };

    const result = preventionSystem.attemptVote(attempt);
    const voterName = voters.find(v => v.id === selectedVoter)?.name || 'Unknown';
    const proposalName = proposals.find(p => p.id === selectedProposal)?.name || 'Unknown';

    const historyEntry = {
      id: Date.now(),
      voterName,
      proposalName,
      choice: selectedChoice === 1 ? 'Yes' : 'No',
      result,
      timestamp: new Date().toLocaleTimeString()
    };

    setVoteHistory(prev => [historyEntry, ...prev]);
    setNullifiers(preventionSystem.getAllNullifiers());
  };

  const runAutomatedDemo = () => {
    preventionSystem.reset();
    setVoteHistory([]);
    
    const scenarios = [
      // Legitimate votes
      { voter: 'alice_secret_123', proposal: 'proposal_1', choice: 1, description: 'Alice votes Yes on Proposal 1' },
      { voter: 'bob_secret_456', proposal: 'proposal_1', choice: 0, description: 'Bob votes No on Proposal 1' },
      { voter: 'alice_secret_123', proposal: 'proposal_2', choice: 1, description: 'Alice votes Yes on Proposal 2 (allowed)' },
      
      // Double vote attempts
      { voter: 'alice_secret_123', proposal: 'proposal_1', choice: 0, description: 'Alice tries to vote again on Proposal 1 (BLOCKED)' },
      { voter: 'bob_secret_456', proposal: 'proposal_1', choice: 1, description: 'Bob tries to change vote on Proposal 1 (BLOCKED)' },
    ];

    const results = scenarios.map((scenario, index) => {
      setTimeout(() => {
        const attempt: VoteAttempt = {
          proposalId: scenario.proposal,
          voterSecret: scenario.voter,
          voteChoice: scenario.choice,
          timestamp: Date.now()
        };

        const result = preventionSystem.attemptVote(attempt);
        const voterName = voters.find(v => v.id === scenario.voter)?.name || 'Unknown';
        const proposalName = proposals.find(p => p.id === scenario.proposal)?.name || 'Unknown';

        const historyEntry = {
          id: Date.now() + index,
          voterName,
          proposalName,
          choice: scenario.choice === 1 ? 'Yes' : 'No',
          result,
          timestamp: new Date().toLocaleTimeString(),
          description: scenario.description
        };

        setVoteHistory(prev => [historyEntry, ...prev]);
        setNullifiers(preventionSystem.getAllNullifiers());
      }, index * 1000);
    });

    setDemoResults({
      totalScenarios: scenarios.length,
      legitimateVotes: 3,
      blockedAttempts: 2
    });
  };

  const resetDemo = () => {
    preventionSystem.reset();
    setVoteHistory([]);
    setNullifiers([]);
    setDemoResults(null);
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="animate-fade-in-up">
          <div className="text-6xl mb-6 animate-float">🚫</div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-red-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
            Double Vote Prevention
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Demonstrating how cryptographic nullifiers prevent double voting while maintaining voter anonymity
          </p>
        </div>
      </div>

      {/* How It Works */}
      <div className="card mb-8 animate-fade-in-up">
        <h2 className="text-3xl font-bold mb-6 text-center">🔐 How Nullifiers Prevent Double Voting</h2>
        
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="floating-card text-center">
            <div className="text-4xl mb-4">🔑</div>
            <h3 className="text-xl font-bold mb-3 text-purple-400">1. Generate Nullifier</h3>
            <p className="text-gray-400 text-sm">
              nullifier = hash(voterSecret + proposalId)
            </p>
          </div>
          
          <div className="floating-card text-center">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-xl font-bold mb-3 text-blue-400">2. Check Registry</h3>
            <p className="text-gray-400 text-sm">
              Has this nullifier been used before?
            </p>
          </div>
          
          <div className="floating-card text-center">
            <div className="text-4xl mb-4">✅</div>
            <h3 className="text-xl font-bold mb-3 text-green-400">3. Accept or Reject</h3>
            <p className="text-gray-400 text-sm">
              New nullifier = accept, Used nullifier = reject
            </p>
          </div>
        </div>

        <div className="glass-card p-6 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30">
          <h4 className="text-lg font-bold mb-3 text-purple-300">🔒 Privacy Guarantee</h4>
          <p className="text-gray-300">
            The nullifier reveals <strong>that</strong> someone voted, but not <strong>who</strong> voted. 
            Same voter + same proposal = same nullifier, preventing double votes while preserving anonymity.
          </p>
        </div>
      </div>

      {/* Interactive Demo */}
      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {/* Manual Voting */}
        <div className="card">
          <h3 className="text-2xl font-bold mb-6 flex items-center">
            <span className="mr-3">🎮</span>
            Interactive Demo
          </h3>
          
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">Select Voter:</label>
              <select
                value={selectedVoter}
                onChange={(e) => setSelectedVoter(e.target.value)}
                className="input"
              >
                {voters.map(voter => (
                  <option key={voter.id} value={voter.id}>{voter.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Select Proposal:</label>
              <select
                value={selectedProposal}
                onChange={(e) => setSelectedProposal(e.target.value)}
                className="input"
              >
                {proposals.map(proposal => (
                  <option key={proposal.id} value={proposal.id}>{proposal.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Vote Choice:</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setSelectedChoice(1)}
                  className={`p-4 rounded-xl transition-all ${
                    selectedChoice === 1 
                      ? 'bg-green-500/20 border-2 border-green-500 text-green-300' 
                      : 'glass-card hover:bg-white/10'
                  }`}
                >
                  ✅ Yes
                </button>
                <button
                  onClick={() => setSelectedChoice(0)}
                  className={`p-4 rounded-xl transition-all ${
                    selectedChoice === 0 
                      ? 'bg-red-500/20 border-2 border-red-500 text-red-300' 
                      : 'glass-card hover:bg-white/10'
                  }`}
                >
                  ❌ No
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button onClick={handleVoteAttempt} className="btn-primary flex-1">
              Attempt Vote
            </button>
            <button onClick={resetDemo} className="btn-secondary">
              Reset
            </button>
          </div>
        </div>

        {/* Automated Demo */}
        <div className="card">
          <h3 className="text-2xl font-bold mb-6 flex items-center">
            <span className="mr-3">🤖</span>
            Automated Demo
          </h3>
          
          <p className="text-gray-400 mb-6">
            Run a sequence of vote attempts to see double vote prevention in action:
          </p>
          
          <div className="space-y-4 mb-6">
            <div className="glass-card p-4">
              <div className="text-sm text-gray-400 mb-2">Demo Sequence:</div>
              <ul className="text-sm space-y-1">
                <li>✅ Alice votes Yes on Proposal 1</li>
                <li>✅ Bob votes No on Proposal 1</li>
                <li>✅ Alice votes Yes on Proposal 2</li>
                <li>🚫 Alice tries to vote again on Proposal 1</li>
                <li>🚫 Bob tries to change vote on Proposal 1</li>
              </ul>
            </div>
          </div>
          
          <button onClick={runAutomatedDemo} className="btn-primary w-full">
            <span className="mr-2">▶️</span>
            Run Automated Demo
          </button>
          
          {demoResults && (
            <div className="mt-6 grid grid-cols-3 gap-3">
              <div className="text-center glass-card p-3">
                <div className="text-lg font-bold text-green-400">{demoResults.legitimateVotes}</div>
                <div className="text-xs text-gray-400">Allowed</div>
              </div>
              <div className="text-center glass-card p-3">
                <div className="text-lg font-bold text-red-400">{demoResults.blockedAttempts}</div>
                <div className="text-xs text-gray-400">Blocked</div>
              </div>
              <div className="text-center glass-card p-3">
                <div className="text-lg font-bold text-purple-400">100%</div>
                <div className="text-xs text-gray-400">Protected</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Vote History */}
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="card">
          <h3 className="text-2xl font-bold mb-6 flex items-center">
            <span className="mr-3">📜</span>
            Vote Attempt History
          </h3>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {voteHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No vote attempts yet. Try the demos above!
              </div>
            ) : (
              voteHistory.map((entry) => (
                <div key={entry.id} className={`glass-card p-4 ${
                  entry.result.success ? 'border-green-500/30' : 'border-red-500/30'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className={entry.result.success ? 'text-green-400' : 'text-red-400'}>
                        {entry.result.success ? '✅' : '🚫'}
                      </span>
                      <span className="font-medium">{entry.voterName}</span>
                      <span className="text-gray-400">voted {entry.choice}</span>
                    </div>
                    <span className="text-xs text-gray-500">{entry.timestamp}</span>
                  </div>
                  
                  <div className="text-sm text-gray-400 mb-2">
                    Proposal: {entry.proposalName}
                  </div>
                  
                  {entry.description && (
                    <div className="text-sm text-purple-300 mb-2">
                      {entry.description}
                    </div>
                  )}
                  
                  <div className="text-xs font-mono bg-black/20 p-2 rounded">
                    Nullifier: {entry.result.nullifier?.substring(0, 32)}...
                  </div>
                  
                  {!entry.result.success && (
                    <div className="text-xs text-red-400 mt-2">
                      ⚠️ {entry.result.reason}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Nullifier Registry */}
        <div className="card">
          <h3 className="text-2xl font-bold mb-6 flex items-center">
            <span className="mr-3">🔑</span>
            Public Nullifier Registry
          </h3>
          
          <p className="text-gray-400 mb-4 text-sm">
            These nullifiers are publicly visible but don't reveal voter identities:
          </p>
          
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {nullifiers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No nullifiers recorded yet
              </div>
            ) : (
              nullifiers.map((record, index) => (
                <div key={index} className="glass-card p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400">Block #{record.blockNumber}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(record.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text-xs font-mono bg-black/20 p-2 rounded mb-2">
                    {record.nullifier}
                  </div>
                  <div className="text-xs text-gray-400">
                    Proposal: {proposals.find(p => p.id === record.proposalId)?.name}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Back Navigation */}
      <div className="mt-12 text-center">
        <Link to="/verification" className="btn-secondary">
          ← Back to Verification
        </Link>
      </div>
    </div>
  );
}

export default DoubleVoteDemo;