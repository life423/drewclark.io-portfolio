import React, { useState, useEffect } from 'react';
import ProjectCard from './ProjectCard';
import clsx from 'clsx';
import PrimaryButton from '../utils/PrimaryButton';

// Sample project data - in a real implementation, this could come from an API or CMS
const PROJECTS = [
  {
    id: 1,
    title: 'Real-Time Analytics Dashboard',
    summary: 'A modern dashboard for monitoring user engagement and system performance.',
    stack: ['React', 'Node.js', 'WebSockets', 'D3.js'],
    initialStoryText: 'This project began as a challenge: how to visualize thousands of data points in real-time without sacrificing performance. I architected a solution using WebSockets for data streaming and custom D3.js visualizations that could handle high-frequency updates.'
  },
  {
    id: 2,
    title: 'AI-Powered Content Generator',
    summary: 'A tool that uses machine learning to generate marketing content tailored to different audiences.',
    stack: ['Python', 'TensorFlow', 'FastAPI', 'React'],
    initialStoryText: 'As lead developer on this project, I implemented a natural language processing pipeline that could analyze existing content and generate new variations optimized for different target demographics. The system learned from user feedback to continuously improve output quality.'
  },
  {
    id: 3,
    title: 'Cross-Platform Mobile App',
    summary: 'A feature-rich mobile application that works seamlessly across iOS and Android.',
    stack: ['React Native', 'Firebase', 'Redux', 'GraphQL'],
    initialStoryText: 'Developing a cross-platform app that maintains native performance while sharing the majority of code was our primary objective. I designed a modular architecture that allowed platform-specific optimizations where needed while maintaining a consistent user experience.'
  }
];

