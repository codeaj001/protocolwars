import createEdgeClient from "@honeycomb-protocol/edge-client";
import { sendClientTransactions } from "@honeycomb-protocol/edge-client/client/walletHelpers";

// Use Honeynet for development
const API_URL = "https://edge.test.honeycombprotocol.com/";

export const client = createEdgeClient(API_URL, true);

// Project address will be created during setup
export let PROJECT_ADDRESS = null;

// Enhanced trait management functions with better error handling
export class HoneycombTraits {
  
  static async updateTrait(wallet, player, trait, value) {
    try {
      // Validate inputs
      if (!wallet || !wallet.publicKey) {
        throw new Error('Valid wallet with publicKey required');
      }
      
      if (!player) {
        throw new Error('Player address required');
      }
      
      if (typeof value !== 'number' || value < 0 || value > 100) {
        throw new Error('Trait value must be a number between 0 and 100');
      }
      
      const validTraits = ['leadership', 'riskManagement', 'communityBuilding', 'economicStrategy'];
      if (!validTraits.includes(trait)) {
        throw new Error(`Invalid trait: ${trait}. Valid traits: ${validTraits.join(', ')}`);
      }
      
      console.log(`Updating trait ${trait} to ${value} for player ${player.toString()}`);
      
      // Try Honeycomb integration with fallback
      if (PROJECT_ADDRESS) {
        try {
          // Attempt real Honeycomb trait update
          const profileData = await this.getOrCreateProfile(wallet, player);
          if (profileData.success) {
            const updateResult = await HoneycombProfiles.updateProfile(
              wallet, 
              profileData.profileAddress, 
              {
                traits: {
                  [trait]: value
                }
              }
            );
            
            if (updateResult.success) {
              return {
                success: true,
                trait: trait,
                newValue: value,
                transaction: updateResult.transaction,
                source: 'honeycomb'
              };
            }
          }
        } catch (honeycombError) {
          console.warn('Honeycomb trait update failed, using fallback:', honeycombError);
        }
      }
      
      // Fallback to local storage or mock
      const result = await this.updateTraitFallback(player.toString(), trait, value);
      return {
        success: true,
        trait: trait,
        newValue: value,
        transaction: null,
        source: 'fallback',
        ...result
      };
      
    } catch (error) {
      console.error("Error updating trait:", error);
      return { 
        success: false, 
        error: error.message || 'Unknown error updating trait',
        trait,
        attemptedValue: value
      };
    }
  }

  static async getPlayerTraits(playerAddress) {
    try {
      // Validate input
      if (!playerAddress) {
        console.warn('No player address provided');
        return null;
      }
      
      const addressString = typeof playerAddress === 'string' ? playerAddress : playerAddress.toString();
      console.log(`Fetching traits for player ${addressString}`);
      
      // Try Honeycomb first if project is initialized
      if (PROJECT_ADDRESS) {
        try {
          const honeycombTraits = await this.getTraitsFromHoneycomb(addressString);
          if (honeycombTraits) {
            return {
              ...honeycombTraits,
              tvl: this.calculateTVL(honeycombTraits),
              source: 'honeycomb',
              lastUpdated: Date.now()
            };
          }
        } catch (honeycombError) {
          console.warn('Honeycomb traits fetch failed, trying fallback:', honeycombError);
        }
      }
      
      // Try fallback storage
      const fallbackTraits = await this.getTraitsFromFallback(addressString);
      if (fallbackTraits) {
        return {
          ...fallbackTraits,
          tvl: this.calculateTVL(fallbackTraits),
          source: 'fallback',
          lastUpdated: Date.now()
        };
      }
      
      // Return null to trigger initialization flow
      console.log('No existing traits found, player needs initialization');
      return null;
      
    } catch (error) {
      console.error("Error fetching player traits:", error);
      return null;
    }
  }
  
