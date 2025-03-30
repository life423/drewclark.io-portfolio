import React, { useState, useEffect } from 'react'
import ProjectCard from './ProjectCard'
import clsx from 'clsx'
import PrimaryButton from '../utils/PrimaryButton'


const PROJECTS = [
    {
        id: 1,
        title: 'Real-Time Analytics Dashboard',
        summary:
            'A modern dashboard for monitoring user engagement and system performance.',
        stack: ['React', 'Node.js', 'WebSockets', 'D3.js'],
        initialDescription:
            'This project began as a challenge: how to visualize thousands of data points in real-time without sacrificing performance. I architected a solution using WebSockets for data streaming and custom D3.js visualizations that could handle high-frequency updates.',
        detailedDescription:
            'The Real-Time Analytics Dashboard provides businesses with immediate insights into user behavior and system health. The dashboard updates in real-time as events occur, allowing instant decision-making based on current data rather than historical reports.',
        technicalDetails:
            'The frontend uses React with custom D3.js visualizations. Data flows through WebSocket connections to minimize latency, with a Node.js backend handling data aggregation and stream management. We implemented efficient data structures to handle thousands of events per second while maintaining 60fps rendering performance.',
        challenges:
            'One key challenge was handling disconnections and reconnections gracefully while ensuring no data loss. We developed a local buffer system that temporarily stores events during connection issues and synchs with the server upon reconnection. Another challenge was optimizing the rendering pipeline to handle frequent updates without causing browser performance issues.',
        readme:
            'This dashboard monitors key performance indicators in real-time with millisecond latency. It includes customizable widgets for different metrics, alerts for anomaly detection, and historical comparison views. Users can filter data by various dimensions including time ranges, user segments, and event types.'
    },
    {
        id: 2,
        title: 'AI-Powered Content Generator',
        summary:
            'A tool that uses machine learning to generate marketing content tailored to different audiences.',
        stack: ['Python', 'TensorFlow', 'FastAPI', 'React'],
        initialDescription:
            'As lead developer on this project, I implemented a natural language processing pipeline that could analyze existing content and generate new variations optimized for different target demographics. The system learned from user feedback to continuously improve output quality.',
        detailedDescription:
            'The AI-Powered Content Generator is a sophisticated tool that creates marketing copy, product descriptions, and social media posts tailored to specific audience segments. It analyzes successful content patterns and applies these insights to generate new content that resonates with particular demographics.',
        technicalDetails:
            'The system uses a fine-tuned language model based on TensorFlow with custom transfer learning layers to adapt to specific marketing domains. The Python backend handles the NLP pipeline and model serving, while a React frontend provides an intuitive interface for content requests and feedback collection. We use FastAPI to create a high-performance API layer between the frontend and ML components.',
        challenges:
            'The biggest challenge was creating content that truly felt personalized to different audience segments. We solved this by developing a multi-layered approach that considers demographic data, engagement history, and linguistic preferences. We also implemented a feedback loop system that allows the model to continuously improve based on user ratings and engagement metrics.',
        readme:
            'This tool generates customized marketing content for different audience segments based on demographic data and engagement patterns. Features include tone adjustment (professional, casual, persuasive), length control, keyword incorporation, and A/B test generation. Users can save favorite outputs, track performance metrics, and train the system on their own content corpus.'
    },
    {
        id: 3,
        title: 'Cross-Platform Mobile App',
        summary:
            'A feature-rich mobile application that works seamlessly across iOS and Android.',
        stack: ['React Native', 'Firebase', 'Redux', 'GraphQL'],
        initialDescription:
            'Developing a cross-platform app that maintains native performance while sharing the majority of code was our primary objective. I designed a modular architecture that allowed platform-specific optimizations where needed while maintaining a consistent user experience.',
        detailedDescription:
            'This mobile application delivers a premium user experience across both iOS and Android platforms while maintaining a single codebase for most functionality. The app includes offline capabilities, push notifications, and integrated authentication systems.',
        technicalDetails:
            'Built with React Native for cross-platform compatibility with platform-specific modules where necessary for optimal performance. State management is handled through Redux with persistent storage. The backend uses Firebase for real-time database functionality, authentication, and cloud functions. We implemented GraphQL to optimize data fetching and minimize bandwidth usage on mobile networks.',
        challenges:
            'The primary challenge was achieving native-quality performance across different devices with varying capabilities. We developed a dynamic resource loading system that adapts to device specifications. Another challenge was ensuring consistent animations and transitions across platforms - we created a custom animation library that automatically adjusts timing and easing based on the platform to maintain a consistent feel.',
        readme:
            'This cross-platform mobile app provides a seamless experience across iOS and Android devices. Features include user authentication, offline data synchronization, push notifications, in-app messaging, media sharing, and location services. The app automatically adapts to different screen sizes and orientations and complies with accessibility standards on both platforms.'
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
            <section className='relative py-16 px-4 bg-gradient-to-b from-brandGreen-950/90 via-brandGreen-900/95 to-brandGreen-900'>
                {}
                <div
                    className='absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none'
                    style={{
                        backgroundImage:
                            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
                    }}
                ></div>
                <div className='max-w-3xl mx-auto'>
                <div className='my-4 sm:my-6 md:my-8 overflow-hidden rounded-xl shadow-[0_0_20px_-5px_rgba(16,185,129,0.15)] bg-brandGray-800 border border-brandGray-700 transform transition-all duration-300 hover:shadow-xl hover:border-brandGray-600 flex flex-col h-[600px] sm:h-[650px] md:h-[670px] lg:h-[700px]'>
                        {}
                        <div className='p-3 sm:p-4 md:p-5 border-b border-brandGray-700 bg-gradient-to-r from-brandGray-800 via-brandGray-800 to-brandBlue-900/10'>
                            <div className='flex items-center justify-between mb-2'>
                                <span className='text-sm font-semibold text-white px-2 py-1 rounded-md bg-gradient-to-r from-neonOrange-700 to-neonOrange-600 shadow-sm'>
                                    Overview
                                </span>
                            </div>

                            <h1 className='text-xl sm:text-2xl font-bold text-brandGreen-300 mb-1'>
                                My Portfolio Projects
                            </h1>
                        </div>

                        <div className='p-3 sm:p-4 md:p-5 flex-1 flex flex-col'>
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

                            {}
                            <div className='space-y-1 sm:space-y-2 mb-4 sm:mb-6 md:mb-8 text-xs sm:text-sm'>
                                <h3 className='text-brandGray-400 uppercase text-xs tracking-wider mb-2 md:mb-3'>
                                    Coming Up
                                </h3>
                                {PROJECTS.map((project, index) => (
                                    <div
                                        key={index}
                                        className='flex items-center text-brandGray-300 hover:text-brandGreen-400 transition-colors duration-200'
                                    >
                                        <span className='text-neonOrange-500 font-semibold mr-2'>
                                            Project {index + 1}:
                                        </span>
                                        <span>{project.title}</span>
                                    </div>
                                ))}
                            </div>

                            <div className='mt-auto'>
                                <PrimaryButton
                                    onClick={handleStart}
                                    size='md'
                                    className='relative'
                                    fullWidth={true}
                                >
                                    <span>View Projects</span>
                                </PrimaryButton>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        )
    }

    return (
        <section className='relative py-16 px-4 bg-gradient-to-b from-brandGreen-950/90 via-brandGreen-900/95 to-brandGreen-900'>
            {}
            <div
                className='absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none'
                style={{
                    backgroundImage:
                        "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
                }}
            ></div>
            <div className='max-w-3xl mx-auto'>
                <div
                    className={clsx(
                        'transition-all duration-500',
                        transitionDirection === 'next' &&
                            'translate-x-[-100px] opacity-0',
                        transitionDirection === 'prev' &&
                            'translate-x-[100px] opacity-0'
                    )}
                >
                    <ProjectCard
                        projectNumber={activeProjectIndex + 1}
                        title={PROJECTS[activeProjectIndex].title}
                        summary={PROJECTS[activeProjectIndex].summary}
                        stack={PROJECTS[activeProjectIndex].stack}
                        initialDescription={
                            PROJECTS[activeProjectIndex].initialDescription
                        }
                        detailedDescription={
                            PROJECTS[activeProjectIndex].detailedDescription
                        }
                        technicalDetails={
                            PROJECTS[activeProjectIndex].technicalDetails
                        }
                        challenges={
                            PROJECTS[activeProjectIndex].challenges
                        }
                        readme={
                            PROJECTS[activeProjectIndex].readme
                        }
                        totalProjects={PROJECTS.length}
                        onNavigateToProject={index => {
                            if (index === -1) {
                                setStarted(false)
                            } else {
                                navigateToProject(index)
                            }
                        }}
                    />
                </div>

                <div className='flex justify-between mt-3 sm:mt-4'>
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
            </div>
        </section>
    )
}
