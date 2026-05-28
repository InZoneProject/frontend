class MediaUrlService {
    resolveUrl(url: string | null) {
        const normalizedUrl = url?.trim()
        if (!normalizedUrl) return null

        if (/^https?:\/\//i.test(normalizedUrl)) {
            return this.resolveAbsoluteUrl(normalizedUrl)
        }

        const apiBaseUrl = this.getApiOrigin()
        const publicPath = this.toPublicPath(normalizedUrl)

        return `${apiBaseUrl}${publicPath}`
    }

    private resolveAbsoluteUrl(url: string) {
        const apiOrigin = this.getApiOrigin()

        try {
            const sourceUrl = new URL(url)
            const apiUrl = new URL(apiOrigin)

            if (sourceUrl.protocol === 'http:' && sourceUrl.host === apiUrl.host && apiUrl.protocol === 'https:') {
                sourceUrl.protocol = apiUrl.protocol
                return sourceUrl.toString()
            }
        } catch {
            return url
        }

        return url
    }

    private getApiOrigin() {
        return String(import.meta.env.VITE_API_BASE_URL || '')
            .replace(/\/api\/?$/, '')
            .replace(/\/$/, '')
    }

    private toPublicPath(url: string) {
        const normalizedUrl = url.replace(/\\/g, '/').replace(/^\.\//, '')
        const uploadsIndex = normalizedUrl.lastIndexOf('/uploads/')

        if (uploadsIndex >= 0) {
            return normalizedUrl.slice(uploadsIndex)
        }

        if (normalizedUrl.startsWith('uploads/')) {
            return `/${normalizedUrl}`
        }

        return normalizedUrl.startsWith('/') ? normalizedUrl : `/${normalizedUrl}`
    }
}

export const mediaUrlService = new MediaUrlService()
