const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const toIco = require('to-ico');

// Master SVG 1: Circular Badge for Favicon, Browser Tabs & Google Search (Google renders in a circle!)
const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <radialGradient id="bgGlow" cx="45%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#1e1845"/>
      <stop offset="55%" stop-color="#0d0e21"/>
      <stop offset="100%" stop-color="#05060b"/>
    </radialGradient>
    <linearGradient id="dGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#c084fc"/>
      <stop offset="35%" stop-color="#8b5cf6"/>
      <stop offset="70%" stop-color="#6366f1"/>
      <stop offset="100%" stop-color="#06b6d4"/>
    </linearGradient>
    <linearGradient id="sparkleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="40%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#06b6d4"/>
    </linearGradient>
    <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#c084fc"/>
      <stop offset="50%" stop-color="#6366f1"/>
      <stop offset="100%" stop-color="#06b6d4"/>
    </linearGradient>
    <filter id="aiGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="8" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <!-- Circular Outer Badge -->
  <circle cx="256" cy="256" r="242" fill="url(#bgGlow)"/>
  <circle cx="256" cy="256" r="236" fill="none" stroke="url(#ringGrad)" stroke-width="12"/>

  <!-- Centered Iconic "D" Monogram for Dyzzstore -->
  <path d="M 152 128
           H 268
           C 356 128, 396 182, 396 256
           C 396 330, 356 384, 268 384
           H 152
           Z
           M 216 192
           V 320
           H 262
           C 310 320, 332 292, 332 256
           C 332 220, 310 192, 262 192
           Z" 
        fill="url(#dGrad)" 
        fill-rule="evenodd"/>

  <!-- Brilliant 4-Point AI Core Sparkle inside "D" -->
  <path d="M 264 212 
           Q 264 256 308 256 
           Q 264 256 264 300 
           Q 264 256 220 256 
           Q 264 256 264 212 Z" 
        fill="url(#sparkleGrad)"
        filter="url(#aiGlow)"/>
</svg>`;

// Master SVG 2: Full-bleed square for Apple Touch Icon (iOS does not allow transparent corners)
const appleTouchSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <radialGradient id="appleBg" cx="50%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#1f1848"/>
      <stop offset="60%" stop-color="#0c0d1e"/>
      <stop offset="100%" stop-color="#05060b"/>
    </radialGradient>
    <linearGradient id="dGradApple" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#c084fc"/>
      <stop offset="35%" stop-color="#8b5cf6"/>
      <stop offset="70%" stop-color="#6366f1"/>
      <stop offset="100%" stop-color="#06b6d4"/>
    </linearGradient>
    <linearGradient id="sparkleGradApple" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="40%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#06b6d4"/>
    </linearGradient>
    <filter id="aiGlowApple" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="8" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <!-- Full-bleed background with subtle inner border glow -->
  <rect width="512" height="512" fill="url(#appleBg)"/>
  <rect x="12" y="12" width="488" height="488" rx="100" fill="none" stroke="rgba(192, 132, 252, 0.25)" stroke-width="4"/>

  <!-- Centered Iconic "D" Monogram -->
  <path d="M 152 128
           H 268
           C 356 128, 396 182, 396 256
           C 396 330, 356 384, 268 384
           H 152
           Z
           M 216 192
           V 320
           H 262
           C 310 320, 332 292, 332 256
           C 332 220, 310 192, 262 192
           Z" 
        fill="url(#dGradApple)" 
        fill-rule="evenodd"/>

  <!-- Brilliant 4-Point AI Core Sparkle inside "D" -->
  <path d="M 264 212 
           Q 264 256 308 256 
           Q 264 256 264 300 
           Q 264 256 220 256 
           Q 264 256 264 212 Z" 
        fill="url(#sparkleGradApple)"
        filter="url(#aiGlowApple)"/>
</svg>`;

