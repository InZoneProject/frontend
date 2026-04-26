import { Events } from '@/enums/events.enum'
import type { ProfileIconButtonEmits } from '@/interfaces/profile-icon-button-emits.interface'

export function useProfileIconButton(emit: ProfileIconButtonEmits) {
    const handleClick = (): void => {
        emit(Events.OPEN)
    }

    return {
        handleClick
    }
}
