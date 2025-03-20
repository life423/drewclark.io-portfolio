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
  
  useEffect(() => {
    if (inView) {
      setAnimateTwitter(true);
      setTimeout(() => setAnimateGithub(true), 800);
    } else {
      setAnimateTwitter(false);
      setAnimateGithub(false);
    }
  }, [inView]);

  const currentYear = new Date().getFullYear();

  return (
    <footer ref={containerRef} className="bg-brandGray-900 text-white">
      <div className="py-8 px-6">
        {/* Single row layout on all screen sizes */}
        <div className="flex flex-row justify-between items-center">
          
          {/* Left side: icons with reduced spacing */}
          <div className="flex space-x-6">
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

          {/* Right side with consistent text sizing */}
          <div className="flex flex-col items-end text-right space-y-1">
            {/* Email with explicit text size */}
            <a
              href="mailto:drew@drewclark.io"
              className="text-sm text-brandGreen-500 hover:underline"
            >
              drew@drewclark.io
            </a>

            {/* Copyright with matching text size */}
            <div className="text-sm text-brandGray-200">
              Clark Company Limited &copy; {currentYear}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
