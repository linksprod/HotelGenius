import { useEffect, useRef } from 'react';

interface HotelBrandingOptions {
  logoUrl?: string | null;
  name?: string | null;
  primaryColor?: string | null;
  slug?: string | null;
}

/**
 * Dynamically updates browser/PWA branding (favicon, apple-touch-icon,
 * theme-color, web-app title, and manifest) based on the active hotel.
 *
 * Call this hook once inside a component that has access to the HotelContext
 * (e.g. ThemeCustomizer or HotelProvider children).
 */
export function useHotelBranding({
  logoUrl,
  name,
  primaryColor,
  slug,
}: HotelBrandingOptions) {
  const blobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    // ── Nothing to customise yet ──────────────────────────────────────────
    if (!logoUrl && !name && !primaryColor) return;

    const DEFAULT_FAVICON = '/lovable-uploads/7d122e82-98d4-40e0-a1ab-a49791c14717.png';
    const DEFAULT_TITLE = 'Hotel Genius';
    const DEFAULT_COLOR = '#16a34a';

    const iconHref = logoUrl || DEFAULT_FAVICON;
    const appName = name || DEFAULT_TITLE;
    const themeColor = primaryColor || DEFAULT_COLOR;

    // ── 1. Favicon <link rel="icon"> ─────────────────────────────────────
    let faviconLink = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!faviconLink) {
      faviconLink = document.createElement('link');
      faviconLink.rel = 'icon';
      document.head.appendChild(faviconLink);
    }
    faviconLink.href = iconHref;
    faviconLink.type = iconHref.endsWith('.svg') ? 'image/svg+xml' : 'image/png';

    // ── 2. Apple Touch Icon ──────────────────────────────────────────────
    let appleIcon = document.querySelector<HTMLLinkElement>('link[rel="apple-touch-icon"]');
    if (!appleIcon) {
      appleIcon = document.createElement('link');
      appleIcon.rel = 'apple-touch-icon';
      document.head.appendChild(appleIcon);
    }
    appleIcon.href = iconHref;

    // ── 3. Apple Web-App Title ───────────────────────────────────────────
    let appleTitle = document.querySelector<HTMLMetaElement>('meta[name="apple-mobile-web-app-title"]');
    if (!appleTitle) {
      appleTitle = document.createElement('meta');
      appleTitle.name = 'apple-mobile-web-app-title';
      document.head.appendChild(appleTitle);
    }
    appleTitle.content = appName;

    // ── 4. Theme Color ───────────────────────────────────────────────────
    let themeColorMeta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (!themeColorMeta) {
      themeColorMeta = document.createElement('meta');
      themeColorMeta.name = 'theme-color';
      document.head.appendChild(themeColorMeta);
    }
    themeColorMeta.content = themeColor;

    // ── 5. Dynamic PWA Manifest (Blob URL) ───────────────────────────────
    // IMPORTANT: In a Blob manifest, relative URLs are resolved against
    // "blob:null/" which is always invalid. We MUST use absolute URLs
    // (window.location.origin + path) for start_url and scope.
    const origin = window.location.origin;
    const startPath = slug ? `/${slug}/` : '/';
    const absoluteStartUrl = `${origin}${startPath}`;
    const absoluteScope = `${origin}${startPath}`;

    // Detect icon MIME type from URL extension
    const iconMime = iconHref.endsWith('.svg')
      ? 'image/svg+xml'
      : iconHref.endsWith('.jpg') || iconHref.endsWith('.jpeg')
      ? 'image/jpeg'
      : 'image/png';

    const manifest = {
      name: appName,
      short_name: appName,
      description: `${appName} — Guest Experience App`,
      // Absolute URLs required for blob: manifests
      start_url: absoluteStartUrl,
      scope: absoluteScope,
      display: 'standalone',
      background_color: '#1e2130',
      theme_color: themeColor,
      orientation: 'portrait-primary',
      icons: [
        // "any" — used for the browser favicon / home screen (non-maskable)
        {
          src: iconHref,
          sizes: 'any',        // "any" avoids size-mismatch warnings for non-square logos
          type: iconMime,
          purpose: 'any',
        },
        // Separate "maskable" entry so Chrome doesn't warn about combined "any maskable"
        {
          src: iconHref,
          sizes: 'any',
          type: iconMime,
          purpose: 'maskable',
        },
      ],
      categories: ['travel', 'lifestyle', 'utilities'],
      lang: 'en',
    };

    // Revoke previous Blob URL to avoid memory leaks
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }

    const blob = new Blob([JSON.stringify(manifest)], { type: 'application/manifest+json' });
    const blobUrl = URL.createObjectURL(blob);
    blobUrlRef.current = blobUrl;

    let manifestLink = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
    if (!manifestLink) {
      manifestLink = document.createElement('link');
      manifestLink.rel = 'manifest';
      document.head.appendChild(manifestLink);
    }
    manifestLink.href = blobUrl;

    // Cleanup on unmount or next hotel change
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, [logoUrl, name, primaryColor, slug]);
}
