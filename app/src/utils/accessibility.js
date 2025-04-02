/**
 * Accessibility Utilities
 * 
 * This module provides utilities to enhance the accessibility of the application,
 * including keyboard navigation, screen reader support, focus management,
 * and other accessibility best practices.
 */

import { useEffect, useRef, useState } from 'react';
import logger from './logger';

// Create a module-specific logger
const log = logger.getLogger('Accessibility');

/**
 * Constants for ARIA roles, properties, and keyboard codes
 */
export const ARIA = {
  ROLES: {
    BUTTON: 'button',
    DIALOG: 'dialog',
    NAVIGATION: 'navigation',
    MENU: 'menu',
    MENUITEM: 'menuitem',
    ALERT: 'alert',
    ALERTDIALOG: 'alertdialog',
    TAB: 'tab',
    TABPANEL: 'tabpanel',
    TABLIST: 'tablist'
  },
  PROPERTIES: {
    EXPANDED: 'aria-expanded',
    CONTROLS: 'aria-controls',
    HIDDEN: 'aria-hidden',
    LABEL: 'aria-label',
    LABELLEDBY: 'aria-labelledby',
    DESCRIBEDBY: 'aria-describedby',
    SELECTED: 'aria-selected',
    PRESSED: 'aria-pressed',
    CURRENT: 'aria-current',
    LIVE: 'aria-live',
    BUSY: 'aria-busy',
    ATOMIC: 'aria-atomic'
  },
  LIVE_REGIONS: {
    OFF: 'off',
    POLITE: 'polite',
    ASSERTIVE: 'assertive'
  }
};

export const KEY_CODES = {
  TAB: 'Tab',
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End'
};

/**
 * Detect if the user is using a keyboard for navigation
 * Useful for showing focus styles only for keyboard users
 * 
 * @returns {boolean} True if the user is using a keyboard
 */
export function useKeyboardMode() {
  const [isKeyboardMode, setIsKeyboardMode] = useState(false);
  
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === KEY_CODES.TAB) {
        setIsKeyboardMode(true);
      }
    };
    
    const handleMouseDown = () => {
      setIsKeyboardMode(false);
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleMouseDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);
  
  return isKeyboardMode;
}

/**
 * Custom hook to trap focus within a container
 * Useful for modals, dialogs, and other components that should trap focus
 * 
 * @param {Object} options - Options for focus trapping
 * @param {boolean} options.active - Whether the focus trap is active
 * @param {Function} [options.onEscape] - Callback when Escape key is pressed
 * @returns {Object} Ref to attach to the container
 */
