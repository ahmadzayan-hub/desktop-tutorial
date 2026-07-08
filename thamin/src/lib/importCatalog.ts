/**
 * Catalog import from the Beyond Style UAE master workbook (or any sheet
 * with the same column headers). Pure mapping logic, unit-tested; the API
 * route handles file parsing and database writes.
 */

export interface CatalogItem {
  sku: string;
  name: string;
  nameAr?: string;
  category: string;
  cost?: number;
  price?: number;
  status?: string;
  notes?: string;
}

export interface MappingResult {
  items: CatalogItem[];
  skipped: number; // rows without a usable SKU or name
}

const CATEGORY_MAP: Record<string, string> = {
  bracelet: 'BRACELET',
  necklace: 'NECKLACE',
  ring: 'RING',
  earrings: 'EARRINGS',
  earring: 'EARRINGS',
  pendant: 'PENDANT',
  chain: 'CHAIN',
  anklet: 'ANKLET',
  bangle: 'BANGLE',
  'half set': 'HALF_SET',
  set: 'SET',
};

export function mapCategory(raw: unknown): string {
  const key = String(raw ?? '').trim().toLowerCase();
  return CATEGORY_MAP[key] ?? 'OTHER';
}

function toNumber(v: unknown): number | undefined {
  if (v === null || v === undefined || v === '') return undefined;
  const n = Number(String(v).replace(/[^\d.]/g, ''));
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

/**
 * Map raw worksheet rows (arrays of cells) into catalog items.
 * Locates the header row by the "Product Code" column, so title rows and
 * blank rows above it are tolerated.
 */
export function mapWorkbookRows(rows: unknown[][]): MappingResult {
  const headerIdx = rows.findIndex((r) =>
    r.some((c) => String(c ?? '').trim().toLowerCase() === 'product code')
  );
  if (headerIdx === -1) return { items: [], skipped: rows.length };

  const headers = rows[headerIdx].map((h) => String(h ?? '').trim().toLowerCase());
  const col = (name: string) => headers.indexOf(name);
  const iSku = col('product code');
  const iNameEn = col('product name en');
  const iNameAr = col('product name ar');
  const iCategory = col('category');
  const iCost = col('cost aed');
  const iPrice = col('selling price aed');
  const iStatus = col('status');
  const iNotes = col('notes');

  const items: CatalogItem[] = [];
  let skipped = 0;
  for (const row of rows.slice(headerIdx + 1)) {
    const sku = String(row[iSku] ?? '').trim();
    const name = String(row[iNameEn] ?? '').trim();
    if (!sku || !name) {
      if (row.some((c) => String(c ?? '').trim() !== '')) skipped += 1;
      continue;
    }
    items.push({
      sku,
      name,
      nameAr: iNameAr >= 0 ? String(row[iNameAr] ?? '').trim() || undefined : undefined,
      category: mapCategory(iCategory >= 0 ? row[iCategory] : undefined),
      cost: iCost >= 0 ? toNumber(row[iCost]) : undefined,
      price: iPrice >= 0 ? toNumber(row[iPrice]) : undefined,
      status: iStatus >= 0 ? String(row[iStatus] ?? '').trim() || undefined : undefined,
      notes: iNotes >= 0 ? String(row[iNotes] ?? '').trim() || undefined : undefined,
    });
  }
  return { items, skipped };
}
