import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

const TUTORIAL_STEPS = [
  {
    id: 'welcome',
    title: '🎯 Welcome to Protocol Wars!',
    content: `
      <h3>Welcome, Future Protocol Commander!</h3>
      <p>Protocol Wars is a strategic blockchain game where you build and manage DeFi protocols to dominate the decentralized finance landscape.</p>
      <ul>
        <li>🏆 <strong>Compete</strong> against other protocols for TVL dominance</li>
        <li>🎯 <strong>Complete missions</strong> to improve your commander traits</li>
        <li>⚔️ <strong>Battle</strong> and capture rival protocols</li>
        <li>🤝 <strong>Form alliances</strong> for strategic advantages</li>
      </ul>
      <p>Your success depends on balancing four key traits that determine your protocol's strength.</p>
    `,
    position: 'center',
    showNext: true,
    showSkip: true
  },
  {
    id: 'traits',
    title: '📊 Understanding Commander Traits',
    content: `
      <h3>Your Four Core Traits</h3>
      <div class="trait-explanation">
        <div class="trait-item">
          <span class="trait-icon" style="color: #ff6b6b;">🎭</span>
          <div>
            <strong>Leadership</strong> (1,000 TVL per point)<br/>
            Strategic decision-making, alliance formation, and protocol governance
          </div>
        </div>
        <div class="trait-item">
          <span class="trait-icon" style="color: #4ecdc4;">🛡️</span>
          <div>
            <strong>Risk Management</strong> (500 TVL per point)<br/>
            Market crash survival, security audits, and volatility navigation
          </div>
        </div>
        <div class="trait-item">
          <span class="trait-icon" style="color: #45b7d1;">👥</span>
          <div>
            <strong>Community Building</strong> (2,000 TVL per point)<br/>
            User acquisition, social engagement, and network effects
          </div>
        </div>
        <div class="trait-item">
          <span class="trait-icon" style="color: #96ceb4;">💰</span>
          <div>
            <strong>Economic Strategy</strong> (800 TVL per point)<br/>
            Yield optimization, tokenomics design, and revenue generation
          </div>
        </div>
      </div>
      <p><strong>TVL Formula:</strong> (Leadership × 1,000) + (Risk Management × 500) + (Community Building × 2,000) + (Economic Strategy × 800)</p>
    `,
    position: 'left',
    target: '.traits-section',
    showNext: true,
    showBack: true
  },
  {
    id: 'missions',
    title: '🎯 Mission System',
    content: `
      <h3>Complete Missions to Grow Stronger</h3>
      <p>Missions are the primary way to improve your traits and grow your protocol:</p>
      <ul>
        <li><strong>Dynamic Generation:</strong> Missions adapt to your current trait levels</li>
        <li><strong>Multiple Categories:</strong> Security, Governance, Innovation, Community, Crisis</li>
        <li><strong>Rarity Levels:</strong> Common, Rare, and Legendary missions with better rewards</li>
        <li><strong>Streak Bonuses:</strong> Daily activity multiplies your XP rewards</li>
      </ul>
      <div class="tip-box">
        <strong>💡 Tip:</strong> Focus on missions that improve your weakest traits for balanced growth!
      </div>
    `,
    position: 'left',
    target: '.missions-section',
    showNext: true,
    showBack: true
  },
  {
    id: 'honeycomb',
    title: '🍯 3D Protocol Grid',
    content: `
      <h3>Navigate the DeFi Landscape</h3>
      <p>The 3D honeycomb grid represents the DeFi ecosystem:</p>
      <ul>
        <li><strong>Hexagon Size:</strong> Larger hexagons = Higher TVL protocols</li>
        <li><strong>Colors:</strong> Different protocol types (Lending, DEX, Derivatives, etc.)</li>
        <li><strong>Green Rings:</strong> Protocols you control</li>
        <li><strong>Yellow Rings:</strong> Currently selected protocol</li>
      </ul>
      <p>Click on any protocol to view details and plan your strategy.</p>
      <div class="controls-info">
        <strong>🎮 Controls:</strong>
        <ul>
          <li>🖱️ Click & drag to rotate the view</li>
          <li>⚙️ Scroll wheel to zoom in/out</li>
          <li>📱 Touch: Pinch to zoom, drag to rotate</li>
        </ul>
      </div>
    `,
    position: 'right',
    target: '.center-panel',
    showNext: true,
    showBack: true
  },
  {
    id: 'battle',
    title: '⚔️ Battle System',
    content: `
      <h3>Dominate the Competition</h3>
      <p>Engage in strategic battles to capture rival protocols:</p>
      <ul>
        <li><strong>Power Calculation:</strong> Based on your trait levels</li>
        <li><strong>Win Conditions:</strong> Higher combined traits = better odds</li>
        <li><strong>Rewards:</strong> Gain TVL and trait bonuses from victories</li>
        <li><strong>Penalties:</strong> Failed attacks result in losses</li>
      </ul>
      <div class="warning-box">
        <strong>⚠️ Strategy:</strong> Only attack when you have sufficient trait levels. Complete missions first to strengthen your position!
      </div>
    `,
    position: 'right',
    target: '.right-panel',
    showNext: true,
    showBack: true
  },
  {
    id: 'getting-started',
    title: '🚀 Ready to Begin!',
    content: `
      <h3>Your Journey Starts Now</h3>
      <p>You're ready to become a Protocol Wars commander! Here's your action plan:</p>
      <ol>
        <li><strong>Initialize your commander</strong> to create your profile</li>
        <li><strong>Complete your first missions</strong> to build basic traits</li>
        <li><strong>Explore the honeycomb grid</strong> to understand the ecosystem</li>
        <li><strong>Plan your first attack</strong> on a smaller protocol</li>
        <li><strong>Build streaks</strong> by playing daily for bonus rewards</li>
      </ol>
      <div class="success-box">
        <strong>🎉 Good luck, Commander!</strong><br/>
        The DeFi universe awaits your strategic mastery.
      </div>
    `,
    position: 'center',
    showNext: false,
    showBack: true,
    showFinish: true
  }
];

