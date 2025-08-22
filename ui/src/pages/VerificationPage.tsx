import React, { useState, useEffect } from 'react';

// Mock implementations for demo purposes
class VoterRegistry {
  static createDemoRegistry() {
    return new VoterRegistry();
  }
  
  getRegistryStats() {
    return {
      totalEligibleVoters: 1000,
      merkleRoot: 'a7f8d3e2c1b9876543210fedcba9876543210abcdef1234567890',
      lastUpdated: Date.now() - 3600000
    };
  }
  
  addEligibleVoter(secret: string, proof: string) {
    return {
      voterSecret: secret,
      voterIndex: Math.floor(Math.random() * 1000),
      merkleProof: Array(10).fill(0).map(() => Math.random().toString(36).substr(2, 16)),
      merkleIndices: Array(10).fill(0).map(() => Math.round(Math.random()))
    };
  }
  
  verifyVoterEligibility() {
    return true; // Always pass for demo
  }
}

class ParticipationTracker {
  private participationLog: Array<{nullifier: string, proposalId: string, timestamp: number}> = [];
  
  recordParticipation(nullifier: string, proposalId: string) {
    this.participationLog.push({
      nullifier,
      proposalId,
      timestamp: Date.now()
    });
    return true;
  }
  
  getParticipationStats(proposalId: string) {
    // Generate demo nullifiers
    const nullifiers = Array(847).fill(0).map((_, i) => 
      `nullifier_${proposalId}_${i}_${Math.random().toString(36).substr(2, 16)}`
    );
    
    return {
      totalParticipants: 847,
      participationRate: 84.7,
      nullifiers,
      timestamps: nullifiers.map(() => Date.now() - Math.random() * 86400000)
    };
  }
}