export function useFocusTrap(options = {}) {
  const { active = true, onEscape } = options;
  const containerRef = useRef(null);
  const previouslyFocusedElement = useRef(null);
  
  // Store the previously focused element
  useEffect(() => {
    if (active) {
      previouslyFocusedElement.current = document.activeElement;
    }
    
    return () => {
      if (previouslyFocusedElement.current && typeof previouslyFocusedElement.current.focus === 'function') {
        previouslyFocusedElement.current.focus();
      }
    };
  }, [active]);
  
  // Focus the first focusable element in the container
  useEffect(() => {
    if (active && containerRef.current) {
      const focusableElements = getFocusableElements(containerRef.current);
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    }
  }, [active]);
  
  // Handle tab key to keep focus inside the container
  useEffect(() => {
    if (!active) return undefined;
    
    const handleKeyDown = (e) => {
      if (!containerRef.current) return;
      
      // Handle escape key
      if (e.key === KEY_CODES.ESCAPE && onEscape) {
        e.preventDefault();
        onEscape();
        return;
      }
      
      // Handle tab key
      if (e.key === KEY_CODES.TAB) {
        const focusableElements = getFocusableElements(containerRef.current);
        if (focusableElements.length === 0) return;
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        // Shift + Tab on first element: focus the last element
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
        // Tab on last element: focus the first element
        else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [active, onEscape]);
  
  return containerRef;
}

/**
 * Custom hook to announce messages to screen readers using an ARIA live region
 * 
 * @param {Object} options - Options for announcements
 * @param {string} [options.politeness='polite'] - ARIA live politeness setting
 * @returns {Function} Function to announce a message
 */
export function useAnnounce(options = {}) {
  const { politeness = ARIA.LIVE_REGIONS.POLITE } = options;
  const [announcements, setAnnouncements] = useState([]);
  
  useEffect(() => {
    // Create the live region if it doesn't exist
    let liveRegion = document.getElementById('a11y-live-region');
    
    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.id = 'a11y-live-region';
      liveRegion.setAttribute('aria-live', politeness);
      liveRegion.setAttribute('aria-relevant', 'additions');
      liveRegion.setAttribute('aria-atomic', 'true');
      
      // Hide visually but keep accessible to screen readers
      Object.assign(liveRegion.style, {
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: '0',
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        border: '0'
      });
      
      document.body.appendChild(liveRegion);
    }
    
    return () => {
      // Only remove if we created it
      if (liveRegion && liveRegion.id === 'a11y-live-region') {
        document.body.removeChild(liveRegion);
      }
    };
  }, [politeness]);
  
  // Update the live region when announcements change
  useEffect(() => {
    const liveRegion = document.getElementById('a11y-live-region');
    if (liveRegion && announcements.length > 0) {
      const lastAnnouncement = announcements[announcements.length - 1];
      liveRegion.textContent = lastAnnouncement;
      
      // Clear the announcement after it's been read
      const clearTimeout = setTimeout(() => {
        setAnnouncements(prev => prev.filter(a => a !== lastAnnouncement));
      }, 3000);
      
      return () => clearTimeout(clearTimeout);
    }
  }, [announcements]);
  
  // Function to announce a message
  const announce = (message) => {
    if (typeof message !== 'string' || message.trim() === '') {
      log.warn('Empty or invalid announcement');
      return;
    }
    
    log.debug(`Announcing: ${message}`);
    setAnnouncements(prev => [...prev, message]);
  };
  
  return announce;
}

/**
 * Custom hook to manage skip links for keyboard users
 * Adds a skip link that appears when the user tabs into the page
 * 
 * @param {Object} options - Options for skip links
 * @param {Array<{id: string, label: string}>} options.targets - Skip link targets
 * @returns {void}
 */
export function useSkipLinks(options = {}) {
  const { targets = [{ id: 'main-content', label: 'Skip to main content' }] } = options;
  
  useEffect(() => {
    // Create the skip links container
    const skipLinksContainer = document.createElement('div');
    skipLinksContainer.className = 'skip-links';
    
    // Style the container
    Object.assign(skipLinksContainer.style, {
      position: 'absolute',
      top: '0',
      left: '0',
      zIndex: '9999',
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      pointerEvents: 'none'
    });
    
    // Create skip links
    targets.forEach((target) => {
      const link = document.createElement('a');
      link.href = `#${target.id}`;
      link.textContent = target.label;
      link.className = 'skip-link';
      
      // Style the link
      Object.assign(link.style, {
        padding: '0.5rem 1rem',
        backgroundColor: '#007bff',
        color: '#fff',
        textDecoration: 'none',
        margin: '0.25rem',
        borderRadius: '0.25rem',
        transform: 'translateY(-100%)',
        transition: 'transform 0.3s',
        pointerEvents: 'auto'
      });
      
      // Show on focus
      link.addEventListener('focus', () => {
        link.style.transform = 'translateY(0)';
      });
      
      // Hide on blur
      link.addEventListener('blur', () => {
        link.style.transform = 'translateY(-100%)';
      });
      
      skipLinksContainer.appendChild(link);
    });
    
    document.body.insertBefore(skipLinksContainer, document.body.firstChild);
    
    return () => {
      document.body.removeChild(skipLinksContainer);
    };
  }, [targets]);
}

/**
 * Enhance a component with accessibility features
 * Higher-order component that adds common accessibility props
 * 
 * @param {React.Component} Component - Component to enhance
 * @param {Object} options - Accessibility options
 * @returns {React.Component} Enhanced component
 */
export function withAccessibility(Component, options = {}) {
  const EnhancedComponent = (props) => {
    const isKeyboardMode = useKeyboardMode();
    const announce = useAnnounce();
    
    // Additional accessibility props
    const a11yProps = {
      // Add ARIA attributes based on component role
      ...(options.role && { role: options.role }),
      ...(options.label && { 'aria-label': options.label }),
      ...(options.labelledBy && { 'aria-labelledby': options.labelledBy }),
      ...(options.describedBy && { 'aria-describedby': options.describedBy }),
      
      // Add keyboard event handlers
      onKeyDown: (e) => {
        // Handle common keys
        if (options.clickableElement) {
          if (e.key === KEY_CODES.ENTER || e.key === KEY_CODES.SPACE) {
            e.preventDefault();
            e.currentTarget.click();
          }
        }
        
        // Call the original onKeyDown handler if it exists
        if (props.onKeyDown) {
          props.onKeyDown(e);
        }
      },
      
      // Add focus visible class for keyboard users
      className: `${props.className || ''} ${isKeyboardMode ? 'focus-visible' : ''}`.trim()
    };
    
    // Provide accessibility utilities as props
    const a11yUtils = {
      announce,
      isKeyboardMode
    };
    
    return <Component {...props} {...a11yProps} a11y={a11yUtils} />;
  };
  
  EnhancedComponent.displayName = `WithAccessibility(${Component.displayName || Component.name || 'Component'})`;
  
  return EnhancedComponent;
}

/**
 * Get all focusable elements within a container
 * 
 * @param {HTMLElement} container - Container element
 * @returns {Array<HTMLElement>} Array of focusable elements
 */
function getFocusableElements(container) {
  if (!container) return [];
  
  // Selectors for potentially focusable elements
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    'details',
    'summary'
  ];
  
  return Array.from(
    container.querySelectorAll(focusableSelectors.join(','))
  ).filter(el => {
    // Further filter to ensure elements are actually focusable
    return (
      !el.hasAttribute('disabled') &&
      !el.getAttribute('aria-hidden') === 'true' &&
      getComputedStyle(el).display !== 'none' &&
      getComputedStyle(el).visibility !== 'hidden'
    );
  });
}

/**
 * Make a focusable div that can be used as a button with keyboard support
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onClick - Click handler
 * @param {React.ReactNode} props.children - Component children
 * @param {Object} props.rest - Additional props
 * @returns {JSX.Element} Accessible button
 */
export function AccessibleButton({ onClick, children, ...rest }) {
  const handleKeyDown = (e) => {
    if (e.key === KEY_CODES.ENTER || e.key === KEY_CODES.SPACE) {
      e.preventDefault();
      onClick(e);
    }
    
    if (rest.onKeyDown) {
      rest.onKeyDown(e);
    }
  };
  
  return (
    <div
      role={ARIA.ROLES.BUTTON}
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      {...rest}
    >
      {children}
    </div>
  );
}

/**
 * Create a visually hidden component for screen readers
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Component children
 * @param {string} [props.as='span'] - HTML element to render
 * @returns {JSX.Element} Visually hidden component
 */
export function VisuallyHidden({ children, as: Component = 'span', ...rest }) {
  const style = {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: '0',
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    borderWidth: '0'
  };
  
  return (
    <Component style={style} {...rest}>
      {children}
    </Component>
  );
}

export default {
  ARIA,
  KEY_CODES,
  useKeyboardMode,
  useFocusTrap,
  useAnnounce,
  useSkipLinks,
  withAccessibility,
  AccessibleButton,
  VisuallyHidden
};
