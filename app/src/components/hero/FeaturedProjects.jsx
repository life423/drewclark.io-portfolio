import React, { useEffect, useState, memo } from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import FeaturedProjectCard from '../cards/FeaturedProjectCard';
import { getFeaturedProjects } from '../../data/projectsData';
import { transitions } from '../../styles/utils';

/**
 * FeaturedProjects - Displays featured projects in the hero section
 * with motion effects that create the impression of "breaking out" of the hero
 */
const FeaturedProjects = memo(({ scrollProgress = 0 }) => {
  // Get featured projects from centralized data source
  const featuredProjects = getFeaturedProjects();
  const [isVisible, setIsVisible] = useState(false);
  
  // Set visibility with a slight delay for dramatic effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 600);
    
    return () => clearTimeout(timer);
  }, []);

  // Calculate positions based on scroll progress
  const getCardStyle = (index) => {
    // Calculate different positions and effects based on card index (left, center, right)
    // These positions create a "fan" effect with the cards as centerpieces
    const positions = [
      { x: 0, y: 0, scale: 1.05 },            // Center card (slightly larger)
      { x: -110, y: -20, scale: 0.95 },       // Left card 
      { x: 110, y: -20, scale: 0.95 }         // Right card
    ];
    
    // When scrolling, cards move outward and fade
    const x = positions[index].x * (1 + scrollProgress * 0.8);
    const y = positions[index].y - (scrollProgress * 50); // Cards rise slightly on scroll
    const scale = positions[index].scale * (1 - scrollProgress * 0.1);
    
    return {
      translateX: `${x}%`,
      translateY: `${y}%`,
      scale,
      opacity: 1 - scrollProgress * 1.2 // Fade out as scroll progresses
    };
  };

  return (
    <div className="absolute inset-x-0 bottom-0 h-[300px] pointer-events-none">
      <div className="relative w-full h-full max-w-[900px] mx-auto">
        {/* Featured project cards with animation */}
        {featuredProjects.map((project, index) => (
          <motion.div
            key={project.id}
            className="absolute bottom-0 pointer-events-auto"
            style={{
              // Position cards across the width of the container
              left: index === 0 ? '50%' : (index === 1 ? '18%' : '82%'),
              x: '-50%', // Center each card on its position
              zIndex: index === 0 ? 30 : 20, // Center card above others
            }}
            initial={{ opacity: 0, y: 50 }}
            animate={isVisible ? {
              opacity: 1 - (scrollProgress > 0.8 ? (scrollProgress - 0.8) * 5 : 0),
              y: 0,
              ...getCardStyle(index)
            } : { opacity: 0, y: 50 }}
            transition={{
              type: 'spring',
              duration: 0.8,
              delay: 0.5 + (index * 0.2),
              bounce: 0.3
            }}
          >
            <FeaturedProjectCard
              title={project.title}
              tags={project.tags}
              imageUrl={project.imageUrl}
              demoUrl={project.demoUrl}
              index={index}
            />
          </motion.div>
        ))}

        {/* View All Projects button - appears as user scrolls */}
        <motion.div
          className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-16 mb-8 pointer-events-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: isVisible ? Math.min(1, scrollProgress * 3) : 0,
            y: isVisible ? (scrollProgress * -40) : 20
          }}
          transition={{ duration: 0.5 }}
        >
          <a
            href="#projects"
            className={`inline-flex items-center gap-2 px-6 py-3 bg-neonOrange-500 text-white rounded-full font-medium ${transitions.scale}`}
          >
            <span>View All Projects</span>
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L10 14.586l5.293-5.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </a>
        </motion.div>
      </div>
    </div>
  );
});

FeaturedProjects.propTypes = {
  scrollProgress: PropTypes.number
};

FeaturedProjects.displayName = 'FeaturedProjects';

export default FeaturedProjects;
