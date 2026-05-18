import { computed } from 'vue'
import { Events } from '@/enums/events.enum'
import type { FloorUpsertModalProperties } from '@/modules/building/interfaces/floor-upsert-modal-properties.interface'

export const useFloorUpsertModal = (properties: FloorUpsertModalProperties) => {
    const modalTitle = computed(() => properties.mode === 'create' ? properties.translations.createTitle : properties.translations.editTitle)
    const confirmLabel = computed(() => properties.mode === 'create' ? properties.translations.createConfirm : properties.translations.editConfirm)

    const updateNameEvent: Events.UPDATE_NAME_VALUE = Events.UPDATE_NAME_VALUE
    const submitEvent: Events.SUBMIT = Events.SUBMIT
    const cancelEvent: Events.CANCEL = Events.CANCEL

    return {
        modalTitle,
        confirmLabel,
        updateNameEvent,
        submitEvent,
        cancelEvent
    }
}
