import {type ComponentPublicInstance, computed, onBeforeUnmount, onMounted, ref, watch} from 'vue'
import {Events} from '@/enums/events.enum'
import {IMAGE_UPLOAD_CONSTANTS} from '@/constants/image-upload.constants'
import {BUILDING_MAP_GEOMETRY_CONSTANTS} from '@/modules/building/constants/building-map-geometry.constants'
import {BUILDING_REALTIME_LOCATION_CONSTANTS} from '@/modules/building/constants/building-realtime-location.constants'
import {BUILDING_MAP_VIEWPORT_CONSTANTS} from '@/modules/building/constants/building-map-viewport.constants'
import {buildingMapAddHandleService} from '@/modules/building/services/building-map-add-handle.service'
import {buildingRepository} from '@/modules/building/repositories/building.repository'
import {buildingLocationsSocketService} from '@/modules/building/services/building-locations-socket.service'
import {buildingMapEmployeeService} from '@/modules/building/services/building-map-employee.service'
import {buildingEmployeePhotoService} from '@/modules/building/services/building-employee-photo.service'
import {buildingMapGeometryService} from '@/modules/building/services/building-map-geometry.service'
import {buildingMapSideService} from '@/modules/building/services/building-map-side.service'
import {buildingMapSourceService} from '@/modules/building/services/building-map-source.service'
import {buildingMapTransitionService} from '@/modules/building/services/building-map-transition.service'
import {BuildingMapActionType} from '@/modules/building/enums/building-map-action-type.enum'
import type {AddDoorHandle} from '@/modules/building/interfaces/add-door-handle.interface'
import type {AddZoneHandle} from '@/modules/building/interfaces/add-zone-handle.interface'
import type {BlockedGeometryPreview} from '@/modules/building/interfaces/blocked-geometry-preview.interface'
import type {BuildingMapAddDoorPayload} from '@/modules/building/interfaces/building-map-add-door-payload.interface'
import type {BuildingMapAddZonePayload} from '@/modules/building/interfaces/building-map-add-zone-payload.interface'
import type {BuildingMapEmits} from '@/modules/building/interfaces/building-map-emits.interface'
import type {BuildingMapMoveAction} from '@/modules/building/interfaces/building-map-move-action.interface'
import type {BuildingMapPanAction} from '@/modules/building/interfaces/building-map-pan-action.interface'
import type {
    BuildingMapRegularZonePayload
} from '@/modules/building/interfaces/building-map-regular-zone-payload.interface'
import type {BuildingMapResizeAction} from '@/modules/building/interfaces/building-map-resize-action.interface'
import type {
    BuildingMapTransitionZonePayload
} from '@/modules/building/interfaces/building-map-transition-zone-payload.interface'
import type {BuildingMapProperties} from '@/modules/building/interfaces/building-map-properties.interface'
import type {DoorMapItem} from '@/modules/building/interfaces/door-map-item.interface'
import type {EmployeeLocation} from '@/modules/building/interfaces/employee-location.interface'
import type {
    EmployeeLocationSocketPayload
} from '@/modules/building/interfaces/employee-location-socket-payload.interface'
import type {RenderedDoor} from '@/modules/building/interfaces/rendered-door.interface'
import type {ViewportBounds} from '@/modules/building/interfaces/viewport-bounds.interface'
import type {GeometryDependencies} from '@/modules/building/interfaces/geometry-dependencies.interface'
import type {ZoneMapItem} from '@/modules/building/interfaces/zone-map-item.interface'
import {BuildingMapRectangle} from "@/modules/building/interfaces/building-map-rectangle.interface";
import {BuildingMapSegment} from "@/modules/building/interfaces/building-map-segment.interface";
import {BuildingMapTransitionSegment} from "@/modules/building/interfaces/building-map-transition-segment.interface";
import {buildingMapTitleEditService} from "@/modules/building/services/building-map-title-edit.service";
import {buildingMapViewportControllerService} from "@/modules/building/services/building-map-viewport.service";
import {buildingMapFreeSideSliceService} from "@/modules/building/services/building-map-free-side-slice.service";
import {
    buildingMapEntranceDoorPlacementContextService
} from "@/modules/building/services/building-map-entrance-door-placement-context.service";
import {
    buildingMapOtherFloorEntranceDoorAuraService
} from "@/modules/building/services/building-map-other-floor-entrance-door-aura.service";
import {BuildingMapEntranceDoorCheck} from "@/modules/building/interfaces/building-map-entrance-door-check.interface";
import {buildingMapRenderedDoorService} from "@/modules/building/services/building-map-rendered-door.service";
import {buildingMapZoneTransformService} from "@/modules/building/services/building-map-zone-transform.service";
import {BuildingMapMode} from '@/modules/building/enums/building-map-mode.enum'
import {BuildingMapResizeEdge} from '@/modules/building/enums/building-map-resize-edge.enum'

