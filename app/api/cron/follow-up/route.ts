import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const evolutionUrl = process.env.EVOLUTION_API_URL || 'https://evolution-api-production-fbfd.up.railway.app';
const apiKey = process.env.EVOLUTION_API_KEY!;

export async function GET(req: Request) {
  try {
    // 1. Check Authorization for Cron (Vercel Cron sends a Bearer token)
    const authHeader = req.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== \Bearer \\) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Fetch leads (not scheduled)
    const { data: leads, error } = await supabase
      .from('customers')
      .select('*')
      .eq('status', 'lead');

    if (error) throw error;
    if (!leads || leads.length === 0) return NextResponse.json({ status: 'no_leads' });

    const now = new Date();
    let followedUpCount = 0;

    for (const lead of leads) {
      const createdAt = new Date(lead.created_at);
      const diffTime = Math.abs(now.getTime() - createdAt.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Fetch AI Settings for the artist to get the instanceName and customized follow-up texts if any
      const { data: settings } = await supabase
        .from('ai_settings')
        .select('*')
        .eq('clerk_user_id', lead.clerk_user_id)
        .single();

      if (!settings || !settings.is_active) continue;

      let messageToSend = '';

      // Regras de Follow Up:
      // Exatamente 1 dia depois
      if (diffDays === 1) {
        messageToSend = \Oi \! Estou passando para saber se você conseguiu pensar melhor sobre a sua ideia de tatuagem. Qualquer dúvida, estou por aqui!\;
      } 
      // Exatamente 15 dias depois
      else if (diffDays === 15) {
        messageToSend = \Oi \! Faz um tempinho que não nos falamos. Ainda tem interesse em realizar aquele projeto conosco?\;
      }

      if (messageToSend) {
        // Disparar via Evolution API
        try {
          await fetch(\\/message/sendText/\\, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': apiKey
            },
            body: JSON.stringify({
              number: lead.phone_number,
              text: messageToSend
            })
          });

          // Register in chat history
          await supabase.from('chat_history').insert([{
            clerk_user_id: lead.clerk_user_id,
            phone_number: lead.phone_number,
            role: 'assistant',
            content: \[AUTOMATED FOLLOW-UP]: \\
          }]);

          followedUpCount++;
        } catch (err) {
          console.error(\Failed to send follow-up to \\, err);
        }
      }
    }

    return NextResponse.json({ status: 'success', followedUpCount });
  } catch (error: any) {
    console.error('Cron Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
