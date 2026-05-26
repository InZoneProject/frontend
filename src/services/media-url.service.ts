class MediaUrlService {
    resolveUrl(url: string | null) {
        if (!url) return null
        if (/^https?:\/\//i.test(url)) return url

        const apiBaseUrl = String(import.meta.env.VITE_API_BASE_URL || '')
            .replace(/\/api\/?$/, '')
            .replace(/\/$/, '')

        return `${apiBaseUrl}${url.startsWith('/') ? url : `/${url}`}`
    }
}

export const mediaUrlService = new MediaUrlService()
