import React, { useState } from 'react';
import { FiGithub, FiExternalLink } from 'react-icons/fi';
import { motion } from 'framer-motion';

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

const ProjectCard = ({ 
  title,
  description,
  tags = [],
  imageUrl = '/placeholder-project.jpg',
  repoUrl = '#',
  demoUrl = '#',
  index = 0
}) => {
  // Generate tag styles based on the tag name
  const getTagStyle = (tag) => {
    const tagName = tag.toLowerCase();
    return tagColors[tagName] || 'bg-brandGreen-500';
  };

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
      className="group relative overflow-hidden rounded-lg bg-gradient-to-br from-brandGray-900 to-brandGray-800 p-0.5 h-full"
    >
      {/* Gradient border effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-brandGreen-500/20 to-neonOrange-500/20 opacity-50 transition-opacity duration-300 group-hover:opacity-100"></div>
      
      {/* Card content */}
      <div className="relative z-10 h-full bg-brandGray-900 p-5 rounded-[7px] transition-all duration-300 flex flex-col group-hover:translate-y-[-2px]">
        {/* Image area with hover zoom effect and loading state */}
        <div className="relative h-48 w-full mb-4 overflow-hidden rounded-md bg-brandGray-800">
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
            className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-brandGray-900 to-transparent opacity-60"></div>
        </div>

        {/* Project title */}
        <h3 className="text-xl font-bold text-white mb-2 transition-colors duration-300 group-hover:text-brandGreen-400">
          {title}
        </h3>

        {/* Project description */}
        <p className="text-brandGray-300 mb-4 flex-grow">
          {description}
        </p>
        
        {/* Tech stack tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag, i) => (
            <span 
              key={i}
              className={`${getTagStyle(tag)} text-xs px-2 py-1 rounded-full text-white transition-all duration-300 hover:scale-105`}
            >
              {tag}
            </span>
          ))}
        </div>
        
        {/* Action buttons */}
        <div className="flex gap-3 mt-auto">
          <a 
            href={repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-md bg-brandGray-800 text-white hover:bg-brandGray-700 transition-colors duration-200"
          >
            <FiGithub className="text-brandGreen-500" />
            <span>Code</span>
          </a>
          <a 
            href={demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-md bg-brandGreen-600 text-white hover:bg-brandGreen-700 transition-colors duration-200"
          >
            <FiExternalLink />
            <span>Live Demo</span>
          </a>
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectCard;
