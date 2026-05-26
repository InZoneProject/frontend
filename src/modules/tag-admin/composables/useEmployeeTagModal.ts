import { ref } from 'vue'
import { Events } from '@/enums/events.enum'
import type { EmployeeTagModalEmits } from '@/modules/tag-admin/interfaces/employee-tag-modal-emits.interface'
import type { RfidTagItem } from '@/modules/tag-admin/interfaces/rfid-tag-item.interface'

export const useEmployeeTagModal = (emit: EmployeeTagModalEmits) => {
    const isDragOverAssigned = ref(false)
    const isDragOverTable = ref(false)

    const onDropAssigned = (event: DragEvent) => {
        const raw = event.dataTransfer?.getData('application/json')
        isDragOverAssigned.value = false
        if (!raw) return
        emit(Events.ASSIGN, JSON.parse(raw) as RfidTagItem)
    }

    const onDropToTable = (event: DragEvent) => {
        const raw = event.dataTransfer?.getData('application/x-assigned-tag')
        isDragOverTable.value = false
        if (!raw) return
        emit(Events.UNASSIGN)
    }

    return {
        isDragOverAssigned,
        isDragOverTable,
        onAssignedDragEnter: () => {
            isDragOverAssigned.value = true
        },
        onAssignedDragLeave: () => {
            isDragOverAssigned.value = false
        },
        onTableDragEnter: () => {
            isDragOverTable.value = true
        },
        onTableDragLeave: () => {
            isDragOverTable.value = false
        },
        onDropAssigned,
        onDropToTable
    }
}
