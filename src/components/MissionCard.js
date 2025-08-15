import { useState, useEffect } from "react";

export function MissionCard({ mission, onComplete }) {
  const [timeRemaining, setTimeRemaining] = useState(mission.duration);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let timer;
    if (isActive && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [isActive, timeRemaining]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const handleStartMission = () => {
    setIsActive(true);
  };

  const handleCompleteMission = () => {
    onComplete(mission.reward); // Pass the reward data
    setIsActive(false);
  };

  const progressPercentage = ((mission.duration - timeRemaining) / mission.duration) * 100;

  return (
    <div className={`mission-card ${mission.completed ? 'completed' : ''} ${isActive ? 'active' : ''}`}>
      <div className="mission-header">
        <h4 className="mission-title">{mission.title}</h4>
        <div className="mission-status">
          {mission.completed && <span className="status-badge completed">Completed</span>}
          {isActive && <span className="status-badge active">In Progress</span>}
          {!isActive && !mission.completed && <span className="status-badge pending">Available</span>}
        </div>
      </div>

      <p className="mission-description">{mission.description}</p>

      <div className="mission-reward">
        <strong>Reward: </strong>
        <span className="reward-text">{mission.reward}</span>
      </div>

      {isActive && (
        <div className="mission-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="time-remaining">
            Time remaining: {formatTime(timeRemaining)}
          </div>
        </div>
      )}

      <div className="mission-actions">
        {!mission.completed && !isActive && (
          <button 
            className="btn btn-primary"
            onClick={handleStartMission}
          >
            Start Mission
          </button>
        )}
        
        {isActive && timeRemaining === 0 && (
          <button 
            className="btn btn-success"
            onClick={handleCompleteMission}
          >
            Claim Rewards
          </button>
        )}

        {mission.completed && (
          <div className="completion-message">
            ✓ Mission Completed!
          </div>
        )}
      </div>
    </div>
  );
}
