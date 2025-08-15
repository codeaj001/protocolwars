import { useState, useEffect, useCallback } from 'react';

// Protocol action definitions
const PROTOCOL_ACTIONS = {
  ATTACK: {
    id: 'attack',
    name: '⚔️ Attack',
    description: 'Launch a direct assault on this protocol',
    cost: { energy: 20 },
    cooldown: 5000,
    effects: ['damage', 'tvl_loss'],
    successRate: 0.7
  },
  
  HACK: {
    id: 'hack',
    name: '💻 Hack',
    description: 'Attempt to infiltrate and steal resources',
    cost: { energy: 30, riskManagement: 5 },
    cooldown: 15000,
    effects: ['resource_steal', 'temporary_control'],
    successRate: 0.5
  },
  
  INFILTRATE: {
    id: 'infiltrate',
    name: '🕵️ Infiltrate',
    description: 'Secretly gather intelligence on this protocol',
    cost: { energy: 10, leadership: 3 },
    cooldown: 8000,
    effects: ['reveal_info', 'weakness_detection'],
    successRate: 0.8
  },
  
  SABOTAGE: {
    id: 'sabotage',
    name: '💣 Sabotage',
    description: 'Disrupt protocol operations for a limited time',
    cost: { energy: 25, riskManagement: 8 },
    cooldown: 20000,
    effects: ['temporary_disable', 'efficiency_reduction'],
    successRate: 0.6
  },
  
  ALLIANCE_OFFER: {
    id: 'alliance_offer',
    name: '🤝 Alliance Offer',
    description: 'Propose a strategic alliance',
    cost: { energy: 15, leadership: 10, communityBuilding: 5 },
    cooldown: 30000,
    effects: ['alliance_formation', 'mutual_benefits'],
    successRate: 0.4
  },
  
  TRADE_PROPOSAL: {
    id: 'trade_proposal',
    name: '🔄 Trade Proposal',
    description: 'Offer to trade resources or benefits',
    cost: { energy: 10, economicStrategy: 8 },
    cooldown: 10000,
    effects: ['resource_exchange', 'temporary_boost'],
    successRate: 0.75
  },
  
  MARKET_SIEGE: {
    id: 'market_siege',
    name: '📈 Market Siege',
    description: 'Attempt to dominate the same market sector',
    cost: { energy: 40, economicStrategy: 15, communityBuilding: 10 },
    cooldown: 60000,
    effects: ['market_dominance', 'competitor_weakening'],
    successRate: 0.3
  },
  
  VIRAL_CAMPAIGN: {
    id: 'viral_campaign',
    name: '📱 Viral Campaign',
    description: 'Launch a social media campaign to steal users',
    cost: { energy: 20, communityBuilding: 12 },
    cooldown: 25000,
    effects: ['user_migration', 'reputation_damage'],
    successRate: 0.65
  },
  
  TECHNICAL_AUDIT: {
    id: 'technical_audit',
    name: '🔍 Technical Audit',
    description: 'Expose vulnerabilities in their smart contracts',
    cost: { energy: 35, riskManagement: 20 },
    cooldown: 45000,
    effects: ['vulnerability_exposure', 'trust_loss'],
    successRate: 0.4
  },
  
  BOUNTY_HUNT: {
    id: 'bounty_hunt',
    name: '🎯 Bounty Hunt',
    description: 'Recruit white hat hackers to find exploits',
    cost: { energy: 30, economicStrategy: 10, riskManagement: 15 },
    cooldown: 40000,
    effects: ['exploit_discovery', 'security_breach'],
    successRate: 0.35
  }
};

