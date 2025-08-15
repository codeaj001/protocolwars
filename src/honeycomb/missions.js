import { useWallet } from "@solana/wallet-adapter-react";
import { HoneycombMissions } from "../utils/honeycomb";
import { VerxioStreaks } from "../verxio/streaks";
import { completeMissionWithTraits, animateTraitChange } from "./traits";

// Enhanced mission types with more variety
const MISSION_TEMPLATES = [
  {
    category: "security",
    templates: [
      {
        title: "Flash Loan Defense",
        description: "Protect your protocol from a sophisticated flash loan attack exploiting price oracle manipulation",
        primaryTrait: "riskManagement",
        secondaryTrait: "economicStrategy",
        baseReward: { riskManagement: 4, economicStrategy: 2 },
        baseDuration: 45,
        baseDifficulty: 65,
        rarity: "common",
        minLevel: 1
      },
      {
        title: "Multi-Sig Vault Security",
        description: "Implement advanced multi-signature security for your treasury management",
        primaryTrait: "riskManagement",
        secondaryTrait: "leadership",
        baseReward: { riskManagement: 5, leadership: 1 },
        baseDuration: 30,
        baseDifficulty: 50,
        rarity: "common",
        minLevel: 1
      },
      {
        title: "Zero-Day Exploit Response",
        description: "Respond to a critical zero-day vulnerability discovered in your smart contracts",
        primaryTrait: "riskManagement",
        secondaryTrait: "leadership",
        baseReward: { riskManagement: 6, leadership: 3 },
        baseDuration: 15,
        baseDifficulty: 85,
        rarity: "rare",
        minLevel: 5
      }
    ]
  },
  {
    category: "governance",
    templates: [
      {
        title: "Community Governance Crisis",
        description: "Navigate a controversial governance proposal that threatens to split your community",
        primaryTrait: "leadership",
        secondaryTrait: "communityBuilding",
        baseReward: { leadership: 4, communityBuilding: 2 },
        baseDuration: 90,
        baseDifficulty: 70,
        rarity: "common",
        minLevel: 2
      },
      {
        title: "DAO Treasury Management",
        description: "Optimize treasury allocation during bear market conditions",
        primaryTrait: "economicStrategy",
        secondaryTrait: "leadership",
        baseReward: { economicStrategy: 4, leadership: 2 },
        baseDuration: 75,
        baseDifficulty: 60,
        rarity: "common",
        minLevel: 2
      },
      {
        title: "Hostile Takeover Defense",
        description: "Defend against a coordinated attempt to acquire controlling governance tokens",
        primaryTrait: "leadership",
        secondaryTrait: "communityBuilding",
        baseReward: { leadership: 7, communityBuilding: 4 },
        baseDuration: 120,
        baseDifficulty: 90,
        rarity: "legendary",
        minLevel: 10
      }
    ]
  },
  {
    category: "innovation",
    templates: [
      {
        title: "Yield Farming Innovation",
        description: "Design and deploy a revolutionary yield farming mechanism with novel tokenomics",
        primaryTrait: "economicStrategy",
        secondaryTrait: "riskManagement",
        baseReward: { economicStrategy: 3, riskManagement: 2 },
        baseDuration: 60,
        baseDifficulty: 55,
        rarity: "common",
        minLevel: 1
      },
      {
        title: "Cross-Chain Bridge Development",
        description: "Launch a secure cross-chain bridge to expand your protocol's reach",
        primaryTrait: "economicStrategy",
        secondaryTrait: "riskManagement",
        baseReward: { economicStrategy: 5, riskManagement: 4 },
        baseDuration: 180,
        baseDifficulty: 80,
        rarity: "rare",
        minLevel: 7
      },
      {
        title: "AI-Powered Risk Engine",
        description: "Integrate artificial intelligence for real-time risk assessment and mitigation",
        primaryTrait: "riskManagement",
        secondaryTrait: "economicStrategy",
        baseReward: { riskManagement: 8, economicStrategy: 3 },
        baseDuration: 240,
        baseDifficulty: 95,
        rarity: "legendary",
        minLevel: 15
      }
    ]
  },
  {
    category: "community",
    templates: [
      {
        title: "Partnership Negotiations",
        description: "Secure a strategic alliance with a top-tier DeFi protocol for mutual benefit",
        primaryTrait: "leadership",
        secondaryTrait: "communityBuilding",
        baseReward: { leadership: 2, communityBuilding: 3 },
        baseDuration: 120,
        baseDifficulty: 65,
        rarity: "common",
        minLevel: 3
      },
      {
        title: "Global Marketing Campaign",
        description: "Launch a worldwide awareness campaign to onboard 100k new users",
        primaryTrait: "communityBuilding",
        secondaryTrait: "leadership",
        baseReward: { communityBuilding: 5, leadership: 2 },
        baseDuration: 150,
        baseDifficulty: 70,
        rarity: "rare",
        minLevel: 6
      },
      {
        title: "Developer Ecosystem Growth",
        description: "Build a thriving developer ecosystem with comprehensive tools and incentives",
        primaryTrait: "communityBuilding",
        secondaryTrait: "economicStrategy",
        baseReward: { communityBuilding: 6, economicStrategy: 3 },
        baseDuration: 200,
        baseDifficulty: 75,
        rarity: "rare",
        minLevel: 8
      }
    ]
  },
  {
    category: "crisis",
    templates: [
      {
        title: "Market Crash Survival",
        description: "Navigate your protocol through a devastating 80% market crash while maintaining stability",
        primaryTrait: "riskManagement",
        secondaryTrait: "leadership",
        baseReward: { riskManagement: 3, leadership: 2 },
        baseDuration: 30,
        baseDifficulty: 75,
        rarity: "common",
        minLevel: 2
      },
      {
        title: "Regulatory Compliance Crisis",
        description: "Adapt to sudden regulatory changes while maintaining protocol operations",
        primaryTrait: "leadership",
        secondaryTrait: "riskManagement",
        baseReward: { leadership: 4, riskManagement: 3 },
        baseDuration: 45,
        baseDifficulty: 80,
        rarity: "rare",
        minLevel: 4
      },
      {
        title: "Liquidity Crisis Management",
        description: "Prevent a cascading liquidation event during extreme market volatility",
        primaryTrait: "riskManagement",
        secondaryTrait: "economicStrategy",
        baseReward: { riskManagement: 6, economicStrategy: 4 },
        baseDuration: 20,
        baseDifficulty: 90,
        rarity: "legendary",
        minLevel: 12
      }
    ]
  }
];

