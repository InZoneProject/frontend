import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { isAxiosError } from 'axios'
import { useDateFormatter } from '@/composables/useDateFormatter'
import { useLanguageSwitcher } from '@/composables/useLanguageSwitcher'
import { useAuthStore } from '@/stores/auth.store'
import { buildingEditDeleteRepository } from '@/repositories/building-edit-delete.repository'
import { positionsRepository } from '@/repositories/positions.repository'
import { participantsControlRepository } from '@/repositories/participants-control.repository'
import { buildingRepository } from '@/modules/building/repositories/building.repository'
import { buildingLocationsSocketService } from '@/modules/building/services/building-locations-socket.service'
import { buildingMapCacheService } from '@/modules/building/services/building-map-cache.service'
import { buildingEmployeePhotoService } from '@/modules/building/services/building-employee-photo.service'
import { employeeMovementReportService } from '@/modules/building/services/employee-movement-report.service'
import { BUILDING_MAP_PREVIEW_CONSTANTS } from '@/modules/building/constants/building-map-preview.constants'
import { BUILDING_MAP_VIEWPORT_CONSTANTS } from '@/modules/building/constants/building-map-viewport.constants'
import { LIST } from '@/constants/list.constants'
import { DATA_TABLE_CONSTANTS } from '@/constants/data-table.constants'
import type { OrganizationMemberProfile } from '@/interfaces/organization-member-profile.interface'
import type { OrganizationPositionItem } from '@/modules/organization/interfaces/organization-position-item.interface'
import type { BuildingInfo } from '@/modules/building/interfaces/building-info.interface'
import type { DoorMapItem } from '@/modules/building/interfaces/door-map-item.interface'
import type { BuildingMapAddZonePayload } from '@/modules/building/interfaces/building-map-add-zone-payload.interface'
import type { EmployeeLocation } from '@/modules/building/interfaces/employee-location.interface'
import type { EmployeeLocationSocketPayload } from '@/modules/building/interfaces/employee-location-socket-payload.interface'
import type { CurrentBuildingEmployee } from '@/modules/building/interfaces/current-building-employee.interface'
import type { FloorItem } from '@/modules/building/interfaces/floor-item.interface'
import type { RfidReaderItem } from '@/modules/building/interfaces/rfid-reader-item.interface'
import type { ViewportBounds } from '@/modules/building/interfaces/viewport-bounds.interface'
import type { ViewportPageParams } from '@/modules/building/interfaces/viewport-page-params.interface'
import type { ZoneMapItem } from '@/modules/building/interfaces/zone-map-item.interface'
import type { OrganizationListParams } from '@/interfaces/organization-list-params.interface'
import { BuildingMapMode } from '@/modules/building/enums/building-map-mode.enum'

