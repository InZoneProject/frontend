import { ref } from 'vue'
import InZoneIconLight from '@/assets/in-zone-icon-light.svg'
import InZoneIconDark from '@/assets/in-zone-icon-dark.svg'
import { THEME_SWITCHER_CONSTANTS } from '@/constants/theme-switcher.constants'

const isDark = ref(localStorage.getItem('theme') !== 'light')

export function useThemeSwitcher() {
    const updateFavicon = (dark: boolean) => {
        const favicon = document.getElementById('favicon') as HTMLLinkElement
        if (favicon) {
            favicon.href = dark ? InZoneIconDark : InZoneIconLight
        }
    }

    const toggleTheme = () => {
        document.documentElement.classList.add('is-toggling')

        isDark.value = !isDark.value
        document.documentElement.classList.toggle('dark', isDark.value)
        localStorage.setItem('theme', isDark.value ? 'dark' : 'light')

        updateFavicon(isDark.value)

        setTimeout(() => {
            document.documentElement.classList.remove('is-toggling')
        }, THEME_SWITCHER_CONSTANTS.TOGGLE_TRANSITION_MS)
    }

    const handleToggleTheme = (event: MouseEvent) => {
        toggleTheme()
        const target = event.currentTarget as HTMLButtonElement | null
        target?.blur()
    }

    const initializeTheme = () => {
        const saved = localStorage.getItem('theme')
        isDark.value = saved ? saved === 'dark' : true
        document.documentElement.classList.toggle('dark', isDark.value)
        updateFavicon(isDark.value)
    }

    return {
        isDark,
        toggleTheme,
        handleToggleTheme,
        initializeTheme
    }
}
