// The World in One Day — Sunday, 22 November 2026.
// A make.fun news-image entry (program/v1, Node 22, standard library only).
// This program draws a 1024x1024 newspaper front page entirely in code —
// no photos, no copied images, no network, no randomness — and writes it
// deterministically to /output/entry.png (or $MAKEFUN_OUTPUT_DIR/entry.png).
//
// The six stories were all first reported on Sunday 22 November 2026:
//   1. COP31 climate talks run into a second day of overtime (BBC, Al Jazeera)
//   2. Mexico captures cartel boss "El Chapo Isidro"; 11 killed (BBC, Xinhua)
//   3. FBI probes suspected hack of its national crime database (BBC)
//   4. Lewis Pugh swims the war-hit Strait of Hormuz (Inshorts)
//   5. Winter storms flood shelters in Gaza (Nexus Europa)
//   6. World court rules on the Myanmar genocide case (Curious Cats / ICJ)
//
// Text is drawn with an embedded 24-row bitmap font rasterised from the
// system DejaVu Sans Bold face at build time; the program itself needs no
// font files, no assets and no network at run time.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { deflateSync } from "node:zlib";

const W = 1024;
const H = 1024;

// ---------------------------------------------------------------- font ----
// One bold bitmap face: printable ASCII 32..126, 24 rows tall, variable
// glyph widths. FONT_BITS holds every glyph row-major, MSB-first within a
// row, glyphs in ASCII order; FONT_WIDTHS gives each glyph's pixel width.
const FONT_HEIGHT = 24;
const FONT_WIDTHS: number[] = [6, 3, 7, 14, 11, 18, 15, 2, 5, 5, 9, 13, 5, 6, 4, 7, 12, 11, 10, 11, 12, 10, 12, 11, 12, 12, 4, 5, 13, 13, 13, 9, 18, 15, 12, 12, 14, 10, 10, 14, 13, 4, 6, 14, 10, 16, 13, 15, 12, 15, 13, 12, 14, 12, 15, 20, 14, 14, 13, 6, 7, 6, 11, 10, 5, 11, 11, 10, 12, 12, 9, 12, 11, 3, 5, 11, 3, 17, 11, 12, 11, 12, 8, 10, 9, 11, 13, 17, 11, 12, 10, 9, 2, 9, 13];
const FONT_BITS_B64 =
  "AAAAAAAAAAAAAAAAAAAAAAAAAA/////H/4AAAAAADPnz584AAAAAAAAAAAAAAAAAAAAAAAAAAAM4HMBjAYx//f/wxgMYDOP/7/+GMBnA5gMYAAAAAAAAAAAAAAAAAAAAwBgPx/7s3YOwf4f8f4Nwb43f+fwGAMAYAAAAAAAAAAAAAAAAfAw/gw5hgxjgxjA5mA/mAfM+AZ/AZ3AxjAxjBh3DB/DA+AAAAAAAAAAAAAAAAAAAAAAAAAB4A/wHCB4AHAA8APw7/Hc93n+8f3h8ePh/+H54AAAAAAAAAAAAAP/AAAAAAAADnc53Oc5znOec45wAAAAOcc55znOc5zvc7nAAAAAAAAGAwmf+PH+mYwGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4AcAOAHADg////wcAOAHADgBwAAAAAAAAAAAAAAAAAAAAAAAD3vc7mAAAAAAAAAAAAAA///AAAAAAAAAAAAAAAAAAA//8AAAAAAAAGDDhgw4YMOGDDhgw4YAAAAAAAAAAAAAHwP8eecO8P8P8P8P8P8P8PcOeeP8HwAAAAAAAAAAAAAAAAAD4fwzgHAOAcA4BwDgHAOAcA4f//+AAAAAAAAAAAAAAAB+P+x8DwPA8DweDweDweDwP//8AAAAAAAAAAAAAAAD+P+Q+A8B4Hh+D+A+A8A4D8P/+PwAAAAAAAAAAAAAAAAAB8B8D8H8H8O8c8c84848////A8A8A8AAAAAAAAAAAAAAAAD/v+4DgOA/z/ofA8BwHA+H/+fgAAAAAAAAAAAAAAAAD8H+PCeAcA94/++e8P8PcPcPeeP8D4AAAAAAAAAAAAAAAAAP///AeA8DwHgeA8B4HgPA8B4DgPAAAAAAAAAAAAAAAAAAH4f+eecOcOeeP8P8ee8O8P8Peef+H4AAAAAAAAAAAAAAAAAAHwP8cc8e8O8O8fcff/HuAOAeQ8f4PwAAAAAAAAAAAAAAAP//AA//8AAAAAAAAAB73vAAD3ve5nAAAAAAAAAAAAAAAAAAAwD4H4fh+A8AfgB+AH4A+ADAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD////AAAAP///8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAYAPAD8APwA+AHgPg/D8DwBgAAAAAAAAAAAAAAAAAAAAPn/x4HB4PDw8HB4AB4PB4PAAAAAAAAAAAAAAAAAAAAA/AD/wHg4OAMcdmY/mZzixhjxhjxhixhmZzuY/8cdwOAQHBwD/wA/AAAAAAAAAAAAAAAAAB8APwB+AfwD/Ad4HnA88PHh4cP/z/+eBzgP8B4AAAAAAAAAAAAAAAAAAAA/4/88e8e8e8e/8/88e8P8P8P8e/+/4AAAAAAAAAAAAAAAAAAB+H/PBeAcA8A8A8A8A8AcAeAPBH/B+AAAAAAAAAAAAAAAAAAAP+D/48fPB7we8HvA7wP8DvB7we8PvHz/4/4AAAAAAAAAAAAAAAAAAD///8DwPA8D///8DwPA8DwP//8AAAAAAAAAAAAAAD///8DwPA8D///8DwPA8DwPA8AAAAAAAAAAAAAAAAAAAfwf+PAngBwA8APADw/8P/A9wPeDzw8f/B/AAAAAAAAAAAAAAAAAAAADwf4P8H+D/B/g/////8H+D/B/g/wf4P8HgAAAAAAAAAAAAD/////////8AAAAAAAPPPPPPPPPPPPPPPOe84AAAAAAAAAAPB7w88ePPD3g/wP4D+A/wP+D3w8+PHzw+8HwAAAAAAAAAAAAAAAAADwPA8DwPA8DwPA8DwPA8DwP//8AAAAAAAAAAAAAAAAAAD4H/gf/D/8P/x/7n/uZ+fn5+fjx+PH4YfgB+AH4AcAAAAAAAAAAAAAAAAAAAAADwf8P+H/j/x/8/ufzv538f+P/D/h/wf4PgAAAAAAAAAAAAAAAAAAAAD+A/4PHjwe8B/gP8B/gP8B/gP8B7wePHg/4D+AAAAAAAAAAAAAAAAAAAAA/4/+8e8P8P8P8P8e/+/48A8A8A8A8AAAAAAAAAAAAAAAAAAAAAD+A/4PHjwe8B/gP8B/gP8B/gP8B7wePHg/4D+AB4AHgAcAAAAAAAAAAAAAD/h/48eePPHnjzxx/w/4eePHnjzw94e8HgAAAAAAAAAAAAAAAAAAH+P+eGcC8AeAf4P+H/AfAPAPYPf+P4AAAAAAAAAAAAAAAAAAAP////B4AeAHgB4AeAHgB4AeAHgB4AeAHgB4AAAAAAAAAAAAAAAAAAAA8H8H8H8H8H8H8H8H8H8H8H8PePf+H4AAAAAAAAAAAAAAAAAAAA8B7gPeBzweODx4cPHg48HnAd4D/AfwB+APwB8AAAAAAAAAAAAAAAAAAAAAAAAAAODwfw8H8PD/H49x+OcfjnmZ55neO53Dudw/D8Pw/D8PwfD4HweAAAAAAAAAAAAAAAAAAAAAAAAAAPA5weePDzwf4H8A/APgD8B/A94PPHjzwe8DwAAAAAAAAAAAAAAAAAAAAPA94PeHjzwe8H+A/gHwB4AeAHgB4AeAHgB4AAAAAAAAAAAAAAAAAAAAD/9/+AfAPgPgPgPgHwHwHwHwD4D4B////gAAAAAAAAAAAAAA//44444444444444//AAAAAADBwYMHBgwcGDBwYMHBgwAAAAAAAA//HHHHHHHHHHHHHH//AAAAAAAAAA4D4O447AYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD///AAHHGGAAAAAAAAAAAAAAAAAAAAAAAAAAAAB/D/gHgPP+//x/D/P//PeAAAAAAAAAAAAAAAAOAcA4BwDnn/vH+P4Pwfg/j/H/+54AAAAAAAAAAAAAAAAAAAAAAB8P94PA8DwPA8B4D/HwAAAAAAAAAAAAAAAAAPAPAPAPHPf/ef8P8P8P8P8Peff/HPAAAAAAAAAAAAAAAAAAAAAAAAAAH4f8ce8O////8A8AeCf+H4AAAAAAAAAAAAAAAAD4/PB4///PB4PB4PB4PB4PAAAAAAAAAAAAAAAAAAAAAAAAHPf/ef8P8P8P8P8Peff/HPAOQef8HwAAAAAAAAAOAcA4BwDnn/vHeP4fw/h/D+H8P4eAAAAAAAAAAA/4/////4AAAAADnOA5znOc5znOd/uAAAAAAAAOAcA4BwDh/Hued4/h+D+HeOece4eAAAAAAAAAAA///////4AAAAAAAAAAAAAAAAAAAAAAAADnD3/f/Pn8PH4cPw4fhw/Dh+HD8OH4cOAAAAAAAAAAAAAAAAAAAAAAAAAAAADnn/vHeP4fw/h/D+H8P4eAAAAAAAAAAAAAAAAAAAAAAAAAH4f8ee8P8P8P8P8Peef8H4AAAAAAAAAAAAAAAAAAAAAAAADnn/vH+P4Pwfg/j/H/+55wDgHAOAAAAAAAAAAAAAAAAAAAHPf/ef8P8P8P8P8Peff/HPAPAPAPAPAAAAAAAAAAAADn//Dw4ODg4ODg4AAAAAAAAAAAAAAAAAAAAD8f7guA/h/h/A/D/+PwAAAAAAAAAAAAAAABwOBw///OBwOBwOB4PB/H4AAAAAAAAAAAAAAAAAAAAADh/D+H8P4fw/h/D/P//eeAAAAAAAAAAAAAAAAAAAAAAAAAAPB7g548ccOOHvB3A/gPgHwD4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADhx/HjvPHOfOc+87tx+fh8/D5+Hx4PjwAAAAAAAAAAAAAAAAAAAAAAAAAAAADx7jnvH8HwPgfB/HveO4OAAAAAAAAAAAAAAAAAAAAAAAAA8HcHePOOPOHeHcH8D4D4B4BwBwPgPAAAAAAAAAAAAAAAAP//8Hw+HweDweDwP//8AAAAAAAAAAAAAAD4/HA4HA4PB4+HwPB4HA4HA4H4fAAAAP//////AAAAAA8HwPB4PB4PA4H4/HB4PB4PB4+HgAAAAAAAAAAAAAAAAAAAAAAAAAAA/D//4fAAAAAAAAAAAAAAAAAAAAAA";

