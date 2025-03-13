import React, { useRef, useEffect, useCallback } from 'react';
import clsx from 'clsx';

/**
 * PrimaryButton component with animation and responsive styling
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Button content
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.href - URL for anchor links (renders as <a> when provided)
 * @param {Function} props.onClick - Click handler function
 * @param {boolean} props.animateUnderline - Whether to show animated underline effect
 * @param {boolean} props.fullWidth - Whether button should take full width of parent
 * @param {'sm'|'md'|'lg'} props.size - Button size (small, medium, large)
 */
export default function PrimaryButton({ 
  children, 
  className, 
  href, 
  onClick,
  animateUnderline = true,
  fullWidth = false,
  size = "md",
  ...props 
}) {
  const buttonRef = useRef(null);
  const ButtonTag = href ? 'a' : 'button';
  
  // Memoized touch handler for better performance
  const handleTouchStart = useCallback(() => {
    const accentLine = buttonRef.current?.querySelector('[data-accent-line]');
    if (accentLine) {
      accentLine.style.width = '80%';
      accentLine.style.opacity = '1';
    }
  }, []);
  
  // Handle touch interactions for mobile
  useEffect(() => {
    const buttonElement = buttonRef.current;
    
    if (buttonElement && animateUnderline) {
      buttonElement.addEventListener('touchstart', handleTouchStart);
      
      return () => {
        buttonElement.removeEventListener('touchstart', handleTouchStart);
      };
    }
  }, [animateUnderline, handleTouchStart]);
  
  // Button size style variants
  const sizeStyles = {
    sm: "px-4 py-2 text-sm",
    md: "px-5 py-3",
    lg: "px-6 py-4 text-lg"
  };
  
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
        sizeStyles[size] || sizeStyles.md,
        // Width control
        fullWidth && "w-full",
        className
      )}
      aria-label={typeof children === 'string' ? children : undefined}
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
          aria-hidden="true"
        ></div>
      )}
    </ButtonTag>
  );
}
