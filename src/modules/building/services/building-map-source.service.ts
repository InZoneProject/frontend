import type { AddDoorHandle } from '@/modules/building/interfaces/add-door-handle.interface'
import type { AddZoneHandle } from '@/modules/building/interfaces/add-zone-handle.interface'
import type { DoorMapItem } from '@/modules/building/interfaces/door-map-item.interface'
import type { BuildingMapProperties } from '@/modules/building/interfaces/building-map-properties.interface'
import type { GeometryDependencies } from '@/modules/building/interfaces/geometry-dependencies.interface'
import type { ZoneMapItem } from '@/modules/building/interfaces/zone-map-item.interface'

class BuildingMapSourceService {
    getDoorsSource(
        geometryDependencies: GeometryDependencies | null,
        propertyDoors: DoorMapItem[]
    ) {
        return geometryDependencies?.doors || propertyDoors
    }

    getZonesSource(
        geometryDependencies: GeometryDependencies | null,
        propertyZones: ZoneMapItem[],
        transitionValidationZones: ZoneMapItem[]
    ) {
        if (geometryDependencies?.zones) return geometryDependencies.zones
        if (transitionValidationZones.length === 0) return propertyZones

        const zonesById = new Map<number, ZoneMapItem>()

        for (const zone of transitionValidationZones) zonesById.set(zone.zone_id, zone)
        for (const zone of propertyZones) zonesById.set(zone.zone_id, zone)

        return [...zonesById.values()]
    }

    getRegularAddZonesSource(zones: ZoneMapItem[], currentFloorId: number) {
        return zones.filter((zone) => zone.floor_id === currentFloorId)
    }

    getRegularAddBlockingZonesSource(zones: ZoneMapItem[], currentFloorId: number) {
        return zones.filter((zone) =>
            zone.floor_id === currentFloorId || zone.is_transition_between_floors
        )
    }

    getRegularAddDoorsSource(doors: DoorMapItem[], currentFloorId: number) {
        return doors.filter((door) => door.floor_id === currentFloorId)
    }

    mergeTransitionZones(
        transitionValidationZones: ZoneMapItem[],
        fallbackZones: ZoneMapItem[]
    ) {
        if (transitionValidationZones.length === 0) return fallbackZones

        const zonesById = new Map<number, ZoneMapItem>()

        for (const zone of transitionValidationZones) zonesById.set(zone.zone_id, zone)
        for (const zone of fallbackZones) zonesById.set(zone.zone_id, zone)

        return [...zonesById.values()]
    }

    mergeTransitionDoors(
        transitionValidationDoors: DoorMapItem[],
        fallbackDoors: DoorMapItem[]
    ) {
        if (transitionValidationDoors.length === 0) return fallbackDoors

        const doorsById = new Map<number, DoorMapItem>()

        for (const door of transitionValidationDoors) doorsById.set(door.door_id, door)
        for (const door of fallbackDoors) {
            doorsById.set(door.door_id, door)
        }

        return [...doorsById.values()]
    }

    isInCurrentFloorScope(zone: ZoneMapItem, currentFloorId: number) {
        return zone.is_transition_between_floors || zone.floor_id === currentFloorId
    }

    getAddZoneSourceZones(zones: ZoneMapItem[], currentFloorId: number) {
        return zones.filter((zone) => this.isInCurrentFloorScope(zone, currentFloorId))
    }

    getDoorsSourceForMap(
        geometryDependencies: GeometryDependencies | null,
        properties: BuildingMapProperties
    ) {
        return this.getDoorsSource(geometryDependencies, properties.doors)
    }

    getZonesSourceForMap(
        geometryDependencies: GeometryDependencies | null,
        properties: BuildingMapProperties
    ) {
        return this.getZonesSource(
            geometryDependencies,
            properties.zones,
            properties.transitionValidationZones
        )
    }

    getRegularAddZonesSourceForMap(
        geometryDependencies: GeometryDependencies | null,
        properties: BuildingMapProperties
    ) {
        return this.getRegularAddZonesSource(
            this.getZonesSourceForMap(geometryDependencies, properties),
            properties.currentFloorId
        )
    }

