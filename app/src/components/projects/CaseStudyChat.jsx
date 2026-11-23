/* eslint react/jsx-uses-react: "error", react/jsx-uses-vars: "error" */
import React, { useEffect, useRef } from 'react'
import { LuArrowUp, LuArrowUpRight, LuChevronDown, LuChevronUp, LuCodeXml, LuLoaderCircle } from 'react-icons/lu'
import './case-study-chat.css'

const PROJECT_QUESTIONS = {
    1: ['How does training run on the GPU?', 'How do Godot and CUDA work together?', 'How are the GPU results checked?'],
    2: ['How does it identify a cipher?', 'How does frequency analysis help?', 'How does file encryption work?'],
    3: ['How does multiplayer stay in sync?', 'What makes movement feel responsive?', 'Do bots follow the same rules?'],
    4: ['How does the whiteboard stay in sync?', 'How does a student join a lesson?', 'How do the video calls connect?'],
}

// A case-study presentation of the shared chat state and transport. The overview
// keeps its existing layout; switching between rail and drawer keeps this mounted.
export default function CaseStudyChat({
    project, scope, messages, question, onQuestionChange, onAsk, onSubmit,
    isGenerating, isCollapsed, onToggleCollapse, inputRef, transcriptRef,
    showClearConfirm, onRequestClear, onClear, onCancelClear, onToggleScope,
    globalQuestions, limit, Sources,
}) {
    const focusConversation = useRef(false)
    const clearButtonRef = useRef(null)
    const confirmClearRef = useRef(null)
    const restoreClearFocus = useRef(false)
    const isGlobal = scope === 'all'
    const scopeName = isGlobal ? 'All portfolio projects' : project.title
    const questions = isGlobal ? globalQuestions : PROJECT_QUESTIONS[project.id] || []

    useEffect(() => {
        if (!focusConversation.current || !messages.length) return
        focusConversation.current = false
        transcriptRef.current?.focus({ preventScroll: true })
    }, [messages.length, transcriptRef])

    useEffect(() => {
        if (showClearConfirm) confirmClearRef.current?.focus({ preventScroll: true })
        else if (restoreClearFocus.current) {
            restoreClearFocus.current = false
            clearButtonRef.current?.focus({ preventScroll: true })
        }
    }, [showClearConfirm])

    return (
        <div id='project-chat' className='case-build-explorer' data-project-scope={scope}>
            <header className='case-build-header'>
                <span className='case-build-mark' aria-hidden='true'><LuCodeXml /></span>
                <div className='case-build-identity'>
                    <h3>Explore the build</h3>
                    <p className='case-build-project'>{scopeName}</p>
                </div>
                <button type='button' className='case-build-collapse'
                    onClick={onToggleCollapse} aria-expanded={!isCollapsed} aria-controls='project-chat-content'
                    aria-label={isCollapsed ? 'Expand explorer' : 'Collapse explorer'}>
                    {isCollapsed ? <LuChevronDown aria-hidden='true' /> : <LuChevronUp aria-hidden='true' />}
                </button>
            </header>

            <div id='project-chat-content' hidden={isCollapsed}>
                {!messages.length && (
                    <>
                        <p className='case-build-invitation'>Follow your curiosity.</p>
                        <p id='project-chat-description' className='case-build-description'>Ask how it works. Explore the code behind the project.</p>
                        <div className='case-build-prompts' aria-label='Questions about this build'>
                            {questions.map(starter => (
                                <button type='button' key={starter} disabled={isGenerating} onClick={event => {
                                    focusConversation.current = event.detail === 0
                                    onAsk(starter)
                                }}>
                                    <span>{starter}</span><LuArrowUpRight aria-hidden='true' />
                                </button>
                            ))}
                        </div>
                    </>
                )}

                {messages.length > 0 && (
                    <>
                        <p id='project-chat-description' className='sr-only'>Ask about this build. Answers include links to relevant code when available.</p>
                        <div ref={transcriptRef} tabIndex={-1} role='log' aria-label={'Conversation about ' + scopeName}
                            aria-live='polite' aria-relevant='additions' aria-busy={isGenerating} className='case-build-transcript'>
                            {messages.map((message, index) => (
                                <div key={index} className={'message-item case-build-message case-build-message--' + message.role}>
                                    {message.role !== 'system' && <p className='case-build-speaker'>{message.role === 'user' ? 'You' : 'Answer'}</p>}
                                    <p className='case-build-message-copy'>{message.content}</p>
                                    {message.role === 'assistant' && (
                                        <>
                                            <div className='case-build-sources'><Sources sources={message.sources} /></div>
                                            {message.noCode && <p className='case-build-no-code'>No matching code excerpts were returned for this answer.</p>}
                                        </>
                                    )}
                                </div>
                            ))}
                            {isGenerating && <p role='status' className='case-build-pending'><LuLoaderCircle aria-hidden='true' />Looking into the build…</p>}
                        </div>
                    </>
                )}

                <form onSubmit={onSubmit} className='case-build-composer'>
                    <textarea ref={inputRef} rows={3} maxLength={limit} value={question} required
                        onChange={event => onQuestionChange(event.target.value)}
                        aria-label='Question for Project Chat' aria-describedby='project-chat-description project-chat-limit'
                        placeholder={messages.length ? 'Ask a follow-up…' : 'Ask about this build…'} />
                    <div className='case-build-send-row'>
                        <span id='project-chat-limit' className='sr-only'>{limit} characters maximum. Enter starts a new line. Use Ask to send.</span>
                        <button type='submit' className='case-build-send' disabled={isGenerating}
                            aria-label={isGenerating ? 'Generating answer' : 'Ask'}>
                            {isGenerating ? <LuLoaderCircle aria-hidden='true' /> : <LuArrowUp aria-hidden='true' />}
                        </button>
                    </div>
                </form>
                <p className='case-build-source-note'>Source links appear when matching code is found.</p>

                <div className='case-build-tools'>
                    <button type='button' className='case-build-scope' onClick={onToggleScope}>{isGlobal ? 'Return to this project' : 'Ask across projects'}</button>
                    {messages.length > 0 && !showClearConfirm && (
                        <button ref={clearButtonRef} type='button' onClick={onRequestClear} aria-label='Clear chat history'>Clear conversation</button>
                    )}
                </div>
                {showClearConfirm && (
                    <div className='case-build-clear' role='group' aria-label='Clear this conversation?'>
                        <span>Clear this conversation?</span>
                        <button ref={confirmClearRef} type='button' onClick={onClear}>Yes</button>
                        <button type='button' onClick={() => { restoreClearFocus.current = true; onCancelClear() }}>No</button>
                    </div>
                )}
            </div>
        </div>
    )
}
