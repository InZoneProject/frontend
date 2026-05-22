import {BUILDING_MAP_DOOR_CONSTANTS} from '@/modules/building/constants/building-map-door.constants'
import {buildingMapEntranceDoorPlacementContextService} from '@/modules/building/services/building-map-entrance-door-placement-context.service'
import {buildingMapGeometryService} from '@/modules/building/services/building-map-geometry.service'
import {buildingMapTransitionService} from '@/modules/building/services/building-map-transition.service'
import type {AddZoneHandle} from '@/modules/building/interfaces/add-zone-handle.interface'
import type {BuildingMapRectangle} from '@/modules/building/interfaces/building-map-rectangle.interface'
import type {DoorMapItem} from '@/modules/building/interfaces/door-map-item.interface'
import type {RenderedDoor} from '@/modules/building/interfaces/rendered-door.interface'
import type {ZoneMapItem} from '@/modules/building/interfaces/zone-map-item.interface'

class BuildingMapRenderedDoorService {
    public createRenderedDoor(params: {
        door: DoorMapItem
        renderedZones: ZoneMapItem[]
        doorsForPositioning: DoorMapItem[]
        currentFloorId: number
        unitSize: number
        hoveredAddHandle: AddZoneHandle | null
        baseAddZoneHandles: AddZoneHandle[]
        hoveredAddHandleCoordinate: number | null
    }): RenderedDoor | null {
        const zoneTo = params.renderedZones.find((zone) => zone.zone_id === params.door.zone_to_id)

        if (!zoneTo) return null

        const zoneToRect = buildingMapGeometryService.toRectangle(zoneTo)
        const size = BUILDING_MAP_DOOR_CONSTANTS.DOOR_SIZE * params.unitSize
        let x = 0
        let y = 0
        let side: 'top' | 'bottom' | 'left' | 'right' = params.door.entrance_door_side || 'bottom'

        if (params.door.is_entrance && params.door.entrance_door_side) {
            const entranceSide = params.door.entrance_door_side
            const handle = params.hoveredAddHandle

            const sideDoors = params.doorsForPositioning.filter((item) =>
                item.is_entrance
                && item.zone_to_id === zoneTo.zone_id
                && item.entrance_door_side === entranceSide
                && item.floor_id === params.door.floor_id
            )

            const sortedSideDoors = this.sortDoorsWithVirtualInsert(sideDoors)
            const sideDoorIndex = sortedSideDoors.findIndex((item) => item.door_id === params.door.door_id)
            const isOtherFloorEntranceDoor = params.door.floor_id !== params.currentFloorId

            const renderedZonesForDoorFloor = params.renderedZones.filter((zone) =>
                zone.zone_id === zoneTo.zone_id
                || zone.floor_id === params.door.floor_id
                || zone.is_transition_between_floors
            )

            const doorsForDoorFloorPositioning = params.doorsForPositioning.filter((door) =>
                door.floor_id === params.door.floor_id
            )

            const baseHoveredHandle = handle
                ? params.baseAddZoneHandles.find((item) => item.key === handle.key) || handle
                : null

            const otherFloorTransitionCoordinate = baseHoveredHandle && params.hoveredAddHandleCoordinate !== null
                ? buildingMapGeometryService.clampValue(
                    params.hoveredAddHandleCoordinate,
                    baseHoveredHandle.baseSegment.start,
                    baseHoveredHandle.baseSegment.end
                )
                : null

            const effectiveOtherFloorTransitionCoordinate = handle
                ? buildingMapTransitionService.getNearestTransitionCoordinate(
                    handle.transitionSegments,
                    otherFloorTransitionCoordinate
                )
                : null

            const otherFloorTransitionSegment = handle && effectiveOtherFloorTransitionCoordinate !== null
                ? buildingMapTransitionService.getTransitionSegmentNearCoordinate(
                    handle.transitionSegments,
                    effectiveOtherFloorTransitionCoordinate
                )
                : null

            const normalPlacementGroups = buildingMapEntranceDoorPlacementContextService.getEntranceDoorPlacementGroupsForZones(
                zoneTo,
                entranceSide,
                params.door.floor_id,
                renderedZonesForDoorFloor,
                sortedSideDoors.length
            )

            const addHandleDoorCollisionRect = handle
                ? this.getAddHandleDoorCollisionRect(handle)
                : null

            const otherFloorDoorCollisionRect = isOtherFloorEntranceDoor && otherFloorTransitionSegment && handle
                ? buildingMapTransitionService.getTransitionAddHandlePreviewRectForSegment(
                    {
                        side: handle.side,
                        payload: {
                            x_coordinate: handle.payload.x_coordinate,
                            y_coordinate: handle.payload.y_coordinate,
                            width: handle.payload.width,
                            height: handle.payload.height
                        }
                    },
                    otherFloorTransitionSegment
                )
                : null

            const candidateHandleRect = isOtherFloorEntranceDoor
                ? otherFloorDoorCollisionRect
                    ? this.expandCandidateRectForEntranceAura(
                        otherFloorDoorCollisionRect,
                        entranceSide
                    )
                    : null
                : addHandleDoorCollisionRect

            const doesHoveredHandleAffectDoor = candidateHandleRect
                ? buildingMapEntranceDoorPlacementContextService.doesCandidateAffectEntranceDoorSide(
                    zoneTo,
                    entranceSide,
                    candidateHandleRect,
                    renderedZonesForDoorFloor,
                    params.door.floor_id,
                    sortedSideDoors.length
                )
                : false

            const handleRect = doesHoveredHandleAffectDoor
                ? candidateHandleRect
                : null

            const preferredOtherFloorHoverPlacementGroups =
                isOtherFloorEntranceDoor
                && handleRect
                && handle
                && effectiveOtherFloorTransitionCoordinate !== null
                && handle.transitionSegments.length > 0
                    ? buildingMapEntranceDoorPlacementContextService.getBestOtherFloorEntranceDoorPlacementGroupsForTransition(
                        zoneTo,
                        entranceSide,
                        params.door.floor_id,
                        handle.sourceZone,
                        handle.side,
                        handle.transitionSegments,
                        renderedZonesForDoorFloor,
                        sortedSideDoors.length,
                        effectiveOtherFloorTransitionCoordinate
                    )
                    : []

            const currentFloorRegularHoverPlacementGroups =
                !isOtherFloorEntranceDoor && handleRect
                    ? buildingMapEntranceDoorPlacementContextService.getEntranceDoorPlacementGroupsAfterRegularZoneAdd(
                        zoneTo,
                        entranceSide,
                        params.door.floor_id,
                        handleRect,
                        renderedZonesForDoorFloor,
                        sortedSideDoors.length
                    )
                    : []

            const hardHoverPlacementGroups = handleRect
                && currentFloorRegularHoverPlacementGroups.length === 0
                && preferredOtherFloorHoverPlacementGroups.length === 0
                ? buildingMapEntranceDoorPlacementContextService.getEntranceDoorPlacementGroupsForCandidate(
                    zoneTo,
                    entranceSide,
                    params.door.floor_id,
                    handleRect,
                    renderedZonesForDoorFloor,
                    doorsForDoorFloorPositioning,
                    sortedSideDoors.length,
                    true,
                    true
                )
                : []

            const softHoverPlacementGroups =
                handleRect && hardHoverPlacementGroups.length === 0
                    ? buildingMapEntranceDoorPlacementContextService.getEntranceDoorPlacementGroupsForCandidate(
                        zoneTo,
                        entranceSide,
                        params.door.floor_id,
                        handleRect,
                        renderedZonesForDoorFloor,
                        doorsForDoorFloorPositioning,
                        sortedSideDoors.length,
                        false,
                        true
                    )
                    : []

            const pressureHoverPlacementGroups =
                handleRect
                && hardHoverPlacementGroups.length === 0
                && softHoverPlacementGroups.length === 0
                    ? buildingMapEntranceDoorPlacementContextService.getEntranceDoorPlacementGroupsForCandidate(
                        zoneTo,
                        entranceSide,
                        params.door.floor_id,
                        handleRect,
                        renderedZonesForDoorFloor,
                        doorsForDoorFloorPositioning,
                        sortedSideDoors.length,
                        false,
                        false
                    )
                    : []

            const hoverPlacementGroups = handleRect
                ? currentFloorRegularHoverPlacementGroups.length > 0
                    ? currentFloorRegularHoverPlacementGroups
                    : preferredOtherFloorHoverPlacementGroups.length > 0
                    ? preferredOtherFloorHoverPlacementGroups
                    : hardHoverPlacementGroups.length > 0
                    ? hardHoverPlacementGroups
                    : softHoverPlacementGroups.length > 0
                        ? softHoverPlacementGroups
                        : pressureHoverPlacementGroups
                : []

            const hasHoveredPlacementChangedDoors = hoverPlacementGroups.length > 0
                && !buildingMapEntranceDoorPlacementContextService.areEntranceDoorPlacementGroupsEqual(
                    normalPlacementGroups,
                    hoverPlacementGroups
                )

            const activePlacementGroups = hasHoveredPlacementChangedDoors
                ? hoverPlacementGroups
                : normalPlacementGroups

            if (activePlacementGroups.length === 0) return null

            const getDoorCenterWithHoveredAddHandle = () => {
                if (sideDoorIndex < 0) {
                    const firstGroup = activePlacementGroups[0]
                    if (!firstGroup) return null

                    return firstGroup.placement.start + (firstGroup.placement.end - firstGroup.placement.start) / 2
                }

                return buildingMapEntranceDoorPlacementContextService.getEntranceDoorCenterFromPlacementGroups(
                    activePlacementGroups,
                    sideDoorIndex
                )
            }

            if (entranceSide === 'top' || entranceSide === 'bottom') {
                const doorCenterX = getDoorCenterWithHoveredAddHandle()
                if (doorCenterX === null) return null

                x = (doorCenterX - BUILDING_MAP_DOOR_CONSTANTS.DOOR_SIZE / 2) * params.unitSize
                y = (entranceSide === 'top'
                    ? zoneToRect.y - BUILDING_MAP_DOOR_CONSTANTS.DOOR_SIZE / 2
                    : zoneToRect.y + zoneToRect.height - BUILDING_MAP_DOOR_CONSTANTS.DOOR_SIZE / 2) * params.unitSize
            } else {
                x = (entranceSide === 'left'
                    ? zoneToRect.x - BUILDING_MAP_DOOR_CONSTANTS.DOOR_SIZE / 2
                    : zoneToRect.x + zoneToRect.width - BUILDING_MAP_DOOR_CONSTANTS.DOOR_SIZE / 2) * params.unitSize

                const doorCenterY = getDoorCenterWithHoveredAddHandle()
                if (doorCenterY === null) return null

                y = (doorCenterY - BUILDING_MAP_DOOR_CONSTANTS.DOOR_SIZE / 2) * params.unitSize
            }
        } else {
            if (params.door.zone_from_id === null) return null

            const zoneFrom = params.renderedZones.find((zone) => zone.zone_id === params.door.zone_from_id)

            if (!zoneFrom) return null

            const intersection = buildingMapGeometryService.calculateIntersection(
                buildingMapGeometryService.toRectangle(zoneFrom),
                zoneToRect
            )

            if (!intersection.hasIntersection || !intersection.side) return null

            side = intersection.side

            const pairDoors = params.doorsForPositioning
                .filter((item) =>
                        !item.is_entrance
                        && item.zone_from_id !== null
                        && item.floor_id === params.door.floor_id
                        && (
                            (item.zone_from_id === params.door.zone_from_id && item.zone_to_id === params.door.zone_to_id)
                            || (item.zone_from_id === params.door.zone_to_id && item.zone_to_id === params.door.zone_from_id)
                        )
                )

            const sortedPairDoors = this.sortDoorsWithVirtualInsert(pairDoors)
            const doorIndex = Math.max(0, sortedPairDoors.findIndex((item) => item.door_id === params.door.door_id))
            const doorCenter = buildingMapEntranceDoorPlacementContextService.getRegularDoorCenterOnSegment(
                intersection,
                doorIndex,
                sortedPairDoors.length
            )

            if (intersection.side === 'left' || intersection.side === 'right') {
                const boundaryX = intersection.side === 'right'
                    ? zoneFrom.x_coordinate + zoneFrom.width
                    : zoneFrom.x_coordinate

                x = (boundaryX - BUILDING_MAP_DOOR_CONSTANTS.DOOR_SIZE / 2) * params.unitSize
                y = (doorCenter - BUILDING_MAP_DOOR_CONSTANTS.DOOR_SIZE / 2) * params.unitSize
            } else {
                const boundaryY = intersection.side === 'bottom'
                    ? zoneFrom.y_coordinate + zoneFrom.height
                    : zoneFrom.y_coordinate

                x = (doorCenter - BUILDING_MAP_DOOR_CONSTANTS.DOOR_SIZE / 2) * params.unitSize
                y = (boundaryY - BUILDING_MAP_DOOR_CONSTANTS.DOOR_SIZE / 2) * params.unitSize
            }
        }

        return {
            door_id: params.door.door_id,
            floor_id: params.door.floor_id,
            is_entrance: params.door.is_entrance,
            zone_from_id: params.door.zone_from_id,
            zone_to_id: params.door.zone_to_id,
            rfid_reader_id: params.door.rfid_reader_id,
            side,
            style: {
                width: `${size}px`,
                height: `${size}px`,
                transform: `translate(${x}px, ${y}px)`
            }
        }
    }

