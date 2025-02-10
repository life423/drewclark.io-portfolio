import React, { useEffect, useRef, useCallback, Children } from 'react'
import { createPortal } from 'react-dom'
import clsx from 'clsx'
import { LuX } from 'react-icons/lu'
import useLockBodyScroll from '../../hooks/useLockBodyScroll' // adjust path as needed
import DrawerOverlay from './DrawerOverlay'
import DrawerContent from './DrawerContent'
// Subcomponent: DrawerOverlay


// Subcomponent: DrawerContent


export default function Drawer({ isOpen, onClose, children }) {
    const drawerRef = useRef(null)
    const lastFocusedRef = useRef(null)

    useLockBodyScroll(isOpen)

    const handleKeyDown = useCallback(
        e => {
            if (e.key === 'Escape') {
                onClose()
            }
        },
        [onClose]
    )

    useEffect(() => {
        if (isOpen) {
            lastFocusedRef.current = document.activeElement
            document.addEventListener('keydown', handleKeyDown)
            drawerRef.current?.focus()
        } else {
            document.removeEventListener('keydown', handleKeyDown)
            lastFocusedRef.current?.focus()
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [isOpen, handleKeyDown])

    const drawer = (
        <>
            <DrawerOverlay isOpen={isOpen} onClick={onClose} />
            <DrawerContent
                isOpen={isOpen}
                onClose={onClose}
                drawerRef={drawerRef}
            >
                {children}
            </DrawerContent>
        </>
    )

    return createPortal(drawer, document.body)
}
