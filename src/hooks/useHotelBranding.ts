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
 * @param logoUrl  - Source URL of the hotel logo
 * @param bgColor  - Background fill color (hotel primary color or white)
 * @param size     - Output canvas size in pixels (e.g. 512)
 * @returns        - A PNG data-URL of the generated icon, or the original URL on failure
 */
async function generateSquareIcon(
  logoUrl: string,
  bgColor: string,
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
      // Use the hotel's primary color as background so the icon feels branded.
      // For very dark colors we lighten slightly; for very light colors we darken.
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, size, size);

      // ── Logo placement with padding ─────────────────────────────────────
      // Reserve 18% padding on each side → logo uses max 64% of the canvas.
      // This guarantees the logo is fully visible even inside a circular mask.
      const padding = size * 0.18;
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
 * Picks a readable background color for the icon canvas based on the
 * hotel's primary color.  Very dark colors get a slight tint; very light
 * colors get a slight darkening; otherwise the color is used as-is.
 */
function resolveIconBackground(primaryColor: string): string {
  // Strip '#' and parse RGB
  const hex = primaryColor.replace('#', '');
  if (hex.length !== 6) return primaryColor;
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);

  // Perceived lightness (0–255)
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

  if (luminance < 30) {
    // Near-black → use a dark-but-not-pure-black shade so the logo pops
    return '#1a1a2e';
  }
  if (luminance > 230) {
    // Near-white → use a subtle light grey so edges are visible
    return '#f5f5f5';
  }
  return primaryColor;
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

    const rawLogoUrl = logoUrl || DEFAULT_FAVICON;
    const appName = name || DEFAULT_TITLE;
    const themeColor = primaryColor || DEFAULT_COLOR;

    let cancelled = false;

    const applyBranding = async () => {
      // ── 1. Favicon <link rel="icon"> ─────────────────────────────────────
      // Use the raw logo URL for the tab favicon — browsers handle any size fine here.
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

      // ── 5. Generate square icon via Canvas ───────────────────────────────
      // This is the key step: we render the logo onto a square canvas with
      // padding so that Android's circular/rounded-square mask does not clip
      // the logo, regardless of the original image aspect ratio.
      const bgColor = resolveIconBackground(themeColor);
      const squareIcon512 = await generateSquareIcon(rawLogoUrl, bgColor, 512);
      const squareIcon192 = await generateSquareIcon(rawLogoUrl, bgColor, 192);

      if (cancelled) return; // component unmounted while we were generating

      // ── 6. Dynamic PWA Manifest (Blob URL) ───────────────────────────────
      // IMPORTANT: In a Blob manifest, relative URLs resolve against blob:null/
      // which is always invalid — we MUST use absolute URLs.
      const origin = window.location.origin;
      const startPath = slug ? `/${slug}/` : '/';

      const manifest = {
        name: appName,
        short_name: appName,
        description: `${appName} — Guest Experience App`,
        start_url: `${origin}${startPath}`,
        scope: `${origin}${startPath}`,
        display: 'standalone',
        background_color: bgColor,
        theme_color: themeColor,
        orientation: 'portrait-primary',
        icons: [
          // 192 × 192 — standard home-screen icon
          {
            src: squareIcon192,
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          // 512 × 512 — splash screen / high-DPI home screen
          {
            src: squareIcon512,
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          // Maskable variant — same padded image, safe for circular masks
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
    };

    applyBranding();

    // Cleanup on unmount or next hotel change
    return () => {
      cancelled = true;
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, [logoUrl, name, primaryColor, slug]);
}