    private expandCandidateRectForEntranceAura(
        rect: BuildingMapRectangle,
        entranceSide: 'top' | 'bottom' | 'left' | 'right'
    ): BuildingMapRectangle {
        const clearance = BUILDING_MAP_DOOR_CONSTANTS.ENTRANCE_DOOR_AURA_CLEARANCE

        if (entranceSide === 'left' || entranceSide === 'right') {
            return {
                ...rect,
                y: rect.y - clearance,
                height: rect.height + clearance * 2
            }
        }

        return {
            ...rect,
            x: rect.x - clearance,
            width: rect.width + clearance * 2
        }
    }

    private sortDoorsWithVirtualInsert(
        doors: DoorMapItem[]
    ) {
        const virtualDoor = doors.find((door) => door.door_id === -1)
        const insertIndex = virtualDoor ? this.getVirtualDoorInsertIndex(virtualDoor) ?? 0 : null
        const realDoors = doors
            .filter((door) => door.door_id !== -1)
            .sort((first, second) => first.door_id - second.door_id)

        if (!virtualDoor || insertIndex === null) return realDoors

        const result = [...realDoors]
        result.splice(Math.max(0, Math.min(insertIndex, result.length)), 0, virtualDoor)

        return result
    }

    private getVirtualDoorInsertIndex(
        door: DoorMapItem
    ) {
        if (door.door_id !== -1) return null

        return Number((door as DoorMapItem & {insert_index?: number}).insert_index ?? 0)
    }

    private getAddHandleDoorCollisionRect(
        handle: AddZoneHandle
    ): BuildingMapRectangle {
        const geometry = handle.payload.door_collision_geometry || handle.payload

        return {
            x: geometry.x_coordinate,
            y: geometry.y_coordinate,
            width: geometry.width,
            height: geometry.height
        }
    }
}

export const buildingMapRenderedDoorService = new BuildingMapRenderedDoorService()