export const useBuildingMap = (properties: BuildingMapProperties, emit: BuildingMapEmits) => {
    const mapRef = ref<HTMLDivElement | null>(null)
    const gridRef = ref<HTMLDivElement | null>(null)
    const layerRef = ref<HTMLDivElement | null>(null)
    const editingZoneId = ref(0)
    const editingZoneTitle = ref('')
    const titleInputRef = ref<HTMLInputElement | null>(null)
    const unitSize = ref<number>(BUILDING_MAP_VIEWPORT_CONSTANTS.DEFAULT_UNIT_SIZE)
    const panX = ref<number>(BUILDING_MAP_VIEWPORT_CONSTANTS.DEFAULT_PAN_X)
    const panY = ref<number>(BUILDING_MAP_VIEWPORT_CONSTANTS.DEFAULT_PAN_Y)
    const previewZones = ref<ZoneMapItem[] | null>(null)
    const optimisticZones = ref<ZoneMapItem[] | null>(null)

    const effectiveZones = computed(() =>
        previewZones.value || optimisticZones.value || properties.zones
    )

    const getEffectiveProperties = () => ({
        ...properties,
        zones: optimisticZones.value || properties.zones
    })
    const activeAction = ref<BuildingMapMoveAction | BuildingMapResizeAction | BuildingMapPanAction | null>(null)
    const geometryDependencies = ref<GeometryDependencies | null>(null)
    const blockedGeometryPreview = ref<BlockedGeometryPreview | null>(null)
    const employeeLocations = ref<EmployeeLocation[]>([])
    const activeScannedDoorIds = ref<number[]>([])
    const cloneBlockedGeometryPreview = (
        preview: BlockedGeometryPreview
    ): BlockedGeometryPreview => ({
        ...preview,
        floor: {
            ...preview.floor
        },
        zones: preview.zones.map((zone) => ({
            ...zone
        })),
        doors: preview.doors.map((door) => ({
            ...door
        })),
        positioningZones: preview.positioningZones?.map((zone) => ({
            ...zone
        })),
        fallbackPositioningZones: preview.fallbackPositioningZones?.map((zone) => ({
            ...zone
        })),
        highlightedDoorIds: preview.highlightedDoorIds
            ? [...preview.highlightedDoorIds]
            : preview.highlightedDoorIds
    })

    const setBlockedGeometryPreviewOnce = (preview: BlockedGeometryPreview | null | undefined) => {
        if (!preview || blockedGeometryPreview.value) return

        blockedGeometryPreview.value = cloneBlockedGeometryPreview(preview)
    }
    const hasFocusedInitialMap = ref(false)
    let resizeDependenciesRequestId = 0
    const viewportSyncDebounce = ref<number | null>(null)
    const lastSyncedViewport = ref<ViewportBounds | null>(null)
    const scannedDoorTimeouts = new Map<number, number>()
    let wheelInteractionTimeout: number | null = null
    let unsubscribeLocationListener: (() => void) | null = null
    let mapMoveFrame: number | null = null
    let pendingMapMoveEvent: MouseEvent | null = null
    let postInteractionReleaseTimeout: number | null = null
    let postInteractionIdleCallback: number | null = null

    const isWheelInteracting = ref(false)
    const isPostInteractionSettling = ref(false)
    const areEditHelpersSuspended = ref(false)

    const isResizingMap = computed(() => activeAction.value?.type === BuildingMapActionType.RESIZE)
    const isTransformingZone = computed(() =>
        activeAction.value?.type === BuildingMapActionType.MOVE
        || activeAction.value?.type === BuildingMapActionType.RESIZE
    )
    const isMapInteracting = computed(() => activeAction.value !== null || isWheelInteracting.value)
    const hoveredAddHandleKey = ref('')
    const hoveredAddHandleSnapshot = ref<AddZoneHandle | null>(null)
    const hoveredAddHandleCoordinate = ref<number | null>(null)
    const lastValidAddHandleTransitionSegments = ref<{
        key: string
        segments: BuildingMapTransitionSegment[]
    } | null>(null)
    const isAddZonePending = ref(false)
    let isResizeHandleHovered = false
    const MIN_UNIT_SIZE_FOR_EDIT_HELPERS = 6
    const MAX_EDIT_HELPER_SIDE_SPAN = 36

    const hoveredAddDoorHandleKey = ref('')
    const hoveredAddDoorHandleSnapshot = ref<AddDoorHandle | null>(null)
    const isAddDoorPending = ref(false)
    let addHandleHoverFrame: number | null = null
    let pendingAddHandleHover: { key: string; clientX: number; clientY: number } | null = null
    let pendingAddZoneTimeout: number | null = null
    let pendingAddDoorTimeout: number | null = null

    const visibleEmployeesByZone = computed(() =>
        buildingMapEmployeeService.getVisibleEmployeesByZone(employeeLocations.value)
    )

    const layerStyle = computed(() => ({transform: `translate3d(${panX.value}px, ${panY.value}px, 0)`}))

    const getMapUiScale = () => Math.max(
        0.55,
        Math.min(
            1,
            unitSize.value / BUILDING_MAP_VIEWPORT_CONSTANTS.DEFAULT_UNIT_SIZE
        )
    )

    const mapStyle = computed(() => ({
        '--building-map-unit': `${unitSize.value}px`,
        '--building-map-pan-x': `${panX.value}px`,
        '--building-map-pan-y': `${panY.value}px`,
        '--building-map-ui-scale': `${getMapUiScale()}`
    }))

    const resolvePhotoUrl = (photo: string | null) => buildingMapZoneTransformService.resolvePhotoUrl(photo)

    const startTitleEdit = async (zoneId: number, title: string) => buildingMapTitleEditService.startTitleEdit(
        zoneId,
        title,
        editingZoneId,
        editingZoneTitle,
        titleInputRef
    )

    const setTitleInputRef = (element: Element | ComponentPublicInstance | null) => buildingMapTitleEditService.setTitleInputRef(
        element,
        titleInputRef
    )

    const finishTitleEdit = () => buildingMapTitleEditService.finishTitleEdit(
        properties,
        emit,
        editingZoneId,
        editingZoneTitle
    )

    const cancelTitleEdit = () => buildingMapTitleEditService.cancelTitleEdit(
        editingZoneId,
        editingZoneTitle
    )

    const zoneStyle = (zone: ZoneMapItem) => buildingMapZoneTransformService.getZoneStyle(zone, unitSize.value)

    const areZoneActionsVisible = (zone: ZoneMapItem) =>
        properties.mode === BuildingMapMode.EDIT
        && (zone.floor_id === properties.currentFloorId || zone.is_transition_between_floors)
        && !properties.isEditingZone
        && editingZoneId.value === 0
        && !isMapInteracting.value

    const zoneTitleStyle = (zone: ZoneMapItem) => buildingMapZoneTransformService.getZoneTitleStyle(
        zone,
        unitSize.value,
        properties.mode === BuildingMapMode.VIEW,
        areZoneActionsVisible(zone)
    )

    const zoneActionStyle = (zone: ZoneMapItem) => buildingMapZoneTransformService.getZoneActionStyle(zone, unitSize.value)

    const isZonePreviewed = (zoneId: number) => buildingMapGeometryService.isZonePreviewed(
        zoneId,
        previewZones.value,
        optimisticZones.value || properties.zones
    )

    let employeeLocationsRequestId = 0

    const fetchEmployeeLocations = async () => {
        const requestId = ++employeeLocationsRequestId
        const floorId = properties.currentFloorId

        if (floorId === 0 || properties.mode !== BuildingMapMode.VIEW) {
            employeeLocations.value = []
            return
        }

        try {
            const response = await buildingRepository.getCurrentEmployeeLocations(
                floorId,
                properties.viewport
            )

            if (
                requestId !== employeeLocationsRequestId ||
                floorId !== properties.currentFloorId ||
                properties.mode !== BuildingMapMode.VIEW
            ) return

            employeeLocations.value = response.data
        } catch {
            if (
                requestId !== employeeLocationsRequestId ||
                floorId !== properties.currentFloorId
            ) return

            employeeLocations.value = []
        }
    }

    const updateVisibleLocationsFromSocket = (payload: EmployeeLocationSocketPayload) => {
        employeeLocations.value = employeeLocations.value.filter((item) => item.employee_id !== payload.employee_id)
        if (payload.floor_id !== properties.currentFloorId || payload.zone_id === null) return
        if (!properties.zones.some((zone) => zone.zone_id === payload.zone_id)) return

        employeeLocations.value = [
            {
                employee_id: payload.employee_id,
                zone_id: payload.zone_id,
                full_name: payload.full_name,
                email: payload.email,
                photo: buildingEmployeePhotoService.resolveEmployeePhotoUrl(payload.photo)
            },
            ...employeeLocations.value
        ]
    }

    const flashScannedDoor = (doorId: number) => {
        if (doorId <= 0) return

        activeScannedDoorIds.value = [...new Set([...activeScannedDoorIds.value, doorId])]
        const existingTimeout = scannedDoorTimeouts.get(doorId)
        if (existingTimeout !== undefined) window.clearTimeout(existingTimeout)

        const timeout = window.setTimeout(() => {
            activeScannedDoorIds.value = activeScannedDoorIds.value.filter((item) => item !== doorId)
            scannedDoorTimeouts.delete(doorId)
        }, BUILDING_REALTIME_LOCATION_CONSTANTS.SCANNED_DOOR_FLASH_MS)
        scannedDoorTimeouts.set(doorId, timeout)
    }

    const handleEmployeeLocationChange = (payload: EmployeeLocationSocketPayload) => {
        if (properties.mode !== BuildingMapMode.VIEW) return
        flashScannedDoor(payload.door_id)
        updateVisibleLocationsFromSocket(payload)
    }

    const syncViewport = () => buildingMapViewportControllerService.syncViewport({
        mapRef,
        unitSize,
        panX,
        panY,
        properties,
        emit,
        lastSyncedViewport,
        viewportSyncDebounce
    })

    const clampValue = (value: number, min: number, max: number) => (
        buildingMapGeometryService.clampValue(value, min, max)
    )

    const applyPan = (nextPanX: number, nextPanY: number) => buildingMapViewportControllerService.applyPan(
        panX,
        panY,
        nextPanX,
        nextPanY
    )

    const applyPanToDom = (nextPanX: number, nextPanY: number) => {
        mapRef.value?.style.setProperty('--building-map-pan-x', `${nextPanX}px`)
        mapRef.value?.style.setProperty('--building-map-pan-y', `${nextPanY}px`)

        if (gridRef.value) {
            gridRef.value.style.backgroundPosition = [
                `${nextPanX}px ${nextPanY}px`,
                `${nextPanX}px ${nextPanY}px`,
                `${nextPanX}px ${nextPanY}px`,
                `${nextPanX}px ${nextPanY}px`
            ].join(', ')
        }

        if (layerRef.value) {
            layerRef.value.style.transform = `translate3d(${nextPanX}px, ${nextPanY}px, 0)`
        }
    }

    const scheduleViewportSync = () => buildingMapViewportControllerService.scheduleViewportSync({
        mapRef,
        unitSize,
        panX,
        panY,
        properties,
        emit,
        lastSyncedViewport,
        viewportSyncDebounce
    })

    const getDoorsSource = () => buildingMapSourceService.getDoorsSourceForMap(
        geometryDependencies.value,
        getEffectiveProperties()
    )

    const getZonesSource = () => buildingMapSourceService.getZonesSourceForMap(
        geometryDependencies.value,
        getEffectiveProperties()
    )

    const getRegularAddBlockingZonesSource = () => buildingMapSourceService.getRegularAddBlockingZonesSourceForMap(
        geometryDependencies.value,
        getEffectiveProperties()
    )

    const getRegularAddDoorsSource = () => buildingMapSourceService.getRegularAddDoorsSourceForMap(
        geometryDependencies.value,
        getEffectiveProperties()
    )

    const getProjectedRegularAddZonesSource = () => buildingMapSourceService.getProjectedRegularAddZonesSourceForMap(
        geometryDependencies.value,
        getEffectiveProperties()
    )

    const getAddZoneSourceZones = () => buildingMapSourceService.getAddZoneSourceZonesForMap(
        geometryDependencies.value,
        getEffectiveProperties()
    )

    const getAddCandidateGeometry = (
        zone: ZoneMapItem,
        side: 'left' | 'right' | 'top' | 'bottom',
        segment: BuildingMapSegment,
        outward: number
    ) => buildingMapFreeSideSliceService.getAddCandidateGeometry(
        zone,
        side,
        segment,
        outward
    )

    const transitionValidationZonesSource = computed(() => buildingMapSourceService.mergeTransitionZones(
        properties.transitionValidationZones,
        getZonesSource()
    ))

    const transitionValidationDoorsSource = computed(() => buildingMapSourceService.mergeTransitionDoors(
        properties.transitionValidationDoors,
        getDoorsSource()
    ))

    const otherFloorEntranceDoorChecks = computed(() => (
        buildingMapOtherFloorEntranceDoorAuraService.getOtherFloorEntranceDoorChecks(
            transitionValidationZonesSource.value,
            transitionValidationDoorsSource.value,
            properties.currentFloorId
        )
    ))

    const getOtherFloorEntranceDoorAuraAdjustedTransitionSegments = (
        sourceZone: ZoneMapItem,
        sourceSide: 'left' | 'right' | 'top' | 'bottom',
        transitionSegments: BuildingMapTransitionSegment[],
        candidateRect: BuildingMapRectangle,
        sourceZones: ZoneMapItem[],
        sourceDoors: DoorMapItem[],
        otherFloorEntranceDoorChecks: BuildingMapEntranceDoorCheck[],
        preferredCoordinate: number | null = null
    ) => buildingMapOtherFloorEntranceDoorAuraService.getOtherFloorEntranceDoorAuraAdjustedTransitionSegments({
        sourceZone,
        sourceSide,
        transitionSegments,
        candidateRect,
        sourceZones,
        sourceDoors,
        otherFloorEntranceDoorChecks,
        preferredCoordinate
    })

    const getEntranceDoorsCountOnSide = (
        zone: ZoneMapItem,
        side: 'left' | 'right' | 'top' | 'bottom',
        floorId = properties.currentFloorId,
        sourceDoors: DoorMapItem[] = getDoorsSource()
    ) => buildingMapEntranceDoorPlacementContextService.getEntranceDoorsCountOnSide(
        zone,
        side,
        floorId,
        sourceDoors
    )

    const getFreeSideSlices = (
        zone: ZoneMapItem,
        side: 'left' | 'right' | 'top' | 'bottom',
        sourceZones: ZoneMapItem[]
    ) => buildingMapFreeSideSliceService.getFreeSideSlices(
        zone,
        side,
        sourceZones
    )

    const normalizeHybridAddField = (
        regularSegment: BuildingMapSegment,
        transitionSegments: Array<BuildingMapTransitionSegment>,
        blockedTransitionSegments: Array<BuildingMapSegment> = []
    ) => buildingMapTransitionService.normalizeHybridAddField(
        regularSegment,
        transitionSegments,
        blockedTransitionSegments
    )

    const getTransitionSegmentsSignature = (
        transitionSegments: BuildingMapTransitionSegment[]
    ) => buildingMapAddHandleService.getTransitionSegmentsSignature(
        transitionSegments
    )

    const findBestValidAddCandidate = (
        zone: ZoneMapItem,
        side: 'left' | 'right' | 'top' | 'bottom',
        segment: BuildingMapSegment,
        freeSegments: BuildingMapSegment[],
        doorsCount: number,
        maxOutward: number,
        sourceZones: ZoneMapItem[],
        sourceDoors: DoorMapItem[]
    ) => buildingMapAddHandleService.findBestValidAddCandidate({
        zone,
        side,
        segment,
        freeSegments,
        doorsCount,
        maxOutward,
        sourceZones,
        sourceDoors,
        currentFloorId: properties.currentFloorId
    })

    const createAddSegmentsForFreeSlice = (
        zone: ZoneMapItem,
        side: 'left' | 'right' | 'top' | 'bottom',
        slice: BuildingMapSegment,
        doorsCount: number,
        sourceZones: ZoneMapItem[],
        sourceDoors: DoorMapItem[]
    ) => buildingMapAddHandleService.createAddSegmentsForFreeSlice({
        zone,
        side,
        slice,
        doorsCount,
        sourceZones,
        sourceDoors,
        currentFloorId: properties.currentFloorId
    })

    const getVisibleSideSlice = (
        side: 'left' | 'right' | 'top' | 'bottom',
        slice: BuildingMapSegment,
        viewport: ViewportBounds
    ): BuildingMapSegment | null => {
        const helperMargin = BUILDING_MAP_GEOMETRY_CONSTANTS.MAX_ADDED_ZONE_SIDE
            + BUILDING_MAP_GEOMETRY_CONSTANTS.MIN_ZONE_SIZE
        const viewportSegment = side === 'left' || side === 'right'
            ? {
                start: viewport.y - helperMargin,
                end: viewport.y + viewport.height + helperMargin
            }
            : {
                start: viewport.x - helperMargin,
                end: viewport.x + viewport.width + helperMargin
            }
        const start = Math.max(slice.start, Math.floor(viewportSegment.start))
        const end = Math.min(slice.end, Math.ceil(viewportSegment.end))

        if (end - start < BUILDING_MAP_GEOMETRY_CONSTANTS.MIN_ZONE_SIZE) return null

        if (end - start <= MAX_EDIT_HELPER_SIDE_SPAN) {
            return { start, end }
        }

        const viewportCenter = (viewportSegment.start + viewportSegment.end) / 2
        const clampedCenter = buildingMapGeometryService.clampValue(
            viewportCenter,
            start + MAX_EDIT_HELPER_SIDE_SPAN / 2,
            end - MAX_EDIT_HELPER_SIDE_SPAN / 2
        )

        return {
            start: Math.floor(clampedCenter - MAX_EDIT_HELPER_SIDE_SPAN / 2),
            end: Math.ceil(clampedCenter + MAX_EDIT_HELPER_SIDE_SPAN / 2)
        }
    }

    const baseAddZoneHandles = computed(() => {
        if (
            properties.mode === BuildingMapMode.VIEW
            || isMapInteracting.value
            || isPostInteractionSettling.value
            || areEditHelpersSuspended.value
            || properties.isEditingZone
            || unitSize.value < MIN_UNIT_SIZE_FOR_EDIT_HELPERS
        ) return []

        const handles: AddZoneHandle[] = []

        const regularBlockingZones = getRegularAddBlockingZonesSource()
        const regularDoors = getRegularAddDoorsSource()
        const projectedRegularZones = getProjectedRegularAddZonesSource()
        const currentViewport = buildingMapViewportControllerService.getViewport(
            mapRef,
            unitSize,
            panX,
            panY,
            properties
        )
        const zones = getAddZoneSourceZones().filter((zone) =>
            buildingMapViewportControllerService.doesViewportContainZone(currentViewport, zone)
        )
        const auraSourceZones = transitionValidationZonesSource.value
        const auraSourceDoors = transitionValidationDoorsSource.value
        const cachedOtherFloorEntranceDoorChecks = otherFloorEntranceDoorChecks.value

        for (const zone of zones) {
            const sides = buildingMapSideService.sides

            for (const side of sides) {
                const slices = getFreeSideSlices(zone, side, regularBlockingZones)
                const doorsCount = getEntranceDoorsCountOnSide(
                    zone,
                    side,
                    properties.currentFloorId,
                    regularDoors
                )

                for (const slice of slices) {
                    const visibleSlice = getVisibleSideSlice(side, slice, currentViewport)
                    if (!visibleSlice) continue

                    const addSegments = createAddSegmentsForFreeSlice(
                        zone,
                        side,
                        visibleSlice,
                        doorsCount,
                        regularBlockingZones,
                        regularDoors
                    )

                    const sliceHandles: typeof handles = []

                    for (const {addSegment, doorSegments} of addSegments) {
                        void doorSegments

                        const maxOutward = Math.min(
                            BUILDING_MAP_GEOMETRY_CONSTANTS.MAX_ADDED_ZONE_SIDE,
                            buildingMapTransitionService.getAvailableOutwardDepth(
                                zone,
                                side,
                                addSegment.start,
                                addSegment.end,
                                regularBlockingZones
                            )
                        )

                        if (maxOutward < BUILDING_MAP_GEOMETRY_CONSTANTS.MIN_ZONE_SIZE) continue

                        const candidate = findBestValidAddCandidate(
                            zone,
                            side,
                            addSegment,
                            slices,
                            doorsCount,
                            maxOutward,
                            regularBlockingZones,
                            regularDoors
                        )

                        if (!candidate) continue

                        const doorCollisionCandidate = getAddCandidateGeometry(
                            zone,
                            side,
                            candidate.segment,
                            candidate.outward
                        )

                        const rawTransitionSegments = buildingMapTransitionService.getTransitionSegmentsForCandidate(
                            zone,
                            side,
                            candidate.segment,
                            candidate.outward,
                            projectedRegularZones
                        )

                        const baseHybridField = normalizeHybridAddField(
                            candidate.segment,
                            rawTransitionSegments
                        )

                        if (!baseHybridField) continue
                        getAddCandidateGeometry(
                            zone,
                            side,
                            baseHybridField.segment,
                            candidate.outward
                        );

                        const auraAdjustedTransition = getOtherFloorEntranceDoorAuraAdjustedTransitionSegments(
                            zone,
                            side,
                            baseHybridField.transitionSegments,
                            doorCollisionCandidate.rect,
                            auraSourceZones,
                            auraSourceDoors,
                            cachedOtherFloorEntranceDoorChecks
                        )

                        const hybridField = normalizeHybridAddField(
                            baseHybridField.segment,
                            auraAdjustedTransition.transitionSegments,
                            auraAdjustedTransition.blockedSegments
                        )

                        if (!hybridField) continue
                        getAddCandidateGeometry(
                            zone,
                            side,
                            hybridField.segment,
                            candidate.outward
                        );

                        const candidateLength = hybridField.segment.end - hybridField.segment.start
                        const transitionSegments = hybridField.transitionSegments

                        const canCreateTransition = transitionSegments.length > 0
                        const largestTransitionLength = transitionSegments.reduce(
                            (largest, item) => Math.max(largest, item.end - item.start),
                            0
                        )
                        const largestTransitionOutward = transitionSegments.reduce(
                            (largest, item) => Math.max(largest, item.outward),
                            0
                        )

                        const transitionMode: AddZoneHandle['transitionMode'] = !canCreateTransition
                            ? 'none'
                            : largestTransitionLength >= candidateLength && largestTransitionOutward >= candidate.outward
                                ? 'full'
                                : 'partial'

                        const handleSize = Math.max(candidateLength, 2)
                        const center = buildingMapAddHandleService.getHandleCenter(
                            side,
                            zone,
                            hybridField.segment
                        )
                        const style = buildingMapAddHandleService.getHandleStyle(center, handleSize)
                        const probeStyle = buildingMapAddHandleService.getProbeStyle(
                            side,
                            center,
                            handleSize
                        )

                        const handleKey = `${zone.zone_id}:${side}:${hybridField.segment.start}:${hybridField.segment.end}`

                        const regularPayload: BuildingMapRegularZonePayload = {
                            zone_from_id: zone.zone_id,
                            side,
                            x_coordinate: Math.round(doorCollisionCandidate.rect.x),
                            y_coordinate: Math.round(doorCollisionCandidate.rect.y),
                            width: Math.max(
                                BUILDING_MAP_GEOMETRY_CONSTANTS.MIN_ZONE_SIZE,
                                Math.round(doorCollisionCandidate.rect.width)
                            ),
                            height: Math.max(
                                BUILDING_MAP_GEOMETRY_CONSTANTS.MIN_ZONE_SIZE,
                                Math.round(doorCollisionCandidate.rect.height)
                            ),
                            title: properties.newZoneTitle,
                            can_create_transition: false,
                            creation_mode: 'regular'
                        }

                        const rawTransitionPayload = transitionSegments.length > 0
                            ? buildingMapTransitionService.createPayloadForSegment(
                                {
                                    side,
                                    payload: {
                                        ...regularPayload,
                                        can_create_transition: true
                                    }
                                },
                                transitionSegments[0]
                            )
                            : null

                        const transitionPayload: BuildingMapTransitionZonePayload | undefined = rawTransitionPayload
                            ? {
                                zone_from_id: rawTransitionPayload.zone_from_id,
                                side: rawTransitionPayload.side,
                                x_coordinate: rawTransitionPayload.x_coordinate,
                                y_coordinate: rawTransitionPayload.y_coordinate,
                                width: rawTransitionPayload.width,
                                height: rawTransitionPayload.height,
                                title: rawTransitionPayload.title,
                                can_create_transition: true,
                                creation_mode: 'transition',
                                transition_geometry: rawTransitionPayload.transition_geometry!
                            }
                            : undefined

                        sliceHandles.push({
                            key: handleKey,
                            zoneId: zone.zone_id,
                            side,
                            style,
                            probeStyle,
                            sliceStart: hybridField.segment.start,
                            sliceEnd: hybridField.segment.end,
                            doorSegments: candidate.doorSegments,
                            doorPlacementSignature: candidate.doorPlacementSignature,
                            doorPlacementSplitScore: candidate.doorPlacementSplitScore,
                            canCreateTransition,
                            transitionMode,
                            transitionSignature: getTransitionSegmentsSignature(transitionSegments),
                            transitionSegments: transitionSegments.map((segment) => ({
                                ...segment,
                                style: buildingMapTransitionService.getAddHandleSegmentStyle(side, hybridField.segment, segment)
                            })),
                            sourceZone: zone,
                            baseSegment: baseHybridField.segment,
                            baseTransitionSegments: baseHybridField.transitionSegments,
                            payload: {
                                ...regularPayload,
                                can_create_transition: canCreateTransition,
                                creation_mode: transitionMode === 'partial'
                                    ? 'hybrid'
                                    : transitionMode === 'full'
                                        ? 'transition'
                                        : 'regular',
                                regular_payload: regularPayload,
                                transition_payload: transitionPayload,
                                door_collision_geometry: {
                                    x_coordinate: Math.round(doorCollisionCandidate.rect.x),
                                    y_coordinate: Math.round(doorCollisionCandidate.rect.y),
                                    width: Math.max(
                                        BUILDING_MAP_GEOMETRY_CONSTANTS.MIN_ZONE_SIZE,
                                        Math.round(doorCollisionCandidate.rect.width)
                                    ),
                                    height: Math.max(
                                        BUILDING_MAP_GEOMETRY_CONSTANTS.MIN_ZONE_SIZE,
                                        Math.round(doorCollisionCandidate.rect.height)
                                    )
                                }
                            }
                        })
                    }

                    const filteredSliceHandles = sliceHandles.filter((currentHandle) => {
                        const currentLength = currentHandle.sliceEnd - currentHandle.sliceStart

                        return !sliceHandles.some((otherHandle) => {
                            if (otherHandle.key === currentHandle.key) return false

                            const otherLength = otherHandle.sliceEnd - otherHandle.sliceStart

                            return otherLength > currentLength
                                && otherHandle.doorPlacementSignature === currentHandle.doorPlacementSignature
                                && otherHandle.doorPlacementSplitScore === currentHandle.doorPlacementSplitScore
                                && otherHandle.transitionSignature === currentHandle.transitionSignature
                                && otherHandle.sliceStart <= currentHandle.sliceStart + BUILDING_MAP_GEOMETRY_CONSTANTS.EPSILON
                                && otherHandle.sliceEnd >= currentHandle.sliceEnd - BUILDING_MAP_GEOMETRY_CONSTANTS.EPSILON
                        })
                    })

                    handles.push(...filteredSliceHandles)
                }
            }
        }

        return handles
    })

    const getCursorAdjustedAddHandle = (
        handle: AddZoneHandle
    ) => {
        const auraSourceZones = transitionValidationZonesSource.value
        const auraSourceDoors = transitionValidationDoorsSource.value

        return buildingMapAddHandleService.getCursorAdjustedAddHandle({
            handle,
            hoveredCoordinate: hoveredAddHandleCoordinate.value,
            auraSourceZones,
            auraSourceDoors,
            otherFloorEntranceDoorChecks: otherFloorEntranceDoorChecks.value,
            fallbackTransitionSegments: lastValidAddHandleTransitionSegments.value?.key === handle.key
                ? lastValidAddHandleTransitionSegments.value.segments
                : []
        })
    }

    const hoveredAddHandle = computed(() => {
        const snapshot = hoveredAddHandleSnapshot.value
        if (!snapshot) return null

        const baseHandle = baseAddZoneHandles.value.find((handle) => handle.key === hoveredAddHandleKey.value)
            || snapshot

        const shiftedHandle = buildingMapAddHandleService.getWholeAddHandleShiftCandidate(
            baseAddZoneHandles.value,
            baseHandle,
            hoveredAddHandleCoordinate.value
        )

        const adjustedHandle = getCursorAdjustedAddHandle(shiftedHandle)

        if (adjustedHandle.transitionSegments.length > 0) {
            lastValidAddHandleTransitionSegments.value = {
                key: adjustedHandle.key,
                segments: adjustedHandle.transitionSegments.map((segment) => ({
                    start: segment.start,
                    end: segment.end,
                    outward: segment.outward
                }))
            }
        }

        return adjustedHandle
    })

    const transitionPreviewHandle = computed(() => {
        const handle = hoveredAddHandle.value

        if (!handle || !handle.canCreateTransition || handle.transitionSegments.length === 0) {
            return null
        }

        return handle
    })

    const renderedZones = computed(() => {
        const shouldShowCrossFloorContext = previewZones.value !== null || transitionPreviewHandle.value !== null
        const sourceZones = buildingMapSourceService
            .getRenderedZonesSource(
                previewZones.value,
                optimisticZones.value || properties.zones,
                properties.transitionValidationZones,
                transitionPreviewHandle.value
            )
            .filter((zone) =>
                shouldShowCrossFloorContext ||
                zone.floor_id === properties.currentFloorId ||
                zone.is_transition_between_floors
            )

        if (previewZones.value) return sourceZones

        const currentViewport = buildingMapViewportControllerService.getViewport(
            mapRef,
            unitSize,
            panX,
            panY,
            properties
        )

        return sourceZones.filter((zone) =>
            buildingMapViewportControllerService.doesViewportContainZone(currentViewport, zone)
        )
    })

    const zonePhotoUrl = (zone: ZoneMapItem) => {
        const isCrossFloorPreview = previewZones.value !== null || transitionPreviewHandle.value !== null

        if (
            isCrossFloorPreview
            && zone.floor_id !== properties.currentFloorId
            && !zone.is_transition_between_floors
        ) return null

        return resolvePhotoUrl(zone.photo)
    }

    const renderedDoors = computed<RenderedDoor[]>(() => {
        const activeAddHandle = hoveredAddHandle.value
        const transitionAddHandle = transitionPreviewHandle.value

        const baseHandlesForDoorPositioning = activeAddHandle
            ? baseAddZoneHandles.value
            : []

        const realDoors = buildingMapSourceService.getRealDoorsSource(
            getDoorsSource(),
            properties.transitionValidationDoors,
            transitionAddHandle
        )

        const doorsForPositioning = buildingMapSourceService.getDoorsForPositioning(
            realDoors,
            hoveredAddDoorHandle.value
        )

        return realDoors
            .filter((door) => door.door_id > 0)
            .map((door) => buildingMapRenderedDoorService.createRenderedDoor({
                door,
                renderedZones: renderedZones.value,
                doorsForPositioning,
                currentFloorId: properties.currentFloorId,
                unitSize: unitSize.value,
                hoveredAddHandle: activeAddHandle,
                baseAddZoneHandles: baseHandlesForDoorPositioning,
                hoveredAddHandleCoordinate: hoveredAddHandleCoordinate.value
            }))
            .filter((door): door is RenderedDoor => door !== null)
    })

    const getAddZoneHandles = computed(() => {
        const activeHandle = hoveredAddHandle.value

        if (!activeHandle) return baseAddZoneHandles.value

        return baseAddZoneHandles.value
            .filter((handle) =>
                handle.key === activeHandle.key
                || handle.zoneId !== activeHandle.zoneId
                || handle.side !== activeHandle.side
                || !buildingMapAddHandleService.doSegmentsOverlap(
                    {
                        start: handle.sliceStart,
                        end: handle.sliceEnd
                    },
                    {
                        start: activeHandle.sliceStart,
                        end: activeHandle.sliceEnd
                    }
                )
            )
            .map((handle) =>
                handle.key === activeHandle.key
                    ? activeHandle
                    : handle
            )
    })

    const editableActionZones = computed(() => {
        return renderedZones.value.filter((item) =>
            properties.mode === BuildingMapMode.EDIT
            && (item.floor_id === properties.currentFloorId || item.is_transition_between_floors)
            && !properties.isEditingZone
            && editingZoneId.value === 0
            && !isMapInteracting.value
        )
    })

    const applyResizeDelta = (
        zone: ZoneMapItem,
        edge: BuildingMapResizeEdge,
        deltaX: number,
        deltaY: number,
        updateBlockedPreview = true
    ) => {
        const result = buildingMapZoneTransformService.getResizePreview({
            zone,
            edge,
            deltaX,
            deltaY,
            zones: getZonesSource().map((item) => ({...item})),
            doors: getDoorsSource(),
            geometryDependencies: geometryDependencies.value,
            blockedZoneCollisionMessage: properties.blockedZoneCollisionMessage,
            blockedDoorBetweenMessage: properties.blockedDoorBetweenMessage,
            blockedEntranceDoorMessage: properties.blockedEntranceDoorMessage,
            newZoneTitle: properties.newZoneTitle,
            shouldBuildBlockedPreview: updateBlockedPreview
        })

        if (blockedGeometryPreview.value) {
            if (result.zones) {
                blockedGeometryPreview.value = null
                return result.zones
            }

            return null
        }

        if (result.blockedGeometryPreview) {
            return null
        }

        if (updateBlockedPreview && result.zones) {
            blockedGeometryPreview.value = null
        }

        return result.zones
    }

    const clampResizeDelta = (
        action: {
            zone: ZoneMapItem
            edge: BuildingMapResizeEdge
            lastValidDeltaX: number
            lastValidDeltaY: number
        },
        deltaX: number,
        deltaY: number
    ) => {
        if (blockedGeometryPreview.value) return

        const result = buildingMapZoneTransformService.clampResizeDelta({
            action,
            deltaX,
            deltaY,
            zones: getZonesSource().map((item) => ({...item})),
            doors: getDoorsSource(),
            geometryDependencies: geometryDependencies.value,
            blockedZoneCollisionMessage: properties.blockedZoneCollisionMessage,
            blockedDoorBetweenMessage: properties.blockedDoorBetweenMessage,
            blockedEntranceDoorMessage: properties.blockedEntranceDoorMessage,
            newZoneTitle: properties.newZoneTitle
        })

        if (!result) return

        action.lastValidDeltaX = result.lastValidDeltaX
        action.lastValidDeltaY = result.lastValidDeltaY
        previewZones.value = result.zones

        setBlockedGeometryPreviewOnce(result.blockedGeometryPreview)
    }

    const startMove = (event: MouseEvent, zone: ZoneMapItem) => {
        if (properties.mode === BuildingMapMode.VIEW) return
        if (event.button !== 0) return
        event.stopPropagation()
        blockedGeometryPreview.value = null
        clearHoveredAddHandle()
        clearHoveredAddDoorHandle()
        activeAction.value = buildingMapZoneTransformService.createMoveAction(event, zone)
        previewZones.value = effectiveZones.value.map((item) => ({...item}))
        const requestId = ++resizeDependenciesRequestId
        buildingRepository.getZoneGeometryDependencies(zone.zone_id)
            .then((response) => {
                if (requestId !== resizeDependenciesRequestId || activeAction.value?.type !== BuildingMapActionType.MOVE) return
                geometryDependencies.value = response.data
                const currentPreview = previewZones.value || properties.zones
                previewZones.value = buildingMapZoneTransformService.mergeDependencyZonesWithPreview(
                    response.data.zones,
                    currentPreview
                )
                const action = activeAction.value
                if (action?.type !== BuildingMapActionType.MOVE) return
                action.hasLoadedDependencies = true
                const result = buildingMapZoneTransformService.getMovePreview({
                    zones: getZonesSource().map((item) => ({...item})),
                    deltaX: action.currentDeltaX,
                    deltaY: action.currentDeltaY,
                    doors: getDoorsSource(),
                    geometryDependencies: geometryDependencies.value,
                    blockedZoneCollisionMessage: properties.blockedZoneCollisionMessage,
                    blockedDoorBetweenMessage: properties.blockedDoorBetweenMessage,
                    blockedEntranceDoorMessage: properties.blockedEntranceDoorMessage,
                    newZoneTitle: properties.newZoneTitle,
                    shouldBuildBlockedPreview: true
                })
                if (result.zones) {
                    action.lastValidDeltaX = action.currentDeltaX
                    action.lastValidDeltaY = action.currentDeltaY
                    previewZones.value = result.zones
                    blockedGeometryPreview.value = null
                } else if (result.blockedGeometryPreview) {
                    const clamped = buildingMapZoneTransformService.clampMoveDelta({
                        action,
                        deltaX: action.currentDeltaX,
                        deltaY: action.currentDeltaY,
                        zones: getZonesSource().map((item) => ({...item})),
                        doors: getDoorsSource(),
                        geometryDependencies: geometryDependencies.value,
                        blockedZoneCollisionMessage: properties.blockedZoneCollisionMessage,
                        blockedDoorBetweenMessage: properties.blockedDoorBetweenMessage,
                        blockedEntranceDoorMessage: properties.blockedEntranceDoorMessage,
                        newZoneTitle: properties.newZoneTitle
                    })

                    if (clamped) {
                        action.lastValidDeltaX = clamped.lastValidDeltaX
                        action.lastValidDeltaY = clamped.lastValidDeltaY
                        previewZones.value = clamped.zones
                        setBlockedGeometryPreviewOnce(clamped.blockedGeometryPreview || result.blockedGeometryPreview)
                    } else {
                        setBlockedGeometryPreviewOnce(result.blockedGeometryPreview)
                    }
                }
            })
            .catch(() => {
                if (requestId !== resizeDependenciesRequestId || activeAction.value?.type !== BuildingMapActionType.MOVE) return
                geometryDependencies.value = null
                activeAction.value.hasLoadedDependencies = true
            })
    }

    const startResize = (
        event: MouseEvent,
        zone: ZoneMapItem,
        edge: BuildingMapResizeEdge
    ) => {
        if (properties.mode === BuildingMapMode.VIEW) return
        if (event.button !== 0) return
        event.stopPropagation()
        blockedGeometryPreview.value = null
        clearHoveredAddHandle()
        clearHoveredAddDoorHandle()
        activeAction.value = buildingMapZoneTransformService.createResizeAction(event, zone, edge)
        previewZones.value = effectiveZones.value.map((item) => ({...item}))
        const requestId = ++resizeDependenciesRequestId
        buildingRepository.getZoneGeometryDependencies(zone.zone_id)
            .then((response) => {
                if (requestId !== resizeDependenciesRequestId || activeAction.value?.type !== BuildingMapActionType.RESIZE) return
                geometryDependencies.value = response.data
                const currentPreview = previewZones.value || properties.zones
                previewZones.value = buildingMapZoneTransformService.mergeDependencyZonesWithPreview(
                    response.data.zones,
                    currentPreview
                )
                const action = activeAction.value
                if (action?.type !== BuildingMapActionType.RESIZE) return
                action.hasLoadedDependencies = true
                const candidate = applyResizeDelta(action.zone, action.edge, action.currentDeltaX, action.currentDeltaY)
                if (candidate) {
                    action.lastValidDeltaX = action.currentDeltaX
                    action.lastValidDeltaY = action.currentDeltaY
                    previewZones.value = candidate
                    return
                }
                clampResizeDelta(action, action.currentDeltaX, action.currentDeltaY)
            })
            .catch(() => {
                if (requestId !== resizeDependenciesRequestId || activeAction.value?.type !== BuildingMapActionType.RESIZE) return
                geometryDependencies.value = null
                activeAction.value.hasLoadedDependencies = true
            })
    }

    const startPan = (event: MouseEvent) => {
        if (event.button !== 0) return
        clearHoveredAddHandle()
        clearHoveredAddDoorHandle()
        activeAction.value = buildingMapZoneTransformService.createPanAction(event, panX.value, panY.value)
    }

    const handleMapMouseDown = (event: MouseEvent) => {
        if (editingZoneId.value > 0) {
            finishTitleEdit()
            return
        }
        startPan(event)
    }

    const clearMapHoverState = () => {
        clearHoveredAddHandle()
        clearHoveredAddDoorHandle()
        isResizeHandleHovered = false
    }

    const setResizeHandleHover = (isHovered: boolean) => {
        if (hoveredAddDoorHandleKey.value || hoveredAddHandleKey.value) {
            isResizeHandleHovered = false
            return
        }

        isResizeHandleHovered = isHovered

        if (isHovered) {
            clearHoveredAddHandle()
        }
    }

    const clearStaleAddHandleHover = (event: MouseEvent) => {
        if (!hoveredAddHandleKey.value && !hoveredAddDoorHandleKey.value) return

        const target = event.target
        if (!(target instanceof Element)) {
            clearMapHoverState()
            return
        }

        if (target.closest('.building-map-add-zone-probe, .building-map-add-zone-handle, .building-map-add-door-handle')) return

        clearMapHoverState()
    }

    const uploadZonePhoto = (zoneId: number, event: Event) => {
        const input = event.target as HTMLInputElement
        const file = input.files?.[0]
        if (file && file.type.startsWith(IMAGE_UPLOAD_CONSTANTS.ACCEPT.replace('*', ''))) {
            emit(Events.UPDATE_ZONE_PHOTO, zoneId, file)
        }
        input.value = ''
    }

    const handleDeleteZone = (zoneId: number) => {
        emit(Events.DELETE_ZONE, zoneId)
    }

    const handleZonePhotoUpdate = (zoneId: number, file: File) => {
        emit(Events.UPDATE_ZONE_PHOTO, zoneId, file)
    }

    const handleDeleteDoor = (doorId: number, isEntrance: boolean) => {
        emit(Events.DELETE_DOOR, doorId, isEntrance)
    }

    const handleOpenDoorReader = (doorId: number) => {
        emit(Events.OPEN_DOOR_READER, doorId)
    }

    const getClampedMapPointer = (event: MouseEvent) => {
        const rect = mapRef.value?.getBoundingClientRect()
        if (!rect) return null

        return {
            clientX: clampValue(event.clientX, rect.left, rect.right),
            clientY: clampValue(event.clientY, rect.top, rect.bottom),
            isInside: event.clientX >= rect.left
                && event.clientX <= rect.right
                && event.clientY >= rect.top
                && event.clientY <= rect.bottom
        }
    }

    const cancelActiveMapAction = () => {
        activeAction.value = null
        previewZones.value = null
        geometryDependencies.value = null
        blockedGeometryPreview.value = null
        resizeDependenciesRequestId += 1
    }

    const getResizePreviewSignature = (
        action: BuildingMapResizeAction,
        deltaX: number,
        deltaY: number
    ) => {
        let nextX = action.startX
        let nextY = action.startY
        let nextWidth = action.startWidth
        let nextHeight = action.startHeight

        if (action.edge.includes('left')) {
            nextX = action.startX + deltaX
            nextWidth = action.startWidth - deltaX
        }

        if (action.edge.includes('right')) {
            nextWidth = action.startWidth + deltaX
        }

        if (action.edge.includes('top')) {
            nextY = action.startY + deltaY
            nextHeight = action.startHeight - deltaY
        }

        if (action.edge.includes('bottom')) {
            nextHeight = action.startHeight + deltaY
        }

        return [
            action.hasLoadedDependencies ? 'deps' : 'base',
            Math.round(nextX),
            Math.round(nextY),
            Math.max(BUILDING_MAP_GEOMETRY_CONSTANTS.MIN_ZONE_SIZE, Math.round(nextWidth)),
            Math.max(BUILDING_MAP_GEOMETRY_CONSTANTS.MIN_ZONE_SIZE, Math.round(nextHeight))
        ].join(':')
    }

    const getMovePreviewSignature = (
        action: BuildingMapMoveAction,
        deltaX: number,
        deltaY: number
    ) => [
        action.hasLoadedDependencies ? 'deps' : 'base',
        Math.round(action.startX + deltaX),
        Math.round(action.startY + deltaY)
    ].join(':')

    const processMouseMove = (event: MouseEvent) => {
        const action = activeAction.value
        if (!action) return

        const pointer = getClampedMapPointer(event)
        if (!pointer) return

        if (action.type === BuildingMapActionType.PAN) {
            if (!pointer.isInside) {
                panX.value = action.currentPanX
                panY.value = action.currentPanY
                activeAction.value = null
                syncViewport()
                return
            }

            const nextPanX = action.startPanX + event.clientX - action.startClientX
            const nextPanY = action.startPanY + event.clientY - action.startClientY
            action.currentPanX = nextPanX
            action.currentPanY = nextPanY
            applyPanToDom(nextPanX, nextPanY)
            return
        }

        const deltaX = (pointer.clientX - action.startClientX) / unitSize.value
        const deltaY = (pointer.clientY - action.startClientY) / unitSize.value

        if (action.type === BuildingMapActionType.MOVE) {
            action.currentDeltaX = deltaX
            action.currentDeltaY = deltaY
            const movePreviewSignature = getMovePreviewSignature(action, deltaX, deltaY)
            if (
                action.lastPreviewSignature === movePreviewSignature
                && previewZones.value
                && !blockedGeometryPreview.value
            ) {
                return
            }

            action.lastPreviewSignature = movePreviewSignature

            const result = buildingMapZoneTransformService.getMovePreview({
                zones: getZonesSource().map((item) => ({...item})),
                deltaX,
                deltaY,
                doors: getDoorsSource(),
                geometryDependencies: geometryDependencies.value,
                blockedZoneCollisionMessage: properties.blockedZoneCollisionMessage,
                blockedDoorBetweenMessage: properties.blockedDoorBetweenMessage,
                blockedEntranceDoorMessage: properties.blockedEntranceDoorMessage,
                newZoneTitle: properties.newZoneTitle,
                shouldBuildBlockedPreview: action.hasLoadedDependencies
            })
            if (result.zones) {
                action.lastValidDeltaX = deltaX
                action.lastValidDeltaY = deltaY
                previewZones.value = result.zones
                blockedGeometryPreview.value = null
            } else if (result.blockedGeometryPreview) {
                const clamped = buildingMapZoneTransformService.clampMoveDelta({
                    action,
                    deltaX,
                    deltaY,
                    zones: getZonesSource().map((item) => ({...item})),
                    doors: getDoorsSource(),
                    geometryDependencies: geometryDependencies.value,
                    blockedZoneCollisionMessage: properties.blockedZoneCollisionMessage,
                    blockedDoorBetweenMessage: properties.blockedDoorBetweenMessage,
                    blockedEntranceDoorMessage: properties.blockedEntranceDoorMessage,
                    newZoneTitle: properties.newZoneTitle
                })

                if (clamped) {
                    action.lastValidDeltaX = clamped.lastValidDeltaX
                    action.lastValidDeltaY = clamped.lastValidDeltaY
                    previewZones.value = clamped.zones
                    setBlockedGeometryPreviewOnce(clamped.blockedGeometryPreview || result.blockedGeometryPreview)
                } else {
                    setBlockedGeometryPreviewOnce(result.blockedGeometryPreview)
                }
            }
            return
        }

        action.currentDeltaX = deltaX
        action.currentDeltaY = deltaY

        const resizePreviewSignature = getResizePreviewSignature(action, deltaX, deltaY)
        if (
            action.lastPreviewSignature === resizePreviewSignature
            && previewZones.value
            && !blockedGeometryPreview.value
        ) {
            return
        }

        action.lastPreviewSignature = resizePreviewSignature

        const candidate = applyResizeDelta(
            action.zone,
            action.edge,
            deltaX,
            deltaY,
            action.hasLoadedDependencies
        )

        if (candidate) {
            action.lastValidDeltaX = deltaX
            action.lastValidDeltaY = deltaY
            previewZones.value = candidate
            return
        }

        clampResizeDelta(action, deltaX, deltaY)
    }

    const onMouseMove = (event: MouseEvent) => {
        pendingMapMoveEvent = event

        if (mapMoveFrame !== null) return

        mapMoveFrame = window.requestAnimationFrame(() => {
            mapMoveFrame = null
            const pendingEvent = pendingMapMoveEvent
            pendingMapMoveEvent = null
            if (!pendingEvent) return
            processMouseMove(pendingEvent)
        })
    }

    const startPostInteractionSettling = () => {
        isPostInteractionSettling.value = true
        areEditHelpersSuspended.value = true

        if (postInteractionReleaseTimeout !== null) {
            window.clearTimeout(postInteractionReleaseTimeout)
        }

        if (postInteractionIdleCallback !== null && window.cancelIdleCallback) {
            window.cancelIdleCallback(postInteractionIdleCallback)
            postInteractionIdleCallback = null
        }

        postInteractionReleaseTimeout = window.setTimeout(() => {
            postInteractionReleaseTimeout = null

            if (activeAction.value) return

            if (window.requestIdleCallback) {
                postInteractionIdleCallback = window.requestIdleCallback(() => {
                    postInteractionIdleCallback = null
                    releasePostInteractionSettling()
                }, { timeout: 900 })
                return
            }

            window.requestAnimationFrame(() => {
                window.requestAnimationFrame(releasePostInteractionSettling)
            })
        }, 350)
    }

    const releasePostInteractionSettling = () => {
        if (!isPostInteractionSettling.value && !areEditHelpersSuspended.value) return

        if (postInteractionReleaseTimeout !== null) {
            window.clearTimeout(postInteractionReleaseTimeout)
            postInteractionReleaseTimeout = null
        }

        if (postInteractionIdleCallback !== null && window.cancelIdleCallback) {
            window.cancelIdleCallback(postInteractionIdleCallback)
            postInteractionIdleCallback = null
        }

        isPostInteractionSettling.value = false
        areEditHelpersSuspended.value = false
    }

    const onMouseUp = () => {
        const action = activeAction.value

        if (!action) {
            pendingMapMoveEvent = null

            if (mapMoveFrame !== null) {
                window.cancelAnimationFrame(mapMoveFrame)
                mapMoveFrame = null
            }

            clearMapHoverState()
            return
        }

        startPostInteractionSettling()

        if (mapMoveFrame !== null) {
            window.cancelAnimationFrame(mapMoveFrame)
            mapMoveFrame = null
        }

        if (pendingMapMoveEvent && action.type === BuildingMapActionType.PAN) {
            processMouseMove(pendingMapMoveEvent)
        }

        pendingMapMoveEvent = null

        const zones = previewZones.value

        let deferredCommit: (() => void) | null = null

        if (action.type === BuildingMapActionType.PAN) {
            panX.value = action.currentPanX
            panY.value = action.currentPanY
            syncViewport()
        }

        if (action.type === BuildingMapActionType.MOVE && zones) {
            optimisticZones.value = zones

            deferredCommit = () => {
                window.requestAnimationFrame(() => {
                    const commit = buildingMapZoneTransformService.getMoveCommitPayload({
                        zone: action.zone,
                        previewZones: zones,
                        startX: action.startX,
                        startY: action.startY
                    })

                    if (!commit) return

                    emit(Events.SHIFT_ZONE, commit.zoneId, commit.payload)
                })
            }
        }
        if (action.type === BuildingMapActionType.RESIZE && action.hasLoadedDependencies && zones) {
            optimisticZones.value = zones

            deferredCommit = () => {
                window.requestAnimationFrame(() => {
                    const commit = buildingMapZoneTransformService.getResizeCommitPayload({
                        zone: action.zone,
                        previewZones: zones,
                        startX: action.startX,
                        startY: action.startY,
                        startWidth: action.startWidth,
                        startHeight: action.startHeight
                    })

                    if (!commit) return

                    emit(Events.COMMIT_ZONE_GEOMETRY, commit.zoneId, commit.payload, commit.zones)
                })
            }
        }

        cancelActiveMapAction()
        clearMapHoverState()

        if (deferredCommit) {
            window.setTimeout(() => {
                deferredCommit?.()
            }, 0)
        }

    }

    const onWheel = (event: WheelEvent) => {
        event.preventDefault()
        isWheelInteracting.value = true
        clearMapHoverState()
        if (wheelInteractionTimeout !== null) window.clearTimeout(wheelInteractionTimeout)
        wheelInteractionTimeout = window.setTimeout(() => {
            isWheelInteracting.value = false
            wheelInteractionTimeout = null
        }, BUILDING_MAP_VIEWPORT_CONSTANTS.VIEWPORT_SYNC_DELAY_MS)
        if (!event.ctrlKey && !event.metaKey) {
            const nextPanX = panX.value - event.deltaX
            const nextPanY = panY.value - event.deltaY
            applyPan(nextPanX, nextPanY)
            scheduleViewportSync()
            return
        }

        const rect = mapRef.value?.getBoundingClientRect()
        if (!rect) return
        const beforeZoomX = (event.clientX - rect.left - panX.value) / unitSize.value
        const beforeZoomY = (event.clientY - rect.top - panY.value) / unitSize.value
        const wheelDelta = event.deltaMode === WheelEvent.DOM_DELTA_LINE
            ? event.deltaY * 16
            : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
                ? event.deltaY * rect.height
                : event.deltaY
        const zoomFactor = Math.exp(-wheelDelta * BUILDING_MAP_VIEWPORT_CONSTANTS.ZOOM_SENSITIVITY)
        unitSize.value = clampValue(unitSize.value * zoomFactor, BUILDING_MAP_VIEWPORT_CONSTANTS.MIN_UNIT_SIZE, BUILDING_MAP_VIEWPORT_CONSTANTS.MAX_UNIT_SIZE)
        applyPan(event.clientX - rect.left - beforeZoomX * unitSize.value, event.clientY - rect.top - beforeZoomY * unitSize.value)
        scheduleViewportSync()
    }

    const setMode = (mode: BuildingMapMode) => {
        if (properties.mode === mode) return
        cancelActiveMapAction()
        clearMapHoverState()
        emit(Events.UPDATE_MODE, mode)
    }

    const zoomAtCenter = (direction: -1 | 1) => {
        const rect = mapRef.value?.getBoundingClientRect()
        if (!rect) return
        const clientX = rect.left + rect.width / 2
        const clientY = rect.top + rect.height / 2
        const beforeZoomX = (clientX - rect.left - panX.value) / unitSize.value
        const beforeZoomY = (clientY - rect.top - panY.value) / unitSize.value
        const zoomFactor = direction > 0 ? BUILDING_MAP_VIEWPORT_CONSTANTS.ZOOM_BUTTON_FACTOR : 1 / BUILDING_MAP_VIEWPORT_CONSTANTS.ZOOM_BUTTON_FACTOR
        unitSize.value = clampValue(unitSize.value * zoomFactor, BUILDING_MAP_VIEWPORT_CONSTANTS.MIN_UNIT_SIZE, BUILDING_MAP_VIEWPORT_CONSTANTS.MAX_UNIT_SIZE)
        applyPan(clientX - rect.left - beforeZoomX * unitSize.value, clientY - rect.top - beforeZoomY * unitSize.value)
        scheduleViewportSync()
    }

    const enforceMinimumZoomAfterGeometry = () => {
        applyPan(panX.value, panY.value)
    }

    const focusBuilding = () => {
        const nextViewport = buildingMapViewportControllerService.focusBuilding(
            properties.zones,
            mapRef.value
        )
        if (!nextViewport) return
        unitSize.value = nextViewport.unitSize
        panX.value = nextViewport.panX
        panY.value = nextViewport.panY
        scheduleViewportSync()
    }

    const getAddDoorHandles = computed(() => {
        if (
            properties.mode === BuildingMapMode.VIEW
            || properties.isEditingZone
            || editingZoneId.value > 0
            || isMapInteracting.value
            || isPostInteractionSettling.value
            || areEditHelpersSuspended.value
            || unitSize.value < MIN_UNIT_SIZE_FOR_EDIT_HELPERS
        ) return []

        const zones = getAddZoneSourceZones()
        const doors = getRegularAddDoorsSource()

        return buildingMapAddHandleService.getAddDoorHandles({
            zones,
            doors,
            currentFloorId: properties.currentFloorId,
            unitSize: unitSize.value
        })
    })

    const hoveredAddDoorHandle = computed(() => hoveredAddDoorHandleSnapshot.value)
    const isAddInteractionActive = computed(() =>
        hoveredAddHandleKey.value.length > 0 || hoveredAddDoorHandleKey.value.length > 0
    )

    const areMapEditHelpersVisible = computed(() =>
        properties.mode === BuildingMapMode.EDIT
        && editingZoneId.value === 0
        && !isMapInteracting.value
        && !isPostInteractionSettling.value
        && !areEditHelpersSuspended.value
        && unitSize.value >= MIN_UNIT_SIZE_FOR_EDIT_HELPERS
    )

    const applyHoveredAddHandle = (key: string, clientX?: number, clientY?: number) => {
        if (isResizeHandleHovered) return

        const handle = baseAddZoneHandles.value.find((item) => item.key === key)
        if (!handle) return

        if (clientX === undefined || clientY === undefined) {
            hoveredAddHandleKey.value = handle.key
            hoveredAddHandleSnapshot.value = handle
            return
        }

        const rect = mapRef.value?.getBoundingClientRect()
        if (!rect) return

        const nextCoordinate = buildingMapAddHandleService.getCoordinateFromPointer({
            handle,
            clientX,
            clientY,
            mapRect: rect,
            panX: panX.value,
            panY: panY.value,
            unitSize: unitSize.value
        })
        if (
            hoveredAddHandleKey.value === handle.key
            && hoveredAddHandleSnapshot.value
            && hoveredAddHandleCoordinate.value !== null
            && Math.abs(hoveredAddHandleCoordinate.value - nextCoordinate) < 0.25
        ) {
            return
        }

        const nextState = buildingMapAddHandleService.resolveHoveredAddHandleState({
            baseHandles: baseAddZoneHandles.value,
            handle,
            currentHandle: hoveredAddHandleSnapshot.value,
            currentCoordinate: hoveredAddHandleCoordinate.value,
            nextCoordinate
        })

        if (
            hoveredAddHandleKey.value === nextState.key
            && hoveredAddHandleSnapshot.value === nextState.handle
            && hoveredAddHandleCoordinate.value === nextState.coordinate
        ) {
            return
        }

        hoveredAddHandleKey.value = nextState.key
        hoveredAddHandleSnapshot.value = nextState.handle
        hoveredAddHandleCoordinate.value = nextState.coordinate
    }

    const setHoveredAddHandle = (key: string, event?: MouseEvent) => {
        applyHoveredAddHandle(key, event?.clientX, event?.clientY)
    }

    const clearHoveredAddHandle = (eventOrForce?: Event | boolean) => {
        const force = eventOrForce === true
        if (isAddZonePending.value && !force) return

        if (
            !hoveredAddHandleKey.value &&
            !hoveredAddHandleSnapshot.value &&
            hoveredAddHandleCoordinate.value === null &&
            !blockedGeometryPreview.value &&
            addHandleHoverFrame === null &&
            pendingAddHandleHover === null
        ) return

        if (addHandleHoverFrame !== null) {
            window.cancelAnimationFrame(addHandleHoverFrame)
            addHandleHoverFrame = null
        }

        if (pendingAddZoneTimeout !== null) {
            window.clearTimeout(pendingAddZoneTimeout)
            pendingAddZoneTimeout = null
        }

        isAddZonePending.value = false
        pendingAddHandleHover = null
        hoveredAddHandleKey.value = ''
        hoveredAddHandleSnapshot.value = null
        hoveredAddHandleCoordinate.value = null
        lastValidAddHandleTransitionSegments.value = null
        blockedGeometryPreview.value = null
    }

    const setHoveredAddDoorHandle = (key: string) => {
        if (hoveredAddDoorHandleKey.value === key && hoveredAddDoorHandleSnapshot.value) return

        const handle = getAddDoorHandles.value.find((item) => item.key === key)
        if (!handle) return

        isResizeHandleHovered = false
        clearHoveredAddHandle()

        hoveredAddDoorHandleKey.value = key
        hoveredAddDoorHandleSnapshot.value = handle
    }

    const keepAddDoorPreviewPending = () => {
        isAddDoorPending.value = true
        if (pendingAddDoorTimeout !== null) window.clearTimeout(pendingAddDoorTimeout)
        pendingAddDoorTimeout = window.setTimeout(() => {
            clearHoveredAddDoorHandle(true)
        }, 2500)
    }

    const pressAddDoorHandle = (key: string) => {
        setHoveredAddDoorHandle(key)
        keepAddDoorPreviewPending()
    }

    const clearHoveredAddDoorHandle = (eventOrForce?: Event | boolean) => {
        const force = eventOrForce === true
        if (isAddDoorPending.value && !force) return

        if (pendingAddDoorTimeout !== null) {
            window.clearTimeout(pendingAddDoorTimeout)
            pendingAddDoorTimeout = null
        }

        isAddDoorPending.value = false
        hoveredAddDoorHandleKey.value = ''
        hoveredAddDoorHandleSnapshot.value = null
    }

    const isAddHandleHovered = (key: string) => hoveredAddHandleKey.value === key

    const getClickedAddHandle = (
        handle: AddZoneHandle,
        event: MouseEvent
    ) => {
        const rect = mapRef.value?.getBoundingClientRect()

        if (!rect) {
            return hoveredAddHandle.value || handle
        }

        const clickCoordinate = buildingMapAddHandleService.getCoordinateFromPointer({
            handle,
            clientX: event.clientX,
            clientY: event.clientY,
            mapRect: rect,
            panX: panX.value,
            panY: panY.value,
            unitSize: unitSize.value
        })

        const nextState = buildingMapAddHandleService.resolveHoveredAddHandleState({
            baseHandles: baseAddZoneHandles.value,
            handle,
            currentHandle: hoveredAddHandleSnapshot.value,
            currentCoordinate: hoveredAddHandleCoordinate.value,
            nextCoordinate: clickCoordinate
        })

        hoveredAddHandleKey.value = nextState.key
        hoveredAddHandleSnapshot.value = nextState.handle
        hoveredAddHandleCoordinate.value = nextState.coordinate

        return getCursorAdjustedAddHandle(nextState.handle)
    }

    const keepAddZonePreviewPending = () => {
        isAddZonePending.value = true
        if (pendingAddZoneTimeout !== null) window.clearTimeout(pendingAddZoneTimeout)
        pendingAddZoneTimeout = window.setTimeout(() => {
            clearHoveredAddHandle(true)
        }, 900)
    }

    const keepAddZonePreviewUntilModalClose = () => {
        isAddZonePending.value = true
        if (pendingAddZoneTimeout !== null) {
            window.clearTimeout(pendingAddZoneTimeout)
            pendingAddZoneTimeout = null
        }
    }

    const pressAddZoneHandle = (
        handle: AddZoneHandle,
        event: MouseEvent
    ) => {
        getClickedAddHandle(handle, event)
        keepAddZonePreviewPending()
    }

    const addZoneFromHandle = (
        handle: AddZoneHandle,
        event: MouseEvent
    ) => {
        const effectiveHandle = getClickedAddHandle(handle, event)
        keepAddZonePreviewUntilModalClose()

        const regularPayload: BuildingMapRegularZonePayload =
            effectiveHandle.payload.regular_payload || {
                zone_from_id: effectiveHandle.payload.zone_from_id,
                side: effectiveHandle.payload.side,
                x_coordinate: effectiveHandle.payload.x_coordinate,
                y_coordinate: effectiveHandle.payload.y_coordinate,
                width: effectiveHandle.payload.width,
                height: effectiveHandle.payload.height,
                title: effectiveHandle.payload.title,
                can_create_transition: false,
                creation_mode: 'regular'
            }

        const canCreateTransitionFromEffectiveHandle =
            effectiveHandle.canCreateTransition
            && effectiveHandle.transitionSegments.length > 0
            && effectiveHandle.payload.transition_payload

        if (canCreateTransitionFromEffectiveHandle) {
            const transitionPayload: BuildingMapTransitionZonePayload = {
                ...effectiveHandle.payload.transition_payload!,
                title: regularPayload.title,
                can_create_transition: true,
                creation_mode: 'transition'
            }

            const payload: BuildingMapAddZonePayload = {
                ...transitionPayload,
                creation_mode: 'hybrid',
                can_create_transition: true,
                regular_payload: regularPayload,
                transition_payload: transitionPayload
            }

            emit(Events.ADD_ZONE, payload)
            return
        }

        const payload: BuildingMapAddZonePayload = {
            ...regularPayload,
            creation_mode: 'regular',
            can_create_transition: false
        }

        emit(Events.ADD_ZONE, payload)
    }

    const addDoorFromHandle = (payload: BuildingMapAddDoorPayload) => {
        keepAddDoorPreviewPending()
        emit(Events.ADD_DOOR, payload)
    }

    const getZonesSignature = (zones: ZoneMapItem[]) => zones
        .map((zone) => [
            zone.zone_id,
            zone.x_coordinate,
            zone.y_coordinate,
            zone.width,
            zone.height,
            zone.floor_id
        ].join(':'))
        .sort()
        .join('|')

    watch(
        () => getZonesSignature(properties.zones),
        () => {
            if (!optimisticZones.value) return

            const optimisticIds = new Set(optimisticZones.value.map((zone) => zone.zone_id))
            const propertyIds = new Set(properties.zones.map((zone) => zone.zone_id))

            const hasStructuralZoneChange =
                optimisticIds.size !== propertyIds.size
                || [...optimisticIds].some((zoneId) => !propertyIds.has(zoneId))

            if (
                hasStructuralZoneChange ||
                getZonesSignature(optimisticZones.value) === getZonesSignature(properties.zones)
            ) {
                optimisticZones.value = null
            }
        }
    )

    watch(
        () => `${properties.buildingId}:${properties.currentFloorId}`,
        () => {
            optimisticZones.value = null
            previewZones.value = null
            blockedGeometryPreview.value = null
            clearMapHoverState()
        }
    )

    watch(
        () => properties.isZoneCreateModalOpen,
        (isOpen, wasOpen) => {
            if (wasOpen && !isOpen) {
                clearHoveredAddHandle(true)
            }
        }
    )

    onMounted(() => {
        window.addEventListener('mousemove', onMouseMove)
        window.addEventListener('mouseup', onMouseUp)
        window.addEventListener('resize', scheduleViewportSync)
        unsubscribeLocationListener = buildingLocationsSocketService.addListener(handleEmployeeLocationChange)
        syncViewport()
        if (properties.zones.length > 0 && !hasFocusedInitialMap.value) {
            hasFocusedInitialMap.value = true
            window.setTimeout(focusBuilding, 0)
        }
        void fetchEmployeeLocations()
    })

    watch(
        () => properties.zones.length,
        (zonesLength) => {
            if (zonesLength === 0 || hasFocusedInitialMap.value) return
            hasFocusedInitialMap.value = true
            window.setTimeout(focusBuilding, 0)
        }
    )

    watch(
        () => properties.zones.map((zone) => `${zone.zone_id}:${zone.x_coordinate}:${zone.y_coordinate}:${zone.width}:${zone.height}`).join('|'),
        () => window.setTimeout(enforceMinimumZoomAfterGeometry, 0)
    )

    watch(
        () => getDoorsSource()
            .map((door) => [
                door.door_id,
                door.zone_from_id,
                door.zone_to_id,
                door.floor_id,
                door.is_entrance,
                door.entrance_door_side
            ].join(':'))
            .sort()
            .join('|'),
        () => {
            clearHoveredAddDoorHandle(true)
        }
    )

    watch(
        () => `${properties.mode}:${properties.buildingId}:${properties.currentFloorId}`,
        () => {
            if (properties.mode !== BuildingMapMode.VIEW) {
                employeeLocations.value = []
                activeScannedDoorIds.value = []
                return
            }
            void fetchEmployeeLocations()
        }
    )

    watch(
        () => `${properties.viewport.x}:${properties.viewport.y}:${properties.viewport.width}:${properties.viewport.height}`,
        () => {
            void fetchEmployeeLocations()
        }
    )

    onBeforeUnmount(() => {
        window.removeEventListener('mousemove', onMouseMove)
        window.removeEventListener('mouseup', onMouseUp)
        window.removeEventListener('resize', scheduleViewportSync)

        if (wheelInteractionTimeout !== null) {
            window.clearTimeout(wheelInteractionTimeout)
        }
        if (pendingAddZoneTimeout !== null) {
            window.clearTimeout(pendingAddZoneTimeout)
        }
        if (pendingAddDoorTimeout !== null) {
            window.clearTimeout(pendingAddDoorTimeout)
        }
        if (mapMoveFrame !== null) {
            window.cancelAnimationFrame(mapMoveFrame)
        }
        scannedDoorTimeouts.forEach((timeout) => window.clearTimeout(timeout))
        scannedDoorTimeouts.clear()
        unsubscribeLocationListener?.()
        unsubscribeLocationListener = null
        buildingMapViewportControllerService.cleanupViewportSync(viewportSyncDebounce)
    })

    return {
        mapRef,
        gridRef,
        layerRef,
        editingZoneId,
        editingZoneTitle,
        mapStyle,
        previewZones,
        isResizingMap,
        isTransformingZone,
        isMapInteracting,
        isAddInteractionActive,
        renderedZones,
        renderedDoors,
        areMapEditHelpersVisible,
        activeScannedDoorIds,
        visibleEmployeesByZone,
        layerStyle,
        zoneStyle,
        zoneActionStyle,
        zoneTitleStyle,
        isZonePreviewed,
        zonePhotoUrl,
        startTitleEdit,
        setTitleInputRef,
        finishTitleEdit,
        cancelTitleEdit,
        getAddZoneHandles,
        editableActionZones,
        getAddDoorHandles,
        setHoveredAddHandle,
        pressAddZoneHandle,
        clearHoveredAddHandle,
        clearMapHoverState,
        clearStaleAddHandleHover,
        setResizeHandleHover,
        setHoveredAddDoorHandle,
        pressAddDoorHandle,
        clearHoveredAddDoorHandle,
        isAddHandleHovered,
        addZoneFromHandle,
        addDoorFromHandle,
        startMove,
        startResize,
        handleMapMouseDown,
        uploadZonePhoto,
        handleDeleteZone,
        handleZonePhotoUpdate,
        handleDeleteDoor,
        handleOpenDoorReader,
        onWheel,
        zoomAtCenter,
        focusBuilding,
        setMode,
        blockedGeometryPreview
    }
}