export const useBuildingView = () => {
    const route = useRoute()
    const router = useRouter()
    const authStore = useAuthStore()
    const { formatDate } = useDateFormatter()
    const { translations } = useLanguageSwitcher()

    const buildingId = computed(() => Number(route.params.buildingId))
    const defaultBuilding: BuildingInfo = { building_id: 0, organization_id: 0, title: '', address: null, created_at: '' }
    const building = ref<BuildingInfo>(defaultBuilding)
    const buildingCreatedAt = ref('')
    const floors = ref<FloorItem[]>([])
    const draggedFloorId = ref(0)
    const dragOverFloorId = ref(0)
    const zones = ref<ZoneMapItem[]>([])
    const transitionValidationZones = ref<ZoneMapItem[]>([])
    const transitionValidationDoors = ref<DoorMapItem[]>([])
    const deletableZoneIds = ref<number[]>([])
    const deletableDoorIds = ref<number[]>([])
    const doors = ref<DoorMapItem[]>([])
    const currentBuildingEmployees = ref<CurrentBuildingEmployee[]>([])
    const sidePanelTab = ref<'floors' | 'employees'>(route.query.tab === 'employees' ? 'employees' : 'floors')
    const selectedFloorId = ref(0)
    const floorsSearch = ref('')
    const buildingEmployeesSearch = ref('')
    const floorsOffset = ref(0)
    const buildingEmployeesOffset = ref(0)
    const floorsLimit = ref(LIST.DEFAULT_LIMIT)
    const buildingEmployeesLimit = ref(LIST.DEFAULT_LIMIT)
    const floorsTotal = ref(0)
    const buildingEmployeesTotal = ref(0)
    const viewport = ref<ViewportBounds>({ x: 0, y: 0, width: 80, height: 45 })
    const isInitiallyFloorsCollapsed = route.query.floors === 'collapsed'
    const isFloorsCollapsed = ref(isInitiallyFloorsCollapsed)
    const isBuildingMapExpanded = ref(isInitiallyFloorsCollapsed)
    const buildingMapMode = ref<BuildingMapMode>(route.query.mode === BuildingMapMode.EDIT ? BuildingMapMode.EDIT : BuildingMapMode.VIEW)
    const isLoadingBuilding = ref(false)
    const buildingErrorMessage = ref('')
    const isLoadingFloors = ref(false)
    const floorsErrorMessage = ref('')
    const isLoadingBuildingEmployees = ref(false)
    const buildingEmployeesErrorMessage = ref('')
    const isExpelModalOpen = ref(false)
    const isExpellingMember = ref(false)
    const expelMemberErrorMessage = ref('')
    const employeeToExpel = ref<CurrentBuildingEmployee | null>(null)
    const employeeForMovementReport = ref<CurrentBuildingEmployee | null>(null)
    const movementReportDateValue = ref(new Date().toISOString().slice(0, 10))
    const isMovementReportModalOpen = ref(false)
    const isDownloadingMovementReport = ref(false)
    const movementReportErrorMessage = ref('')
    const selectedMemberProfile = ref<OrganizationMemberProfile | null>(null)
    const isMemberInfoModalOpen = ref(false)
    const isLoadingMemberProfile = ref(false)
    const memberInfoErrorMessage = ref('')
    const isMemberPositionsModalOpen = ref(false)
    const isPositionsEditMode = ref(false)
    const isLoadingMemberPositions = ref(false)
    const isLoadingAvailablePositions = ref(false)
    const memberPositionsErrorMessage = ref('')
    const assignedMemberPositions = ref<OrganizationPositionItem[]>([])
    const availableMemberPositions = ref<OrganizationPositionItem[]>([])
    const assignedPositionsSearchValue = ref('')
    const availablePositionsSearchValue = ref('')
    const assignedPositionsOffset = ref(0)
    const availablePositionsOffset = ref(0)
    const assignedPositionsTotal = ref(0)
    const availablePositionsTotal = ref(0)
    const memberPositionsLimit = LIST.DEFAULT_LIMIT
    const isPositionUpsertModalOpen = ref(false)
    const positionModalMode = ref<'create' | 'edit'>('create')
    const positionToEditId = ref<number | null>(null)
    const positionRoleValue = ref('')
    const positionDescriptionValue = ref('')
    const initialPositionRoleValue = ref('')
    const initialPositionDescriptionValue = ref('')
    const isPositionSubmitting = ref(false)
    const positionFormErrorMessage = ref('')
    const isDeletePositionModalOpen = ref(false)
    const positionToDeleteId = ref<number | null>(null)
    const isDeletingPosition = ref(false)
    const deletePositionErrorMessage = ref('')

    const isBuildingModalOpen = ref(false)
    const buildingTitleValue = ref('')
    const buildingAddressValue = ref('')
    const initialBuildingTitleValue = ref('')
    const initialBuildingAddressValue = ref('')
    const isBuildingSubmitting = ref(false)
    const buildingFormErrorMessage = ref('')

    const isFloorModalOpen = ref(false)
    const floorModalMode = ref<'create' | 'edit'>('create')
    const floorNameValue = ref('')
    const floorEditingId = ref(0)
    const initialFloorNameValue = ref('')
    const isFloorSubmitting = ref(false)
    const floorFormErrorMessage = ref('')

    const isDeleteBuildingModalOpen = ref(false)
    const deleteBuildingErrorMessage = ref('')
    const floorToDeleteId = ref(0)
    const isDeletingFloor = ref(false)
    const deleteFloorErrorMessage = ref('')

    let floorsSearchDebounce: number | null = null
    let floorsCollapseTimeout: number | null = null
    let readersSearchDebounce: number | null = null
    let buildingEmployeesSearchDebounce: number | null = null
    let assignedPositionsSearchDebounce: number | null = null
    let availablePositionsSearchDebounce: number | null = null
    let unsubscribeLocationListener: (() => void) | null = null
    let floorsRequestId = 0
    let buildingEmployeesRequestId = 0
    const getFloorsStateFromQuery = () => route.query.floors === 'collapsed'

    const runBackground = (request: Promise<unknown>) => {
        request.catch(() => undefined)
    }
    const serverErrorMessage = () => translations.value.organizationAdmin.buildingPage.serverError

    const syncFloorsStateToRoute = async (collapsed: boolean) => {
        const nextValue = collapsed ? 'collapsed' : 'expanded'
        if (route.query.floors === nextValue) return
        await router.replace({
            name: 'Building',
            params: { buildingId: String(buildingId.value) },
            query: { ...route.query, floors: nextValue }
        })
    }

    const syncSelectedFloorToRoute = async (floorId: number) => {
        if (floorId === 0 || route.query.floor === String(floorId)) return
        await router.replace({
            name: 'Building',
            params: { buildingId: String(buildingId.value) },
            query: { ...route.query, floor: String(floorId) }
        })
    }

    const syncSidePanelTabToRoute = async (tab: 'floors' | 'employees') => {
        if (route.query.tab === tab) return
        await router.replace({
            name: 'Building',
            params: { buildingId: String(buildingId.value) },
            query: { ...route.query, tab }
        })
    }

    const syncMapModeToRoute = async (mode: BuildingMapMode) => {
        if (route.query.mode === mode) return
        await router.replace({
            name: 'Building',
            params: { buildingId: String(buildingId.value) },
            query: { ...route.query, mode }
        })
    }

    const applyFloorsStateImmediately = (collapsed: boolean) => {
        if (floorsCollapseTimeout !== null) {
            window.clearTimeout(floorsCollapseTimeout)
            floorsCollapseTimeout = null
        }
        isFloorsCollapsed.value = collapsed
        isBuildingMapExpanded.value = collapsed
    }

    const isLoadingMap = ref(false)
    const mapErrorMessage = ref('')
    let mapRequestId = 0
    let loadedFloorId = 0
    let activeFloorId = 0
    let isMapRequestInFlight = false
    let pendingMapSync = false
    let pendingMapSyncForce = false
    let scheduledMapSync: number | null = null
    const viewportCursorByKey = new Map<string, number | null>()

    const clearMapState = () => {
        zones.value = []
        doors.value = []
        transitionValidationZones.value = []
        transitionValidationDoors.value = []
        deletableZoneIds.value = []
        deletableDoorIds.value = []
        viewportCursorByKey.clear()
        buildingMapCacheService.clear()
    }
    const cancelScheduledMapSync = () => {
        if (scheduledMapSync === null) return
        window.clearTimeout(scheduledMapSync)
        scheduledMapSync = null
    }
    const getViewportKey = (value: ViewportPageParams) => buildingMapCacheService.getViewportKey(value)
    const mergeZonesForViewport = (current: ZoneMapItem[], next: ZoneMapItem[], replace: boolean) => {
        if (replace) return next
        const byId = new Map(current.map((zone) => [zone.zone_id, zone]))
        next.forEach((zone) => byId.set(zone.zone_id, zone))
        return [...byId.values()]
    }
    const mergeDoors = (current: DoorMapItem[], next: DoorMapItem[], replace: boolean) => {
        if (replace) return next
        const byId = new Map(current.map((door) => [door.door_id, door]))
        next.forEach((door) => byId.set(door.door_id, door))
        return [...byId.values()]
    }
    const mergeIds = (current: number[], next: number[], replace: boolean) =>
        replace ? next : [...new Set([...current, ...next])]
    const applyMapResponse = (
        response: {
            zones: ZoneMapItem[]
            doors: DoorMapItem[]
            transition_validation_zones: ZoneMapItem[]
            transition_validation_doors: DoorMapItem[]
            deletable_zone_ids: number[]
            deletable_door_ids: number[]
        },
        replace: boolean
    ) => {
        zones.value = mergeZonesForViewport(zones.value, response.zones, replace)
        transitionValidationZones.value = replace
            ? response.transition_validation_zones || response.zones
            : mergeZonesForViewport(transitionValidationZones.value, response.transition_validation_zones || response.zones, false)
        transitionValidationDoors.value = mergeDoors(transitionValidationDoors.value, response.transition_validation_doors || response.doors, replace)
        deletableZoneIds.value = mergeIds(deletableZoneIds.value, response.deletable_zone_ids || [], replace)
        deletableDoorIds.value = mergeIds(deletableDoorIds.value, response.deletable_door_ids || [], replace)
        doors.value = mergeDoors(doors.value, response.doors, replace)
    }
    const canDeleteZoneWithoutDisconnectingMap = (zoneId: number) => {
        const remainingZones = zones.value.filter((zone) => zone.zone_id > 0 && zone.zone_id !== zoneId)
        if (remainingZones.length <= 1) return true

        const remainingZoneIds = new Set(remainingZones.map((zone) => zone.zone_id))
        const adjacency = new Map<number, Set<number>>()

        remainingZoneIds.forEach((id) => adjacency.set(id, new Set<number>()))

        doors.value.forEach((door) => {
            if (door.is_entrance || door.zone_from_id === null || door.zone_to_id === null) return
            if (door.zone_from_id === zoneId || door.zone_to_id === zoneId) return
            if (!remainingZoneIds.has(door.zone_from_id) || !remainingZoneIds.has(door.zone_to_id)) return

            adjacency.get(door.zone_from_id)?.add(door.zone_to_id)
            adjacency.get(door.zone_to_id)?.add(door.zone_from_id)
        })

        const startZoneId = remainingZones[0].zone_id
        const visitedZoneIds = new Set<number>([startZoneId])
        const queue = [startZoneId]

        while (queue.length > 0) {
            const currentZoneId = queue.shift()
            if (currentZoneId === undefined) continue

            adjacency.get(currentZoneId)?.forEach((nextZoneId) => {
                if (visitedZoneIds.has(nextZoneId)) return
                visitedZoneIds.add(nextZoneId)
                queue.push(nextZoneId)
            })
        }

        return visitedZoneIds.size === remainingZoneIds.size
    }
    const visibleDeletableZoneIds = computed(() =>
        deletableZoneIds.value.filter((zoneId) => canDeleteZoneWithoutDisconnectingMap(zoneId))
    )
    const visibleDeletableDoorIds = computed(() => {
        const knownDoors = mergeDoors(doors.value, transitionValidationDoors.value, false)
        const entranceDoors = knownDoors.filter((door) => door.is_entrance)
        const hasMultipleEntranceDoors = entranceDoors.length > 1

        return deletableDoorIds.value.filter((doorId) => {
            const door = knownDoors.find((item) => item.door_id === doorId)
            if (!door?.is_entrance) return true

            return hasMultipleEntranceDoors
        })
    })
    const fetchRemainingMapPages = async (params: {
        requestId: number
        floorId: number
        viewportKey: string
        viewport: ViewportPageParams
        cursor: number | null
        isLod: boolean
    }) => {
        if (params.isLod) return params.cursor
        let cursor = params.cursor
        let pagesLoaded = 1
        while (
            cursor !== null &&
            pagesLoaded < BUILDING_MAP_VIEWPORT_CONSTANTS.MAX_AUTO_PAGES &&
            params.requestId === mapRequestId &&
            params.floorId === selectedFloorId.value
        ) {
            const response = await buildingRepository.getFloorMap(params.floorId, {
                ...params.viewport,
                cursor,
                limit: BUILDING_MAP_VIEWPORT_CONSTANTS.PAGE_LIMIT
            })
            if (params.requestId !== mapRequestId || params.floorId !== selectedFloorId.value) return
            applyMapResponse(response.data, false)
            cursor = response.data.map_meta.next_cursor
            viewportCursorByKey.set(params.viewportKey, cursor)
            pagesLoaded += 1
        }

        return cursor
    }
    const fetchMap = async (options: { silent?: boolean; force?: boolean } = {}) => {
        const floorId = selectedFloorId.value
        if (floorId === 0) {
            cancelScheduledMapSync()
            mapRequestId += 1
            loadedFloorId = 0
            activeFloorId = 0
            pendingMapSync = false
            pendingMapSyncForce = false
            isLoadingMap.value = false
            clearMapState()
            return
        }
        const isFloorChanged = activeFloorId !== floorId
        if (isFloorChanged) {
            cancelScheduledMapSync()
            activeFloorId = floorId
            loadedFloorId = 0
            mapRequestId += 1
            pendingMapSync = false
            pendingMapSyncForce = false
            isLoadingMap.value = true
            clearMapState()
        }
        if (isMapRequestInFlight) {
            pendingMapSync = true
            pendingMapSyncForce = pendingMapSyncForce || Boolean(options.force)
            return
        }
        isMapRequestInFlight = true
        const requestId = ++mapRequestId
        try {
            const isInitialFloorMapLoad = loadedFloorId !== floorId
            if ((!options.silent && zones.value.length === 0) || isInitialFloorMapLoad) isLoadingMap.value = true
            const seedViewport = isInitialFloorMapLoad
                ? (await buildingRepository.getFloorMapSeed(floorId)).data.viewport
                : null
            if (requestId !== mapRequestId || floorId !== selectedFloorId.value) return
            const mapViewport: ViewportPageParams = seedViewport
                ? { ...seedViewport, limit: BUILDING_MAP_VIEWPORT_CONSTANTS.PAGE_LIMIT }
                : { ...viewport.value, limit: BUILDING_MAP_VIEWPORT_CONSTANTS.PAGE_LIMIT }
            const viewportKey = getViewportKey(mapViewport)
            if (
                !isInitialFloorMapLoad
                && !options.force
                && buildingMapCacheService.isViewportLoaded(floorId, mapViewport)
            ) return
            const nextViewportCursor = isInitialFloorMapLoad || options.force
                ? undefined
                : viewportCursorByKey.get(viewportKey)
            if (!isInitialFloorMapLoad && !options.force && nextViewportCursor === null) return
            if (nextViewportCursor !== undefined && nextViewportCursor !== null) mapViewport.cursor = nextViewportCursor
            if (seedViewport) viewport.value = seedViewport
            const mapResponse = await buildingRepository.getFloorMap(floorId, mapViewport)
            if (requestId !== mapRequestId || floorId !== selectedFloorId.value) return
            if (isInitialFloorMapLoad) viewportCursorByKey.clear()
            applyMapResponse(mapResponse.data, isInitialFloorMapLoad)
            viewportCursorByKey.set(viewportKey, mapResponse.data.map_meta.next_cursor)
            loadedFloorId = floorId
            const finalCursor = await fetchRemainingMapPages({
                requestId,
                floorId,
                viewportKey,
                viewport: mapViewport,
                cursor: mapResponse.data.map_meta.next_cursor,
                isLod: mapResponse.data.map_meta.is_lod
            })
            if (
                requestId === mapRequestId
                && floorId === selectedFloorId.value
                && !mapResponse.data.map_meta.is_lod
                && finalCursor === null
            ) {
                buildingMapCacheService.markViewportLoaded(floorId, mapViewport)
            }
        } catch {
            if (requestId === mapRequestId && isFloorChanged) clearMapState()
        } finally {
            isMapRequestInFlight = false
            if (requestId === mapRequestId) isLoadingMap.value = false
            if (pendingMapSync) {
                const shouldForcePendingSync = pendingMapSyncForce
                pendingMapSync = false
                pendingMapSyncForce = false
                void fetchMap({ silent: true, force: shouldForcePendingSync })
            }
        }
    }
    const scheduleMapSync = (options: { force?: boolean } = {}) => {
        if (scheduledMapSync !== null) window.clearTimeout(scheduledMapSync)
        scheduledMapSync = window.setTimeout(() => {
            scheduledMapSync = null
            void fetchMap({ silent: true, force: options.force })
        }, BUILDING_MAP_VIEWPORT_CONSTANTS.VIEWPORT_SYNC_DELAY_MS)
    }
    const updateViewport = (nextViewport: ViewportBounds) => {
        if (
            viewport.value.x === nextViewport.x &&
            viewport.value.y === nextViewport.y &&
            viewport.value.width === nextViewport.width &&
            viewport.value.height === nextViewport.height
        ) return
        viewport.value = nextViewport
    }

    const pendingZonePayload = ref<BuildingMapAddZonePayload | null>(null)
    const isZoneCreateModalOpen = ref(false)
    const zoneTitleValue = ref('')
    const zoneIsTransitionBetweenFloors = ref(false)
    const zoneCanCreateTransition = ref(false)
    const zoneHideTypeTabs = ref(false)
    const zoneCreateErrorMessage = ref('')
    const isZoneSubmitting = ref(false)
    const isEditingZone = ref(false)
    const accessRulesZoneId = ref(0)
    const accessRulesZoneTitle = ref('')
    const zoneToDeleteId = ref(0)
    const isDeletingZone = ref(false)
    const setMapMutationError = () => {
        mapErrorMessage.value = translations.value.organizationAdmin.buildingPage.map.syncError
    }
    const clearMapMutationError = () => {
        mapErrorMessage.value = ''
    }
    const canSubmitZone = computed(() => {
        if (!pendingZonePayload.value) return false
        if (zoneTitleValue.value.trim().length === 0) return false
        return !zoneIsTransitionBetweenFloors.value || zoneCanCreateTransition.value
    })
    const runAfterInteraction = (callback: () => void) => {
        globalThis.setTimeout(() => {
            const idleCallback = globalThis.requestIdleCallback as
                | ((callback: IdleRequestCallback, options?: IdleRequestOptions) => number)
                | undefined
            if (idleCallback) {
                idleCallback(() => callback(), { timeout: 700 })
                return
            }
            globalThis.setTimeout(callback, 0)
        }, 120)
    }
    const openZoneAccessRulesModal = (zoneId: number) => {
        accessRulesZoneId.value = zoneId
        accessRulesZoneTitle.value = zones.value.find((zone) => zone.zone_id === zoneId)?.title || ''
    }
    const closeZoneAccessRulesModal = () => {
        accessRulesZoneId.value = 0
        accessRulesZoneTitle.value = ''
    }
    const commitZoneGeometry = async (
        zoneId: number,
        payload: { width: number; height: number; x_coordinate: number; y_coordinate: number },
        previewedZones?: Array<{ zone_id: number; x_coordinate: number; y_coordinate: number; width: number; height: number }>
    ) => {
        try {
            await buildingRepository.updateZoneGeometry(zoneId, payload)
            clearMapMutationError()
        } catch {
            setMapMutationError()
            runAfterInteraction(() => scheduleMapSync({ force: true }))
            return
        }

        runAfterInteraction(() => {
            if (previewedZones?.length) {
                const previewedZonesById = new Map(previewedZones.map((zone) => [zone.zone_id, zone]))
                zones.value = zones.value.map((zone) => ({ ...zone, ...(previewedZonesById.get(zone.zone_id) || {}) }))
                transitionValidationZones.value = transitionValidationZones.value.map((zone) => ({
                    ...zone,
                    ...(previewedZonesById.get(zone.zone_id) || {})
                }))
                return
            }
            zones.value = zones.value.map((zone) => zone.zone_id === zoneId ? { ...zone, ...payload } : zone)
            transitionValidationZones.value = transitionValidationZones.value.map((zone) =>
                zone.zone_id === zoneId ? { ...zone, ...payload } : zone
            )
        })
    }
    const shiftZone = async (zoneId: number, payload: { x_coordinate: number; y_coordinate: number }) => {
        try {
            await buildingRepository.shiftBuildingZones(zoneId, payload)
            clearMapMutationError()
        } catch {
            setMapMutationError()
            runAfterInteraction(() => scheduleMapSync({ force: true }))
            return
        }

        runAfterInteraction(() => {
            const original = zones.value.find((zone) => zone.zone_id === zoneId)
            if (!original) return
            const deltaX = payload.x_coordinate - original.x_coordinate
            const deltaY = payload.y_coordinate - original.y_coordinate
            zones.value = zones.value.map((zone) => ({
                ...zone,
                x_coordinate: zone.x_coordinate + deltaX,
                y_coordinate: zone.y_coordinate + deltaY
            }))
            transitionValidationZones.value = transitionValidationZones.value.map((zone) => ({
                ...zone,
                x_coordinate: zone.x_coordinate + deltaX,
                y_coordinate: zone.y_coordinate + deltaY
            }))
        })
    }
    const updateZoneTitle = async (zoneId: number, title: string) => {
        isEditingZone.value = true
        const previousZones = zones.value
        zones.value = zones.value.map((zone) => zone.zone_id === zoneId ? { ...zone, title } : zone)
        try {
            await buildingRepository.updateZoneTitle(zoneId, title)
            clearMapMutationError()
        } catch (error) {
            zones.value = previousZones
            setMapMutationError()
            throw error
        } finally {
            isEditingZone.value = false
        }
    }
    const updateZonePhoto = async (zoneId: number, file: File) => {
        isEditingZone.value = true
        try {
            const response = await buildingRepository.updateZonePhoto(zoneId, file)
            zones.value = zones.value.map((zone) => zone.zone_id === zoneId ? { ...zone, photo: response.data.photo } : zone)
        } finally {
            isEditingZone.value = false
        }
    }
    const addZone = (payload: BuildingMapAddZonePayload) => {
        if (selectedFloorId.value === 0) return
        pendingZonePayload.value = payload
        zoneTitleValue.value = (payload.title || payload.regular_payload?.title || payload.transition_payload?.title || '').trim()
        zoneCanCreateTransition.value = payload.can_create_transition && !!payload.transition_payload
        zoneHideTypeTabs.value = Boolean(payload.hide_type_tabs || !zoneCanCreateTransition.value)
        zoneIsTransitionBetweenFloors.value = false
        zoneCreateErrorMessage.value = ''
        isZoneCreateModalOpen.value = true
    }
    const closeZoneCreateModal = () => {
        if (isZoneSubmitting.value) return
        isZoneCreateModalOpen.value = false
        pendingZonePayload.value = null
        zoneTitleValue.value = ''
        zoneIsTransitionBetweenFloors.value = false
        zoneCanCreateTransition.value = false
        zoneHideTypeTabs.value = false
        zoneCreateErrorMessage.value = ''
    }
    const resolveZoneCreateErrorMessage = (message: string) => {
        if (message.includes('overlap') || message.includes('overlaps')) return translations.value.organizationAdmin.buildingPage.zoneForm.overlapError
        if (message.includes('touch') || message.includes('intersect')) return translations.value.organizationAdmin.buildingPage.zoneForm.noIntersectionError
        if (message.includes('entrance door')) return translations.value.organizationAdmin.buildingPage.zoneForm.overlapError
        if (message.includes('door')) return translations.value.organizationAdmin.buildingPage.zoneForm.doorSpaceError
        return message || translations.value.organizationAdmin.buildingPage.zoneForm.defaultError
    }
    const submitZone = async () => {
        if (!canSubmitZone.value || !pendingZonePayload.value) return
        isZoneSubmitting.value = true
        const payload = pendingZonePayload.value
        const selectedPayload = zoneIsTransitionBetweenFloors.value && payload.transition_payload
            ? payload.transition_payload
            : payload.regular_payload || payload
        const zonePayload = {
            title: zoneTitleValue.value.trim(),
            width: selectedPayload.width,
            height: selectedPayload.height,
            x_coordinate: selectedPayload.x_coordinate,
            y_coordinate: selectedPayload.y_coordinate,
            building_id: buildingId.value,
            is_transition_between_floors: zoneIsTransitionBetweenFloors.value,
            zone_from_id: selectedPayload.zone_from_id,
            floor_id: selectedFloorId.value
        }
        try {
            const response = await buildingRepository.createZone(zonePayload)
            const createdZone = response.data as ZoneMapItem
            if (createdZone) {
                const normalizedZone: ZoneMapItem = {
                    ...createdZone,
                    title: createdZone.title || zonePayload.title,
                    width: createdZone.width ?? zonePayload.width,
                    height: createdZone.height ?? zonePayload.height,
                    x_coordinate: createdZone.x_coordinate ?? zonePayload.x_coordinate,
                    y_coordinate: createdZone.y_coordinate ?? zonePayload.y_coordinate,
                    photo: createdZone.photo ?? null,
                    is_transition_between_floors: createdZone.is_transition_between_floors ?? zonePayload.is_transition_between_floors,
                    floor_id: createdZone.is_transition_between_floors
                        ? createdZone.floor_id ?? null
                        : createdZone.floor_id ?? selectedFloorId.value
                }
                const upsertZone = (zoneList: ZoneMapItem[]) => [
                    ...zoneList.filter((zone) => zone.zone_id !== normalizedZone.zone_id),
                    normalizedZone
                ]
                zones.value = upsertZone(zones.value)
                transitionValidationZones.value = upsertZone(transitionValidationZones.value)
                scheduleMapSync({ force: true })
            }
            isZoneSubmitting.value = false
            clearMapMutationError()
            closeZoneCreateModal()
        } catch (error) {
            if (isAxiosError(error) && error.response?.status === 400) {
                const responseMessage = error.response.data?.message
                const message = Array.isArray(responseMessage)
                    ? responseMessage.join(', ')
                    : String(responseMessage || '')
                zoneCreateErrorMessage.value = resolveZoneCreateErrorMessage(message)
                if (zoneIsTransitionBetweenFloors.value) {
                    zoneIsTransitionBetweenFloors.value = false
                    zoneCanCreateTransition.value = false
                }
                return
            }
            setMapMutationError()
            zoneCreateErrorMessage.value = translations.value.organizationAdmin.buildingPage.map.syncError
        } finally {
            isZoneSubmitting.value = false
        }
    }
    const openDeleteZoneModal = (zoneId: number) => {
        zoneToDeleteId.value = zoneId
    }
    const closeDeleteZoneModal = () => {
        if (isDeletingZone.value) return
        zoneToDeleteId.value = 0
    }
    const confirmDeleteZone = async () => {
        if (zoneToDeleteId.value === 0) return
        isDeletingZone.value = true
        try {
            const deletedZoneId = zoneToDeleteId.value
            await buildingRepository.deleteZone(deletedZoneId)
            clearMapMutationError()
            zoneToDeleteId.value = 0
            zones.value = zones.value.filter((zone) => zone.zone_id !== deletedZoneId)
            transitionValidationZones.value = transitionValidationZones.value.filter((zone) => zone.zone_id !== deletedZoneId)
            deletableZoneIds.value = deletableZoneIds.value.filter((zoneId) => zoneId !== deletedZoneId)
            const isConnectedDoor = (door: DoorMapItem) => door.zone_to_id === deletedZoneId || door.zone_from_id === deletedZoneId
            const deletedDoorIds = new Set(doors.value.filter(isConnectedDoor).map((door) => door.door_id))
            doors.value = doors.value.filter((door) => !isConnectedDoor(door))
            transitionValidationDoors.value = transitionValidationDoors.value.filter((door) => !isConnectedDoor(door))
            if (deletedDoorIds.size > 0) {
                deletableDoorIds.value = deletableDoorIds.value.filter((doorId) => !deletedDoorIds.has(doorId))
            }
            scheduleMapSync({ force: true })
            runAfterInteraction(() => scheduleMapSync({ force: true }))
        } catch {
            setMapMutationError()
        } finally {
            isDeletingZone.value = false
        }
    }

    const doorToDelete = ref<{ doorId: number; isEntrance: boolean } | null>(null)
    const isDeletingDoor = ref(false)
    const readerDoorId = ref(0)
    const selectedDoorReader = ref<RfidReaderItem | null>(null)
    const availableReaders = ref<RfidReaderItem[]>([])
    const readersSearch = ref('')
    const readersOffset = ref(0)
    const readersLimit = ref(LIST.DEFAULT_LIMIT)
    const readersTotal = ref(0)
    const isLoadingReaders = ref(false)
    const generatedReaderToken = ref('')
    const isReaderModalOpen = ref(false)
    const readerModalMode = ref<'create' | 'edit'>('create')
    const readerNameValue = ref('')
    const readerEditingId = ref(0)
    const isReaderSubmitting = ref(false)
    const readerToDelete = ref<RfidReaderItem | null>(null)
    const isDeletingReader = ref(false)
    const readerToRegenerate = ref<RfidReaderItem | null>(null)
    const isRegeneratingReaderToken = ref(false)
    const readerTokenCopySuccessMessage = ref('')
    const readerErrorMessage = ref('')
    const canSubmitReader = computed(() => readerNameValue.value.trim().length > 0)
    const addDoor = async (payload: { zone_from_id: number | null; zone_to_id: number; floor_id: number; entrance_door_side?: 'top' | 'bottom' | 'left' | 'right' }) => {
        let createdDoor: DoorMapItem | null = null
        try {
            if (payload.zone_from_id === null) {
                if (!payload.entrance_door_side) return
                const response = await buildingRepository.createEntranceDoor({
                    zone_id: payload.zone_to_id,
                    entrance_door_side: payload.entrance_door_side,
                    floor_id: payload.floor_id
                })
                createdDoor = {
                    door_id: response.data.door_id,
                    is_entrance: true,
                    entrance_door_side: response.data.entrance_door_side,
                    zone_from_id: null,
                    zone_to_id: response.data.zone_id,
                    floor_id: response.data.floor_id,
                    rfid_reader_id: null
                }
            } else {
                const response = await buildingRepository.createDoor({
                    zone_from_id: payload.zone_from_id,
                    zone_to_id: payload.zone_to_id,
                    floor_id: payload.floor_id
                })
                createdDoor = {
                    door_id: response.data.door_id,
                    is_entrance: false,
                    entrance_door_side: null,
                    zone_from_id: response.data.zone_from_id,
                    zone_to_id: response.data.zone_to_id,
                    floor_id: response.data.floor_id,
                    rfid_reader_id: null
                }
            }
            clearMapMutationError()
        } catch {
            setMapMutationError()
            return
        }
        const upsertDoor = (doorList: DoorMapItem[]) => [
            ...doorList.filter((door) => door.door_id !== createdDoor!.door_id),
            createdDoor!
        ]
        doors.value = upsertDoor(doors.value)
        transitionValidationDoors.value = upsertDoor(transitionValidationDoors.value)
        if (!deletableDoorIds.value.includes(createdDoor.door_id)) {
            deletableDoorIds.value = [...deletableDoorIds.value, createdDoor.door_id]
        }
        scheduleMapSync({ force: true })
    }
    const openDeleteDoorModal = (doorId: number, isEntrance: boolean) => {
        if (isEntrance && !visibleDeletableDoorIds.value.includes(doorId)) return

        doorToDelete.value = { doorId, isEntrance }
    }
    const closeDeleteDoorModal = () => {
        if (isDeletingDoor.value) return
        doorToDelete.value = null
    }
    const confirmDeleteDoor = async () => {
        if (!doorToDelete.value) return
        isDeletingDoor.value = true
        try {
            const deletedDoor = doorToDelete.value
            await buildingRepository.deleteDoor(deletedDoor.doorId, deletedDoor.isEntrance)
            clearMapMutationError()
            const isDeletedDoor = (door: DoorMapItem) => door.door_id === deletedDoor.doorId && door.is_entrance === deletedDoor.isEntrance
            doors.value = doors.value.filter((door) => !isDeletedDoor(door))
            transitionValidationDoors.value = transitionValidationDoors.value.filter((door) => !isDeletedDoor(door))
            deletableDoorIds.value = deletableDoorIds.value.filter((doorId) => doorId !== deletedDoor.doorId)
            doorToDelete.value = null
            scheduleMapSync({ force: true })
        } catch {
            setMapMutationError()
        } finally {
            isDeletingDoor.value = false
        }
    }
    const fetchDoorReaders = async () => {
        if (readerDoorId.value === 0) return
        isLoadingReaders.value = true
        readerErrorMessage.value = ''
        try {
            const [selectedResponse, availableResponse] = await Promise.all([
                buildingRepository.getDoorReader(readerDoorId.value),
                buildingRepository.getAvailableReadersForDoor(readerDoorId.value, {
                    search: readersSearch.value,
                    offset: readersOffset.value,
                    limit: readersLimit.value
                })
            ])
            selectedDoorReader.value = selectedResponse.data
            availableReaders.value = availableResponse.data.items
            readersTotal.value = availableResponse.data.total
        } catch {
            readerErrorMessage.value = serverErrorMessage()
        } finally {
            isLoadingReaders.value = false
        }
    }
    const openDoorReaderModal = async (doorId: number) => {
        readerDoorId.value = doorId
        readersOffset.value = 0
        generatedReaderToken.value = ''
        readerErrorMessage.value = ''
        await fetchDoorReaders()
    }
    const closeDoorReaderModal = () => {
        readerDoorId.value = 0
        selectedDoorReader.value = null
        availableReaders.value = []
        generatedReaderToken.value = ''
        readerErrorMessage.value = ''
    }
    const assignReaderToDoor = async (reader: RfidReaderItem) => {
        if (readerDoorId.value === 0) return
        readerErrorMessage.value = ''
        try {
            const previousReader = selectedDoorReader.value
            if (previousReader) await buildingRepository.removeReaderFromDoor(readerDoorId.value)
            await buildingRepository.assignReaderToDoor(readerDoorId.value, reader.rfid_reader_id)
            selectedDoorReader.value = reader
            availableReaders.value = availableReaders.value.filter((item) => item.rfid_reader_id !== reader.rfid_reader_id)
            if (previousReader) void fetchDoorReaders()
            doors.value = doors.value.map((door) => door.door_id === readerDoorId.value ? { ...door, rfid_reader_id: reader.rfid_reader_id } : door)
            transitionValidationDoors.value = transitionValidationDoors.value.map((door) =>
                door.door_id === readerDoorId.value ? { ...door, rfid_reader_id: reader.rfid_reader_id } : door
            )
        } catch {
            readerErrorMessage.value = serverErrorMessage()
        }
    }
    const unassignReaderFromDoor = async () => {
        if (readerDoorId.value === 0 || !selectedDoorReader.value) return
        readerErrorMessage.value = ''
        try {
            await buildingRepository.removeReaderFromDoor(readerDoorId.value)
            selectedDoorReader.value = null
            void fetchDoorReaders()
            doors.value = doors.value.map((door) => door.door_id === readerDoorId.value ? { ...door, rfid_reader_id: null } : door)
            transitionValidationDoors.value = transitionValidationDoors.value.map((door) =>
                door.door_id === readerDoorId.value ? { ...door, rfid_reader_id: null } : door
            )
        } catch {
            readerErrorMessage.value = serverErrorMessage()
        }
    }
    const openRegenerateReaderTokenModal = (reader: RfidReaderItem) => {
        readerToRegenerate.value = reader
    }
    const closeRegenerateReaderTokenModal = () => {
        if (isRegeneratingReaderToken.value) return
        readerToRegenerate.value = null
    }
    const confirmRegenerateReaderToken = async () => {
        if (!readerToRegenerate.value) return
        isRegeneratingReaderToken.value = true
        readerErrorMessage.value = ''
        try {
            const response = await buildingRepository.regenerateReaderToken(readerToRegenerate.value.rfid_reader_id)
            generatedReaderToken.value = response.data.new_secret_token
            readerToRegenerate.value = null
        } catch {
            readerErrorMessage.value = serverErrorMessage()
        } finally {
            isRegeneratingReaderToken.value = false
        }
    }
    const openDeleteReaderModal = (reader: RfidReaderItem) => {
        readerToDelete.value = reader
    }
    const closeDeleteReaderModal = () => {
        if (isDeletingReader.value) return
        readerToDelete.value = null
    }
    const confirmDeleteReader = async () => {
        if (!readerToDelete.value) return
        isDeletingReader.value = true
        readerErrorMessage.value = ''
        try {
            const readerId = readerToDelete.value.rfid_reader_id
            await buildingRepository.deleteReader(readerId)
            if (selectedDoorReader.value?.rfid_reader_id === readerId) selectedDoorReader.value = null
            availableReaders.value = availableReaders.value.filter((item) => item.rfid_reader_id !== readerId)
            readersTotal.value = Math.max(0, readersTotal.value - 1)
            readerToDelete.value = null
        } catch {
            readerErrorMessage.value = serverErrorMessage()
        } finally {
            isDeletingReader.value = false
        }
    }
    const openCreateReaderModal = () => {
        readerErrorMessage.value = ''
        readerModalMode.value = 'create'
        readerEditingId.value = 0
        readerNameValue.value = ''
        isReaderModalOpen.value = true
    }
    const openEditReaderModal = (reader: RfidReaderItem) => {
        readerErrorMessage.value = ''
        readerModalMode.value = 'edit'
        readerEditingId.value = reader.rfid_reader_id
        readerNameValue.value = reader.name
        isReaderModalOpen.value = true
    }
    const closeReaderModal = () => {
        if (isReaderSubmitting.value) return
        isReaderModalOpen.value = false
    }
    const submitReader = async () => {
        if (!canSubmitReader.value) return
        isReaderSubmitting.value = true
        readerErrorMessage.value = ''
        try {
            const name = readerNameValue.value.trim()
            if (readerModalMode.value === 'create') {
                const response = await buildingRepository.createReaderForDoor(readerDoorId.value, name)
                availableReaders.value = [response.data, ...availableReaders.value]
                readersTotal.value += 1
                generatedReaderToken.value = response.data.secret_token
            } else if (readerEditingId.value > 0) {
                await buildingRepository.updateReaderName(readerEditingId.value, name)
                if (selectedDoorReader.value?.rfid_reader_id === readerEditingId.value) {
                    selectedDoorReader.value = { ...selectedDoorReader.value, name }
                }
                availableReaders.value = availableReaders.value.map((item) =>
                    item.rfid_reader_id === readerEditingId.value ? { ...item, name } : item
                )
            }
            isReaderModalOpen.value = false
        } catch {
            readerErrorMessage.value = serverErrorMessage()
        } finally {
            isReaderSubmitting.value = false
        }
    }
    const copyGeneratedReaderToken = async () => {
        if (!generatedReaderToken.value) return
        await navigator.clipboard.writeText(generatedReaderToken.value)
        readerTokenCopySuccessMessage.value = ''
        window.setTimeout(() => {
            readerTokenCopySuccessMessage.value = translations.value.organizationAdmin.buildingPage.doorReader.copySuccess
        }, 0)
    }

    const formattedCreatedAt = computed(() => buildingCreatedAt.value ? formatDate(buildingCreatedAt.value) : '-')
    const canSubmitBuilding = computed(() => {
        const title = buildingTitleValue.value.trim()
        const address = buildingAddressValue.value.trim()
        return title.length > 0 && (title !== initialBuildingTitleValue.value || address !== initialBuildingAddressValue.value)
    })

    const canSubmitFloor = computed(() => {
        const value = floorNameValue.value.trim()
        if (value.length === 0) return false
        if (floorModalMode.value === 'create') return true
        return value !== initialFloorNameValue.value
    })
    const canSubmitPositionForm = computed(() => {
        const role = positionRoleValue.value.trim()
        const description = positionDescriptionValue.value.trim()
        if (role.length === 0) return false
        if (positionModalMode.value === 'create') return true
        return role !== initialPositionRoleValue.value || description !== initialPositionDescriptionValue.value
    })
    const canDeleteFloor = computed(() => floorsTotal.value > 1)
    const canDeleteFloorWithEntranceDoorRules = (floor: FloorItem) => {
        if (!canDeleteFloor.value || !floor.can_delete) return false

        const knownDoors = [...doors.value, ...transitionValidationDoors.value]

        return knownDoors.some((door) =>
            door.is_entrance
            && door.floor_id !== floor.floor_id
        )
    }
    const displayedFloors = computed(() => {
        const withCurrentDeleteRules = (floorList: FloorItem[]) => floorList.map((floor) => ({
            ...floor,
            can_delete: canDeleteFloorWithEntranceDoorRules(floor)
        }))

        if (draggedFloorId.value === 0 || dragOverFloorId.value === 0 || draggedFloorId.value === dragOverFloorId.value) {
            return withCurrentDeleteRules(floors.value)
        }
        const next = [...floors.value]
        const fromIndex = next.findIndex((floor) => floor.floor_id === draggedFloorId.value)
        const toIndex = next.findIndex((floor) => floor.floor_id === dragOverFloorId.value)
        if (fromIndex < 0 || toIndex < 0) return withCurrentDeleteRules(floors.value)
        const [draggedFloor] = next.splice(fromIndex, 1)
        next.splice(toIndex, 0, draggedFloor)
        return withCurrentDeleteRules(next.map((floor, index) => ({ ...floor, floor_number: index + 1 })))
    })
    const areSidebarTabsHidden = computed(() =>
        buildingMapMode.value === BuildingMapMode.EDIT
        || isEditingZone.value
        || isZoneCreateModalOpen.value
    )

    const fetchBuilding = async () => {
        isLoadingBuilding.value = true
        buildingErrorMessage.value = ''
        try {
            const response = await buildingEditDeleteRepository.getBuildingInfo(buildingId.value)
            building.value = response.data
            buildingCreatedAt.value = response.data.created_at
        } catch {
            buildingErrorMessage.value = serverErrorMessage()
            building.value = defaultBuilding
            buildingCreatedAt.value = ''
        } finally {
            isLoadingBuilding.value = false
        }
    }

    const fetchFloors = async () => {
        if (isLoadingFloors.value) return
        const requestId = ++floorsRequestId
        isLoadingFloors.value = true
        floorsErrorMessage.value = ''
        try {
            const params: OrganizationListParams = {
                search: floorsSearch.value,
                offset: floorsOffset.value,
                limit: floorsLimit.value
            }
            const response = await buildingRepository.getFloors(buildingId.value, params)
            if (requestId !== floorsRequestId) return
            floors.value = floorsOffset.value === 0 ? response.data.items : [...floors.value, ...response.data.items]
            floorsTotal.value = response.data.total
            if (selectedFloorId.value === 0 && response.data.items.length > 0) {
                const floorFromRoute = Number(route.query.floor)
                const selectedFloor = response.data.items.find((item) => item.floor_id === floorFromRoute)
                selectedFloorId.value = selectedFloor?.floor_id || response.data.items[0].floor_id
                runBackground(fetchMap())
            }
        } catch {
            if (requestId !== floorsRequestId) return
            floorsErrorMessage.value = serverErrorMessage()
            if (floorsOffset.value === 0) {
                floors.value = []
                floorsTotal.value = 0
            }
        } finally {
            if (requestId === floorsRequestId) isLoadingFloors.value = false
        }
    }

    const reloadFloors = async () => {
        if (floorsOffset.value !== 0) {
            floorsOffset.value = 0
            return
        }
        await fetchFloors()
    }

    const fetchCurrentBuildingEmployees = async () => {
        if (isLoadingBuildingEmployees.value) return
        const requestId = ++buildingEmployeesRequestId
        isLoadingBuildingEmployees.value = true
        buildingEmployeesErrorMessage.value = ''
        try {
            if (selectedFloorId.value === 0) {
                currentBuildingEmployees.value = []
                buildingEmployeesTotal.value = 0
                return
            }
            const response = await buildingRepository.getCurrentFloorEmployees(selectedFloorId.value, {
                search: buildingEmployeesSearch.value,
                offset: buildingEmployeesOffset.value,
                limit: buildingEmployeesLimit.value
            })
            if (requestId !== buildingEmployeesRequestId) return
            currentBuildingEmployees.value = buildingEmployeesOffset.value === 0
                ? response.data.items
                : [...currentBuildingEmployees.value, ...response.data.items]
            buildingEmployeesTotal.value = response.data.total
        } catch {
            if (requestId !== buildingEmployeesRequestId) return
            buildingEmployeesErrorMessage.value = serverErrorMessage()
            if (buildingEmployeesOffset.value === 0) {
                currentBuildingEmployees.value = []
                buildingEmployeesTotal.value = 0
            }
        } finally {
            if (requestId === buildingEmployeesRequestId) isLoadingBuildingEmployees.value = false
        }
    }

    const matchesBuildingEmployeesSearch = (
        employee: Pick<CurrentBuildingEmployee, 'full_name' | 'email' | 'zone_title' | 'floor_number'>
    ) => {
        const query = buildingEmployeesSearch.value.trim().toLowerCase()
        if (!query) return true

        return [
            employee.full_name,
            employee.email,
            employee.zone_title,
            employee.floor_number === null ? '' : String(employee.floor_number)
        ]
            .some((value) => value.toLowerCase().includes(query))
    }

    const updateCurrentBuildingEmployeesFromLocation = (payload: EmployeeLocationSocketPayload) => {
        const existingIndex = currentBuildingEmployees.value.findIndex((item) => item.employee_id === payload.employee_id)

        const zone = zones.value.find((item) => item.zone_id === payload.zone_id)
        const nextEmployee: CurrentBuildingEmployee = {
            employee_id: payload.employee_id,
            full_name: payload.full_name,
            email: payload.email,
            photo: buildingEmployeePhotoService.resolveEmployeePhotoUrl(payload.photo),
            zone_id: payload.zone_id,
            zone_title: zone?.title || '',
            floor_id: payload.floor_id,
            floor_number: payload.floor_number,
            last_scan_at: payload.timestamp
        }

        if (!matchesBuildingEmployeesSearch(nextEmployee)) {
            if (existingIndex >= 0) {
                currentBuildingEmployees.value = currentBuildingEmployees.value.filter((item) => item.employee_id !== payload.employee_id)
                buildingEmployeesTotal.value = Math.max(0, buildingEmployeesTotal.value - 1)
            }
            return
        }

        if (buildingEmployeesOffset.value === 0) {
            const withoutEmployee = currentBuildingEmployees.value.filter((item) => item.employee_id !== payload.employee_id)
            currentBuildingEmployees.value = [nextEmployee, ...withoutEmployee].slice(0, buildingEmployeesLimit.value)
        } else if (existingIndex >= 0) {
            currentBuildingEmployees.value = currentBuildingEmployees.value.map((item) =>
                item.employee_id === payload.employee_id ? nextEmployee : item
            )
        }

        if (existingIndex < 0) {
            buildingEmployeesTotal.value += 1
        }
    }

    const connectLocationsSocket = () => {
        if (
            buildingMapMode.value !== BuildingMapMode.VIEW ||
            buildingId.value === 0 ||
            selectedFloorId.value === 0
        ) {
            buildingLocationsSocketService.disconnect()
            return
        }

        buildingLocationsSocketService.connect(
            authStore.orgToken || '',
            buildingId.value,
            selectedFloorId.value
        )
    }

    const getSelectedEmployeeId = () => {
        if (!selectedMemberProfile.value || selectedMemberProfile.value.role !== 'employee') return null
        return selectedMemberProfile.value.id
    }

    const fetchAssignedMemberPositions = async () => {
        const employeeId = getSelectedEmployeeId()
        if (employeeId === null || building.value.organization_id === 0) {
            assignedMemberPositions.value = []
            assignedPositionsTotal.value = 0
            return
        }

        isLoadingMemberPositions.value = true
        memberPositionsErrorMessage.value = ''
        try {
            const response = await positionsRepository.getMemberPositions(building.value.organization_id, employeeId, {
                search: assignedPositionsSearchValue.value,
                offset: assignedPositionsOffset.value,
                limit: memberPositionsLimit
            })
            assignedMemberPositions.value = assignedPositionsOffset.value === 0
                ? response.data.items
                : [...assignedMemberPositions.value, ...response.data.items]
            assignedPositionsTotal.value = response.data.total
        } catch {
            memberPositionsErrorMessage.value = serverErrorMessage()
        } finally {
            isLoadingMemberPositions.value = false
        }
    }

    const fetchAvailableMemberPositions = async () => {
        const employeeId = getSelectedEmployeeId()
        if (employeeId === null || building.value.organization_id === 0) {
            availableMemberPositions.value = []
            availablePositionsTotal.value = 0
            return
        }

        isLoadingAvailablePositions.value = true
        memberPositionsErrorMessage.value = ''
        try {
            const response = await positionsRepository.getUnassignedEmployeePositions(building.value.organization_id, employeeId, {
                search: availablePositionsSearchValue.value,
                offset: availablePositionsOffset.value,
                limit: memberPositionsLimit
            })
            availableMemberPositions.value = availablePositionsOffset.value === 0
                ? response.data.items
                : [...availableMemberPositions.value, ...response.data.items]
            availablePositionsTotal.value = response.data.total
        } catch {
            memberPositionsErrorMessage.value = serverErrorMessage()
        } finally {
            isLoadingAvailablePositions.value = false
        }
    }

    const updateBuildingMapMode = (mode: BuildingMapMode) => {
        buildingMapMode.value = mode
        void syncMapModeToRoute(mode)
        if (mode === BuildingMapMode.VIEW) {
            scheduleMapSync()
            if (sidePanelTab.value === 'employees') runBackground(fetchCurrentBuildingEmployees())
            connectLocationsSocket()
            return
        }
        buildingLocationsSocketService.disconnect()
    }

    const selectSidePanelTab = (tab: 'floors' | 'employees') => {
        if (tab === 'employees' && areSidebarTabsHidden.value) {
            sidePanelTab.value = tab
            return
        }
        sidePanelTab.value = tab
        void syncSidePanelTabToRoute(tab)
        if (tab === 'floors') {
            floorsOffset.value = 0
        } else {
            buildingEmployeesOffset.value = 0
        }
        if (tab === 'employees') runBackground(fetchCurrentBuildingEmployees())
    }

    const getRoleLabel = (role: OrganizationMemberProfile['role']) => {
        if (role === 'organization_admin') return translations.value.organizationAdmin.page.table.roleLabels.organizationAdmin
        if (role === 'tag_admin') return translations.value.organizationAdmin.page.table.roleLabels.tagAdmin
        return translations.value.organizationAdmin.page.table.roleLabels.employee
    }

    const openBuildingEmployeeInfo = async (employee: CurrentBuildingEmployee) => {
        if (building.value.organization_id === 0) return
        isMemberPositionsModalOpen.value = false
        isMemberInfoModalOpen.value = true
        isLoadingMemberProfile.value = true
        selectedMemberProfile.value = {
            id: employee.employee_id,
            full_name: employee.full_name,
            email: employee.email,
            phone: null,
            photo: employee.photo,
            role: 'employee',
            created_at: employee.last_scan_at || ''
        }

        memberInfoErrorMessage.value = ''
        try {
            const response = await participantsControlRepository.getMemberProfile(
                building.value.organization_id,
                employee.employee_id,
                'employee'
            )
            selectedMemberProfile.value = response.data
        } catch {
            memberInfoErrorMessage.value = serverErrorMessage()
        } finally {
            isLoadingMemberProfile.value = false
        }
    }

    const openEmployeeLocationInfo = (employee: EmployeeLocation) => {
        const zone = zones.value.find((item) => item.zone_id === employee.zone_id)
        void openBuildingEmployeeInfo({
            employee_id: employee.employee_id,
            full_name: employee.full_name,
            email: employee.email,
            photo: employee.photo,
            zone_id: employee.zone_id,
            zone_title: zone?.title || '',
            floor_id: selectedFloorId.value,
            floor_number: floors.value.find((floor) => floor.floor_id === selectedFloorId.value)?.floor_number ?? null,
            last_scan_at: null
        })
    }

    const closeMemberInfoModal = () => {
        isMemberInfoModalOpen.value = false
    }

    const closeMemberPositionsModal = () => {
        isMemberPositionsModalOpen.value = false
        isPositionsEditMode.value = false
    }

    const expelModalMessage = computed(() => {
        if (!employeeToExpel.value) return ''
        return `${translations.value.organizationAdmin.page.modals.expelMember.messageEmployee} "${employeeToExpel.value.full_name}"?`
    })
    const movementReportMinDate = computed(() => {
        if (!buildingCreatedAt.value) return ''
        return new Date(buildingCreatedAt.value).toISOString().slice(0, 10)
    })
    const movementReportMaxDate = computed(() => new Date().toISOString().slice(0, 10))
    const canDownloadMovementReport = computed(() =>
        Boolean(employeeForMovementReport.value)
        && Boolean(movementReportDateValue.value)
        && (!movementReportMinDate.value || movementReportDateValue.value >= movementReportMinDate.value)
        && movementReportDateValue.value <= movementReportMaxDate.value
    )

    const openExpelModal = (employee: CurrentBuildingEmployee) => {
        employeeToExpel.value = employee
        isExpelModalOpen.value = true
    }

    const openEmployeeMovementReport = (employee: CurrentBuildingEmployee) => {
        employeeForMovementReport.value = employee
        const today = movementReportMaxDate.value
        const minDate = movementReportMinDate.value
        movementReportDateValue.value = minDate && today < minDate ? minDate : today
        isMovementReportModalOpen.value = true
    }

    const closeEmployeeMovementReport = () => {
        if (isDownloadingMovementReport.value) return
        isMovementReportModalOpen.value = false
        employeeForMovementReport.value = null
    }

    const downloadEmployeeMovementReport = async () => {
        if (!employeeForMovementReport.value || !canDownloadMovementReport.value) return
        isDownloadingMovementReport.value = true
        movementReportErrorMessage.value = ''
        try {
            const response = await buildingRepository.getEmployeeDailyMovements(
                buildingId.value,
                employeeForMovementReport.value.employee_id,
                movementReportDateValue.value
            )
            isMovementReportModalOpen.value = false
            employeeForMovementReport.value = null
            await employeeMovementReportService.download({
                building: building.value,
                report: response.data,
                date: movementReportDateValue.value,
                translations: translations.value.organizationAdmin.buildingPage.employeeMovementReport,
                locale: localStorage.getItem('lang') === 'en' ? 'en-US' : 'uk-UA',
                isDark: localStorage.getItem('theme') !== 'light'
            })
        } catch {
            movementReportErrorMessage.value = serverErrorMessage()
        } finally {
            isDownloadingMovementReport.value = false
        }
    }

    const closeExpelModal = () => {
        if (isExpellingMember.value) return
        employeeToExpel.value = null
        isExpelModalOpen.value = false
    }

    const confirmExpelMember = async () => {
        if (!employeeToExpel.value || building.value.organization_id === 0) return
        isExpellingMember.value = true
        expelMemberErrorMessage.value = ''
        try {
            await participantsControlRepository.removeEmployee(building.value.organization_id, employeeToExpel.value.employee_id)
            currentBuildingEmployees.value = currentBuildingEmployees.value.filter((employee) =>
                employee.employee_id !== employeeToExpel.value?.employee_id
            )
            buildingEmployeesTotal.value = Math.max(0, buildingEmployeesTotal.value - 1)
            employeeToExpel.value = null
            isExpelModalOpen.value = false
        } catch {
            expelMemberErrorMessage.value = serverErrorMessage()
        } finally {
            isExpellingMember.value = false
        }
    }

    const viewMemberPositions = async () => {
        if (getSelectedEmployeeId() === null) return
        isMemberInfoModalOpen.value = false
        isMemberPositionsModalOpen.value = true
        isPositionsEditMode.value = false
        assignedPositionsOffset.value = 0
        availablePositionsOffset.value = 0
        assignedPositionsSearchValue.value = ''
        availablePositionsSearchValue.value = ''
        availableMemberPositions.value = []
        await fetchAssignedMemberPositions()
    }

    const backToMemberInfo = () => {
        isMemberPositionsModalOpen.value = false
        isPositionsEditMode.value = false
        isMemberInfoModalOpen.value = true
    }

    const startEditMemberPositions = async () => {
        isPositionsEditMode.value = true
        availablePositionsOffset.value = 0
        await fetchAvailableMemberPositions()
    }

    const finishEditMemberPositions = () => {
        isPositionsEditMode.value = false
        availablePositionsSearchValue.value = ''
        availableMemberPositions.value = []
    }

    const openCreatePositionModal = () => {
        positionFormErrorMessage.value = ''
        positionModalMode.value = 'create'
        positionToEditId.value = null
        positionRoleValue.value = ''
        positionDescriptionValue.value = ''
        initialPositionRoleValue.value = ''
        initialPositionDescriptionValue.value = ''
        isPositionUpsertModalOpen.value = true
    }

    const openEditPositionModal = (positionId: number) => {
        const targetPosition = assignedMemberPositions.value.find((position) => position.position_id === positionId)
            || availableMemberPositions.value.find((position) => position.position_id === positionId)
        if (!targetPosition) return

        positionFormErrorMessage.value = ''
        positionModalMode.value = 'edit'
        positionToEditId.value = targetPosition.position_id
        positionRoleValue.value = targetPosition.role
        positionDescriptionValue.value = targetPosition.description || ''
        initialPositionRoleValue.value = targetPosition.role.trim()
        initialPositionDescriptionValue.value = (targetPosition.description || '').trim()
        isPositionUpsertModalOpen.value = true
    }

    const closePositionUpsertModal = () => {
        if (isPositionSubmitting.value) return
        isPositionUpsertModalOpen.value = false
    }

    const submitPosition = async () => {
        if (!canSubmitPositionForm.value || building.value.organization_id === 0) return
        isPositionSubmitting.value = true
        positionFormErrorMessage.value = ''
        try {
            const normalizedDescription = positionDescriptionValue.value.trim()
            const payload = {
                role: positionRoleValue.value.trim(),
                description: normalizedDescription.length > 0 ? normalizedDescription : null
            }
            if (positionModalMode.value === 'create') {
                const response = await positionsRepository.createPosition({
                    organization_id: building.value.organization_id,
                    ...payload
                })
                if (isPositionsEditMode.value) {
                    availableMemberPositions.value = [response.data, ...availableMemberPositions.value]
                    availablePositionsTotal.value += 1
                }
            } else if (positionToEditId.value !== null) {
                await positionsRepository.updatePosition(positionToEditId.value, payload)
                assignedMemberPositions.value = assignedMemberPositions.value.map((position) =>
                    position.position_id === positionToEditId.value ? { ...position, ...payload } : position
                )
                availableMemberPositions.value = availableMemberPositions.value.map((position) =>
                    position.position_id === positionToEditId.value ? { ...position, ...payload } : position
                )
            }
            closePositionUpsertModal()
        } catch {
            positionFormErrorMessage.value = serverErrorMessage()
        } finally {
            isPositionSubmitting.value = false
        }
    }

    const openDeletePositionModal = (positionId: number) => {
        deletePositionErrorMessage.value = ''
        positionToDeleteId.value = positionId
        isDeletePositionModalOpen.value = true
    }

    const closeDeletePositionModal = () => {
        if (isDeletingPosition.value) return
        positionToDeleteId.value = null
        isDeletePositionModalOpen.value = false
    }

    const confirmDeletePosition = async () => {
        if (positionToDeleteId.value === null) return
        isDeletingPosition.value = true
        deletePositionErrorMessage.value = ''
        try {
            await positionsRepository.deletePosition(positionToDeleteId.value)
            assignedMemberPositions.value = assignedMemberPositions.value.filter((position) => position.position_id !== positionToDeleteId.value)
            availableMemberPositions.value = availableMemberPositions.value.filter((position) => position.position_id !== positionToDeleteId.value)
            assignedPositionsTotal.value = Math.max(0, assignedPositionsTotal.value - 1)
            availablePositionsTotal.value = Math.max(0, availablePositionsTotal.value - 1)
            closeDeletePositionModal()
        } catch {
            deletePositionErrorMessage.value = serverErrorMessage()
        } finally {
            isDeletingPosition.value = false
        }
    }

    const assignPositionToMember = async (positionId: number) => {
        const employeeId = getSelectedEmployeeId()
        if (employeeId === null || !isPositionsEditMode.value) return
        isLoadingMemberPositions.value = true
        isLoadingAvailablePositions.value = true
        memberPositionsErrorMessage.value = ''
        try {
            await positionsRepository.assignPosition(employeeId, positionId)
            availableMemberPositions.value = availableMemberPositions.value.filter((position) => position.position_id !== positionId)
            availablePositionsTotal.value = Math.max(0, availablePositionsTotal.value - 1)
            assignedPositionsOffset.value = 0
            await fetchAssignedMemberPositions()
        } catch {
            memberPositionsErrorMessage.value = serverErrorMessage()
        } finally {
            isLoadingMemberPositions.value = false
            isLoadingAvailablePositions.value = false
        }
    }

    const unassignPositionFromMember = async (positionId: number) => {
        const employeeId = getSelectedEmployeeId()
        if (employeeId === null || !isPositionsEditMode.value) return
        isLoadingMemberPositions.value = true
        isLoadingAvailablePositions.value = true
        memberPositionsErrorMessage.value = ''
        try {
            await positionsRepository.unassignPosition(employeeId, positionId)
            assignedMemberPositions.value = assignedMemberPositions.value.filter((position) => position.position_id !== positionId)
            assignedPositionsTotal.value = Math.max(0, assignedPositionsTotal.value - 1)
            if (isPositionsEditMode.value) {
                availablePositionsOffset.value = 0
                await fetchAvailableMemberPositions()
            }
        } catch {
            memberPositionsErrorMessage.value = serverErrorMessage()
        } finally {
            isLoadingMemberPositions.value = false
            isLoadingAvailablePositions.value = false
        }
    }

    const openEditBuildingModal = () => {
        buildingFormErrorMessage.value = ''
        buildingTitleValue.value = building.value.title
        buildingAddressValue.value = building.value.address || ''
        initialBuildingTitleValue.value = building.value.title.trim()
        initialBuildingAddressValue.value = (building.value.address || '').trim()
        isBuildingModalOpen.value = true
    }

    const closeBuildingModal = () => {
        isBuildingModalOpen.value = false
    }

    const submitBuilding = async () => {
        if (!canSubmitBuilding.value) return
        isBuildingSubmitting.value = true
        buildingFormErrorMessage.value = ''
        try {
            const address = buildingAddressValue.value.trim()
            const response = await buildingEditDeleteRepository.updateBuilding(buildingId.value, {
                title: buildingTitleValue.value.trim(),
                address: address.length > 0 ? address : null
            })
            building.value = response.data
            closeBuildingModal()
        } catch {
            buildingFormErrorMessage.value = serverErrorMessage()
        } finally {
            isBuildingSubmitting.value = false
        }
    }

    const openCreateFloorModal = () => {
        floorFormErrorMessage.value = ''
        floorModalMode.value = 'create'
        floorEditingId.value = 0
        floorNameValue.value = ''
        initialFloorNameValue.value = ''
        isFloorModalOpen.value = true
    }

    const openEditFloorModal = (floor: FloorItem) => {
        floorFormErrorMessage.value = ''
        floorModalMode.value = 'edit'
        floorEditingId.value = floor.floor_id
        floorNameValue.value = floor.floor_name
        initialFloorNameValue.value = floor.floor_name.trim()
        isFloorModalOpen.value = true
    }

    const closeFloorModal = () => {
        isFloorModalOpen.value = false
    }

    const submitFloor = async () => {
        if (!canSubmitFloor.value) return
        isFloorSubmitting.value = true
        floorFormErrorMessage.value = ''
        try {
            if (floorModalMode.value === 'create') {
                await buildingRepository.createFloor(buildingId.value, {
                    floor_number: floorsTotal.value + 1,
                    floor_name: floorNameValue.value.trim()
                })
                await reloadFloors()
                const created = floors.value.find((item) => item.floor_name === floorNameValue.value.trim())
                if (created) {
                    selectedFloorId.value = created.floor_id
                }
            } else {
                await buildingRepository.updateFloorName(floorEditingId.value, floorNameValue.value.trim())
                floors.value = floors.value.map((floor) => floor.floor_id === floorEditingId.value
                    ? { ...floor, floor_name: floorNameValue.value.trim() }
                    : floor)
            }
            closeFloorModal()
        } catch {
            floorFormErrorMessage.value = serverErrorMessage()
        } finally {
            isFloorSubmitting.value = false
        }
    }

    const reorderFloor = async (floor: FloorItem, direction: -1 | 1) => {
        const nextNumber = floor.floor_number + direction
        if (nextNumber < 1 || nextNumber > floorsTotal.value) return
        await buildingRepository.reorderFloor(floor.floor_id, nextNumber)
        await reloadFloors()
    }

    const startFloorDrag = (floor: FloorItem, event: DragEvent) => {
        event.dataTransfer?.setData('text/plain', String(floor.floor_id))
        if (event.dataTransfer) {
            event.dataTransfer.effectAllowed = 'move'
        }
        draggedFloorId.value = floor.floor_id
        dragOverFloorId.value = floor.floor_id
    }

    const moveFloorDrag = (floor: FloorItem) => {
        if (draggedFloorId.value === 0 || dragOverFloorId.value === floor.floor_id) return
        dragOverFloorId.value = floor.floor_id
    }

    const finishFloorDrag = async () => {
        if (draggedFloorId.value === 0 || dragOverFloorId.value === 0 || draggedFloorId.value === dragOverFloorId.value) {
            draggedFloorId.value = 0
            dragOverFloorId.value = 0
            return
        }
        const target = displayedFloors.value.find((floor) => floor.floor_id === draggedFloorId.value)
        const floorId = draggedFloorId.value
        draggedFloorId.value = 0
        dragOverFloorId.value = 0
        if (!target) return
        await buildingRepository.reorderFloor(floorId, target.floor_number)
        await reloadFloors()
    }

    const cancelFloorDrag = () => {
        draggedFloorId.value = 0
        dragOverFloorId.value = 0
    }

    const openDeleteFloorModal = (floorId: number) => {
        deleteFloorErrorMessage.value = ''
        floorToDeleteId.value = floorId
    }

    const closeDeleteFloorModal = () => {
        floorToDeleteId.value = 0
    }

    const confirmDeleteFloor = async () => {
        if (floorToDeleteId.value === 0) return
        isDeletingFloor.value = true
        deleteFloorErrorMessage.value = ''
        try {
            const deletedFloorIndex = floors.value.findIndex((floor) => floor.floor_id === floorToDeleteId.value)
            const fallbackFloorId = deletedFloorIndex > 0
                ? floors.value[deletedFloorIndex - 1]?.floor_id
                : floors.value.find((floor) => floor.floor_id !== floorToDeleteId.value)?.floor_id
            await buildingRepository.deleteFloor(floorToDeleteId.value)
            floors.value = floors.value.filter((floor) => floor.floor_id !== floorToDeleteId.value)
            floorsTotal.value = Math.max(0, floorsTotal.value - 1)
            if (selectedFloorId.value === floorToDeleteId.value) {
                selectedFloorId.value = fallbackFloorId || floors.value[0]?.floor_id || 0
            }
            closeDeleteFloorModal()
            await reloadFloors()
        } catch {
            deleteFloorErrorMessage.value = serverErrorMessage()
        } finally {
            isDeletingFloor.value = false
        }
    }

    const openDeleteBuildingModal = () => {
        deleteBuildingErrorMessage.value = ''
        isDeleteBuildingModalOpen.value = true
    }

    const closeDeleteBuildingModal = () => {
        isDeleteBuildingModalOpen.value = false
    }

    const confirmDeleteBuilding = async () => {
        deleteBuildingErrorMessage.value = ''
        try {
            await buildingEditDeleteRepository.deleteBuilding(buildingId.value)
            await router.push({ name: 'Organizations' })
        } catch {
            deleteBuildingErrorMessage.value = serverErrorMessage()
        }
    }

    const toggleFloorsCollapsed = () => {
        if (floorsCollapseTimeout !== null) {
            window.clearTimeout(floorsCollapseTimeout)
        }

        if (!isFloorsCollapsed.value) {
            isFloorsCollapsed.value = true
            void syncFloorsStateToRoute(true)
            floorsCollapseTimeout = window.setTimeout(() => {
                isBuildingMapExpanded.value = true
            }, BUILDING_MAP_PREVIEW_CONSTANTS.FLOORS_COLLAPSE_ANIMATION_MS)
            return
        }

        isBuildingMapExpanded.value = false
        void syncFloorsStateToRoute(false)
        floorsCollapseTimeout = window.setTimeout(() => {
            isFloorsCollapsed.value = false
        }, BUILDING_MAP_PREVIEW_CONSTANTS.FLOORS_COLLAPSE_ANIMATION_MS)
    }

    onMounted(() => {
        unsubscribeLocationListener = buildingLocationsSocketService.addListener(updateCurrentBuildingEmployeesFromLocation)
        applyFloorsStateImmediately(getFloorsStateFromQuery())
        if (route.query.floors !== 'collapsed' && route.query.floors !== 'expanded') {
            void syncFloorsStateToRoute(false)
        }
        runBackground(fetchBuilding())
        runBackground(fetchFloors())
    })

    watch(
        () => route.query.floors,
        () => {
            applyFloorsStateImmediately(getFloorsStateFromQuery())
        }
    )

    watch(selectedFloorId, () => {
        void syncSelectedFloorToRoute(selectedFloorId.value)
        cancelScheduledMapSync()
        runBackground(fetchMap({ force: true }))
        buildingEmployeesOffset.value = 0
        if (sidePanelTab.value === 'employees') runBackground(fetchCurrentBuildingEmployees())
        connectLocationsSocket()
    })

    watch(
        () => route.query.floor,
        () => {
            const floorFromRoute = Number(route.query.floor)
            if (!floorFromRoute || selectedFloorId.value === floorFromRoute) return
            if (floors.value.some((floor) => floor.floor_id === floorFromRoute)) {
                selectedFloorId.value = floorFromRoute
            }
        }
    )

    watch(
        () => route.query.tab,
        () => {
            const tab = route.query.tab === 'employees' ? 'employees' : 'floors'
            if (sidePanelTab.value === tab) return
            if (tab === 'employees' && areSidebarTabsHidden.value) {
                sidePanelTab.value = tab
                return
            }
            selectSidePanelTab(tab)
        }
    )

    watch(
        () => route.query.mode,
        () => {
            const mode = route.query.mode === BuildingMapMode.EDIT ? BuildingMapMode.EDIT : BuildingMapMode.VIEW
            if (buildingMapMode.value !== mode) updateBuildingMapMode(mode)
        }
    )

    watch(viewport, () => {
        scheduleMapSync()
    })

    watch(floorsSearch, () => {
        if (floorsOffset.value !== 0) {
            floorsOffset.value = 0
            return
        }
        if (floorsSearchDebounce !== null) {
            window.clearTimeout(floorsSearchDebounce)
        }
        if (floorsCollapseTimeout !== null) {
            window.clearTimeout(floorsCollapseTimeout)
        }
        floorsSearchDebounce = window.setTimeout(() => {
            runBackground(fetchFloors())
        }, DATA_TABLE_CONSTANTS.SEARCH_DEBOUNCE_MS)
    })

    watch(buildingEmployeesSearch, () => {
        if (buildingEmployeesOffset.value !== 0) {
            buildingEmployeesOffset.value = 0
            return
        }
        if (buildingEmployeesSearchDebounce !== null) window.clearTimeout(buildingEmployeesSearchDebounce)
        buildingEmployeesSearchDebounce = window.setTimeout(() => {
            runBackground(fetchCurrentBuildingEmployees())
        }, DATA_TABLE_CONSTANTS.SEARCH_DEBOUNCE_MS)
    })

    watch(floorsOffset, () => {
        runBackground(fetchFloors())
    })

    watch(buildingEmployeesOffset, () => {
        runBackground(fetchCurrentBuildingEmployees())
    })

    watch(assignedPositionsSearchValue, () => {
        assignedPositionsOffset.value = 0
        if (!isMemberPositionsModalOpen.value) return
        if (assignedPositionsSearchDebounce !== null) window.clearTimeout(assignedPositionsSearchDebounce)
        assignedPositionsSearchDebounce = window.setTimeout(() => {
            runBackground(fetchAssignedMemberPositions())
        }, DATA_TABLE_CONSTANTS.SEARCH_DEBOUNCE_MS)
    })

    watch(assignedPositionsOffset, () => {
        if (isMemberPositionsModalOpen.value) runBackground(fetchAssignedMemberPositions())
    })

    watch(availablePositionsSearchValue, () => {
        availablePositionsOffset.value = 0
        if (!isMemberPositionsModalOpen.value || !isPositionsEditMode.value) return
        if (availablePositionsSearchDebounce !== null) window.clearTimeout(availablePositionsSearchDebounce)
        availablePositionsSearchDebounce = window.setTimeout(() => {
            runBackground(fetchAvailableMemberPositions())
        }, DATA_TABLE_CONSTANTS.SEARCH_DEBOUNCE_MS)
    })

    watch(availablePositionsOffset, () => {
        if (isMemberPositionsModalOpen.value && isPositionsEditMode.value) runBackground(fetchAvailableMemberPositions())
    })

    watch(readersSearch, () => {
        if (readersOffset.value !== 0) {
            readersOffset.value = 0
            return
        }
        if (readersSearchDebounce !== null) window.clearTimeout(readersSearchDebounce)
        readersSearchDebounce = window.setTimeout(() => {
            runBackground(fetchDoorReaders())
        }, DATA_TABLE_CONSTANTS.SEARCH_DEBOUNCE_MS)
    })

    watch(readersOffset, () => {
        runBackground(fetchDoorReaders())
    })

    onBeforeUnmount(() => {
        if (floorsSearchDebounce !== null) {
            window.clearTimeout(floorsSearchDebounce)
        }
        if (readersSearchDebounce !== null) {
            window.clearTimeout(readersSearchDebounce)
        }
        if (buildingEmployeesSearchDebounce !== null) {
            window.clearTimeout(buildingEmployeesSearchDebounce)
        }
        if (assignedPositionsSearchDebounce !== null) {
            window.clearTimeout(assignedPositionsSearchDebounce)
        }
        if (availablePositionsSearchDebounce !== null) {
            window.clearTimeout(availablePositionsSearchDebounce)
        }
        unsubscribeLocationListener?.()
        unsubscribeLocationListener = null
        buildingLocationsSocketService.disconnect()
    })

    return {
        building,
        formatDate,
        formattedCreatedAt,
        floors,
        displayedFloors,
        draggedFloorId,
        zones,
        transitionValidationZones,
        transitionValidationDoors,
        deletableZoneIds,
        visibleDeletableZoneIds,
        visibleDeletableDoorIds,
        deletableDoorIds,
        doors,
        currentBuildingEmployees,
        sidePanelTab,
        selectedFloorId,
        floorsSearch,
        buildingEmployeesSearch,
        floorsOffset,
        buildingEmployeesOffset,
        floorsLimit,
        buildingEmployeesLimit,
        floorsTotal,
        buildingEmployeesTotal,
        viewport,
        buildingMapMode,
        areSidebarTabsHidden,
        isFloorsCollapsed,
        isBuildingMapExpanded,
        isLoadingBuilding,
        buildingErrorMessage,
        isLoadingFloors,
        floorsErrorMessage,
        isLoadingBuildingEmployees,
        buildingEmployeesErrorMessage,
        isExpelModalOpen,
        isExpellingMember,
        expelMemberErrorMessage,
        employeeForMovementReport,
        movementReportDateValue,
        movementReportMinDate,
        movementReportMaxDate,
        isMovementReportModalOpen,
        isDownloadingMovementReport,
        movementReportErrorMessage,
        canDownloadMovementReport,
        isLoadingMap,
        mapErrorMessage,
        selectedMemberProfile,
        isMemberInfoModalOpen,
        isLoadingMemberProfile,
        memberInfoErrorMessage,
        isMemberPositionsModalOpen,
        isPositionsEditMode,
        isLoadingMemberPositions,
        isLoadingAvailablePositions,
        memberPositionsErrorMessage,
        assignedMemberPositions,
        availableMemberPositions,
        assignedPositionsSearchValue,
        availablePositionsSearchValue,
        assignedPositionsOffset,
        availablePositionsOffset,
        assignedPositionsTotal,
        availablePositionsTotal,
        memberPositionsLimit,
        isPositionUpsertModalOpen,
        positionModalMode,
        positionRoleValue,
        positionDescriptionValue,
        isPositionSubmitting,
        positionFormErrorMessage,
        canSubmitPositionForm,
        isDeletePositionModalOpen,
        isDeletingPosition,
        deletePositionErrorMessage,
        isBuildingModalOpen,
        buildingTitleValue,
        buildingAddressValue,
        isBuildingSubmitting,
        buildingFormErrorMessage,
        canSubmitBuilding,
        isFloorModalOpen,
        floorModalMode,
        floorNameValue,
        isFloorSubmitting,
        floorFormErrorMessage,
        canSubmitFloor,
        isZoneCreateModalOpen,
        zoneTitleValue,
        zoneIsTransitionBetweenFloors,
        zoneCanCreateTransition,
        zoneHideTypeTabs,
        zoneCreateErrorMessage,
        isZoneSubmitting,
        isEditingZone,
        accessRulesZoneId,
        accessRulesZoneTitle,
        canSubmitZone,
        canDeleteFloor,
        isDeleteBuildingModalOpen,
        deleteBuildingErrorMessage,
        floorToDeleteId,
        isDeletingFloor,
        deleteFloorErrorMessage,
        zoneToDeleteId,
        isDeletingZone,
        doorToDelete,
        isDeletingDoor,
        readerDoorId,
        selectedDoorReader,
        availableReaders,
        readersSearch,
        readersOffset,
        readersLimit,
        readersTotal,
        isLoadingReaders,
        readerErrorMessage,
        generatedReaderToken,
        isReaderModalOpen,
        readerModalMode,
        readerNameValue,
        isReaderSubmitting,
        readerToDelete,
        isDeletingReader,
        readerToRegenerate,
        isRegeneratingReaderToken,
        readerTokenCopySuccessMessage,
        canSubmitReader,
        expelModalMessage,
        openEditBuildingModal,
        closeBuildingModal,
        submitBuilding,
        openCreateFloorModal,
        openEditFloorModal,
        closeFloorModal,
        submitFloor,
        reorderFloor,
        startFloorDrag,
        moveFloorDrag,
        finishFloorDrag,
        cancelFloorDrag,
        openDeleteFloorModal,
        closeDeleteFloorModal,
        confirmDeleteFloor,
        openDeleteBuildingModal,
        closeDeleteBuildingModal,
        confirmDeleteBuilding,
        updateViewport,
        updateBuildingMapMode,
        selectSidePanelTab,
        openBuildingEmployeeInfo,
        openEmployeeLocationInfo,
        openEmployeeMovementReport,
        closeEmployeeMovementReport,
        downloadEmployeeMovementReport,
        openExpelModal,
        closeExpelModal,
        confirmExpelMember,
        closeMemberInfoModal,
        closeMemberPositionsModal,
        viewMemberPositions,
        backToMemberInfo,
        startEditMemberPositions,
        finishEditMemberPositions,
        openCreatePositionModal,
        openEditPositionModal,
        closePositionUpsertModal,
        submitPosition,
        openDeletePositionModal,
        closeDeletePositionModal,
        confirmDeletePosition,
        assignPositionToMember,
        unassignPositionFromMember,
        getRoleLabel,
        toggleFloorsCollapsed,
        commitZoneGeometry,
        shiftZone,
        updateZoneTitle,
        updateZonePhoto,
        openZoneAccessRulesModal,
        closeZoneAccessRulesModal,
        addZone,
        closeZoneCreateModal,
        submitZone,
        openDeleteZoneModal,
        closeDeleteZoneModal,
        confirmDeleteZone,
        addDoor,
        openDeleteDoorModal,
        closeDeleteDoorModal,
        confirmDeleteDoor,
        openDoorReaderModal,
        closeDoorReaderModal,
        assignReaderToDoor,
        unassignReaderFromDoor,
        openRegenerateReaderTokenModal,
        closeRegenerateReaderTokenModal,
        confirmRegenerateReaderToken,
        openDeleteReaderModal,
        closeDeleteReaderModal,
        confirmDeleteReader,
        openCreateReaderModal,
        openEditReaderModal,
        closeReaderModal,
        submitReader,
        copyGeneratedReaderToken
    }
}
