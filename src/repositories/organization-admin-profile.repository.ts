import { BaseRepository } from '@/api/base.repository'
import type { Profile } from '@/interfaces/profile.interface'
import type { UpdateProfileInfo } from '@/interfaces/update-profile-info.interface'
import type { UpdateProfilePhotoResponse } from '@/interfaces/update-profile-photo-response.interface'

class OrganizationAdminProfileRepository extends BaseRepository {
    constructor() {
        super('/organizations')
    }

    getProfile() {
        return this.get<Profile>('/profile')
    }

    updateProfileInfo(payload: UpdateProfileInfo) {
        return this.patch<UpdateProfileInfo>('/profile/info', payload)
    }

    updateProfilePhoto(formData: FormData) {
        return this.patch<UpdateProfilePhotoResponse>('/profile/photo', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
    }

    deleteProfile() {
        return this.delete<void>('/profile')
    }
}

export const organizationAdminProfileRepository = new OrganizationAdminProfileRepository()
