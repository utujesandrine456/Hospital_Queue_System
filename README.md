# 🏥 Hospital Smart Queue System

A production-grade, offline-first hospital queue management PWA built with Next.js 14, TypeScript, TailwindCSS, and IndexedDB.

**Live Demo:** [your-vercel-url.vercel.app]
**GitHub:** [your-github-url]

---

## Features

- 🎫 **Digital Queue Tickets** — Select a service, get a unique ticket number instantly
- 📡 **Live Status Updates** — Real-time position tracking without WebSockets
- 📴 **Offline-First** — Works fully without internet; syncs automatically when reconnected
- 📱 **PWA Installable** — Install as a native-like app on mobile or desktop
- 🔄 **Auto Sync** — Outbox pattern ensures no data loss between offline sessions

---

## Architecture Overview

### System Design Philosophy

The architecture follows an **offline-first, local-database-primary** approach. The browser's IndexedDB is the single source of truth — not a remote server. This means the app works identically online and offline, with no degraded "offline mode."

```
┌─────────────────────────────────────────────────────────┐
│                    React UI Layer                        │
│  (Next.js App Router + TailwindCSS components)          │
└───────────────────┬─────────────────────────────────────┘
                    │ reads/writes
┌───────────────────▼─────────────────────────────────────┐
│                  Zustand Store                           │
│  (in-memory state — single source of truth for UI)      │
└──────────┬────────────────────────────┬─────────────────┘
           │ persists                   │ triggers
┌──────────▼───────────┐   ┌───────────▼─────────────────┐
│     IndexedDB        │   │    Queue Engine + Simulator  │
│  (3 object stores)   │   │  (pure logic, no UI deps)    │
│  • tickets           │   │  • ticket creation           │
│  • outbox            │   │  • position recalculation    │
│  • counters          │   │  • 12s advance interval      │
└──────────────────────┘   └─────────────────────────────┘
           │
┌──────────▼───────────┐
│   Outbox Processor   │
│  (syncs when online) │
└──────────────────────┘
```

---

## Offline Strategy

### How It Works

1. **All writes go to IndexedDB first** — the UI never waits for a server
2. **Every write also creates an OutboxEntry** — a pending "to-sync" record
3. **When internet returns** — `processOutbox()` is called, flushing all entries
4. **Retry with exponential backoff** — 1s → 2s → 4s → 8s → 16s, max 5 retries
5. **UUID as idempotency key** — retrying the same ticket creation never creates duplicates

### Why IndexedDB Over localStorage?

| Feature | localStorage | IndexedDB |
|---|---|---|
| Storage limit | ~5MB | Hundreds of MB |
| Structured data | Strings only | Objects, indexes |
| Async | No (blocks main thread) | Yes |
| Queries | No | Yes (by index) |
| Transactions | No | Yes (atomic) |

For a queue system that may hold hundreds of tickets, IndexedDB is the only correct choice.

### Edge Cases Handled

| Scenario | How It's Handled |
|---|---|
| Refresh during queue update | Positions recalculated from `createdAt` timestamps on every load |
| Offline during ticket creation | Saved to IndexedDB + Outbox; syncs on reconnect |
| Multiple offline actions | All queued in outbox, processed in order on reconnect |
| Spam clicking "Get Ticket" | `isCreating` flag in store prevents concurrent creation |
| App restart mid-queue | `myTicket` persisted to localStorage; full queue loaded from IndexedDB |
| Duplicate ticket on retry | UUID idempotency key prevents duplicates |

---

## Caching Strategy

Three-layer caching:

1. **Service Worker (next-pwa)** — Caches all static assets (JS, CSS, fonts) with `CacheFirst` strategy. Caches pages with `NetworkFirst` (tries network, falls back to cache within 10s timeout)
2. **IndexedDB** — All ticket data cached locally. The app can function indefinitely without a network
3. **Zustand Store** — In-memory cache for the current session. `myTicket` is also persisted to localStorage via Zustand `persist` middleware so the user's ticket survives hard refresh

---

