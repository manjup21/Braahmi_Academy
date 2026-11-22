import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, '../public');
const source = path.join(publicDir, 'logo.png');

const WHITE = { r: 255, g: 255, b: 255, alpha: 1 };

/** Place logo centered on a square canvas with padding (scale = fraction of canvas). */
async function writeIcon(size, scale, filename) {
  const logoSize = Math.round(size * scale);
  const offset = Math.floor((size - logoSize) / 2);

  const resized = await sharp(source)
    .resize(logoSize, logoSize, { fit: 'contain', background: WHITE })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: WHITE,
    },
  })
    .composite([{ input: resized, left: offset, top: offset }])
    .png()
    .toFile(path.join(publicDir, filename));

  console.log(`Wrote ${filename} (logo ${Math.round(scale * 100)}% of ${size}px)`);
}

// Favicons (browser tab / bookmarks)
await writeIcon(48, 0.9, 'favicon-48.png');
await writeIcon(192, 0.85, 'favicon-192.png');

// ICO: multi-size PNG packed as .ico via sharp (48 is enough for modern browsers)
{
  const logoSize = Math.round(48 * 0.9);
  const offset = Math.floor((48 - logoSize) / 2);
  const resized = await sharp(source)
    .resize(logoSize, logoSize, { fit: 'contain', background: WHITE })
    .png()
    .toBuffer();
  const icon48 = await sharp({
    create: { width: 48, height: 48, channels: 4, background: WHITE },
  })
    .composite([{ input: resized, left: offset, top: offset }])
    .png()
    .toBuffer();
  await sharp(icon48).resize(48, 48).toFile(path.join(publicDir, 'favicon.ico'));
  console.log('Wrote favicon.ico (48px)');
}

// SVG favicon wrapping a data-URL PNG (keeps link rel="icon" type=image/svg+xml working)
{
  const png = await sharp(path.join(publicDir, 'favicon-192.png')).png().toBuffer();
  const b64 = png.toString('base64');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 192 192"><image width="192" height="192" xlink:href="data:image/png;base64,${b64}"/></svg>\n`;
  await import('node:fs/promises').then((fs) =>
    fs.writeFile(path.join(publicDir, 'favicon.svg'), svg)
  );
  console.log('Wrote favicon.svg');
}

// Only 3 files needed — see README / vite.config manifest comments.
// Standard icons: home screen (any), launch splash, in-app logo
await writeIcon(192, 0.78, 'pwa-192x192.png');
await writeIcon(512, 0.78, 'pwa-512x512.png');

// Maskable: Android rounded icon (extra padding so shield is not clipped)
await writeIcon(512, 0.68, 'pwa-512x512-maskable.png');
