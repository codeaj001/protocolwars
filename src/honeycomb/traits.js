import { useWallet } from "@solana/wallet-adapter-react";
import { client, HoneycombTraits, HoneycombProfiles } from "../utils/honeycomb";
import { VerxioStreaks } from "../verxio/streaks";

// Trait system integration with Honeycomb Protocol
export const useHoneycombTraits = () => {
  const { connected, publicKey } = useWallet();

  const updateTrait = async (trait, value) => {
    if (!connected || !publicKey) {
      throw new Error("Wallet not connected");
    }

    try {
      // Apply Verxio streak bonus to trait updates
      const streakInfo = await VerxioStreaks.checkStreak(publicKey.toString());
      const bonusValue = Math.floor(value * streakInfo.multiplier);
      
      console.log(`Updating trait ${trait}: base=${value}, bonus=${bonusValue}, streak=${streakInfo.streakCount}`);
      
      // Update trait using Honeycomb Protocol
      const result = await HoneycombTraits.updateTrait(
        { publicKey }, 
        publicKey, 
        trait, 
        bonusValue
      );

      if (result.success) {
        // Update streak after successful trait update
        await VerxioStreaks.updateStreak(publicKey.toString());
        
        return {
          success: true,
          trait: trait,
          originalValue: value,
          finalValue: bonusValue,
          streakBonus: bonusValue - value,
          streakCount: streakInfo.streakCount,
          transaction: result.transaction
        };
      } else {
        throw new Error(`Failed to update trait: ${result.error}`);
      }
    } catch (error) {
      console.error("Error updating trait:", error);
      return {
        success: false,
        error: error.message
      };
    }
  };

  const getPlayerTraits = async () => {
    if (!connected || !publicKey) {
      return null;
    }

    try {
      const traits = await HoneycombTraits.getPlayerTraits(publicKey.toString());
      const tvl = HoneycombTraits.calculateTVL(traits);
      
      return {
        ...traits,
        tvl: tvl
      };
    } catch (error) {
      console.error("Error fetching player traits:", error);
      return null;
    }
  };

  const initializePlayer = async () => {
    if (!connected || !publicKey) {
      throw new Error("Wallet not connected");
    }

    try {
      // Create Honeycomb profile for the player
      const profileResult = await HoneycombProfiles.createProfile(
        { publicKey },
        {
          name: "Protocol Commander",
          bio: "A strategic commander in the Protocol Wars",
          pfp: ""
        }
      );

      if (profileResult.success) {
        // Initialize starting traits
        const initialTraits = {
          leadership: 10,
          riskManagement: 10,
          communityBuilding: 10,
          economicStrategy: 10
        };

        // Update profile with initial traits
        await HoneycombProfiles.updateProfile(
          { publicKey },
          profileResult.profileAddress,
          { traits: initialTraits }
        );

        return {
          success: true,
          profileAddress: profileResult.profileAddress,
          initialTraits: initialTraits
        };
      } else {
        throw new Error(`Failed to create profile: ${profileResult.error}`);
      }
    } catch (error) {
      console.error("Error initializing player:", error);
      return {
        success: false,
        error: error.message
      };
    }
  };

  return {
    updateTrait,
    getPlayerTraits,
    initializePlayer,
    connected,
    publicKey: publicKey?.toString()
  };
};

// Mission completion with trait rewards
export const completeMissionWithTraits = async (wallet, missionId, traitRewards) => {
  try {
    console.log(`Completing mission ${missionId} with rewards:`, traitRewards);
    
    // Complete mission in Honeycomb
    const missionResult = await client.completeMission(wallet, missionId);
    
    if (missionResult.success) {
      // Apply trait rewards
      const traitResults = [];
      
      for (const [trait, value] of Object.entries(traitRewards)) {
        const traitResult = await HoneycombTraits.updateTrait(
          wallet,
          wallet.publicKey,
          `protocol_${trait}`,
          value
        );
        traitResults.push({ trait, result: traitResult });
      }

      // Apply Verxio streak bonus
      const streakBonus = await VerxioStreaks.applyStreakBonus(
        wallet.publicKey.toString(),
        100 // Base XP for mission completion
      );

      return {
        success: true,
        missionResult: missionResult,
        traitResults: traitResults,
        streakBonus: streakBonus,
        totalXP: streakBonus.bonusXP
      };
    } else {
      throw new Error(`Mission completion failed: ${missionResult.error}`);
    }
  } catch (error) {
    console.error("Error completing mission:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Visual feedback for trait changes
export const animateTraitChange = (traitName, oldValue, newValue, element) => {
  if (!element) return;

  // Create animation for trait increase
  const duration = 1000; // 1 second
  const startTime = Date.now();
  
  const animate = () => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Smooth easing function
    const easeOutCubic = 1 - Math.pow(1 - progress, 3);
    const currentValue = oldValue + (newValue - oldValue) * easeOutCubic;
    
    // Update the visual element
    element.textContent = Math.floor(currentValue);
    
    // Add glow effect during animation
    if (progress < 1) {
      element.style.textShadow = `0 0 ${10 * (1 - progress)}px #4ecdc4`;
      requestAnimationFrame(animate);
    } else {
      // Reset glow effect
      setTimeout(() => {
        element.style.textShadow = "none";
      }, 500);
    }
  };
  
  animate();
};

// Calculate alliance strength based on combined traits
export const calculateAllianceStrength = (protocols) => {
  const combinedTraits = protocols.reduce((acc, protocol) => {
    acc.leadership += protocol.traits.leadership;
    acc.riskManagement += protocol.traits.riskManagement;
    acc.communityBuilding += protocol.traits.communityBuilding;
    acc.economicStrategy += protocol.traits.economicStrategy;
    return acc;
  }, {
    leadership: 0,
    riskManagement: 0,
    communityBuilding: 0,
    economicStrategy: 0
  });

  // Alliance bonus: 10% bonus when traits complement each other
  const diversity = Object.values(combinedTraits).filter(value => value > 0).length;
  const diversityBonus = diversity === 4 ? 1.1 : 1.0;

  const totalStrength = HoneycombTraits.calculateTVL(combinedTraits) * diversityBonus;
  
  return {
    combinedTraits,
    totalStrength,
    diversityBonus,
    protocolCount: protocols.length
  };
};
