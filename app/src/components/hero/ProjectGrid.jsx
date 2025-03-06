import React, { memo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { getAllProjects, getFeaturedProjects } from '../../data/projectsData';
import ProjectCard from '../cards/ProjectCard';
import { layout, gradients, typography, transitions } from '../../styles/utils';

/**
 * ProjectGrid - Asymmetric grid layout for showcasing projects
 * Creates a dynamic hero section with mixed horizontal and vertical cards
 * Positioned to allow the background sprout image to be visible
 */
const ProjectGrid = memo(() => {
  const [isLoaded, setIsLoaded] = useState(false);
  const allProjects = getAllProjects();
  
  // Get only 4 projects total
  const projects = allProjects.slice(0, 4);

  // Animate in on load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  };

  return (
    <div className="relative w-full h-screen flex items-center justify-center">
      {/* Main content container - positioned to allow sprout visibility */}
      <div className="w-full max-w-7xl mx-auto px-4 h-full flex flex-col">
        {/* Asymmetric Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 lg:gap-6 w-full h-full pt-16 lg:pt-12">
          {/* Hero Text Area - Top left for maximum sprout visibility */}
          <div className="md:col-span-4 flex items-center md:items-start z-10">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : -20 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="max-w-sm mb-4 md:mb-0"
            >
              <h1 className={`${typography.heading.h1} text-white mb-4 drop-shadow-md`}>
                Enterprise Solutions
              </h1>
              <p className="text-lg text-white/90 mb-6 leading-relaxed">
                Crafting innovative digital experiences with cutting-edge technology.
              </p>
            </motion.div>
          </div>
          
          {/* Empty space for sprout visibility - Deliberately leaves a gap */}
          <div className="hidden md:block md:col-span-1"></div>
          
          {/* Featured Project - Right side vertical card */}
          <motion.div 
            className="md:col-span-3 lg:col-span-3 md:col-start-5 lg:row-span-2"
            variants={itemVariants}
            initial="hidden"
            animate={isLoaded ? "visible" : "hidden"}
          >
            <ProjectCard
              key={projects[0].id}
              title={projects[0].title}
              description={projects[0].description}
              imageUrl={projects[0].imageUrl}
              tags={projects[0].tags}
              repoUrl={projects[0].repoUrl}
              demoUrl={projects[0].demoUrl}
              featured={true}
              horizontal={false}
            />
          </motion.div>

          {/* Empty space for sprout visibility - Deliberately leaves a gap */}
          <div className="hidden md:block md:col-span-1"></div>
          
          {/* Right Side Project - Vertical card */}
          <motion.div 
            className="md:col-span-3 md:col-start-9 md:row-start-1"
            variants={itemVariants}
            initial="hidden"
            animate={isLoaded ? "visible" : "hidden"}
          >
            <ProjectCard
              key={projects[1].id}
              title={projects[1].title}
              description={projects[1].description}
              imageUrl={projects[1].imageUrl}
              tags={projects[1].tags}
              repoUrl={projects[1].repoUrl}
              demoUrl={projects[1].demoUrl}
              compact={true}
              horizontal={false}
            />
          </motion.div>

          {/* Bottom Left Project - Horizontal card */}
          <motion.div 
            className="md:col-span-4 md:row-span-1 md:col-start-1 md:row-start-2"
            variants={itemVariants}
            initial="hidden"
            animate={isLoaded ? "visible" : "hidden"}
          >
            <ProjectCard
              key={projects[2].id}
              title={projects[2].title}
              description={projects[2].description}
              imageUrl={projects[2].imageUrl}
              tags={projects[2].tags}
              repoUrl={projects[2].repoUrl}
              demoUrl={projects[2].demoUrl}
              compact={true}
              horizontal={true}
            />
          </motion.div>

          {/* Bottom Right Project - Horizontal wide card */}
          <motion.div 
            className="md:col-span-7 md:row-span-1 md:col-start-6 md:row-start-2 lg:mt-3"
            variants={itemVariants}
            initial="hidden"
            animate={isLoaded ? "visible" : "hidden"}
          >
            <ProjectCard
              key={projects[3].id}
              title={projects[3].title}
              description={projects[3].description}
              imageUrl={projects[3].imageUrl}
              tags={projects[3].tags}
              repoUrl={projects[3].repoUrl}
              demoUrl={projects[3].demoUrl}
              horizontal={true}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
});

ProjectGrid.displayName = 'ProjectGrid';

export default ProjectGrid;
