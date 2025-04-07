import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import useIntersection from '../../hooks/useIntersection';

/**
 * A component that creates a typing animation effect for multiple phrases
 * Now with stability tracking to reduce distraction
 * - Only changes text after stable viewing period
 * - Prevents consecutive repetition of the same phrase
 * - Adds proper punctuation if missing
 * - Supports dynamic changes to phrases for AI-generated content
 * 
 * @param {Object} props
 * @param {string[]} props.phrases - Array of phrases to cycle through
 * @param {number} props.typingSpeed - Speed of typing in milliseconds
 * @param {number} props.deletingSpeed - Speed of deleting in milliseconds
 * @param {number} props.pauseTime - Time to pause between phrases in milliseconds
 * @param {string} props.className - Optional CSS classes
 * @param {boolean} props.active - Whether the typing animation should be active
 * @param {number} props.stableViewingPeriod - How long to show completed text before changing (ms)
 * @param {number} props.scrollIdlePeriod - Only change text after user hasn't scrolled for this long (ms)
 */
const TypedTextEffect = ({
  phrases = [],
  typingSpeed = 60,
  deletingSpeed = 40,
  pauseTime = 2000,
  className = "",
  active = true, // Prop to control animation
  stableViewingPeriod = 8000, // Default 8 seconds of stable viewing before change
  scrollIdlePeriod = 3000 // Default 3 seconds of scroll inactivity before change
}) => {
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isFullyTyped, setIsFullyTyped] = useState(false);
  const [stableViewStart, setStableViewStart] = useState(0);
  const [lastScrollTime, setLastScrollTime] = useState(Date.now());
  
  // References
  const elementRef = useRef(null);
  const previousPhraseRef = useRef('');
  const prevPhrasesRef = useRef(phrases);
  
  // Get current phrase and ensure it ends with proper punctuation
  const currentPhrase = (() => {
    let phrase = phrases[currentPhraseIndex] || '';
    // Add period if missing and not empty
    if (phrase && !phrase.match(/[.!?]$/)) {
      phrase = phrase + '.';
    }
    return phrase;
  })();
  
  // Use intersection observer to pause animation when not in view
  const isVisible = useIntersection(elementRef, { threshold: 0.1 });
  
  // Listen to scroll events to update last scroll time
  useEffect(() => {
    const handleScroll = () => {
      setLastScrollTime(Date.now());
      // Reset stable view timer when user scrolls
      if (isFullyTyped) {
        setStableViewStart(Date.now());
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isFullyTyped]);
  
  // Reset animation when phrases array changes (for AI-generated content)
  useEffect(() => {
    // Check if the phrases array actually changed
    const phrasesChanged = JSON.stringify(prevPhrasesRef.current) !== JSON.stringify(phrases);
    
    if (phrasesChanged) {
      // When phrases change, only reset if the content is actually different
      // This prevents retyping the same text with minor formatting differences
      
      // Get the first phrase from new and old arrays
      const newFirstPhrase = phrases[0] || '';
      const oldFirstPhrase = prevPhrasesRef.current[0] || '';
      
      // Compare core content (ignoring punctuation, etc)
      const normalizePhrase = (p) => p.trim().toLowerCase().replace(/[^\w\s]/g, '');
      const isSameContent = normalizePhrase(newFirstPhrase) === normalizePhrase(oldFirstPhrase);
      
      if (!isSameContent) {
        setCurrentPhraseIndex(0);
        setCurrentText('');
        setIsDeleting(false);
        setIsPaused(false);
        setIsFullyTyped(false);
        setStableViewStart(0);
        
        // Remember the last phrase to avoid repetition
        previousPhraseRef.current = oldFirstPhrase;
      }
      
      // Update the reference
      prevPhrasesRef.current = phrases;
    }
  }, [phrases]);

  useEffect(() => {
    // Stop animation if not visible, not active, or no phrases
    if (!phrases.length || !isVisible || !active) return;
    
    // Check if enough time has passed since last scroll
    const isScrollIdle = Date.now() - lastScrollTime > scrollIdlePeriod;
    
    // Check if text has been stable for long enough
    const isStableForLongEnough = stableViewStart > 0 && 
                                Date.now() - stableViewStart > stableViewingPeriod;
    
    // Delay to use based on current state
    let delay = typingSpeed;
    
    if (isDeleting) {
      delay = deletingSpeed;
    } else if (currentText === currentPhrase) {
      // Text is fully typed
      if (!isFullyTyped) {
        setIsFullyTyped(true);
        setStableViewStart(Date.now());
      }
      
      // Only start deletion if:
      // 1. We've shown the text for the stable viewing period
      // 2. User hasn't scrolled recently
      if (isFullyTyped && isStableForLongEnough && isScrollIdle) {
        delay = pauseTime;
        setIsPaused(true);
      } else {
        // Just maintain the current state until conditions are met
        return;
      }
    }
    
    const timer = setTimeout(() => {
      // Handle text update based on current state
      if (isPaused) {
        setIsDeleting(true);
        setIsPaused(false);
        setIsFullyTyped(false);
        return;
      }
      
      if (isDeleting) {
        setCurrentText(prev => prev.substring(0, prev.length - 1));
        
        // If we've deleted everything, select next phrase (avoiding repetition)
        if (currentText === '') {
          setIsDeleting(false);
          
          // Remember current phrase before changing
          previousPhraseRef.current = currentPhrase;
          
          // If we only have one phrase, just stay there
          if (phrases.length <= 1) {
            setCurrentPhraseIndex(0);
          } else {
            // Choose next phrase (avoiding the same one we just showed)
            setCurrentPhraseIndex(prevIndex => {
              // If more than two phrases, avoid repeating the same one
              if (phrases.length > 2) {
                let newIndex;
                do {
                  newIndex = Math.floor(Math.random() * phrases.length);
                } while (newIndex === prevIndex);
                return newIndex;
              } else {
                // With only two phrases, just alternate
                return (prevIndex + 1) % phrases.length;
              }
            });
          }
        }
      } else {
        // We're in typing state, add the next character
        if (currentText.length < currentPhrase.length) {
          setCurrentText(prev => currentPhrase.substring(0, prev.length + 1));
        } else {
          // We've finished typing
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
    isVisible, // Added so animation pauses when not visible
    active // Added to pause animation when component is not active
    // New dependencies
    , isFullyTyped
    , stableViewStart
    , stableViewingPeriod
    , lastScrollTime
    , scrollIdlePeriod
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
  className: PropTypes.string,
  active: PropTypes.bool,
  stableViewingPeriod: PropTypes.number,
  scrollIdlePeriod: PropTypes.number
};

export default TypedTextEffect;