  static async getTraitsFromHoneycomb(playerAddress) {
    try {
      // Attempt to fetch from Honeycomb with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
      
      // This would be the actual Honeycomb API call
      // For now, simulate with a promise that might fail
      await new Promise(resolve => setTimeout(resolve, Math.random() * 2000));
      
      clearTimeout(timeoutId);
      
      // Simulate random success/failure for development
      if (Math.random() > 0.7) {
        throw new Error('Simulated Honeycomb API failure');
      }
      
      return {
        leadership: Math.floor(Math.random() * 50) + 25,
        riskManagement: Math.floor(Math.random() * 50) + 20,
        communityBuilding: Math.floor(Math.random() * 50) + 30,
        economicStrategy: Math.floor(Math.random() * 50) + 25
      };
      
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Honeycomb API request timed out');
      }
      throw error;
    }
  }
  
  static async getTraitsFromFallback(playerAddress) {
    try {
      // Try to get from localStorage first
      const localData = localStorage.getItem(`protocol_wars_traits_${playerAddress}`);
      if (localData) {
        const traits = JSON.parse(localData);
        // Validate the data
        if (this.validateTraitsObject(traits)) {
          return traits;
        }
      }
      
      // Check if this is a returning player based on some heuristic
      const isReturningPlayer = localStorage.getItem(`protocol_wars_player_${playerAddress}`);
      if (isReturningPlayer) {
        // Return some baseline traits for returning players
        return {
          leadership: 15,
          riskManagement: 10,
          communityBuilding: 20,
          economicStrategy: 12
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error accessing fallback storage:', error);
      return null;
    }
  }
  
  static async updateTraitFallback(playerAddress, trait, value) {
    try {
      // Get current traits
      const currentTraits = await this.getTraitsFromFallback(playerAddress) || {
        leadership: 0,
        riskManagement: 0,
        communityBuilding: 0,
        economicStrategy: 0
      };
      
      // Update the specific trait
      currentTraits[trait] = value;
      currentTraits.lastUpdated = Date.now();
      
      // Save to localStorage
      localStorage.setItem(
        `protocol_wars_traits_${playerAddress}`, 
        JSON.stringify(currentTraits)
      );
      
      // Mark as known player
      localStorage.setItem(`protocol_wars_player_${playerAddress}`, 'true');
      
      return { stored: true };
    } catch (error) {
      console.error('Error updating fallback traits:', error);
      return { stored: false, error: error.message };
    }
  }
  
  static validateTraitsObject(traits) {
    if (!traits || typeof traits !== 'object') return false;
    
    const requiredTraits = ['leadership', 'riskManagement', 'communityBuilding', 'economicStrategy'];
    return requiredTraits.every(trait => {
      const value = traits[trait];
      return typeof value === 'number' && value >= 0 && value <= 100;
    });
  }
  
  static async getOrCreateProfile(wallet, player) {
    try {
      // Try to get existing profile first
      // This would need to be implemented based on Honeycomb's profile lookup
      
      // For now, simulate profile creation
      const profileResult = await HoneycombProfiles.createProfile(wallet, {
        bio: "Protocol Wars Commander",
        name: `Commander ${player.toString().slice(0, 8)}`
      });
      
      return profileResult;
    } catch (error) {
      console.error('Error getting/creating profile:', error);
      return { success: false, error };
    }
  }

  static calculateTVL(traits) {
    // TVL calculation formula from the prompt
    return (traits.leadership * 1000) + 
           (traits.riskManagement * 500) + 
           (traits.communityBuilding * 2000) + 
           (traits.economicStrategy * 800);
  }
}

// Mission management functions
export class HoneycombMissions {
  
  static async createMission(wallet, missionData) {
    try {
      // Create mission using Honeycomb Protocol
      console.log("Creating mission:", missionData);
      
      // Mock implementation
      return {
        success: true,
        missionId: Date.now(),
        transaction: null
      };
    } catch (error) {
      console.error("Error creating mission:", error);
      return { success: false, error };
    }
  }

  static async completeMission(wallet, missionId) {
    try {
      console.log(`Completing mission ${missionId}`);
      
      // This would interact with Honeycomb's mission system
      // For now, return mock success
      return {
        success: true,
        rewards: {
          xp: 100,
          traits: {
            riskManagement: 2
          }
        },
        transaction: null
      };
    } catch (error) {
      console.error("Error completing mission:", error);
      return { success: false, error };
    }
  }

  static async getActiveMissions(playerAddress) {
    try {
      // Fetch active missions from Honeycomb
      console.log(`Fetching missions for ${playerAddress}`);
      
      // Return mock missions for development
      return [
        {
          id: 1,
          title: "Market Crash Survival",
          description: "Navigate your protocol through a 50% market downturn",
          reward: "+2 Risk Management",
          duration: 30,
          completed: false
        }
      ];
    } catch (error) {
      console.error("Error fetching missions:", error);
      return [];
    }
  }
}

// Profile management
export class HoneycombProfiles {
  
  static async createProfile(wallet, profileData) {
    try {
      if (!PROJECT_ADDRESS) {
        throw new Error("Project not initialized");
      }

      const { createNewProfileTransaction: txResponse } = await client.createNewProfileTransaction({
        project: PROJECT_ADDRESS,
        payer: wallet.publicKey.toString(),
        identity: "main",
        info: {
          bio: profileData.bio || "Protocol Wars Player",
          name: profileData.name || "Anonymous Commander",
          pfp: profileData.pfp || ""
        }
      });

      // Sign and send transaction
      const response = await sendClientTransactions(client, wallet, txResponse);
      
      return {
        success: true,
        profileAddress: response.profileAddress,
        transaction: response
      };
    } catch (error) {
      console.error("Error creating profile:", error);
      return { success: false, error };
    }
  }

  static async updateProfile(wallet, profileAddress, updates) {
    try {
      // Update profile with new trait values and custom data
      const customData = {
        add: [
          ["leadership", updates.traits?.leadership?.toString() || "0"],
          ["riskManagement", updates.traits?.riskManagement?.toString() || "0"],
          ["communityBuilding", updates.traits?.communityBuilding?.toString() || "0"],
          ["economicStrategy", updates.traits?.economicStrategy?.toString() || "0"],
          ["tvl", updates.tvl?.toString() || "0"]
        ]
      };

      const { createUpdateProfileTransaction: txResponse } = await client.createUpdateProfileTransaction({
        payer: wallet.publicKey.toString(),
        profile: profileAddress,
        customData
      });

      const response = await sendClientTransactions(client, wallet, txResponse);
      
      return {
        success: true,
        transaction: response
      };
    } catch (error) {
      console.error("Error updating profile:", error);
      return { success: false, error };
    }
  }
}

// Project initialization
export async function initializeProject(wallet) {
  try {
    const { createCreateProjectTransaction: { project: projectAddress, tx: txResponse } } = 
      await client.createCreateProjectTransaction({
        name: "Protocol Wars",
        authority: wallet.publicKey.toString(),
        profileDataConfig: {
          achievements: [
            "Market Survivor",
            "Community Builder", 
            "TVL Master",
            "Alliance Maker",
            "Security Expert"
          ],
          customDataFields: [
            "leadership",
            "riskManagement", 
            "communityBuilding",
            "economicStrategy",
            "tvl",
            "streakCount"
          ]
        }
      });

    const response = await sendClientTransactions(client, wallet, txResponse);
    
    PROJECT_ADDRESS = projectAddress;
    
    return {
      success: true,
      projectAddress,
      transaction: response
    };
  } catch (error) {
    console.error("Error initializing project:", error);
    return { success: false, error };
  }
}
