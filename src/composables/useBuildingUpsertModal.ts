import { computed } from 'vue'
import { Events } from '@/enums/events.enum'
import type { BuildingUpsertModalProperties } from '@/interfaces/building-upsert-modal-properties.interface'

export const useBuildingUpsertModal = (properties: BuildingUpsertModalProperties) => {
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

    const updateTitleEvent: Events.UPDATE_TITLE_VALUE = Events.UPDATE_TITLE_VALUE
    const updateAddressEvent: Events.UPDATE_ADDRESS_VALUE = Events.UPDATE_ADDRESS_VALUE
    const submitEvent: Events.SUBMIT = Events.SUBMIT
    const cancelEvent: Events.CANCEL = Events.CANCEL

    return {
        modalTitle,
        confirmLabel,
        updateTitleEvent,
        updateAddressEvent,
        submitEvent,
        cancelEvent
    }
}
