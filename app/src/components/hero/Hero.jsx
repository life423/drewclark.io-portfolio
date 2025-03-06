// FILE: app/src/components/hero/Hero.jsx
import React, { useState, useEffect, memo } from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import sproutMobile from '../../assets/sprout-mobile.jpg';
import sproutOriginal from '../../assets/sprout-original.jpg';
import sproutXs from '../../assets/sprout-xs.jpg';
import ProjectGrid from './ProjectGrid';
import { gradients, transitions } from '../../styles/utils';

/**
 * Hero section with integrated asymmetric project grid
 * Creates an immersive showcase with variable card sizes
 */
const Hero = memo(() => {
  const [loaded, setLoaded] = useState(false);

  // Animate in on load
  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section id="hero" className="relative w-full h-screen overflow-hidden">
      {/* Small mobile background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat sm:hidden z-0"
        style={{ 
          backgroundImage: `url(${sproutXs})`
        }}
      />
      
      {/* Mobile background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat hidden sm:block md:hidden z-0"
        style={{ 
          backgroundImage: `url(${sproutMobile})`
        }}
      />
      
      {/* Desktop background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat hidden md:block z-0"
        style={{ 
          backgroundImage: `url(${sproutOriginal})`
        }}
      />
      
      {/* Very subtle gradient overlay with green and blue tones */}
      <div className="
        absolute inset-0 backdrop-blur-[1px] z-0 
        bg-gradient-to-b from-brandGreen-500/10 via-brandBlue-500/10 to-transparent
      " />

      {/* Projects grid (containing the hero text at the top) */}
      <ProjectGrid />
    </section>
  );
});

Hero.displayName = 'Hero';

export default Hero;
