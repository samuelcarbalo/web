/**
 * Generates minimal solid PNGs for PWA icons (no external deps).
 * Brand navy #021433 with a teal #0BAD9A rounded square mark.
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, '../public');

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = c & 1 ? (0xedb88320 ^ (c >>> 1)) : c >>> 1;
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type);
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const crcBuf = Buffer.alloc(4);
  const crc = crc32(Buffer.concat([typeBuf, data]));
  crcBuf.writeUInt32BE(crc);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function writePng(size, fileName) {
  const navy = [0x02, 0x14, 0x33, 0xff];
  const teal = [0x0b, 0xad, 0x9a, 0xff];
  const white = [0xfe, 0xfd, 0xfe, 0xff];

  const rows = [];
  const inset = Math.floor(size * 0.18);
  const radius = Math.floor(size * 0.12);

  for (let y = 0; y < size; y++) {
    const row = Buffer.alloc(1 + size * 4);
    row[0] = 0; // filter none
    for (let x = 0; x < size; x++) {
      const i = 1 + x * 4;
      let color = navy;

      const inMark =
        x >= inset &&
        x < size - inset &&
        y >= inset &&
        y < size - inset;

      if (inMark) {
        const lx = x - inset;
        const ly = y - inset;
        const w = size - inset * 2;
        const h = size - inset * 2;
        const nearCorner =
          (lx < radius && ly < radius && (lx - radius) ** 2 + (ly - radius) ** 2 > radius ** 2) ||
          (lx > w - radius - 1 && ly < radius && (lx - (w - radius - 1)) ** 2 + (ly - radius) ** 2 > radius ** 2) ||
          (lx < radius && ly > h - radius - 1 && (lx - radius) ** 2 + (ly - (h - radius - 1)) ** 2 > radius ** 2) ||
          (lx > w - radius - 1 &&
            ly > h - radius - 1 &&
            (lx - (w - radius - 1)) ** 2 + (ly - (h - radius - 1)) ** 2 > radius ** 2);

        if (!nearCorner) {
          // inner teal pad with tiny white “dot” as app mark
          const cx = w / 2;
          const cy = h / 2;
          const dx = lx - cx;
          const dy = ly - cy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < size * 0.12) color = white;
          else color = teal;
        }
      }

      row[i] = color[0];
      row[i + 1] = color[1];
      row[i + 2] = color[2];
      row[i + 3] = color[3];
    }
    rows.push(row);
  }

  const raw = Buffer.concat(rows);
  const compressed = zlib.deflateSync(raw, { level: 9 });

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const png = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0)),
  ]);

  const out = path.join(outDir, fileName);
  fs.writeFileSync(out, png);
  console.log('Wrote', out, png.length, 'bytes');
}

writePng(192, 'icon-192x192.png');
writePng(512, 'icon-512x512.png');
