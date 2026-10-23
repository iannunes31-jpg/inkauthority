import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { checkIsAdmin } from '@/lib/auth-server';

const BUCKET = 'assets';
// Course covers are admin-only; everything else is an artist's style reference.
const ADMIN_FOLDERS = ['course-covers', 'course-materials'];
const ALLOWED_EXT = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'heic', 'heif'];

async function signedUpload(path: string) {
  let result = await supabaseAdmin.storage.from(BUCKET).createSignedUploadUrl(path);
  // The bucket was never created in this Supabase project; create it once.
  if (result.error && /does not exist|not found/i.test(result.error.message)) {
    const { error: createError } = await supabaseAdmin.storage.createBucket(BUCKET, { public: true });
    if (createError && !/already exists/i.test(createError.message)) {
      console.error('[upload-url] createBucket error:', createError);
      return result;
    }
    console.log('[upload-url] created bucket', BUCKET);
    result = await supabaseAdmin.storage.from(BUCKET).createSignedUploadUrl(path);
  }
  return result;
}

// Issues signed upload URLs so the browser can put reference images straight
// into Storage without needing an anon-key storage policy.
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { files, folder: rawFolder } = (await req.json()) as { files?: { ext?: string }[]; folder?: string };
  const folder = ADMIN_FOLDERS.includes(rawFolder ?? '') ? rawFolder! : 'style-references';
  if (folder !== 'style-references' && !(await checkIsAdmin())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  if (!Array.isArray(files) || files.length === 0 || files.length > 10) {
    return NextResponse.json({ error: 'Envie de 1 a 10 arquivos.' }, { status: 400 });
  }

  const uploads = [];
  for (const f of files) {
    const ext = String(f?.ext || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
    // Lesson materials are PDFs; everything else is an image.
    if (!(folder === 'course-materials' ? ['pdf'] : ALLOWED_EXT).includes(ext)) {
      return NextResponse.json({ error: `Formato não suportado: .${ext}` }, { status: 400 });
    }
    const path = `${folder}/${userId}-${crypto.randomUUID()}.${ext}`;
    const { data, error } = await signedUpload(path);
    if (error || !data) {
      console.error('[upload-url] createSignedUploadUrl error:', error);
      return NextResponse.json({ error: error?.message || 'Falha ao preparar upload.' }, { status: 500 });
    }
    const { data: pub } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);
    uploads.push({ path, token: data.token, publicUrl: pub.publicUrl });
  }

  return NextResponse.json({ uploads });
}
