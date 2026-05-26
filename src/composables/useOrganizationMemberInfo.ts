import { computed } from 'vue'
import type { OrganizationMemberInfoProperties } from '@/interfaces/organization-member-info-properties.interface'

export const useOrganizationMemberInfo = (properties: OrganizationMemberInfoProperties) => {
    const isVisible = computed(() => properties.isOpen)
    const isEmptyState = computed(() => isVisible.value && !properties.loading && !properties.member)
    const canViewPositions = computed(() =>
        properties.showViewPositions !== false && properties.member?.role === 'employee'
    )
    const canUsePrimaryAction = computed(() =>
        Boolean(properties.primaryActionLabel) && properties.member?.role === 'employee'
    )

    const formattedCreatedAt = computed(() => {
        if (!properties.member?.created_at) {
            return '—'
        }

        return properties.formatDate(properties.member.created_at)
    })

    const memberRoleLabel = computed(() => {
        if (!properties.member) {
            return ''
        }

        return properties.roleLabelResolver(properties.member.role)
    })

    return {
        isVisible,
        isEmptyState,
        canViewPositions,
        canUsePrimaryAction,
        formattedCreatedAt,
        memberRoleLabel
    }
}
