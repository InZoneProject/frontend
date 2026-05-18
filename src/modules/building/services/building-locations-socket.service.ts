import { io, type Socket } from 'socket.io-client'
import { Events } from '@/enums/events.enum'
import { BUILDING_REALTIME_LOCATION_CONSTANTS } from '@/modules/building/constants/building-realtime-location.constants'
import type { EmployeeLocationSocketPayload } from '@/modules/building/interfaces/employee-location-socket-payload.interface'

class BuildingLocationsSocketService {
    private static instance: BuildingLocationsSocketService | null = null
    private socket: Socket | null = null
    private activeToken = ''
    private activeBuildingId = 0
    private activeFloorId = 0
    private listeners = new Set<(payload: EmployeeLocationSocketPayload) => void>()
    private recentEventKeys = new Map<string, number>()
    private connectionVersion = 0

    private constructor() {}

    static getInstance(): BuildingLocationsSocketService {
        if (!BuildingLocationsSocketService.instance) {
            BuildingLocationsSocketService.instance = new BuildingLocationsSocketService()
        }

        return BuildingLocationsSocketService.instance
    }

    private resolveSocketBaseUrl(): string {
        const apiBaseUrl = String(import.meta.env.VITE_API_BASE_URL || '')
        const origin = apiBaseUrl ? new URL(apiBaseUrl, window.location.origin).origin : window.location.origin
        return `${origin}${BUILDING_REALTIME_LOCATION_CONSTANTS.NAMESPACE}`
    }

    connect(token: string, buildingId: number, floorId: number): void {
        if (!token || buildingId === 0 || floorId === 0) return

        if (
            this.socket
            && this.activeToken === token
            && this.activeBuildingId === buildingId
            && this.activeFloorId === floorId
        ) {
            return
        }

        this.disconnect()
        const connectionVersion = ++this.connectionVersion
        this.activeToken = token
        this.activeBuildingId = buildingId
        this.activeFloorId = floorId

        const socket = io(this.resolveSocketBaseUrl(), {
            transports: ['websocket', 'polling'],
            auth: {
                token: `Bearer ${token}`
            }
        })
        this.socket = socket

        socket.on('connect', () => {
            if (this.socket !== socket || connectionVersion !== this.connectionVersion) return

            socket.emit(Events.SUBSCRIBE_BUILDING, { building_id: buildingId })
            socket.emit(Events.SUBSCRIBE_FLOOR, { floor_id: floorId })
        })

        socket.on(Events.EMPLOYEE_LOCATION, (payload: EmployeeLocationSocketPayload) => {
            if (this.socket !== socket || connectionVersion !== this.connectionVersion) return

            this.emitLocation(payload)
        })
    }

    addListener(listener: (payload: EmployeeLocationSocketPayload) => void): () => void {
        this.listeners.add(listener)

        return () => {
            this.listeners.delete(listener)
        }
    }

    private emitLocation(payload: EmployeeLocationSocketPayload): void {
        const eventKey = [
            payload.employee_id,
            payload.door_id,
            payload.previous_zone_id ?? 'null',
            payload.zone_id ?? 'null',
            payload.timestamp
        ].join(':')
        const now = Date.now()
        const previousSeenAt = this.recentEventKeys.get(eventKey)

        if (previousSeenAt && now - previousSeenAt < BUILDING_REALTIME_LOCATION_CONSTANTS.DEDUPE_WINDOW_MS) {
            return
        }

        this.recentEventKeys.set(eventKey, now)
        this.cleanupRecentEventKeys(now)
        this.listeners.forEach((listener) => listener(payload))
    }

    private cleanupRecentEventKeys(now: number): void {
        this.recentEventKeys.forEach((seenAt, key) => {
            if (now - seenAt > BUILDING_REALTIME_LOCATION_CONSTANTS.DEDUPE_WINDOW_MS) {
                this.recentEventKeys.delete(key)
            }
        })
    }

    disconnect(): void {
        this.connectionVersion += 1

        if (!this.socket) {
            this.activeToken = ''
            this.activeBuildingId = 0
            this.activeFloorId = 0
            this.recentEventKeys.clear()
            return
        }

        const socket = this.socket

        if (socket.connected && this.activeBuildingId > 0) {
            socket.emit(Events.UNSUBSCRIBE_BUILDING, { building_id: this.activeBuildingId })
        }
        if (socket.connected && this.activeFloorId > 0) {
            socket.emit(Events.UNSUBSCRIBE_FLOOR, { floor_id: this.activeFloorId })
        }
        socket.removeAllListeners()
        socket.disconnect()
        this.socket = null
        this.activeToken = ''
        this.activeBuildingId = 0
        this.activeFloorId = 0
        this.recentEventKeys.clear()
    }
}

export const buildingLocationsSocketService = BuildingLocationsSocketService.getInstance()
