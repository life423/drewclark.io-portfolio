/**
 * Application-wide animation and transition constants
 * Centralizes timing values to ensure consistency across components
 */

// Animation durations (in milliseconds)
export const ANIMATION = {
  SHORT: 300,
  MEDIUM: 500,
  STANDARD: 800,
  LONG: 1200,
  EXTRA_LONG: 1600
};

// Transition timing functions
export const EASING = {
  // Standard easing curves
  DEFAULT: 'ease',
  LINEAR: 'linear',
  EASE_IN: 'ease-in',
  EASE_OUT: 'ease-out',
  EASE_IN_OUT: 'ease-in-out',
  
  // Cubic bezier curves for more precise control
  SMOOTH: 'cubic-bezier(0.23, 1, 0.32, 1)',
  BOUNCE: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  SHARP: 'cubic-bezier(0.33, 1, 0.68, 1)',
  GENTLE: 'cubic-bezier(0.22, 1, 0.36, 1)'
};
