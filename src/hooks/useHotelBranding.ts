import { useEffect, useRef } from 'react';

interface HotelBrandingOptions {
  logoUrl?: string | null;
  name?: string | null;
  primaryColor?: string | null;
  slug?: string | null;
}

/**
 * Draws the hotel logo onto a square canvas with padding, so that the icon
 * always looks correct on Android/iOS home screens regardless of the logo's
 * original aspect ratio (wide, tall, square…).
 *
 * Uses a crisp white (#ffffff) background for high contrast and maximum readability.
 *
 * @param logoUrl  - Source URL of the hotel logo
 * @param bgColor  - Background fill color (defaults to #ffffff for crisp contrast)
 * @param size     - Output canvas size in pixels (e.g. 512)
 * @returns        - A PNG data-URL of the generated icon, or the original URL on failure
 */
async function generateSquareIcon(
  logoUrl: string,
  bgColor = '#ffffff',
  size = 512
): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) { resolve(logoUrl); return; }

    const img = new Image();
    img.crossOrigin = 'anonymous'; // needed for Supabase Storage URLs

    img.onload = () => {
      // ── Background ──────────────────────────────────────────────────────
      // Clean white background ensures high contrast regardless of logo color
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, size, size);

      // ── Logo placement with padding ─────────────────────────────────────
      // Reserve 16% padding on each side → logo uses max 68% of the canvas.
      const padding = size * 0.16;
      const maxW = size - padding * 2;
      const maxH = size - padding * 2;

      const scale = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight);
      const drawW = img.naturalWidth * scale;
      const drawH = img.naturalHeight * scale;

      // Center horizontally and vertically
      const x = (size - drawW) / 2;
      const y = (size - drawH) / 2;

      ctx.drawImage(img, x, y, drawW, drawH);

      resolve(canvas.toDataURL('image/png'));
    };

    img.onerror = () => {
      // CORS blocked or image unavailable — fall back to raw URL
      resolve(logoUrl);
    };

    img.src = logoUrl;
  });
}

/**
 * Dynamically updates browser/PWA branding (favicon, apple-touch-icon,
 * theme-color, web-app title, and manifest) based on the active hotel.
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

    const rawLogoUrl = logoUrl || DEFAULT_FAVICON;
    const appName = name || DEFAULT_TITLE;
    const themeColor = primaryColor || DEFAULT_COLOR;

    let cancelled = false;

    const applyBranding = async () => {
      // ── 1. Favicon <link rel="icon"> ─────────────────────────────────────
      let faviconLink = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
      if (!faviconLink) {
        faviconLink = document.createElement('link');
        faviconLink.rel = 'icon';
        document.head.appendChild(faviconLink);
      }
      faviconLink.href = rawLogoUrl;
      faviconLink.type = rawLogoUrl.endsWith('.svg') ? 'image/svg+xml' : 'image/png';

      // ── 2. Apple Touch Icon ──────────────────────────────────────────────
      let appleIcon = document.querySelector<HTMLLinkElement>('link[rel="apple-touch-icon"]');
      if (!appleIcon) {
        appleIcon = document.createElement('link');
        appleIcon.rel = 'apple-touch-icon';
        document.head.appendChild(appleIcon);
      }
      appleIcon.href = rawLogoUrl;

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

      // ── 5. Generate square icon via Canvas (White background) ───────────
      // White background ensures clear contrast for all logos (dark text, blue text, etc.)
      const squareIcon512 = await generateSquareIcon(rawLogoUrl, '#ffffff', 512);
      const squareIcon192 = await generateSquareIcon(rawLogoUrl, '#ffffff', 192);

      if (cancelled) return;

      // ── 6. Dynamic PWA Manifest (Blob URL) ───────────────────────────────
      const origin = window.location.origin;
      const startPath = slug ? `/${slug}/` : '/';

      const manifest = {
        name: appName,
        short_name: appName,
        description: `${appName} — Guest Experience App`,
        start_url: `${origin}${startPath}`,
        scope: `${origin}${startPath}`,
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: themeColor,
        orientation: 'portrait-primary',
        icons: [
          {
            src: squareIcon192,
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: squareIcon512,
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: squareIcon512,
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
        categories: ['travel', 'lifestyle', 'utilities'],
        lang: 'en',
      };

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
    };

    applyBranding();

    return () => {
      cancelled = true;
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, [logoUrl, name, primaryColor, slug]);
}
