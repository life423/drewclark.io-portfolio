// FILE: app/src/components/footer/Footer.jsx
import React, { useRef, useState, useEffect } from 'react';
import { LuTwitter, LuGithub } from 'react-icons/lu';
import useIntersection from '../../hooks/useIntersection';
import clsx from 'clsx';

export default function Footer() {
  const containerRef = useRef(null);
  const inView = useIntersection(containerRef, { threshold: 0.1 });
  
  // Animation state
  const [animateTwitter, setAnimateTwitter] = useState(false);
  const [animateGithub, setAnimateGithub] = useState(false);
  
  // Handle animations based on visibility
  useEffect(() => {
    if (inView) {
      // Start Twitter animation immediately
      setAnimateTwitter(true);
      
      // Start GitHub animation after a delay
      setTimeout(() => {
        setAnimateGithub(true);
      }, 800);
    } else {
      // Reset animations when out of view
      setAnimateTwitter(false);
      setAnimateGithub(false);
    }
  }, [inView]);

  return (
    <footer className=" text-white" ref={containerRef}>
      <div className="bg-brandGray-900 py-6 px-6">
        <div className="flex justify-between items-center">
          <div className="flex space-x-8">
            {/* Twitter Icon - Apply animation class directly */}
            <a
              href="https://twitter.com/andrewgenai"
              target="_blank"
              rel="noopener noreferrer"
              className="relative inline-block"
              onClick={() => {}}
            >
              <LuTwitter 
                className={clsx(
                  'h-6 w-6 fill-current text-brandGreen-500',
                  animateTwitter && 'animate-icon-gentle-pulse'
                )}
                onAnimationEnd={() => {}}
              />
            </a>

            {/* GitHub Icon - Apply animation class directly */}
            <a
              href="https://github.com/life423"
              target="_blank"
              rel="noopener noreferrer"
              className="relative inline-block"
              onClick={() => {}}
            >
              <LuGithub 
                className={clsx(
                  'h-6 w-6 fill-current text-brandGreen-500',
                  animateGithub && 'animate-icon-gentle-pulse'
                )}
                onAnimationEnd={() => {}}
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
