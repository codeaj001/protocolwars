import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { TraitProgress } from "./TraitProgress";
import { MissionCard } from "./MissionCard";
import { useHoneycombTraits } from "../honeycomb/traits";
import { useHoneycombMissions, calculateMissionDifficulty, generateEnhancedMission, generateMissionSet } from "../honeycomb/missions";
import { VerxioStreaks } from "../verxio/streaks";
import { HoneycombTraits } from "../utils/honeycomb";

// Notification function
const showMissionCompleteNotification = (reward) => {
  const notification = document.createElement('div');
  notification.className = 'mission-complete-notification';
  notification.innerHTML = `
    <div class="notification-content">
      <div class="notification-icon">🎉</div>
      <div class="notification-text">
        <div class="notification-title">Mission Complete!</div>
        <div class="notification-reward">${reward}</div>
      </div>
    </div>
  `;
  
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(45deg, #96ceb4, #4ecdc4);
    padding: 1rem;
    border-radius: 12px;
    color: white;
    font-weight: bold;
    z-index: 1000;
    animation: slideInRight 0.5s ease-out, fadeOut 0.5s ease-in 2.5s;
    animation-fill-mode: both;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
};

export function PlayerDashboard({ onPlayerDataUpdate }) {
  const { connected, publicKey } = useWallet();
  const honeycombTraits = useHoneycombTraits();
  const honeycombMissions = useHoneycombMissions();
  
  const [playerData, setPlayerData] = useState({
    traits: {
      leadership: 0,
      riskManagement: 0,
      communityBuilding: 0,
      economicStrategy: 0
    },
    tvl: 0,
    missions: [],
    streakCount: 0,
    initialized: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load player data when wallet connects
  useEffect(() => {
    if (connected && publicKey) {
      loadPlayerData();
    }
  }, [connected, publicKey]);
  
  // Notify parent of player data updates
  useEffect(() => {
    if (onPlayerDataUpdate && playerData.initialized) {
      onPlayerDataUpdate(playerData);
    }
  }, [playerData, onPlayerDataUpdate]);

  const loadPlayerData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load player traits
      const traits = await honeycombTraits.getPlayerTraits();
      
      // Load missions
      const missions = await honeycombMissions.getActiveMissions();
      
      // Load streak info
      const streakInfo = await VerxioStreaks.getStreak(publicKey.toString());
      
      if (traits) {
        setPlayerData({
          traits,
          tvl: traits.tvl,
          missions: missions || [],
          streakCount: streakInfo.streakCount,
          initialized: true
        });
      } else {
        // Player not initialized yet - show initialization option
        setPlayerData(prev => ({ 
          ...prev, 
          missions: missions || [],
          streakCount: streakInfo.streakCount,
          initialized: false 
        }));
      }
    } catch (err) {
      console.error("Error loading player data:", err);
      setError("Failed to load player data. Using demo mode.");
      
      // Fallback to mock data
      setPlayerData({
        traits: {
          leadership: 35,
          riskManagement: 28,
          communityBuilding: 42,
          economicStrategy: 31
        },
        tvl: 1500000,
        missions: [
          {
            id: 1,
            title: "Market Crash Survival",
            description: "Navigate your protocol through a 50% market downturn",
            reward: "+2 Risk Management",
            duration: 30,
            completed: false
          },
          {
            id: 2,
            title: "Community Growth",
            description: "Increase your protocol's community by 1000 users",
            reward: "+3 Community Building",
            duration: 45,
            completed: false
          },
          {
            id: 3,
            title: "TVL Milestone",
            description: "Reach $2M TVL through strategic partnerships",
            reward: "+2 Economic Strategy, +1 Leadership",
            duration: 60,
            completed: false
          },
          {
            id: 4,
            title: "Alliance Formation",
            description: "Form a strategic alliance with another major protocol",
            reward: "+3 Leadership, +1 Community Building",
            duration: 75,
            completed: false
          },
          {
            id: 5,
            title: "Security Audit",
            description: "Successfully pass a comprehensive security audit",
            reward: "+4 Risk Management",
            duration: 90,
            completed: false
          }
        ],
        streakCount: 3,
        initialized: true
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInitializePlayer = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Initialize with baseline traits
      const initialTraits = {
        leadership: 5,
        riskManagement: 5,
        communityBuilding: 5,
        economicStrategy: 5
      };
      
      // Try Honeycomb initialization first
      let initResult;
      if (honeycombTraits.initializePlayer) {
        initResult = await honeycombTraits.initializePlayer();
      } else {
        // Fallback initialization using HoneycombTraits
        initResult = await HoneycombTraits.updateTrait(
          { publicKey }, 
          publicKey, 
          'leadership', 
          initialTraits.leadership
        );
      }
      
      if (initResult && initResult.success) {
        // Generate initial missions based on traits
        const playerLevel = 1;
        const initialMissions = generateMissionSet(initialTraits, playerLevel, 3);
        
        // Update player data
        const tvl = HoneycombTraits.calculateTVL(initialTraits);
        
        setPlayerData({
          traits: initialTraits,
          tvl,
          missions: initialMissions,
          streakCount: 0,
          initialized: true,
          level: playerLevel,
          source: initResult.source || 'initialized'
        });
        
        console.log('Player initialized successfully:', {
          traits: initialTraits,
          tvl,
          missionCount: initialMissions.length,
          source: initResult.source
        });
        
      } else {
        throw new Error(initResult?.error || 'Failed to initialize player profile');
      }
    } catch (err) {
      console.error('Error initializing player:', err);
      
      // Fallback to local initialization
      const fallbackTraits = {
        leadership: 5,
        riskManagement: 5,
        communityBuilding: 5,
        economicStrategy: 5
      };
      
      const fallbackMissions = generateMissionSet(fallbackTraits, 1, 3);
      const tvl = HoneycombTraits.calculateTVL(fallbackTraits);
      
      setPlayerData({
        traits: fallbackTraits,
        tvl,
        missions: fallbackMissions,
        streakCount: 0,
        initialized: true,
        level: 1,
        source: 'fallback'
      });
      
      setError(`Blockchain initialization failed, using local mode: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleMissionComplete = async (missionId, expectedRewards = null) => {
    console.log('Mission completed:', missionId, 'Rewards:', expectedRewards);
    
    // For demo purposes, simulate trait updates
    setPlayerData(prev => {
      const updatedMissions = prev.missions.map(mission => 
        mission.id === missionId 
          ? { ...mission, completed: true }
          : mission
      );
      
      // Parse and apply trait rewards
      let updatedTraits = { ...prev.traits };
      if (expectedRewards) {
        if (expectedRewards.includes('Risk Management')) {
          const match = expectedRewards.match(/\+(\d+)\s+Risk Management/);
          if (match) {
            updatedTraits.riskManagement = Math.min(100, updatedTraits.riskManagement + parseInt(match[1]));
          }
        }
        if (expectedRewards.includes('Leadership')) {
          const match = expectedRewards.match(/\+(\d+)\s+Leadership/);
          if (match) {
            updatedTraits.leadership = Math.min(100, updatedTraits.leadership + parseInt(match[1]));
          }
        }
        if (expectedRewards.includes('Community Building')) {
          const match = expectedRewards.match(/\+(\d+)\s+Community Building/);
          if (match) {
            updatedTraits.communityBuilding = Math.min(100, updatedTraits.communityBuilding + parseInt(match[1]));
          }
        }
        if (expectedRewards.includes('Economic Strategy')) {
          const match = expectedRewards.match(/\+(\d+)\s+Economic Strategy/);
          if (match) {
            updatedTraits.economicStrategy = Math.min(100, updatedTraits.economicStrategy + parseInt(match[1]));
          }
        }
      }
      
      // Recalculate TVL
      const newTVL = (updatedTraits.leadership * 1000) + 
                     (updatedTraits.riskManagement * 500) + 
                     (updatedTraits.communityBuilding * 2000) + 
                     (updatedTraits.economicStrategy * 800);
      
      // Show success notification
      showMissionCompleteNotification(expectedRewards || 'Mission completed!');
      
      return {
        ...prev,
        missions: updatedMissions,
        traits: updatedTraits,
        tvl: newTVL
      };
    });
  };

  if (!connected) {
    return (
      <div className="dashboard-disconnected">
        <h2>Connect your wallet to start playing!</h2>
        <p>Protocol Wars requires a Solana wallet connection to track your progress and traits.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="dashboard-loading">
        <h2>Loading Protocol Commander...</h2>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!playerData.initialized) {
    return (
      <div className="dashboard-initialization">
        <h2>Welcome to Protocol Wars!</h2>
        <p>Initialize your Protocol Commander to begin your journey in the DAO battle simulator.</p>
        {error && (
          <div className="error-message">
            <p>⚠️ {error}</p>
          </div>
        )}
        <button 
          className="btn btn-primary"
          onClick={handleInitializePlayer}
          disabled={loading}
        >
          {loading ? "Initializing..." : "Initialize Commander"}
        </button>
      </div>
    );
  }

  return (
    <div className="player-dashboard">
      {error && (
        <div className="error-banner">
          <p>⚠️ {error}</p>
          <button 
            className="btn-close" 
            onClick={() => setError(null)}
          >
            ×
          </button>
        </div>
      )}
      
      <div className="dashboard-header">
        <h2>Protocol Commander</h2>
        <div className="player-stats">
          <div className="stat">
            <span className="stat-label">TVL</span>
            <span className="stat-value">${(playerData.tvl / 1000000).toFixed(1)}M</span>
          </div>
          <div className="stat">
            <span className="stat-label">Streak</span>
            <span className="stat-value">{playerData.streakCount}🔥</span>
          </div>
          <div className="stat">
            <span className="stat-label">Wallet</span>
            <span className="stat-value">{publicKey?.toString().slice(0, 4)}...{publicKey?.toString().slice(-4)}</span>
          </div>
        </div>
      </div>

      {/* Trait Visualization */}
      <div className="traits-section">
        <h3>Commander Traits</h3>
        <div className="traits-grid">
          <div data-trait="leadership">
            <TraitProgress 
              name="Leadership"
              value={playerData.traits.leadership}
              max={100}
              color="#ff6b6b"
            />
          </div>
          <div data-trait="riskManagement">
            <TraitProgress 
              name="Risk Management"
              value={playerData.traits.riskManagement}
              max={100}
              color="#4ecdc4"
            />
          </div>
          <div data-trait="communityBuilding">
            <TraitProgress 
              name="Community Building"
              value={playerData.traits.communityBuilding}
              max={100}
              color="#45b7d1"
            />
          </div>
          <div data-trait="economicStrategy">
            <TraitProgress 
              name="Economic Strategy"
              value={playerData.traits.economicStrategy}
              max={100}
              color="#96ceb4"
            />
          </div>
        </div>
      </div>

      {/* Active Missions */}
      <div className="missions-section">
        <h3>Active Missions</h3>
        <div className="missions-list">
          {playerData.missions.map((mission) => (
            <MissionCard
              key={mission.id}
              mission={mission}
              onComplete={(reward) => handleMissionComplete(mission.id, reward)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
