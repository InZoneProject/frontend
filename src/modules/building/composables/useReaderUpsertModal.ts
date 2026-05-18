import { computed } from 'vue'
import { Events } from '@/enums/events.enum'
import type { ReaderUpsertModalProperties } from '@/modules/building/interfaces/reader-upsert-modal-properties.interface'

export const useReaderUpsertModal = (properties: ReaderUpsertModalProperties) => {
    const modalTitle = computed(() => properties.mode === 'create'
        ? properties.translations.createTitle
        : properties.translations.editTitle)
    const confirmLabel = computed(() => properties.mode === 'create'
        ? properties.translations.createConfirm
        : properties.translations.editConfirm)

    const updateNameValueEvent: Events.UPDATE_NAME_VALUE = Events.UPDATE_NAME_VALUE
    const submitEvent: Events.SUBMIT = Events.SUBMIT
    const cancelEvent: Events.CANCEL = Events.CANCEL

    return {
        modalTitle,
        confirmLabel,
        updateNameValueEvent,
        submitEvent,
        cancelEvent
    }
}
