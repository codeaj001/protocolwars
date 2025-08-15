import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

export function BattleSystem({ selectedProtocol, playerData, onBattleResult, onProtocolCapture }) {
  const { publicKey } = useWallet();
  const [battleState, setBattleState] = useState(null);
  const [battleLog, setBattleLog] = useState([]);
  const [isAttacking, setIsAttacking] = useState(false);

  // Check if player can attack selected protocol
  const canAttack = useCallback(() => {
    if (!selectedProtocol || !playerData) return false;
    
    // Player needs minimum traits to attack
    const minTraitSum = 50;
    const playerTraitSum = Object.values(playerData.traits).reduce((a, b) => a + b, 0);
    
    return playerTraitSum >= minTraitSum && !selectedProtocol.playerOwned;
  }, [selectedProtocol, playerData]);

  // Calculate battle odds
  const calculateBattleOdds = useCallback(() => {
    if (!selectedProtocol || !playerData) return { playerWinChance: 0, enemyPower: 0, playerPower: 0 };
    
    // Player power based on traits
    const playerPower = 
      playerData.traits.leadership * 2 +
      playerData.traits.riskManagement * 1.5 +
      playerData.traits.communityBuilding * 1.8 +
      playerData.traits.economicStrategy * 2.2;
    
    // Enemy power based on TVL and random factors
    const enemyBasePower = selectedProtocol.tvl / 10000;
    const enemyPower = enemyBasePower + (Math.random() * 50);
    
    const totalPower = playerPower + enemyPower;
    const playerWinChance = Math.max(0.1, Math.min(0.9, playerPower / totalPower));
    
    return { playerWinChance, enemyPower: Math.round(enemyPower), playerPower: Math.round(playerPower) };
  }, [selectedProtocol, playerData]);

  // Execute battle
  const executeBattle = async () => {
    if (!canAttack() || isAttacking) return;
    
    setIsAttacking(true);
    setBattleLog([]);
    
    const { playerWinChance, enemyPower, playerPower } = calculateBattleOdds();
    
    setBattleState({
      protocol: selectedProtocol,
      playerPower,
      enemyPower,
      playerWinChance,
      phase: 'combat'
    });
    
    // Simulate battle phases
    const phases = [
      'Initial reconnaissance...',
      'Deploying economic strategies...',
      'Community mobilization in progress...',
      'Risk management protocols active...',
      'Final assault commencing...'
    ];
    
    for (let i = 0; i < phases.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setBattleLog(prev => [...prev, phases[i]]);
    }
    
    // Determine winner
    const playerWins = Math.random() < playerWinChance;
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (playerWins) {
      const rewards = {
        tvlGain: Math.round(selectedProtocol.tvl * 0.3),
        traitBonus: {
          leadership: Math.floor(Math.random() * 3) + 1,
          riskManagement: Math.floor(Math.random() * 2) + 1,
          economicStrategy: Math.floor(Math.random() * 4) + 2
        }
      };
      
      setBattleLog(prev => [...prev, '🎉 VICTORY! Protocol captured!']);
      setBattleState(prev => ({ ...prev, result: 'victory', rewards }));
      
      // Notify parent components
      onBattleResult('victory', rewards);
      onProtocolCapture(selectedProtocol.id);
      
    } else {
      const penalties = {
        tvlLoss: Math.round(playerData.tvl * 0.1),
        traitPenalty: {
          leadership: -1,
          riskManagement: -1
        }
      };
      
      setBattleLog(prev => [...prev, '💥 DEFEAT! Retreat and regroup!']);
      setBattleState(prev => ({ ...prev, result: 'defeat', penalties }));
      
      onBattleResult('defeat', penalties);
    }
    
    setIsAttacking(false);
    
    // Clear battle after 5 seconds
    setTimeout(() => {
      setBattleState(null);
      setBattleLog([]);
    }, 5000);
  };

  if (!selectedProtocol) {
    return (
      <div className="battle-system">
        <div className="battle-instructions">
          <h3>🎯 Protocol Wars Battle System</h3>
          <p>Select a protocol from the honeycomb grid to engage in battle!</p>
          <div className="instruction-list">
            <div className="instruction-item">
              <span className="instruction-icon">🟢</span>
              <span>Green = Your controlled protocols</span>
            </div>
            <div className="instruction-item">
              <span className="instruction-icon">🔴</span>
              <span>Others = Available for conquest</span>
            </div>
            <div className="instruction-item">
              <span className="instruction-icon">⚔️</span>
              <span>Click any uncontrolled protocol to attack</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const battleOdds = calculateBattleOdds();

  return (
    <div className="battle-system">
      <div className="selected-protocol">
        <h3>🎯 Target: {selectedProtocol.name}</h3>
        <div className="protocol-info">
          <div className="info-item">
            <span>TVL: ${(selectedProtocol.tvl / 1000000).toFixed(1)}M</span>
          </div>
          <div className="info-item">
            <span>Type: {selectedProtocol.type}</span>
          </div>
          <div className="info-item">
            <span>Status: {selectedProtocol.playerOwned ? 'CONTROLLED' : 'HOSTILE'}</span>
          </div>
        </div>
      </div>

      {!battleState && (
        <div className="battle-prep">
          <div className="battle-odds">
            <h4>⚔️ Battle Analysis</h4>
            <div className="power-comparison">
              <div className="power-bar">
                <span>Your Power: {battleOdds.playerPower}</span>
                <div className="power-meter">
                  <div 
                    className="power-fill player" 
                    style={{ width: `${battleOdds.playerWinChance * 100}%` }}
                  />
                </div>
              </div>
              <div className="power-bar">
                <span>Enemy Power: {battleOdds.enemyPower}</span>
                <div className="power-meter">
                  <div 
                    className="power-fill enemy" 
                    style={{ width: `${(1 - battleOdds.playerWinChance) * 100}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="win-chance">
              Victory Chance: {(battleOdds.playerWinChance * 100).toFixed(1)}%
            </div>
          </div>
          
          {selectedProtocol.playerOwned ? (
            <div className="owned-protocol">
              <p>✅ You already control this protocol!</p>
              <p>Collect resources or defend against attacks.</p>
            </div>
          ) : (
            <div className="attack-controls">
              {canAttack() ? (
                <button 
                  className="btn btn-attack"
                  onClick={executeBattle}
                  disabled={isAttacking}
                >
                  ⚔️ ATTACK PROTOCOL
                </button>
              ) : (
                <div className="cannot-attack">
                  <p>⚠️ Insufficient trait levels to attack!</p>
                  <p>Complete more missions to strengthen your commander.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {battleState && (
        <div className="battle-arena">
          <div className="battle-header">
            <h4>⚔️ Battle in Progress</h4>
            <div className="combatants">
              <div className="combatant player">
                <span>You</span>
                <span className="power">{battleState.playerPower}</span>
              </div>
              <div className="vs">VS</div>
              <div className="combatant enemy">
                <span>{battleState.protocol.name}</span>
                <span className="power">{battleState.enemyPower}</span>
              </div>
            </div>
          </div>
          
          <div className="battle-log">
            {battleLog.map((log, index) => (
              <div key={index} className="log-entry">
                {log}
              </div>
            ))}
          </div>

          {battleState.result && (
            <div className={`battle-result ${battleState.result}`}>
              {battleState.result === 'victory' ? (
                <div className="victory-rewards">
                  <h4>🎉 VICTORY!</h4>
                  <div className="rewards">
                    <p>TVL Gained: +${(battleState.rewards.tvlGain / 1000000).toFixed(1)}M</p>
                    <div className="trait-bonuses">
                      {Object.entries(battleState.rewards.traitBonus).map(([trait, bonus]) => (
                        <span key={trait} className="trait-bonus">
                          +{bonus} {trait.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="defeat-penalties">
                  <h4>💥 DEFEAT!</h4>
                  <div className="penalties">
                    <p>TVL Lost: -${(battleState.penalties.tvlLoss / 1000000).toFixed(1)}M</p>
                    <div className="trait-penalties">
                      {Object.entries(battleState.penalties.traitPenalty).map(([trait, penalty]) => (
                        <span key={trait} className="trait-penalty">
                          {penalty} {trait.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
