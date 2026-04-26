import axios, {
    type AxiosInstance,
    type AxiosRequestConfig,
    type AxiosResponse,
    isAxiosError
} from 'axios'
import { useAuthStore } from '@/stores/auth.store'
import { router } from '@/router/router'

export class BaseRepository {
    protected axiosInstance: AxiosInstance

    constructor(baseURL: string) {
        this.axiosInstance = axios.create({
            baseURL: `${import.meta.env.VITE_API_BASE_URL}${baseURL}`
        })

        this.axiosInstance.interceptors.request.use((config) => {
            const authStore = useAuthStore()
            let token: string | null
            const repositoryBaseUrl = this.axiosInstance.defaults.baseURL || ''

            if (repositoryBaseUrl.includes('/global-admin')) {
                token = authStore.globalToken
            } else if (repositoryBaseUrl.includes('/organizations') || repositoryBaseUrl.includes('/organization-admin')) {
                token = authStore.orgToken
            } else if (repositoryBaseUrl.includes('/tag-admin')) {
                token = authStore.tagToken
            } else {
                token = authStore.orgToken || authStore.tagToken || authStore.globalToken
            }

            if (token) {
                config.headers.Authorization = `Bearer ${token}`
            }

            return config
        })

        this.axiosInstance.interceptors.response.use(
            (response) => response,
            async (error: unknown) => {
                if (isAxiosError(error) && error.response?.status === 401) {
                    const authStore = useAuthStore()
                    authStore.clearTokens()

                    const isGlobalPath = window.location.pathname.includes('global-admin')
                    const routeName = isGlobalPath ? 'LoginGlobalAdmin' : 'Login'

                    await router.push({ name: routeName })
                }
                return Promise.reject(error)
            }
        )
    }

    protected async get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        return this.axiosInstance.get<T>(url, config)
    }

    protected async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        return this.axiosInstance.post<T>(url, data, config)
    }

    protected async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        return this.axiosInstance.put<T>(url, data, config)
    }

    protected async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        return this.axiosInstance.patch<T>(url, data, config)
    }

    protected async delete<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        return this.axiosInstance.delete<T>(url, config)
    }
}
