import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { MidnightWallet, Field, AnonymousVotingContract } from '../lib/midnight-mock';

interface MidnightContextType {
  wallet: MidnightWallet | null;
  contract: AnonymousVotingContract | null;
  isConnected: boolean;
  isLoading: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  generateVoteProof: (vote: VoteData) => Promise<ZKProof>;
}

interface VoteData {
  proposalId: string;
  choice: number; // 0 or 1
  voterSecret: string;
  nullifier: string;
}

interface ZKProof {
  proof: string;
  publicInputs: Field[];
}

const MidnightContext = createContext<MidnightContextType | undefined>(undefined);

export function MidnightProvider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<MidnightWallet | null>(null);
  const [contract, setContract] = useState<AnonymousVotingContract | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeMidnight();
  }, []);

  const initializeMidnight = async () => {
    try {
      // Check if Midnight wallet is available
      if (typeof window !== 'undefined' && (window as any).midnight) {
        setIsLoading(false);
      } else {
        console.log('Midnight wallet not detected');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Failed to initialize Midnight:', error);
      setIsLoading(false);
    }
  };

  const connect = async () => {
    try {
      setIsLoading(true);
      
      // Connect to Midnight wallet
      const midnightWallet = new MidnightWallet();
      await midnightWallet.connect();
      
      // Initialize contract
      const votingContract = new AnonymousVotingContract();
      await votingContract.compile();
      
      setWallet(midnightWallet);
      setContract(votingContract);
      setIsConnected(true);
      
      console.log('Connected to Midnight successfully');
    } catch (error) {
      console.error('Failed to connect to Midnight:', error);
      alert('Failed to connect to Midnight wallet. Please make sure it is installed and unlocked.');
    } finally {
      setIsLoading(false);
    }
  };

  const disconnect = () => {
    setWallet(null);
    setContract(null);
    setIsConnected(false);
  };

  const generateVoteProof = async (voteData: VoteData): Promise<ZKProof> => {
    if (!wallet || !contract) {
      throw new Error('Wallet or contract not connected');
    }

    try {
      // Mock ZK proof generation for demo
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate proof generation time
      
      const mockProof = {
        proposalId: voteData.proposalId,
        choice: voteData.choice,
        timestamp: Date.now(),
        nullifier: voteData.nullifier
      };

      return {
        proof: JSON.stringify(mockProof),
        publicInputs: [
          new Field(voteData.proposalId),
          new Field(voteData.choice),
          new Field(1) // vote weight
        ]
      };
    } catch (error) {
      console.error('Failed to generate vote proof:', error);
      throw new Error('Failed to generate zero-knowledge proof');
    }
  };

  const value: MidnightContextType = {
    wallet,
    contract,
    isConnected,
    isLoading,
    connect,
    disconnect,
    generateVoteProof
  };

  return (
    <MidnightContext.Provider value={value}>
      {children}
    </MidnightContext.Provider>
  );
}

export function useMidnight() {
  const context = useContext(MidnightContext);
  if (context === undefined) {
    throw new Error('useMidnight must be used within a MidnightProvider');
  }
  return context;
}