// Master SVG 3: High-Resolution 1200x630 OpenGraph / Twitter Card Banner
const ogImageSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <linearGradient id="ogBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0a0a14"/>
      <stop offset="50%" stop-color="#0e0f22"/>
      <stop offset="100%" stop-color="#06060c"/>
    </linearGradient>
    <radialGradient id="ogGlow1" cx="20%" cy="30%" r="50%">
      <stop offset="0%" stop-color="#8b5cf6" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#8b5cf6" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="ogGlow2" cx="80%" cy="70%" r="50%">
      <stop offset="0%" stop-color="#06b6d4" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#06b6d4" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="titleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="55%" stop-color="#e2e8f0"/>
      <stop offset="80%" stop-color="#c084fc"/>
      <stop offset="100%" stop-color="#38bdf8"/>
    </linearGradient>
    <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#a855f7"/>
      <stop offset="100%" stop-color="#06b6d4"/>
    </linearGradient>
    <linearGradient id="cardBorder" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#8b5cf6" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="#06b6d4" stop-opacity="0.2"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#ogBg)"/>
  <rect width="1200" height="630" fill="url(#ogGlow1)"/>
  <rect width="1200" height="630" fill="url(#ogGlow2)"/>

  <!-- Subtle Grid Accent -->
  <g opacity="0.06" stroke="#ffffff" stroke-width="1">
    <line x1="0" y1="105" x2="1200" y2="105"/>
    <line x1="0" y1="210" x2="1200" y2="210"/>
    <line x1="0" y1="315" x2="1200" y2="315"/>
    <line x1="0" y1="420" x2="1200" y2="420"/>
    <line x1="0" y1="525" x2="1200" y2="525"/>
    <line x1="200" y1="0" x2="200" y2="630"/>
    <line x1="400" y1="0" x2="400" y2="630"/>
    <line x1="600" y1="0" x2="600" y2="630"/>
    <line x1="800" y1="0" x2="800" y2="630"/>
    <line x1="1000" y1="0" x2="1000" y2="630"/>
  </g>

  <!-- Outer Card Frame -->
  <rect x="24" y="24" width="1152" height="582" rx="24" fill="none" stroke="url(#cardBorder)" stroke-width="2"/>

  <!-- Left Side: Large Dyzzstore Emblem (Nested SVG icon) -->
  <g transform="translate(100, 155) scale(0.62)">
    <!-- Circle badge -->
    <circle cx="256" cy="256" r="242" fill="#0d0e21"/>
    <circle cx="256" cy="256" r="236" fill="none" stroke="url(#accentGrad)" stroke-width="14"/>
    <!-- "D" shape -->
    <path d="M 152 128 H 268 C 356 128, 396 182, 396 256 C 396 330, 356 384, 268 384 H 152 Z M 216 192 V 320 H 262 C 310 320, 332 292, 332 256 C 332 220, 310 192, 262 192 Z" 
          fill="url(#accentGrad)" fill-rule="evenodd"/>
    <!-- Sparkle -->
    <path d="M 264 212 Q 264 256 308 256 Q 264 256 264 300 Q 264 256 220 256 Q 264 256 264 212 Z" 
          fill="#ffffff"/>
  </g>

  <!-- Right Side: Brand Content -->
  <g transform="translate(470, 160)">
    <!-- Brand Pill Tag -->
    <rect x="0" y="0" width="230" height="36" rx="18" fill="rgba(139, 92, 246, 0.2)" stroke="#8b5cf6" stroke-width="1"/>
    <text x="115" y="23" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="700" fill="#c084fc" text-anchor="middle" letter-spacing="1.5">OFFICIAL MARKETPLACE</text>

    <!-- Main Title -->
    <text x="0" y="105" font-family="system-ui, -apple-system, sans-serif" font-size="64" font-weight="900" fill="url(#titleGrad)" letter-spacing="-1.5">
      Dyzz<tspan fill="#38bdf8">store</tspan>
    </text>

    <!-- Subtitle -->
    <text x="0" y="165" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="500" fill="#cbd5e1">
      Premier AI Tools Marketplace &amp; Unified Subscriptions
    </text>

    <!-- Feature Bullet Badges -->
    <g transform="translate(0, 220)">
      <rect x="0" y="0" width="165" height="42" rx="12" fill="rgba(15, 23, 42, 0.8)" stroke="rgba(255,255,255,0.1)"/>
      <text x="82" y="26" font-family="system-ui, sans-serif" font-size="14" font-weight="600" fill="#e2e8f0" text-anchor="middle">⚡ 45+ AI Models</text>

      <rect x="180" y="0" width="195" height="42" rx="12" fill="rgba(15, 23, 42, 0.8)" stroke="rgba(255,255,255,0.1)"/>
      <text x="277" y="26" font-family="system-ui, sans-serif" font-size="14" font-weight="600" fill="#e2e8f0" text-anchor="middle">🔒 Perpetual Licenses</text>

      <rect x="390" y="0" width="200" height="42" rx="12" fill="rgba(15, 23, 42, 0.8)" stroke="rgba(255,255,255,0.1)"/>
      <text x="490" y="26" font-family="system-ui, sans-serif" font-size="14" font-weight="600" fill="#e2e8f0" text-anchor="middle">🇰🇭 KHQR &amp; Card Pay</text>
    </g>

    <!-- URL footer -->
    <text x="0" y="315" font-family="monospace" font-size="18" font-weight="600" fill="#94a3b8">
      https://dyzzstore.store
    </text>
  </g>
