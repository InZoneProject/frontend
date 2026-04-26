import { computed } from 'vue'
import { Events } from '@/enums/events.enum'
import type { OrganizationInfoFormProperties } from '@/interfaces/organization-info-form-properties.interface'

export const useOrganizationInfoForm = (properties: OrganizationInfoFormProperties) => {
    const descriptionText = computed(() => {
        const value = properties.descriptionValue.trim()
        return value.length > 0 ? value : properties.fallbackDescription
    })

    const isDescriptionEmpty = computed(() => properties.descriptionValue.trim().length === 0)

    const editEvent: Events.EDIT = Events.EDIT
    const deleteEvent: Events.DELETE = Events.DELETE

    return {
        descriptionText,
        isDescriptionEmpty,
        editEvent,
        deleteEvent
    }
}
