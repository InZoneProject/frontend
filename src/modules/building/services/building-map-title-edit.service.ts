import {nextTick, type ComponentPublicInstance, type Ref} from 'vue'
import {Events} from '@/enums/events.enum'
import {LENGTH} from '@/constants/length.constants'
import type {BuildingMapEmits} from '@/modules/building/interfaces/building-map-emits.interface'
import type {BuildingMapProperties} from '@/modules/building/interfaces/building-map-properties.interface'

class BuildingMapTitleEditService {
    public async startTitleEdit(
        zoneId: number,
        title: string,
        editingZoneId: Ref<number>,
        editingZoneTitle: Ref<string>,
        titleInputRef: Ref<HTMLInputElement | null>
    ) {
        const nextTitle = title.slice(0, LENGTH.MAX_ZONE_TITLE_LENGTH)

        editingZoneId.value = zoneId
        editingZoneTitle.value = nextTitle

        await nextTick()

        titleInputRef.value?.focus()
        titleInputRef.value?.setSelectionRange(0, nextTitle.length)
    }

    public setTitleInputRef(
        element: Element | ComponentPublicInstance | null,
        titleInputRef: Ref<HTMLInputElement | null>
    ) {
        titleInputRef.value = element instanceof HTMLInputElement ? element : null
    }

    public finishTitleEdit(
        properties: BuildingMapProperties,
        emit: BuildingMapEmits,
        editingZoneId: Ref<number>,
        editingZoneTitle: Ref<string>
    ) {
        const zone = properties.zones.find((item) => item.zone_id === editingZoneId.value)
        const title = editingZoneTitle.value
            .trim()
            .slice(0, LENGTH.MAX_ZONE_TITLE_LENGTH)

        if (zone && title.length > 0 && title !== zone.title) {
            emit(Events.UPDATE_ZONE_TITLE, zone.zone_id, title)
        }

        editingZoneId.value = 0
        editingZoneTitle.value = ''
    }

    public cancelTitleEdit(
        editingZoneId: Ref<number>,
        editingZoneTitle: Ref<string>
    ) {
        editingZoneId.value = 0
        editingZoneTitle.value = ''
    }
}

export const buildingMapTitleEditService = new BuildingMapTitleEditService()
