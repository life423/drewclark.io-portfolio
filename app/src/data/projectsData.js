/**
 * Project data for the portfolio
 * This file centralizes all project information to maintain DRY code principles
 */

const projectsData = [
  {
    id: 'alpha',
    title: 'Project Alpha',
    description: 'A responsive dashboard application with real-time data visualization and interactive charts.',
    tags: ['React', 'Tailwind', 'JavaScript', 'Firebase'],
    imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=400&fit=crop',
    repoUrl: 'https://github.com/yourusername/project-alpha',
    demoUrl: 'https://project-alpha-demo.netlify.app',
    featured: true
  },
  {
    id: 'beta',
    title: 'Project Beta',
    description: 'A mobile-first e-commerce platform with advanced filtering and seamless checkout experience.',
    tags: ['React', 'TypeScript', 'Node', 'MongoDB'],
    imageUrl: 'https://images.unsplash.com/photo-1560472355-536de3962603?w=600&h=400&fit=crop',
    repoUrl: 'https://github.com/yourusername/project-beta',
    demoUrl: 'https://project-beta-demo.netlify.app',
    featured: true
  },
  {
    id: 'gamma',
    title: 'Project Gamma',
    description: 'A progressive web app for task management with offline capabilities and cross-device synchronization.',
    tags: ['React', 'Redux', 'PWA', 'GraphQL'],
    imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=400&fit=crop',
    repoUrl: 'https://github.com/yourusername/project-gamma',
    demoUrl: 'https://project-gamma-demo.netlify.app',
    featured: true
  },
  {
    id: 'delta',
    title: 'Project Delta',
    description: 'An AI-powered content generator with customizable templates and export options.',
    tags: ['Vue', 'JavaScript', 'Node', 'Express'],
    imageUrl: 'https://images.unsplash.com/photo-1581276879432-15e50529f34b?w=600&h=400&fit=crop',
    repoUrl: 'https://github.com/yourusername/project-delta',
    demoUrl: 'https://project-delta-demo.netlify.app'
  },
  {
    id: 'epsilon',
    title: 'Project Epsilon',
    description: 'A social platform for connecting creative professionals with immersive profiles.',
    tags: ['React', 'NextJS', 'MongoDB', 'Tailwind'],
    imageUrl: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&h=400&fit=crop',
    repoUrl: 'https://github.com/yourusername/project-epsilon',
    demoUrl: 'https://project-epsilon-demo.netlify.app'
  },
  {
    id: 'zeta',
    title: 'Project Zeta',
    description: 'A multimedia content management system with advanced search and categorization.',
    tags: ['Angular', 'TypeScript', 'Firebase', 'SCSS'],
    imageUrl: 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=600&h=400&fit=crop',
    repoUrl: 'https://github.com/yourusername/project-zeta',
    demoUrl: 'https://project-zeta-demo.netlify.app'
  }
];

// Utility functions for accessing project data
export const getAllProjects = () => projectsData;
export const getFeaturedProjects = () => projectsData.filter(project => project.featured);
export const getProjectById = (id) => projectsData.find(project => project.id === id);

export default projectsData;
