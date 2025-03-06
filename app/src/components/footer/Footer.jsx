// FILE: app/src/components/footer/Footer.jsx
import React, { useRef, useState, useEffect } from 'react';
import { LuTwitter, LuGithub } from 'react-icons/lu';
import useIntersection from '../../hooks/useIntersection';
import clsx from 'clsx';

export default function Footer() {
  const containerRef = useRef(null);
  const inView = useIntersection(containerRef, { threshold: 0.1 });
  
  // Animation state using refs to avoid re-renders
  const [animateTwitter, setAnimateTwitter] = useState(false);
  const [animateGithub, setAnimateGithub] = useState(false);
  const animationTriggeredRef = useRef(false);
  
  // Debug when animations are triggered
  useEffect(() => {
    if (inView) {
      console.log('Footer in view - triggering animations');
      
      // Only trigger animations once per view
      if (!animationTriggeredRef.current) {
        animationTriggeredRef.current = true;
        
        // Start Twitter animation immediately
        setAnimateTwitter(true);
        
        // Start GitHub animation after a delay for staggered effect
        setTimeout(() => {
          console.log('Starting GitHub animation');
          setAnimateGithub(true);
        }, 600);
      }
    } else {
      // Reset animations when out of view
      console.log('Footer out of view - resetting animations');
      setAnimateTwitter(false);
      setAnimateGithub(false);
      animationTriggeredRef.current = false;
    }
  }, [inView]);
  
  // Log when animations change for debugging
  useEffect(() => {
    console.log('Twitter animation state:', animateTwitter);
  }, [animateTwitter]);
  
  useEffect(() => {
    console.log('GitHub animation state:', animateGithub);
  }, [animateGithub]);

  return (
    <footer className="mt-16 text-white" ref={containerRef}>
      <div className="bg-brandGray-900 py-6 px-6">
        <div className="flex justify-between items-center">
          <div className="flex space-x-8">
            {/* Twitter Icon - Apply animation class directly */}
            <a
              href="https://twitter.com/andrewgenai"
              target="_blank"
              rel="noopener noreferrer"
              className="relative inline-block p-2 hover:bg-brandGray-800 rounded-full transition-colors"
              onClick={() => console.log('Twitter icon clicked')}
            >
              <LuTwitter 
                className={clsx(
                  'h-6 w-6 text-brandGreen-500',
                  {'animate-icon-gentle-pulse': animateTwitter}
                )}
                style={{
                  fill: 'currentColor',
                  color: 'currentColor',
                }}
                onAnimationEnd={() => console.log('Twitter animation ended')}
              />
            </a>

            {/* GitHub Icon - Apply animation class directly */}
            <a
              href="https://github.com/life423"
              target="_blank"
              rel="noopener noreferrer"
              className="relative inline-block p-2 hover:bg-brandGray-800 rounded-full transition-colors"
              onClick={() => console.log('GitHub icon clicked')}
            >
              <LuGithub 
                className={clsx(
                  'h-6 w-6 text-brandGreen-500',
                  {'animate-icon-gentle-pulse': animateGithub}
                )}
                style={{
                  fill: 'currentColor',
                  color: 'currentColor',
                }}
                onAnimationEnd={() => console.log('GitHub animation ended')}
              />
            </a>
          </div>

          <div className="flex items-center space-x-2">
            <span>Clark Company Limited</span>
            <span>&copy;</span>
            <span>{new Date().getFullYear()}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
