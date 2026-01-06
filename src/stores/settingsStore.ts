import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark' | 'system'

interface SettingsState {
    theme: Theme
    autoSave: boolean
    followRedirects: boolean
    validateSSL: boolean
    proxyMode: boolean

    // Actions
    setTheme: (theme: Theme) => void
    setAutoSave: (autoSave: boolean) => void
    setFollowRedirects: (followRedirects: boolean) => void
    setValidateSSL: (validateSSL: boolean) => void
    setProxyMode: (proxyMode: boolean) => void
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            theme: 'dark',
            autoSave: true,
            followRedirects: true,
            validateSSL: true,
            proxyMode: true,

            setTheme: (theme: Theme) => {
                set({ theme })
                // Apply theme to document
                if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark')
                } else {
                    document.documentElement.classList.remove('dark')
                }
            },

            setAutoSave: (autoSave: boolean) => set({ autoSave }),
            setFollowRedirects: (followRedirects: boolean) => set({ followRedirects }),
            setValidateSSL: (validateSSL: boolean) => set({ validateSSL }),
            setProxyMode: (proxyMode: boolean) => set({ proxyMode }),
        }),
        {
            name: 'mrgb-curl-settings',
        }
    )
)

// Initialize theme on load
if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('mrgb-curl-settings')
    if (stored) {
        const { state } = JSON.parse(stored)
        const theme = state?.theme || 'dark'
        if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark')
        }
    } else {
        // Default to dark theme
        document.documentElement.classList.add('dark')
    }
}
