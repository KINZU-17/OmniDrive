import React, { useEffect, useState } from 'react';

/**
 * Shows a slim banner when the browser goes offline. Because the app is a PWA
 * with a service worker, browsing already-cached pages/listings keeps working;
 * this just tells the user that data may be stale and writes are paused.
 */
export default function OfflineBanner() {
  const [offline, setOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const goOffline = () => setOffline(true);
    const goOnline = () => setOffline(false);
    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);
    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online', goOnline);
    };
  }, []);

  if (!offline) return null;

  return (
    <div className="sticky top-0 z-50 w-full bg-amber-500/90 text-black text-center text-sm font-medium py-1.5 px-4">
      You are offline — showing saved content. New purchases and updates will resume when you reconnect.
    </div>
  );
}
