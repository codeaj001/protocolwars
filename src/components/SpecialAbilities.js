import { useState, useEffect, useCallback } from 'react';

// Special ability definitions
const ABILITIES = {
  LEADERSHIP_BURST: {
    id: 'leadership_burst',
    name: '🎭 Leadership Burst',
    description: 'Temporary +20 Leadership for 30 seconds',
    cooldown: 60000, // 60 seconds
    duration: 30000, // 30 seconds
    cost: { leadership: 10 },
    requiredTrait: { trait: 'leadership', level: 20 },
    effect: { leadership: 20 },
    type: 'buff'
  },
  
  SHIELD_PROTOCOL: {
    id: 'shield_protocol',
    name: '🛡️ Shield Protocol',
    description: 'Absorbs next 3 attacks completely',
    cooldown: 90000, // 90 seconds
    duration: 60000, // 60 seconds or until 3 hits
    cost: { riskManagement: 15 },
    requiredTrait: { trait: 'riskManagement', level: 25 },
    effect: { shieldCharges: 3 },
    type: 'defense'
  },
  
  VIRAL_MARKETING: {
    id: 'viral_marketing',
    name: '📈 Viral Marketing',
    description: 'Doubles community building effects for 45 seconds',
    cooldown: 120000, // 2 minutes
    duration: 45000, // 45 seconds
    cost: { communityBuilding: 20 },
    requiredTrait: { trait: 'communityBuilding', level: 30 },
    effect: { communityMultiplier: 2 },
    type: 'buff'
  },
  
  YIELD_SURGE: {
    id: 'yield_surge',
    name: '💰 Yield Surge',
    description: 'Instantly gain TVL based on economic strategy',
    cooldown: 180000, // 3 minutes
    duration: 0, // Instant
    cost: { economicStrategy: 25 },
    requiredTrait: { trait: 'economicStrategy', level: 35 },
    effect: { instantTVL: true },
    type: 'instant'
  },
  
  PROTOCOL_FREEZE: {
    id: 'protocol_freeze',
    name: '❄️ Protocol Freeze',
    description: 'Freezes all enemy protocols for 15 seconds',
    cooldown: 240000, // 4 minutes
    duration: 15000, // 15 seconds
    cost: { leadership: 20, riskManagement: 15 },
    requiredTrait: { trait: 'leadership', level: 50 },
    effect: { freezeEnemies: true },
    type: 'debuff'
  },
  
  ALLIANCE_CALL: {
    id: 'alliance_call',
    name: '🤝 Alliance Call',
    description: 'Summons allied protocols to assist in battle',
    cooldown: 300000, // 5 minutes
    duration: 30000, // 30 seconds
    cost: { communityBuilding: 30, leadership: 15 },
    requiredTrait: { trait: 'communityBuilding', level: 40 },
    effect: { summonAllies: 3 },
    type: 'summon'
  },
  
  MARKET_MANIPULATION: {
    id: 'market_manipulation',
    name: '📊 Market Manipulation',
    description: 'Reduces all enemy TVL by 10% permanently',
    cooldown: 420000, // 7 minutes
    duration: 0, // Instant
    cost: { economicStrategy: 40, leadership: 20 },
    requiredTrait: { trait: 'economicStrategy', level: 60 },
    effect: { enemyTVLReduction: 0.1 },
    type: 'instant'
  },
  
  ULTIMATE_HACK: {
    id: 'ultimate_hack',
    name: '💀 Ultimate Hack',
    description: 'Massive damage to all visible protocols',
    cooldown: 600000, // 10 minutes
    duration: 0, // Instant
    cost: { riskManagement: 50, economicStrategy: 30 },
    requiredTrait: { trait: 'riskManagement', level: 70 },
    effect: { massDestruction: true },
    type: 'ultimate'
  },
  
  // New special abilities
  LIGHTNING_STRIKE: {
    id: 'lightning_strike',
    name: '⚡ Lightning Strike',
    description: 'Chain attack that jumps between protocols',
    cooldown: 30000,
    cost: { economicStrategy: 20, leadership: 10 },
    effect: { chainDamage: true, bounces: 3 }
  },
  SHIELD_MATRIX: {
    id: 'shield_matrix',
    name: '🛡️ Shield Matrix',
    description: 'Protect nearby allied protocols',
    cooldown: 45000,
    cost: { riskManagement: 25 },
    effect: { allyProtection: 0.5, duration: 20000 }
  }
};

