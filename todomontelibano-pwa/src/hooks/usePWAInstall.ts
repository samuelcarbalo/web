import { useCallback, useEffect, useState } from 'react';

export type PwaInstallOutcome = 'accepted' | 'dismissed' | null;

type InstallSnapshot = {
  deferredPrompt: BeforeInstallPromptEvent | null;
  isInstalled: boolean;
  isReady: boolean;
};

const listeners = new Set<() => void>();

let snapshot: InstallSnapshot = {
  deferredPrompt: null,
  isInstalled: false,
  isReady: false,
};

function emit() {
  listeners.forEach((listener) => listener());
}

function setSnapshot(partial: Partial<InstallSnapshot>) {
  snapshot = { ...snapshot, ...partial };
  emit();
}

function isStandaloneDisplay(): boolean {
  if (typeof window === 'undefined') return false;
  const mediaStandalone = window.matchMedia('(display-mode: standalone)').matches;
  const iosStandalone = 'standalone' in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
  return mediaStandalone || iosStandalone;
}

function detectIos(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  const iOSDevice = /iPad|iPhone|iPod/.test(ua);
  const iPadOs = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
  return iOSDevice || iPadOs;
}

let initialized = false;

function ensureInstallListeners() {
  if (initialized || typeof window === 'undefined') return;
  initialized = true;

  if (isStandaloneDisplay()) {
    setSnapshot({ isInstalled: true, deferredPrompt: null, isReady: true });
    return;
  }

  setSnapshot({ isReady: true });

  const onBeforeInstallPrompt = (event: Event) => {
    event.preventDefault();
    setSnapshot({
      deferredPrompt: event as BeforeInstallPromptEvent,
      isInstalled: false,
    });
  };

  const onAppInstalled = () => {
    setSnapshot({ deferredPrompt: null, isInstalled: true });
  };

  window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
  window.addEventListener('appinstalled', onAppInstalled);
}

export type UsePWAInstallResult = {
  /** True when Chromium can show the native install prompt. */
  isInstallable: boolean;
  /** True when the app is already running as an installed PWA. */
  isInstalled: boolean;
  /** True on iOS/iPadOS Safari (no beforeinstallprompt). */
  isIos: boolean;
  /** True when running inside an installed/standalone window. */
  isStandalone: boolean;
  /** Hook finished initial environment detection. */
  isReady: boolean;
  /** Show a native install CTA (Chrome/Edge/Android) or an iOS guide CTA. */
  canPromptInstall: boolean;
  handleInstall: () => Promise<PwaInstallOutcome>;
};

/**
 * Shared PWA install state. Multiple consumers (hero button + banner) share
 * the same deferred `beforeinstallprompt` event.
 */
export function usePWAInstall(): UsePWAInstallResult {
  const [, rerender] = useState(0);
  const [isIos] = useState(() => detectIos());
  const [isStandalone, setIsStandalone] = useState(() => isStandaloneDisplay());

  useEffect(() => {
    ensureInstallListeners();
    const onChange = () => rerender((n) => n + 1);
    listeners.add(onChange);

    const media = window.matchMedia('(display-mode: standalone)');
    const onDisplayMode = () => {
      const standalone = isStandaloneDisplay();
      setIsStandalone(standalone);
      if (standalone) setSnapshot({ isInstalled: true, deferredPrompt: null });
    };
    media.addEventListener?.('change', onDisplayMode);

    return () => {
      listeners.delete(onChange);
      media.removeEventListener?.('change', onDisplayMode);
    };
  }, []);

  const handleInstall = useCallback(async (): Promise<PwaInstallOutcome> => {
    const promptEvent = snapshot.deferredPrompt;
    if (!promptEvent) return null;

    await promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    setSnapshot({ deferredPrompt: null });
    if (outcome === 'accepted') {
      setSnapshot({ isInstalled: true });
    }
    return outcome;
  }, []);

  const isInstallable = Boolean(snapshot.deferredPrompt) && !snapshot.isInstalled && !isStandalone;
  const canPromptInstall =
    !snapshot.isInstalled &&
    !isStandalone &&
    (isInstallable || isIos);

  return {
    isInstallable,
    isInstalled: snapshot.isInstalled || isStandalone,
    isIos,
    isStandalone,
    isReady: snapshot.isReady,
    canPromptInstall,
    handleInstall,
  };
}
