import React, { useState, useRef, useEffect } from 'react'
import clsx from 'clsx'
import PrimaryButton from '../utils/PrimaryButton'
import { answerMultiProjectQuestion } from '../../services/aiGenerationService'

/**
 * UnifiedProjectChat - A component that allows users to ask questions about any project
 * in a single chat interface.
 * 
 * Features:
 * - Fixed height scrollable chat area
 * - localStorage persistence for chat history
 * - Support for asking about any project in one conversation
 */
export default function UnifiedProjectChat({ projectsData }) {
    const [chatVisible, setChatVisible] = useState(false)
    const [userQuestion, setUserQuestion] = useState('')
    const [isGenerating, setIsGenerating] = useState(false)
    const [messages, setMessages] = useState([])
    // Track if we've initialized from localStorage
    const [chatInitialized, setChatInitialized] = useState(false)

    const chatInputRef = useRef(null)
    const chatContainerRef = useRef(null)

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
                    console.error('Error parsing saved unified chat history:', e)
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

    const toggleChat = () => {
        const newChatVisible = !chatVisible
        setChatVisible(newChatVisible)

        if (newChatVisible) {
            // Focus the input when chat becomes visible
            setTimeout(() => {
                chatInputRef.current?.focus()
            }, 100)
        }
    }

    // Auto-scroll to the bottom of the chat when new messages are added
    useEffect(() => {
        if (chatContainerRef.current && messages.length > 0) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
        }
    }, [messages])

    const handleQuestionSubmit = async e => {
        e.preventDefault()

        if (!userQuestion.trim()) return

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

    return (
        <div className="mt-8 w-full">
            {!chatVisible ? (
                <PrimaryButton onClick={toggleChat} fullWidth={true} size="md">
                    Ask Me About Any Project
                </PrimaryButton>
            ) : (
                <div 
                    className="bg-brandGray-900 rounded-lg p-4 shadow-lg border border-brandGray-700 animate-fade-in"
                    style={{
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                        transform: 'translateZ(0)',
                    }}
                >
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-brandGreen-400 tracking-wide">
                            Project Chat Assistant
                        </h3>
                        <button
                            onClick={toggleChat}
                            className="text-brandGray-400 hover:text-brandGreen-400"
                            aria-label="Close chat"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </button>
                    </div>
                    
                    {/* Fixed height scrollable message area */}
                    {messages.length > 0 ? (
                        <div 
                            ref={chatContainerRef}
                            className="h-[300px] overflow-y-auto mb-4 pr-2 scrollbar-thin scrollbar-thumb-brandGray-700 scrollbar-track-transparent"
                        >
                            {messages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={clsx(
                                        'mb-3 animate-fade-in',
                                        msg.role === 'user'
                                            ? 'ml-4'
                                            : msg.role === 'system'
                                            ? 'mx-auto text-center'
                                            : 'mr-4'
                                    )}
                                >
                                    {msg.role === 'system' ? (
                                        <div className="text-xs text-brandGray-400 italic px-2 py-1 bg-brandGray-800/50 rounded-md inline-block">
                                            {msg.content}
                                        </div>
                                    ) : (
                                        <div
                                            className={clsx(
                                                'rounded-lg p-3 text-sm',
                                                msg.role === 'user'
                                                    ? 'bg-brandGray-700 text-brandGreen-200 border-r-2 border-r-brandGreen-500'
                                                    : 'bg-brandGray-800 bg-opacity-80 border-l-2 border-l-brandOrange-500 shadow-inner shadow-brandGray-900/50 text-brandGray-200'
                                            )}
                                        >
                                            {msg.content}
                                        </div>
                                    )}
                                </div>
                            ))}
                            {isGenerating && (
                                <div className="ml-4 mb-3 animate-fade-in">
                                    <div className="bg-brandGray-800 bg-opacity-80 rounded-lg p-3 border-l-2 border-l-brandOrange-500 shadow-inner shadow-brandGray-900/50 text-sm text-brandGray-200">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-2 h-2 rounded-full bg-brandOrange-500 animate-pulse"></div>
                                            <div
                                                className="w-2 h-2 rounded-full bg-brandOrange-500 animate-pulse"
                                                style={{
                                                    animationDelay: '0.2s',
                                                }}
                                            ></div>
                                            <div
                                                className="w-2 h-2 rounded-full bg-brandOrange-500 animate-pulse"
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
                        <div className="text-center py-8 px-6 bg-brandGray-850 rounded-lg mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto mb-3 text-brandGreen-500/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                            <p className="text-brandGray-400 mb-1">Ask me anything about the projects</p>
                            <p className="text-xs text-brandGray-500">You can ask about specific projects or compare them</p>
                        </div>
                    )}
                    
                    <form onSubmit={handleQuestionSubmit} className="mb-1">
                        <div className="flex gap-2">
                            <input
                                ref={chatInputRef}
                                type="text"
                                value={userQuestion}
                                onChange={e => setUserQuestion(e.target.value)}
                                placeholder="Ask about any project (e.g., 'Compare the technologies in projects 1 and 3')"
                                className="flex-1 px-3 py-2 bg-brandGray-800 border border-brandGray-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-brandGreen-500/40 focus:border-brandGreen-500 outline-none transition-all duration-200"
                                style={{
                                    backfaceVisibility: 'hidden',
                                    WebkitBackfaceVisibility: 'hidden',
                                    transform: 'translateZ(0)',
                                }}
                            />
                            <button
                                type="submit"
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
                                        className="animate-spin h-5 w-5 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                ) : (
                                    'Ask'
                                )}
                            </button>
                        </div>
                    </form>
                    <div className="text-xs text-brandGray-500 text-center">
                        Ask anything about Project 1, 2, or 3 — or compare them
                    </div>
                </div>
            )}
        </div>
    )
}
