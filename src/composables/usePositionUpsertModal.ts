import { computed } from 'vue'
import { Events } from '@/enums/events.enum'
import type { PositionUpsertModalProperties } from '@/interfaces/position-upsert-modal-properties.interface'

export const usePositionUpsertModal = (properties: PositionUpsertModalProperties) => {
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

    const updateRoleEvent: Events.UPDATE_NAME_VALUE = Events.UPDATE_NAME_VALUE
    const updateDescriptionEvent: Events.UPDATE_DESCRIPTION_VALUE = Events.UPDATE_DESCRIPTION_VALUE
    const submitEvent: Events.SUBMIT = Events.SUBMIT
    const cancelEvent: Events.CANCEL = Events.CANCEL

    return {
        modalTitle,
        confirmLabel,
        updateRoleEvent,
        updateDescriptionEvent,
        submitEvent,
        cancelEvent
    }
}
