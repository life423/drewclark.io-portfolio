import { useEffect } from 'react'

// Shared with useScrollPosition, which pauses its tracking while the page is frozen
export const scrollLockState = {
    isLocked: false
}

// One count for every lock (the drawer and both contact forms), so locks can
// overlap and release in any order: the page unfreezes when the last one lets go.
// Separate locks that each saved and restored the body's styles could put back
// another lock's frozen state, leaving the page stuck until a reload.
let lockCount = 0
let savedScrollY = 0
let savedStyle = null

function lock() {
    lockCount += 1
    if (lockCount > 1) return

    const { style } = document.body
    savedScrollY = window.scrollY
    savedStyle = {
        overflow: style.overflow,
        position: style.position,
        top: style.top,
        width: style.width
    }

    // position: fixed is what stops scrolling on iOS Safari; overflow: hidden alone doesn't
    style.overflow = 'hidden'
    style.position = 'fixed'
    style.top = `-${savedScrollY}px`
    style.width = '100%'
    scrollLockState.isLocked = true
}

function unlock() {
    if (lockCount === 0) return
    lockCount -= 1
    if (lockCount > 0) return

    Object.assign(document.body.style, savedStyle)
    savedStyle = null
    scrollLockState.isLocked = false
    window.scrollTo(0, savedScrollY)
}

/** Freezes page scrolling while isLocked is true, then returns the page to where it was. */
export default function useLockBodyScroll(isLocked) {
    useEffect(() => {
        if (!isLocked) return
        lock()
        return unlock
    }, [isLocked])
}
