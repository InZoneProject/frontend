import { onBeforeUnmount, ref, watch, type Ref } from 'vue'
import {DURATION} from "@/constants/duration.constants";

export const useSuccessMessage = (message: Ref<string>, onClear: () => void) => {
    const visibleMessage = ref('')
    let hideTimeout: number | null = null

    const clearHideTimeout = () => {
        if (hideTimeout !== null) {
            window.clearTimeout(hideTimeout)
            hideTimeout = null
        }
    }

    watch(
        message,
        (nextMessage) => {
            clearHideTimeout()
            visibleMessage.value = nextMessage

            if (!nextMessage) {
                return
            }

            hideTimeout = window.setTimeout(() => {
                visibleMessage.value = ''
                hideTimeout = null
                onClear()
            }, DURATION.MS_IN_SECOND)
        },
        { immediate: true },
    )

    onBeforeUnmount(() => {
        clearHideTimeout()
    })

    return {
        visibleMessage
    }
}
