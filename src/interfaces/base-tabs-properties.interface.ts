import type { BaseTabProperties } from './base-tab-properties.interface'

export interface BaseTabsProperties {
    tabs: BaseTabProperties[]
    activeTab: string
}