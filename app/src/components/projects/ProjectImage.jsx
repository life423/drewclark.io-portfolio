// Reuse the overview artwork without cropping it in either detail layout.
// A native image link also gives keyboard and touch users a full-size view.
export default function ProjectImage({ image, imageAlt, imageWidth, imageHeight, title, preview = false }) {
    if (!image) return null

    const artwork = (
        <img
            src={image}
            alt={imageAlt || `${title} project preview`}
            width={imageWidth}
            height={imageHeight}
            loading='lazy'
            decoding='async'
            className='block h-auto w-full'
        />
    )

    return (
        <figure className={`${preview ? '' : 'mb-5 '}overflow-hidden rounded-lg border border-brandGray-700 bg-brandGray-900`}>
            {preview ? artwork : <a
                href={image}
                target='_blank'
                rel='noopener noreferrer'
                aria-label={`View the full ${title} image (opens in a new tab)`}
                className='group relative block w-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-brandGreen-300'
            >
                {artwork}
                <span aria-hidden='true' className='block border-t border-brandGray-700 px-3 py-2 text-right text-xs font-medium text-brandGreen-300 group-hover:text-brandGreen-200'>
                    View full image ↗
                </span>
            </a>}
        </figure>
    )
}
