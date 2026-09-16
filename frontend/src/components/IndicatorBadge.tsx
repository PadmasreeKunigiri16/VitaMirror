import React from 'react';
import type { IndicatorLevel, WellnessLevel } from '../types/wellness';

type Level = IndicatorLevel | WellnessLevel | string;

interface IndicatorBadgeProps {
  level: Level;
  label?: string;
  showDot?: boolean;
}

function getLevelClass(level: Level): string {
  switch (level) {
    case 'low':
    case 'good':
      return 'badge-low';
    case 'moderate':
    case 'fair':
      return 'badge-moderate';
    case 'elevated':
    case 'poor':
      return 'badge-elevated';
    default:
      return 'badge-unknown';
  }
}

function getDotClass(level: Level): string {
  switch (level) {
    case 'low':
    case 'good':
      return 'green';
    case 'moderate':
    case 'fair':
      return 'yellow';
    case 'elevated':
    case 'poor':
      return 'red';
    default:
      return 'gray';
  }
}

function formatLevel(level: Level): string {
  const map: Record<string, string> = {
    low: 'Low',
    moderate: 'Moderate',
    elevated: 'Elevated',
    good: 'Good',
    fair: 'Fair',
    poor: 'Poor',
    unknown: 'Unknown',
  };
  return map[level] || String(level);
}

const IndicatorBadge: React.FC<IndicatorBadgeProps> = ({
  level,
  label,
  showDot = true,
}) => {
  return (
    <span className={`badge ${getLevelClass(level)}`}>
      {showDot && <span className={`status-dot ${getDotClass(level)}`} />}
      {label ? `${label}: ` : ''}
      {formatLevel(level)}
    </span>
  );
};

export default IndicatorBadge;
