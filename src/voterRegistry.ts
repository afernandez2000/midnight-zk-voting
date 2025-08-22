// Voter Registry System - Demonstrates how participation is verified in ZK voting

import { Field, Poseidon } from '../lib/midnight-mock';

export interface VoterCredentials {
  voterSecret: string;
  voterIndex: number;
  merkleProof: string[];
  merkleIndices: number[];
}

export interface VoterRegistration {
  voterHash: string; // Hash of voter credentials (goes in Merkle tree)
  timestamp: number;
  eligibilityProof: string; // Proof they meet voting criteria
}

export class VoterRegistry {
  private voters: Map<string, VoterRegistration> = new Map();
  private merkleTree: string[] = [];
  private merkleRoot: string = '';

  // Add eligible voter to registry
  addEligibleVoter(voterSecret: string, eligibilityProof: string): VoterCredentials {
    // Create voter hash (what goes in Merkle tree)
    const voterHash = this.hashVoterCredentials(voterSecret);
    
    // Register voter
    const registration: VoterRegistration = {
      voterHash,
      timestamp: Date.now(),
      eligibilityProof
    };
    
    this.voters.set(voterHash, registration);
    
    // Add to Merkle tree and update root
    const voterIndex = this.merkleTree.length;
    this.merkleTree.push(voterHash);
    this.updateMerkleRoot();
    
    // Generate Merkle proof for this voter
    const { proof, indices } = this.generateMerkleProof(voterIndex);
    
    return {
      voterSecret,
      voterIndex,
      merkleProof: proof,
      merkleIndices: indices
    };
  }

  // Verify voter eligibility (used in ZK circuit)
  verifyVoterEligibility(voterSecret: string, merkleProof: string[], merkleIndices: number[]): boolean {
    const voterHash = this.hashVoterCredentials(voterSecret);
    const computedRoot = this.verifyMerkleProof(voterHash, merkleProof, merkleIndices);
    return computedRoot === this.merkleRoot;
  }

  // Get current registry stats
  getRegistryStats() {
    return {
      totalEligibleVoters: this.merkleTree.length,
      merkleRoot: this.merkleRoot,
      lastUpdated: Math.max(...Array.from(this.voters.values()).map(v => v.timestamp))
    };
  }

  // Generate demo voter registry
  static createDemoRegistry(): VoterRegistry {
    const registry = new VoterRegistry();
    
    // Add 1000 demo eligible voters
    for (let i = 0; i < 1000; i++) {
      const voterSecret = `voter_secret_${i}_${Math.random().toString(36).substr(2, 9)}`;
      const eligibilityProof = `proof_${i}`;
      registry.addEligibleVoter(voterSecret, eligibilityProof);
    }
    
    return registry;
  }

  private hashVoterCredentials(voterSecret: string): string {
    // In real implementation, this would use proper cryptographic hashing
    return Poseidon.hash([Field.fromString(voterSecret)]).toString();
  }

  private generateMerkleProof(index: number): { proof: string[], indices: number[] } {
    // Simplified Merkle proof generation for demo
    const proof: string[] = [];
    const indices: number[] = [];
    
    let currentIndex = index;
    let currentLevel = [...this.merkleTree];
    
    while (currentLevel.length > 1) {
      const isRightNode = currentIndex % 2 === 1;
      const siblingIndex = isRightNode ? currentIndex - 1 : currentIndex + 1;
      
      if (siblingIndex < currentLevel.length) {
        proof.push(currentLevel[siblingIndex]);
        indices.push(isRightNode ? 0 : 1);
      }
      
      // Move to next level
      const nextLevel: string[] = [];
      for (let i = 0; i < currentLevel.length; i += 2) {
        const left = currentLevel[i];
        const right = currentLevel[i + 1] || left;
        const combined = Poseidon.hash([Field.fromString(left), Field.fromString(right)]).toString();
        nextLevel.push(combined);
      }
      
      currentLevel = nextLevel;
      currentIndex = Math.floor(currentIndex / 2);
    }
    
    return { proof, indices };
  }

  private verifyMerkleProof(leaf: string, proof: string[], indices: number[]): string {
    let current = leaf;
    
    for (let i = 0; i < proof.length; i++) {
      const sibling = proof[i];
      const isRight = indices[i] === 1;
      
      if (isRight) {
        current = Poseidon.hash([Field.fromString(sibling), Field.fromString(current)]).toString();
      } else {
        current = Poseidon.hash([Field.fromString(current), Field.fromString(sibling)]).toString();
      }
    }
    
    return current;
  }

  private updateMerkleRoot(): void {
    if (this.merkleTree.length === 0) {
      this.merkleRoot = '';
      return;
    }
    
    let currentLevel = [...this.merkleTree];
    
    while (currentLevel.length > 1) {
      const nextLevel: string[] = [];
      for (let i = 0; i < currentLevel.length; i += 2) {
        const left = currentLevel[i];
        const right = currentLevel[i + 1] || left;
        const combined = Poseidon.hash([Field.fromString(left), Field.fromString(right)]).toString();
        nextLevel.push(combined);
      }
      currentLevel = nextLevel;
    }
    
    this.merkleRoot = currentLevel[0];
  }
}

// Participation Tracking
export class ParticipationTracker {
  private usedNullifiers: Set<string> = new Set();
  private participationLog: Array<{
    nullifier: string;
    timestamp: number;
    proposalId: string;
  }> = [];

  // Record participation (called when vote is cast)
  recordParticipation(nullifier: string, proposalId: string): boolean {
    if (this.usedNullifiers.has(nullifier)) {
      return false; // Double voting attempt
    }
    
    this.usedNullifiers.add(nullifier);
    this.participationLog.push({
      nullifier,
      timestamp: Date.now(),
      proposalId
    });
    
    return true;
  }

  // Get participation stats for a proposal
  getParticipationStats(proposalId: string) {
    const proposalParticipation = this.participationLog.filter(p => p.proposalId === proposalId);
    
    return {
      totalParticipants: proposalParticipation.length,
      participationRate: 0, // Would calculate based on eligible voters
      nullifiers: proposalParticipation.map(p => p.nullifier),
      timestamps: proposalParticipation.map(p => p.timestamp)
    };
  }

  // Verify participation without revealing identity
  verifyParticipation(nullifier: string): boolean {
    return this.usedNullifiers.has(nullifier);
  }
}