## State Management Approach

**Zustand** was chosen over Redux/Context for three reasons:
1. **No boilerplate** — actions and state in one place, no reducers/action creators
2. **Minimal re-renders** — components only re-render when their specific slice changes
3. **Middleware support** — `persist` middleware handles localStorage sync for free

### Store Architecture

```
useQueueStore (main store)
├── myTicket          → the current user's ticket
├── allTickets        → all tickets (user + simulated patients)
├── pendingSync       → outbox entries waiting to be synced
├── isCreating        → spam protection flag
└── actions:
    ├── createTicket()    → creates ticket in IDB + queues outbox action
    ├── advanceQueue()    → removes first patient, shifts everyone up by 1
    ├── loadFromStorage() → syncs store from IndexedDB (called after simulator runs)
    └── initializeQueue() → populates simulated patients on first use

useNetworkStore (separate, focused store)
└── isOnline → drives the OfflineBanner and outbox trigger
```

---

## Queue Logic

### Ticket Number Generation

Ticket numbers are generated atomically from a persistent counter in IndexedDB:

```
Service:      consultation
Counter:      7 (stored in IDB "counters" table)
Next number:  7 + 1 = 8
Ticket:       CON-008
Counter saved: 8
```

Even after page refresh, the counter is read from IndexedDB — so numbers are always sequential and unique.

### Position Stability

Queue positions are always recalculated from `createdAt` timestamps, never stored as fixed values. This means:
- Refreshing the page always produces the correct order
- No position conflicts between concurrent users
- Deterministic ordering: oldest ticket = smallest position

### Real-Time Simulation

Without a WebSocket backend, the simulator uses `setInterval` to advance the queue every 12 seconds:

1. Find ticket at `position === 1`
2. Mark it `completed`
3. Every other ticket: `position - 1`
4. Ticket at new `position === 1` becomes `serving`
5. Store updates → React re-renders → user sees new position

The interval pauses when the tab is hidden (`document.hidden`) to save CPU and battery.

---

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Home — service selection
│   ├── queue/[ticketId]/   # Live ticket tracking
│   └── admin/              # Queue dashboard
├── components/
│   ├── queue/              # Domain-specific components
│   └── OfflineBanner.tsx   # Network status indicator
├── lib/
│   ├── db/                 # IndexedDB schema + data access
│   ├── queue/              # Queue engine + simulator (pure logic)
│   └── sync/               # Outbox pattern implementation
├── store/                  # Zustand stores
├── hooks/                  # Custom React hooks
└── types/                  # TypeScript interfaces
```

---

## Tech Stack

| Technology | Version | Why |
|---|---|---|
| Next.js | 14 | App Router, server components, easy Vercel deploy |
| TypeScript | 5 | Type safety across the entire queue data model |
| TailwindCSS | 3 | Rapid, consistent styling without CSS files |
| Zustand | 4 | Lightweight state management, minimal re-renders |
| idb | 8 | Type-safe IndexedDB wrapper |
| next-pwa | 5 | Service worker + caching with zero config |
| uuid | 9 | RFC-compliant unique IDs for idempotent sync |
| sonner | Latest | Non-intrusive toast notifications |

---

## Getting Started

```bash
# Clone the repository
git clone https://github.com/your-username/hospital-queue-system
cd hospital-queue-system

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production (enables PWA)
npm run build && npm start
```

Open [http://localhost:3000](http://localhost:3000)

**Admin dashboard:** [http://localhost:3000/admin](http://localhost:3000/admin)

### Testing PWA / Offline

1. `npm run build && npm start`
2. Open in Chrome, open DevTools → Application → Service Workers
3. Check "Offline" checkbox in Network tab
4. App continues to work — tickets are saved locally
5. Uncheck "Offline" — outbox syncs automatically

---

## Deployment

```bash
# Push to GitHub, then:
npx vercel --prod
```

The app requires HTTPS for PWA install prompts (Vercel provides this automatically).

---

*Built as part of the INGOGA Technologies Frontend Engineering Challenge.*
