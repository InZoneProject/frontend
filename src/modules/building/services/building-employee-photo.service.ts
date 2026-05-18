class BuildingEmployeePhotoService {
    resolveEmployeePhotoUrl(photo: string | null) {
        if (!photo) return null
        if (/^https?:\/\//i.test(photo)) return photo

        const apiBaseUrl = String(import.meta.env.VITE_API_BASE_URL || '')
        const origin = apiBaseUrl ? new URL(apiBaseUrl, window.location.origin).origin : window.location.origin

        return `${origin}/${photo.replace(/^\//, '')}`
    }
}

export const buildingEmployeePhotoService = new BuildingEmployeePhotoService()