// Bit offset of each glyph inside the decoded bit stream.
const FONT_BYTES = Buffer.from(FONT_BITS_B64, "base64");
const FONT_OFFSETS: number[] = (() => {
  const offs: number[] = [];
  let acc = 0;
  for (const w of FONT_WIDTHS) {
    offs.push(acc);
    acc += w * FONT_HEIGHT;
  }
  return offs;
})();

function glyphBit(code: number, gx: number, gy: number): boolean {
  const w = FONT_WIDTHS[code - 32];
  if (gx < 0 || gx >= w || gy < 0 || gy >= FONT_HEIGHT) return false;
  const bit = FONT_OFFSETS[code - 32] + gy * w + gx;
  return (FONT_BYTES[bit >> 3] & (0x80 >> (bit & 7))) !== 0;
}

function textWidth(text: string, scale: number): number {
  let w = 0;
  for (const ch of text) {
    const code = ch.charCodeAt(0);
    if (code < 32 || code > 126) continue;
    w += (FONT_WIDTHS[code - 32] + 1) * scale;
  }
  return w > 0 ? w - scale : 0;
}

// ------------------------------------------------------------ PNG ----------
// Minimal deterministic PNG writer: 8-bit RGB, no filter, zlib level 9.
const CRC_TABLE: number[] = (() => {
  const t: number[] = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t.push(c >>> 0);
  }
  return t;
})();

