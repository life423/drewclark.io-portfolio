import clsx from 'clsx'

export function IconPair({
    Icon,
    iconAnimationClass,
    onAnimEnd,
    onUserStop,
    url,
    onClick,
}) {
    return (
        <a
            href={url}
            target='_blank'
            rel='noopener noreferrer'
            className='relative inline-block'
        >
            {/* Animated icon layer */}
            <Icon
                className={clsx(
                    'origin-center',
                    iconAnimationClass
                        ? iconAnimationClass
                        : 'h-6 w-6 animate-none icon-default'
                )}
                onAnimationEnd={onAnimEnd}
                onClick={e => {
                    // Call both the onUserStop and onClick handlers if provided
                    if (onUserStop) onUserStop(e)
                    if (onClick) onClick(e)
                }}
            />
        </a>
    )
}

// export default IconPair;
