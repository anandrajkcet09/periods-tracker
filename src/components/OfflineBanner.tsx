// src/components/OfflineBanner.tsx
import React, { useEffect, useState } from "react";
import { Badge } from "./ui/Badge";

/**
 * Shows a banner when the browser is offline.
 */
export const OfflineBanner: React.FC = () => {
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (online) return null;

  return (
    <div className="w-full bg-yellow-100 text-yellow-800 py-2 text-center fixed top-0 left-0 z-50">
      <Badge variant="outline">You are offline – the app is running in cached mode.</Badge>
    </div>
  );
};