export default function ProjectsContainer() {
  const [started, setStarted] = useState(false);
  const [activeProjectIndex, setActiveProjectIndex] = useState(0);
  const [transitionDirection, setTransitionDirection] = useState(null);
  
  const handleStart = () => {
    setStarted(true);
  };
  
  const navigateToProject = (index) => {
    if (index < 0 || index >= PROJECTS.length) return;
    
    setTransitionDirection(index > activeProjectIndex ? 'next' : 'prev');
    setActiveProjectIndex(index);
  };
  
  useEffect(() => {
    // Reset transition direction after animation completes
    if (transitionDirection) {
      const timer = setTimeout(() => {
        setTransitionDirection(null);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [transitionDirection]);
  
  // Intro screen (Chapter 0)
  if (!started) {
  return (
    <section className="relative py-16 px-4 bg-gradient-to-b from-brandGreen-950/90 via-brandGreen-900/95 to-brandGreen-900">
      {/* Subtle noise texture overlay */}
      <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none"
           style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%\' height=\'100%\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}></div>
        <div className="max-w-3xl mx-auto">
          <div className="my-8 overflow-hidden rounded-xl shadow-lg bg-brandGray-800 border border-brandGray-700 transform transition-all duration-300 hover:shadow-xl hover:border-brandGray-600 shadow-[0_0_20px_-5px_rgba(16,185,129,0.15)]">
            {/* Chapter Header - styled like ProjectCard */}
            <div className="p-5 border-b border-brandGray-700 bg-gradient-to-r from-brandGray-800 via-brandGray-800 to-brandBlue-900/10">
              <div className="flex items-center mb-2">
                <span className="text-sm font-semibold text-white px-2 py-1 rounded-md bg-gradient-to-r from-neonOrange-700 to-neonOrange-600 shadow-sm">
                  Chapter 0
                </span>
              </div>
              
              <h1 className="text-2xl font-bold text-brandGreen-300 mb-1">
                The Story of My Work
              </h1>
            </div>
            
            <div className="p-8">
              <div className="prose prose-lg prose-invert max-w-none mb-6">
                <p>Welcome to an interactive journey through my portfolio projects. Rather than a simple list, I've created a narrative experience that guides you through each project as chapters in a continuing story.</p>
                <p>Each chapter reveals the challenges, solutions, and technologies behind my work. And you can ask questions along the way to dive deeper into any aspect that interests you.</p>
              </div>
              
              {/* Chapter Title Previews */}
              <div className="space-y-2 mb-8 text-sm">
                <h3 className="text-brandGray-400 uppercase text-xs tracking-wider mb-3">Coming Up</h3>
                {PROJECTS.map((project, index) => (
                  <div key={index} className="flex items-center text-brandGray-300 hover:text-brandGreen-400 transition-colors duration-200">
                    <span className="text-neonOrange-500 font-semibold mr-2">Chapter {index + 1}:</span>
                    <span>{project.title}</span>
                  </div>
                ))}
              </div>
              
              <PrimaryButton
                onClick={handleStart}
                size="md"
                className="relative"
              >
                <span>Begin the Story</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 animate-pulse-gentle" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </PrimaryButton>
            </div>
            
            {/* Chapter Progress Indicators - Updated to match main screen */}
            <div className="flex justify-center py-4 border-t border-brandGray-700 bg-brandGray-850 space-x-2">
              <button
                className="h-2 w-8 rounded-full bg-neonOrange-500 transform scale-110"
                aria-label="Current chapter"
              />
              {PROJECTS.map((_, index) => (
                <button
                  key={index}
                  className="h-2 w-2 rounded-full bg-brandGray-600 hover:bg-brandGray-500 transition-all duration-300"
                  aria-label={`Go to project ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }
  
  return (
    <section className="relative py-16 px-4 bg-gradient-to-b from-brandGreen-950/90 via-brandGreen-900/95 to-brandGreen-900">
      {/* Subtle noise texture overlay */}
      <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none"
           style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%\' height=\'100%\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}></div>
      <div className="max-w-3xl mx-auto">
        <div className={clsx(
          "transition-all duration-500",
          transitionDirection === 'next' && 'translate-x-[-100px] opacity-0',
          transitionDirection === 'prev' && 'translate-x-[100px] opacity-0',
        )}>
          <ProjectCard
            chapterNumber={activeProjectIndex + 1}
            title={PROJECTS[activeProjectIndex].title}
            summary={PROJECTS[activeProjectIndex].summary}
            stack={PROJECTS[activeProjectIndex].stack}
            initialStoryText={PROJECTS[activeProjectIndex].initialStoryText}
          />
        </div>
        
        {/* Progress indicator - Moved above the navigation buttons */}
        <div className="flex justify-center mt-6 mb-5 space-x-2">
          {PROJECTS.map((_, index) => (
            <button
              key={index}
              onClick={() => navigateToProject(index)}
              className={clsx(
                "h-2 rounded-full transition-all duration-300",
                index === activeProjectIndex
                  ? "bg-neonOrange-500 w-8 transform scale-110" // Made wider and with slight scale effect
                  : "bg-brandGray-600 hover:bg-brandGray-500 w-2"
              )}
              aria-label={`Go to project ${index + 1}`}
            />
          ))}
        </div>
        
        {/* Navigation buttons outside of the card for easier access */}
        <div className="flex justify-between mt-4">
          <button
            onClick={() => navigateToProject(activeProjectIndex - 1)}
            disabled={activeProjectIndex === 0}
            className={clsx(
              "px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-1",
              activeProjectIndex === 0
                ? "bg-brandGray-800 text-brandGray-600 cursor-not-allowed"
                : "bg-brandGray-800 text-white hover:bg-brandGreen-900"
            )}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Previous Chapter
          </button>
          
          <button
            onClick={() => navigateToProject(activeProjectIndex + 1)}
            disabled={activeProjectIndex === PROJECTS.length - 1}
            className={clsx(
              "px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-1",
              activeProjectIndex === PROJECTS.length - 1
                ? "bg-brandGray-800 text-brandGray-600 cursor-not-allowed"
                : "bg-brandGray-800 text-white hover:bg-brandGreen-900"
            )}
          >
            Next Chapter
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
