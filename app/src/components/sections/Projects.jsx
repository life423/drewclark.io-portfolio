// FILE: app/src/components/sections/Projects.jsx
import React, { memo, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import ProjectCard from '../cards/ProjectCard';
import ProjectCardFallback from '../cards/ProjectCardFallback';
import { getAllProjects } from '../../data/projectsData';
import { typography, layout, gradients } from '../../styles/utils';

/**
 * SectionHeader - Animated header for the projects section
 */
const SectionHeader = memo(() => {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.3,
  });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.2,
          },
        },
      }}
      className="max-w-3xl mx-auto text-center mb-16 pt-6"
    >
      <motion.h2 
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: {
            opacity: 1,
            y: 0,
            transition: {
              duration: 0.6,
              ease: [0.4, 0, 0.2, 1],
            },
          },
        }}
        className={`${typography.heading.h2} text-white mb-6 relative inline-block`}
      >
        My Projects
        <motion.span 
          className={`absolute -bottom-2 left-0 w-full h-1 ${gradients.heading}`}
          initial={{ width: 0 }}
          animate={inView ? { width: '100%' } : { width: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        ></motion.span>
      </motion.h2>
      <motion.p 
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: {
            opacity: 1,
            y: 0,
            transition: {
              duration: 0.6,
              ease: [0.4, 0, 0.2, 1],
            },
          },
        }}
        className="text-brandGray-300 text-lg md:text-xl leading-relaxed"
      >
        Explore my portfolio of projects showcasing expertise in modern web development,
        responsive design, and interactive user experiences.
      </motion.p>
    </motion.div>
  );
});

SectionHeader.displayName = 'SectionHeader';

/**
 * Projects section - Displays all projects in a responsive grid 
 * with visual continuity from the hero section
 */
const Projects = memo(() => {
  // Get projects data from centralized data file
  const projectsData = getAllProjects();
  const [isLoading, setIsLoading] = React.useState(true);
  
  // Simulate loading delay for demonstration
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section 
      id="projects" 
      className="relative py-24 pt-32 bg-brandGray-800 z-10"
    >
      {/* Subtle background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-gradient-to-br from-brandGreen-500/5 to-brandGreen-700/5 blur-2xl"></div>
        <div className="absolute top-1/4 -right-20 w-60 h-60 rounded-full bg-gradient-to-br from-neonOrange-500/5 to-neonOrange-700/5 blur-3xl"></div>
        <div className="absolute bottom-10 left-1/3 w-40 h-40 rounded-full bg-gradient-to-br from-brandBlue-500/5 to-brandBlue-700/5 blur-2xl"></div>
      </div>
      
      <div className={layout.container}>
        {/* Section header with animations */}
        <SectionHeader />
        
        {/* Projects grid with loading states */}
        <div className={layout.cardGrid}>
          {isLoading ? (
            // Show loading placeholders
            Array.from({ length: 6 }).map((_, index) => (
              <ProjectCardFallback key={index} />
            ))
          ) : (
            // Show actual project cards
            projectsData.map((project, index) => (
              <ProjectCard
                key={project.id}
                index={index}
                title={project.title}
                description={project.description}
                imageUrl={project.imageUrl}
                tags={project.tags}
                repoUrl={project.repoUrl}
                demoUrl={project.demoUrl}
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
});

Projects.displayName = 'Projects';

export default Projects;
