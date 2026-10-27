import { LuChevronRight } from 'react-icons/lu'

export default function ProjectNextButton({ onClick, nextTitle }) {
    return (
        <button
            type='button'
            onClick={onClick}
            aria-label={`Next project: ${nextTitle}`}
            title={`Next project: ${nextTitle}`}
            className='inline-flex min-h-11 shrink-0 items-center justify-center gap-1 rounded-full border border-brandGray-500 px-3 text-sm font-semibold text-brandGreen-300 transition-colors duration-200 hover:border-brandGreen-400 hover:bg-brandGreen-900/40 active:bg-brandGreen-900/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brandGreen-300 motion-reduce:transition-none'
        >
            <span>Next</span>
            <LuChevronRight className='h-5 w-5' aria-hidden='true' />
        </button>
    )
}
