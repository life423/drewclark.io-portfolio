/* eslint react/jsx-uses-react: "error", react/jsx-uses-vars: "error" */
/* global AbortController */
import React, { useState, useRef, useEffect, useMemo } from 'react'
import clsx from 'clsx'
import { askProjectsChat } from '../../services/chatService'

// First questions for someone evaluating the work. Each is answered from the code.
// Keep this in sync with the request limit in api/config.js.
const MAX_QUESTION_CHARS = 500
const STARTER_QUESTIONS = [
    'How does CudaRL-Arena train agents directly on the GPU?',
    'How does multiplayer work in Ascend-Avoid?',
    'How does the Cryptography Toolkit figure out which cipher was used?',
    'How does this chat find the code it cites?',
]

// Links to the code an answer drew on: one per file, best match first
function AnswerSources({ sources }) {
    const seen = new Set()
    const links = (Array.isArray(sources) ? sources : []).filter(source => {
        const key = `${source?.project}|${source?.file}`
        const isGitHubLink = typeof source?.url === 'string' && source.url.startsWith('https://github.com/')
        if (!isGitHubLink || !source.file || seen.has(key)) return false
        seen.add(key)
        return true
    })
    if (links.length === 0) return null

    return (
        <div className='mt-2 flex flex-wrap items-center gap-1.5 text-xs'>
            <span className='text-brandBlue-200'>Relevant code</span>
            {links.map(source => (
                <a
                    key={`${source.project}|${source.file}`}
                    href={source.url}
                    target='_blank'
                    rel='noopener noreferrer'
                    title={`${source.project}: ${source.file}, lines ${source.lines}`}
                    className='font-mono px-2 py-0.5 rounded-full bg-brandGray-800 border border-brandGray-700 text-brandGreen-300 hover:text-brandGreen-200 hover:border-brandGreen-600 transition-colors'
                >
                    {source.file.split('/').pop()}
                </a>
            ))}
        </div>
    )
}

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
export default function UnifiedProjectChat({ project, embedded = false }) {
    const [allProjects, setAllProjects] = useState(false)
    const scope = !allProjects ? project?.id ?? 'all' : 'all'
    const [pendingScopes, setPendingScopes] = useState([])
    const isGenerating = pendingScopes.includes(scope)
    const activeRequests = useRef(new Map())
    const askQuestionRef = useRef(null)
    const [drafts, setDrafts] = useState({})
    const userQuestion = drafts[scope] ?? ''
    const setUserQuestion = question => setDrafts(previous => ({ ...previous, [scope]: question }))

    const [messages, setMessages] = useState([])
    const visibleMessages = useMemo(() => messages.filter(message => (message.projectId ?? 'all') === scope), [messages, scope])
    const starterQuestions = scope === 'all' ? STARTER_QUESTIONS : [
        project.repo?.includes('CudaRL') ? STARTER_QUESTIONS[0] :
            project.repo?.includes('ascend-avoid') ? STARTER_QUESTIONS[1] :
            project.repo?.includes('cipher') ? STARTER_QUESTIONS[2] :
            'How does this project keep the shared whiteboard in sync?'
    ]
    // Track if we've initialized from localStorage
    const [chatInitialized, setChatInitialized] = useState(false)
    // Track if the chat is minimized/collapsed - default based on screen size
    const [isCollapsed, setIsCollapsed] = useState(() => window.innerWidth < 1100)
    // Track if user has manually toggled the chat state
    const [userHasInteracted, setUserHasInteracted] = useState(false)
    // Track if clear confirmation is showing
    const [clearScope, setClearScope] = useState(null)
    const showClearConfirm = clearScope === scope

    const chatInputRef = useRef(null)
    const chatContainerRef = useRef(null)
    
    useEffect(() => {
        const requests = activeRequests.current
        return () => {
            requests.forEach(controller => controller.abort())
            requests.clear()
        }
    }, [])

    // Check for questions coming from the drawer - using interval for reliability
    useEffect(() => {
        if (!chatInitialized) return
        const checkDrawerQuestion = () => {
            const drawerQuestion = sessionStorage.getItem('drawer_question')
            const timestamp = sessionStorage.getItem('drawer_question_timestamp')
            
            if (drawerQuestion && timestamp) {
                // Only process if timestamp is recent (within last 5 seconds)
                const now = Date.now()
                const questionTime = parseInt(timestamp, 10)
                
                if (now - questionTime < 5000) {
                    // Drawer prompts are global, even when a case study is open.
                    sessionStorage.removeItem('drawer_question')
                    sessionStorage.removeItem('drawer_question_timestamp')
                    setAllProjects(true)
                    askQuestionRef.current?.(drawerQuestion, 'all')
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
    }, [chatInitialized])
    
    // Update collapse state on resize if user hasn't interacted
    useEffect(() => {
        const handleResize = () => {
            if (!userHasInteracted) {
                setIsCollapsed(window.innerWidth < 1100);
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
                    const stored = JSON.parse(savedMessages); setMessages(Array.isArray(stored) ? stored : [])
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
        if (chatInitialized) {
            const storageKey = 'unified_project_chat'
            if (messages.length) localStorage.setItem(storageKey, JSON.stringify(messages)); else localStorage.removeItem(storageKey)
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

        activeRequests.current.get(scope)?.abort()
        activeRequests.current.delete(scope)
        setPendingScopes(previous => previous.filter(item => item !== scope))
        // Clear messages only in this scope.
        setMessages(previous => previous.filter(message => (message.projectId ?? 'all') !== scope))
        // Reset confirmation
        setClearScope(null)
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
        if (chatContainerRef.current && visibleMessages.length > 0) {
            const container = chatContainerRef.current;
            
            // Check if a new message was added
            if (visibleMessages.length > prevMessageCountRef.current) {
                const newMessageIndex = visibleMessages.length - 1;
                const newMessage = visibleMessages[newMessageIndex];
                
                // Find the new message element
                const messageElements = container.querySelectorAll('.message-item');
                if (messageElements.length > 0) {
                    const newMessageElement = messageElements[newMessageIndex];
                    
                    // For assistant messages (long responses), scroll to show the beginning
                    if (newMessage.role === 'assistant') {
                        // Scroll to the top of the new message with a small offset for context
                        if (newMessageElement) {
                            const top = newMessageElement.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop;
                            container.scrollTo({ top, behavior: 'smooth' });
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
            prevMessageCountRef.current = visibleMessages.length;
        }
    }, [visibleMessages])

    const askQuestion = async (question, requestedScope = scope) => {
        const trimmed = question.trim()
        if (!trimmed || trimmed.length > MAX_QUESTION_CHARS || activeRequests.current.has(requestedScope)) return

        const projectId = requestedScope === 'all' ? undefined : requestedScope
        const controller = new AbortController()
        activeRequests.current.set(requestedScope, controller)
        setPendingScopes(previous => [...previous, requestedScope])
        setIsCollapsed(false)
        setUserHasInteracted(true)
        setDrafts(previous => ({ ...previous, [requestedScope]: '' }))
        setMessages(previous => [...previous, { role: 'user', content: trimmed, projectId, timestamp: Date.now() }])

        try {
            const { answer, sources, noCode } = await askProjectsChat(trimmed, projectId, controller.signal)
            if (!controller.signal.aborted) {
                setMessages(previous => [...previous, { role: 'assistant', content: answer, sources, noCode,
                    projectId, timestamp: Date.now() }])
            }
        } finally {
            if (activeRequests.current.get(requestedScope) === controller) {
                activeRequests.current.delete(requestedScope)
                setPendingScopes(previous => previous.filter(item => item !== requestedScope))
            }
        }
    }

    useEffect(() => { askQuestionRef.current = askQuestion })

    const handleQuestionSubmit = e => {
        e.preventDefault()
        askQuestion(userQuestion)
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
        <div id='project-chat' className={clsx('w-full scroll-mt-20', embedded ? 'code-studio' : 'mt-8')}>
            <div
                className={clsx(
                    'code-studio-surface rounded-2xl',
                    isCollapsed ? 'p-3 sm:px-4' : 'p-4 lg:p-5'
                )}
                style={{
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transform: 'translateZ(0)',
                }}
            >
                {/* Make header clickable to toggle collapse */}
                <div 
                    className='flex justify-between items-center gap-2 mb-3 cursor-pointer'
                    onClick={() => {
                        toggleCollapse();
                    }}
                >
                    <h3 className='flex min-w-0 items-center text-xl font-semibold leading-tight tracking-tight text-brandGreen-200 sm:text-2xl'>
                        <svg
                            xmlns='http://www.w3.org/2000/svg'
                            className='mr-2 h-5 w-5 shrink-0 text-brandOrange-500' aria-hidden='true'
                            viewBox='0 0 20 20'
                            fill='currentColor'
                        >
                            <path d='M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z' />
                            <path d='M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z' />
                        </svg>
                        Project Code Explorer
                    </h3>
                    <div className='flex items-center space-x-2'>
                        {/* Clear button */}
                        {visibleMessages.length > 0 && !showClearConfirm && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevent toggling collapse
                                    setClearScope(scope);
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
                                    onClick={() => setClearScope(null)}
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
                            aria-expanded={!isCollapsed}
                            aria-controls='project-chat-content'
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

                {isCollapsed && (
                    <p className='text-sm leading-5 text-brandGray-300'>Ask about the code and find the source.</p>
                )}
                <div id='project-chat-content' hidden={isCollapsed}>
                <p id='project-chat-description' className='mb-3 max-w-[52ch] text-sm leading-relaxed text-brandGray-200'>
                    Trace how a feature works. This searches the actual GitHub code and links to exact files and lines when it finds a match.
                </p>
                {project && (
                    <div className='mb-2 flex flex-wrap items-center gap-2'>
                        <label htmlFor='project-chat-scope' className='text-xs font-medium text-brandGray-300'>Chat scope</label>
                        <select
                            id='project-chat-scope'
                            value={allProjects ? 'all' : 'project'}
                            onChange={event => { setAllProjects(event.target.value === 'all'); setClearScope(null) }}
                            className='min-h-11 min-w-0 max-w-full rounded-md border border-brandGray-600 bg-brandGray-800 px-2 text-sm text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-brandGreen-300'
                        >
                            <option value='project'>{project.title}</option>
                            <option value='all'>All projects</option>
                        </select>
                    </div>
                )}
                <form onSubmit={handleQuestionSubmit} className='mb-1'>
                    <textarea
                        ref={chatInputRef}
                        rows={3}
                        maxLength={MAX_QUESTION_CHARS}
                        value={userQuestion}
                        onChange={event => setUserQuestion(event.target.value)}
                        aria-label='Question for Project Chat'
                        aria-describedby='project-chat-description project-chat-limit'
                        placeholder='Ask a detailed question about the code'
                        className='block min-h-24 max-h-48 w-full resize-y rounded-lg border border-brandGray-700 bg-brandGray-800 px-3 py-2.5 text-sm leading-relaxed text-white outline-none focus:ring-2 focus:ring-brandGreen-500/50'
                    />
                    <div className='mt-2 flex flex-wrap items-center justify-between gap-2'>
                        <span id='project-chat-limit' className='text-xs tabular-nums text-brandGray-300'>
                            {userQuestion.length} / {MAX_QUESTION_CHARS} characters
                        </span>
                        <button
                            type='submit'
                            disabled={isGenerating}
                            aria-label={isGenerating ? 'Generating answer' : 'Ask'}
                            className={clsx(
                                'ml-auto min-h-11 px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-200 motion-reduce:transition-none',
                                'relative overflow-hidden border',
                                isGenerating
                                    ? 'bg-brandGray-700 text-brandGray-500 border-transparent cursor-wait'
                                    : 'border-transparent bg-brandGreen-400 text-brandGray-900 shadow-sm shadow-brandGreen-500/20 hover:bg-brandGreen-300 active:bg-brandGreen-500'
                            )}
                        >
                            {isGenerating ? (
                                <svg
                                    className='animate-spin h-5 w-5 text-white motion-reduce:animate-none' aria-hidden='true'
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

                {!isCollapsed && (
                    <>
                        {/* Fixed height scrollable message area */}
                        {visibleMessages.length > 0 ? (
                            <div
                                ref={chatContainerRef}
                                className='code-studio-transcript overflow-y-auto mt-3 mb-3 pr-2 scrollbar-thin scrollbar-thumb-brandGray-700 scrollbar-track-transparent'
                            >
                                {visibleMessages.map((msg, index) => {
                                    // Add timestamp if not already present
                                    const msgWithTime = msg.timestamp
                                        ? msg
                                        : {
                                              ...msg,
                                              timestamp:
                                                  Date.now() -
                                                  (visibleMessages.length - index) *
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
                                                            'rounded-lg p-3 text-sm shadow-sm message-item whitespace-pre-line',
                                                            msg.role === 'user'
                                                                ? 'bg-brandGray-700/80 text-brandGreen-200 border-r-2 border-r-brandGreen-500 rounded-tr-none'
                                                                : 'bg-brandGray-800/80 text-brandGray-200 border-l-2 border-l-brandOrange-500 rounded-tl-none'
                                                        )}
                                                    >
                                                        {msg.content}
                                                    </div>
                                                    {msg.role === 'assistant' && (
                                                        <>
                                                            <AnswerSources sources={msg.sources} />
                                                            {msg.noCode && <p className='mt-2 text-xs text-brandGray-300'>No matching code excerpts were returned for this answer.</p>}
                                                        </>
                                                    )}
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
                            <div className='mt-4 border-t border-brandBlue-300/20 pt-3'>
                                <p className='mb-2 text-xs font-semibold uppercase tracking-wider text-brandOrange-300'>
                                    Ask me a question
                                </p>
                                <div className='flex flex-wrap gap-2'>
                                    {starterQuestions.map(question => (
                                        <button
                                            key={question}
                                            type='button'
                                            onClick={() => askQuestion(question)}
                                            disabled={isGenerating}
                                            className='min-h-9 max-w-full rounded-md px-2.5 py-1.5 text-left text-xs leading-snug border border-brandGreen-600/40 text-brandGreen-300 hover:bg-brandGreen-500/10 hover:border-brandGreen-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brandGreen-300 transition-colors disabled:opacity-50'
                                        >
                                            {question}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}


                </div>
            </div>
        </div>
    )
}
