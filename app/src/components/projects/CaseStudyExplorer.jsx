/* eslint react/jsx-uses-react: "error", react/jsx-uses-vars: "error" */
import React, { useEffect, useRef, useState } from 'react'
import UnifiedProjectChat from './UnifiedProjectChat'
import useCaseStudyDepth from '../../hooks/useCaseStudyDepth'
import { LuMessageCircle, LuX } from 'react-icons/lu'

// Keep this in sync with the case-study grid in work-studio.css.
const ROOMY_CASE = '(min-width: 900px) and (min-height: 700px)'

export default function CaseStudyExplorer({ project }) {
    const dialogRef = useRef(null)
    const launcherRef = useRef(null)
    const closeRef = useRef(null)
    const restoreLauncherRef = useRef(false)
    const openRequestRef = useRef(0)
    const anchorRef = useRef(null)
    const [isDocked, setIsDocked] = useState(false)
    useCaseStudyDepth(dialogRef, project.id)

    useEffect(() => {
        const dialog = dialogRef.current
        const roomy = window.matchMedia(ROOMY_CASE)
        let dockObserver
        let observedInset
        const observeDock = () => {
            if (!roomy.matches || !window.IntersectionObserver) {
                dockObserver?.disconnect()
                dockObserver = null
                observedInset = null
                setIsDocked(false)
                return
            }
            const inset = parseFloat(window.getComputedStyle(dialog).top) || 0
            if (dockObserver && observedInset === inset) return
            dockObserver?.disconnect()
            observedInset = inset
            dockObserver = new window.IntersectionObserver(([entry]) => {
                // A sentinel below the viewport is also non-intersecting. Only
                // dock after its original position passes the reading inset.
                setIsDocked(entry.boundingClientRect.top <= inset)
            }, { rootMargin: `-${inset}px 0px 0px 0px`, threshold: 0 })
            dockObserver.observe(anchorRef.current)
        }
        const matchLayout = () => {
            openRequestRef.current++
            const focusedElement = document.activeElement
            const focusWasInside = dialog.contains(focusedElement)
            restoreLauncherRef.current = false

            if (roomy.matches) {
                if (dialog.matches(':modal')) dialog.close()
                // A sidebar is ordinary page content. Setting open avoids the
                // focus-taking steps of show(), including on passive resize.
                dialog.open = true
                if (focusWasInside) {
                    // The drawer's Close control disappears in sidebar mode.
                    // Keep keyboard focus on a visible Explorer control.
                    const target = focusedElement.getClientRects().length ? focusedElement : dialog.querySelector('.case-build-collapse')
                    target?.focus({ preventScroll: true })
                }
            } else {
                if (dialog.open) dialog.close()
                // Keep focus usable when its panel becomes hidden, without
                // moving it away from someone who is reading the article.
                if (focusWasInside) launcherRef.current?.focus({ preventScroll: true })
            }
            observeDock()
        }
        // The hero reserves the expanded navbar height. This companion follows
        // the actual navbar, including its compact state and enlarged text.
        const navbar = document.querySelector('nav')
        const updateNavInset = () => {
            if (navbar) dialog.style.setProperty('--case-nav-height', `${navbar.getBoundingClientRect().height}px`)
            observeDock()
        }
        const navObserver = navbar && new window.ResizeObserver(updateNavInset)
        navObserver?.observe(navbar)
        updateNavInset()
        matchLayout()
        roomy.addEventListener('change', matchLayout)
        window.addEventListener('resize', observeDock)
        return () => {
            openRequestRef.current++
            dockObserver?.disconnect()
            navObserver?.disconnect()
            roomy.removeEventListener('change', matchLayout)
            window.removeEventListener('resize', observeDock)
        }
    }, [])

    const openDrawer = async () => {
        const dialog = dialogRef.current
        const request = ++openRequestRef.current
        const requestedProject = String(project.id)
        restoreLauncherRef.current = false
        // The project companion has its own context; opening it dismisses the
        // global navigation rather than stacking two different drawers.
        const handoff = { settled: Promise.resolve() }
        window.dispatchEvent(new window.CustomEvent('portfolio:explore-build', { detail: handoff }))
        await handoff.settled
        if (request !== openRequestRef.current || !dialog.isConnected || dialog.dataset.projectId !== requestedProject
            || window.matchMedia(ROOMY_CASE).matches) return
        if (!dialog.open) dialog.showModal()
        closeRef.current?.focus({ preventScroll: true })
    }

    const closeDrawer = () => {
        openRequestRef.current++
        restoreLauncherRef.current = true
        dialogRef.current?.close()
    }

    return (
        <aside aria-label='Ask about this case study' className='work-studio-rail'>
            <span ref={anchorRef} className='case-chat-anchor' aria-hidden='true' />
            <button
                ref={launcherRef}
                type='button'
                aria-haspopup='dialog'
                aria-controls='case-study-explorer'
                onClick={openDrawer}
                className='case-chat-launcher inline-flex items-center gap-2 rounded-full border border-brandGreen-700 bg-brandGray-900 px-4 text-sm font-semibold text-brandGreen-200 shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brandGreen-300'
            >
                <LuMessageCircle className='h-4 w-4 text-brandOrange-400' aria-hidden='true' />
                Open project chat
            </button>
            <dialog id='case-study-explorer' ref={dialogRef} className='case-chat-dialog' aria-label='Build explorer' data-project-id={project.id} data-docked={isDocked ? 'true' : undefined}
                onCancel={() => { restoreLauncherRef.current = true }}
                onClose={() => {
                    const restoreLauncher = restoreLauncherRef.current
                    restoreLauncherRef.current = false
                    if (restoreLauncher && !dialogRef.current?.open) launcherRef.current?.focus({ preventScroll: true })
                }}>
                <span className='case-chat-depth' aria-hidden='true'><span className='case-chat-depth-wash' /></span>
                <button
                    ref={closeRef}
                    type='button'
                    className='case-chat-close'
                    aria-label='Close build explorer'
                    onClick={closeDrawer}
                >
                    <LuX className='h-5 w-5' aria-hidden='true' />
                </button>
                <UnifiedProjectChat project={project} embedded collapseBelow={0} caseStudy />
            </dialog>
        </aside>
    )
}
