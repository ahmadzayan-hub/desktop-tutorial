import { describe, expect, it } from 'vitest';
import { liveRateForMaterial, ouncePriceToAedPerGram, type SpotPrices } from '@/lib/metals';
import { mapCategory, mapWorkbookRows } from '@/lib/importCatalog';
import { parseDataUri } from '@/lib/storage';

describe('Live metal rates conversion', () => {
  const spot: SpotPrices = {
    goldUsdPerOunce: 2500,
    silverUsdPerOunce: 30,
    fetchedAt: new Date().toISOString(),
  };

  it('converts USD per troy ounce to AED per gram (pegged rate)', () => {
    // 2500 / 31.1035 * 3.6725 = 295.16 AED/g for pure gold
    expect(ouncePriceToAedPerGram(2500)).toBeCloseTo(295.16, 1);
  });

  it('applies karat and purity multipliers by material name', () => {
    const g24 = liveRateForMaterial('Gold 24K', spot)!;
    const g21 = liveRateForMaterial('Gold 21K', spot)!;
    const g18 = liveRateForMaterial('Gold 18K', spot)!;
    const s925 = liveRateForMaterial('Silver 925', spot)!;
    expect(g21 / g24).toBeCloseTo(21 / 24, 2);
    expect(g18 / g24).toBeCloseTo(18 / 24, 2);
    expect(s925).toBeCloseTo(ouncePriceToAedPerGram(30) * 0.925, 1);
  });

  it('returns null for materials that have no spot market', () => {
    expect(liveRateForMaterial('Gift box (standard)', spot)).toBeNull();
    expect(liveRateForMaterial('316L stainless steel piece', spot)).toBeNull();
  });
});

describe('Excel catalog import mapping', () => {
  it('maps workbook categories to system categories', () => {
    expect(mapCategory('Bracelet')).toBe('BRACELET');
    expect(mapCategory('half set')).toBe('HALF_SET');
    expect(mapCategory('Anklet')).toBe('ANKLET');
    expect(mapCategory('Something else')).toBe('OTHER');
  });

  it('finds the header row and maps rows like the real master workbook', () => {
    const rows = [
      ['Beyond Style UAE Master Catalog'],
      [],
      ['Product Code', 'Product Name EN', 'Product Name AR', 'Category', 'Material / Safe Claim', 'Colours', 'Cost AED', 'Selling Price AED', 'Offer', 'Stock', 'Photo', 'Video', 'Status', 'Notes'],
      ['BSU-MA-BR', "Masha'Allah Bracelet", 'سوار ما شاء الله', 'Bracelet', 'Stainless steel', 'Custom', '25', '79', '2 pcs 129', '', '', '', 'Active', 'Hero product'],
      ['BSU-AN-010', 'Anklet Y-727', 'خلخال', 'Anklet', 'Fashion accessory', '', 7, 39, '', 6, '', '', 'Imported', ''],
      ['', 'row without SKU is skipped', '', 'Ring', '', '', '5', '20', '', '', '', '', '', ''],
      [],
    ];
    const { items, skipped } = mapWorkbookRows(rows);
    expect(items).toHaveLength(2);
    expect(skipped).toBe(1);
    expect(items[0]).toMatchObject({
      sku: 'BSU-MA-BR',
      nameAr: 'سوار ما شاء الله',
      category: 'BRACELET',
      cost: 25,
      price: 79,
      notes: 'Hero product',
    });
    expect(items[1]).toMatchObject({ sku: 'BSU-AN-010', category: 'ANKLET', cost: 7, price: 39 });
  });

  it('reports failure cleanly when there is no Product Code header', () => {
    const { items, skipped } = mapWorkbookRows([['A', 'B'], ['1', '2']]);
    expect(items).toHaveLength(0);
    expect(skipped).toBe(2);
  });
});

describe('Storage data URI parsing', () => {
  it('parses mime, extension, and payload', () => {
    const { mime, ext, buffer } = parseDataUri('data:image/jpeg;base64,' + Buffer.from('hello').toString('base64'));
    expect(mime).toBe('image/jpeg');
    expect(ext).toBe('jpg');
    expect(buffer.toString()).toBe('hello');
  });

  it('rejects non data URIs', () => {
    expect(() => parseDataUri('https://example.com/x.png')).toThrow();
  });
});
