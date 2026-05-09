'use client'

import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[]
    readonly userChoice: Promise<{
        outcome: 'accepted' | 'dismissed'
        platform: string
    }>
    prompt(): Promise<void>
}

export function usePWA() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
    const [isInstallable, setIsInstallable] = useState(false)
    const [isInstalled, setIsInstalled] = useState(false)

    useEffect(() => {
        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
            setIsInstalled(true)
        }

        // Check if we already caught the prompt globally
        if ((window as any).deferredPWAPrompt) {
            setDeferredPrompt((window as any).deferredPWAPrompt)
            setIsInstallable(true)
        }

        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault()
            setDeferredPrompt(e as BeforeInstallPromptEvent)
            setIsInstallable(true)
        }

        const handlePromptReady = () => {
            if ((window as any).deferredPWAPrompt) {
                setDeferredPrompt((window as any).deferredPWAPrompt)
                setIsInstallable(true)
            }
        }

        const handleAppInstalled = () => {
            setIsInstallable(false)
            setIsInstalled(true)
            setDeferredPrompt(null)
            if ((window as any).deferredPWAPrompt) (window as any).deferredPWAPrompt = null;
        }

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
        window.addEventListener('pwa-prompt-ready', handlePromptReady)
        window.addEventListener('appinstalled', handleAppInstalled)

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
            window.removeEventListener('pwa-prompt-ready', handlePromptReady)
            window.removeEventListener('appinstalled', handleAppInstalled)
        }
    }, [])

    const promptInstall = async () => {
        if (!deferredPrompt) {
            alert("App installation is not supported by your current browser, or it's already installed.")
            return
        }

        await deferredPrompt.prompt()
        const choiceResult = await deferredPrompt.userChoice

        if (choiceResult.outcome === 'accepted') {
            console.log('User accepted the A2HS prompt')
        } else {
            console.log('User dismissed the A2HS prompt')
        }

        setDeferredPrompt(null)
        setIsInstallable(false)
    }

    return { isInstallable, isInstalled, promptInstall }
}
