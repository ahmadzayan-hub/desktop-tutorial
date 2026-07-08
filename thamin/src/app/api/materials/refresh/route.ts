import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { AuthError, audit, requireRole } from '@/lib/auth';
import { fetchSpotPrices, liveRateForMaterial, metalsApiConfigured } from '@/lib/metals';

export const maxDuration = 30;

// Pull live gold/silver spot rates and update the material library.
// Rows a manager set manually (manualOverride = true) are left untouched.
export async function POST() {
  try {
    const session = requireRole('MANAGER');
    if (!metalsApiConfigured()) {
      return NextResponse.json(
        {
          error: 'NOT_CONFIGURED',
          message:
            'Live rates are not configured. Set METAL_PRICE_API_KEY (metalpriceapi.com or metals-api.com) in the environment. Manual rates keep working.',
        },
        { status: 503 }
      );
    }
    const spot = await fetchSpotPrices();
    const materials = await prisma.material.findMany({
      where: { category: { in: ['GOLD', 'SILVER'] } },
    });
    const updated: { name: string; oldRate: number; newRate: number }[] = [];
    const skipped: string[] = [];
    for (const m of materials) {
      const live = liveRateForMaterial(m.name, spot);
      if (live === null) continue;
      if (m.manualOverride) {
        skipped.push(m.name);
        continue;
      }
      await prisma.material.update({
        where: { id: m.id },
        data: { ratePerUnit: live, source: 'api' },
      });
      updated.push({ name: m.name, oldRate: m.ratePerUnit, newRate: live });
    }
    await audit(session.userId, 'Material', null, 'REFRESH_LIVE_RATES', {
      after: { spot, updated: updated.length, skippedManual: skipped.length },
    });
    return NextResponse.json({ spot, updated, skippedManual: skipped });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Refresh failed' },
      { status: 502 }
    );
  }
}
