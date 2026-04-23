import { ref, computed } from 'vue'
import { en } from '@/locales/en'
import { ua } from '@/locales/ua'

const currentLanguage = ref(localStorage.getItem('lang') || 'ua')

export function useLanguageSwitcher() {
    const translations = computed(() => (currentLanguage.value === 'en' ? en : ua))

    const setLanguage = (lang: string) => {
        currentLanguage.value = lang
        localStorage.setItem('lang', lang)
    }

    const toggleLanguage = () => {
        const newLang = currentLanguage.value === 'en' ? 'ua' : 'en'
        setLanguage(newLang)
    }

    return {
        currentLanguage,
        translations,
        setLanguage,
        toggleLanguage
    }
}