import React from 'react'
import sproutXs from '../../assets/sprout-xs.jpg'
import sproutMobile from '../../assets/sprout-mobile.jpg'
import sproutLarge from '../../assets/sprout.jpg'
import sproutOriginal from '../../assets/sprout-original.jpg'
import ResponsiveImage from '../projects/responsive/ResponsiveImage'

/**
 * Hero section background with parallax and visual effects
 * Uses ResponsiveImage component to handle responsive image loading
 */
const HeroBackground = ({ scrollY }) => {
  // Image sources for different screen sizes
  const imageSources = {
    xs: sproutXs,
    sm: sproutMobile,
    lg: sproutLarge,
    xl: sproutOriginal
  };
  
  // srcSet sources with width as keys
  const srcSetSources = {
    640: sproutXs,
    1024: sproutMobile,
    1920: sproutLarge,
    2560: sproutOriginal
  };
  return (
    <div className='absolute inset-0 z-0'>
      {/* Base image with parallax scrolling */}
      {/* Responsive background image */}
      <div className='absolute inset-0 bg-cover bg-center'>
        <ResponsiveImage 
          sources={imageSources}
          srcSetSources={srcSetSources}
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover"
          imgProps={{
            style: {
              filter: 'brightness(0.75)',
              transform: `translateY(${scrollY * 0.15}px)`,
              transition: 'transform 0.1s ease-out',
              transformOrigin: 'center bottom',
            }
          }}
        />
      </div>

      {/* Improved gradient overlay for better text contrast */}
      <div
        className='absolute inset-0 bg-gradient-to-t 
                from-brandGray-900/60 via-brandGreen-900/30 to-transparent'
      ></div>

      {/* Enhanced noise texture for depth */}
      <div
        className='absolute inset-0 opacity-5 mix-blend-overlay pointer-events-none'
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
        }}
      ></div>

      {/* Subtle light beams effect */}
      <div className='absolute inset-0 opacity-10 pointer-events-none overflow-hidden'>
        <div className='absolute -inset-x-full top-0 h-screen rotate-12 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-light-sweep'></div>
      </div>

      {/* Animated plant silhouette with parallax */}
      <div
        className='absolute right-0 bottom-0 w-1/3 md:w-1/4 h-3/4 pointer-events-none opacity-20 mix-blend-soft-light'
        style={{
          transform: `translateY(${scrollY * -0.05}px)`,
          transition: 'transform 0.1s ease-out',
        }}
      >
        {/* Plant silhouette placeholder */}
      </div>
    </div>
  );
};

export default HeroBackground;
