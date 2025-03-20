import React, { useMemo } from 'react';
import { brandGreen, neonOrange } from '../../../styles/colors';

/**
 * Get a gradient color based on progress percentage
 * Uses an accent-focused progression from green to orange
 */
const getProgressColor = (progress) => {
  if (progress < 40) {
    // Early progress: subtle orange-green gradient
    return `linear-gradient(to right, ${brandGreen[350]}, ${neonOrange[300]})`;
  } else if (progress < 80) {
    // Mid progress: brighter orange
    return `linear-gradient(to right, ${neonOrange[300]}, ${neonOrange[400]})`;
  } else {
    // Near completion: full neon accent
    return `linear-gradient(to right, ${neonOrange[400]}, ${neonOrange[500]})`;
  }
};

/**
 * A progress bar component that changes color based on completion percentage
 */
const ProgressBar = ({ progress }) => {
  // Memoize the style calculation to prevent unnecessary re-renders
  const progressStyle = useMemo(() => ({
    background: getProgressColor(progress),
    width: `${progress}%`
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
