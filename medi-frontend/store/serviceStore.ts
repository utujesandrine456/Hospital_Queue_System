import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import type { ServiceInfo, ServiceType } from '@/types'
import { SERVICE_CONFIG } from '@/lib/queue/engine'
import { getDB } from '@/lib/db/schema'

export interface ServiceStoreState {
    services: ServiceInfo[]
    isLoading: boolean
    loadServices: () => Promise<void>
    addService: (service: Omit<ServiceInfo, 'type'>) => Promise<void>
    updateService: (type: ServiceType, updates: Partial<ServiceInfo>) => Promise<void>
    deleteService: (type: ServiceType) => Promise<void>
}

// Convert object to array for initial state
const defaultServices = Object.values(SERVICE_CONFIG)

export const useServiceStore = create<ServiceStoreState>((set, get) => ({
    services: defaultServices,
    isLoading: true,

    loadServices: async () => {
        // In a real app with next-pwa and IDB, we might load from IndexedDB.
        // Since we're augmenting without breaking the engine which relies on SERVICE_CONFIG heavily,
        // we manage our own overriding state.
        try {
            const stored = localStorage.getItem('hospital_services')
            if (stored) {
                set({ services: JSON.parse(stored), isLoading: false })
                return
            }
        } catch { }
        set({ services: defaultServices, isLoading: false })
    },

    addService: async (serviceData) => {
        const newType = serviceData.label.toLowerCase().replace(/\s+/g, '_') as ServiceType
        const newService: ServiceInfo = {
            ...serviceData,
            type: newType
        }
        const updated = [...get().services, newService]
        try {
            localStorage.setItem('hospital_services', JSON.stringify(updated))
        } catch { }
        set({ services: updated })
    },

    updateService: async (type, updates) => {
        const updated = get().services.map(s => s.type === type ? { ...s, ...updates } : s)
        try {
            localStorage.setItem('hospital_services', JSON.stringify(updated))
        } catch { }
        set({ services: updated })
    },

    deleteService: async (type) => {
        const updated = get().services.filter(s => s.type !== type)
        try {
            localStorage.setItem('hospital_services', JSON.stringify(updated))
        } catch { }
        set({ services: updated })
    }
}))
