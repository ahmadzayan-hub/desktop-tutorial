import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { AuthError, requireRole } from '@/lib/auth';
import { computePrice } from '@/lib/pricing/engine';
import { loadRules } from '@/lib/rules';
import type { PricingInput } from '@/lib/pricing/types';

const nonneg = z.number().min(0, 'must not be negative');

const BodySchema = z.object({
  mode: z.enum(['QUICK', 'ADVANCED', 'AI_PHOTO']).default('QUICK'),
  channelKey: z.string().optional(),
  productId: z.string().optional(),
  save: z.boolean().default(true),
  overrideReason: z.string().optional(),
  input: z.object({
    quantity: z.number().int().min(1).optional(),
    materialCategory: z.string().optional(),
    materialRatePerGram: nonneg.optional(),
    weightGrams: nonneg.optional(),
    materialRateUpdatedAt: z.string().optional(),
    materialRateSource: z.string().optional(),
    supplierCost: nonneg.optional(),
    supplierCurrency: z.string().optional(),
    exchangeRate: z.number().positive().optional(),
    makingCharge: nonneg.optional(),
    platingCost: nonneg.optional(),
    chainCost: nonneg.optional(),
    claspCost: nonneg.optional(),
    pendantCost: nonneg.optional(),
    stoneCost: nonneg.optional(),
    engravingCost: nonneg.optional(),
    customizationCost: nonneg.optional(),
    packagingCost: nonneg.optional(),
    giftBoxCost: nonneg.optional(),
    deliveryCost: nonneg.optional(),
    remoteArea: z.boolean().optional(),
    paymentMethod: z.enum(['CARD', 'COD', 'ZIINA', 'LINK', 'CASH']).optional(),
    paymentFeePct: z.number().min(0).max(30).optional(),
    marketingCost: nonneg.optional(),
    operationsCost: nonneg.optional(),
    otherCosts: nonneg.optional(),
    vatMode: z.enum(['EXCLUSIVE', 'INCLUSIVE', 'NONE']),
    targetMarginPct: z.number().min(0).max(500).optional(),
    sellingPriceOverride: nonneg.optional(),
    discountPct: z.number().min(0).max(100).optional(),
    adminOverride: z.boolean().optional(),
  }),
});

export async function POST(req: NextRequest) {
  try {
    const session = requireRole('SALES');
    const body = BodySchema.parse(await req.json());
    const rules = await loadRules();

    // Only admins may use adminOverride (sell below cost / below min margin).
    const input: PricingInput = { ...body.input };
    if (input.adminOverride && session.role !== 'ADMIN') {
      input.adminOverride = false;
    }

    // channel costs
    if (body.channelKey) {
      const ch = await prisma.channel.findUnique({ where: { key: body.channelKey } });
      if (ch) {
        input.channel = {
          key: ch.key,
          commissionPct: ch.commissionPct,
          adsCostPerOrder: ch.adsCostPerOrder,
          paymentFeePct: ch.paymentFeePct,
          deliveryCost: ch.deliveryCost,
          targetMarginPct: ch.targetMarginPct,
        };
      }
    }

    const result = computePrice(input, rules);

    let calculationId: string | undefined;
    if (body.save) {
      const rates = await prisma.material.findMany({
        select: { name: true, ratePerUnit: true, unit: true, updatedAt: true },
      });
      const calc = await prisma.priceCalculation.create({
        data: {
          mode: body.mode,
          channelKey: body.channelKey,
          productId: body.productId,
          inputsJson: JSON.stringify(input),
          resultJson: JSON.stringify(result),
          totalCost: result.totalCost,
          recommendedPrice: result.recommendedSellingPrice,
          finalPrice: result.effectivePrice,
          marginPct: result.grossMarginPct,
          warningsJson: JSON.stringify(result.warnings),
          rateSnapshotJson: JSON.stringify(rates),
          overrideByAdmin: Boolean(input.adminOverride),
          overrideReason: body.overrideReason,
          createdById: session.userId,
        },
      });
      calculationId = calc.id;

      // raise alerts for critical conditions
      const critical = result.warnings.filter((w) => w.severity === 'critical');
      if (critical.length) {
        await prisma.alert.createMany({
          data: critical.map((w) => ({
            type: w.code,
            severity: 'critical',
            message: w.message,
            messageAr: w.messageAr,
            entity: 'PriceCalculation',
            entityId: calc.id,
          })),
        });
      }
      if (input.adminOverride) {
        await prisma.alert.create({
          data: {
            type: 'ADMIN_OVERRIDE',
            severity: 'warning',
            message: `Admin override used by ${session.email}${body.overrideReason ? `: ${body.overrideReason}` : ''}`,
            entity: 'PriceCalculation',
            entityId: calc.id,
          },
        });
      }
    }

    return NextResponse.json({ result, calculationId });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    if (e instanceof z.ZodError) return NextResponse.json({ error: e.errors.map((x) => `${x.path.join('.')}: ${x.message}`).join('; ') }, { status: 400 });
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Server error' }, { status: 500 });
  }
}