function crc32(buf: Buffer): number {
  let c = 0xffffffff;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function pngChunk(type: string, data: Buffer): Buffer {
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  out.write(type, 4, "ascii");
  data.copy(out, 8);
  const crc = crc32(Buffer.concat([Buffer.from(type, "ascii"), data]));
  out.writeUInt32BE(crc, 8 + data.length);
  return out;
}

function encodePng(rgb: Uint8Array, width: number, height: number): Buffer {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // colour type RGB
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const raw = Buffer.alloc(height * (1 + width * 3));
  for (let y = 0; y < height; y++) {
    raw[y * (1 + width * 3)] = 0; // filter: none
    Buffer.from(rgb.buffer, rgb.byteOffset + y * width * 3, width * 3).copy(
      raw,
      y * (1 + width * 3) + 1,
    );
  }
  const idat = deflateSync(raw, { level: 9 });
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", idat),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

// ---------------------------------------------------------- canvas ---------
type RGB = [number, number, number];

class Canvas {
  px = new Uint8Array(W * H * 3);
  set(x: number, y: number, c: RGB): void {
    if (x < 0 || y < 0 || x >= W || y >= H) return;
    const i = (y * W + x) * 3;
    this.px[i] = c[0];
    this.px[i + 1] = c[1];
    this.px[i + 2] = c[2];
  }
  fill(x: number, y: number, w: number, h: number, c: RGB): void {
    const x0 = Math.max(0, x);
    const y0 = Math.max(0, y);
    const x1 = Math.min(W, x + w);
    const y1 = Math.min(H, y + h);
    for (let yy = y0; yy < y1; yy++) {
      for (let xx = x0; xx < x1; xx++) {
        const i = (yy * W + xx) * 3;
        this.px[i] = c[0];
        this.px[i + 1] = c[1];
        this.px[i + 2] = c[2];
      }
    }
  }
  line(x0: number, y0: number, x1: number, y1: number, c: RGB): void {
    const dx = Math.abs(x1 - x0);
    const dy = -Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    let x = x0;
    let y = y0;
    for (;;) {
      this.set(x, y, c);
      if (x === x1 && y === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) {
        err += dy;
        x += sx;
      }
      if (e2 <= dx) {
        err += dx;
        y += sy;
      }
    }
  }
  disc(cx: number, cy: number, r: number, c: RGB): void {
    for (let y = -r; y <= r; y++) {
      const half = Math.floor(Math.sqrt(r * r - y * y));
      for (let x = -half; x <= half; x++) this.set(cx + x, cy + y, c);
    }
  }
  ring(cx: number, cy: number, r: number, t: number, c: RGB): void {
    for (let a = 0; a < 360; a += 1) {
      const rad = (a * Math.PI) / 180;
      for (let k = 0; k < t; k++) {
        this.set(
          Math.round(cx + (r + k) * Math.cos(rad)),
          Math.round(cy + (r + k) * Math.sin(rad)),
          c,
        );
      }
    }
  }
  // Filled triangle (scanline, integer edges).
  tri(x0: number, y0: number, x1: number, y1: number, x2: number, y2: number, c: RGB): void {
    const minY = Math.min(y0, y1, y2);
    const maxY = Math.max(y0, y1, y2);
    for (let y = minY; y <= maxY; y++) {
      const xs: number[] = [];
      const edges: Array<[number, number, number, number]> = [
        [x0, y0, x1, y1],
        [x1, y1, x2, y2],
        [x2, y2, x0, y0],
      ];
      for (const [ax, ay, bx, by] of edges) {
        if ((ay <= y && by > y) || (by <= y && ay > y)) {
          xs.push(Math.round(ax + ((y - ay) * (bx - ax)) / (by - ay)));
        }
      }
      if (xs.length >= 2) {
        const lo = Math.min(...xs);
        const hi = Math.max(...xs);
        for (let x = lo; x <= hi; x++) this.set(x, y, c);
      }
    }
  }
  // Thick line drawn as a filled rectangle strip between two points.
  thickLine(x0: number, y0: number, x1: number, y1: number, t: number, c: RGB): void {
    const dx = x1 - x0;
    const dy = y1 - y0;
    const len = Math.hypot(dx, dy) || 1;
    const nx = (-dy / len) * (t / 2);
    const ny = (dx / len) * (t / 2);
    this.tri(
      Math.round(x0 + nx), Math.round(y0 + ny),
      Math.round(x1 + nx), Math.round(y1 + ny),
      Math.round(x1 - nx), Math.round(y1 - ny), c,
    );
    this.tri(
      Math.round(x0 + nx), Math.round(y0 + ny),
      Math.round(x1 - nx), Math.round(y1 - ny),
      Math.round(x0 - nx), Math.round(y0 - ny), c,
    );
  }
}

// ------------------------------------------------------------ text ---------
function drawText(cv: Canvas, x: number, y: number, text: string, scale: number, c: RGB): void {
  let cx = x;
  for (const ch of text) {
    const code = ch.charCodeAt(0);
    if (code < 32 || code > 126) {
      cx += 6 * scale;
      continue;
    }
    const w = FONT_WIDTHS[code - 32];
    for (let gy = 0; gy < FONT_HEIGHT; gy++) {
      for (let gx = 0; gx < w; gx++) {
        if (glyphBit(code, gx, gy)) {
          cv.fill(cx + gx * scale, y + gy * scale, scale, scale, c);
        }
      }
    }
    cx += (w + 1) * scale;
  }
}

function drawTextCentred(cv: Canvas, cx: number, y: number, text: string, scale: number, c: RGB): void {
  drawText(cv, cx - Math.floor(textWidth(text, scale) / 2), y, text, scale, c);
}

function wrapText(text: string, scale: number, maxW: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const word of words) {
    const trial = cur ? cur + " " + word : word;
    if (textWidth(trial, scale) <= maxW || !cur) {
      cur = trial;
    } else {
      lines.push(cur);
      cur = word;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

function drawWrapped(cv: Canvas, x: number, y: number, text: string, scale: number, maxW: number, leading: number, c: RGB): number {
  const lines = wrapText(text, scale, maxW);
  lines.forEach((ln, i) => drawText(cv, x, y + i * leading, ln, scale, c));
  return y + lines.length * leading;
}

// ---------------------------------------------------------- colours --------
const PAPER: RGB = [247, 241, 227];
const CELL: RGB = [255, 253, 246];
const INK: RGB = [28, 26, 23];
const MUTED: RGB = [107, 98, 87];
const NAVY: RGB = [22, 35, 63];
const RED: RGB = [163, 22, 33];
const GOLD: RGB = [201, 162, 39];
const TEAL: RGB = [14, 107, 107];
const SKY: RGB = [214, 232, 238];
const LINE: RGB = [28, 26, 23];

// ---------------------------------------------------------- scenes ---------
// Small code-drawn scenes for each story. All geometry is fixed; nothing
// here is a photograph or a copied image.

function sceneCop(cv: Canvas, x: number, y: number, w: number, h: number): void {
  cv.fill(x, y, w, h, [183, 220, 205]); // pale green sky
  cv.disc(x + w - 34, y + 26, 15, [242, 200, 84]); // sun
  cv.fill(x, y + h - 26, w, 26, [122, 158, 104]); // ground
  // Globe.
  const gx = x + 52;
  const gy = y + h / 2 - 4;
  cv.disc(gx, gy, 26, [52, 110, 168]);
  cv.disc(gx - 8, gy - 6, 8, [86, 160, 96]);
  cv.disc(gx + 9, gy + 8, 7, [86, 160, 96]);
  cv.ring(gx, gy, 26, 2, [22, 35, 63]);
  // Wind turbines: pole, hub, three short blades.
  for (const tx of [x + w - 108, x + w - 62]) {
    const top = y + 26;
    cv.thickLine(tx, y + h - 26, tx, top, 4, [255, 253, 246]);
    cv.disc(tx, top, 4, [255, 253, 246]);
    for (const a of [-90, 30, 150]) {
      const rad = (a * Math.PI) / 180;
      cv.thickLine(tx, top, Math.round(tx + 20 * Math.cos(rad)), Math.round(top + 20 * Math.sin(rad)), 3, [255, 253, 246]);
    }
  }
}

function sceneMexico(cv: Canvas, x: number, y: number, w: number, h: number): void {
  cv.fill(x, y, w, h, [244, 178, 102]); // desert dusk
  cv.disc(x + w - 22, y + 20, 12, [232, 84, 48]); // low sun
  cv.fill(x, y + h - 22, w, 22, [146, 84, 44]); // sand
  // Cactus.
  cv.fill(x + 10, y + h - 46, 7, 26, [52, 110, 72]);
  cv.fill(x + 4, y + h - 38, 8, 5, [52, 110, 72]);
  cv.fill(x + 4, y + h - 38, 4, 11, [52, 110, 72]);
  // Patrol car silhouette.
  const cy = y + h - 24;
  cv.fill(x + 26, cy - 10, 82, 12, [22, 35, 63]);
  cv.fill(x + 40, cy - 19, 42, 11, [22, 35, 63]);
  cv.disc(x + 46, cy + 2, 6, [20, 20, 20]);
  cv.disc(x + 88, cy + 2, 6, [20, 20, 20]);
  cv.fill(x + 26, cy - 10, 82, 3, [201, 162, 39]); // light bar
}

function sceneFbi(cv: Canvas, x: number, y: number, w: number, h: number): void {
  cv.fill(x, y, w, h, [30, 42, 68]); // dark server room
  // Server racks.
  for (let i = 0; i < 2; i++) {
    const sx = x + 10 + i * 44;
    cv.fill(sx, y + 8, 38, h - 16, [58, 74, 104]);
    for (let r = 0; r < 3; r++) {
      cv.fill(sx + 5, y + 13 + r * 15, 28, 8, [22, 35, 63]);
      cv.disc(sx + 10, y + 17 + r * 15, 2, [86, 220, 130]);
      cv.disc(sx + 17, y + 17 + r * 15, 2, [242, 200, 84]);
    }
  }
  // Magnifier over the racks.
  const mx = x + w - 24;
  const my = y + h - 24;
  cv.ring(mx, my, 14, 3, [255, 253, 246]);
  cv.thickLine(mx + 10, my + 10, mx + 22, my + 22, 4, [255, 253, 246]);
  // Red alert mark.
  cv.tri(mx - 3, my - 8, mx + 3, my - 8, mx, my + 1, [232, 84, 48]);
}

function sceneSea(cv: Canvas, x: number, y: number, w: number, h: number): void {
  cv.fill(x, y, w, h, [64, 130, 168]); // open sea
  cv.disc(x + 20, y + 16, 10, [242, 200, 84]); // sun
  // Tanker on the horizon.
  cv.fill(x + w - 58, y + 16, 48, 8, [40, 40, 44]);
  cv.fill(x + w - 48, y + 8, 14, 8, [40, 40, 44]);
  // Waves.
  for (let r = 0; r < 2; r++) {
    const wy = y + 40 + r * 12;
    for (let wx = x + 4; wx < x + w - 16; wx += 22) {
      cv.thickLine(wx, wy, wx + 10, wy - 4, 3, [214, 232, 238]);
      cv.thickLine(wx + 10, wy - 4, wx + 20, wy, 3, [214, 232, 238]);
    }
  }
  // Swimmer: cap, head, arm mid-stroke.
  const sx = x + 30;
  const sy = y + h - 14;
  cv.disc(sx, sy - 4, 6, [232, 180, 140]);
  cv.disc(sx, sy - 6, 6, [163, 22, 33]); // swim cap
  cv.thickLine(sx + 3, sy - 1, sx + 26, sy + 4, 5, [232, 180, 140]);
  cv.thickLine(sx + 23, sy + 1, sx + 34, sy - 8, 4, [232, 180, 140]);
}

function sceneGaza(cv: Canvas, x: number, y: number, w: number, h: number): void {
  cv.fill(x, y, w, h, [120, 138, 158]); // storm grey
  // Clouds.
  cv.disc(x + 22, y + 12, 10, [226, 230, 234]);
  cv.disc(x + 34, y + 9, 11, [226, 230, 234]);
  cv.disc(x + w - 28, y + 11, 10, [226, 230, 234]);
  // Rain.
  for (let i = 0; i < 5; i++) {
    const rx = x + 10 + i * 24;
    cv.thickLine(rx, y + 26, rx - 5, y + 38, 2, [214, 232, 238]);
  }
  // Tents.
  const gy = y + h - 6;
  const tents: Array<[number, number, number]> = [[8, 48, 22], [58, 52, 26]];
  for (const [tx, tw, th] of tents) {
    cv.tri(x + tx, gy, x + tx + tw / 2, gy - th, x + tx + tw, gy, [247, 241, 227]);
    cv.line(x + tx, gy, x + tx + tw / 2, gy - th, INK);
    cv.line(x + tx + tw, gy, x + tx + tw / 2, gy - th, INK);
  }
  // Puddle.
  cv.fill(x + 10, gy - 2, w - 20, 3, [64, 110, 140]);
}

function sceneCourt(cv: Canvas, x: number, y: number, w: number, h: number): void {
  cv.fill(x, y, w, h, [88, 44, 54]); // deep maroon
  // Columns.
  for (const cx of [x + 12, x + w - 20]) {
    cv.fill(cx, y + 10, 7, h - 20, [201, 162, 39]);
    cv.fill(cx - 2, y + 7, 11, 4, [201, 162, 39]);
    cv.fill(cx - 2, y + h - 13, 11, 4, [201, 162, 39]);
  }
  // Scales of justice.
  const mx = x + w / 2;
  const top = y + 10;
  cv.thickLine(mx, top, mx, top + 34, 3, [247, 241, 227]);
  cv.thickLine(mx - 24, top + 5, mx + 24, top + 5, 3, [247, 241, 227]);
  for (const s of [-1, 1] as const) {
    const px = mx + s * 24;
    cv.line(px, top + 5, px - 8, top + 20, [247, 241, 227]);
    cv.line(px, top + 5, px + 8, top + 20, [247, 241, 227]);
    cv.tri(px - 9, top + 20, px + 9, top + 20, px, top + 28, [201, 162, 39]);
  }
  cv.disc(mx, top, 3, [201, 162, 39]);
}

// ---------------------------------------------------------- layout ---------
const M = 28; // outer margin
const CW = W - 2 * M; // content width

function kicker(cv: Canvas, x: number, y: number, label: string, bg: RGB): number {
  const pad = 8;
  const w = textWidth(label, 1) + pad * 2;
  cv.fill(x, y, w, 24, bg);
  drawText(cv, x + pad, y + 1, label, 1, [255, 253, 246]);
  return w;
}

function storyRow(
  cv: Canvas,
  x: number,
  y: number,
  w: number,
  h: number,
  scene: (cv: Canvas, x: number, y: number, w: number, h: number) => void,
  tag: string,
  tagBg: RGB,
  headline: string,
  body: string,
): void {
  cv.fill(x, y, w, h, CELL);
  cv.fill(x, y, w, 1, LINE);
  cv.fill(x, y + h - 1, w, 1, LINE);
  cv.fill(x, y, 1, h, LINE);
  cv.fill(x + w - 1, y, 1, h, LINE);
  const iw = 128;
  scene(cv, x + 8, y + 8, iw, h - 16);
  const tx = x + 8 + iw + 14;
  const tw = w - iw - 8 - 14 - 12;
  kicker(cv, tx, y + 8, tag, tagBg);
  drawText(cv, tx, y + 36, headline, 1, INK);
  drawWrapped(cv, tx, y + 62, body, 1, tw, 19, MUTED);
}

function drawPage(): Canvas {
  const cv = new Canvas();
  cv.fill(0, 0, W, H, PAPER);
  // Double border.
  cv.fill(M - 8, M - 8, CW + 16, 2, INK);
  cv.fill(M - 8, H - M + 6, CW + 16, 2, INK);
  cv.fill(M - 8, M - 8, 2, H - 2 * M + 16, INK);
  cv.fill(W - M + 6, M - 8, 2, H - 2 * M + 16, INK);

  // ---- Masthead ----
  let y = M + 6;
  drawTextCentred(cv, W / 2, y, "THE WORLD IN ONE DAY", 3, NAVY);
  y += 72;
  cv.fill(M + 40, y, CW - 80, 3, RED);
  y += 10;
  drawTextCentred(cv, W / 2, y, "SUNDAY, 22 NOVEMBER 2026", 2, RED);
  y += 48;
  drawTextCentred(
    cv, W / 2, y,
    "Six stories from one day of world news",
    1, MUTED,
  );
  y += 26;
  cv.fill(M, y, CW, 2, INK);
  y += 8;

  // ---- Hero: COP31 ----
  const heroY = y;
  const heroH = 200;
  cv.fill(M, heroY, CW, heroH, CELL);
  cv.fill(M, heroY, CW, 1, LINE);
  cv.fill(M, heroY + heroH - 1, CW, 1, LINE);
  cv.fill(M, heroY, 1, heroH, LINE);
  cv.fill(M + CW - 1, heroY, 1, heroH, LINE);
  const imgW = 348;
  sceneCop(cv, M + 10, heroY + 10, imgW, heroH - 20);
  const tx = M + 10 + imgW + 18;
  const tw = CW - imgW - 10 - 18 - 14;
  let hy = heroY + 14;
  kicker(cv, tx, hy, "CLIMATE  -  ANTALYA, TURKEY", TEAL);
  hy += 34;
  hy = drawWrapped(
    cv, tx, hy,
    "COP31 talks run into a second day of overtime",
    2, tw, 46, INK,
  );
  hy += 8;
  drawWrapped(
    cv, tx, hy,
    "A new draft deal aims to avert collapse as countries split over fossil fuels.",
    1, tw, 22, MUTED,
  );

  // ---- Five more stories as full-width rows, then a sources strip ----
  const gy = heroY + heroH + 10;
  const rowH = 102;
  const rowGap = 6;
  const rows: Array<{
    scene: (cv: Canvas, x: number, y: number, w: number, h: number) => void;
    tag: string;
    tagBg: RGB;
    headline: string;
    body: string;
  }> = [
    {
      scene: sceneMexico,
      tag: "MEXICO  -  SINALOA",
      tagBg: NAVY,
      headline: "Cartel boss 'El Chapo Isidro' captured; 11 killed",
      body: "Mexican forces arrest FBI most-wanted Fausto Isidro Meza Flores in Sinaloa. Eleven people die in the violence around the capture.",
    },
    {
      scene: sceneFbi,
      tag: "UNITED STATES  -  CYBER",
      tagBg: RED,
      headline: "FBI probes suspected hack of its crime database",
      body: "Investigators examine an apparent breach of the National Crime Information Center, the database police across the country use.",
    },
    {
      scene: sceneSea,
      tag: "ENVIRONMENT  -  STRAIT OF HORMUZ",
      tagBg: TEAL,
      headline: "Swimmer crosses war-hit Strait of Hormuz",
      body: "Britain's Lewis Pugh completes a three-day swim through the strait to highlight the sea's environmental cost amid war.",
    },
    {
      scene: sceneGaza,
      tag: "MIDDLE EAST  -  GAZA",
      tagBg: NAVY,
      headline: "Winter storms flood shelters in Gaza",
      body: "Heavy rain inundates tents and shelters as more than a million displaced people face cold, flooding and strikes.",
    },
    {
      scene: sceneCourt,
      tag: "LAW  -  THE HAGUE",
      tagBg: RED,
      headline: "World court rules on Myanmar genocide case",
      body: "The ICJ hands down its ruling in the Rohingya genocide case. 2025 was the deadliest year for sea crossings: nearly 900 dead or missing.",
    },
  ];
  rows.forEach((s, i) => {
    storyRow(
      cv, M, gy + i * (rowH + rowGap), CW, rowH,
      s.scene, s.tag, s.tagBg, s.headline, s.body,
    );
  });

  // Sources strip under the rows.
  const by = gy + 5 * rowH + 4 * rowGap + 8;
  cv.fill(M, by, CW, 50, NAVY);
  drawText(
    cv, M + 14, by + 6,
    "All six stories were first reported on Sunday, 22 November 2026.",
    1, [255, 253, 246],
  );
  drawText(
    cv, M + 14, by + 28,
    "Sources: BBC, Xinhua, Al Jazeera, Inshorts, Nexus Europa, Curious Cats.",
    1, [214, 232, 238],
  );
  return cv;
}

// ------------------------------------------------------------ main ---------
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
const page = drawPage();
const png = encodePng(page.px, W, H);
writeFileSync(join(outDir, "entry.png"), png);