// Protocol interaction results
const INTERACTION_RESULTS = {
  SUCCESS: {
    attack: {
      title: '🎯 Attack Successful!',
      message: 'Your assault was devastating! The protocol has suffered significant damage.',
      effects: { tvlReduction: 0.15, damageDealt: 25 }
    },
    hack: {
      title: '💻 Hack Complete!',
      message: 'You successfully infiltrated their systems and extracted valuable data!',
      effects: { resourcesStolen: 1000, temporaryAccess: 30000 }
    },
    infiltrate: {
      title: '🕵️ Intelligence Gathered!',
      message: 'Your spy network has revealed crucial information about the target.',
      effects: { intelGained: true, weaknessRevealed: true }
    },
    sabotage: {
      title: '💣 Sabotage Executed!',
      message: 'Their operations are severely disrupted! They cannot act for a while.',
      effects: { disabledDuration: 45000, efficiencyReduction: 0.5 }
    },
    alliance_offer: {
      title: '🤝 Alliance Formed!',
      message: 'A new strategic partnership has been established!',
      effects: { allianceFormed: true, mutualBenefits: true }
    },
    trade_proposal: {
      title: '🔄 Trade Accepted!',
      message: 'Both protocols benefit from this exchange!',
      effects: { resourceBoost: 500, temporaryBuff: 60000 }
    },
    market_siege: {
      title: '📈 Market Dominated!',
      message: 'You have successfully cornered the market in this sector!',
      effects: { marketShare: 0.3, competitorWeakening: 0.2 }
    },
    viral_campaign: {
      title: '📱 Campaign Viral!',
      message: 'Your campaign went viral! Users are flocking to your protocol!',
      effects: { userMigration: 5000, reputationDamage: 0.1 }
    },
    technical_audit: {
      title: '🔍 Vulnerabilities Exposed!',
      message: 'Critical flaws have been revealed to the public!',
      effects: { trustLoss: 0.25, securityConcerns: true }
    },
    bounty_hunt: {
      title: '🎯 Exploit Discovered!',
      message: 'White hat hackers found a critical vulnerability!',
      effects: { exploitFound: true, securityBreach: 0.3 }
    }
  },
  
  FAILURE: {
    attack: {
      title: '⚠️ Attack Repelled!',
      message: 'Your attack was anticipated and successfully defended against.',
      effects: { retaliation: true, energyLoss: 10 }
    },
    hack: {
      title: '🚫 Hack Failed!',
      message: 'Their security systems detected your intrusion attempt.',
      effects: { detectionRisk: true, reputationLoss: 0.05 }
    },
    infiltrate: {
      title: '👀 Spy Detected!',
      message: 'Your infiltration attempt was discovered and thwarted.',
      effects: { spyCompromised: true, trustLoss: 0.1 }
    },
    sabotage: {
      title: '🛡️ Sabotage Prevented!',
      message: 'They detected your sabotage attempt and increased security.',
      effects: { securityIncrease: 0.2, alertLevel: 'high' }
    },
    alliance_offer: {
      title: '❌ Alliance Rejected!',
      message: 'Your alliance proposal was declined. They seem suspicious of your motives.',
      effects: { relationshipDamage: 0.15, diplomacyPenalty: true }
    },
    trade_proposal: {
      title: '🚫 Trade Declined!',
      message: 'They found your trade proposal unfavorable.',
      effects: { economicTension: true, trustReduction: 0.05 }
    },
    market_siege: {
      title: '🛡️ Market Defense!',
      message: 'They successfully defended their market position.',
      effects: { counterAttack: true, marketLoss: 0.1 }
    },
    viral_campaign: {
      title: '📉 Campaign Backfired!',
      message: 'Your campaign was exposed as manipulation and damaged your reputation.',
      effects: { reputationLoss: 0.2, userMigrationReverse: -2000 }
    },
    technical_audit: {
      title: '✅ Audit Clean!',
      message: 'Their code was found to be secure, boosting their credibility.',
      effects: { competitorBoost: 0.1, auditFailure: true }
    },
    bounty_hunt: {
      title: '🔒 No Exploits Found!',
      message: 'The bounty hunters found their security to be impeccable.',
      effects: { securityConfidence: 0.15, resourceWaste: 1000 }
    }
  }
};

export function useProtocolActions(playerStats, onActionResult) {
  const [actionCooldowns, setActionCooldowns] = useState({});
  const [energy, setEnergy] = useState(100);

  // Check if action can be performed
  const canPerformAction = useCallback((actionId, targetProtocol) => {
    const action = PROTOCOL_ACTIONS[actionId];
    if (!action) return false;

    // Check cooldown
    const cooldownEnd = actionCooldowns[actionId];
    if (cooldownEnd && cooldownEnd > Date.now()) {
      return false;
    }

    // Check energy
    if (energy < action.cost.energy) {
      return false;
    }

    // Check trait requirements
    return Object.entries(action.cost).every(([resource, cost]) => {
      if (resource === 'energy') return true;
      return (playerStats.traits[resource] || 0) >= cost;
    });
  }, [actionCooldowns, energy, playerStats]);

  // Perform action
  const performAction = useCallback((actionId, targetProtocol) => {
    const action = PROTOCOL_ACTIONS[actionId];
    if (!action || !canPerformAction(actionId, targetProtocol)) {
      return false;
    }

    // Deduct costs
    setEnergy(prev => prev - action.cost.energy);
    
    // Set cooldown
    setActionCooldowns(prev => ({
      ...prev,
      [actionId]: Date.now() + action.cooldown
    }));

    // Determine success/failure
    const isSuccess = Math.random() < action.successRate;
    const resultType = isSuccess ? 'SUCCESS' : 'FAILURE';
    const result = INTERACTION_RESULTS[resultType][actionId];

    // Trigger callback with result
    onActionResult?.({
      action,
      targetProtocol,
      isSuccess,
      result,
      timestamp: Date.now()
    });

    console.log(`${action.name} on ${targetProtocol.name}: ${resultType}`);
    return true;
  }, [canPerformAction, energy, onActionResult]);

  // Get remaining cooldown
  const getCooldownRemaining = useCallback((actionId) => {
    const cooldownEnd = actionCooldowns[actionId];
    if (!cooldownEnd) return 0;
    return Math.max(0, cooldownEnd - Date.now());
  }, [actionCooldowns]);

  // Regenerate energy over time
  useEffect(() => {
    const interval = setInterval(() => {
      setEnergy(prev => Math.min(100, prev + 1));
    }, 2000); // +1 energy every 2 seconds

    return () => clearInterval(interval);
  }, []);

  return {
    PROTOCOL_ACTIONS,
    canPerformAction,
    performAction,
    getCooldownRemaining,
    energy,
    actionCooldowns
  };
}

