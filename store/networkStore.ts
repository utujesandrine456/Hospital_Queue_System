import { create } from 'zustand'
import type { NetworkStoreState } from '@/types'

export const useNetworkStore = create<NetworkStoreState>((set) => ({
  isOnline: true, // Initialize to true for consistent hydration, updated by hook on client mount
  lastOnlineAt: null,

  setOnline: (val: boolean) =>
    set({
      isOnline: val,
      lastOnlineAt: val ? Date.now() : undefined,
    }),
}))