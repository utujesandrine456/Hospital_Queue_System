'use client'

import { useEffect } from 'react'

/** Remove old IndexedDB demo data so the UI only reflects PostgreSQL via the API. */
export function ClearLegacyCache() {
  useEffect(() => {
    try {
      localStorage.removeItem('hospital_services')
      window.indexedDB.deleteDatabase('hospital-queue-db')
    } catch {
      /* ignore */
    }
  }, [])

  return null
}
