import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { AuthError, requireRole } from '@/lib/auth';
import { storageConfigured, storePhoto } from '@/lib/storage';

export const maxDuration = 30;

// Upload an attachment (photo, invoice, certificate, screenshot).
// Stored in Supabase Storage when configured, else inline in the database.
export async function POST(req: NextRequest) {
  try {
    requireRole('SALES');
    const { data, filename, kind, productId } = await req.json();
    if (!data || typeof data !== 'string' || !data.startsWith('data:')) {
      return NextResponse.json({ error: 'Send { data: "data:<mime>;base64,...", filename, kind?, productId? }' }, { status: 400 });
    }
    if (data.length > 8_000_000) {
      return NextResponse.json({ error: 'File too large (max ~6MB)' }, { status: 413 });
    }
    const mime = data.slice(5, data.indexOf(';'));
    const stored = await storePhoto(data, kind === 'photo' ? 'products' : 'documents');
    const attachment = await prisma.attachment.create({
      data: {
        kind: String(kind ?? 'photo'),
        filename: String(filename ?? 'upload'),
        mime,
        data: stored, // public URL or inline data URI
        productId: productId ? String(productId) : undefined,
      },
    });
    return NextResponse.json({
      attachment: { id: attachment.id, url: stored.startsWith('data:') ? null : stored },
      storage: storageConfigured() ? 'supabase' : 'database',
    });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Upload failed' }, { status: 500 });
  }
}
