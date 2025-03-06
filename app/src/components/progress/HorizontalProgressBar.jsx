/**
 * Horizontal progress bar component that indicates scroll position with dynamic colors
 * Uses useScrollPosition hook to track scroll progress and colorInterpolate for dynamic coloring
 * 
 * @param {Object} props - Component props
 * @param {string} props.topOffset - Distance from top of screen (default: 4rem)
 * @param {string} props.height - Height of the progress bar (default: 4px)
 * @param {boolean} props.visible - Whether the bar is visible (default: true)
 */
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import useScrollPosition from '../../hooks/useScrollPosition';
import { getInterpolatedColor } from '../utils/colorInterpolate';

const HorizontalProgressBar = React.memo(function HorizontalProgressBar({
  topOffset = '4rem', // Adjust to match your nav height
  height = '2px',
  visible = true,
}) {
  const scrollInfo = useScrollPosition();
  const progress = scrollInfo.percent; // progress from 0 to 100

  // Calculate a dynamic color based on scroll progress
  const progressColor = useMemo(() => getInterpolatedColor(progress), [progress]);

  // Define styles: fixed position just below the nav
  const styles = useMemo(
    () => ({
      position: 'fixed',
      top: topOffset,
      left: 0,
      height,
      width: `${progress}%`,
      backgroundColor: progressColor,
      transition: 'width 0.2s ease-out, background-color 0.2s ease-out',
      zIndex: 1000, // Ensure it sits above other content
    }),
    [progress, topOffset, height, progressColor]
  );

  if (!visible) return null;

  return <div style={styles} aria-hidden="true" />;
});

HorizontalProgressBar.propTypes = {
  topOffset: PropTypes.string,
  height: PropTypes.string,
  visible: PropTypes.bool,
};

export default HorizontalProgressBar;
