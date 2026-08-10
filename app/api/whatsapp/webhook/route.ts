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

    if (hasImage || hasAudio) {
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

6. **Comportamentos Anti-Curiosos & Regras de Ouro:**
- NÃO responda a mesma coisa duas vezes. Leia o histórico e dê continuidade à conversa.
- Se o cliente mandar uma foto (IMAGEM ENVIADA PELO CLIENTE), dedique atenção extra para elogiar ou fazer perguntas técnicas (tamanho, anatomia, local do corpo).
- Se o cliente mandar um ÁUDIO (ÁUDIO RECEBIDO) que seja longo ou conte uma história, ou se a sua resposta for complexa e humanizada, responda também em formato de áudio.
- PARA RESPONDER COM ÁUDIO DE VOZ, sua resposta DEVE obrigatoriamente começar exatamente com a tag [AUDIO], seguida do texto que será falado. Exemplo: "[AUDIO] Oi fulano, tudo bem? Olha, sobre a sua ideia..." (Apenas o texto após a tag será convertido em voz, não coloque emojis que não podem ser lidos).
- Se o cliente pedir um estilo que não está na lista de Estilos (${settings.styles}), recuse educadamente dizendo que você não atende esse estilo.
- Se o cliente insistir muito APENAS em preço, tente agregar valor. Se continuar focado apenas no valor barato, dispense educadamente (o estúdio é focado em qualidade e experiência).
- Responda SEMPRE no idioma que o cliente iniciou a conversa (seja inglês, espanhol ou português).

Lembre-se: Você NÃO deve parecer um robô. O cliente não deve perceber facilmente que está falando com uma IA.`;

    // Se tiver imagem de estilo, injetamos como uma mensagem inicial (invisível pro usuário final)
    const messagesToSend: any[] = [...formattedHistory];
    
    if (settings.style_image_url) {
      const urls = settings.style_image_url.split(',').filter((u: string) => u.trim() !== '');
      if (urls.length > 0) {
        const contentParts: any[] = [
          { type: 'text', text: '[INSTRUÇÃO DO SISTEMA]: Olá, estas são as imagens de referência do meu estilo de tatuagem (meu portfólio). Baseie-se 100% nelas para analisar as ideias e referências dos clientes. Recuse educadamente o que fugir muito desse estilo. Não diga ao cliente que você recebeu esta imagem secreta.' }
        ];
        urls.forEach((url: string) => {
          contentParts.push({ type: 'image', image: url.trim() });
        });
        
        messagesToSend.unshift(
          {
            role: 'user',
            content: contentParts
          },
          {
            role: 'assistant',
            content: 'Entendido. Usarei essas imagens como referência para o estilo do estúdio.'
          }
        );
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
      } else if (hasAudio) {
        currentUserParts.push({ 
          type: 'file', 
          data: base64Media, 
          mimeType: mimeType.split(';')[0] || 'audio/ogg' 
        });
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
        location: 'us-central1',
        googleAuthOptions: { credentials }
      });
    } catch (e: any) {
      console.error("Vertex Auth Error:", e);
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

    // 8. Process Audio (TTS) & Prepare Evolution Request
    let isAudioResponse = aiResponse.trim().startsWith('[AUDIO]');
    let finalOutputText = isAudioResponse ? aiResponse.replace('[AUDIO]', '').trim() : aiResponse;
    let base64TTS: string | null = null;

    if (isAudioResponse) {
      try {
        const credentials = JSON.parse(process.env.GOOGLE_VERTEX_CREDENTIALS!);
        const auth = new GoogleAuth({
          credentials,
          scopes: ['https://www.googleapis.com/auth/cloud-platform']
        });
        const client = await auth.getClient();
        const tokenResponse = await client.getAccessToken();
        const accessToken = tokenResponse.token;

        const ttsRes = await fetch('https://texttospeech.googleapis.com/v1/text:synthesize', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            input: { text: finalOutputText },
            voice: { languageCode: 'pt-BR', name: 'pt-BR-Journey-D' }, // Realistic Journey Voice
            audioConfig: { audioEncoding: 'OGG_OPUS', speakingRate: 1.1 }
          })
        });

        const ttsData = await ttsRes.json();
        if (ttsData.audioContent) {
          base64TTS = ttsData.audioContent;
        } else {
          console.error("TTS Error:", ttsData);
          isAudioResponse = false; // fallback to text
        }
      } catch (err) {
        console.error("TTS generation failed:", err);
        isAudioResponse = false;
      }
    }

    if (!evolutionUrl || !apiKey) {
      return NextResponse.json({ error: 'Evolution API credentials missing' }, { status: 500 });
    }

    // Dynamic delay logic (simulating typing/recording speed)
    // Vercel Serverless Functions timeout after 10s on Hobby plan.
    // Evolution API blocks the HTTP request during the delay.
    // To prevent Vercel 504 Gateway Timeout, we MUST keep the total request time under 10s!
    // Since Gemini (2-3s) + Google TTS (1-2s) already takes 5s, we can't add any significant delay.
    let delayMs = 500;
    
    // Fallback if Evolution doesn't support massive delay inline
    // We send via Evolution API using the delay param
    if (isAudioResponse && base64TTS) {
      await fetch(`${evolutionUrl}/message/sendWhatsAppAudio/${instanceName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': apiKey
        },
        body: JSON.stringify({
          number: remoteJid,
          audio: `data:audio/ogg;base64,${base64TTS}`,
          encoding: true,
          delay: delayMs,
          presence: 'recording'
        })
      });
    } else {
      await fetch(`${evolutionUrl}/message/sendText/${instanceName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': apiKey
        },
        body: JSON.stringify({
          number: remoteJid,
          text: finalOutputText,
          delay: delayMs,
          presence: 'typing'
        })
      });
    }

    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
