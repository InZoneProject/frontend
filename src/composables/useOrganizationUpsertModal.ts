import { computed } from 'vue'
import { Events } from '@/enums/events.enum'
import type { OrganizationUpsertModalProperties } from '@/interfaces/organization-upsert-modal-properties.interface'

export const useOrganizationUpsertModal = (properties: OrganizationUpsertModalProperties) => {
    const modalTitle = computed(() => {
        return properties.mode === 'create'
            ? properties.translations.createTitle
            : properties.translations.editTitle
    })

    const confirmLabel = computed(() => {
        return properties.mode === 'create'
            ? properties.translations.createConfirm
            : properties.translations.editConfirm
    })

    const updateNameEvent: Events.UPDATE_NAME_VALUE = Events.UPDATE_NAME_VALUE
    const updateDescriptionEvent: Events.UPDATE_DESCRIPTION_VALUE = Events.UPDATE_DESCRIPTION_VALUE
    const submitEvent: Events.SUBMIT = Events.SUBMIT
    const cancelEvent: Events.CANCEL = Events.CANCEL

    return {
        modalTitle,
        confirmLabel,
        updateNameEvent,
        updateDescriptionEvent,
        submitEvent,
        cancelEvent
    }
}
