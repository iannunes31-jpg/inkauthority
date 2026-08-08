import { NextResponse } from 'next/server';
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (!accountId || !apiToken) {
    return NextResponse.json(
      { error: "Credenciais do Cloudflare ausentes." },
      { status: 500 }
    );
  }

  try {
    const { title, description } = await request.json();

    // 1. Criar Live Input no Cloudflare
    const cfResponse = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/live_inputs`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          meta: { name: title || "Live Stream" },
          recording: {
            mode: "automatic",
            requireSignedURLs: false,
            allowedOrigins: []
          }
        })
      }
    );

    const data = await cfResponse.json();

    if (!data.success) {
      console.error("Erro Cloudflare:", data.errors);
      return NextResponse.json({ error: "Falha ao criar sala de transmissão no Cloudflare." }, { status: 500 });
    }

    const { uid, rtmps } = data.result;

    // 2. Salvar no Supabase
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: dbData, error: dbError } = await supabase
      .from('live_streams')
      .insert([
        {
          title: title,
          description: description,
          cloudflare_input_id: uid,
          stream_key: rtmps.streamKey,
          rtmps_url: rtmps.url,
          status: 'scheduled'
        }
      ])
      .select()
      .single();

    if (dbError) {
      console.error("Erro Supabase:", dbError);
      return NextResponse.json({ error: "Erro Supabase: " + (dbError.message || JSON.stringify(dbError)) }, { status: 500 });
    }

    // Retorna os dados para o frontend (apenas para exibição no painel admin)
    return NextResponse.json({
      success: true,
      live: dbData
    }, { status: 201 });

  } catch (error) {
    console.error("Erro interno ao criar live:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor." },
      { status: 500 }
    );
  }
}
