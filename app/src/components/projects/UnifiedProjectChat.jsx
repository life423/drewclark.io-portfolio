import React, { useState, useRef, useEffect } from 'react'
import clsx from 'clsx'
import { answerMultiProjectQuestion } from '../../services/aiGenerationService'
import { config } from '../../config'
import { brandGreen, brandOrange, brandGray } from '../../styles/colors'

// Log environment for debugging deployment issues
console.log('UnifiedProjectChat loaded with environment:', config.environment)

/**
 * UnifiedProjectChat - A component that allows users to ask questions about any project
 * in a single chat interface.
 *
 * Features:
 * - Always visible chat interface
 * - Fixed height scrollable chat area with collapse/expand functionality
 * - localStorage persistence for chat history with clear option
 * - Message timestamps and improved styling
 * - Support for asking about any project in one conversation
 */
export default function UnifiedProjectChat({ projectsData }) {
    const [userQuestion, setUserQuestion] = useState('')
    const [isGenerating, setIsGenerating] = useState(false)
    const [messages, setMessages] = useState([])
    // Track if we've initialized from localStorage
    const [chatInitialized, setChatInitialized] = useState(false)
    // Track if the chat is minimized/collapsed - default based on screen size
    const [isCollapsed, setIsCollapsed] = useState(() => window.innerWidth < 1024)
    // Track if user has manually toggled the chat state
    const [userHasInteracted, setUserHasInteracted] = useState(false)
    // Track if clear confirmation is showing
    const [showClearConfirm, setShowClearConfirm] = useState(false)

    const chatInputRef = useRef(null)
    const chatContainerRef = useRef(null)
    
    // Check for questions coming from the drawer - using interval for reliability
    useEffect(() => {
        const checkDrawerQuestion = () => {
            const drawerQuestion = sessionStorage.getItem('drawer_question')
            const timestamp = sessionStorage.getItem('drawer_question_timestamp')
            
            if (drawerQuestion && timestamp) {
                // Only process if timestamp is recent (within last 5 seconds)
                const now = Date.now()
                const questionTime = parseInt(timestamp, 10)
                
                if (now - questionTime < 5000) {
                    console.log('Processing drawer question:', drawerQuestion)
                    
                    // Clear from session storage
                    sessionStorage.removeItem('drawer_question')
                    sessionStorage.removeItem('drawer_question_timestamp')
                    
                    // Set the question and expand the chat
                    setUserQuestion(drawerQuestion)
                    setIsCollapsed(false)
                    setUserHasInteracted(true)
                    
                    // Submit the question after a short delay to allow UI to update
                    setTimeout(() => {
                        if (chatInputRef.current && chatInputRef.current.form) {
                            const submitEvent = new Event('submit', { cancelable: true, bubbles: true })
                            chatInputRef.current.form.dispatchEvent(submitEvent)
                        }
                    }, 300)
                }
            }
        }
        
        // Initial check on mount
        checkDrawerQuestion()
        
        // Set up interval to check periodically
        const intervalId = setInterval(checkDrawerQuestion, 1000)
        
        return () => {
            clearInterval(intervalId)
        }
    }, [])
    
    // Update collapse state on resize if user hasn't interacted
    useEffect(() => {
        const handleResize = () => {
            if (!userHasInteracted) {
                setIsCollapsed(window.innerWidth < 1024);
            }
        };
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [userHasInteracted]);

    // Load chat history from localStorage on initial render
    useEffect(() => {
        if (!chatInitialized) {
            const storageKey = 'unified_project_chat'
            const savedMessages = localStorage.getItem(storageKey)

            if (savedMessages) {
                try {
                    setMessages(JSON.parse(savedMessages))
                    setChatInitialized(true)
                } catch (e) {
                    console.error(
                        'Error parsing saved unified chat history:',
                        e
                    )
                    setChatInitialized(true)
                }
            } else {
                setChatInitialized(true)
            }
        }
    }, [chatInitialized])

    // Save chat history to localStorage when messages change
    useEffect(() => {
        if (chatInitialized && messages.length > 0) {
            const storageKey = 'unified_project_chat'
            localStorage.setItem(storageKey, JSON.stringify(messages))
        }
    }, [messages, chatInitialized])

    // Toggle chat collapse state
    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed)
        setUserHasInteracted(true) // Mark that user has manually toggled the state
    }

    // Function to clear chat history
    const clearChatHistory = () => {
        // Remove from localStorage
        localStorage.removeItem('unified_project_chat')
        // Clear messages state
        setMessages([])
        // Reset confirmation
        setShowClearConfirm(false)
        // Focus the input after clearing
        setTimeout(() => {
            chatInputRef.current?.focus()
        }, 100)
    }

    // Advanced scroll management for chat
    // Keep track of the last message count to detect new messages
    const prevMessageCountRef = useRef(0);
    
    // Improved scrolling behavior to ensure user sees the beginning of new messages
    useEffect(() => {
        if (chatContainerRef.current && messages.length > 0) {
            const container = chatContainerRef.current;
            
            // Check if a new message was added
            if (messages.length > prevMessageCountRef.current) {
                const newMessageIndex = messages.length - 1;
                const newMessage = messages[newMessageIndex];
                
                // Find the new message element
                const messageElements = container.querySelectorAll('.message-item');
                if (messageElements.length > 0) {
                    const newMessageElement = messageElements[newMessageIndex];
                    
                    // For assistant messages (long responses), scroll to show the beginning
                    if (newMessage.role === 'assistant') {
                        // Scroll to the top of the new message with a small offset for context
                        if (newMessageElement) {
                            newMessageElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                    } else {
                        // For user messages, scroll to bottom as before
                        container.scrollTop = container.scrollHeight;
                    }
                } else {
                    // Fallback behavior if we can't find message elements
                    container.scrollTop = container.scrollHeight;
                }
            }
            
            // Update the reference for next check
            prevMessageCountRef.current = messages.length;
        }
    }, [messages])

    const handleQuestionSubmit = async e => {
        e.preventDefault()

        if (!userQuestion.trim()) return
        
        // Ensure chat is expanded when user submits a question
        setIsCollapsed(false)
        setUserHasInteracted(true)

        // Add user question to the messages array
        setMessages(prev => [...prev, { role: 'user', content: userQuestion }])

        // Store the current question before clearing the input
        const currentQuestion = userQuestion

        // Clear the input field immediately for better UX
        setUserQuestion('')

        setIsGenerating(true)

        try {
            // Display a subtle indicator that context-aware answering is active
            setMessages(prev => {
                // Only add the indicator if it doesn't exist yet
                const hasIndicator = prev.some(
                    msg =>
                        msg.role === 'system' &&
                        msg.content.includes('thinking')
                )

                if (!hasIndicator && prev.length > 0) {
                    return [
                        ...prev,
                        {
                            role: 'system',
                            content: 'Thinking about all projects...',
                            isIndicator: true,
                        },
                    ]
                }
                return prev
            })

            // Call the AI service to generate a response about multiple projects
            const response = await answerMultiProjectQuestion(
                projectsData,
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
        }
    }

    // Helper function to format timestamps
    const formatTimestamp = (timestamp = Date.now()) => {
        const date = new Date(timestamp)
        const today = new Date()
        const isToday = date.toDateString() === today.toDateString()

        const timeOptions = { hour: 'numeric', minute: 'numeric' }
        const time = date.toLocaleTimeString(undefined, timeOptions)

        if (isToday) {
            return `Today, ${time}`
        } else {
            const dateOptions = { month: 'short', day: 'numeric' }
            return `${date.toLocaleDateString(undefined, dateOptions)}, ${time}`
        }
    }

    return (
        <div className='mt-8 w-full'>
            <div
                className={clsx(
                    'bg-brandGray-900 rounded-lg shadow-lg border border-brandGray-700 transition-all duration-300',
                    isCollapsed ? 'p-3' : 'p-4'
                )}
                style={{
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transform: 'translateZ(0)',
                }}
            >
                {/* Make header clickable to toggle collapse */}
                <div 
                    className='flex justify-between items-center mb-4 cursor-pointer'
                    onClick={() => {
                        toggleCollapse();
                    }}
                >
                    <h3 className='text-lg font-semibold text-brandGreen-400 tracking-wide flex items-center'>
                        <svg
                            xmlns='http://www.w3.org/2000/svg'
                            className='h-5 w-5 mr-2 text-brandGreen-500'
                            viewBox='0 0 20 20'
                            fill='currentColor'
                        >
                            <path d='M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z' />
                            <path d='M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z' />
                        </svg>
                        Project Chat
                    </h3>
                    <div className='flex items-center space-x-2'>
                        {/* Clear button */}
                        {messages.length > 0 && !showClearConfirm && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevent toggling collapse
                                    setShowClearConfirm(true);
                                }}
                                className='text-brandGray-400 hover:text-brandOrange-400 transition-colors duration-200'
                                aria-label='Clear chat history'
                                title='Clear chat history'
                            >
                                <svg
                                    xmlns='http://www.w3.org/2000/svg'
                                    className='h-4 w-4'
                                    viewBox='0 0 20 20'
                                    fill='currentColor'
                                >
                                    <path
                                        fillRule='evenodd'
                                        d='M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z'
                                        clipRule='evenodd'
                                    />
                                </svg>
                            </button>
                        )}

                        {/* Confirmation buttons */}
                        {showClearConfirm && (
                            <div className='flex items-center space-x-1 text-xs bg-brandGray-800 p-1 rounded-md'>
                                <span className='text-brandGray-300'>
                                    Clear?
                                </span>
                                <button
                                    onClick={clearChatHistory}
                                    className='text-brandGreen-400 hover:text-brandGreen-300 px-1.5 py-0.5 rounded'
                                >
                                    Yes
                                </button>
                                <button
                                    onClick={() => setShowClearConfirm(false)}
                                    className='text-brandOrange-400 hover:text-brandOrange-300 px-1.5 py-0.5 rounded'
                                >
                                    No
                                </button>
                            </div>
                        )}

                        {/* Collapse/Expand button - prevent event propagation to parent click handler */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleCollapse();
                            }}
                            className='text-brandGray-400 hover:text-brandGreen-400 transition-colors duration-200'
                            aria-label={
                                isCollapsed ? 'Expand chat' : 'Collapse chat'
                            }
                            title={
                                isCollapsed ? 'Expand chat' : 'Collapse chat'
                            }
                        >
                            <svg
                                xmlns='http://www.w3.org/2000/svg'
                                className={clsx(
                                    'h-5 w-5 transition-transform duration-300',
                                    isCollapsed ? 'transform rotate-180' : ''
                                )}
                                viewBox='0 0 20 20'
                                fill='currentColor'
                            >
                                <path
                                    fillRule='evenodd'
                                    d='M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z'
                                    clipRule='evenodd'
                                />
                            </svg>
                        </button>
                    </div>
                </div>

                {!isCollapsed && (
                    <>
                        {/* Fixed height scrollable message area */}
                        {messages.length > 0 ? (
                            <div
                                ref={chatContainerRef}
                                className='h-[300px] overflow-y-auto mb-4 pr-2 scrollbar-thin scrollbar-thumb-brandGray-700 scrollbar-track-transparent'
                            >
                                {messages.map((msg, index) => {
                                    // Add timestamp if not already present
                                    const msgWithTime = msg.timestamp
                                        ? msg
                                        : {
                                              ...msg,
                                              timestamp:
                                                  Date.now() -
                                                  (messages.length - index) *
                                                      60000,
                                          }

                                    return (
                                        <div
                                            key={index}
                                            className={clsx(
                                                'mb-4 animate-fade-in',
                                                msg.role === 'system'
                                                    ? 'mx-auto text-center'
                                                    : 'w-full flex',
                                                msg.role === 'user'
                                                    ? 'justify-end'
                                                    : msg.role === 'assistant'
                                                    ? 'justify-start'
                                                    : ''
                                            )}
                                        >
                                            {msg.role === 'system' ? (
                                                <div className='text-xs text-brandGray-400 italic px-2 py-1 bg-brandGray-800/50 rounded-md inline-block'>
                                                    {msg.content}
                                                </div>
                                            ) : (
                                                <div className='max-w-[85%]'>
                                                    <div className='flex items-center mb-1'>
                                                        {/* User or AI indicator */}
                                                        {msg.role === 'user' ? (
                                                            <div className='flex items-center ml-auto'>
                                                                <span className='text-xs text-brandGray-400 mr-1.5'>
                                                                    {formatTimestamp(
                                                                        msgWithTime.timestamp
                                                                    )}
                                                                </span>
                                                                <span className='text-xs font-medium text-brandGreen-400'>
                                                                    You
                                                                </span>
                                                                <div className='w-1.5 h-1.5 ml-1 rounded-full bg-brandGreen-500'></div>
                                                            </div>
                                                        ) : (
                                                            <div className='flex items-center'>
                                                                <div className='w-1.5 h-1.5 mr-1 rounded-full bg-brandOrange-500'></div>
                                                                <span className='text-xs font-medium text-brandOrange-400 mr-1.5'>
                                                                    Assistant
                                                                </span>
                                                                <span className='text-xs text-brandGray-400'>
                                                                    {formatTimestamp(
                                                                        msgWithTime.timestamp
                                                                    )}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div
                                                        className={clsx(
                                                            'rounded-lg p-3 text-sm shadow-sm message-item',
                                                            msg.role === 'user'
                                                                ? 'bg-brandGray-700/80 text-brandGreen-200 border-r-2 border-r-brandGreen-500 rounded-tr-none'
                                                                : 'bg-brandGray-800/80 text-brandGray-200 border-l-2 border-l-brandOrange-500 rounded-tl-none'
                                                        )}
                                                    >
                                                        {msg.content}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                                {isGenerating && (
                                    <div className='ml-4 mb-3 animate-fade-in'>
                                        <div className='bg-brandGray-800 bg-opacity-80 rounded-lg p-3 border-l-2 border-l-brandOrange-500 shadow-inner shadow-brandGray-900/50 text-sm text-brandGray-200'>
                                            <div className='flex items-center space-x-2'>
                                                <div className='w-2 h-2 rounded-full bg-brandOrange-500 animate-pulse'></div>
                                                <div
                                                    className='w-2 h-2 rounded-full bg-brandOrange-500 animate-pulse'
                                                    style={{
                                                        animationDelay: '0.2s',
                                                    }}
                                                ></div>
                                                <div
                                                    className='w-2 h-2 rounded-full bg-brandOrange-500 animate-pulse'
                                                    style={{
                                                        animationDelay: '0.4s',
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className='text-center py-8 px-6 bg-brandGray-850 rounded-lg mb-4'>
                                <svg
                                    xmlns='http://www.w3.org/2000/svg'
                                    className='h-10 w-10 mx-auto mb-3 text-brandGreen-500/70'
                                    fill='none'
                                    viewBox='0 0 24 24'
                                    stroke='currentColor'
                                >
                                    <path
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        strokeWidth={1.5}
                                        d='M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z'
                                    />
                                </svg>
                                <p className='text-brandGray-400 mb-1'>
                                    Ask me anything about the projects
                                </p>
                                <p className='text-xs text-brandGray-500'>
                                    You can ask about specific projects or
                                    compare them
                                </p>
                            </div>
                        )}
                    </>
                )}

                <form onSubmit={handleQuestionSubmit} className='mb-1'>
                    <div className='flex gap-2'>
                        <input
                            ref={chatInputRef}
                            type='text'
                            value={userQuestion}
                            onChange={e => setUserQuestion(e.target.value)}
                            placeholder="Ask about any project (e.g., 'Compare the technologies in projects 1 and 3')"
                            className='flex-1 px-3 py-2 bg-brandGray-800 border border-brandGray-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-brandGreen-500/40 focus:border-brandGreen-500 outline-none transition-all duration-200'
                            style={{
                                backfaceVisibility: 'hidden',
                                WebkitBackfaceVisibility: 'hidden',
                                transform: 'translateZ(0)',
                            }}
                        />
                        <button
                            type='submit'
                            disabled={isGenerating}
                            className={clsx(
                                'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300',
                                'relative overflow-hidden border',
                                isGenerating
                                    ? 'bg-brandGray-700 text-brandGray-500 border-transparent cursor-wait'
                                    : !userQuestion.trim()
                                    ? 'bg-transparent text-brandGreen-400 border-brandGreen-500/50 hover:bg-brandGreen-500/10'
                                    : 'bg-gradient-to-r from-brandGreen-600 to-brandGreen-500 text-white hover:shadow-lg hover:shadow-brandGreen-500/20 border-transparent'
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
                <div className='text-xs text-brandGray-500 text-center'>
                    Ask anything about Project 1, 2, or 3 — or compare them
                </div>
            </div>
        </div>
    )
}
