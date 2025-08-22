// Nullifier Service for Real-time Double Vote Detection

interface NullifierRecord {
  nullifier: string;
  proposalId: string;
  voterIdentifier: string; // Hashed identifier, not real identity
  timestamp: number;
}

interface VoteAttemptResult {
  canVote: boolean;
  nullifier: string;
  reason?: string;
  previousVoteTime?: number;
}

class NullifierService {
  private static instance: NullifierService;
  private usedNullifiers: Map<string, NullifierRecord> = new Map();

  public static getInstance(): NullifierService {
    if (!NullifierService.instance) {
      NullifierService.instance = new NullifierService();
      // Initialize with some demo data
      NullifierService.instance.initializeDemoData();
    }
    return NullifierService.instance;
  }

  // Generate nullifier for a specific voter and proposal
  generateNullifier(voterSecret: string, proposalId: string): string {
    const input = `${voterSecret}:${proposalId}:nullifier_salt_2024`;
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return `nullifier_${Math.abs(hash).toString(16)}`;
  }

  // Check if a vote would be a duplicate
  checkVoteEligibility(voterSecret: string, proposalId: string): VoteAttemptResult {
    const nullifier = this.generateNullifier(voterSecret, proposalId);
    const existingRecord = this.usedNullifiers.get(nullifier);

    if (existingRecord) {
      return {
        canVote: false,
        nullifier,
        reason: 'You have already voted on this proposal',
        previousVoteTime: existingRecord.timestamp
      };
    }

    return {
      canVote: true,
      nullifier,
      reason: 'Ready to vote - this will be your first vote on this proposal'
    };
  }

  // Simulate recording a vote (in real system, this would be done by smart contract)
  recordVote(voterSecret: string, proposalId: string): VoteAttemptResult {
    const eligibility = this.checkVoteEligibility(voterSecret, proposalId);
    
    if (!eligibility.canVote) {
      return eligibility;
    }

    // Record the vote
    const record: NullifierRecord = {
      nullifier: eligibility.nullifier,
      proposalId,
      voterIdentifier: this.hashVoterIdentifier(voterSecret),
      timestamp: Date.now()
    };

    this.usedNullifiers.set(eligibility.nullifier, record);

    return {
      canVote: true,
      nullifier: eligibility.nullifier,
      reason: 'Vote successfully recorded'
    };
  }

  // Get vote status for display
  getVoteStatus(voterSecret: string, proposalId: string): {
    status: 'can-vote' | 'already-voted' | 'checking';
    message: string;
    details?: {
      nullifier: string;
      previousVoteTime?: number;
      timeAgo?: string;
    };
  } {
    const result = this.checkVoteEligibility(voterSecret, proposalId);
    
    if (result.canVote) {
      return {
        status: 'can-vote',
        message: '✅ Ready to vote',
        details: {
          nullifier: result.nullifier
        }
      };
    } else {
      const timeAgo = result.previousVoteTime 
        ? this.formatTimeAgo(result.previousVoteTime)
        : 'unknown time';
      
      return {
        status: 'already-voted',
        message: '🚫 Already voted on this proposal',
        details: {
          nullifier: result.nullifier,
          previousVoteTime: result.previousVoteTime,
          timeAgo
        }
      };
    }
  }

  // Get all nullifiers for a proposal (public information)
  getProposalNullifiers(proposalId: string): NullifierRecord[] {
    return Array.from(this.usedNullifiers.values())
      .filter(record => record.proposalId === proposalId);
  }

  // Get statistics
  getStats() {
    const proposalCounts = new Map<string, number>();
    
    Array.from(this.usedNullifiers.values()).forEach(record => {
      const count = proposalCounts.get(record.proposalId) || 0;
      proposalCounts.set(record.proposalId, count + 1);
    });

    return {
      totalVotes: this.usedNullifiers.size,
      proposalStats: Object.fromEntries(proposalCounts)
    };
  }

  // Private helper methods
  private hashVoterIdentifier(voterSecret: string): string {
    // Create a hashed identifier that doesn't reveal the actual secret
    let hash = 0;
    const input = `voter_id_${voterSecret}`;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return `voter_${Math.abs(hash).toString(16).substring(0, 8)}`;
  }

  private formatTimeAgo(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'just now';
  }

  private initializeDemoData() {
    // Add some demo votes to show the system in action
    const demoVotes = [
      { voterSecret: 'demo_voter_alice', proposalId: '3', timestamp: Date.now() - 2 * 60 * 60 * 1000 }, // 2 hours ago
      { voterSecret: 'demo_voter_bob', proposalId: '3', timestamp: Date.now() - 1 * 60 * 60 * 1000 }, // 1 hour ago
      { voterSecret: 'demo_voter_carol', proposalId: '3', timestamp: Date.now() - 30 * 60 * 1000 }, // 30 minutes ago
    ];

    demoVotes.forEach(vote => {
      const nullifier = this.generateNullifier(vote.voterSecret, vote.proposalId);
      const record: NullifierRecord = {
        nullifier,
        proposalId: vote.proposalId,
        voterIdentifier: this.hashVoterIdentifier(vote.voterSecret),
        timestamp: vote.timestamp
      };
      this.usedNullifiers.set(nullifier, record);
    });
  }

  // Reset for testing
  reset() {
    this.usedNullifiers.clear();
    this.initializeDemoData();
  }
}

export const nullifierService = NullifierService.getInstance();
export type { VoteAttemptResult };