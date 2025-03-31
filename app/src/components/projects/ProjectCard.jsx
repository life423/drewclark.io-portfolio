import React, { useState, useRef } from 'react';
import clsx from 'clsx';
import { answerProjectQuestion } from '../../services/aiGenerationService';
import PrimaryButton from '../utils/PrimaryButton';
import { ProjectProgressIndicator } from './progress';
import useScrollPosition from '../../hooks/useScrollPosition';

export default function ProjectCard({
    projectNumber,
    title,
    summary,
    stack,
    initialDescription,
    detailedDescription,
    technicalDetails,
    challenges,
    readme,
    onAskQuestion,
    onNavigateToProject,
    totalProjects = 3,
}) {
    const [expanded, setExpanded] = useState(true); // Always start expanded
    const [chatVisible, setChatVisible] = useState(false);
    const [userQuestion, setUserQuestion] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiResponse, setAiResponse] = useState('');

    const chatInputRef = useRef(null);

    // Get the forceRecalculation function from useScrollPosition
    const { forceRecalculation } = useScrollPosition();
    
    const toggleChat = () => {
        setChatVisible(!chatVisible);
        if (!chatVisible) {
            // Focus the input when chat becomes visible
            setTimeout(() => {
                chatInputRef.current?.focus();
            }, 100);
        }
        
        // Force recalculation after toggling chat
        setTimeout(() => {
            forceRecalculation();
        }, 300);
    };

    const handleQuestionSubmit = async e => {
        e.preventDefault();

        if (!userQuestion.trim()) return;

        setIsGenerating(true);

        try {
            // Create a comprehensive project data object with all available context
            const projectData = {
                id: `project-${projectNumber}`,
                title,
                summary,
                stack,
                initialDescription,
                detailedDescription,
                technicalDetails,
                challenges,
                readme,
            };

            // Call the AI service to generate a response
            const response = await answerProjectQuestion(
                projectData,
                userQuestion
            );
            setAiResponse(response);
        } catch (error) {
            console.error('Error generating AI response:', error);
            setAiResponse(
                "I'm sorry, I couldn't generate a response at this time. Please try again later."
            );
        } finally {
            setIsGenerating(false);
            
            // Force recalculation after the AI response is displayed
            setTimeout(() => {
                forceRecalculation();
            }, 100);
        }
    };

    return (
        <div className='my-4 sm:my-6 md:my-8 overflow-hidden rounded-xl shadow-[0_0_20px_-5px_rgba(16,185,129,0.15)] bg-brandGray-800 border border-brandGray-700 transform transition-all duration-300 hover:shadow-xl hover:border-brandGray-600 flex flex-col h-[600px] sm:h-[650px] md:h-[670px] lg:h-[700px]'>
            {/* Project Header */}
            <div className='p-3 sm:p-4 md:p-5 border-b border-brandGray-700 bg-gradient-to-r from-brandGray-800 via-brandGray-800 to-brandBlue-900/10'>
                <div className='flex items-center justify-between mb-2'>
                    <span className='text-sm font-semibold text-white px-2 py-1 rounded-md bg-gradient-to-r from-brandOrange-700 to-brandOrange-600 shadow-sm'>
                        Project {projectNumber}
                    </span>
                    <button
                        onClick={() => onNavigateToProject?.(-1)}
                        className="group flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-brandGray-400 hover:text-brandGreen-400 transition-all duration-300"
                    >
                        <svg
                            xmlns='http://www.w3.org/2000/svg'
                            className='h-4 w-4'
                            viewBox='0 0 20 20'
                            fill='currentColor'
                        >
                            <path
                                fillRule='evenodd'
                                d='M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L9.414 11H13a1 1 0 100-2H9.414l1.293-1.293z'
                                clipRule='evenodd'
                            />
                        </svg>
                        <span>Overview</span>
                    </button>
                </div>

                <h2 className='text-xl sm:text-2xl font-bold text-brandGreen-300 mb-1'>
                    {title}
                </h2>
                <div className='flex flex-wrap gap-1 sm:gap-2 mt-2 sm:mt-3'>
                    {stack.map((tech, index) => (
                        <span
                            key={index}
                            className='text-xs font-medium text-brandGray-300 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full bg-brandGray-700'
                        >
                            {tech}
                        </span>
                    ))}
                </div>
            </div>

            {/* Project Content */}
            <div className='p-3 sm:p-4 md:p-5 flex-1 flex flex-col'>
                <div
                    className={clsx(
                        'prose prose-sm prose-invert max-w-none',
                        'prose-headings:text-brandGreen-300 prose-strong:text-brandGreen-400',
                        'transition-all duration-500 ease-in-out'
                    )}
                    onTransitionEnd={() => {
                        // Force recalculation when the transition completes
                        forceRecalculation();
                        // Fallback: if onTransitionEnd fires slightly early, force again after a brief delay
                        setTimeout(() => forceRecalculation(), 200);
                    }}
                >
                    <p>{initialDescription}</p>

                    <>
                        <h3>The Challenge</h3>
                        <p>
                            This project presented numerous technical and
                            design challenges that pushed our team to
                            innovate.
                        </p>

                        <h3>Key Innovations</h3>
                        <ul>
                            <li>
                                Implemented real-time data processing
                                pipelines
                            </li>
                            <li>
                                Designed an intuitive interface for complex
                                information
                            </li>
                            <li>
                                Optimized performance for mobile devices
                            </li>
                        </ul>
                    </>
                </div>
            </div>

            {/* Interactive Chat Section */}
            <div className='border-t border-brandGray-700 p-3 sm:p-4 md:p-5 flex-shrink-0'>
                {!chatVisible ? (
                    <PrimaryButton
                        onClick={toggleChat}
                        fullWidth={true}
                        size='sm'
                    >
                        {/* Corner highlight */}
                        <div className='absolute top-0 right-0 w-[20px] h-[20px] opacity-0 animate-corner-highlight'>
                            <div className='absolute top-0 right-0 w-[2px] h-[6px] bg-brandOrange-500/70 rounded-sm'></div>
                            <div className='absolute top-0 right-0 w-[6px] h-[2px] bg-brandOrange-500/70 rounded-sm'></div>
                        </div>
                        Ask About This Project
                    </PrimaryButton>
                ) : (
                    <div 
                        className='bg-brandGray-900 rounded-lg p-2 sm:p-3 md:p-4 animate-fade-in'
                        onTransitionEnd={() => forceRecalculation()}
                    >
                        <div className='flex justify-between items-center mb-3'>
                            <h3 className='text-sm font-medium text-brandGreen-300'>
                                Ask About This Project
                            </h3>
                            <button
                                onClick={toggleChat}
                                className='text-brandGray-400 hover:text-brandGreen-400'
                            >
                                <svg
                                    xmlns='http://www.w3.org/2000/svg'
                                    className='h-5 w-5'
                                    viewBox='0 0 20 20'
                                    fill='currentColor'
                                >
                                    <path
                                        fillRule='evenodd'
                                        d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
                                        clipRule='evenodd'
                                    />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleQuestionSubmit} className='mb-3'>
                            <div className='flex gap-2'>
                                <input
                                    ref={chatInputRef}
                                    type='text'
                                    value={userQuestion}
                                    onChange={e => setUserQuestion(e.target.value)}
                                    placeholder='E.g., How did you handle state management?'
                                    className='flex-1 px-2 sm:px-3 py-1.5 sm:py-2 bg-brandGray-800 border border-brandGray-700 rounded-lg text-xs sm:text-sm text-white focus:ring-1 focus:ring-brandGreen-400 focus:border-brandGreen-400 outline-none'
                                    maxLength={140}
                                />
                                <button
                                    type='submit'
                                    disabled={isGenerating}
                                    className={clsx(
                                        'px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200',
                                        'border', // Always have a border for consistent sizing
                                        isGenerating
                                            ? 'bg-brandGray-700 text-brandGray-500 border-transparent cursor-wait'
                                            : !userQuestion.trim()
                                              ? 'bg-brandGray-800 text-brandGreen-500 border-brandGreen-500' // Empty state: green text, green border
                                              : 'bg-brandGreen-500 text-white hover:bg-brandGreen-400 border-transparent' // Filled state: green bg, white text
                                    )}
                                >
                                    {isGenerating ? (
                                        <svg
                                            className='animate-spin h-5 w-5 text-white'
                                            xmlns='http://www.w3.org/2000/svg'
                                            fill='none'
                                            viewBox='0 0 24 24'
                                        >
                                            <circle
                                                className='opacity-25'
                                                cx='12'
                                                cy='12'
                                                r='10'
                                                stroke='currentColor'
                                                strokeWidth='4'
                                            ></circle>
                                            <path
                                                className='opacity-75'
                                                fill='currentColor'
                                                d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                                            ></path>
                                        </svg>
                                    ) : (
                                        'Ask'
                                    )}
                                </button>
                            </div>
                        </form>

                        {aiResponse && (
                            <div className='bg-brandGray-800 rounded-lg p-2 sm:p-3 border-l-2 border-brandOrange-500 animate-fade-in text-xs sm:text-sm text-brandGray-200'>
                                {aiResponse}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Footer with project progress indicator */}
            <div className='border-t border-brandGray-700 bg-brandGray-850 py-3'>
                <ProjectProgressIndicator
                    currentProject={projectNumber}
                    totalProjects={totalProjects}
                    onProjectClick={(index) => onNavigateToProject?.(index + 1)}
                />
            </div>
        </div>
    );
}
