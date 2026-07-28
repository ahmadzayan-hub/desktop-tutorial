import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { prisma } from '@/lib/db';
import { AuthError, audit, requireRole } from '@/lib/auth';
import { mapWorkbookRows } from '@/lib/importCatalog';
import { notifyApprovers } from '@/lib/push';

export const maxDuration = 60;

// Import/update the product catalog from an Excel or CSV file.
// Looks for the "Product Catalog" sheet (falls back to the first sheet)
// with the master-database column headers. Upserts by SKU.
export async function POST(req: NextRequest) {
  try {
    const session = requireRole('MANAGER');
    const { file, filename } = await req.json();
    if (!file || typeof file !== 'string') {
      return NextResponse.json({ error: 'Send { file: "<base64 or data URI>", filename }' }, { status: 400 });
    }
    const base64 = file.startsWith('data:') ? file.slice(file.indexOf(',') + 1) : file;
    const buffer = Buffer.from(base64, 'base64');
    if (buffer.length > 15_000_000) {
      return NextResponse.json({ error: 'File too large (max 15MB)' }, { status: 413 });
    }

    const wb = XLSX.read(buffer, { type: 'buffer' });
    const sheetName =
      wb.SheetNames.find((n) => n.trim().toLowerCase() === 'product catalog') ?? wb.SheetNames[0];
    if (!sheetName) return NextResponse.json({ error: 'The workbook has no sheets' }, { status: 400 });
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], {
      header: 1,
      raw: true,
      defval: '',
    }) as unknown[][];

    const { items, skipped } = mapWorkbookRows(rows);
    if (!items.length) {
      return NextResponse.json(
        { error: `No products found in sheet "${sheetName}". Expected a "Product Code" header column.` },
        { status: 400 }
      );
    }

    let created = 0;
    let updated = 0;
    for (const item of items) {
      const existing = await prisma.product.findUnique({ where: { sku: item.sku } });
      const data = {
        name: item.name,
        nameAr: item.nameAr,
        category: item.category,
        supplierQuote: item.cost,
        finalPrice: item.price,
        notes: item.notes,
      };
      if (existing) {
        await prisma.product.update({
          where: { sku: item.sku },
          data: {
            ...data,
            // an updated cost or price puts the sheet back through review
            approvalStatus:
              (item.cost !== undefined && item.cost !== existing.supplierQuote) ||
              (item.price !== undefined && item.price !== existing.finalPrice)
                ? 'PENDING'
                : existing.approvalStatus,
          },
        });
        updated += 1;
      } else {
        await prisma.product.create({
          data: {
            sku: item.sku,
            ...data,
            material: 'STAINLESS_STEEL',
            packagingCost: 10,
            paymentMethod: 'COD',
            vatMode: 'EXCLUSIVE',
            targetMarginPct: 40,
            approvalStatus: 'PENDING',
            createdById: session.userId,
          },
        });
        created += 1;
      }
    }

    await audit(session.userId, 'Product', null, 'IMPORT_CATALOG', {
      after: { filename, sheet: sheetName, created, updated, skipped },
    });
    if (created + updated > 0) await notifyApprovers(); // awaited: serverless-safe
    return NextResponse.json({ sheet: sheetName, created, updated, skipped, total: items.length });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Import failed' }, { status: 500 });
  }
}
