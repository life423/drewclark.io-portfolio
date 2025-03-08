import React, { useState, useEffect } from 'react';
import ProjectCard from './ProjectCard';
import clsx from 'clsx';

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
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-r from-brandGray-900 to-brandGray-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-8 md:p-12">
              <div className="flex items-center mb-4">
                <span className="text-sm font-semibold text-brandGreen-400 px-2 py-1 rounded-md bg-brandGreen-900/20">
                  Chapter 0
                </span>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-brandGreen-300 to-brandBlue-400">
                The Story of My Work
              </h1>
              
              <div className="prose prose-lg prose-invert max-w-none mb-8">
                <p>Welcome to an interactive journey through my portfolio projects. Rather than a simple list, I've created a narrative experience that guides you through each project as chapters in a continuing story.</p>
                <p>Each chapter reveals the challenges, solutions, and technologies behind my work. And you can ask questions along the way to dive deeper into any aspect that interests you.</p>
              </div>
              
              <button
                onClick={handleStart}
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-brandGreen-600 to-brandGreen-500 text-white font-medium hover:shadow-lg hover:from-brandGreen-500 hover:to-brandGreen-400 transition-all duration-200 flex items-center gap-2"
              >
                Begin the Story
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }
  
  return (
    <section className="py-16 px-4">
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
        
        {/* Navigation buttons outside of the card for easier access */}
        <div className="flex justify-between mt-8">
          <button
            onClick={() => navigateToProject(activeProjectIndex - 1)}
            disabled={activeProjectIndex === 0}
            className={clsx(
              "px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-1",
              activeProjectIndex === 0
                ? "bg-brandGray-800 text-brandGray-600 cursor-not-allowed"
                : "bg-brandGray-800 text-white hover:bg-brandGray-700"
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
                : "bg-brandGray-800 text-white hover:bg-brandGray-700"
            )}
          >
            Next Chapter
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        {/* Progress indicator */}
        <div className="flex justify-center mt-6 space-x-2">
          {PROJECTS.map((_, index) => (
            <button
              key={index}
              onClick={() => navigateToProject(index)}
              className={clsx(
                "h-2 w-2 rounded-full transition-all duration-200",
                index === activeProjectIndex
                  ? "bg-neonOrange-500 w-6"
                  : "bg-brandGray-600 hover:bg-brandGray-500"
              )}
              aria-label={`Go to project ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
