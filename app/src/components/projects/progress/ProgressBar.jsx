import React, { useMemo } from 'react';
import { brandGreen, brandBlue, neonOrange } from '../../../styles/colors';

/**
 * Enhanced progress bar component with dynamic shimmer animation
 * Uses a sophisticated color interpolation between brand colors
 */
const ProgressBar = ({ progress }) => {
  // Memoize the style calculation to prevent unnecessary re-renders
  const progressStyle = useMemo(() => ({
    width: `${progress}%`,
    background: `linear-gradient(
      90deg,
      ${brandGreen[500]} 0%,
      ${brandBlue[500]} 50%,
      ${neonOrange[500]} 100%
    )`,
    backgroundSize: '200% 100%',
    animation: 'shimmer 2s linear infinite',
  }), [progress]);

  return (
    <div 
      className="relative h-full bg-transparent rounded-full overflow-hidden"
      role="progressbar" 
      aria-valuenow={progress} 
      aria-valuemin="0" 
      aria-valuemax="100"
    >
      <div 
        className="absolute h-full rounded-full transition-all duration-500 ease-out"
        style={progressStyle}
      />
    </div>
  );
};

export default React.memo(ProgressBar);
