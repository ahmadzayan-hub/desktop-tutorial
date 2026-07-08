/**
 * Photo/attachment storage.
 *
 * With SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY configured, files are
 * uploaded to Supabase Storage (bucket SUPABASE_STORAGE_BUCKET, default
 * "thamin") and only the public URL is stored in the database.
 * Without configuration, files fall back to inline base64 in the database,
 * so the app keeps working in development with zero setup.
 */

export function storageConfigured(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function bucket(): string {
  return process.env.SUPABASE_STORAGE_BUCKET || 'thamin';
}

interface ParsedDataUri {
  mime: string;
  buffer: Buffer;
  ext: string;
}

export function parseDataUri(dataUri: string): ParsedDataUri {
  const m = /^data:([\w/+.-]+);base64,(.+)$/s.exec(dataUri);
  if (!m) throw new Error('Expected a base64 data URI');
  const mime = m[1];
  const ext = mime.split('/')[1]?.replace('jpeg', 'jpg').replace('svg+xml', 'svg') || 'bin';
  return { mime, buffer: Buffer.from(m[2], 'base64'), ext };
}

/**
 * Store a base64 data URI. Returns what should be persisted in the DB:
 * a public URL when Supabase Storage is configured, else the data URI as-is.
 */
export async function storePhoto(dataUri: string, keyPrefix = 'products'): Promise<string> {
  if (!dataUri.startsWith('data:')) return dataUri; // already a URL
  if (!storageConfigured()) return dataUri; // inline fallback

  const { mime, buffer, ext } = parseDataUri(dataUri);
  const base = process.env.SUPABASE_URL!.replace(/\/$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const path = `${keyPrefix}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const res = await fetch(`${base}/storage/v1/object/${bucket()}/${path}`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${key}`,
      'content-type': mime,
      'x-upsert': 'false',
    },
    body: new Uint8Array(buffer),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Supabase Storage upload failed (${res.status}): ${text.slice(0, 200)}`);
  }
  return `${base}/storage/v1/object/public/${bucket()}/${path}`;
}
