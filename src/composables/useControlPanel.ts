import { ref, toRef } from 'vue'
import { useLanguageSwitcher } from '@/composables/useLanguageSwitcher'
import { useNotificationsDropdown } from '@/composables/useNotificationsDropdown'
import type { ControlPanelProperties } from '@/interfaces/control-panel-properties.interface'

export function useControlPanel(properties: ControlPanelProperties) {
    const { currentLanguage, setLanguage, translations } = useLanguageSwitcher()
    const showNotifications = toRef(properties, 'showNotifications')
    const isProfileModalOpen = ref(false)

    const {
        notificationsContainer,
        isNotificationsAvailable,
        unreadCount,
        notifications,
        isDropdownOpen,
        isLoadingNotifications,
        toggleDropdown,
        fetchNextNotifications
    } = useNotificationsDropdown(showNotifications)

    const openProfileModal = (): void => {
        isProfileModalOpen.value = true
    }

    const closeProfileModal = (): void => {
        isProfileModalOpen.value = false
    }

    return {
        currentLanguage,
        setLanguage,
        translations,
        isProfileModalOpen,
        openProfileModal,
        closeProfileModal,
        notificationsContainer,
        isNotificationsAvailable,
        unreadCount,
        notifications,
        isDropdownOpen,
        isLoadingNotifications,
        toggleDropdown,
        fetchNextNotifications
    }
}
