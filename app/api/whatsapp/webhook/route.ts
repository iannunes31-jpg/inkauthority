import { NextResponse } from 'next/server';
import { createVertex } from '@ai-sdk/google-vertex';
import { generateText } from 'ai';
import { createClient } from '@supabase/supabase-js';
import { GoogleAuth } from 'google-auth-library';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    if (payload.event?.toLowerCase() !== 'messages.upsert') {
      return NextResponse.json({ status: 'ignored' });
    }

    const messageData = payload.data;
    const remoteJid = messageData.key.remoteJid; // Number of the client
    const fromMe = messageData.key.fromMe;
    const instanceName = payload.instance; // This is the clerk_user_id of the artist
    const clerk_user_id = instanceName; 

    if (fromMe || remoteJid.includes('@g.us')) {
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

    // Attempt to download Base64 image/audio from Evolution API if present
    let base64Media: string | null = null;
    const evolutionUrl = process.env.EVOLUTION_API_URL || 'https://evolution-api-production-fbfd.up.railway.app'; 
    const apiKey = process.env.EVOLUTION_API_KEY || '42A5C9B31000-47F6-8B1E-F7C6656BE1D5';

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
          // Clean base64 string if it includes data: prefix
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
      .single();

    if (!settings || !settings.is_active) {
       console.log("Bot is disabled or settings not found.");
       return NextResponse.json({ status: 'inactive' });
    }

    // 2. Manage CRM (Upsert Customer)
    let { data: customer } = await supabase
      .from('customers')
      .select('id, name, status')
      .eq('clerk_user_id', clerk_user_id)
      .eq('phone_number', remoteJid)
      .single();

    if (!customer) {
      const { data: newCustomer } = await supabase
        .from('customers')
        .insert({
          clerk_user_id,
          phone_number: remoteJid,
          status: 'lead'
        })
        .select()
        .single();
      customer = newCustomer;
    }

    // 4. Fetch Conversation History (Last 10 messages to keep context)
    const { data: history } = await supabase
      .from('chat_history')
      .select('role, content')
      .eq('clerk_user_id', clerk_user_id)
      .eq('phone_number', remoteJid)
      .order('created_at', { ascending: false })
      .limit(10);

    const formattedHistory: { role: 'user' | 'assistant', content: string }[] = history 
      ? history.reverse().map((msg) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        }))
      : [];

    // 5. Build the massive High-Ticket Prompt
    const systemPrompt = `Você é o assistente virtual do estúdio de tatuagem "${settings.studio_name}".
Seu tom de voz é: "${settings.bot_personality}".
Estilos de Tatuagem que você faz: ${settings.styles}
Valor Base Mínimo: R$ ${settings.base_price}
Valor por Hora: R$ ${settings.hourly_rate}
${settings.price_arm ? `Preço Fechado - Braço Completo: R$ ${settings.price_arm}\n` : ''}${settings.price_leg ? `Preço Fechado - Perna Completa: R$ ${settings.price_leg}\n` : ''}${settings.price_front ? `Preço Fechado - Frente Completa: R$ ${settings.price_front}\n` : ''}${settings.price_back ? `Preço Fechado - Costas Completas: R$ ${settings.price_back}\n` : ''}Métodos de Pagamento: ${settings.payment_methods}
Endereço do Estúdio: ${settings.address}

### REGRAS DO PROCESSO DE VENDAS HIGH TICKET
Esta é a estratégia de conversão que você DEVE seguir rigidamente:

1. **Abordagem Inicial & Qualificação:**
- Chame o cliente pelo nome (se souber).
- O primeiro objetivo é entender a ideia da tatuagem: "Me conte sobre a ideia da tatuagem que você tem e em qual parte do corpo deseja realizá-la. Peça também uma foto da região para analisar a anatomia."
- NUNCA passe orçamento logo de cara sem antes entender o projeto, tamanho e local.

2. **Criação do Projeto & Valor Agregado:**
- Explique o processo de criação de arte para agregar valor: "A criação do projeto é desenvolvida no dia da sua sessão. A data é reservada exclusivamente para você, permitindo alinhar referências e ideias."

3. **Orçamento (Somente após entender o projeto):**
- Quando passar o orçamento, separe por sessões caso seja grande (ex: fechamento).
- O valor SEMPRE deve ser apresentado cheio e parcelado primeiro. Exemplo: "O valor ficaria em R$ 4000 parcelado ou R$ 3500 à vista".
- Especifique MUITO BEM a área do corpo que está sendo cobrada.

4. **Quebra de Objeções:**
- Se o cliente disser que está caro, explique estrategicamente o seu diferencial. 
- A maioria das objeções é um pedido de "me prove que vale". Mostre paciência e agregue valor.

5. **Conversão & Agendamento (O SINAL):**
- Quando o cliente quiser fechar, peça os dados (Nome, Celular, Cidade).
- Informe sobre o SINAL: "Para garantir que a data seja reservada para você, é necessário um sinal de [Insira um valor coerente com o orçamento] via Pix. Esse valor será abatido do total. Chave Pix: CNPJ xxx.xxx". (Adapte a chave Pix para os dados do estúdio se fornecidos).
- ASSIM QUE o cliente escolher a data e o horário, e passar o Nome, Email, Insta e Telefone, você JÁ EFETUA O AGENDAMENTO. 
- Para efetuar o agendamento no sistema, você DEVE retornar uma tag secreta no final da sua mensagem exatamente neste formato: \`[AGENDAMENTO CONFIRMADO: nome="..." email="..." insta="..." telefone="..." data="..." hora="..."]\`. Preencha os campos com os dados coletados.

6. **Comportamentos Anti-Curiosos & Regras de Ouro:**
- NÃO responda a mesma coisa duas vezes. Leia o histórico e dê continuidade à conversa.
- Se o cliente mandar uma foto (IMAGEM ENVIADA PELO CLIENTE), dedique atenção extra para elogiar ou fazer perguntas técnicas (tamanho, anatomia, local do corpo).
- Se o cliente mandar um ÁUDIO (ÁUDIO RECEBIDO), aja normalmente e responda no texto abordando o que ele falou no áudio.
- Se o cliente pedir um estilo que não está na lista de Estilos (${settings.styles}), recuse educadamente dizendo que você não atende esse estilo.
- Se o cliente insistir muito APENAS em preço, tente agregar valor. Se continuar focado apenas no valor barato, dispense educadamente (o estúdio é focado em qualidade e experiência).
- Responda SEMPRE no idioma que o cliente iniciou a conversa (seja inglês, espanhol ou português).

Lembre-se: Você NÃO deve parecer um robô. O cliente não deve perceber facilmente que está falando com uma IA.`;

    // Se o cliente enviou uma foto E o tatuador tem imagens de estilo, baixamos as imagens para o Gemini comparar
    const messagesToSend: any[] = [...formattedHistory];
    
    if (settings.style_image_url && hasImage) {
      const urls = settings.style_image_url.split(',').filter((u: string) => u.trim() !== '');
      if (urls.length > 0) {
        try {
          const contentParts: any[] = [
            { type: 'text', text: '[INSTRUÇÃO DO SISTEMA]: O cliente acabou de enviar uma imagem de referência. Abaixo estão as imagens do meu portfólio. Analise se a referência do cliente se encaixa no meu estilo. Se fugir muito, recuse educadamente e explique o porquê baseado no meu portfólio.' }
          ];
          
          // Fetch all images in parallel to save time
          const base64Images = await Promise.all(urls.map(async (url: string) => {
            const res = await fetch(url.trim());
            const arrayBuffer = await res.arrayBuffer();
            return Buffer.from(arrayBuffer).toString('base64');
          }));
          
          base64Images.forEach(base64 => {
            contentParts.push({ type: 'image', image: base64 });
          });

          messagesToSend.unshift(
            { role: 'user', content: contentParts },
            { role: 'assistant', content: 'Entendido. Compararei a referência do cliente com o portfólio.' }
          );
        } catch (e) {
          console.error("Error fetching portfolio images:", e);
        }
      }
    }

    // Prepare current user message with image or audio if present
    const currentUserParts: any[] = [];
    if (messageText) {
      currentUserParts.push({ type: 'text', text: messageText });
    } else if (hasAudio) {
      currentUserParts.push({ type: 'text', text: '[ÁUDIO RECEBIDO DO CLIENTE]' });
    }

    if (base64Media) {
      if (hasImage) {
        currentUserParts.push({ type: 'image', image: base64Media });
      } 
      // Skip injecting the audio file directly into Gemini for now to avoid SDK crashes
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
        location: 'us-central1',
        googleAuthOptions: { credentials }
      });
    } catch (e: any) {
      console.error("Vertex Auth Error:", e);
      try {
        await supabase.from('chat_history').insert([{
          clerk_user_id: 'SYSTEM_ERROR',
          phone_number: 'ERROR_LOG',
          role: 'system',
          content: 'Vertex Auth Error: ' + e.message
        }]);
      } catch(ignore) {}
      return NextResponse.json({ error: 'Vertex AI config error' }, { status: 500 });
    }

    const { text: aiResponse } = await generateText({
      model: vertex('gemini-2.5-flash'),
      system: systemPrompt,
      messages: messagesToSend,
    });

    // 7. Save Messages to History (User and Assistant)
    let dbUserText = messageText;
    if (hasImage) dbUserText = `[IMAGEM ENVIADA PELO CLIENTE] ${messageText}`;
    if (hasAudio) dbUserText = `[ÁUDIO ENVIADO PELO CLIENTE] ${messageText || ''}`;

    await supabase.from('chat_history').insert([
      {
        clerk_user_id,
        phone_number: remoteJid,
        role: 'user',
        content: dbUserText
      },
      {
        clerk_user_id,
        phone_number: remoteJid,
        role: 'assistant',
        content: aiResponse
      }
    ]);

    // 7.5. Intercept Scheduling Tag
    let finalAiResponse = aiResponse;
    const schedulingRegex = /\\[AGENDAMENTO CONFIRMADO: (.*?)\\]/;
    const match = finalAiResponse.match(schedulingRegex);
    
    if (match) {
      finalAiResponse = finalAiResponse.replace(match[0], '').trim();
      const rawData = match[1];
      
      // Basic manual extraction since eval is dangerous and JSON.parse won't work on raw attribute strings
      const extractField = (field: string) => {
        const regex = new RegExp(`${field}=\"([^\"]+)\"`);
        const m = rawData.match(regex);
        return m ? m[1] : '';
      };
      
      const nome = extractField('nome');
      const email = extractField('email');
      const insta = extractField('insta');
      const telefone = extractField('telefone');
      const data = extractField('data');
      const hora = extractField('hora');

      // Save to Supabase (we can save it to the customer record or a new schedules table)
      // For now, let's update the customer record with the email and insta, and we can log the schedule in chat history or a schedules table if it existed.
      if (nome || email || insta) {
        await supabase
          .from('customers')
          .update({
             name: nome || customer?.name,
             status: 'scheduled',
          })
          .eq('id', customer!.id);
      }
      
      // Also log the scheduling event for the artist
      await supabase.from('chat_history').insert([{
        clerk_user_id,
        phone_number: remoteJid,
        role: 'system',
        content: `NOVO AGENDAMENTO: O cliente ${nome} (Insta: ${insta}, Email: ${email}, Tel: ${telefone}) agendou para ${data} às ${hora}.`
      }]);
    }

    // 8. Dynamic delay logic (simulating typing speed)
    // Vercel Serverless Functions timeout after 10s on Hobby plan.
    // For text (Gemini 2-3s), we can afford a dynamic delay up to 4000ms.
    let delayMs = 500 + Math.min(aiResponse.length * 15, 4000);
    
    if (!evolutionUrl || !apiKey) {
      return NextResponse.json({ error: 'Evolution API credentials missing' }, { status: 500 });
    }

    await fetch(`${evolutionUrl}/message/sendText/${instanceName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': apiKey
      },
      body: JSON.stringify({
        number: remoteJid,
        text: finalAiResponse
      })
    });

    return NextResponse.json({ status: 'success' });
  } catch (error: any) {
    console.error('Webhook Error:', error);
    try {
      await supabase.from('chat_history').insert([{
        clerk_user_id: 'SYSTEM_ERROR',
        phone_number: 'ERROR_LOG',
        role: 'system',
        content: error.message || error.toString()
      }]);
    } catch(e) {}
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
