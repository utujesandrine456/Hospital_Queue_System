# 🏥 MediQueue — Modern Hospital Queue Management

[![Live Demo](https://img.shields.io/badge/Live-Demo-Sage?style=for-the-badge&logo=vercel&logoColor=white)](https://hospital-queue-system-web.vercel.app/)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-2C3639?style=for-the-badge&logo=github)](https://github.com/utujesandrine456/Hospital_Queue_System)

**MediQueue** is a professional solution for modern hospitals. It allows patients to **book digital tickets** and monitor their wait status in real-time. Designed as an Offline-First PWA, it remains fully functional even during network interruptions.

---

## ✨ Key Features

- 🎫 **Digital Ticketing:** Select a service and receive a unique ticket number instantly.
- 📡 **Live Accuracy:** The dashboard updates your position every few seconds for complete transparency.
- 📴 **Offline Reliability:** Generate tickets and manage the line without an active internet connection.
- 📱 **Native Experience:** Install MediQueue directly to your home screen for a seamless mobile experience.
- 🛠️ **Admin Control:** Medical staff can manage departments and advance the queue with a single tap.
- 🔔 **Smart Alerts:** Receive instant notifications when you are next in line or being served.

---

## 👥 The Patient Journey

MediQueue transforms the traditional waiting room into a high-end experience:
1. **Seamless Booking:** Upon arrival, patients select their department. A unique digital ticket is immediately stored on their device.
2. **Real-time Tracking:** The interface shows exactly how many people are waiting ahead and provides an estimated wait time.
3. **Queue Mobility:** Patients are free to move around the hospital. The live status eliminates the need to wait in a specific area.
4. **Instant Notification:** As soon as the staff is ready, the app alerts the patient to proceed to the counter.

---

## 🏗️ Technical Architecture

The app follows a **Local-First** philosophy. This ensures that the interface is always responsive and avoids the delays typical of server-dependent websites.

- **Persistence:** **IndexedDB** acts as the primary data store within the browser, handling all ticket and service records.
- **Synchronization:** A robust **Outbox Pattern** tracks offline actions and synchronizes them with the main system automatically once connectivity returns.

---

## 💾 Storage & Caching Strategy

Reliability is built into every layer of the system:
1. **Resilient Sync:** If a ticket is booked offline, it is queued and pushed to the server as soon as a heartbeat is detected.
2. **Asset Caching:** Workbox service workers store the application code locally, allowing for near-instant load times.
3. **Session Integrity:** Active tickets are mirrored in **LocalStorage** to ensure they survive accidental refreshes or browser restarts.

---

## ⚡ State Management

**Zustand** orchestrates the application state with high efficiency.
- It ensures that UI components re-render only when necessary, maintaining a smooth 60FPS experience.
- It provides a persistent bridge between the local database and the visible interface.

---

## 🧪 Queue Engine Logic

The core logic ensures a fair and realistic flow:
- **Time-Based Priority:** Positions are calculated strictly from arrival timestamps to maintain absolute fairness.
- **Service Buffering:** A **4-second preparation window** is included for the first patient. This simulates the natural time medical staff need to prepare for the next visitor.
- **Unique Identifiers:** The system automatically formats ticket numbers with 3-letter acronyms (e.g., **CON-001**) for professional identification.

---

## 🚀 Deployment & Installation

1. **Clone:** Retrieve the source code from the official GitHub repository.
2. **Initialize:** Use `npm install` to set up the development environment.
3. **Development:** Run `npm run dev` for local testing and modification.
4. **Production:** Execute `npm run build` to generate the optimized PWA bundle.

---

*Developed by **UWASE UTUJE Sandrine** for the Frontend Engineering Challenge.*
