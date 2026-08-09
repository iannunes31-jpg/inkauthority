import { NextResponse } from 'next/server';
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    // evolution-api sends 'messages.upsert' for new messages
    if (payload.event !== 'messages.upsert') {
      return NextResponse.json({ status: 'ignored' });
    }

    const messageData = payload.data;
    const remoteJid = messageData.key.remoteJid; // Client's WhatsApp number
    const fromMe = messageData.key.fromMe;
    
    // Ignore messages sent by ourselves or from groups
    if (fromMe || remoteJid.includes('@g.us')) {
      return NextResponse.json({ status: 'ignored' });
    }

    // Extract text from WhatsApp message object
    let messageText = '';
    if (messageData.message?.conversation) {
      messageText = messageData.message.conversation;
    } else if (messageData.message?.extendedTextMessage?.text) {
      messageText = messageData.message.extendedTextMessage.text;
    }

    if (!messageText) {
      return NextResponse.json({ status: 'no_text' });
    }

    // 1. Send the message to Gemini AI to generate a response
    const { text: aiResponse } = await generateText({
      model: google('gemini-1.5-pro-latest'),
      system: `Você é a assistente virtual do estúdio de tatuagem Ink Authority. 
Seu papel é atender clientes no WhatsApp de forma natural, educada e prestativa.
- Faça perguntas para entender a ideia da tatuagem (tamanho, local do corpo, referências).
- Se a pessoa pedir orçamento direto, explique que precisa de mais detalhes (tamanho em CM, estilo, local).
- Nosso valor base de sessão é R$ 1.500,00 ou R$ 300/hora.
- Seja sempre humanizada, use emojis com moderação.`,
      prompt: `O cliente enviou a seguinte mensagem no WhatsApp:\n"${messageText}"\n\nResponda ao cliente:`
    });

    // 2. Send the AI response back to the client via Evolution API
    const evolutionUrl = process.env.EVOLUTION_API_URL; // e.g. https://evolution-xxx.up.railway.app
    const apiKey = process.env.EVOLUTION_API_KEY;
    const instanceName = payload.instance;

    if (!evolutionUrl || !apiKey) {
      console.error("Evolution API credentials missing in .env.local");
      return NextResponse.json({ error: 'Evolution API credentials missing' }, { status: 500 });
    }

    const response = await fetch(`${evolutionUrl}/message/sendText/${instanceName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': apiKey
      },
      body: JSON.stringify({
        number: remoteJid,
        text: aiResponse
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error sending message via Evolution API:', errorText);
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }

    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
