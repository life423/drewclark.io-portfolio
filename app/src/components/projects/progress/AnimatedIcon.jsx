import React from 'react';

/**
 * Dynamic animated icon that changes based on progress
 * - start: Bouncing arrow for beginning stage
 * - middle: Pulsing icon for mid-progress
 * - almostDone: Spinning icon for near completion
 * - complete: Celebrating checkmark for 100% complete
 */
const AnimatedIcon = ({ progress }) => {
  // Determine which icon to show based on progress
  const getIconState = () => {
    if (progress === 100) return 'complete';
    if (progress > 75) return 'almostDone';
    if (progress > 25) return 'middle';
    return 'start';
  };

  const iconState = getIconState();
  
  // Each icon state with appropriate animation
  const icons = {
    start: (
      <svg 
        className="w-4 h-4 animate-pulse-subtle text-brandGreen-400" 
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-label="Starting progress"
      >
        <circle cx="12" cy="12" r="5" />
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </svg>
    ),
    middle: (
      <svg 
        className="w-4 h-4 animate-pulse-subtle text-brandGreen-500" 
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-label="Progress in the middle"
      >
        <path d="M5 12h14M12 5l7 7-7 7" />
      </svg>
    ),
    almostDone: (
      <svg 
        className="w-4 h-4 animate-spin-slow text-neonOrange-400" 
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-label="Almost complete"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M16 12l-4 4-4-4M12 8v8" />
      </svg>
    ),
    complete: (
      <svg 
        className="w-4 h-4 animate-celebrate text-neonOrange-500" 
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-label="Completion achieved"
      >
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    )
  };

  return icons[iconState];
};

export default React.memo(AnimatedIcon);