export function useSpecialAbilities(playerTraits, onAbilityUsed) {
  const [cooldowns, setCooldowns] = useState({});
  const [activeAbilities, setActiveAbilities] = useState({});

  // Get available abilities based on player traits
  const getAvailableAbilities = useCallback(() => {
    return Object.values(ABILITIES).filter(ability => {
      const required = ability.requiredTrait;
      return playerTraits[required.trait] >= required.level;
    });
  }, [playerTraits]);

  // Check if ability can be used
  const canUseAbility = useCallback((abilityId) => {
    const ability = ABILITIES[abilityId];
    if (!ability) return false;

    // Check cooldown
    if (cooldowns[abilityId] && cooldowns[abilityId] > Date.now()) {
      return false;
    }

    // Check trait costs
    return Object.entries(ability.cost).every(([trait, cost]) => {
      return playerTraits[trait] >= cost;
    });
  }, [cooldowns, playerTraits]);

  // Use ability
  const useAbility = useCallback((abilityId) => {
    const ability = ABILITIES[abilityId];
    if (!ability || !canUseAbility(abilityId)) {
      return false;
    }

    // Set cooldown
    setCooldowns(prev => ({
      ...prev,
      [abilityId]: Date.now() + ability.cooldown
    }));

    // Activate ability if it has duration
    if (ability.duration > 0) {
      setActiveAbilities(prev => ({
        ...prev,
        [abilityId]: {
          ...ability,
          startTime: Date.now(),
          endTime: Date.now() + ability.duration
        }
      }));

      // Remove after duration
      setTimeout(() => {
        setActiveAbilities(prev => {
          const updated = { ...prev };
          delete updated[abilityId];
          return updated;
        });
      }, ability.duration);
    }

    // Trigger ability effect
    onAbilityUsed?.(ability);
    
    console.log(`🌟 ${ability.name} activated!`);
    return true;
  }, [canUseAbility, onAbilityUsed]);

  // Get remaining cooldown time
  const getCooldownTime = useCallback((abilityId) => {
    const cooldownEnd = cooldowns[abilityId];
    if (!cooldownEnd) return 0;
    
    const remaining = cooldownEnd - Date.now();
    return Math.max(0, remaining);
  }, [cooldowns]);

  // Update active abilities (remove expired ones)
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveAbilities(prev => {
        const updated = { ...prev };
        const now = Date.now();

        Object.keys(updated).forEach(abilityId => {
          if (updated[abilityId].endTime <= now) {
            delete updated[abilityId];
            console.log(`⏰ ${ABILITIES[abilityId].name} effect ended`);
          }
        });

        return Object.keys(updated).length !== Object.keys(prev).length ? updated : prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    ABILITIES,
    getAvailableAbilities,
    canUseAbility,
    useAbility,
    getCooldownTime,
    activeAbilities,
    cooldowns
  };
}

// UI Component for Special Abilities
export function SpecialAbilitiesPanel({ 
  playerTraits, 
  onAbilityUsed,
  className = '' 
}) {
  const {
    getAvailableAbilities,
    canUseAbility,
    useAbility,
    getCooldownTime,
    activeAbilities
  } = useSpecialAbilities(playerTraits, onAbilityUsed);

  const availableAbilities = getAvailableAbilities();

  const formatTime = (ms) => {
    const seconds = Math.ceil(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`;
  };

  const getAbilityTypeColor = (type) => {
    switch (type) {
      case 'buff': return '#4ecdc4';
      case 'defense': return '#45b7d1';
      case 'instant': return '#feca57';
      case 'debuff': return '#ff6b6b';
      case 'summon': return '#96ceb4';
      case 'ultimate': return '#ff4757';
      default: return '#ffffff';
    }
  };

  return (
    <div className={`special-abilities-panel ${className}`}>
      <h3>⚡ Special Abilities</h3>
      
      <div className="abilities-grid">
        {availableAbilities.map(ability => {
          const canUse = canUseAbility(ability.id);
          const cooldownTime = getCooldownTime(ability.id);
          const isActive = activeAbilities[ability.id];
          
          return (
            <div 
              key={ability.id} 
              className={`ability-card ${canUse ? 'usable' : 'disabled'} ${isActive ? 'active' : ''}`}
              style={{ 
                borderColor: getAbilityTypeColor(ability.type),
                backgroundColor: isActive ? `${getAbilityTypeColor(ability.type)}20` : 'transparent'
              }}
            >
              <div className="ability-header">
                <span className="ability-name">{ability.name}</span>
                {isActive && <span className="active-indicator">ACTIVE</span>}
              </div>
              
              <p className="ability-description">{ability.description}</p>
              
              <div className="ability-cost">
                <strong>Cost:</strong> {
                  Object.entries(ability.cost)
                    .map(([trait, cost]) => `${cost} ${trait}`)
                    .join(', ')
                }
              </div>
              
              {cooldownTime > 0 ? (
                <div className="cooldown-timer">
                  ⏳ {formatTime(cooldownTime)}
                </div>
              ) : (
                <button 
                  className={`btn ability-button ${canUse ? 'btn-primary' : 'btn-disabled'}`}
                  onClick={() => useAbility(ability.id)}
                  disabled={!canUse}
                >
                  {canUse ? 'USE' : 'NOT READY'}
                </button>
              )}
              
              {isActive && ability.duration > 0 && (
                <div className="duration-bar">
                  <div 
                    className="duration-fill"
                    style={{
                      width: `${((ability.duration - (Date.now() - isActive.startTime)) / ability.duration) * 100}%`,
                      backgroundColor: getAbilityTypeColor(ability.type)
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {availableAbilities.length === 0 && (
        <div className="no-abilities">
          <p>🔒 Increase your traits to unlock special abilities!</p>
        </div>
      )}
    </div>
  );
}

// Quick ability hotbar component
export function AbilityHotbar({ 
  playerTraits, 
  onAbilityUsed,
  maxSlots = 4 
}) {
  const {
    getAvailableAbilities,
    canUseAbility,
    useAbility,
    getCooldownTime
  } = useSpecialAbilities(playerTraits, onAbilityUsed);

  const topAbilities = getAvailableAbilities().slice(0, maxSlots);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      const keyNum = parseInt(e.key);
      if (keyNum >= 1 && keyNum <= topAbilities.length) {
        const ability = topAbilities[keyNum - 1];
        if (canUseAbility(ability.id)) {
          useAbility(ability.id);
        }
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [topAbilities, canUseAbility, useAbility]);

  return (
    <div className="ability-hotbar">
      {topAbilities.map((ability, index) => {
        const canUse = canUseAbility(ability.id);
        const cooldownTime = getCooldownTime(ability.id);
        
        return (
          <button
            key={ability.id}
            className={`hotbar-ability ${canUse ? 'ready' : 'disabled'}`}
            onClick={() => useAbility(ability.id)}
            disabled={!canUse}
            title={`${ability.name} - ${ability.description} (Press ${index + 1})`}
          >
            <span className="hotbar-icon">{ability.name.split(' ')[0]}</span>
            <span className="hotbar-key">{index + 1}</span>
            {cooldownTime > 0 && (
              <div className="cooldown-overlay">
                <span className="cooldown-text">{Math.ceil(cooldownTime / 1000)}</span>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
