import React, { memo } from 'react';
import { FiExternalLink } from 'react-icons/fi';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import TagBadge from '../utils/TagBadge';
import { transitions, gradients, cards } from '../../styles/utils';

/**
 * FeaturedProjectCard - Compact project card variant for hero section
 * Designed to be visually consistent with main project cards but more compact
 */
const FeaturedProjectCard = memo(({
  title,
  tags = [],
  imageUrl,
  demoUrl = '#',
  index = 0
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        delay: 0.5 + (index * 0.2), 
        ease: [0.4, 0, 0.2, 1]
      }}
      className={`
        group relative rounded-lg overflow-hidden shadow-xl 
        max-w-[250px] h-[180px] bg-brandGray-900 
        ${transitions.default} hover:scale-105 hover:shadow-2xl
        will-change-transform
      `}
      style={{
        boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.3)'
      }}
    >
      {/* Background image */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />
      
      {/* Gradient overlay with depth effect */}
      <div className={`absolute inset-0 ${gradients.cardBorder} opacity-60`}></div>
      <div className="absolute inset-0 bg-gradient-to-t from-brandGray-900 via-brandGray-900/80 to-transparent opacity-90"></div>

      {/* Content */}
      <div className="absolute inset-0 p-4 flex flex-col justify-between">
        {/* Title */}
        <h3 className="text-lg font-bold text-white tracking-tight line-clamp-2">
          {title}
        </h3>

        {/* Bottom area with tags and link button */}
        <div className="flex items-end justify-between w-full">
          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 2).map((tag, i) => (
              <TagBadge 
                key={i} 
                tag={tag} 
                className="text-xs px-1.5 py-0.5 rounded-full"
              />
            ))}
          </div>

          {/* Demo button */}
          <a 
            href={demoUrl}
            className="p-1.5 rounded-full bg-neonOrange-500 text-white transform transition-all duration-300 hover:rotate-12"
            aria-label="View demo"
          >
            <FiExternalLink size={16} />
          </a>
        </div>
      </div>
    </motion.div>
  );
});

FeaturedProjectCard.propTypes = {
  title: PropTypes.string.isRequired,
  tags: PropTypes.arrayOf(PropTypes.string),
  imageUrl: PropTypes.string.isRequired,
  demoUrl: PropTypes.string,
  index: PropTypes.number
};

FeaturedProjectCard.displayName = 'FeaturedProjectCard';

export default FeaturedProjectCard;
