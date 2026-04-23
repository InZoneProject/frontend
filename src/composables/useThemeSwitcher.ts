import { ref } from 'vue'
import InZoneIconLight from '@/assets/in-zone-icon-light.svg'
import InZoneIconDark from '@/assets/in-zone-icon-dark.svg'

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
        }, 1250)
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
        initializeTheme
    }
}