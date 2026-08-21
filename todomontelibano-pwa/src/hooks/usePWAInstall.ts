import { useCallback, useEffect, useState } from 'react';

export type PwaInstallOutcome = 'accepted' | 'dismissed' | null;

const INSTALLED_KEY = 'pwa_installed_v1';

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

function readInstalledFlag(): boolean {
  try {
    return localStorage.getItem(INSTALLED_KEY) === '1';
  } catch {
    return false;
  }
}

function markInstalled() {
  try {
    localStorage.setItem(INSTALLED_KEY, '1');
  } catch {
    /* ignore */
  }
  setSnapshot({ isInstalled: true, deferredPrompt: null });
}

function isStandaloneDisplay(): boolean {
  if (typeof window === 'undefined') return false;
  const mediaStandalone = window.matchMedia('(display-mode: standalone)').matches;
  const iosStandalone =
    'standalone' in navigator &&
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
  return mediaStandalone || iosStandalone;
}

function detectIos(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  const iOSDevice = /iPad|iPhone|iPod/.test(ua);
  const iPadOs = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
  return iOSDevice || iPadOs;
}

async function detectRelatedInstalledApp(): Promise<boolean> {
  const nav = navigator as Navigator & {
    getInstalledRelatedApps?: () => Promise<Array<{ platform?: string; url?: string }>>;
  };
  if (typeof nav.getInstalledRelatedApps !== 'function') return false;
  try {
    const apps = await nav.getInstalledRelatedApps();
    return Array.isArray(apps) && apps.length > 0;
  } catch {
    return false;
  }
}

let initialized = false;

function ensureInstallListeners() {
  if (initialized || typeof window === 'undefined') return;
  initialized = true;

  if (isStandaloneDisplay() || readInstalledFlag()) {
    markInstalled();
    setSnapshot({ isReady: true });
    return;
  }

  setSnapshot({ isReady: true });

  void detectRelatedInstalledApp().then((related) => {
    if (related) markInstalled();
  });

  const onBeforeInstallPrompt = (event: Event) => {
    // Si ya está instalada (standalone / flag / related), no ofrecer otra instalación
    if (snapshot.isInstalled || isStandaloneDisplay() || readInstalledFlag()) {
      event.preventDefault();
      setSnapshot({ deferredPrompt: null, isInstalled: true });
      return;
    }
    event.preventDefault();
    setSnapshot({
      deferredPrompt: event as BeforeInstallPromptEvent,
      isInstalled: false,
    });
  };

  const onAppInstalled = () => {
    markInstalled();
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
 * Tras instalar una vez, no vuelve a ofrecer “descargar” la misma app.
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
      if (standalone) markInstalled();
    };
    media.addEventListener?.('change', onDisplayMode);

    return () => {
      listeners.delete(onChange);
      media.removeEventListener?.('change', onDisplayMode);
    };
  }, []);

  const handleInstall = useCallback(async (): Promise<PwaInstallOutcome> => {
    if (snapshot.isInstalled || isStandaloneDisplay() || readInstalledFlag()) {
      markInstalled();
      return 'accepted';
    }

    const promptEvent = snapshot.deferredPrompt;
    if (!promptEvent) return null;

    await promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    setSnapshot({ deferredPrompt: null });
    if (outcome === 'accepted') {
      markInstalled();
    }
    return outcome;
  }, []);

  const alreadyInstalled = snapshot.isInstalled || isStandalone || readInstalledFlag();
  const isInstallable = Boolean(snapshot.deferredPrompt) && !alreadyInstalled;
  const canPromptInstall = !alreadyInstalled && (isInstallable || isIos);

  return {
    isInstallable,
    isInstalled: alreadyInstalled,
    isIos,
    isStandalone,
    isReady: snapshot.isReady,
    canPromptInstall,
    handleInstall,
  };
}
