import { jsPDF } from 'jspdf';
import type { Player, Team, Tournament } from '../types/sports';
import { TOURNAMENT_CATEGORIES } from '../types/sports';

const CARD_W = 85;
const CARD_H = 55;
const COLS = 2;
const ROWS = 4;
const GAP_X = 6;
const GAP_Y = 6;

export type PlayerCardContext = {
  team?: Team | null;
  tournament?: Tournament | null;
};

async function urlToDataUrl(url?: string | null): Promise<string | null> {
  const src = (url || '').trim();
  if (!src || !/^https?:\/\//i.test(src)) return null;
  try {
    const res = await fetch(src, { mode: 'cors' });
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'J';
  return parts.slice(0, 2).map((p) => p[0]?.toUpperCase() || '').join('');
}

function categoryLabel(tournament?: Tournament | null, fallback?: string): string {
  if (fallback) return fallback;
  const value = tournament?.category;
  return TOURNAMENT_CATEGORIES.find((c) => c.value === value)?.label || 'Libre';
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'plantilla';
}

function drawCropMarks(doc: jsPDF, x: number, y: number) {
  const mark = 3;
  const offset = 0.8;
  doc.setDrawColor(160, 160, 160);
  doc.setLineWidth(0.15);
  const marks: Array<[number, number, number, number]> = [
    [x - offset, y, x - offset - mark, y],
    [x - offset, y, x - offset, y - mark],
    [x + CARD_W + offset, y, x + CARD_W + offset + mark, y],
    [x + CARD_W + offset, y, x + CARD_W + offset, y - mark],
    [x - offset, y + CARD_H, x - offset - mark, y + CARD_H],
    [x - offset, y + CARD_H, x - offset, y + CARD_H + mark],
    [x + CARD_W + offset, y + CARD_H, x + CARD_W + offset + mark, y + CARD_H],
    [x + CARD_W + offset, y + CARD_H, x + CARD_W + offset, y + CARD_H + mark],
  ];
  marks.forEach(([x1, y1, x2, y2]) => doc.line(x1, y1, x2, y2));
}

function drawRoundedRect(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  fill?: [number, number, number],
  stroke?: [number, number, number],
) {
  if (fill) doc.setFillColor(...fill);
  if (stroke) {
    doc.setDrawColor(...stroke);
    doc.setLineWidth(0.25);
  }
  const style = fill && stroke ? 'FD' : fill ? 'F' : 'S';
  doc.roundedRect(x, y, w, h, r, r, style);
}

function drawCard(
  doc: jsPDF,
  x: number,
  y: number,
  player: Player,
  photo: string | null,
  logo: string | null,
  ctx: PlayerCardContext,
) {
  const teamName = ctx.team?.name || player.team_name || 'Equipo';
  const tournamentName = ctx.tournament?.name || player.tournament_name || 'Torneo';
  const category = categoryLabel(ctx.tournament, player.tournament_category);
  const position = player.position_display || player.position || '';
  const jersey = player.jersey_number ?? '';
  const idNumber = (player.id_number || '').trim();
  const fullName = player.full_name || `${player.first_name} ${player.last_name}`.trim();

  drawCropMarks(doc, x, y);
  drawRoundedRect(doc, x, y, CARD_W, CARD_H, 2.2, [255, 255, 255], [16, 185, 129]);

  doc.setFillColor(15, 23, 42);
  doc.roundedRect(x, y, CARD_W, 11, 2.2, 2.2, 'F');
  doc.rect(x, y + 8, CARD_W, 3, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.text('CHÉVER', x + 4, y + 5.2);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.4);
  doc.text('CARNET DE JUGADOR', x + 4, y + 8.8);

  const photoX = x + 3.5;
  const photoY = y + 13.5;
  const photoW = 22;
  const photoH = 26;
  drawRoundedRect(doc, photoX, photoY, photoW, photoH, 1.4, [241, 245, 249], [226, 232, 240]);
  if (photo) {
    try {
      doc.addImage(photo, 'JPEG', photoX + 0.4, photoY + 0.4, photoW - 0.8, photoH - 0.8, undefined, 'FAST');
    } catch {
      try {
        doc.addImage(photo, 'PNG', photoX + 0.4, photoY + 0.4, photoW - 0.8, photoH - 0.8, undefined, 'FAST');
      } catch {
        photo = null;
      }
    }
  }
  if (!photo) {
    doc.setFillColor(16, 185, 129);
    doc.circle(photoX + photoW / 2, photoY + photoH / 2 - 2, 6, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(initials(fullName), photoX + photoW / 2, photoY + photoH / 2, { align: 'center' });
  }

  const infoX = x + 28.5;
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  const nameLines = doc.splitTextToSize(fullName, 53);
  doc.text(nameLines.slice(0, 2), infoX, y + 16.2);

  doc.setFillColor(16, 185, 129);
  doc.roundedRect(infoX, y + 24.2, 16, 7.2, 1.2, 1.2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(`#${jersey}`, infoX + 8, y + 29, { align: 'center' });

  if (position) {
    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.2);
    doc.text(String(position).toUpperCase(), infoX + 18, y + 29);
  }

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.4);
  doc.text(doc.splitTextToSize(teamName, 42).slice(0, 1), infoX + (logo ? 8 : 0), y + 36.4);

  if (logo) {
    try {
      doc.addImage(logo, 'PNG', infoX, y + 32.6, 6.5, 6.5, undefined, 'FAST');
    } catch {
      try {
        doc.addImage(logo, 'JPEG', infoX, y + 32.6, 6.5, 6.5, undefined, 'FAST');
      } catch {
        /* skip broken logo */
      }
    }
  }

  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.6);
  doc.text(`${tournamentName}  ·  ${category}`, infoX, y + 41.6);
  doc.text(idNumber ? `Doc. ${idNumber}` : 'Doc. —', infoX, y + 46);

  doc.setFillColor(16, 185, 129);
  doc.rect(x, y + CARD_H - 6.2, CARD_W, 6.2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5.4);
  doc.text('PLATAFORMA CHÉVER  ·  UNA SOLA CARA', x + CARD_W / 2, y + CARD_H - 2.2, {
    align: 'center',
  });

  try {
    doc.saveGraphicsState();
    const gState = (doc as unknown as { GState: new (opts: { opacity: number }) => unknown }).GState;
    doc.setGState(new gState({ opacity: 0.08 }) as never);
    doc.setTextColor(16, 185, 129);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('CHÉVER', x + CARD_W / 2, y + CARD_H / 2 + 8, {
      align: 'center',
      angle: 28,
    });
    doc.restoreGraphicsState();
  } catch {
    doc.setTextColor(187, 247, 208);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('CHÉVER', x + CARD_W / 2, y + CARD_H / 2 + 10, { align: 'center' });
  }
}

export async function downloadPlayerCardsPdf(
  players: Player[],
  ctx: PlayerCardContext = {},
): Promise<void> {
  if (!players.length) return;

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const gridW = COLS * CARD_W + (COLS - 1) * GAP_X;
  const gridH = ROWS * CARD_H + (ROWS - 1) * GAP_Y;
  const originX = (pageW - gridW) / 2;
  const originY = (pageH - gridH) / 2;

  const uniqueUrls = Array.from(
    new Set(
      players.flatMap((p) => [p.photo, p.team_logo, ctx.team?.logo].filter(Boolean) as string[]),
    ),
  );
  const cache = new Map<string, string | null>();
  await Promise.all(
    uniqueUrls.map(async (url) => {
      cache.set(url, await urlToDataUrl(url));
    }),
  );

  const perPage = COLS * ROWS;
  players.forEach((player, index) => {
    if (index > 0 && index % perPage === 0) {
      doc.addPage('letter', 'portrait');
    }
    const slot = index % perPage;
    const col = slot % COLS;
    const row = Math.floor(slot / COLS);
    const x = originX + col * (CARD_W + GAP_X);
    const y = originY + row * (CARD_H + GAP_Y);
    const photo = cache.get(player.photo || '') || null;
    const logo = cache.get(player.team_logo || ctx.team?.logo || '') || null;
    drawCard(doc, x, y, player, photo, logo, ctx);
  });

  const teamPart = slugify(ctx.team?.name || players[0]?.team_name || 'equipo');
  doc.save(`carnets-${teamPart}.pdf`);
}
