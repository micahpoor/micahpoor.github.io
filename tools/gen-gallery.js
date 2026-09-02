#!/usr/bin/env node
/*
 * Regenerates the web-sized gallery derivatives from the camera originals.
 *
 *   node tools/gen-gallery.js
 *
 * Reads  assets/photos/    (originals -- untracked, these are the masters)
 * Writes assets/gallery/   (committed -- two WebP sizes per photo)
 *
 * The originals are ~228MB across 10 files, up to 9270px wide and 46MB each.
 * Nothing in that folder is servable as-is; this exists so a new photo can be
 * added without re-deriving the encoding settings by hand.
 *
 * Sizes: 1100px longest edge for the masonry grid, 2200px for the lightbox.
 * Both fit *within* the box, so aspect ratio is preserved and portraits stay
 * portrait. Output lands around 3.5MB total, ~800KB of which is the grid.
 *
 * IMPORTANT: this only produces images and a manifest. It does NOT write
 * gallery.html. That file is hand-maintained now because every photo carries
 * written alt text describing what is actually in the frame -- regenerating the
 * markup would destroy it. To add a photo: run this, then add the <button> block
 * to gallery.html by hand and write the alt text.
 *
 * Requires ffmpeg and ffprobe on PATH.
 */

const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'assets/photos');
const OUT = path.join(ROOT, 'assets/gallery');

const GRID_BOX = 1100;
const FULL_BOX = 2200;
const GRID_QUALITY = 80;
const FULL_QUALITY = 82;

function probe(file) {
  const out = cp.execFileSync('ffprobe', [
    '-hide_banner', '-v', 'error', '-select_streams', 'v:0',
    '-show_entries', 'stream=width,height', '-of', 'csv=p=0:s=x', file
  ], { encoding: 'utf8' }).trim();
  const [w, h] = out.split('x').map(Number);
  return { w, h };
}

function encode(src, dest, box, quality) {
  cp.execFileSync('ffmpeg', [
    '-hide_banner', '-loglevel', 'error', '-y', '-i', src,
    '-vf', `scale=${box}:${box}:force_original_aspect_ratio=decrease`,
    '-c:v', 'libwebp', '-quality', String(quality), '-compression_level', '6',
    dest
  ]);
  return probe(dest);
}

if (!fs.existsSync(SRC)) {
  console.error('No originals found at ' + SRC);
  process.exit(1);
}

fs.mkdirSync(OUT, { recursive: true });

const files = fs.readdirSync(SRC).filter(f => /\.(jpe?g|png)$/i.test(f));
if (!files.length) {
  console.error('No .jpg/.png files in ' + SRC);
  process.exit(1);
}

const manifest = [];
for (const f of files) {
  const src = path.join(SRC, f);
  const slug = f.replace(/\.(jpe?g|png)$/i, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const orig = probe(src);

  const gridPath = path.join(OUT, `${slug}.webp`);
  const fullPath = path.join(OUT, `${slug}-full.webp`);
  const grid = encode(src, gridPath, GRID_BOX, GRID_QUALITY);
  const full = encode(src, fullPath, FULL_BOX, FULL_QUALITY);

  const gridKB = Math.round(fs.statSync(gridPath).size / 1024);
  const fullKB = Math.round(fs.statSync(fullPath).size / 1024);

  manifest.push({
    slug,
    source: f,
    orientation: orig.w > orig.h ? 'landscape' : 'portrait',
    grid: { file: `assets/gallery/${slug}.webp`, w: grid.w, h: grid.h },
    full: { file: `assets/gallery/${slug}-full.webp`, w: full.w, h: full.h }
  });

  console.log(`${f}  ->  ${slug}   grid ${grid.w}x${grid.h} (${gridKB}KB)   full ${full.w}x${full.h} (${fullKB}KB)`);
}

fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 1) + '\n');

console.log(`\n${manifest.length} photos -> ${OUT}`);
console.log('manifest.json written. Paste the width/height into gallery.html and write the alt text by hand.');
