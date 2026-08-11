import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Função auxiliar para enviar mensagem via Evolution API
async function sendWhatsAppMessage(phone: string, text: string) {
  const evolutionUrl = process.env.EVOLUTION_API_URL;
  const evolutionKey = process.env.EVOLUTION_API_KEY;

  if (!evolutionUrl || !evolutionKey) {
    console.error("Evolution API credenciais ausentes.");
    return;
  }

  // Remove caracteres não numéricos do telefone e adiciona código do país se faltar
  let cleanPhone = phone.replace(/\D/g, '');
  if (!cleanPhone.startsWith('55')) {
    cleanPhone = `55${cleanPhone}`;
  }

  try {
    const url = `${evolutionUrl}/message/sendText/wpp_bot_default`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': evolutionKey
      },
      body: JSON.stringify({
        number: cleanPhone,
        options: { delay: 1200, presence: 'composing' },
        textMessage: { text: text }
      })
    });

    if (!response.ok) {
      console.error(`Falha ao enviar WPP para ${cleanPhone}: ${response.statusText}`);
    }
  } catch (error) {
    console.error(`Erro ao disparar WPP para ${cleanPhone}:`, error);
  }
}

export async function GET(req: Request) {
  // Verifica secret do Vercel Cron
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    // Busca todos os clientes
    const { data: customers, error } = await supabase
      .from('customers')
      .select('*');

    if (error) throw error;
    if (!customers || customers.length === 0) {
      return NextResponse.json({ message: 'Nenhum cliente para verificar' });
    }

    const now = new Date();
    let sentCount = 0;

    for (const customer of customers) {
      if (!customer.phone) continue;

      const createdAt = new Date(customer.created_at);
      const diffMs = now.getTime() - createdAt.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      // Follow-up Dia 1 (Welcome / Dúvidas)
      if (diffDays === 1 && !customer.followup_day1_sent) {
        await sendWhatsAppMessage(
          customer.phone,
          `Opa ${customer.name || 'tudo bem'}! Aqui é do estúdio. Passando só pra agradecer o seu contato ontem. Conseguimos esclarecer todas as suas dúvidas sobre a sua tattoo? Qualquer coisa estou por aqui!`
        );
        
        await supabase
          .from('customers')
          .update({ followup_day1_sent: true })
          .eq('id', customer.id);
          
        sentCount++;
      }
      
      // Follow-up Dia 15 (Re-engajamento / Desconto)
      else if (diffDays === 15 && !customer.followup_day15_sent) {
        await sendWhatsAppMessage(
          customer.phone,
          `Fala ${customer.name || 'beleza'}! Faz uns dias que nos falamos sobre a sua tattoo. Abriu um horário na minha agenda para a semana que vem, quer aproveitar pra gente já deixar o seu projeto no jeito?`
        );
        
        await supabase
          .from('customers')
          .update({ followup_day15_sent: true })
          .eq('id', customer.id);
          
        sentCount++;
      }
    }

    return NextResponse.json({ success: true, messagesSent: sentCount });

  } catch (err: any) {
    console.error("Cron Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
