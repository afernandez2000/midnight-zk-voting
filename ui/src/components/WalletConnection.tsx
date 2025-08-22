import React, { useState, useEffect } from 'react';
import RealMidnightWallet, { MidnightWalletDetector } from '../lib/realMidnightWallet';

interface WalletConnectionProps {
  onConnect: (walletInfo: any) => void;
  onDisconnect: () => void;
}

function WalletConnection({ onConnect, onDisconnect }: WalletConnectionProps) {
  const [connectionStatus, setConnectionStatus] = useState<
    'disconnected' | 'connecting' | 'connected' | 'error'
  >('disconnected');
  const [walletType, setWalletType] = useState<'mock' | 'real'>('mock');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [walletInstalled, setWalletInstalled] = useState(false);
  const [showInstallInstructions, setShowInstallInstructions] = useState(false);

  useEffect(() => {
    checkWalletAvailability();
  }, []);

  const checkWalletAvailability = async () => {
    // Check if real Midnight wallet is installed
    const isInstalled = RealMidnightWallet.isInstalled();
    setWalletInstalled(isInstalled);
    
    if (!isInstalled) {
      // Wait a bit in case wallet is still loading
      const walletDetected = await MidnightWalletDetector.waitForWallet(2000);
      setWalletInstalled(walletDetected);
    }
  };

  const connectMockWallet = async () => {
    setConnectionStatus('connecting');
    try {
      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockWalletInfo = {
        type: 'mock',
        accounts: ['mock_account_0x123...'],
        activeAccount: 'mock_account_0x123...',
        voterSecret: 'current_user_secret_123'
      };
      
      onConnect(mockWalletInfo);
      setConnectionStatus('connected');
    } catch (error) {
      setConnectionStatus('error');
      setErrorMessage('Failed to connect to mock wallet');
    }
  };

  const connectRealWallet = async () => {
    setConnectionStatus('connecting');
    try {
      const wallet = new RealMidnightWallet();
      const result = await wallet.connect();
      
      if (result.success) {
        const walletInfo = {
          type: 'real',
          accounts: result.accounts,
          activeAccount: result.activeAccount,
          wallet: wallet
        };
        
        onConnect(walletInfo);
        setConnectionStatus('connected');
      } else {
        setConnectionStatus('error');
        setErrorMessage(result.error || 'Failed to connect to Midnight wallet');
      }
    } catch (error) {
      setConnectionStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Connection failed');
    }
  };

  const handleDisconnect = () => {
    onDisconnect();
    setConnectionStatus('disconnected');
    setErrorMessage('');
  };

  const getInstallInstructions = () => {
    return MidnightWalletDetector.getInstallationInstructions();
  };

  if (connectionStatus === 'connected') {
    return (
      <div className="glass-card p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-ping opacity-75"></div>
            </div>
            <div>
              <div className="font-medium">
                {walletType === 'real' ? 'Midnight Wallet' : 'Demo Wallet'} Connected
              </div>
              <div className="text-sm text-gray-400">
                {walletType === 'real' ? 'Real blockchain connection' : 'Mock demonstration mode'}
              </div>
            </div>
          </div>
          <button onClick={handleDisconnect} className="btn-secondary">
            Disconnect
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Wallet Type Selection */}
      <div className="glass-card p-6">
        <h3 className="text-xl font-bold mb-4">Choose Wallet Connection</h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          {/* Real Wallet Option */}
          <div className={`floating-card cursor-pointer ${
            walletType === 'real' ? 'ring-2 ring-purple-500' : ''
          }`} onClick={() => setWalletType('real')}>
            <div className="text-center">
              <div className="text-4xl mb-3">🌙</div>
              <h4 className="font-bold mb-2">Real Midnight Wallet</h4>
              <p className="text-sm text-gray-400 mb-3">
                Connect to actual Midnight blockchain
              </p>
              {walletInstalled ? (
                <div className="text-green-400 text-sm">✅ Wallet Detected</div>
              ) : (
                <div className="text-red-400 text-sm">❌ Not Installed</div>
              )}
            </div>
          </div>

          {/* Mock Wallet Option */}
          <div className={`floating-card cursor-pointer ${
            walletType === 'mock' ? 'ring-2 ring-blue-500' : ''
          }`} onClick={() => setWalletType('mock')}>
            <div className="text-center">
              <div className="text-4xl mb-3">🎭</div>
              <h4 className="font-bold mb-2">Demo Wallet</h4>
              <p className="text-sm text-gray-400 mb-3">
                Simulated wallet for demonstration
              </p>
              <div className="text-blue-400 text-sm">🎮 Always Available</div>
            </div>
          </div>
        </div>
      </div>

      {/* Connection Button */}
      <div className="text-center">
        {walletType === 'real' && !walletInstalled ? (
          <div className="space-y-4">
            <button
              onClick={() => setShowInstallInstructions(!showInstallInstructions)}
              className="btn-secondary"
            >
              📥 Installation Required
            </button>
            
            {showInstallInstructions && (
              <div className="glass-card p-6 text-left">
                <h4 className="font-bold mb-3">Install Midnight Wallet:</h4>
                <ol className="space-y-2 text-sm">
                  {getInstallInstructions().steps.map((step, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-purple-400 font-bold">{index + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
                <button
                  onClick={checkWalletAvailability}
                  className="btn-secondary mt-4"
                >
                  🔄 Check Again
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={walletType === 'real' ? connectRealWallet : connectMockWallet}
            disabled={connectionStatus === 'connecting'}
            className="btn-primary"
          >
            {connectionStatus === 'connecting' ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Connecting...</span>
              </div>
            ) : (
              <span>
                Connect {walletType === 'real' ? 'Midnight' : 'Demo'} Wallet
              </span>
            )}
          </button>
        )}
      </div>

      {/* Error Display */}
      {connectionStatus === 'error' && (
        <div className="glass-card p-4 border-red-500/50 bg-red-500/10">
          <div className="flex items-center space-x-2">
            <span className="text-red-400">❌</span>
            <span className="text-red-300 font-medium">Connection Failed</span>
          </div>
          <p className="text-red-400 text-sm mt-2">{errorMessage}</p>
          <button
            onClick={() => setConnectionStatus('disconnected')}
            className="btn-secondary mt-3"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Information */}
      <div className="glass-card p-4">
        <h4 className="font-medium mb-2">ℹ️ Wallet Information</h4>
        <div className="text-sm text-gray-400 space-y-1">
          <p><strong>Real Wallet:</strong> Connects to actual Midnight blockchain with real cryptographic operations</p>
          <p><strong>Demo Wallet:</strong> Simulated for demonstration purposes, no real blockchain interaction</p>
        </div>
      </div>
    </div>
  );
}

export default WalletConnection;