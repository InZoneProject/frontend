import { computed, nextTick, ref, watch } from 'vue'
import { Events } from '@/enums/events.enum'
import { DATA_TABLE_CONSTANTS } from '@/constants/data-table.constants'
import type { DataTableEmits } from '@/interfaces/data-table-emits.interface'
import type { DataTableProperties } from '@/interfaces/data-table-properties.interface'

export const useDataTable = <T>(
    props: DataTableProperties<T>,
    emit: DataTableEmits
) => {
    const tableWrapperRef = ref<HTMLElement | null>(null)
    const pendingOffset = ref<number | null>(null)

    const tableWrapperStyle = computed(() => ({
        '--table-max-height': props.maxHeight
    }))

    const hasMore = computed(() => props.items.length < props.total)
    const nextOffset = computed(() => props.items.length)

    watch(
        () => props.offset,
        (offset) => {
            if (offset === 0) {
                pendingOffset.value = null
                void nextTick(() => {
                    const element = tableWrapperRef.value
                    if (!element) return

                    element.scrollTop = 0
                    element.scrollLeft = 0
                })
            }

            if (pendingOffset.value === offset) {
                pendingOffset.value = null
            }
        }
    )

    watch(
        () => props.items,
        () => {
            if (props.offset !== 0) return

            void nextTick(() => {
                const element = tableWrapperRef.value
                if (!element) return

                element.scrollTop = 0
                element.scrollLeft = 0
            })
        }
    )

    const onScroll = () => {
        const element = tableWrapperRef.value
        if (!element || props.loading || !hasMore.value || props.items.length === 0 || props.limit <= 0) return

        const distanceToBottom = element.scrollHeight - element.scrollTop - element.clientHeight
        if (distanceToBottom > DATA_TABLE_CONSTANTS.SCROLL_BOTTOM_OFFSET || pendingOffset.value === nextOffset.value) return

        pendingOffset.value = nextOffset.value
        emit(Events.UPDATE_OFFSET, nextOffset.value)
    }

    return {
        tableWrapperRef,
        tableWrapperStyle,
        onScroll
    }
}
