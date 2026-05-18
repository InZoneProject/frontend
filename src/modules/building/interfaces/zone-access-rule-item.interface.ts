import type { ZoneAccessRuleType } from '@/modules/building/enums/zone-access-rule-type.enum'

export interface ZoneAccessRuleItem {
    zone_access_rule_id: number
    title: string
    access_type: ZoneAccessRuleType
    max_duration_minutes: number | null
    has_positions?: boolean
    created_at: string
}