// Mission system with Honeycomb Protocol integration
export const useHoneycombMissions = () => {
  const { connected, publicKey } = useWallet();

  const createMission = async (missionData) => {
    if (!connected || !publicKey) {
      throw new Error("Wallet not connected");
    }

    try {
      const result = await HoneycombMissions.createMission(
        { publicKey },
        {
          ...missionData,
          authority: publicKey.toString()
        }
      );

      return result;
    } catch (error) {
      console.error("Error creating mission:", error);
      return {
        success: false,
        error: error.message
      };
    }
  };

  const completeMission = async (missionId, expectedRewards) => {
    if (!connected || !publicKey) {
      throw new Error("Wallet not connected");
    }

    try {
      // Parse trait rewards from mission reward string
      const traitRewards = parseTraitRewards(expectedRewards);
      
      // Complete mission with trait integration
      const result = await completeMissionWithTraits(
        { publicKey },
        missionId,
        traitRewards
      );

      if (result.success) {
        // Trigger visual animations for trait changes
        animateTraitUpdates(traitRewards, result.streakBonus);
        
        return {
          success: true,
          rewards: result.traitResults,
          streakInfo: result.streakBonus,
          totalXP: result.totalXP,
          message: `Mission completed! Gained ${result.totalXP} XP (${result.streakBonus.extraXP} streak bonus)`
        };
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error completing mission:", error);
      return {
        success: false,
        error: error.message
      };
    }
  };

  const getActiveMissions = async () => {
    if (!connected || !publicKey) {
      return [];
    }

    try {
      const missions = await HoneycombMissions.getActiveMissions(publicKey.toString());
      
      // Enhance missions with streak multiplier information
      const enhancedMissions = await Promise.all(
        missions.map(async (mission) => {
          const streakInfo = await VerxioStreaks.checkStreak(publicKey.toString());
          const baseRewards = parseTraitRewards(mission.reward);
          const bonusRewards = {};
          
          // Calculate potential bonus rewards
          Object.entries(baseRewards).forEach(([trait, value]) => {
            bonusRewards[trait] = Math.floor(value * streakInfo.multiplier);
          });

          return {
            ...mission,
            baseRewards,
            bonusRewards,
            streakMultiplier: streakInfo.multiplier,
            streakCount: streakInfo.streakCount,
            potentialBonus: streakInfo.multiplier > 1
          };
        })
      );

      return enhancedMissions;
    } catch (error) {
      console.error("Error fetching missions:", error);
      return [];
    }
  };

  return {
    createMission,
    completeMission,
    getActiveMissions,
    connected,
    publicKey: publicKey?.toString()
  };
};

// Parse trait rewards from reward string
const parseTraitRewards = (rewardString) => {
  const rewards = {};
  
  // Parse strings like "+2 Risk Management", "+3 Community Building, +1 Leadership"
  const rewardParts = rewardString.split(',');
  
  rewardParts.forEach(part => {
    const match = part.trim().match(/\+(\d+)\s+(.+)/);
    if (match) {
      const value = parseInt(match[1]);
      const traitName = match[2].trim().toLowerCase();
      
      // Map trait names to our system
      const traitMap = {
        'risk management': 'riskManagement',
        'community building': 'communityBuilding',
        'economic strategy': 'economicStrategy',
        'leadership': 'leadership'
      };
      
      const mappedTrait = traitMap[traitName];
      if (mappedTrait) {
        rewards[mappedTrait] = (rewards[mappedTrait] || 0) + value;
      }
    }
  });
  
  return rewards;
};

// Animate trait updates in the UI
const animateTraitUpdates = (traitRewards, streakBonus) => {
  Object.entries(traitRewards).forEach(([trait, value]) => {
    const element = document.querySelector(`[data-trait="${trait}"] .progress-value`);
    if (element) {
      const oldValue = parseInt(element.textContent) || 0;
      const newValue = oldValue + value;
      animateTraitChange(trait, oldValue, newValue, element);
    }
  });

  // Show streak bonus notification
  if (streakBonus.extraXP > 0) {
    showStreakBonusNotification(streakBonus);
  }
};

// Show streak bonus notification
const showStreakBonusNotification = (streakBonus) => {
  // Create floating notification
  const notification = document.createElement('div');
  notification.className = 'streak-bonus-notification';
  notification.innerHTML = `
    <div class="streak-bonus-content">
      <div class="streak-icon">🔥</div>
      <div class="streak-text">
        <div class="streak-count">${streakBonus.streakCount} Day Streak!</div>
        <div class="streak-bonus">+${streakBonus.extraXP} XP Bonus</div>
      </div>
    </div>
  `;
  
  // Add styles
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
    padding: 1rem;
    border-radius: 12px;
    color: white;
    font-weight: bold;
    z-index: 1000;
    animation: slideInRight 0.5s ease-out, fadeOut 0.5s ease-in 2.5s;
    animation-fill-mode: both;
  `;
  
  document.body.appendChild(notification);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.remove();
  }, 3000);
};

// Mission difficulty calculator based on player traits
export const calculateMissionDifficulty = (mission, playerTraits) => {
  if (!mission.requirements || !playerTraits) {
    return { difficulty: 'unknown', canComplete: true };
  }

  const requirements = mission.requirements;
  let totalRequired = 0;
  let totalPlayer = 0;
  let canComplete = true;

  Object.entries(requirements).forEach(([trait, required]) => {
    const traitKey = trait.replace('min', '').toLowerCase();
    const playerValue = playerTraits[traitKey] || 0;
    
    totalRequired += required;
    totalPlayer += playerValue;
    
    if (playerValue < required) {
      canComplete = false;
    }
  });

  const ratio = totalPlayer / totalRequired;
  let difficulty;
  
  if (ratio >= 2) {
    difficulty = 'easy';
  } else if (ratio >= 1.5) {
    difficulty = 'medium';
  } else if (ratio >= 1) {
    difficulty = 'hard';
  } else {
    difficulty = 'impossible';
  }

  return {
    difficulty,
    canComplete,
    ratio,
    requirements,
    playerTraits: Object.fromEntries(
      Object.keys(requirements).map(req => [
        req.replace('min', '').toLowerCase(),
        playerTraits[req.replace('min', '').toLowerCase()] || 0
      ])
    )
  };
};

// Get available missions based on player progress
export const getAvailableMissionTemplates = (playerTraits, playerLevel = 1) => {
  const available = [];
  
  MISSION_TEMPLATES.forEach(category => {
    category.templates.forEach(template => {
      // Check level requirement
      if (playerLevel >= template.minLevel) {
        // Check trait requirements based on rarity
        const minTraitSum = {
          common: 20,
          rare: 40,
          legendary: 70
        };
        
        const playerTraitSum = Object.values(playerTraits).reduce((a, b) => a + b, 0);
        
        if (playerTraitSum >= minTraitSum[template.rarity]) {
          available.push({
            ...template,
            category: category.category
          });
        }
      }
    });
  });
  
  return available;
};

// Enhanced dynamic mission generation with new templates
export const generateEnhancedMission = (playerTraits, playerLevel = 1, missionId = null) => {
  const availableTemplates = getAvailableMissionTemplates(playerTraits, playerLevel);
  
  if (availableTemplates.length === 0) {
    // Fallback to basic mission if no templates available
    return generateBasicMission(playerTraits);
  }
  
  // Weight selection by rarity (common more likely)
  const rarityWeights = {
    common: 60,
    rare: 30,
    legendary: 10
  };
  
  const weightedTemplates = [];
  availableTemplates.forEach(template => {
    const weight = rarityWeights[template.rarity] || 60;
    for (let i = 0; i < weight; i++) {
      weightedTemplates.push(template);
    }
  });
  
  const selectedTemplate = weightedTemplates[Math.floor(Math.random() * weightedTemplates.length)];
  const difficulty = calculateEnhancedMissionDifficulty(playerTraits, selectedTemplate.baseDifficulty);
  
  if (difficulty === null) {
    return null; // Mission requirements not met
  }
  
  // Scale rewards based on difficulty, rarity, and player level
  const rarityMultipliers = {
    common: 1,
    rare: 1.5,
    legendary: 2.5
  };
  
  const rewardMultiplier = Math.max(0.5, difficulty / 50) * 
                          (1 + playerLevel * 0.1) * 
                          rarityMultipliers[selectedTemplate.rarity];
  
  const scaledRewards = {};
  Object.entries(selectedTemplate.baseReward).forEach(([trait, value]) => {
    scaledRewards[trait] = Math.round(value * rewardMultiplier);
  });
  
  const tvlBonus = calculateTVLBonus(scaledRewards);
  
  return {
    id: missionId || Date.now(),
    title: selectedTemplate.title,
    description: selectedTemplate.description,
    category: selectedTemplate.category,
    rarity: selectedTemplate.rarity,
    difficulty,
    reward: formatRewardString(scaledRewards),
    rewards: scaledRewards,
    tvlBonus,
    duration: Math.round(selectedTemplate.baseDuration * (1 + difficulty / 200)),
    primaryTrait: selectedTemplate.primaryTrait,
    secondaryTrait: selectedTemplate.secondaryTrait,
    completed: false,
    progress: 0
  };
};

// Enhanced mission difficulty calculation with trait requirements
export const calculateEnhancedMissionDifficulty = (playerTraits, baseDifficulty = 50, requiredTraits = {}) => {
  const totalTraits = Object.values(playerTraits).reduce((sum, trait) => sum + trait, 0);
  const averageTrait = totalTraits / Object.keys(playerTraits).length;
  
  // Check if player meets minimum requirements
  const meetsRequirements = Object.entries(requiredTraits).every(([trait, minValue]) => {
    return playerTraits[trait] >= minValue;
  });
  
  if (!meetsRequirements) {
    return null; // Mission not available
  }
  
  // Higher player traits make missions easier
  const difficultyModifier = Math.max(0.3, 1 - (averageTrait / 100));
  return Math.round(baseDifficulty * difficultyModifier);
};

// Calculate TVL bonus from trait rewards
const calculateTVLBonus = (rewards) => {
  const traitMultipliers = {
    leadership: 1000,
    riskManagement: 500,
    communityBuilding: 2000,
    economicStrategy: 800
  };
  
  let tvlBonus = 0;
  Object.entries(rewards).forEach(([trait, value]) => {
    tvlBonus += value * (traitMultipliers[trait] || 0);
  });
  
  return tvlBonus;
};

// Format reward object to string
const formatRewardString = (rewards) => {
  const traitNames = {
    leadership: 'Leadership',
    riskManagement: 'Risk Management',
    communityBuilding: 'Community Building',
    economicStrategy: 'Economic Strategy'
  };
  
  return Object.entries(rewards)
    .map(([trait, value]) => `+${value} ${traitNames[trait] || trait}`)
    .join(', ');
};

// Fallback basic mission generator
const generateBasicMission = (playerTraits) => {
  return {
    id: Date.now(),
    title: "Protocol Foundation",
    description: "Build the basic foundations of your DeFi protocol",
    category: "foundation",
    rarity: "common",
    difficulty: 30,
    reward: "+1 Leadership, +1 Risk Management",
    rewards: { leadership: 1, riskManagement: 1 },
    tvlBonus: 1500,
    duration: 30,
    primaryTrait: "leadership",
    secondaryTrait: "riskManagement",
    completed: false,
    progress: 0
  };
};

// Generate multiple missions for a player
export const generateMissionSet = (playerTraits, playerLevel = 1, count = 5) => {
  const missions = [];
  const usedTemplates = new Set();
  
  for (let i = 0; i < count; i++) {
    let attempts = 0;
    let mission = null;
    
    // Try to generate unique missions
    while (attempts < 10 && (!mission || usedTemplates.has(mission.title))) {
      mission = generateEnhancedMission(playerTraits, playerLevel, Date.now() + i);
      attempts++;
    }
    
    if (mission) {
      usedTemplates.add(mission.title);
      missions.push(mission);
    }
  }
  
  return missions;
};

// Legacy function for backward compatibility
export const generateDynamicMission = (playerTraits, completedMissions = []) => {
  const traitLevels = Object.values(playerTraits);
  const avgLevel = traitLevels.reduce((a, b) => a + b, 0) / traitLevels.length;
  const playerLevel = Math.floor(avgLevel / 10) + 1; // Rough level calculation
  
  return generateEnhancedMission(playerTraits, playerLevel) || generateBasicMission(playerTraits);
};
