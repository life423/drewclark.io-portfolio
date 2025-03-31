import React, { useState, useRef, useEffect } from 'react';
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
    const [messages, setMessages] = useState([]);
    
    const chatInputRef = useRef(null);
    const chatContainerRef = useRef(null);

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

    // Auto-scroll to the bottom of the chat when new messages are added
    useEffect(() => {
        if (chatContainerRef.current && messages.length > 0) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);
    
    const handleQuestionSubmit = async e => {
        e.preventDefault();

        if (!userQuestion.trim()) return;

        // Add user question to the messages array
        setMessages(prev => [...prev, { role: 'user', content: userQuestion }]);
        
        // Store the current question before clearing the input
        const currentQuestion = userQuestion;
        
        // Clear the input field immediately for better UX
        setUserQuestion('');
        
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
                currentQuestion
            );
            
            // Add AI response to the messages array
            setMessages(prev => [...prev, { role: 'assistant', content: response }]);
        } catch (error) {
            console.error('Error generating AI response:', error);
            
            // Add error message to the messages array
            setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: "I'm sorry, I couldn't generate a response at this time. Please try again later."
            }]);
        } finally {
            setIsGenerating(false);
            
            // Force recalculation after the AI response is displayed
            setTimeout(() => {
                forceRecalculation();
            }, 100);
        }
    };

    return (
        <div className='my-4 @container overflow-hidden rounded-xl shadow-[0_0_20px_-5px_rgba(16,185,129,0.15)] bg-brandGray-800 border border-brandGray-700 transform transition-all duration-300 hover:shadow-xl hover:border-brandGray-600 flex flex-col h-[600px] @sm:h-[650px] @md:h-[670px] @lg:h-[700px]'>
            {/* Project Header */}
            <div className='p-3 @sm:p-4 @md:p-5 border-b border-brandGray-700 bg-gradient-to-r from-brandGray-800 via-brandGray-800 to-brandBlue-900/10'>
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

                <h2 className='text-xl @sm:text-2xl font-bold text-brandGreen-300 mb-1'>
                    {title}
                </h2>
                <div className='flex flex-wrap gap-1 @sm:gap-2 mt-2 @sm:mt-3'>
                    {stack.map((tech, index) => (
                        <span
                            key={index}
                            className='text-xs font-medium text-brandGray-300 px-1.5 @sm:px-2 py-0.5 @sm:py-1 rounded-full bg-brandGray-700'
                        >
                            {tech}
                        </span>
                    ))}
                </div>
            </div>

            {/* Project Content */}
            <div className='p-3 @sm:p-4 @md:p-5 flex-1 flex flex-col'>
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
            <div className='relative p-3 @sm:p-4 @md:p-5 flex-shrink-0 overflow-hidden'>
                {/* Animated divider that extends when chat opens */}
                <div className={clsx(
                    "absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-brandGreen-600/10 via-brandGreen-500 to-brandGreen-600/10 transition-all duration-500 ease-out",
                    chatVisible 
                        ? "w-full opacity-100 shadow-[0_0_8px_rgba(16,185,129,0.3)]" 
                        : "w-0 left-1/2 opacity-0"
                )}></div>
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
                        className='bg-brandGray-900 rounded-lg p-2 @sm:p-3 @md:p-4 animate-fade-in'
                        onTransitionEnd={() => forceRecalculation()}
                    >
                        <div className='flex justify-between items-center mb-3'>
                            <h3 className='text-sm font-semibold text-brandGreen-400 tracking-wide'>
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
                                    className='flex-1 px-2 @sm:px-3 py-1.5 @sm:py-2 bg-brandGray-800 border border-brandGray-700 rounded-lg text-xs @sm:text-sm text-white focus:ring-2 focus:ring-brandGreen-500/40 focus:border-brandGreen-500 outline-none transition-all duration-200'
                                    maxLength={140}
                                />
                                <button
                                    type='submit'
                                    disabled={isGenerating}
                                    className={clsx(
                                        'px-2 @sm:px-3 py-1.5 @sm:py-2 rounded-lg text-xs @sm:text-sm font-medium transition-all duration-300',
                                        'relative overflow-hidden border',
                                        isGenerating
                                            ? 'bg-brandGray-700 text-brandGray-500 border-transparent cursor-wait'
                                            : !userQuestion.trim()
                                              ? 'bg-transparent text-brandGreen-400 border-brandGreen-500/50 hover:bg-brandGreen-500/10' // Empty state: green text, green border
                                              : 'bg-gradient-to-r from-brandGreen-600 to-brandGreen-500 text-white hover:shadow-lg hover:shadow-brandGreen-500/20 border-transparent' // Filled state: gradient green
                                    )}
                                >
                                    {/* Shine effect for filled state */}
                                    {userQuestion.trim() && !isGenerating && (
                                        <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white/10 to-transparent animate-subtle-shimmer"></span>
                                    )}
                                    
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

                        {/* Message thread container */}
                        {messages.length > 0 && (
                            <div 
                                ref={chatContainerRef}
                                className='max-h-60 overflow-y-auto mb-3 pr-1'
                                style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgb(55, 65, 81) transparent' }}
                            >
                                {messages.map((msg, index) => (
                                    <div 
                                        key={index} 
                                        className={clsx(
                                            'mb-2 animate-fade-in',
                                            msg.role === 'user' 
                                                ? 'ml-4' 
                                                : 'mr-4'
                                        )}
                                    >
                                        <div className={clsx(
                                            'rounded-lg p-2 @sm:p-3 text-xs @sm:text-sm',
                                            msg.role === 'user'
                                                ? 'bg-brandGray-700 text-brandGreen-200 border-r-2 border-r-brandGreen-500' 
                                                : 'bg-brandGray-800 bg-opacity-80 border-l-2 border-l-brandOrange-500 shadow-inner shadow-brandGray-900/50 text-brandGray-200'
                                        )}>
                                            {msg.content}
                                        </div>
                                    </div>
                                ))}
                                {isGenerating && (
                                    <div className='ml-4 mb-2 animate-fade-in'>
                                        <div className='bg-brandGray-800 bg-opacity-80 rounded-lg p-2 @sm:p-3 border-l-2 border-l-brandOrange-500 shadow-inner shadow-brandGray-900/50 text-xs @sm:text-sm text-brandGray-200'>
                                            <div className="flex items-center space-x-2">
                                                <div className="w-2 h-2 rounded-full bg-brandOrange-500 animate-pulse"></div>
                                                <div className="w-2 h-2 rounded-full bg-brandOrange-500 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                                                <div className="w-2 h-2 rounded-full bg-brandOrange-500 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                )}
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
