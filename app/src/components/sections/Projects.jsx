// FILE: app/src/components/sections/Projects.jsx
import React from 'react';
import ProjectCard from '../cards/ProjectCard';

// Project data array - This could be moved to a separate data file in a real project
const projectsData = [
  {
    title: 'Project Alpha',
    description: 'A responsive dashboard application with real-time data visualization and interactive charts.',
    tags: ['React', 'Tailwind', 'JavaScript', 'Firebase'],
    imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=400&fit=crop',
    repoUrl: 'https://github.com/yourusername/project-alpha',
    demoUrl: 'https://project-alpha-demo.netlify.app'
  },
  {
    title: 'Project Beta',
    description: 'A mobile-first e-commerce platform with advanced filtering and seamless checkout experience.',
    tags: ['React', 'TypeScript', 'Node', 'MongoDB'],
    imageUrl: 'https://images.unsplash.com/photo-1560472355-536de3962603?w=600&h=400&fit=crop',
    repoUrl: 'https://github.com/yourusername/project-beta',
    demoUrl: 'https://project-beta-demo.netlify.app'
  },
  {
    title: 'Project Gamma',
    description: 'A progressive web app for task management with offline capabilities and cross-device synchronization.',
    tags: ['React', 'Redux', 'PWA', 'GraphQL'],
    imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=400&fit=crop',
    repoUrl: 'https://github.com/yourusername/project-gamma',
    demoUrl: 'https://project-gamma-demo.netlify.app'
  },
  {
    title: 'Project Delta',
    description: 'An AI-powered content generator with customizable templates and export options.',
    tags: ['Vue', 'JavaScript', 'Node', 'Express'],
    imageUrl: 'https://images.unsplash.com/photo-1581276879432-15e50529f34b?w=600&h=400&fit=crop',
    repoUrl: 'https://github.com/yourusername/project-delta',
    demoUrl: 'https://project-delta-demo.netlify.app'
  },
  {
    title: 'Project Epsilon',
    description: 'A social platform for connecting creative professionals with immersive profiles.',
    tags: ['React', 'NextJS', 'MongoDB', 'Tailwind'],
    imageUrl: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&h=400&fit=crop',
    repoUrl: 'https://github.com/yourusername/project-epsilon',
    demoUrl: 'https://project-epsilon-demo.netlify.app'
  },
  {
    title: 'Project Zeta',
    description: 'A multimedia content management system with advanced search and categorization.',
    tags: ['Angular', 'TypeScript', 'Firebase', 'SCSS'],
    imageUrl: 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=600&h=400&fit=crop',
    repoUrl: 'https://github.com/yourusername/project-zeta',
    demoUrl: 'https://project-zeta-demo.netlify.app'
  }
];

export default function Projects() {
  return (
    <section id="projects" className="py-20 bg-brandGray-800">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Section header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 relative inline-block">
            My Projects
            <span className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-brandGreen-500 to-neonOrange-500"></span>
          </h2>
          <p className="text-brandGray-300 text-lg md:text-xl leading-relaxed">
            Explore my portfolio of projects showcasing expertise in modern web development,
            responsive design, and interactive user experiences.
          </p>
        </div>
        
        {/* Projects grid - responsive for all devices */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projectsData.map((project, index) => (
            <ProjectCard
              key={index}
              index={index}
              title={project.title}
              description={project.description}
              imageUrl={project.imageUrl}
              tags={project.tags}
              repoUrl={project.repoUrl}
              demoUrl={project.demoUrl}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
