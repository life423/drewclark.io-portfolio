import React, { useState, useRef, useEffect } from 'react'
import clsx from 'clsx'
import { answerProjectQuestion } from '../../services/aiGenerationService'
import PrimaryButton from '../utils/PrimaryButton'
import { ProjectProgressIndicator } from './progress'
import useScrollPosition from '../../hooks/useScrollPosition'

import TypedTextEffect from '../hero/TypedTextEffect'
import useIntersection from '../../hooks/useIntersection'

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
    hideToc = false, // New prop to hide the table of contents in the card
    isActive = false, // Whether this card is the active one
    onClick = null, // Click handler for the card
}) {
    const [expanded, setExpanded] = useState(true) // Always start expanded
    const [chatVisible, setChatVisible] = useState(false)
    const [userQuestion, setUserQuestion] = useState('')
    const [isGenerating, setIsGenerating] = useState(false)
    const [messages, setMessages] = useState([])
    // Track previous questions to provide context
    const [previousQuestions, setPreviousQuestions] = useState([])
    // Track when we need to auto-adjust the card height based on content
    const [autoHeight, setAutoHeight] = useState(false)
    // Track if we've initialized from localStorage
    const [chatInitialized, setChatInitialized] = useState(false)
    // Track the user's current UI state
    const [uiContext, setUiContext] = useState({
        activeSection: 'overview',
        interactionState: 'browsing',
        scrollPosition: 0,
        customContext: '',
    })

    const chatInputRef = useRef(null)
    const chatContainerRef = useRef(null)
    // Track previous project number to detect changes
    const prevProjectNumberRef = useRef(projectNumber)

    // Get scroll info from useScrollPosition
    const {
        y: scrollY,
        direction: scrollDirection,
        percent: scrollPercent,
        forceRecalculation,
    } = useScrollPosition()

    // Load chat history from localStorage on initial render
    useEffect(() => {
        if (!chatInitialized) {
            const storageKey = `project_chat_${projectNumber}`
            const savedMessages = localStorage.getItem(storageKey)

            if (savedMessages) {
                try {
                    setMessages(JSON.parse(savedMessages))
                    setChatInitialized(true)
                } catch (e) {
                    console.error('Error parsing saved chat history:', e)
                    setChatInitialized(true)
                }
            } else {
                setChatInitialized(true)
            }
        }
    }, [chatInitialized, projectNumber])

    // Save chat history to localStorage when messages change
    useEffect(() => {
        if (chatInitialized && messages.length > 0) {
            const storageKey = `project_chat_${projectNumber}`
            localStorage.setItem(storageKey, JSON.stringify(messages))
        }
    }, [messages, projectNumber, chatInitialized])

    // Update UI context when scroll position changes in the main window
    useEffect(() => {
        if (scrollPercent > 0) {
            let activeSection = 'overview'

            // Determine which section is in view based on scroll percentage
            if (scrollPercent < 30) {
                activeSection = 'project header'
            } else if (scrollPercent < 70) {
                activeSection = 'project details'
            } else {
                activeSection = 'project innovations'
            }

            setUiContext(prev => ({
                ...prev,
                scrollPosition: scrollPercent,
                activeSection,
                interactionState: `scrolling ${scrollDirection}`,
                customContext: `User is viewing the ${activeSection} section`,
            }))
        }
    }, [scrollPercent, scrollDirection])

    const toggleChat = () => {
        const newChatVisible = !chatVisible
        setChatVisible(newChatVisible)

        // Update UI context when chat visibility changes
        setUiContext(prev => ({
            ...prev,
            activeSection: newChatVisible ? 'chat' : 'overview',
            interactionState: newChatVisible ? 'asking questions' : 'browsing',
        }))

        if (newChatVisible) {
            // Focus the input when chat becomes visible
            setTimeout(() => {
                chatInputRef.current?.focus()
            }, 100)
        }

        // Force recalculation after toggling chat
        setTimeout(() => {
            forceRecalculation()
        }, 300)
    }

    // Update UI context based on scroll position
    useEffect(() => {
        const handleScroll = () => {
            if (!chatContainerRef.current) return

            const scrollTop = chatContainerRef.current.scrollTop
            const scrollHeight = chatContainerRef.current.scrollHeight
            const clientHeight = chatContainerRef.current.clientHeight
            const scrollPosition = Math.round(
                (scrollTop / (scrollHeight - clientHeight)) * 100
            )

            // Only update if there's a significant change
            if (Math.abs(scrollPosition - uiContext.scrollPosition) > 10) {
                setUiContext(prev => ({
                    ...prev,
                    scrollPosition,
                    interactionState: 'scrolling chat history',
                }))
            }
        }

        const chatContainer = chatContainerRef.current
        if (chatContainer) {
            chatContainer.addEventListener('scroll', handleScroll)
        }

        return () => {
            if (chatContainer) {
                chatContainer.removeEventListener('scroll', handleScroll)
            }
        }
    }, [chatContainerRef, uiContext.scrollPosition])

    // Auto-scroll to the bottom of the chat when new messages are added
    useEffect(() => {
        if (chatContainerRef.current && messages.length > 0) {
            chatContainerRef.current.scrollTop =
                chatContainerRef.current.scrollHeight

            // Enable auto-height after messages are added
            if (messages.length > 1) {
                setAutoHeight(true)
            }
        }
    }, [messages])

    // Measure content height and adjust card height if needed
    const cardRef = useRef(null)
    const contentRef = useRef(null)

    useEffect(() => {
        if (autoHeight && cardRef.current && contentRef.current) {
            // Get the current content height
            const contentHeight = contentRef.current.scrollHeight

            // Force layout recalculation to ensure accurate measurements
            forceRecalculation()
        }
    }, [autoHeight, messages, forceRecalculation])

    // Project transition detection effect
    useEffect(() => {
        // Skip on initial render
        if (prevProjectNumberRef.current !== projectNumber && prevProjectNumberRef.current !== undefined) {
            // This runs when projectNumber changes (navigating to a new project)
            
            // If chat is visible, add a transition message
            if (chatVisible) {
                // Clear previous questions for new context
                setPreviousQuestions([])
                
                // Add a transition message for the new project
                setMessages(prevMessages => [
                    { 
                        role: 'assistant', 
                        content: `You're now viewing ${title}. This project uses ${stack.join(', ')}. What would you like to know about it?`,
                        isTransition: true // Special flag for transition styling
                    },
                    // Keep previous messages for continuity
                    ...prevMessages
                ])
                
                // Auto-scroll to see the new message
                setTimeout(() => {
                    if (chatContainerRef.current) {
                        chatContainerRef.current.scrollTop = 0
                    }
                }, 100)
            }
            
            // Update UI context to reflect new project context
            setUiContext(prev => ({
                ...prev,
                activeSection: 'overview',
                interactionState: 'viewing new project',
                customContext: `User has navigated to project ${projectNumber}: ${title}`
            }))
        }
        
        // Update ref with current project number for next comparison
        prevProjectNumberRef.current = projectNumber
        
    }, [projectNumber, title, stack, chatVisible])

    const handleQuestionSubmit = async e => {
        e.preventDefault()

        if (!userQuestion.trim()) return

        // Add user question to the messages array
        setMessages(prev => [...prev, { role: 'user', content: userQuestion }])

        // Store the current question before clearing the input
        const currentQuestion = userQuestion

        // Update previous questions for context
        setPreviousQuestions(prev => [...prev, currentQuestion])

        // Update UI context to reflect that a question was asked
        setUiContext(prev => ({
            ...prev,
            interactionState: 'asked a question',
            customContext: `User just asked: "${currentQuestion}"`,
        }))

        // Clear the input field immediately for better UX
        setUserQuestion('')

        setIsGenerating(true)

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
                // Add UI context information
                uiContext: {
                    activeSection: uiContext.activeSection,
                    interactionState: uiContext.interactionState,
                    scrollPosition: uiContext.scrollPosition,
                    customContext: uiContext.customContext,
                    previousQuestions: previousQuestions,
                },
            }

            // Display a subtle indicator that context-aware answering is active
            setMessages(prev => {
                // Only add the indicator if it doesn't exist yet
                const hasIndicator = prev.some(
                    msg =>
                        msg.role === 'system' &&
                        msg.content.includes('context-aware')
                )

                if (!hasIndicator && prev.length > 0) {
                    return [
                        ...prev,
                        {
                            role: 'system',
                            content: 'Using context-aware answering...',
                            isIndicator: true,
                        },
                    ]
                }
                return prev
            })

            // Call the AI service to generate a response
            const response = await answerProjectQuestion(
                projectData,
                currentQuestion
            )

            // Remove the indicator before adding the actual response
            setMessages(prev => {
                const filtered = prev.filter(msg => !msg.isIndicator)
                return [...filtered, { role: 'assistant', content: response }]
            })
        } catch (error) {
            console.error('Error generating AI response:', error)

            // Add error message to the messages array
            setMessages(prev => [
                ...prev,
                {
                    role: 'assistant',
                    content:
                        "I'm sorry, I couldn't generate a response at this time. Please try again later.",
                },
            ])
        } finally {
            setIsGenerating(false)

            // Force recalculation after the AI response is displayed
            setTimeout(() => {
                forceRecalculation()
            }, 100)
        }
    }

    // Set up ref and use the intersection hook for title animation
    const headerRef = useRef(null)
    const headerInView = useIntersection(headerRef, { threshold: 0.2 })

    return (
        <div
            ref={cardRef}
            className={clsx(
                'my-4 @container overflow-hidden rounded-xl shadow-[0_0_20px_-5px_rgba(16,185,129,0.15)] bg-brandGray-800 border border-brandGray-700 transition-all duration-300 flex flex-col h-[700px]',
                isActive ? 'ring-2 ring-brandGreen-500/50 shadow-xl' : 'hover:shadow-lg hover:border-brandGray-600',
                onClick && 'cursor-pointer'
            )}
            onClick={() => onClick && onClick()}
        >
            {/* Project Header */}
            <div className='p-3 @sm:p-4 @md:p-5 border-b border-brandGray-700 bg-gradient-to-r from-brandGray-800 via-brandGray-800 to-brandBlue-900/10'>
                <div className='flex items-center justify-between mb-2'>
                    <span className='text-sm font-semibold text-white px-2 py-1 rounded-md bg-gradient-to-r from-brandOrange-700 to-brandOrange-600 shadow-sm'>
                        Project {projectNumber}
                    </span>
                    <button
                        onClick={() => onNavigateToProject?.(-1)}
                        className='group flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-brandGray-400 hover:text-brandGreen-400 transition-all duration-300'
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

                <h2
                    ref={headerRef}
                    className='text-xl @sm:text-2xl font-bold mb-1 min-h-[1.75rem] @sm:min-h-[2rem]'
                >
                    <span className='bg-clip-text text-transparent bg-gradient-to-r from-brandGreen-300 via-brandGreen-200 to-brandGreen-300'>
                        {title}
                    </span>
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
            <div
                ref={contentRef}
                className='p-3 @sm:p-4 @md:p-5 flex-1 flex flex-col overflow-y-auto'
            >
                <div
                    className={clsx(
                        'prose prose-sm prose-invert max-w-none',
                        'prose-headings:text-brandGreen-300 prose-strong:text-brandGreen-400'
                    )}
                    onTransitionEnd={() => {
                        // Force recalculation when the transition completes
                        forceRecalculation()
                        // Fallback: if onTransitionEnd fires slightly early, force again after a brief delay
                        setTimeout(() => forceRecalculation(), 200)
                    }}
                >
                    <p>{initialDescription}</p>

                    <>
                        <h3>The Challenge</h3>
                        <p>
                            This project presented numerous technical and design
                            challenges that pushed our team to innovate.
                        </p>

                        <h3>Key Innovations</h3>
                        <ul>
                            <li>
                                Implemented real-time data processing pipelines
                            </li>
                            <li>
                                Designed an intuitive interface for complex
                                information
                            </li>
                            <li>Optimized performance for mobile devices</li>
                        </ul>
                    </>
                </div>
            </div>

            {/* Interactive Chat Section Removed - Using unified chat below all projects instead */}

            {/* Footer with project progress indicator - only shown if hideToc is false */}
            {!hideToc && (
                <div className='border-t border-brandGray-700 bg-brandGray-850 py-3'>
                    <ProjectProgressIndicator
                        currentProject={projectNumber}
                        totalProjects={totalProjects}
                        onProjectClick={index =>
                            onNavigateToProject?.(index + 1)
                        }
                    />
                </div>
            )}
        </div>
    )
}
