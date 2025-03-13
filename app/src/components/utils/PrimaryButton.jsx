import React, { useRef, useEffect } from 'react';
import clsx from 'clsx';

export default function PrimaryButton({ 
  children, 
  className, 
  href, 
  onClick,
  animateUnderline = true,
  fullWidth = false,
  size = "md", // New size prop with sm, md, lg options
  ...props 
}) {
  const buttonRef = useRef(null);
  const ButtonTag = href ? 'a' : 'button';
  
  // Handle touch interactions for mobile
  useEffect(() => {
    const buttonElement = buttonRef.current;
    const accentLine = buttonElement?.querySelector('[data-accent-line]');
    
    if (buttonElement && accentLine) {
      const handleTouchStart = () => {
        accentLine.style.width = '80%';
        accentLine.style.opacity = '1';
      };
      
      
      buttonElement.addEventListener('touchstart', handleTouchStart);
      
      return () => {
        buttonElement.removeEventListener('touchstart', handleTouchStart);
      };
    }
  }, []);
  
  return (
    <ButtonTag
      ref={buttonRef}
      href={href}
      onClick={onClick}
      className={clsx(
        // Base styles
        "inline-flex items-center justify-center group relative",
        "rounded-full overflow-hidden",
        "bg-gradient-to-r from-brandGreen-600 to-brandGreen-500",
        "border border-brandGreen-400/20",
        "text-white font-medium",
        "shadow-lg shadow-brandGreen-800/20",
        "hover:shadow-xl hover:shadow-brandGreen-500/20",
        "active:shadow-sm",
        "transition-all duration-300 ease-out",
        "touch-manipulation",
        // Size variants
        size === "sm" && "px-4 py-2 text-sm",
        size === "md" && "px-5 py-3",
        size === "lg" && "px-6 py-4 text-lg",
        // Width control
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {/* Button shine/shimmer effect */}
      <span className="absolute inset-0 rounded-full bg-gradient-to-r 
                     from-transparent via-white/10 to-transparent 
                     animate-subtle-shimmer"></span>
      
      {/* Content */}
      <span className="flex items-center space-x-2">
        {children}
      </span>
      
      {/* Orange accent underline with animation */}
      {animateUnderline && (
        <div 
          data-accent-line
          className="absolute bottom-[-8px] h-[2px] w-0 left-1/2 transform -translate-x-1/2
                   bg-gradient-to-r from-transparent via-neonOrange-500 to-transparent
                   opacity-0 animate-accent-line-draw
                   transition-all duration-300 ease-out"
        ></div>
      )}
    </ButtonTag>
  );
}
