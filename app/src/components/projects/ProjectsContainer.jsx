 import React, { useState, useEffect } from 'react'
import ProjectCard from './ProjectCard'
import UnifiedProjectChat from './UnifiedProjectChat'
import clsx from 'clsx'
import PrimaryButton from '../utils/PrimaryButton'

const PROJECTS = [
    {
        id: 1,
        title: 'AI Platform Trainer',
        summary:
            'A 2D platformer game featuring AI-driven enemy behavior built with Python and Pygame.',
        stack: ['Python', 'Pygame', 'AI Algorithms', 'Game Development'],
        initialDescription:
            'I developed this 2D platformer game from scratch to deepen my understanding of game development and AI implementation. The project features intelligent enemies that adapt their behavior based on player actions, creating a dynamic and challenging gameplay experience.',
        detailedDescription:
            'AI Platform Trainer is a complete 2D platformer with modular code architecture and AI-driven enemy behavior. The game demonstrates how even simple AI implementations can create engaging gameplay by having enemies that learn and respond to player actions, rather than following fixed patterns.',
        technicalDetails:
            'Built with Python and the Pygame library, the game uses a component-based architecture to handle various game elements. Enemy AI is implemented using pathfinding algorithms and basic machine learning concepts to create adaptive behavior. The project includes collision detection, physics simulation, sprite animations, and state management systems.',
        challenges:
            'The biggest challenge was creating enemy AI that felt intelligent without being frustratingly difficult. I solved this by implementing a layered approach to enemy decision-making that balances aggression with vulnerability. Another challenge was optimizing performance while maintaining visual quality, which required efficient sprite handling and collision detection algorithms.',
        readme: 'This project showcases game development skills and basic AI implementation in a practical, playable format. The code is structured in a modular way that allows for easy expansion and modification. The MIT-licensed codebase is available on GitHub and serves as both a fun game and a learning resource for those interested in game development or AI programming fundamentals.',
    },
    {
        id: 2,
        title: 'Cryptography Toolkit with AI Analysis',
        summary:
            'A comprehensive encryption application implementing Caesar and Polyalphabetic ciphers with AI-powered cryptanalysis capabilities.',
        stack: ['Python', 'PyQt', 'Cryptography', 'Machine Learning'],
        initialDescription:
            'I developed this cryptography toolkit to explore classical encryption techniques while implementing modern analysis methods. The application features both encryption/decryption capabilities and intelligent cipher-breaking algorithms that can detect and analyze encrypted text patterns.',
        detailedDescription:
            'This Cryptography Toolkit provides an educational platform for understanding how classical ciphers work, their vulnerabilities, and methods for breaking them. It implements Caesar cipher (with simple character shifting) and more complex Polyalphabetic substitution ciphers that use multiple substitution alphabets. The AI analyzer component can detect the cipher type and attempt to break it using statistical analysis and pattern recognition.',
        technicalDetails:
            'Built with Python and PyQt for the graphical interface, the application features a modular architecture with separate components for encryption/decryption logic, file handling, and AI analysis. The cryptanalysis module uses frequency analysis, pattern matching, and machine learning techniques to identify cipher types and attempt decryption without knowing the key. The application supports both text and file-based encryption with customizable parameters.',
        challenges:
            'The primary challenge was developing effective cipher-breaking algorithms that could work reliably across different languages and text lengths. I implemented a layered approach to frequency analysis that adapts to the input text characteristics. Another significant challenge was creating an intuitive interface that makes complex cryptographic concepts accessible to users without extensive background in the field.',
        readme: 'This desktop application provides tools for encrypting/decrypting text using classical ciphers, with a built-in AI analyzer that can detect encryption methods and attempt to break simple ciphers. Features include: multiple cipher implementations, key generation tools, frequency analysis visualizations, brute-force attack simulations, and educational resources about cryptographic principles. The codebase follows object-oriented design principles with comprehensive testing and documentation.',
    },
    {
        id: 3,
        title: 'Ascend-Avoid',
        summary:
            'A responsive HTML5 Canvas game with touch controls and progressive difficulty.',
        stack: ['JavaScript', 'HTML5 Canvas', 'CSS3', 'Jest'],
        initialDescription:
            'I created this browser-based arcade game to practice object-oriented JavaScript and canvas animation. The game features a player-controlled white block that must navigate across the screen while avoiding moving obstacles, with difficulty increasing as your score rises.',
        detailedDescription:
            'Ascend-Avoid is an HTML5 Canvas game that works across devices, offering both keyboard and touch controls. The game presents the player with a simple yet challenging objective: guide a white block to the top of the screen without colliding with blue obstacle blocks. As you progress, the game becomes increasingly difficult by spawning more obstacles at higher speeds.',
        technicalDetails:
            'Built with vanilla JavaScript using ES6+ features and classes for game objects. The animation system uses requestAnimationFrame with delta time calculations to ensure consistent gameplay regardless of device performance. Collision detection is optimized using axis-aligned bounding box (AABB) algorithms. The game includes intelligent obstacle spawning logic to prevent unfair object clustering.',
        challenges:
            'The main challenge was creating frame-rate independent animations that would run consistently across different devices. I solved this by implementing delta time-based movement instead of frame-based updates. Another significant challenge was designing responsive controls that work well on both desktop and mobile devices, which I addressed by developing keyboard input for desktop and touch/swipe detection for mobile.',
        readme: 'This browser game demonstrates object-oriented programming principles and responsive design techniques. Features include adaptive difficulty based on player score, intelligent obstacle spawning to prevent unfair overlaps, responsive design for all screen sizes, touch controls for mobile devices, and comprehensive test coverage with Jest. The game presents a simple yet engaging challenge suitable for players of all ages.',
    },
]

