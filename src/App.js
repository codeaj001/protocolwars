import { useMemo, useState, useCallback } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import {
  WalletModalProvider,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import { Responsive3DCanvas } from "./components/Responsive3DCanvas";
import { PlayerDashboard } from "./components/PlayerDashboard";
import { BattleSystem } from "./components/BattleSystem";
import { OnboardingTutorial } from "./components/OnboardingTutorial";
import './App.css';

// Default styles that can be overridden by your app
import "@solana/wallet-adapter-react-ui/styles.css";

function App() {
  // Game state management
  const [selectedProtocol, setSelectedProtocol] = useState(null);
  const [controlledProtocols, setControlledProtocols] = useState([0]); // Start with first protocol
  const [playerData, setPlayerData] = useState(null);
  
  // The network can be set to 'mainnet-beta', 'honeynet', or 'sonic'.
  const network = "https://rpc.test.honeycombprotocol.com";
  const endpoint = useMemo(() => network, [network]);

  const wallets = useMemo(
    () => [
      // Manually define specific/custom wallets here
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    [network]
  );
  
  // Handle protocol selection from 3D grid
  const handleProtocolSelect = useCallback((protocol) => {
    setSelectedProtocol(protocol);
  }, []);
  
  // Handle battle results
  const handleBattleResult = useCallback((result, data) => {
    if (result === 'victory') {
      // Apply rewards to player data
      setPlayerData(prev => {
        if (!prev) return prev;
        
        const updatedTraits = { ...prev.traits };
        Object.entries(data.traitBonus).forEach(([trait, bonus]) => {
          updatedTraits[trait] = Math.min(100, updatedTraits[trait] + bonus);
        });
        
        return {
          ...prev,
          traits: updatedTraits,
          tvl: prev.tvl + data.tvlGain
        };
      });
    } else if (result === 'defeat') {
      // Apply penalties
      setPlayerData(prev => {
        if (!prev) return prev;
        
        const updatedTraits = { ...prev.traits };
        Object.entries(data.traitPenalty).forEach(([trait, penalty]) => {
          updatedTraits[trait] = Math.max(0, updatedTraits[trait] + penalty);
        });
        
        return {
          ...prev,
          traits: updatedTraits,
          tvl: Math.max(0, prev.tvl - data.tvlLoss)
        };
      });
    }
  }, []);
  
  // Handle protocol capture
  const handleProtocolCapture = useCallback((protocolId) => {
    setControlledProtocols(prev => [...prev, protocolId]);
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <div className="app">
            <header className="app-header">
              <h1>Protocol Wars - DAO Battle Simulator</h1>
              <WalletMultiButton />
            </header>
            
            <main className="app-main">
              {/* Left Panel - Player Dashboard */}
              <div className="left-panel">
                <PlayerDashboard onPlayerDataUpdate={setPlayerData} />
              </div>
              
              {/* Center Panel - 3D Honeycomb Visualization */}
              <div className="center-panel">
                <Responsive3DCanvas 
                  onProtocolSelect={handleProtocolSelect}
                  selectedProtocol={selectedProtocol}
                  controlledProtocols={controlledProtocols}
                />
              </div>
              
              {/* Right Panel - Battle System */}
              <div className="right-panel">
                <BattleSystem 
                  selectedProtocol={selectedProtocol}
                  playerData={playerData}
                  onBattleResult={handleBattleResult}
                  onProtocolCapture={handleProtocolCapture}
                />
              </div>
            </main>
            
            {/* Onboarding Tutorial */}
            <OnboardingTutorial 
              onComplete={() => console.log('Tutorial completed!')}
              onSkip={() => console.log('Tutorial skipped!')}
            />
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;
