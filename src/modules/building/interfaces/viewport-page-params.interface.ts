import type { ViewportBounds } from '@/modules/building/interfaces/viewport-bounds.interface'

export interface ViewportPageParams extends ViewportBounds {
    cursor?: number
    limit?: number
}
