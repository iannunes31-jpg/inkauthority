import { NextResponse } from 'next/server';
import { checkIsAdmin } from '@/lib/auth-server';

export async function POST(request: Request) {
  // Proxies to Cloudflare Stream using our API token — admin-only (course
  // video uploads). Had no auth check at all before, so anyone could use
  // the studio's Cloudflare Stream quota.
  if (!(await checkIsAdmin())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (!accountId || !apiToken) {
    return NextResponse.json(
      { error: "Credenciais do Cloudflare (Account ID ou API Token) não estão configuradas." },
      { status: 500 }
    );
  }

  // Pegamos os headers originais enviados pelo tus-js-client no frontend
  const uploadLength = request.headers.get('upload-length');
  const uploadMetadata = request.headers.get('upload-metadata');

  if (!uploadLength) {
    return NextResponse.json(
      { error: "Header 'Upload-Length' é obrigatório para vídeos grandes." },
      { status: 400 }
    );
  }

  try {
    // Comunicação segura com o Cloudflare, sem expor o token no frontend
    const cfResponse = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream?direct_user=true`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Tus-Resumable': '1.0.0',
          'Upload-Length': uploadLength,
          'Upload-Metadata': uploadMetadata || ''
        },
      }
    );

    const destination = cfResponse.headers.get('location');
    
    if (!destination) {
      const errorText = await cfResponse.text();
      console.error("Cloudflare Stream error:", errorText);
      return NextResponse.json(
        { error: "Falha ao obter a URL de upload seguro do Cloudflare." },
        { status: 500 }
      );
    }

    // O tus-js-client no frontend espera receber um status 201 Created com a URL no header 'Location'
    const headers = new Headers();
    headers.set('Access-Control-Expose-Headers', 'Location');
    headers.set('Access-Control-Allow-Headers', '*');
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Location', destination);

    return new NextResponse(null, {
      status: 201,
      headers: headers
    });
  } catch (error) {
    console.error("Erro interno no upload de vídeo:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor." },
      { status: 500 }
    );
  }
}

// O TUS protocol exige suporte a OPTIONS para requests preflight
export async function OPTIONS(request: Request) {
  const headers = new Headers();
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'tus-resumable, upload-length, upload-metadata, upload-creator');
  headers.set('Access-Control-Expose-Headers', 'Location');
  
  return new NextResponse(null, {
    status: 200,
    headers: headers
  });
}
