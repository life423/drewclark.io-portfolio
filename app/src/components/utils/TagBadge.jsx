import React, { memo } from 'react';
import PropTypes from 'prop-types';

// Tag color mapping by technology
const tagColors = {
  react: 'bg-blue-500',
  tailwind: 'bg-cyan-500',
  javascript: 'bg-yellow-500',
  typescript: 'bg-blue-600',
  node: 'bg-green-600',
  mongodb: 'bg-green-500',
  firebase: 'bg-yellow-600',
  graphql: 'bg-pink-600',
  nextjs: 'bg-black',
  vue: 'bg-emerald-500',
  angular: 'bg-red-600',
  express: 'bg-gray-600',
  pwa: 'bg-purple-600',
  redux: 'bg-purple-500',
};

/**
 * TagBadge - A reusable component for displaying technology tags
 * 
 * @param {Object} props
 * @param {string} props.tag - The name of the technology
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element} A styled tag badge
 */
const TagBadge = memo(({ tag, className = '' }) => {
  // Get the appropriate style based on the tag name, defaulting to brandGreen
  const getTagStyle = (tag) => {
    const tagName = tag.toLowerCase();
    return tagColors[tagName] || 'bg-brandGreen-500';
  };

  return (
    <span 
      className={`
        ${getTagStyle(tag)} 
        text-xs px-2 py-1 rounded-full text-white 
        transition-all duration-300 hover:scale-105
        ${className}
      `}
    >
      {tag}
    </span>
  );
});

TagBadge.propTypes = {
  tag: PropTypes.string.isRequired,
  className: PropTypes.string
};

TagBadge.displayName = 'TagBadge';

export default TagBadge;
