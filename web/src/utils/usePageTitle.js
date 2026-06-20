import { useEffect } from 'react';

const BASE = 'OmniDrive';
const DEFAULT = "OmniDrive — Kenya's Vehicle Marketplace";

/**
 * Sets the document <title> (and optionally the meta description) for a route,
 * restoring the default title on unmount. Lightweight SEO/shareability + UX:
 * each page gets a distinct, meaningful browser-tab title.
 */
export function usePageTitle(title, description) {
  useEffect(() => {
    document.title = title ? `${title} · ${BASE}` : DEFAULT;
    if (description) {
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'description');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', description);
    }
    return () => { document.title = DEFAULT; };
  }, [title, description]);
}
