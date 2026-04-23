import { computed } from 'vue'
import { useLanguageSwitcher } from '@/composables/useLanguageSwitcher'

export const useDateFormatter = () => {
    const { currentLanguage } = useLanguageSwitcher()

    const locale = computed(() => (currentLanguage.value === 'ua' ? 'uk-UA' : 'en-US'))

    const formatDate = (dateValue: string | Date, includeTime = true) => {
        if (!dateValue) {
            return '—'
        }

        const date = new Date(dateValue)

        return new Intl.DateTimeFormat(locale.value, {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric',
            ...(includeTime && {
                hour: '2-digit',
                minute: '2-digit',
            }),
        }).format(date)
    }

    const formatRange = (startDate: string, endDate: string) => {
        return `${formatDate(startDate)} — ${formatDate(endDate)}`
    }

    return {
        formatDate,
        formatRange
    }
}