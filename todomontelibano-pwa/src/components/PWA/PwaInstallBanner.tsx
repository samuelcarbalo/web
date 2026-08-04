import React, { useEffect, useState } from "react";
import { BRAND_DISPLAY_NAME } from '../../config/brand';
import { Download, X } from "lucide-react";

const DISMISS_KEY = "pwa-install-banner-dismissed";

const PwaInstallBanner: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (localStorage.getItem(DISMISS_KEY) === "true") return;

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "true");
    setShowBanner(false);
  };

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[min(92vw,24rem)] rounded-3xl border border-violet-200/70 bg-white/95 p-4 shadow-2xl backdrop-blur-xl dark:border-violet-900/50 dark:bg-gray-950/95">
      <button
        type="button"
        onClick={dismiss}
        className="absolute right-3 top-3 rounded-full p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
        aria-label="Cerrar sugerencia de instalación"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="pr-8">
        <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400">
          <Download className="h-4 w-4" />
          <span className="text-sm font-semibold">Instala {BRAND_DISPLAY_NAME}</span>
        </div>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          Acceso rápido a la plataforma desde tu dispositivo, sin abrir el navegador cada vez.
        </p>
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <button
          type="button"
          onClick={dismiss}
          className="rounded-2xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          Ahora no
        </button>
        <button
          type="button"
          onClick={handleInstall}
          className="rounded-2xl bg-violet-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-700"
        >
          Instalar
        </button>
      </div>
    </div>
  );
};

export default PwaInstallBanner;
