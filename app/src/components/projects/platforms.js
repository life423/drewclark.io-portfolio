import { FaApple, FaLinux, FaWindows } from 'react-icons/fa'
import { LuDownload } from 'react-icons/lu'

// Brand marks for a project's downloadable builds (projects.json: downloads[].platform)
export const PLATFORM_ICONS = { macos: FaApple, windows: FaWindows, linux: FaLinux }
export const PLATFORM_NAMES = { macos: 'macOS', windows: 'Windows', linux: 'Linux' }

export function platformIcon(platform) {
    return PLATFORM_ICONS[platform] || LuDownload
}

export function platformName(file) {
    return PLATFORM_NAMES[file.platform] || file.label
}

export function downloadTitle(file) {
    return 'Download for ' + platformName(file) + (file.version ? ' (' + file.version + ')' : '')
}

export function downloadAriaLabel(projectTitle, file) {
    return 'Download ' + projectTitle + ' for ' + platformName(file) + (file.version ? ', version ' + file.version : '')
}
