// src/components/InstallPrompt.tsx
import React, { useEffect, useState } from "react";
import { Button } from "./ui/Button";

/**
 * Component that listens for the `beforeinstallprompt` event and shows an
 * install button when the PWA can be installed.
 */
export const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      // Prevent the default mini‑infobar from showing
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    // @ts-ignore – the type is a BeforeInstallPromptEvent but not in lib
    const promptEvent = deferredPrompt as any;
    promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    if (outcome === "accepted") {
      // User accepted installation
      setShow(false);
    }
    setDeferredPrompt(null);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button onClick={handleInstall}>Install App</Button>
    </div>
  );
};