    getRegularAddBlockingZonesSourceForMap(
        geometryDependencies: GeometryDependencies | null,
        properties: BuildingMapProperties
    ) {
        return this.getRegularAddBlockingZonesSource(
            this.getZonesSourceForMap(geometryDependencies, properties),
            properties.currentFloorId
        )
    }

    getRegularAddDoorsSourceForMap(
        geometryDependencies: GeometryDependencies | null,
        properties: BuildingMapProperties
    ) {
        return this.getRegularAddDoorsSource(
            this.getDoorsSourceForMap(geometryDependencies, properties),
            properties.currentFloorId
        )
    }

    getProjectedRegularAddZonesSourceForMap(
        geometryDependencies: GeometryDependencies | null,
        properties: BuildingMapProperties
    ) {
        return this.mergeTransitionZones(
            properties.transitionValidationZones,
            this.getRegularAddZonesSourceForMap(geometryDependencies, properties)
        )
    }

    isInCurrentFloorScopeForMap(
        zone: ZoneMapItem,
        properties: BuildingMapProperties
    ) {
        return this.isInCurrentFloorScope(zone, properties.currentFloorId)
    }

    getAddZoneSourceZonesForMap(
        geometryDependencies: GeometryDependencies | null,
        properties: BuildingMapProperties
    ) {
        return this.getAddZoneSourceZones(
            this.getZonesSourceForMap(geometryDependencies, properties),
            properties.currentFloorId
        )
    }

    getRenderedZonesSource(
        previewZones: ZoneMapItem[] | null,
        propertyZones: ZoneMapItem[],
        transitionValidationZones: ZoneMapItem[],
        hoveredAddHandle: AddZoneHandle | null
    ) {
        if (previewZones) return previewZones

        const shouldUseTransitionValidationZones = hoveredAddHandle
            && (
                hoveredAddHandle.transitionMode !== 'none'
                || hoveredAddHandle.canCreateTransition
                || hoveredAddHandle.transitionSegments.length > 0
                || hoveredAddHandle.baseTransitionSegments.length > 0
                || hoveredAddHandle.payload.transition_payload
            )
            && transitionValidationZones.length > 0

        if (!shouldUseTransitionValidationZones) return propertyZones

        return this.mergeTransitionZones(transitionValidationZones, propertyZones)
    }

    getRealDoorsSource(
        doorsSource: DoorMapItem[],
        transitionValidationDoors: DoorMapItem[],
        hoveredAddHandle: AddZoneHandle | null
    ) {
        const shouldUseTransitionValidationDoors = hoveredAddHandle
            && (
                hoveredAddHandle.transitionMode !== 'none'
                || hoveredAddHandle.canCreateTransition
                || hoveredAddHandle.transitionSegments.length > 0
                || hoveredAddHandle.baseTransitionSegments.length > 0
                || hoveredAddHandle.payload.transition_payload
            )
            && transitionValidationDoors.length > 0

        if (!shouldUseTransitionValidationDoors) return doorsSource

        return this.mergeTransitionDoors(transitionValidationDoors, doorsSource)
    }

    getDoorsForPositioning(realDoors: DoorMapItem[], addDoorHandle: AddDoorHandle | null) {
        if (!addDoorHandle) return realDoors

        return [
            ...realDoors,
            {
                door_id: -1,
                insert_index: addDoorHandle.insertIndex,
                is_entrance: addDoorHandle.payload.zone_from_id === null,
                entrance_door_side: addDoorHandle.payload.entrance_door_side || null,
                zone_from_id: addDoorHandle.payload.zone_from_id,
                zone_to_id: addDoorHandle.payload.zone_to_id,
                floor_id: addDoorHandle.payload.floor_id,
                rfid_reader_id: null
            } as DoorMapItem & { insert_index: number }
        ]
    }
}

export const buildingMapSourceService = new BuildingMapSourceService()
