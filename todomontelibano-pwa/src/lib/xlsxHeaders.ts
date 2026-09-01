import {
  IMPORT_MODULE_HEADERS,
  type AdminImportModule,
} from './adminImportApi';

const ZIP_EOCD = 0x06054b50;
const ZIP_CEN = 0x02014b50;
const ZIP_LOC = 0x04034b50;
const SS_NS = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main';

export type ImportModuleSpec = {
  key: AdminImportModule;
  headers: readonly string[];
};

const u16 = (buf: Uint8Array, offset: number) => buf[offset]! | (buf[offset + 1]! << 8);

const u32 = (buf: Uint8Array, offset: number) =>
  (buf[offset]! |
    (buf[offset + 1]! << 8) |
    (buf[offset + 2]! << 16) |
    (buf[offset + 3]! << 24)) >>>
  0;

const decodeUtf8 = (bytes: Uint8Array) => new TextDecoder('utf-8').decode(bytes);

function findEocd(buf: Uint8Array): number {
  const min = Math.max(0, buf.length - 22 - 65535);
  for (let i = buf.length - 22; i >= min; i -= 1) {
    if (u32(buf, i) === ZIP_EOCD) return i;
  }
  throw new Error('El archivo no es un Excel .xlsx válido');
}

async function inflateRaw(data: Uint8Array): Promise<Uint8Array> {
  if (data.byteLength === 0) return data;
  const ds = new DecompressionStream('deflate-raw');
  const stream = new Blob([data]).stream().pipeThrough(ds);
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

type ZipEntry = {
  method: number;
  compressedSize: number;
  localOffset: number;
};

function listZipEntries(buf: Uint8Array): Map<string, ZipEntry> {
  const eocd = findEocd(buf);
  const count = u16(buf, eocd + 10);
  let offset = u32(buf, eocd + 16);
  const files = new Map<string, ZipEntry>();

  for (let i = 0; i < count; i += 1) {
    if (u32(buf, offset) !== ZIP_CEN) {
      throw new Error('No se pudo leer el Excel (.xlsx)');
    }
    const method = u16(buf, offset + 10);
    const compressedSize = u32(buf, offset + 20);
    const nameLen = u16(buf, offset + 28);
    const extraLen = u16(buf, offset + 30);
    const commentLen = u16(buf, offset + 32);
    const localOffset = u32(buf, offset + 42);
    const name = decodeUtf8(buf.subarray(offset + 46, offset + 46 + nameLen)).replace(/\\/g, '/');
    files.set(name, { method, compressedSize, localOffset });
    offset += 46 + nameLen + extraLen + commentLen;
  }
  return files;
}

async function extractZipFile(buf: Uint8Array, entry: ZipEntry): Promise<Uint8Array> {
  if (u32(buf, entry.localOffset) !== ZIP_LOC) {
    throw new Error('No se pudo leer el Excel (.xlsx)');
  }
  const nameLen = u16(buf, entry.localOffset + 26);
  const extraLen = u16(buf, entry.localOffset + 28);
  const start = entry.localOffset + 30 + nameLen + extraLen;
  const data = buf.subarray(start, start + entry.compressedSize);
  if (entry.method === 0) return data;
  if (entry.method === 8) return inflateRaw(data);
  throw new Error('Excel comprimido con un método no soportado');
}

function xmlElements(root: ParentNode, local: string): Element[] {
  if (!(root instanceof Document || root instanceof Element)) return [];
  const namespaced = [...root.getElementsByTagNameNS(SS_NS, local)];
  if (namespaced.length > 0) return namespaced;
  return [...root.getElementsByTagName(local)];
}

function parseXml(xml: string): Document {
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  if (doc.querySelector('parsererror')) {
    throw new Error('El Excel tiene un formato XML inválido');
  }
  return doc;
}

function parseSharedStrings(xml: string): string[] {
  const sis = xmlElements(parseXml(xml), 'si');
  return sis.map((si) => xmlElements(si, 't').map((t) => t.textContent ?? '').join(''));
}

function columnIndexFromRef(ref: string): number {
  const match = /^([A-Za-z]+)/.exec(ref);
  if (!match) return 0;
  let n = 0;
  for (const ch of match[1]!.toUpperCase()) {
    n = n * 26 + (ch.charCodeAt(0) - 64);
  }
  return Math.max(0, n - 1);
}

function parseFirstRow(sheetXml: string, sharedStrings: string[]): string[] {
  const rows = xmlElements(parseXml(sheetXml), 'row');
  const first = rows[0];
  if (!first) return [];

  const values: string[] = [];
  for (const cell of xmlElements(first, 'c')) {
    const ref = cell.getAttribute('r') ?? '';
    const type = cell.getAttribute('t');
    let raw = '';
    if (type === 's') {
      const idx = Number.parseInt(xmlElements(cell, 'v')[0]?.textContent ?? '', 10);
      raw = Number.isFinite(idx) ? (sharedStrings[idx] ?? '') : '';
    } else if (type === 'inlineStr') {
      raw = xmlElements(cell, 't').map((t) => t.textContent ?? '').join('');
    } else {
      raw = xmlElements(cell, 'v')[0]?.textContent ?? xmlElements(cell, 't')[0]?.textContent ?? '';
    }
    const col = columnIndexFromRef(ref);
    values[col] = raw.trim();
  }
  return values.map((h) => h ?? '').filter((h) => h.length > 0);
}

function firstWorksheetPath(entries: Map<string, ZipEntry>): string | null {
  const preferred = 'xl/worksheets/sheet1.xml';
  if (entries.has(preferred)) return preferred;
  const sheets = [...entries.keys()]
    .filter((name) => name.startsWith('xl/worksheets/') && name.endsWith('.xml'))
    .sort();
  return sheets[0] ?? null;
}

/** Lee la primera fila (encabezados) de un .xlsx en el navegador, sin llamar a la API. */
export async function readXlsxHeaders(file: File): Promise<string[]> {
  const buf = new Uint8Array(await file.arrayBuffer());
  const entries = listZipEntries(buf);
  const sheetPath = firstWorksheetPath(entries);
  if (!sheetPath) throw new Error('El Excel no contiene una hoja de cálculo');

  const sheetEntry = entries.get(sheetPath);
  if (!sheetEntry) throw new Error('No se encontró la hoja de cálculo');

  const sharedEntry = entries.get('xl/sharedStrings.xml');
  const sharedStrings = sharedEntry
    ? parseSharedStrings(decodeUtf8(await extractZipFile(buf, sharedEntry)))
    : [];
  const sheetXml = decodeUtf8(await extractZipFile(buf, sheetEntry));
  return parseFirstRow(sheetXml, sharedStrings);
}

export function missingExcelHeaders(
  expected: readonly string[],
  received: readonly string[],
): string[] {
  const present = new Set(received.map((h) => h.trim()).filter(Boolean));
  return expected.filter((h) => !present.has(h));
}

export function guessImportModule(
  received: readonly string[],
  modules: readonly ImportModuleSpec[],
): AdminImportModule | null {
  let best: { key: AdminImportModule; missing: number; matched: number } | null = null;
  for (const spec of modules) {
    const missing = missingExcelHeaders(spec.headers, received).length;
    const matched = spec.headers.length - missing;
    if (matched === 0) continue;
    if (
      !best ||
      missing < best.missing ||
      (missing === best.missing && matched > best.matched)
    ) {
      best = { key: spec.key, missing, matched };
    }
  }
  if (!best || best.missing > 0) return null;
  return best.key;
}

export function fallbackImportModules(): ImportModuleSpec[] {
  return (Object.keys(IMPORT_MODULE_HEADERS) as AdminImportModule[]).map((key) => ({
    key,
    headers: IMPORT_MODULE_HEADERS[key],
  }));
}
