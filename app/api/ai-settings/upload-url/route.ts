import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

const BUCKET = 'assets';
const ALLOWED_EXT = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'heic', 'heif'];

// Issues signed upload URLs so the browser can put reference images straight
// into Storage without needing an anon-key storage policy.
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { files } = (await req.json()) as { files?: { ext?: string }[] };
  if (!Array.isArray(files) || files.length === 0 || files.length > 10) {
    return NextResponse.json({ error: 'Envie de 1 a 10 arquivos.' }, { status: 400 });
  }

  const uploads = [];
  for (const f of files) {
    const ext = String(f?.ext || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!ALLOWED_EXT.includes(ext)) {
      return NextResponse.json({ error: `Formato não suportado: .${ext}` }, { status: 400 });
    }
    const path = `style-references/${userId}-${crypto.randomUUID()}.${ext}`;
    const { data, error } = await supabaseAdmin.storage.from(BUCKET).createSignedUploadUrl(path);
    if (error || !data) {
      console.error('[upload-url] createSignedUploadUrl error:', error);
      return NextResponse.json({ error: error?.message || 'Falha ao preparar upload.' }, { status: 500 });
    }
    const { data: pub } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);
    uploads.push({ path, token: data.token, publicUrl: pub.publicUrl });
  }

  return NextResponse.json({ uploads });
}
