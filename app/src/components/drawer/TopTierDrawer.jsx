// FILE: app/src/components/drawer/TopTierDrawer.jsx
import React, { useRef, useEffect } from 'react';
import { LuX } from 'react-icons/lu';
import clsx from 'clsx';

/**
 * A high-quality drawer component with focus trapping, accessibility features,
 * and polished animations.
 */
export default function TopTierDrawer({ isOpen, onClose }) {
  const drawerRef = useRef(null);
  
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
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
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
  }, [isOpen, onClose]);

  return (
    <>
      {/* Overlay with fade transition */}
      <div
        className={clsx(
          'fixed inset-0 z-40 bg-black transition-opacity duration-300',
          isOpen ? 'opacity-60 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
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
          'fixed top-0 left-0 z-50 h-full w-64 shadow-xl',
          'bg-brandGray-900 text-white',
          'transform transition-transform duration-300 ease-out',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header with close button */}
        <div className="flex justify-end p-4">
          <button
            onClick={onClose}
            className="text-brandGreen-400 hover:text-brandGreen-300 transition-colors p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-brandGreen-500 focus:ring-opacity-50"
            aria-label="Close menu"
          >
            <LuX className="h-6 w-6" />
          </button>
        </div>
        
        {/* Navigation links with staggered entrance animations */}
        <nav className="flex flex-col justify-center flex-grow h-full -mt-16">
          <ul className="space-y-6 px-6">
            {['Home', 'Projects', 'Contact'].map((item, index) => (
              <li 
                key={item}
                className={clsx(
                  'transform transition-all duration-300',
                  isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                )}
                style={{ transitionDelay: isOpen ? `${150 + index * 75}ms` : '0ms' }}
              >
                <a 
                  href={`#${item.toLowerCase()}`}
                  className="text-xl font-medium text-white hover:text-brandGreen-300 transition-colors focus:outline-none focus:text-brandGreen-300"
                  onClick={(e) => {
                    e.preventDefault();
                    // Navigate to section then close drawer
                    onClose();
                  }}
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        
        {/* Footer content */}
        <div className="p-6 mt-auto border-t border-brandGray-700">
          <p className="text-sm text-brandGray-400">
            Clark Company Limited
            <span className="ml-2">© {new Date().getFullYear()}</span>
          </p>
        </div>
      </div>
    </>
  );
}