// Interactive Action Menu Component
export function ProtocolActionMenu({ 
  targetProtocol, 
  playerStats, 
  onActionPerformed,
  onClose 
}) {
  const {
    PROTOCOL_ACTIONS,
    canPerformAction,
    performAction,
    getCooldownRemaining,
    energy
  } = useProtocolActions(playerStats, onActionPerformed);

  const formatTime = (ms) => {
    const seconds = Math.ceil(ms / 1000);
    return seconds > 60 ? `${Math.floor(seconds/60)}:${(seconds%60).toString().padStart(2,'0')}` : `${seconds}s`;
  };

  const getActionDifficulty = (action) => {
    if (action.successRate >= 0.7) return 'Easy';
    if (action.successRate >= 0.5) return 'Medium';
    if (action.successRate >= 0.3) return 'Hard';
    return 'Extreme';
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return '#4ecdc4';
      case 'Medium': return '#feca57';
      case 'Hard': return '#ff6b6b';
      case 'Extreme': return '#ff4757';
      default: return '#ffffff';
    }
  };

  return (
    <div className="protocol-action-menu">
      <div className="action-menu-header">
        <h3>🎯 Actions: {targetProtocol.name}</h3>
        <div className="energy-display">
          <span>⚡ Energy: {energy}/100</span>
          <div className="energy-bar">
            <div 
              className="energy-fill" 
              style={{ width: `${energy}%` }}
            />
          </div>
        </div>
        <button className="close-button" onClick={onClose}>×</button>
      </div>

      <div className="protocol-info">
        <p><strong>Target:</strong> {targetProtocol.name}</p>
        <p><strong>TVL:</strong> ${(targetProtocol.tvl / 1000000).toFixed(1)}M</p>
        <p><strong>Type:</strong> {targetProtocol.type}</p>
        <p><strong>Status:</strong> {targetProtocol.playerOwned ? '✅ Controlled' : '🎯 Hostile'}</p>
      </div>

      <div className="actions-grid">
        {Object.values(PROTOCOL_ACTIONS).map(action => {
          const canPerform = canPerformAction(action.id, targetProtocol);
          const cooldownRemaining = getCooldownRemaining(action.id);
          const difficulty = getActionDifficulty(action);
          
          return (
            <div 
              key={action.id} 
              className={`action-card ${canPerform ? 'available' : 'unavailable'}`}
            >
              <div className="action-header">
                <span className="action-name">{action.name}</span>
                <span 
                  className="difficulty-badge"
                  style={{ color: getDifficultyColor(difficulty) }}
                >
                  {difficulty}
                </span>
              </div>
              
              <p className="action-description">{action.description}</p>
              
              <div className="action-stats">
                <div className="success-rate">
                  Success Rate: {(action.successRate * 100).toFixed(0)}%
                </div>
                <div className="action-cost">
                  Cost: {Object.entries(action.cost).map(([resource, cost]) => 
                    `${cost} ${resource}`
                  ).join(', ')}
                </div>
              </div>

              {cooldownRemaining > 0 ? (
                <div className="cooldown-display">
                  ⏳ Cooldown: {formatTime(cooldownRemaining)}
                </div>
              ) : (
                <button
                  className={`btn action-button ${canPerform ? 'btn-primary' : 'btn-disabled'}`}
                  onClick={() => {
                    if (performAction(action.id, targetProtocol)) {
                      // Action performed successfully
                    }
                  }}
                  disabled={!canPerform}
                >
                  {canPerform ? 'EXECUTE' : 'CANNOT USE'}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Action Result Notification
export function ActionResultNotification({ result, onClose }) {
  if (!result) return null;

  const { action, isSuccess, result: actionResult } = result;
  
  return (
    <div className={`action-result-notification ${isSuccess ? 'success' : 'failure'}`}>
      <div className="result-header">
        <h4>{actionResult.title}</h4>
        <button onClick={onClose}>×</button>
      </div>
      
      <p className="result-message">{actionResult.message}</p>
      
      {actionResult.effects && (
        <div className="result-effects">
          <strong>Effects:</strong>
          <ul>
            {Object.entries(actionResult.effects).map(([effect, value]) => (
              <li key={effect}>
                {effect.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}: {typeof value === 'number' ? (value > 1 ? value : `${(value * 100).toFixed(0)}%`) : value.toString()}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
