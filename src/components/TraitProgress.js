import { useEffect, useState } from "react";

export function TraitProgress({ name, value, max, color }) {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    // Animate the progress bar
    const timer = setTimeout(() => {
      setAnimatedValue(value);
    }, 100);

    return () => clearTimeout(timer);
  }, [value]);

  const percentage = (animatedValue / max) * 100;
  const circumference = 2 * Math.PI * 45; // radius of 45
  const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;

  const traitKey = name.toLowerCase().replace(/\s+/g, '');

  return (
    <div className="trait-progress" data-trait={traitKey}>
      <div className="progress-circle">
        <svg width="100" height="100" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="6"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={0}
            transform="rotate(-90 50 50)"
            style={{
              transition: "stroke-dasharray 0.5s ease-in-out"
            }}
          />
        </svg>
        <div className="progress-text">
          <span className="progress-value">{animatedValue}</span>
        </div>
      </div>
      <div className="trait-info">
        <h4 className="trait-name">{name}</h4>
        <div className="trait-bar">
          <div 
            className="trait-fill"
            style={{
              width: `${percentage}%`,
              backgroundColor: color,
              transition: "width 0.5s ease-in-out"
            }}
          />
        </div>
      </div>
    </div>
  );
}
