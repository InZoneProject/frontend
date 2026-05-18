import { Events } from '@/enums/events.enum'
import { computed } from 'vue'
import { useLanguageSwitcher } from '@/composables/useLanguageSwitcher'
import type { ZoneCreateModalEmits } from '@/modules/building/interfaces/zone-create-modal-emits.interface'
import type { ZoneCreateModalProperties } from '@/modules/building/interfaces/zone-create-modal-properties.interface'

const REGULAR_ZONE_TAB = 'regular'
const TRANSITION_ZONE_TAB = 'transition'

export const useZoneCreateModal = (
    properties: ZoneCreateModalProperties,
    emit: ZoneCreateModalEmits
) => {
    const { translations } = useLanguageSwitcher()
    const updateTitleValueEvent: Events.UPDATE_TITLE_VALUE = Events.UPDATE_TITLE_VALUE
    const submitEvent: Events.SUBMIT = Events.SUBMIT
    const cancelEvent: Events.CANCEL = Events.CANCEL
    const activeZoneTypeTab = computed(() => properties.isTransitionBetweenFloors ? TRANSITION_ZONE_TAB : REGULAR_ZONE_TAB)
    const zoneTypeTabs = computed(() => [
        {
            id: REGULAR_ZONE_TAB,
            label: translations.value.organizationAdmin.buildingPage.zoneForm.regular
        },
        {
            id: TRANSITION_ZONE_TAB,
            label: translations.value.organizationAdmin.buildingPage.zoneForm.transition
        }
    ])

    const setZoneTypeTab = (tabId: string) => {
        if (properties.loading) return
        if (tabId === TRANSITION_ZONE_TAB && !properties.canCreateTransition) return
        emit(Events.UPDATE_IS_TRANSITION_BETWEEN_FLOORS, tabId === TRANSITION_ZONE_TAB)
    }

    return {
        activeZoneTypeTab,
        zoneTypeTabs,
        setZoneTypeTab,
        updateTitleValueEvent,
        submitEvent,
        cancelEvent
    }
}
