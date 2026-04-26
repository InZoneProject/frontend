import { computed } from 'vue'
import { Events } from '@/enums/events.enum'
import type { TagUpsertModalProperties } from '@/interfaces/tag-upsert-modal-properties.interface'

export const useTagUpsertModal = (properties: TagUpsertModalProperties) => {
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
    const updateTagUidEvent: Events.UPDATE_TAG_UID_VALUE = Events.UPDATE_TAG_UID_VALUE
    const submitEvent: Events.SUBMIT = Events.SUBMIT
    const cancelEvent: Events.CANCEL = Events.CANCEL

    return {
        modalTitle,
        confirmLabel,
        updateNameEvent,
        updateTagUidEvent,
        submitEvent,
        cancelEvent
    }
}
