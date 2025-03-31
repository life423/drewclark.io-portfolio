import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import useIntersection from '../../hooks/useIntersection';

/**
 * A component that creates a typing animation effect for multiple phrases
 * Automatically cycles through phrases continuously, and pauses when not visible
 * 
 * @param {Object} props
 * @param {string[]} props.phrases - Array of phrases to cycle through
 * @param {number} props.typingSpeed - Speed of typing in milliseconds
 * @param {number} props.deletingSpeed - Speed of deleting in milliseconds
 * @param {number} props.pauseTime - Time to pause between phrases in milliseconds
 * @param {string} props.className - Optional CSS classes
 */
const TypedTextEffect = ({
  phrases = [],
  typingSpeed = 60,
  deletingSpeed = 40,
  pauseTime = 2000,
  className = ""
}) => {
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  // References
  const elementRef = useRef(null);
  const currentPhrase = phrases[currentPhraseIndex];
  
  // Use intersection observer to pause animation when not in view
  const isVisible = useIntersection(elementRef, { threshold: 0.1 });

  useEffect(() => {
    // Stop animation if not visible or no phrases
    if (!phrases.length || !isVisible) return;
    
    // Delay to use based on current state
    let delay = typingSpeed;
    
    if (isDeleting) {
      delay = deletingSpeed;
    } else if (currentText === currentPhrase) {
      // Pause after completing a phrase (always, not just first cycle)
      delay = pauseTime;
      setIsPaused(true);
    }
    
    const timer = setTimeout(() => {
      // Handle text update based on current state
      if (isPaused) {
        setIsDeleting(true);
        setIsPaused(false);
        return;
      }
      
      if (isDeleting) {
        setCurrentText(prev => prev.substring(0, prev.length - 1));
        
        // If we've deleted everything, move to next phrase
        if (currentText === '') {
          setIsDeleting(false);
          setCurrentPhraseIndex(prevIndex => (prevIndex + 1) % phrases.length);
        }
      } else {
        // We're in typing state, add the next character
        if (currentText.length < currentPhrase.length) {
          setCurrentText(prev => currentPhrase.substring(0, prev.length + 1));
        } else {
          // We've finished typing, pause
          setIsPaused(true);
        }
      }
    }, delay);
    
    return () => clearTimeout(timer);
  }, [
    currentText, 
    currentPhrase, 
    isDeleting, 
    isPaused, 
    typingSpeed, 
    deletingSpeed, 
    pauseTime, 
    phrases, 
    currentPhraseIndex,
    isVisible // Added so animation pauses when not visible
  ]);

  return (
    <span ref={elementRef} className={className}>
      {currentText}
      <span className="inline-block w-[0.1em] h-[1.2em] bg-current ml-0.5 animate-blink"></span>
    </span>
  );
};

TypedTextEffect.propTypes = {
  phrases: PropTypes.arrayOf(PropTypes.string).isRequired,
  typingSpeed: PropTypes.number,
  deletingSpeed: PropTypes.number,
  pauseTime: PropTypes.number,
  className: PropTypes.string
};

export default TypedTextEffect;