export default function ProjectsContainer() {
    const [started, setStarted] = useState(false)
    const [activeProjectIndex, setActiveProjectIndex] = useState(0)
    const [transitionDirection, setTransitionDirection] = useState(null)

    const handleStart = () => {
        setStarted(true)
    }

    const navigateToProject = index => {
        if (index < 0 || index >= PROJECTS.length) return

        setTransitionDirection(index > activeProjectIndex ? 'next' : 'prev')
        setActiveProjectIndex(index)
    }

    useEffect(() => {
        if (transitionDirection) {
            const timer = setTimeout(() => {
                setTransitionDirection(null)
            }, 500)

            return () => clearTimeout(timer)
        }
    }, [transitionDirection])

        if (!started) {
        return (
            <section className='relative py-16 px-4 bg-gradient-to-b from-brandGreen-950/90 via-brandGreen-900/95 to-brandGreen-900 overflow-x-hidden'>
                {}
                <div
                    className='absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none'
                    style={{
                        backgroundImage:
                            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
                    }}
                ></div>
                <div className='max-w-3xl mx-auto'>
                    <div className='my-4 sm:my-6 md:my-8 overflow-hidden rounded-xl shadow-[0_0_20px_-5px_rgba(16,185,129,0.15)] bg-brandGray-800 border border-brandGray-700 transform transition-all duration-300 hover:shadow-xl hover:border-brandGray-600 flex flex-col min-h-[500px] lg:h-[700px]'>
                        {}
                        <div className='p-3 sm:p-4 md:p-5 border-b border-brandGray-700 bg-gradient-to-r from-brandGray-800 via-brandGray-800 to-brandBlue-900/10'>
                            <div className='flex items-center justify-between mb-2'>
                                <span className='text-sm font-semibold text-white px-2 py-1 rounded-md bg-gradient-to-r from-brandOrange-700 to-brandOrange-600 shadow-sm'>
                                    Overview
                                </span>
                            </div>

                            <h1 className='text-xl sm:text-2xl font-bold text-brandGreen-300 mb-1'>
                                My Portfolio Projects
                            </h1>
                        </div>

                        <div className='p-3 sm:p-4 md:p-5 flex-1 flex flex-col'>
                            {/* Welcome text - shown on all screen sizes */}
                            <div className='prose prose-sm prose-invert max-w-none mb-3 sm:mb-4 md:mb-6'>
                                <p>
                                    Welcome to an interactive journey through my
                                    portfolio projects. Rather than a simple
                                    list, I've created an experience that guides
                                    you through each of my key projects.
                                </p>
                                <p>
                                    Each project reveals the challenges,
                                    solutions, and technologies behind my work.
                                    And you can ask questions along the way to
                                    dive deeper into any aspect that interests
                                    you.
                                </p>
                            </div>

                            {/* Project list - displayed differently based on screen size */}
                            <div className='lg:block hidden'>
                                {/* On desktop: Simple vertical list */}
                                <div className='space-y-1 sm:space-y-2 mb-4 sm:mb-6 md:mb-8 text-xs sm:text-sm'>
                                    <h3 className='text-brandGray-400 uppercase text-xs tracking-wider mb-2 md:mb-3'>
                                        Coming Up
                                    </h3>
                                    {PROJECTS.map((project, index) => (
                                        <div
                                            key={index}
                                            className='flex items-center text-brandGray-300 hover:text-brandGreen-400 transition-colors duration-200'
                                        >
                                            <span className='text-brandOrange-500 font-semibold mr-2'>
                                                Project {index + 1}:
                                            </span>
                                            <span>{project.title}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* On tablet and mobile: Premium card-style projects similar to desktop project overview */}
                            <div className='lg:hidden block'>
                                <h3 className='text-brandGray-400 uppercase text-xs tracking-wider mb-2 font-medium'>
                                    Projects Overview
                                </h3>
                                
                                {/* On tablets - show 3 cards in a row */}
                                <div className='hidden sm:grid sm:grid-cols-3 gap-3 mb-4'>
                                    {PROJECTS.map((project, index) => (
                                        <div 
                                            key={index}
                                            className='transition-all duration-300 cursor-pointer p-3 rounded-lg border bg-gradient-to-br from-brandGray-800 to-brandGray-800/90 border-brandGray-700 hover:border-brandGray-600 hover:shadow-[0_4px_12px_-2px_rgba(11,163,112,0.12)] hover:translate-y-[-1px]'
                                        >
                                            <div className='flex items-center justify-between'>
                                                <span className='text-xs font-semibold text-brandOrange-400 px-2 py-0.5 rounded-md bg-brandOrange-900/30 border border-brandOrange-800/30 shadow-sm'>
                                                    #{index + 1}
                                                </span>
                                                <div className='w-2 h-2 rounded-full bg-gradient-to-r from-brandGreen-500 to-brandGreen-400 opacity-60'></div>
                                            </div>
                                            <h4 className='font-medium text-white mt-2 text-sm truncate'>
                                                {project.title}
                                            </h4>
                                            <div className='flex flex-wrap gap-1 mt-2'>
                                                {project.stack.slice(0, 2).map((tech, techIndex) => (
                                                    <span
                                                        key={techIndex}
                                                        className='text-[10px] font-medium text-brandGray-300 px-1.5 py-0.5 rounded-full bg-brandGray-700/70 border border-brandGray-700'
                                                    >
                                                        {tech}
                                                    </span>
                                                ))}
                                                {project.stack.length > 2 && (
                                                    <span className='text-[10px] font-medium text-brandGray-300 px-1.5 py-0.5 rounded-full bg-brandGray-700/70 border border-brandGray-700'>
                                                        +{project.stack.length - 2}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
                                {/* On mobile - show more compact horizontal cards */}
                                <div className='sm:hidden grid grid-cols-1 gap-2 mb-4'>
                                    {PROJECTS.map((project, index) => (
                                        <div 
                                            key={index}
                                            className='transition-all duration-300 cursor-pointer p-2 rounded-lg border bg-gradient-to-r from-brandGray-800 to-brandGray-800/90 border-brandGray-700 hover:border-brandGray-600'
                                        >
                                            <div className='flex items-center justify-between'>
                                                <div className='flex items-center gap-2'>
                                                    <span className='text-xs font-semibold text-brandOrange-400 px-2 py-0.5 rounded-md bg-brandOrange-900/30 border border-brandOrange-800/30 shadow-sm'>
                                                        #{index + 1}
                                                    </span>
                                                    <h4 className='font-medium text-white text-sm'>
                                                        {project.title}
                                                    </h4>
                                                </div>
                                                <div className='w-2 h-2 rounded-full bg-gradient-to-r from-brandGreen-500 to-brandGreen-400 opacity-60 flex-shrink-0'></div>
                                            </div>
                                            <div className='flex flex-wrap gap-1 mt-2 ml-7'>
                                                {project.stack.slice(0, 2).map((tech, techIndex) => (
                                                    <span
                                                        key={techIndex}
                                                        className='text-[10px] font-medium text-brandGray-300 px-1.5 py-0.5 rounded-full bg-brandGray-700/70 border border-brandGray-700'
                                                    >
                                                        {tech}
                                                    </span>
                                                ))}
                                                {project.stack.length > 2 && (
                                                    <span className='text-[10px] font-medium text-brandGray-300 px-1.5 py-0.5 rounded-full bg-brandGray-700/70 border border-brandGray-700'>
                                                        +{project.stack.length - 2}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className='mt-auto'>
                                <button
                                    onClick={handleStart}
                                    className='w-full px-4 py-2 bg-brandGreen-600 hover:bg-brandGreen-500 text-white rounded-md font-medium transition-colors duration-200 will-change-transform'
                                    style={{
                                        backfaceVisibility: 'hidden',
                                        WebkitBackfaceVisibility: 'hidden',
                                        transform: 'translateZ(0)',
                                        WebkitFontSmoothing: 'antialiased',
                                        MozOsxFontSmoothing: 'grayscale'
                                    }}
                                >
                                    <span>View Projects</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        )
    }

    return (
        <section className='relative py-16 px-4 bg-gradient-to-b from-brandGreen-950/90 via-brandGreen-900/95 to-brandGreen-900 overflow-x-hidden'>
            {/* Background texture */}
            <div
                className='absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none'
                style={{
                    backgroundImage:
                        "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
                }}
            ></div>
            
            <div className='max-w-7xl mx-auto'>
                <div className='flex flex-col'>
                    {/* Projects Grid */}
                    <div className='w-full'>
                        {/* On mobile and tablet - show the active project with navigation */}
                        <div className='block lg:hidden'>
                            
                            {/* Mobile Project Card with Integrated Project Overview */}
                            <div
                                className={clsx(
                                    'transition-all duration-500',
                                    'container-type-inline-size', // Add container context for container queries
                                    transitionDirection === 'next' && 'translate-x-[-40px] opacity-0',
                                    transitionDirection === 'prev' && 'translate-x-[40px] opacity-0'
                                )}
                            >
                                <div className='overflow-hidden rounded-xl shadow-[0_0_20px_-5px_rgba(16,185,129,0.15)] bg-brandGray-800 border border-brandGray-700 transition-all duration-300'>
                                    {/* Card Header */}
                                    <div className='p-3 sm:p-4 md:p-5 border-b border-brandGray-700 bg-gradient-to-r from-brandGray-800 via-brandGray-800 to-brandBlue-900/10'>
                                        <div className='flex items-center justify-between mb-2'>
                                            <span className='text-sm font-semibold text-white px-2 py-1 rounded-md bg-gradient-to-r from-brandOrange-700 to-brandOrange-600 shadow-sm'>
                                                Project {activeProjectIndex + 1}/{PROJECTS.length}
                                            </span>
                                        </div>
                                        <h2 className='text-xl font-bold mb-1 text-transparent bg-clip-text bg-gradient-to-r from-brandGreen-300 via-brandGreen-200 to-brandGreen-300'>
                                            {PROJECTS[activeProjectIndex].title}
                                        </h2>
                                    </div>
                                    
                                    
                                    {/* Project Content */}
                                    <div className='p-3 sm:p-4 md:p-5'>
                                        {/* Project Summary and Stack */}
                                        <div className='mb-4'>
                                            <h3 className='text-base sm:text-lg font-medium text-white mb-2'>Summary</h3>
                                            <p className='text-sm text-brandGray-300 mb-3'>{PROJECTS[activeProjectIndex].summary}</p>
                                            
                                            <div className='flex flex-wrap gap-2 mt-3'>
                                                {PROJECTS[activeProjectIndex].stack.map((tech, techIndex) => (
                                                    <span
                                                        key={techIndex}
                                                        className='text-xs font-medium text-brandGray-200 px-2 py-1 rounded-full bg-brandGray-700'
                                                    >
                                                        {tech}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        
                                        {/* Project Description */}
                                        <div className='mb-4'>
                                            <h3 className='text-base sm:text-lg font-medium text-white mb-2'>Description</h3>
                                            <div className='prose prose-sm prose-invert max-w-none'>
                                                <p>{PROJECTS[activeProjectIndex].initialDescription}</p>
                                            </div>
                                        </div>
                                        
                                        {/* Project Details */}
                                        <div className='mb-4'>
                                            <h3 className='text-base sm:text-lg font-medium text-white mb-2'>Details</h3>
                                            <div className='prose prose-sm prose-invert max-w-none'>
                                                <p>{PROJECTS[activeProjectIndex].detailedDescription}</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Back Button */}
                                    <div className='p-3 sm:p-4 md:p-5 border-t border-brandGray-700/30'>
                                        <button
                                            onClick={() => setStarted(false)}
                                            className='w-full flex items-center justify-center gap-2 px-4 py-2 bg-brandGray-700 hover:bg-brandGray-600 text-white rounded-lg text-sm transition-colors duration-200'
                                        >
                                            <svg
                                                xmlns='http://www.w3.org/2000/svg'
                                                className='h-4 w-4'
                                                viewBox='0 0 20 20'
                                                fill='currentColor'
                                            >
                                                <path
                                                    fillRule='evenodd'
                                                    d='M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z'
                                                    clipRule='evenodd'
                                                />
                                            </svg>
                                            Back to Overview
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* On desktop - show overview card and all projects in a fixed-size grid */}
                        <div className='hidden lg:grid grid-cols-4 gap-6 relative'>
                            {/* Overview Card - styled like project cards */}
                            <div className='my-4 overflow-hidden rounded-xl shadow-[0_0_20px_-5px_rgba(16,185,129,0.15)] bg-brandGray-800 border border-brandGray-700 transition-all duration-300 hover:shadow-lg hover:border-brandGray-600 flex flex-col h-[700px]'>
                                <div className='p-4 border-b border-brandGray-700 bg-gradient-to-r from-brandGray-800 via-brandGray-800 to-brandBlue-900/10'>
                                    <div className='flex items-center justify-between mb-2'>
                                        <span className='text-sm font-semibold text-white px-2 py-1 rounded-md bg-gradient-to-r from-brandOrange-700 to-brandOrange-600 shadow-sm'>
                                            Overview
                                        </span>
                                    </div>
                                    <h2 className='text-xl font-bold mb-1 text-transparent bg-clip-text bg-gradient-to-r from-brandGreen-300 via-brandGreen-200 to-brandGreen-300'>
                                        My Portfolio Projects
                                    </h2>
                                </div>
                                
                                <div className='p-4 flex-1 flex flex-col'>
                                    <div className='prose prose-sm prose-invert max-w-none mb-4'>
                                        <p>
                                            Explore these key projects from my portfolio. Each demonstrates different skills and technologies.
                                        </p>
                                    </div>
                                    
                                    {/* Project boxes - evenly distributed with flex */}
                                    <div className='flex flex-col flex-1 justify-evenly overflow-y-auto pr-1 py-4 scrollbar-thin scrollbar-thumb-brandGray-700 scrollbar-track-transparent'>
                                        {PROJECTS.map((project, index) => (
                                            <div 
                                                key={index}
                                                className={clsx(
                                                    'transition-all duration-300 cursor-pointer p-4 rounded-lg border',
                                                    activeProjectIndex === index 
                                                        ? 'bg-brandGray-700 border-brandGreen-500/40 shadow-sm' 
                                                        : 'bg-brandGray-800 border-brandGray-700 hover:border-brandGray-600 hover:translate-y-[-2px]'
                                                )}
                                                onClick={() => navigateToProject(index)}
                                            >
                                                <div className='flex items-center justify-between'>
                                                    <span className='text-xs font-semibold text-brandOrange-400 px-2 py-0.5 rounded-md bg-brandOrange-900/30 border border-brandOrange-800/30'>
                                                        #{index + 1}
                                                    </span>
                                                    {activeProjectIndex === index && (
                                                        <span className='inline-block w-2 h-2 rounded-full bg-brandGreen-500'></span>
                                                    )}
                                                </div>
                                                <h4 className='font-medium text-white mt-2 text-base'>
                                                    {project.title}
                                                </h4>
                                                <div className='flex flex-wrap gap-1 mt-2'>
                                                    {project.stack.slice(0, 2).map((tech, techIndex) => (
                                                        <span
                                                            key={techIndex}
                                                            className='text-xs font-medium text-brandGray-300 px-2 py-0.5 rounded-full bg-brandGray-700/50'
                                                        >
                                                            {tech}
                                                        </span>
                                                    ))}
                                                    {project.stack.length > 2 && (
                                                        <span className='text-xs font-medium text-brandGray-300 px-2 py-0.5 rounded-full bg-brandGray-700/50'>
                                                            +{project.stack.length - 2}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <button
                                        onClick={() => setStarted(false)}
                                        className='mt-6 w-full lg:hidden flex items-center justify-center gap-2 px-4 py-2 bg-brandGray-700 hover:bg-brandGray-600 text-white rounded-lg text-sm transition-colors duration-200'
                                    >
                                        <svg
                                            xmlns='http://www.w3.org/2000/svg'
                                            className='h-4 w-4'
                                            viewBox='0 0 20 20'
                                            fill='currentColor'
                                        >
                                            <path
                                                fillRule='evenodd'
                                                d='M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z'
                                                clipRule='evenodd'
                                            />
                                        </svg>
                                        Back to Overview
                                    </button>
                                </div>
                            </div>
                            
                            {/* Project Cards */}
                            {PROJECTS.map((project, index) => (
                                <div 
                                    key={project.id}
                                    className={clsx(
                                        'container-type-inline-size transition-duration-300'
                                    )}
                                >
                                    <ProjectCard
                                        projectNumber={index + 1}
                                        title={project.title}
                                        summary={project.summary}
                                        stack={project.stack}
                                        initialDescription={project.initialDescription}
                                        detailedDescription={project.detailedDescription}
                                        technicalDetails={project.technicalDetails}
                                        challenges={project.challenges}
                                        readme={project.readme}
                                        totalProjects={PROJECTS.length}
                                        onNavigateToProject={(newIndex) => {
                                            if (newIndex === -1) {
                                                setStarted(false);
                                            } else if (newIndex >= 0) {
                                                navigateToProject(newIndex);
                                            }
                                        }}
                                        hideToc={true}
                                        isActive={activeProjectIndex === index}
                                        onClick={() => setActiveProjectIndex(index)}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* No desktop navigation buttons as per requirements */}

                        {/* Mobile/Tablet Navigation Controls */}
                        <div className='flex lg:hidden justify-between mt-6'>
                            <button
                                onClick={() =>
                                    activeProjectIndex === 0
                                        ? setStarted(false)
                                        : navigateToProject(activeProjectIndex - 1)
                                }
                                className={clsx(
                                    'px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium text-xs sm:text-sm transition-all duration-200 flex items-center gap-1',
                                    'focus:outline-none focus:ring-2 focus:ring-brandGreen-500/50',
                                    'bg-brandGray-800 text-white hover:bg-brandGray-700 active:bg-brandGray-800 active:text-white'
                                )}
                            >
                                <svg
                                    xmlns='http://www.w3.org/2000/svg'
                                    className='h-4 w-4 sm:h-5 sm:w-5'
                                    viewBox='0 0 20 20'
                                    fill='currentColor'
                                >
                                    <path
                                        fillRule='evenodd'
                                        d='M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z'
                                        clipRule='evenodd'
                                    />
                                </svg>
                                {activeProjectIndex === 0
                                    ? 'Overview'
                                    : 'Previous Project'}
                            </button>

                            <button
                                onClick={() =>
                                    navigateToProject(activeProjectIndex + 1)
                                }
                                disabled={activeProjectIndex === PROJECTS.length - 1}
                                className={clsx(
                                    'px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium text-xs sm:text-sm transition-all duration-200 flex items-center gap-1',
                                    'focus:outline-none focus:ring-2 focus:ring-brandGreen-500/50',
                                    activeProjectIndex === PROJECTS.length - 1
                                        ? 'bg-brandGray-800 text-brandGray-600 cursor-not-allowed'
                                        : 'bg-brandGray-800 text-white hover:bg-brandGray-700 active:bg-brandGray-800 active:text-white'
                                )}
                            >
                                <span>Next Project</span>
                                <svg
                                    xmlns='http://www.w3.org/2000/svg'
                                    className='h-4 w-4 sm:h-5 sm:w-5'
                                    viewBox='0 0 20 20'
                                    fill='currentColor'
                                >
                                    <path
                                        fillRule='evenodd'
                                        d='M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z'
                                        clipRule='evenodd'
                                    />
                                </svg>
                            </button>
                        </div>
                        
                        {/* Unified Project Chat - shown on all screen sizes */}
                        <div className='mt-8 lg:mt-12'>
                            <UnifiedProjectChat projectsData={PROJECTS} />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
