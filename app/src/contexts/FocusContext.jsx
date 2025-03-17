import React, { createContext, useContext, useState, useEffect, useRef } from 'react'
import useScrollPosition from '../hooks/useScrollPosition'

const FocusContext = createContext(null)

export function FocusProvider({ children }) {
  const [activeElementId, setActiveElementId] = useState(null)
  const [focusHistory, setFocusHistory] = useState([])
  const autoFocusStarted = useRef(false)
  const { y: scrollY } = useScrollPosition()
  
  // Define element IDs and their scroll thresholds
  const elementConfig = {
    'hero-name': { min: 0, max: 400, autoFocusDelay: 800 },
    'hero-role': { min: 0, max: 500, autoFocusDelay: 1300 },
    'hero-description': { min: 0, max: 600, autoFocusDelay: 1800 },
    'hero-cta': { min: 0, max: 700, autoFocusDelay: 2300 }
  }
  
  // Priority elements that should always be visible after initial appearance
  const alwaysVisibleElements = ['hero-description'];
  
  // Automatic time-based focus sequence effect
  useEffect(() => {
    if (autoFocusStarted.current) return;
    
    // Start auto-focusing elements after initial page load
    autoFocusStarted.current = true;
    
    // Get elements in order of their auto-focus delay
    const elementsToFocus = Object.entries(elementConfig)
      .sort((a, b) => a[1].autoFocusDelay - b[1].autoFocusDelay);
    
    // Create focus timers for each element
    elementsToFocus.forEach(([id, config]) => {
      setTimeout(() => {
        setActiveElementId(id);
        setFocusHistory(prev => [...prev, { id, timestamp: Date.now() }]);
      }, config.autoFocusDelay);
    });
    
    // Ensure priority elements are marked as active after a delay
    setTimeout(() => {
      alwaysVisibleElements.forEach(id => {
        if (!focusHistory.some(item => item.id === id)) {
          setFocusHistory(prev => [...prev, { id, timestamp: Date.now() }]);
        }
      });
    }, 2500); // Just after all normal elements are revealed
  }, []);
  
  // Calculate the active element based on scroll position
  useEffect(() => {
    // Only process scroll-based focusing if we've scrolled
    if (scrollY <= 5) return;
    
    // Find the element that should be active based on current scroll
    const newActiveElement = Object.entries(elementConfig).find(
      ([id, { min, max }]) => scrollY >= min && scrollY < max
    )?.[0];
    
    if (newActiveElement && newActiveElement !== activeElementId) {
      setActiveElementId(newActiveElement);
      setFocusHistory(prev => [...prev, { id: newActiveElement, timestamp: Date.now() }]);
    }
  }, [scrollY, activeElementId])
  
  // Provide the focus management API
  const focusElement = (elementId) => {
    setActiveElementId(elementId)
    setFocusHistory(prev => [...prev, { id: elementId, timestamp: Date.now() }])
  }
  
  const contextValue = {
    activeElementId,
    focusElement,
    focusHistory,
    isActive: (elementId) => {
      // An element is considered active if:
      // 1. It's the currently active element OR
      // 2. It has been active in the past (to prevent re-blurring) OR
      // 3. It's in the alwaysVisibleElements list
      return activeElementId === elementId || 
             focusHistory.some(item => item.id === elementId) ||
             alwaysVisibleElements.includes(elementId);
    },
    wasActive: (elementId) => focusHistory.some(item => item.id === elementId) || 
                              alwaysVisibleElements.includes(elementId)
  }
  
  return (
    <FocusContext.Provider value={contextValue}>
      {children}
    </FocusContext.Provider>
  )
}

export const useFocus = () => {
  const context = useContext(FocusContext)
  if (!context) {
    throw new Error('useFocus must be used within a FocusProvider')
  }
  return context
}
