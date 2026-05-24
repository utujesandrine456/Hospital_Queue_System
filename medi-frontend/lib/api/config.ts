export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? 'http://localhost:2000'

export const WS_URL =
  process.env.NEXT_PUBLIC_WS_URL?.replace(/\/$/, '') ?? API_BASE_URL

/** When true, all queue data comes from PostgreSQL via the Nest API (no IndexedDB). */
export const API_ONLY = process.env.NEXT_PUBLIC_API_ONLY !== 'false'