export function OnboardingTutorial({ onComplete, onSkip }) {
  const { connected } = useWallet();
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [hasSeenTutorial, setHasSeenTutorial] = useState(false);

  useEffect(() => {
    // Check if user has seen tutorial before
    const tutorialCompleted = localStorage.getItem('protocol_wars_tutorial_completed');
    if (tutorialCompleted) {
      setHasSeenTutorial(true);
      return;
    }

    // Show tutorial when wallet connects for the first time
    if (connected && !hasSeenTutorial) {
      setTimeout(() => setIsVisible(true), 1000); // Delay to let UI load
    }
  }, [connected, hasSeenTutorial]);

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('protocol_wars_tutorial_completed', 'skipped');
    setIsVisible(false);
    if (onSkip) onSkip();
  };

  const handleFinish = () => {
    localStorage.setItem('protocol_wars_tutorial_completed', 'completed');
    setIsVisible(false);
    if (onComplete) onComplete();
  };

  const handleRestart = () => {
    localStorage.removeItem('protocol_wars_tutorial_completed');
    setCurrentStep(0);
    setIsVisible(true);
    setHasSeenTutorial(false);
  };

  if (!isVisible || hasSeenTutorial) {
    // Show a small "Help" button for returning users
    return hasSeenTutorial ? (
      <button 
        className="tutorial-help-button"
        onClick={handleRestart}
        title="Restart Tutorial"
      >
        ❓
      </button>
    ) : null;
  }

  const step = TUTORIAL_STEPS[currentStep];

  const getTooltipPosition = () => {
    const position = step.position || 'center';
    const target = step.target;

    if (target && position !== 'center') {
      const element = document.querySelector(target);
      if (element) {
        const rect = element.getBoundingClientRect();
        const tooltipWidth = 400;
        const tooltipHeight = 300;

        switch (position) {
          case 'left':
            return {
              position: 'fixed',
              top: Math.max(20, rect.top),
              left: Math.max(20, rect.left - tooltipWidth - 20),
              maxWidth: tooltipWidth
            };
          case 'right':
            return {
              position: 'fixed',
              top: Math.max(20, rect.top),
              left: Math.min(window.innerWidth - tooltipWidth - 20, rect.right + 20),
              maxWidth: tooltipWidth
            };
          default:
            return {
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              maxWidth: tooltipWidth
            };
        }
      }
    }

    // Default center position
    return {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      maxWidth: '500px'
    };
  };

  return (
    <>
      {/* Backdrop */}
      <div className="tutorial-backdrop" onClick={handleSkip} />
      
      {/* Tutorial Tooltip */}
      <div 
        className="tutorial-tooltip"
        style={getTooltipPosition()}
      >
        <div className="tutorial-header">
          <h2>{step.title}</h2>
          <button className="tutorial-close" onClick={handleSkip}>×</button>
        </div>
        
        <div 
          className="tutorial-content"
          dangerouslySetInnerHTML={{ __html: step.content }}
        />
        
        <div className="tutorial-progress">
          <div className="progress-dots">
            {TUTORIAL_STEPS.map((_, index) => (
              <span 
                key={index}
                className={`progress-dot ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
              />
            ))}
          </div>
          
          <div className="tutorial-actions">
            {step.showBack && (
              <button className="btn btn-secondary" onClick={handleBack}>
                ← Back
              </button>
            )}
            
            {step.showSkip && (
              <button className="btn btn-text" onClick={handleSkip}>
                Skip Tutorial
              </button>
            )}
            
            {step.showNext && (
              <button className="btn btn-primary" onClick={handleNext}>
                Next →
              </button>
            )}
            
            {step.showFinish && (
              <button className="btn btn-success" onClick={handleFinish}>
                Let's Play! 🚀
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Highlight overlay for targeted elements */}
      {step.target && (
        <div className="tutorial-highlight" data-target={step.target} />
      )}
    </>
  );
}

// Tutorial trigger component for use in other parts of the app
export function TutorialTrigger({ children, step, content, position = 'top' }) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div 
      className="tutorial-trigger"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {children}
      {showTooltip && (
        <div className={`tutorial-mini-tooltip ${position}`}>
          <div className="tooltip-content">
            <strong>Step {step}</strong>
            <p>{content}</p>
          </div>
        </div>
      )}
    </div>
  );
}
