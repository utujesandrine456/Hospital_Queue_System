import { create } from 'zustand'
import type { ServiceInfo, ServiceType } from '@/types'
import { departmentsApi } from '@/lib/api/departments'
import { mapDepartmentToService, slugFromLabel, acronymFromLabel } from '@/lib/api/mappers'
import { checkApiHealth, ApiError } from '@/lib/api/client'
import { useAuthStore } from '@/store/authStore'

export interface ServiceStoreState {
  services: ServiceInfo[]
  isLoading: boolean
  apiAvailable: boolean
  loadError: string | null
  loadServices: () => Promise<void>
  getDepartmentId: (serviceType: ServiceType) => number | undefined
  addService: (service: Omit<ServiceInfo, 'type'>) => Promise<void>
  updateService: (type: ServiceType, updates: Partial<ServiceInfo>) => Promise<void>
  deleteService: (type: ServiceType) => Promise<void>
}

export const useServiceStore = create<ServiceStoreState>((set, get) => ({
  services: [],
  isLoading: true,
  apiAvailable: false,
  loadError: null,

  getDepartmentId: serviceType => {
    return get().services.find(s => s.type === serviceType)?.departmentId
  },

  loadServices: async () => {
    set({ isLoading: true, loadError: null })
    const apiOk = await checkApiHealth()
    set({ apiAvailable: apiOk })

    if (!apiOk) {
      set({
        services: [],
        isLoading: false,
        loadError: 'Server unavailable. Run medi-backend (npm run start:dev) with PostgreSQL.',
      })
      return
    }

    try {
      const departments = await departmentsApi.list()
      set({
        services: departments.map(mapDepartmentToService),
        isLoading: false,
        loadError: null,
      })
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to load departments'
      set({ services: [], isLoading: false, loadError: message })
      console.error('[ServiceStore] API load failed:', err)
    }
  },

  addService: async serviceData => {
    const slug = slugFromLabel(serviceData.label)
    const token = useAuthStore.getState().getToken()
    if (!token) throw new Error('Admin sign-in required')

    const created = await departmentsApi.create(
      {
        name: serviceData.label,
        slug,
        acronym: acronymFromLabel(serviceData.label),
        description: serviceData.description,
        avgServiceMinutes: serviceData.avgServiceMinutes,
      },
      token,
    )
    void created
    await get().loadServices()
  },

  updateService: async (type, updates) => {
    const current = get().services.find(s => s.type === type)
    const token = useAuthStore.getState().getToken()
    if (!token) throw new Error('Admin sign-in required')
    if (!current?.departmentId) throw new Error('Department not found')

    await departmentsApi.update(
      current.departmentId,
      {
        name: updates.label ?? current.label,
        description: updates.description,
        avgServiceMinutes: updates.avgServiceMinutes,
      },
      token,
    )
    await get().loadServices()
  },

  deleteService: async type => {
    const current = get().services.find(s => s.type === type)
    const token = useAuthStore.getState().getToken()
    if (!token) throw new Error('Admin sign-in required')
    if (!current?.departmentId) throw new Error('Department not found')

    await departmentsApi.remove(current.departmentId, token)
    await get().loadServices()
  },
}))
