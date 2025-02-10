import { useEffect } from 'react'

export default function useLockBodyScroll(isLocked) {
    useEffect(() => {
        document.body.style.overflow = isLocked ? 'hidden' : ''
        return () => {
            document.body.style.overflow = ''
        }
    }, [isLocked])
}