</svg>`;

async function generateAll() {
  const publicDir = path.join(__dirname, '../public');
  const svgBuffer = Buffer.from(faviconSvg);
  const appleSvgBuffer = Buffer.from(appleTouchSvg);
  const ogSvgBuffer = Buffer.from(ogImageSvg);

  console.log('Writing public/favicon.svg...');
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), faviconSvg);

  // Generate PNGs at required sizes
  const sizes = [
    { name: 'favicon-16x16.png', size: 16 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'favicon-48x48.png', size: 48 }, // Critical for Google Search!
    { name: 'favicon-96x96.png', size: 96 },
    { name: 'favicon.png', size: 192 },
    { name: 'android-chrome-192x192.png', size: 192 },
    { name: 'android-chrome-512x512.png', size: 512 }
  ];

  for (const item of sizes) {
    const dest = path.join(publicDir, item.name);
    await sharp(svgBuffer)
      .resize(item.size, item.size)
      .png()
      .toFile(dest);
    console.log(`Generated ${item.name} (${item.size}x${item.size})`);
  }

  // Apple Touch Icons (solid background)
  const appleSizes = [
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'apple-touch-icon-152x152.png', size: 152 },
    { name: 'apple-touch-icon-167x167.png', size: 167 }
  ];

  for (const item of appleSizes) {
    const dest = path.join(publicDir, item.name);
    await sharp(appleSvgBuffer)
      .resize(item.size, item.size)
      .png()
      .toFile(dest);
    console.log(`Generated ${item.name} (${item.size}x${item.size})`);
  }

  // Generate multi-size favicon.ico (16, 32, 48)
  console.log('Generating public/favicon.ico with 16, 32, and 48px sizes...');
  const ico16 = await sharp(svgBuffer).resize(16, 16).png().toBuffer();
  const ico32 = await sharp(svgBuffer).resize(32, 32).png().toBuffer();
  const ico48 = await sharp(svgBuffer).resize(48, 48).png().toBuffer();

  const icoBuffer = await toIco([ico16, ico32, ico48]);
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);
  console.log('Generated public/favicon.ico successfully!');

  // Generate OpenGraph Image (1200x630)
  console.log('Generating public/og-image.png (1200x630)...');
  await sharp(ogSvgBuffer)
    .resize(1200, 630)
    .png()
    .toFile(path.join(publicDir, 'og-image.png'));
  console.log('Generated public/og-image.png');

  // Generate site.webmanifest
  const webManifest = {
    name: "Dyzzstore — Premier AI Tools Marketplace",
    short_name: "Dyzzstore",
    description: "Discover, buy, and subscribe to 45+ premier AI models, autonomous agents, and developer tools.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a14",
    theme_color: "#7c3aed",
    icons: [
      {
        src: "/favicon-48x48.png",
        sizes: "48x48",
        type: "image/png"
      },
      {
        src: "/favicon-96x96.png",
        sizes: "96x96",
        type: "image/png"
      },
      {
        src: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable"
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable"
      }
    ]
  };

  fs.writeFileSync(
    path.join(publicDir, 'site.webmanifest'),
    JSON.stringify(webManifest, null, 2)
  );
  console.log('Generated public/site.webmanifest');

  // Generate robots.txt
  const robotsTxt = `# https://www.robotstxt.org/robotstxt.html
User-agent: *
Allow: /
Allow: /favicon.ico
Allow: /favicon.svg
Allow: /favicon-*.png
Allow: /apple-touch-icon*.png
Allow: /site.webmanifest

Sitemap: https://dyzzstore.store/sitemap.xml
`;
  fs.writeFileSync(path.join(publicDir, 'robots.txt'), robotsTxt);
  console.log('Generated public/robots.txt');

  // Generate sitemap.xml
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://dyzzstore.store/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;
  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapXml);
  console.log('Generated public/sitemap.xml');

  console.log('ALL ICONS AND SEO ASSETS GENERATED SUCCESSFULLY!');
}

generateAll().catch(console.error);
