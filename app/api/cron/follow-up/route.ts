import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase-admin';
import { createVertex } from '@ai-sdk/google-vertex';
import { generateText } from 'ai';

export const maxDuration = 60; // Allow more time for processing multiple leads

export async function GET(req: Request) {
  const evolutionUrl = process.env.EVOLUTION_API_URL;
  const evolutionKey = process.env.EVOLUTION_API_KEY;

  if (!evolutionUrl || !evolutionKey) {
    return NextResponse.json({ error: "Evolution API credenciais ausentes." }, { status: 500 });
  }

  // 1. Fetch all leads
  const { data: leads, error } = await supabase
    .from('customers')
    .select('*')
    .eq('status', 'lead');

  if (error || !leads) {
    return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 });
  }

  const now = new Date();
  const followedUpCount = 0;

  for (const lead of leads) {
    // 2. Fetch the latest message for this lead
    const { data: latestMsg } = await supabase
      .from('chat_history')
      .select('created_at, role')
      .eq('clerk_user_id', lead.clerk_user_id)
      .eq('phone_number', lead.phone_number)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!latestMsg) continue;

    const lastInteractionDate = new Date(latestMsg.created_at);
    const diffHours = (now.getTime() - lastInteractionDate.getTime()) / (1000 * 60 * 60);

    // If the last message was from the assistant and it's been more than 48 hours
    if (latestMsg.role === 'assistant' && diffHours >= 48 && diffHours <= 72) {
      
      // Fetch the context (last 5 messages)
      const { data: contextMsgs } = await supabase
        .from('chat_history')
        .select('role, content')
        .eq('clerk_user_id', lead.clerk_user_id)
        .eq('phone_number', lead.phone_number)
        .order('created_at', { ascending: false })
        .limit(5);

      const contextText = contextMsgs 
        ? contextMsgs.reverse().map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n')
        : '';

      // Use AI to pick the best follow up
      let followUpMessage = "Ola! Vi que voce nao retornou e queria saber se ainda tem interesse em realizar esse projeto. Caso tenha alguma duvida, pode me chamar.";
      
      try {
        if (process.env.GOOGLE_VERTEX_CREDENTIALS) {
          const credentials = JSON.parse(process.env.GOOGLE_VERTEX_CREDENTIALS);
          const vertex = createVertex({
            project: credentials.project_id,
            location: 'us-central1',
            googleAuthOptions: { credentials }
          });

          const { text } = await generateText({
            model: vertex('gemini-2.5-flash'),
            system: `Voce e um assistente de vendas de um estudio de tatuagem. Seu objetivo e escolher a MELHOR mensagem de follow-up para um cliente que parou de responder ha 2 dias.
O nome do cliente e ${lead.name || 'Cliente'}.
Aqui esta o historico final da conversa:
${contextText}

ESCOLHA APENAS UMA DAS 4 OPCOES ABAIXO baseado no contexto da conversa. RESPONDA APENAS COM O TEXTO DA OPCAO ESCOLHIDA (sem aspas, sem numeros).
Opcao 1 (Se pararam discutindo o desenho/criacao): Ola, ${lead.name || 'tudo bem'}? Ficou alguma duvida, em relacao ao seu projeto?
Opcao 2 (Se sumiram na hora de marcar data/pagar): Ola, ${lead.name || 'tudo bem'}? Vi que nao respondeu, ainda desejar dar continuidade ao seu atendimento?
Opcao 3 (Abordagem amigavel padrao): Oi, tudo bem, ${lead.name || ''}? Passando para saber se ficou alguma duvida sobre o projeto. Estou a disposicao para te ajudar no que precisar.
Opcao 4 (Retomada de interesse geral): Oi! Vi que voce nao retornou e queria saber se ainda tem interesse em realizar esse projeto. Caso tenha alguma duvida ou precise ajustar alguma coisa, pode me chamar.`,
            prompt: "Qual opcao eu devo enviar?"
          });

          if (text) followUpMessage = text.trim();
        }
      } catch (e) {
        console.error("AI FollowUp Error", e);
      }

      // Send via Evolution API using the artist's instance (clerk_user_id)
      let cleanPhone = lead.phone_number.replace(/\D/g, '');
      if (!cleanPhone.startsWith('55') && cleanPhone.length === 11) {
        cleanPhone = `55${cleanPhone}`;
      }

      try {
        await fetch(`${evolutionUrl}/message/sendText/${lead.clerk_user_id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': evolutionKey
          },
          body: JSON.stringify({
            number: cleanPhone,
            options: { delay: 1200, presence: 'composing' },
            textMessage: { text: followUpMessage }
          })
        });

        // Save follow up to history
        await supabase.from('chat_history').insert({
          clerk_user_id: lead.clerk_user_id,
          phone_number: lead.phone_number,
          role: 'assistant',
          content: followUpMessage
        });

      } catch (e) {
        console.error("Failed to send follow up to", cleanPhone, e);
      }
    }
  }

  return NextResponse.json({ status: 'success', message: 'Cron executado com sucesso.' });
}
