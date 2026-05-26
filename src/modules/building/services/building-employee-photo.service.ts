import { mediaUrlService } from '@/services/media-url.service'

class BuildingEmployeePhotoService {
    resolveEmployeePhotoUrl(photo: string | null) {
        return mediaUrlService.resolveUrl(photo)
    }
}

export const buildingEmployeePhotoService = new BuildingEmployeePhotoService()