function VerificationPage() {
  const [registry, setRegistry] = useState<VoterRegistry | null>(null);
  const [tracker, setTracker] = useState<ParticipationTracker | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [selectedProposal, setSelectedProposal] = useState('1');
  const [verificationDemo, setVerificationDemo] = useState<any>(null);

  useEffect(() => {
    // Initialize demo registry and tracker
    const demoRegistry = VoterRegistry.createDemoRegistry();
    const demoTracker = new ParticipationTracker();
    
    // Simulate some votes
    for (let i = 0; i < 847; i++) {
      const nullifier = `nullifier_${i}_${Math.random().toString(36).substr(2, 9)}`;
      demoTracker.recordParticipation(nullifier, '1');
    }
    
    setRegistry(demoRegistry);
    setTracker(demoTracker);
    setStats(demoRegistry.getRegistryStats());
  }, []);

  const runVerificationDemo = () => {
    if (!registry || !tracker) return;

    // Demo: Verify a voter can participate
    const voterCredentials = registry.addEligibleVoter(
      'demo_voter_secret_123',
      'eligibility_proof_demo'
    );

    // Verify their eligibility
    const isEligible = registry.verifyVoterEligibility(
      voterCredentials.voterSecret,
      voterCredentials.merkleProof,
      voterCredentials.merkleIndices
    );

    // Generate nullifier for their vote
    const nullifier = `demo_nullifier_${Date.now()}`;
    const canVote = tracker.recordParticipation(nullifier, selectedProposal);

    setVerificationDemo({
      voterCredentials,
      isEligible,
      canVote,
      nullifier,
      merkleProofLength: voterCredentials.merkleProof.length
    });
  };

  const participationStats = tracker ? tracker.getParticipationStats(selectedProposal) : null;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">🔍 Participation Verification</h1>
        <p className="text-gray-300">
          Demonstrating how participation is verified in zero-knowledge voting without revealing voter identity
        </p>
      </div>

      {/* Voter Registry Stats */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold mb-2 text-blue-400">Eligible Voters</h3>
          <div className="text-3xl font-bold mb-2">{stats?.totalEligibleVoters || 0}</div>
          <p className="text-sm text-gray-400">Registered in Merkle tree</p>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold mb-2 text-green-400">Participants</h3>
          <div className="text-3xl font-bold mb-2">{participationStats?.totalParticipants || 0}</div>
          <p className="text-sm text-gray-400">Verified votes cast</p>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold mb-2 text-purple-400">Participation Rate</h3>
          <div className="text-3xl font-bold mb-2">
            {stats?.totalEligibleVoters ? 
              Math.round((participationStats?.totalParticipants || 0) / stats.totalEligibleVoters * 100) : 0}%
          </div>
          <p className="text-sm text-gray-400">Of eligible voters</p>
        </div>
      </div>

      {/* How Verification Works */}
      <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 mb-8">
        <h2 className="text-2xl font-bold mb-6">How Participation Verification Works</h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold mb-4 text-blue-400">🌳 Eligibility Verification</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-3">
                <span className="text-blue-400 font-mono">1.</span>
                <div>
                  <strong>Merkle Tree Registry:</strong> All eligible voters are added to a cryptographic Merkle tree
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-blue-400 font-mono">2.</span>
                <div>
                  <strong>ZK Proof of Membership:</strong> Voters prove they're in the tree without revealing their position
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-blue-400 font-mono">3.</span>
                <div>
                  <strong>Privacy Preserved:</strong> System knows "you can vote" but not "who you are"
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-4 text-green-400">🔒 Participation Tracking</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-3">
                <span className="text-green-400 font-mono">1.</span>
                <div>
                  <strong>Unique Nullifiers:</strong> Each vote generates a unique, unlinkable identifier
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-green-400 font-mono">2.</span>
                <div>
                  <strong>Public Verification:</strong> Nullifiers are published to prove votes were cast
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-green-400 font-mono">3.</span>
                <div>
                  <strong>Double-Vote Prevention:</strong> Same nullifier cannot be used twice
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Demo */}
      <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 mb-8">
        <h2 className="text-2xl font-bold mb-6">🧪 Interactive Verification Demo</h2>
        
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Select Proposal to Verify:</label>
          <select
            value={selectedProposal}
            onChange={(e) => setSelectedProposal(e.target.value)}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
          >
            <option value="1">Proposal 1: Privacy-First Governance</option>
            <option value="2">Proposal 2: Treasury Allocation</option>
            <option value="3">Proposal 3: Identity System</option>
          </select>
        </div>

        <button
          onClick={runVerificationDemo}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors font-medium mb-6"
        >
          Run Verification Demo
        </button>

        {verificationDemo && (
          <div className="bg-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Demo Results:</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2 text-blue-400">Eligibility Check</h4>
                <div className="space-y-2 text-sm">
                  <div>✅ Voter in registry: <span className="text-green-400">Verified</span></div>
                  <div>✅ Merkle proof valid: <span className="text-green-400">{verificationDemo.isEligible ? 'Yes' : 'No'}</span></div>
                  <div>📊 Proof size: {verificationDemo.merkleProofLength} elements</div>
                  <div>🔒 Identity revealed: <span className="text-red-400">No</span></div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2 text-green-400">Participation Record</h4>
                <div className="space-y-2 text-sm">
                  <div>✅ Vote recorded: <span className="text-green-400">{verificationDemo.canVote ? 'Yes' : 'Already voted'}</span></div>
                  <div>🔑 Nullifier: <code className="text-xs bg-gray-600 px-2 py-1 rounded">{verificationDemo.nullifier.substr(0, 20)}...</code></div>
                  <div>🚫 Double voting: <span className="text-red-400">Prevented</span></div>
                  <div>👤 Voter identity: <span className="text-red-400">Unknown</span></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Merkle Tree Visualization */}
      <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 mb-8">
        <h2 className="text-2xl font-bold mb-6">🌳 Merkle Tree Registry</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Registry Details</h3>
            <div className="space-y-2 text-sm">
              <div>Root Hash: <code className="text-xs bg-gray-700 px-2 py-1 rounded">{stats?.merkleRoot?.substr(0, 32)}...</code></div>
              <div>Total Leaves: {stats?.totalEligibleVoters}</div>
              <div>Tree Depth: ~{Math.ceil(Math.log2(stats?.totalEligibleVoters || 1))}</div>
              <div>Last Updated: {stats?.lastUpdated ? new Date(stats.lastUpdated).toLocaleString() : 'N/A'}</div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Privacy Guarantees</h3>
            <div className="space-y-2 text-sm text-gray-300">
              <div>• Voter positions in tree are not revealed</div>
              <div>• Merkle proofs don't disclose identity</div>
              <div>• Only eligibility is verified, not identity</div>
              <div>• Root hash publicly verifiable</div>
            </div>
          </div>
        </div>
      </div>

      {/* Double Vote Prevention Link */}
      <div className="text-center mb-8">
        <a
          href="/double-vote-demo"
          className="btn-primary group inline-flex items-center"
        >
          <span className="text-2xl mr-3 group-hover:scale-110 transition-transform">🚫</span>
          See Double Vote Prevention Demo
          <span className="ml-3 group-hover:translate-x-1 transition-transform">→</span>
        </a>
      </div>

      {/* Nullifier List */}
      <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
        <h2 className="text-2xl font-bold mb-6">🔑 Participation Nullifiers</h2>
        <p className="text-gray-300 mb-4">
          These nullifiers prove votes were cast without revealing who cast them:
        </p>
        
        <div className="bg-gray-700 rounded-lg p-4 max-h-64 overflow-y-auto">
          <div className="grid gap-2 text-xs font-mono">
            {participationStats?.nullifiers.slice(0, 20).map((nullifier: string, index: number) => (
              <div key={index} className="flex justify-between items-center py-1 border-b border-gray-600">
                <span>{nullifier}</span>
                <span className="text-green-400">✓ Verified</span>
              </div>
            ))}
            {(participationStats?.nullifiers.length || 0) > 20 && (
              <div className="text-center text-gray-400 pt-2">
                ... and {(participationStats?.nullifiers.length || 0) - 20} more
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerificationPage;