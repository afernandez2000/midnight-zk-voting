// Double Vote Prevention System using Cryptographic Nullifiers

import * as CryptoJS from 'crypto-js';

export interface VoterCredentials {
  voterSecret: string;
  voterIndex: number;
}

export interface VoteAttempt {
  proposalId: string;
  voterSecret: string;
  voteChoice: number;
  timestamp: number;
}

export interface NullifierRecord {
  nullifier: string;
  proposalId: string;
  timestamp: number;
  blockNumber: number;
}

export class DoubleVotePreventionSystem {
  private usedNullifiers: Map<string, NullifierRecord> = new Map();
  private nullifierHistory: NullifierRecord[] = [];

  // Generate a unique nullifier for a vote
  generateNullifier(voterSecret: string, proposalId: string): string {
    // Create deterministic nullifier: same voter + same proposal = same nullifier
    const input = `${voterSecret}:${proposalId}:nullifier_salt_2024`;
    return CryptoJS.SHA256(input).toString();
  }

  // Attempt to cast a vote
  attemptVote(voteAttempt: VoteAttempt): {
    success: boolean;
    nullifier: string;
    reason?: string;
    previousVote?: NullifierRecord;
  } {
    const nullifier = this.generateNullifier(voteAttempt.voterSecret, voteAttempt.proposalId);
    
    // Check if this nullifier has been used before
    const existingRecord = this.usedNullifiers.get(nullifier);
    
    if (existingRecord) {
      return {
        success: false,
        nullifier,
        reason: 'Double voting detected',
        previousVote: existingRecord
      };
    }

    // Record the nullifier as used
    const record: NullifierRecord = {
      nullifier,
      proposalId: voteAttempt.proposalId,
      timestamp: voteAttempt.timestamp,
      blockNumber: this.getNextBlockNumber()
    };

    this.usedNullifiers.set(nullifier, record);
    this.nullifierHistory.push(record);

    return {
      success: true,
      nullifier
    };
  }

  // Verify if a nullifier has been used
  isNullifierUsed(nullifier: string): boolean {
    return this.usedNullifiers.has(nullifier);
  }

  // Get all nullifiers for a proposal (public information)
  getProposalNullifiers(proposalId: string): NullifierRecord[] {
    return this.nullifierHistory.filter(record => record.proposalId === proposalId);
  }

  // Get statistics
  getStats() {
    const proposalStats = new Map<string, number>();
    
    this.nullifierHistory.forEach(record => {
      const count = proposalStats.get(record.proposalId) || 0;
      proposalStats.set(record.proposalId, count + 1);
    });

    return {
      totalVotes: this.nullifierHistory.length,
      uniqueNullifiers: this.usedNullifiers.size,
      proposalStats: Object.fromEntries(proposalStats),
      preventedDoubleVotes: 0 // Would track failed attempts in real system
    };
  }

  // Simulate multiple vote attempts to demonstrate prevention
  simulateDoubleVoteAttempts(): {
    attempts: Array<{
      attempt: VoteAttempt;
      result: any;
    }>;
    summary: {
      successful: number;
      prevented: number;
      preventionRate: number;
    };
  } {
    const attempts: Array<{attempt: VoteAttempt; result: any}> = [];
    
    // Simulate legitimate votes
    for (let i = 0; i < 5; i++) {
      const attempt: VoteAttempt = {
        proposalId: 'proposal_1',
        voterSecret: `voter_secret_${i}`,
        voteChoice: Math.round(Math.random()),
        timestamp: Date.now() + i * 1000
      };
      
      const result = this.attemptVote(attempt);
      attempts.push({ attempt, result });
    }

    // Simulate double vote attempts (same voters trying to vote again)
    for (let i = 0; i < 3; i++) {
      const attempt: VoteAttempt = {
        proposalId: 'proposal_1',
        voterSecret: `voter_secret_${i}`, // Same voter trying again
        voteChoice: 1 - Math.round(Math.random()), // Different choice
        timestamp: Date.now() + (i + 10) * 1000
      };
      
      const result = this.attemptVote(attempt);
      attempts.push({ attempt, result });
    }

    const successful = attempts.filter(a => a.result.success).length;
    const prevented = attempts.filter(a => !a.result.success).length;

    return {
      attempts,
      summary: {
        successful,
        prevented,
        preventionRate: (prevented / attempts.length) * 100
      }
    };
  }

  // Advanced: Nullifier verification without revealing voter identity
  verifyNullifierProof(
    nullifier: string, 
    proposalId: string, 
    zkProof: string
  ): boolean {
    // In a real ZK system, this would verify:
    // 1. The nullifier was generated correctly from a valid voter secret
    // 2. The voter is eligible (in the Merkle tree)
    // 3. The nullifier hasn't been used before
    // 4. All without revealing the voter's identity
    
    // For demo purposes, we simulate successful verification
    return !this.isNullifierUsed(nullifier) && zkProof.length > 0;
  }

  // Reset system (for demo purposes)
  reset(): void {
    this.usedNullifiers.clear();
    this.nullifierHistory = [];
  }

  private getNextBlockNumber(): number {
    return this.nullifierHistory.length + 1000; // Mock block numbers
  }
}

// Demonstration class showing how the system prevents various attack scenarios
export class DoubleVoteAttackDemo {
  private preventionSystem = new DoubleVotePreventionSystem();

  // Demo 1: Basic double voting attempt
  basicDoubleVoteDemo(): any {
    const voterSecret = 'alice_secret_key_123';
    const proposalId = 'proposal_governance_1';

    // First vote attempt
    const firstVote = this.preventionSystem.attemptVote({
      proposalId,
      voterSecret,
      voteChoice: 1, // Yes
      timestamp: Date.now()
    });

    // Second vote attempt (double vote)
    const secondVote = this.preventionSystem.attemptVote({
      proposalId,
      voterSecret,
      voteChoice: 0, // No (trying to change vote)
      timestamp: Date.now() + 5000
    });

    return {
      scenario: 'Basic Double Vote Prevention',
      firstVote,
      secondVote,
      prevention: secondVote.success === false,
      explanation: 'Same voter secret generates same nullifier, preventing double voting'
    };
  }

  // Demo 2: Cross-proposal voting (should be allowed)
  crossProposalDemo(): any {
    const voterSecret = 'bob_secret_key_456';
    
    // Vote on proposal 1
    const vote1 = this.preventionSystem.attemptVote({
      proposalId: 'proposal_1',
      voterSecret,
      voteChoice: 1,
      timestamp: Date.now()
    });

    // Vote on proposal 2 (different proposal, should be allowed)
    const vote2 = this.preventionSystem.attemptVote({
      proposalId: 'proposal_2',
      voterSecret,
      voteChoice: 0,
      timestamp: Date.now() + 1000
    });

    return {
      scenario: 'Cross-Proposal Voting',
      vote1,
      vote2,
      bothAllowed: vote1.success && vote2.success,
      explanation: 'Same voter can vote on different proposals (different nullifiers)'
    };
  }

  // Demo 3: Sybil attack prevention
  sybilAttackDemo(): any {
    const results = [];
    
    // Attacker tries to vote multiple times with different "fake" identities
    for (let i = 0; i < 5; i++) {
      const fakeSecret = `fake_voter_${i}`;
      const result = this.preventionSystem.attemptVote({
        proposalId: 'proposal_sybil_test',
        voterSecret: fakeSecret,
        voteChoice: 1,
        timestamp: Date.now() + i * 1000
      });
      results.push({ fakeSecret, result });
    }

    return {
      scenario: 'Sybil Attack Simulation',
      results,
      explanation: 'In real system, only pre-registered voter secrets would be valid'
    };
  }

  // Run all demos
  runAllDemos(): any {
    this.preventionSystem.reset();
    
    return {
      demo1: this.basicDoubleVoteDemo(),
      demo2: this.crossProposalDemo(),
      demo3: this.sybilAttackDemo(),
      systemStats: this.preventionSystem.getStats()
    };
  }
}

// Export singleton instance
export const doubleVotePrevention = new DoubleVotePreventionSystem();
export const attackDemo = new DoubleVoteAttackDemo();