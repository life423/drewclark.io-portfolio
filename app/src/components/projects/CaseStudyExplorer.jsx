/* eslint react/jsx-uses-react: "error", react/jsx-uses-vars: "error" */
import React, { useEffect, useRef } from 'react'
import UnifiedProjectChat from './UnifiedProjectChat'

// Keep this in sync with the case-study grid in work-studio.css.
const ROOMY_CASE = '(min-width: 900px) and (min-height: 700px)'

export default function CaseStudyExplorer({ project }) {
    const dialogRef = useRef(null)
    const launcherRef = useRef(null)
    const closeRef = useRef(null)
    const restoreLauncherRef = useRef(false)

    useEffect(() => {
        const dialog = dialogRef.current
        const roomy = window.matchMedia(ROOMY_CASE)
        const matchLayout = () => {
            const focusedElement = document.activeElement
            const focusWasInside = dialog.contains(focusedElement)
            restoreLauncherRef.current = false

            if (roomy.matches) {
                if (dialog.matches(':modal')) dialog.close()
                // A sidebar is ordinary page content. Setting open avoids the
                // focus-taking steps of show(), including on passive resize.
                dialog.open = true
                if (focusWasInside) focusedElement.focus({ preventScroll: true })
            } else {
                if (dialog.open) dialog.close()
                // Keep focus usable when its panel becomes hidden, without
                // moving it away from someone who is reading the article.
                if (focusWasInside) launcherRef.current?.focus({ preventScroll: true })
            }
        }
        matchLayout()
        roomy.addEventListener('change', matchLayout)
        return () => roomy.removeEventListener('change', matchLayout)
    }, [])

    const openDrawer = () => {
        const dialog = dialogRef.current
        restoreLauncherRef.current = false
        if (!dialog.open) dialog.showModal()
        closeRef.current?.focus({ preventScroll: true })
    }

    const closeDrawer = () => {
        restoreLauncherRef.current = true
        dialogRef.current?.close()
    }

    return (
        <aside aria-label='Ask about this case study' className='work-studio-rail'>
            <button
                ref={launcherRef}
                type='button'
                aria-haspopup='dialog'
                aria-controls='case-study-explorer'
                onClick={openDrawer}
                className='case-chat-launcher rounded-full border border-brandGreen-700 bg-brandGray-900 px-4 text-sm font-semibold text-brandGreen-200 shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brandGreen-300'
            >
                Ask about the code
            </button>
            <dialog id='case-study-explorer' ref={dialogRef} className='case-chat-dialog' aria-label='Case study Code Explorer'
                onCancel={() => { restoreLauncherRef.current = true }}
                onClose={() => {
                    const restoreLauncher = restoreLauncherRef.current
                    restoreLauncherRef.current = false
                    if (restoreLauncher && !dialogRef.current?.open) launcherRef.current?.focus({ preventScroll: true })
                }}>
                <button
                    ref={closeRef}
                    type='button'
                    className='case-chat-close rounded-lg px-3 text-sm font-semibold text-brandGreen-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brandGreen-300'
                    onClick={closeDrawer}
                >
                    Close Code Explorer
                </button>
                <UnifiedProjectChat project={project} embedded collapseBelow={0} />
            </dialog>
        </aside>
    )
}
