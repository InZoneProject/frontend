import { ref } from 'vue'
import { Events } from '@/enums/events.enum'
import type { DoorReaderModalEmits } from '@/modules/building/interfaces/door-reader-modal-emits.interface'
import type { RfidReaderItem } from '@/modules/building/interfaces/rfid-reader-item.interface'

export const useDoorReaderModal = (emit: DoorReaderModalEmits) => {
    const isDragOverAssigned = ref(false)
    const isDragOverTable = ref(false)

    const onDropAssigned = (event: DragEvent) => {
        const raw = event.dataTransfer?.getData('application/json')
        isDragOverAssigned.value = false
        if (!raw) return
        emit(Events.ASSIGN, JSON.parse(raw) as RfidReaderItem)
    }

    const onDropToTable = (event: DragEvent) => {
        const raw = event.dataTransfer?.getData('application/x-assigned-reader')
        isDragOverTable.value = false
        if (!raw) return
        emit(Events.UNASSIGN)
    }

    const onAssignedDragEnter = () => {
        isDragOverAssigned.value = true
    }

    const onAssignedDragLeave = () => {
        isDragOverAssigned.value = false
    }

    const onTableDragEnter = () => {
        isDragOverTable.value = true
    }

    const onTableDragLeave = () => {
        isDragOverTable.value = false
    }

    return {
        isDragOverAssigned,
        isDragOverTable,
        onAssignedDragEnter,
        onAssignedDragLeave,
        onTableDragEnter,
        onTableDragLeave,
        onDropAssigned,
        onDropToTable
    }
}
