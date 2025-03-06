// FILE: app/src/components/drawer/TopTierDrawer.jsx
import React, { useRef, useEffect, useState } from 'react';
import { LuX, LuChevronRight } from 'react-icons/lu';
import clsx from 'clsx';

/**
 * A high-quality drawer component with focus trapping, accessibility features,
 * and polished animations.
 */
export default function TopTierDrawer({ isOpen, onClose }) {
  const drawerRef = useRef(null);
  const [isClosing, setIsClosing] = useState(false);
  
  // Controlled close with animation
  const handleClose = () => {
    console.log('Close drawer triggered from TopTierDrawer');
    if (!isOpen || isClosing) return;
    
    setIsClosing(true);
    // Immediate feedback
    console.log('Closing animation started, drawer will close in 300ms');
    
    // Provide immediate visual feedback that close was triggered
    const closeButton = drawerRef.current?.querySelector('button[aria-label="Close menu"]');
    if (closeButton) {
      closeButton.classList.add('animate-pulse');
      setTimeout(() => closeButton.classList.remove('animate-pulse'), 300);
    }
    
    setTimeout(() => {
      onClose();
      setIsClosing(false);
      console.log('Drawer closed callback executed');
    }, 300); // Match transition duration
  };
  
  // Focus trap implementation
  useEffect(() => {
    if (!isOpen) return;
    
    const focusableElementsString = 
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
    
    const drawer = drawerRef.current;
    const focusableElements = drawer?.querySelectorAll(focusableElementsString) || [];
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    function handleTabKey(e) {
      if (e.key !== 'Tab') return;
      
      // If shift+tab on first element, move to last element
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      } 
      // If tab on last element, cycle back to first
      else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    }
    
    // Set focus to first element when drawer opens
    firstElement?.focus();
    
    // Add event listener for tab key
    document.addEventListener('keydown', handleTabKey);
    
    return () => {
      document.removeEventListener('keydown', handleTabKey);
    };
  }, [isOpen]);
  
  // Handle escape key and body scroll lock
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') handleClose();
    };
    
    if (isOpen) {
      console.log('Drawer opened - adding event listeners');
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // prevent background scrolling
    } else {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = ''; // restore scrolling
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Reset closing state if drawer is reopened
  useEffect(() => {
    if (isOpen) setIsClosing(false);
  }, [isOpen]);

  return (
    <>
      {/* Overlay with fade transition */}
      <div
        className={clsx(
          'fixed inset-0 bg-black transition-opacity duration-300',
          (isOpen && !isClosing) ? 'opacity-60 z-40 pointer-events-auto' : 'opacity-0 -z-10 pointer-events-none'
        )}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Drawer panel with slide transition */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        aria-hidden={!isOpen}
        className={clsx(
          'fixed top-0 left-0 h-full w-72 shadow-2xl',
          'bg-brandGray-900 text-white',
          'transform transition-transform duration-300 ease-out',
          'overflow-y-auto',
          // Ensure z-index is always high enough when open
          (isOpen && !isClosing) ? 'translate-x-0 z-[100]' : '-translate-x-full -z-10'
        )}
        style={{
          boxShadow: '0 0 25px rgba(0, 0, 0, 0.5)'
        }}
      >
        {/* Header section */}
        <div className="sticky top-0 z-10 bg-brandGray-900 pt-4 px-6 flex justify-between items-center">
          {/* Logo/Name */}
          <h2 
            id="drawer-title" 
            className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-brandGreen-300 to-brandBlue-400"
          >
            <span className="sr-only">DC Portfolio</span>
            <span aria-hidden="true">DC</span>
          </h2>
          
          {/* Close button */}
          <button
            onClick={handleClose}
            className="text-white hover:text-brandGreen-300 p-2 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-brandGreen-500 focus:ring-opacity-50 hover:bg-brandGray-800"
            aria-label="Close menu"
          >
            <LuX className="h-6 w-6" data-testid="drawer-close-button" />
          </button>
        </div>
        
        {/* Navigation links with staggered entrance animations */}
        <nav className="flex flex-col flex-grow pt-12 pb-6">
          <ul className="space-y-4 px-6">
            {['Home', 'Projects', 'Contact'].map((item, index) => (
              <li 
                key={item}
                className={clsx(
                  'transform transition-all duration-300 pb-4 border-b border-brandGray-800',
                  (isOpen && !isClosing) ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                )}
                style={{ transitionDelay: (isOpen && !isClosing) ? `${150 + index * 75}ms` : '0ms' }}
              >
                <a 
                  href={`#${item.toLowerCase()}`}
                  className="group flex items-center py-2 text-xl font-medium text-white hover:text-brandGreen-300 transition-colors focus:outline-none focus:text-brandGreen-300"
                  onClick={(e) => {
                    e.preventDefault();
                    // Navigate to section then close drawer
                    e.preventDefault();
                    console.log("Nav link clicked, closing drawer");
                    handleClose();
                  }}
                >
                  <span className="flex-grow">{item}</span>
                  <LuChevronRight className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200 h-5 w-5" />
                </a>
              </li>
            ))}
          </ul>
        </nav>
        
        {/* Footer content */}
        <div 
          className={clsx(
            "px-6 py-4 mt-auto border-t border-brandGray-800 bg-brandGray-900/30",
            (isOpen && !isClosing) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          )}
          style={{ 
            transitionProperty: 'opacity, transform',
            transitionDuration: '300ms',
            transitionTimingFunction: 'ease',
            transitionDelay: (isOpen && !isClosing) ? '400ms' : '0ms'
          }}
        >
          <p className="text-sm text-brandGray-400">
            Clark Company Limited
            <span className="ml-2">© {new Date().getFullYear()}</span>
          </p>
        </div>
      </div>
    </>
  );
}
