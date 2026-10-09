import { NextResponse } from 'next/server';
import { createVertex } from '@ai-sdk/google-vertex';
import { generateText } from 'ai';
import { supabaseAdmin as supabase } from '@/lib/supabase-admin';

export async function POST(req: Request) {
  try {
    // Evolution API doesn't sign its webhook payloads, so anyone who found
    // this URL could POST a fake payload — spoof messages, insert fake
    // "appointments", or make the app send arbitrary WhatsApp messages
    // through the studio's own number. We register the webhook URL (see
    // /api/whatsapp/instance) with a `?secret=` query param; require it here.
    const url = new URL(req.url);
    const expectedSecret = process.env.WHATSAPP_WEBHOOK_SECRET;
    if (expectedSecret && url.searchParams.get('secret') !== expectedSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();
    console.log('[WPP] raw:', JSON.stringify(payload).slice(0, 500));

    const eventName = (payload.event || payload.type || '').toLowerCase().replace(/\./g, '_');
    if (eventName !== 'messages_upsert') {
      console.log('[WPP] ignored event:', payload.event);
      return NextResponse.json({ status: 'ignored' });
    }

    // Evolution API can send data as object or array
    const rawData = payload.data;
    const messageData = Array.isArray(rawData) ? rawData[0] : rawData;
    const remoteJid = messageData?.key?.remoteJid;
    const fromMe = messageData?.key?.fromMe;
    const instanceName = payload.instance || payload.instanceName;
    const clerk_user_id = instanceName;

    console.log('[WPP] remoteJid:', remoteJid, 'fromMe:', fromMe, 'instance:', instanceName, 'msgKeys:', Object.keys(messageData || {}));

    if (!remoteJid || fromMe || remoteJid.includes('@g.us')) {
      console.log('[WPP] ignored: fromMe or group or no jid');
      return NextResponse.json({ status: 'ignored' });
    }

    const messageTimestamp = messageData.messageTimestamp;
    const now = Math.floor(Date.now() / 1000);
    if (messageTimestamp && (now - messageTimestamp > 300)) {
       console.log("Ignorando mensagem antiga de", remoteJid);
       return NextResponse.json({ status: 'ignored_old' });
    }

    let messageText = '';
    let hasImage = false;
    let hasAudio = false;
    let mimeType = '';

    if (messageData.message?.conversation) {
      messageText = messageData.message.conversation;
    } else if (messageData.message?.extendedTextMessage?.text) {
      messageText = messageData.message.extendedTextMessage.text;
    } else if (messageData.message?.imageMessage) {
      hasImage = true;
      mimeType = messageData.message.imageMessage.mimetype || 'image/jpeg';
      messageText = messageData.message.imageMessage.caption || '';
    } else if (messageData.message?.audioMessage) {
      hasAudio = true;
      mimeType = messageData.message.audioMessage.mimetype || 'audio/ogg';
    }

    if (!messageText && !hasImage && !hasAudio) {
      return NextResponse.json({ status: 'no_text_or_media' });
    }

    let base64Media: string | null = null;
    const evolutionUrl = process.env.EVOLUTION_API_URL || 'https://evolution-api-production-fbfd.up.railway.app'; 
    // No hardcoded fallback: that literal key was committed to the repo in
    // git history and should be treated as leaked — rotate it in Evolution
    // API if it's still the one in use.
    const apiKey = process.env.EVOLUTION_API_KEY;
    if (!apiKey) {
      console.error('EVOLUTION_API_KEY not configured');
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
    }

    if (hasImage) {
      try {
        const mediaRes = await fetch(`${evolutionUrl}/chat/getBase64FromMediaMessage/${instanceName}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': apiKey
          },
          body: JSON.stringify({ message: messageData })
        });
        const mediaData = await mediaRes.json();
        if (mediaData && mediaData.base64) {
          base64Media = mediaData.base64 as string;
          if (base64Media && base64Media.startsWith('data:')) {
            base64Media = base64Media.split(',')[1];
          }
        }
      } catch (err) {
        console.error("Failed to fetch media base64:", err);
      }
    }

    // 1. Fetch AI Settings for this artist
    const { data: settings } = await supabase
      .from('ai_settings')
      .select('*')
      .eq('clerk_user_id', clerk_user_id)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    console.log('[WPP] settings found:', !!settings, 'is_active:', settings?.is_active, 'bot_mode:', settings?.bot_mode, 'clerk_user_id:', clerk_user_id);
    if (!settings || !settings.is_active) {
      console.log('[WPP] inactive or no settings — clerk_user_id:', clerk_user_id);
      return NextResponse.json({ status: 'inactive' });
    }

    // 2. Manage CRM (Upsert Customer) — wrapped so errors don't stop the bot
    console.log('[WPP] step: CRM');
    let customer: any = null;
    try {
      const { data: existingCustomer, error: selectErr } = await supabase
        .from('customers')
        .select('id, name, status')
        .eq('clerk_user_id', clerk_user_id)
        .eq('phone_number', remoteJid)
        .limit(1)
        .maybeSingle();
      if (selectErr) console.log('[WPP] CRM select error:', selectErr.message);
      if (existingCustomer) {
        customer = existingCustomer;
      } else {
        const { data: newCustomer, error: insertErr } = await supabase
          .from('customers')
          .insert({ clerk_user_id, phone_number: remoteJid, status: 'lead' })
          .select()
          .single();
        if (insertErr) console.log('[WPP] CRM insert error:', insertErr.message);
        customer = newCustomer;
      }
    } catch (crmErr: any) {
      console.log('[WPP] CRM exception:', crmErr.message);
    }

    // Determine if it's a foreign number
    const isForeign = !remoteJid.startsWith('55');

    // 4. Fetch Conversation History
    console.log('[WPP] step: history');
    const { data: history, error: histErr } = await supabase
      .from('chat_history')
      .select('role, content')
      .eq('clerk_user_id', clerk_user_id)
      .eq('phone_number', remoteJid)
      .in('role', ['user', 'assistant'])
      .order('created_at', { ascending: false })
      .limit(10);
    if (histErr) console.log('[WPP] history error:', histErr.message);

    const formattedHistory: { role: 'user' | 'assistant', content: string }[] = history
      ? history.reverse().map((msg) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        }))
      : [];

    // 5. Build the massive High-Ticket Prompt with the new Rules
    const systemPrompt = `Voce e Dante, o assistente virtual do estudio de tatuagem "${settings.studio_name}".
Seu tom de voz e: "${settings.bot_personality}".
Estilos de Tatuagem que voce faz: ${settings.styles}
Valor Base Minimo: ${settings.base_price ? `R$ ${settings.base_price}` : 'N/A'}
Valor por Hora: ${settings.hourly_rate ? `R$ ${settings.hourly_rate}` : 'N/A'}
Valor por Sessao: ${settings.price_session ? `R$ ${settings.price_session}` : 'N/A'}
Metodos de Pagamento: ${settings.payment_methods}
Endereco do Estudio: ${settings.address}

### IDIOMA E INTERNACIONALIZACAO
- Identifique o idioma da mensagem do usuario e responda EXATAMENTE no mesmo idioma.
- O numero de telefone deste cliente ${isForeign ? 'E ESTRANGEIRO (Fora do Brasil)' : 'E DO BRASIL'}.
- Se o cliente iniciar a conversa em Ingles, responda em Ingles. Se o numero for estrangeiro e iniciar sem texto, inicie em Ingles.

### REGRAS DO PROCESSO DE VENDAS HIGH TICKET
Esta e a estrategia de conversao que voce DEVE seguir rigidamente:

1. **Abordagem Inicial & Qualificacao:**
- Chame o cliente pelo nome (se souber).
- Entenda a ideia da tatuagem e a area do corpo. 
- Se precisar de uma foto da regiao do corpo para analisar a anatomia, peca a foto e inclua OBRIGATORIAMENTE a tag [ENVIAR_EXEMPLO_FOTO] no final da sua resposta. O sistema vera essa tag e mandara uma imagem de exemplo pro cliente.

2. **Criacao do Projeto & Regra Estrangeira:**
- Se for um cliente ESTRANGEIRO ou que fala ingles, informe que a arte e feita em 2 sessoes. Exemplo de como abordar (traduza se necessario): "In this case, this piece would be done in 2 sessions to achieve the best possible quality and level of detail. Each session is dedicated 100% to you, giving us enough time to talk in person, go over all the details, and develop the project carefully. Since we are already discussing the tattoo here, once the appointment is confirmed, I can already start researching references and developing ideas for the project. This way, when we meet, I will already have a few options to show you, and we can work together on any adjustments needed until we reach the ideal result. This allows me to give your artwork my full attention and make sure the project is developed in a completely personalized and thoughtful way! ☺️"
- Se for cliente Brasileiro, apenas explique que a criacao do projeto e personalizada e desenvolvida no dia ou dias antes da sessao.

3. **Orcamento & Precos (REGRA ABSOLUTA):**
- SE OS VALORES ACIMA (Valor Base Minimo ou Valor por Hora) ESTIVEREM COMO "N/A" OU ZERADOS, VOCE ESTA EXPRESSAMENTE PROIBIDO DE PASSAR VALORES, ESTIMATIVAS OU FAIXAS DE PRECO. Diga educadamente que o artista fara o orcamento exato apos avaliar o projeto e a anatomia pessoalmente ou no envio das fotos.
- Se houver valor configurado, use-o como base. O valor SEMPRE deve ser apresentado cheio e parcelado primeiro.

4. **Conversao & Agendamento (O SINAL):**
- Quando o cliente decidir agendar, voce DEVE pedir as seguintes informacoes para prosseguir com o agendamento:
  * Nome completo
  * Numero de celular (com codigo do pais)
  * Cidade de residencia
- Informe que para garantir a data (ou horario) seja exclusivamente reservada, e necessario um sinal financeiro para CADA sessao. 
- O valor do sinal sera abatido do total da tatuagem no dia da sessao.
- Informe que o pagamento pode ser realizado via Pix para: "CNPJ: [Inserir o CNPJ do estudio ou chave Pix informada pelo artista. Se nao souber, diga que o artista enviara a chave]".
- ASSIM QUE o cliente passar os dados, voce DEVE retornar uma tag secreta no final da sua mensagem exatamente neste formato: \`[AGENDAMENTO CONFIRMADO: nome="..." email="..." insta="..." telefone="..." data="..." hora="..."]\`. Preencha os campos.

5. **Comportamentos Anti-Curiosos:**
- NAO responda a mesma coisa duas vezes. Leia o historico.
- Se o cliente mandar uma foto, dedique atencao extra para elogiar ou fazer perguntas tecnicas (tamanho, anatomia, local do corpo).
- Lembre-se: Voce NAO deve parecer um robo. O cliente nao deve perceber facilmente que esta falando com uma IA.`;

    const messagesToSend: any[] = [...formattedHistory];
    
    // Prepare current user message
    const currentUserParts: any[] = [];
    if (messageText) {
      currentUserParts.push({ type: 'text', text: messageText });
    } else if (hasAudio) {
      currentUserParts.push({ type: 'text', text: '[AUDIO RECEBIDO DO CLIENTE]' });
    }

    if (base64Media) {
      if (hasImage) {
        currentUserParts.push({ type: 'file', data: base64Media, mediaType: mimeType || 'image/jpeg' });
      } 
    }
    if (currentUserParts.length > 0) {
      messagesToSend.push({
        role: 'user',
        content: currentUserParts
      });
    }

    // 6. Generate Response with Gemini
    let vertex;
    try {
      if (!process.env.GOOGLE_VERTEX_CREDENTIALS) throw new Error('Missing GOOGLE_VERTEX_CREDENTIALS');
      const credentials = JSON.parse(process.env.GOOGLE_VERTEX_CREDENTIALS);
      vertex = createVertex({
        project: credentials.project_id,
        location: 'global',
        googleAuthOptions: { credentials }
      });
    } catch (e: any) {
      return NextResponse.json({ error: 'Vertex AI config error' }, { status: 500 });
    }

    console.log('[WPP] calling AI, messages count:', messagesToSend.length);
    const { text: aiResponse } = await generateText({
      model: vertex('gemini-3.1-flash-lite'),
      system: systemPrompt,
      messages: messagesToSend,
    });
    console.log('[WPP] AI response length:', aiResponse?.length, 'preview:', aiResponse?.slice(0, 80));

    let finalResponse = aiResponse;

    // Check for Scheduling Tag
    const agendamentoMatch = finalResponse.match(/\[AGENDAMENTO CONFIRMADO:(.*?)\]/);
    if (agendamentoMatch) {
      finalResponse = finalResponse.replace(agendamentoMatch[0], '').trim();
      
      await supabase.from('appointments').insert({
        tatuador_id: clerk_user_id,
        client_id: customer?.id ?? null,
        appointment_date: new Date(Date.now() + 86400000 * 7).toISOString(), 
        status: 'Confirmado',
        description: agendamentoMatch[1].trim()
      });
    }

    // Check for Photo Example Tag
    const needsExamplePhoto = finalResponse.includes('[ENVIAR_EXEMPLO_FOTO]');
    if (needsExamplePhoto) {
      finalResponse = finalResponse.replace('[ENVIAR_EXEMPLO_FOTO]', '').trim();
    }

    // Save interaction to history
    await supabase.from('chat_history').insert([
      { clerk_user_id, phone_number: remoteJid, role: 'user', content: messageText || '[Midia enviada]' },
      { clerk_user_id, phone_number: remoteJid, role: 'assistant', content: finalResponse }
    ]);

    // Copilot mode: store suggestion for artist review, don't auto-send
    if (settings.bot_mode === 'copilot') {
      await supabase.from('chat_history').insert({
        clerk_user_id,
        phone_number: remoteJid,
        role: 'copilot',
        content: finalResponse
      });
      return NextResponse.json({ status: 'copilot_suggestion_saved' });
    }

    // Send text response via Evolution API
    // Evolution API expects just the phone number, not the full JID
    const phoneNumber = remoteJid.split('@')[0];
    console.log('[WPP] sending to', phoneNumber, 'via instance', instanceName);
    try {
      const sendRes = await fetch(`${evolutionUrl}/message/sendText/${instanceName}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': apiKey },
        body: JSON.stringify({
          number: phoneNumber,
          text: finalResponse,
          delay: 1500
        })
      });
      const sendData = await sendRes.json().catch(() => ({}));
      console.log('[WPP] send result:', sendRes.status, JSON.stringify(sendData).slice(0, 200));

      // Send photo example if tag was present
      if (needsExamplePhoto) {
        await fetch(`${evolutionUrl}/message/sendMedia/${instanceName}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'apikey': apiKey },
          body: JSON.stringify({
            number: remoteJid,
            options: { delay: 3000, presence: 'composing' },
            mediaMessage: {
              mediatype: "image",
              caption: "Exemplo de como tirar a foto do local:",
              media: `https://${req.headers.get('host')}/exemplo-foto.jpg`
            }
          })
        });
      }

    } catch (err) {
      console.error("Failed to send response via Evolution:", err);
    }

    return NextResponse.json({ status: 'replied' });

  } catch (error: any) {
    console.error("Erro no webhook:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
