import React, { useState, memo } from 'react';
import { FiGithub, FiExternalLink } from 'react-icons/fi';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import TagBadge from '../utils/TagBadge';
import { cards, transitions, gradients } from '../../styles/utils';

/**
 * ProjectCard - Displays an individual project with image, description, tags, and links
 * Supports featured, compact, and horizontal/vertical variations
 */
const ProjectCard = memo(({ 
  title,
  description,
  tags = [],
  imageUrl = '/placeholder-project.jpg',
  repoUrl = '#',
  demoUrl = '#',
  index = 0,
  featured = false,
  compact = false,
  horizontal = false
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Handle image load success
  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  // Handle image load error
  const handleImageError = () => {
    setImageError(true);
  };

  // Determine image height/width based on card type
  const imageContainerClass = horizontal
    ? 'h-full w-1/3 min-w-[120px]'
    : featured 
      ? 'h-64 w-full' 
      : compact 
        ? 'h-32 w-full' 
        : 'h-48 w-full';

  // Card body layout adjustments for horizontal orientation
  const cardBodyClass = horizontal
    ? 'flex-row items-stretch'
    : 'flex-col';
  
  // Content container adjustments for horizontal cards
  const contentContainerClass = horizontal
    ? 'flex-1 pl-4 flex flex-col'
    : '';

  // Adjust description display based on card type
  const descriptionClass = compact 
    ? 'text-sm line-clamp-2 mb-2' 
    : featured
      ? 'mb-4 flex-grow'
      : horizontal
        ? 'text-sm line-clamp-3 mb-2'
        : 'mb-4 flex-grow';

  // Adjust card styling based on featured status
  const cardGradient = featured
    ? 'from-brandGreen-600/30 to-brandBlue-600/30'
    : 'from-brandGreen-500/20 to-neonOrange-500/20';

  // Adjust shadow and hover effects based on importance
  const shadowClass = featured
    ? 'shadow-lg shadow-brandGreen-900/20'
    : compact
      ? 'shadow-sm'
      : 'shadow-md';

  // Scale effect on hover
  const hoverScale = featured 
    ? 'group-hover:scale-[1.03]' 
    : 'group-hover:scale-[1.02]';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1, 
        ease: [0.4, 0, 0.2, 1]
      }}
      className={`
        group relative overflow-hidden rounded-lg 
        bg-gradient-to-br from-brandGray-900/90 to-brandGray-800/90
        p-0.5 h-full ${shadowClass} ${transitions.default}
      `}
    >
      {/* Gradient border effect - more prominent for featured cards */}
      <div className={`
        absolute inset-0 bg-gradient-to-br ${cardGradient}
        opacity-60 transition-opacity duration-300 group-hover:opacity-100
      `}></div>
      
      {/* Card content */}
      <div className={`relative z-10 h-full bg-brandGray-900/90 p-5 rounded-[7px] transition-all duration-300 flex ${cardBodyClass} group-hover:translate-y-[-2px]`}>
        {/* Image area with hover zoom effect */}
        <div className={`relative ${imageContainerClass} mb-${horizontal ? '0' : '4'} overflow-hidden rounded-md bg-brandGray-800`}>
          {/* Loading skeleton shown until image loads */}
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center bg-brandGray-800 animate-pulse">
              <div className="w-12 h-12 rounded-full border-4 border-brandGreen-500/20 border-t-brandGreen-500 animate-spin"></div>
            </div>
          )}
          
          {/* Fallback for image error */}
          {imageError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-brandGray-800 text-brandGray-400">
              <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Image not available</span>
            </div>
          )}
          
          {/* Project image */}
          <img 
            src={imageUrl} 
            alt={title}
            className={`
              absolute inset-0 w-full h-full object-cover 
              transition-transform duration-700 ${hoverScale}
              ${imageLoaded ? 'opacity-100' : 'opacity-0'}
            `}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-brandGray-900 to-transparent opacity-60"></div>
        </div>

        {/* Content container */}
        <div className={contentContainerClass}>
          {/* Project title - larger for featured */}
          <h3 className={`
            ${featured ? 'text-2xl' : 'text-xl'} 
            ${horizontal && !featured ? 'text-lg' : ''}
            font-bold text-white mb-2 transition-colors duration-300 
            group-hover:text-brandGreen-400
          `}>
            {title}
          </h3>

          {/* Project description - conditionally rendered based on compact mode */}
          {(!compact || featured || horizontal) && (
            <p className={`text-brandGray-300 ${descriptionClass}`}>
              {description}
            </p>
          )}
          
          {/* Tech stack tags - show fewer on compact cards */}
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.slice(0, compact || horizontal ? 2 : 5).map((tag, i) => (
              <TagBadge 
                key={i} 
                tag={tag} 
                className={(compact || horizontal) && !featured ? 'text-xs px-1.5 py-0.5' : ''}
              />
            ))}
            {tags.length > ((compact || horizontal) ? 2 : 5) && (
              <span className="text-xs text-brandGray-400">+{tags.length - ((compact || horizontal) ? 2 : 5)}</span>
            )}
          </div>
          
          {/* Action buttons */}
          <div className="flex gap-3 mt-auto">
            <a 
              href={repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`
                flex items-center gap-1 text-sm
                ${(compact || horizontal) && !featured ? 'px-2 py-1 text-xs' : 'px-3 py-1.5'}
                rounded-md bg-brandGray-800 text-white hover:bg-brandGray-700 
                transition-colors duration-200
              `}
            >
              <FiGithub className="text-brandGreen-500" />
              <span>Code</span>
            </a>
            <a 
              href={demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`
                flex items-center gap-1 text-sm
                ${(compact || horizontal) && !featured ? 'px-2 py-1 text-xs' : 'px-3 py-1.5'}
                rounded-md bg-brandGreen-600 text-white hover:bg-brandGreen-700 
                transition-colors duration-200
              `}
            >
              <FiExternalLink />
              <span>Live Demo</span>
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

ProjectCard.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  tags: PropTypes.arrayOf(PropTypes.string),
  imageUrl: PropTypes.string,
  repoUrl: PropTypes.string,
  demoUrl: PropTypes.string,
  index: PropTypes.number,
  featured: PropTypes.bool,
  compact: PropTypes.bool,
  horizontal: PropTypes.bool
};

ProjectCard.displayName = 'ProjectCard';

export default ProjectCard;
