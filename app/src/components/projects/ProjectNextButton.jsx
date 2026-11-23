/* eslint react/jsx-uses-vars: "error" */
import { LuChevronRight } from 'react-icons/lu'
import './case-study-navigation.css'

export default function ProjectNextButton({ onClick, nextTitle }) {
    return (
        <button
            type='button'
            data-project-next
            onClick={onClick}
            aria-label={`Next project: ${nextTitle}`}
            title={`Next project: ${nextTitle}`}
            className='case-study-nav-action case-study-nav-action--next'
        >
            <span>Next</span>
            <LuChevronRight className='case-study-nav-icon' aria-hidden='true' />
        </button>
    )
}
