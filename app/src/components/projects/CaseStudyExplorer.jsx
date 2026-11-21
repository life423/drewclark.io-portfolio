/* eslint react/jsx-uses-react: "error", react/jsx-uses-vars: "error" */
import React, { useEffect, useRef } from 'react'
import UnifiedProjectChat from './UnifiedProjectChat'

const ROOMY_CASE = '(min-width: 1100px) and (min-height: 850px)'

export default function CaseStudyExplorer({ project }) {
    const dialogRef = useRef(null)
    const launcherRef = useRef(null)
    const closeRef = useRef(null)

    useEffect(() => {
        const dialog = dialogRef.current
        const roomy = window.matchMedia(ROOMY_CASE)
        const matchLayout = () => {
            if (dialog.open) dialog.close()
            if (roomy.matches) dialog.show()
        }
        matchLayout()
        roomy.addEventListener('change', matchLayout)
        return () => roomy.removeEventListener('change', matchLayout)
    }, [])

    const openDrawer = () => {
        const dialog = dialogRef.current
        if (!dialog.open) dialog.showModal()
        closeRef.current?.focus({ preventScroll: true })
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
                onClose={() => {
                    if (!dialogRef.current?.open) launcherRef.current?.focus({ preventScroll: true })
                }}>
                <button
                    ref={closeRef}
                    type='button'
                    className='case-chat-close rounded-lg px-3 text-sm font-semibold text-brandGreen-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brandGreen-300'
                    onClick={() => dialogRef.current?.close()}
                >
                    Close Code Explorer
                </button>
                <UnifiedProjectChat project={project} embedded collapseBelow={0} />
            </dialog>
        </aside>
    )
}
