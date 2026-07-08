import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { AuthError, audit, requireRole } from '@/lib/auth';
import { notifyApprovers } from '@/lib/push';
import { storePhoto } from '@/lib/storage';

const nonneg = z.number().min(0);

const ProductSchema = z.object({
  id: z.string().optional(),
  sku: z.string().min(1),
  name: z.string().min(1),
  nameAr: z.string().nullish(),
  category: z.string().min(1),
  material: z.string().nullish(),
  purity: z.string().nullish(),
  weightGrams: nonneg.nullish(),
  supplierId: z.string().nullish(),
  supplierQuote: nonneg.nullish(),
  supplierCurrency: z.string().default('AED'),
  exchangeRate: z.number().positive().default(1),
  makingCharge: nonneg.default(0),
  platingCost: nonneg.default(0),
  chainCost: nonneg.default(0),
  claspCost: nonneg.default(0),
  pendantCost: nonneg.default(0),
  stoneCost: nonneg.default(0),
  engravingCost: nonneg.default(0),
  customizationCost: nonneg.default(0),
  packagingCost: nonneg.default(0),
  giftBoxCost: nonneg.default(0),
  deliveryCost: nonneg.default(0),
  paymentMethod: z.string().default('CARD'),
  paymentFeePct: z.number().min(0).max(30).default(2.5),
  marketingCost: nonneg.default(0),
  operationsCost: nonneg.default(0),
  otherCosts: nonneg.default(0),
  vatMode: z.enum(['EXCLUSIVE', 'INCLUSIVE', 'NONE']).default('EXCLUSIVE'),
  targetMarginPct: z.number().min(0).max(500).default(40),
  finalPrice: nonneg.nullish(),
  notes: z.string().nullish(),
  photoData: z.string().nullish(),
});

export async function GET(req: NextRequest) {
  try {
    requireRole('VIEWER');
    const status = req.nextUrl.searchParams.get('status') ?? undefined;
    const products = await prisma.product.findMany({
      where: status ? { approvalStatus: status } : undefined,
      orderBy: { updatedAt: 'desc' },
      include: { supplier: { select: { name: true } } },
    });
    return NextResponse.json({ products });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = requireRole('SALES');
    const raw = await req.json();

    // approval action: { action: "APPROVE"|"REJECT"|"SUBMIT", id, approvedPrice?, reason? }
    if (raw.action) {
      const product = await prisma.product.findUnique({ where: { id: String(raw.id) } });
      if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      if (raw.action === 'SUBMIT') {
        const updated = await prisma.product.update({
          where: { id: product.id },
          data: { approvalStatus: 'PENDING' },
        });
        await audit(session.userId, 'Product', product.id, 'SUBMIT_FOR_APPROVAL');
        notifyApprovers(); // fire-and-forget push to managers/admins
        return NextResponse.json({ product: updated });
      }
      requireRole('MANAGER'); // approve/reject requires manager+
      const updated = await prisma.product.update({
        where: { id: product.id },
        data: {
          approvalStatus: raw.action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
          approvedPrice: raw.action === 'APPROVE' ? Number(raw.approvedPrice ?? product.finalPrice ?? 0) : product.approvedPrice,
          approvedById: session.userId,
        },
      });
      await audit(session.userId, 'Product', product.id, raw.action, {
        before: { status: product.approvalStatus, approvedPrice: product.approvedPrice },
        after: { status: updated.approvalStatus, approvedPrice: updated.approvedPrice },
        reason: raw.reason,
      });
      return NextResponse.json({ product: updated });
    }

    const body = ProductSchema.parse(raw);
    const { id, ...data } = body;
    if (data.photoData?.startsWith('data:')) {
      data.photoData = await storePhoto(data.photoData); // Supabase Storage when configured
    }
    const saved = id
      ? await prisma.product.update({ where: { id }, data })
      : await prisma.product.create({ data: { ...data, createdById: session.userId } });
    await audit(session.userId, 'Product', saved.id, id ? 'UPDATE' : 'CREATE');
    return NextResponse.json({ product: saved });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    if (e instanceof z.ZodError) return NextResponse.json({ error: e.errors.map((x) => `${x.path.join('.')}: ${x.message}`).join('; ') }, { status: 400 });
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Save failed' }, { status: 500 });
  }
}
