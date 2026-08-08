import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

// Permitir tempo maior de execução no servidor (Edge)
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Verificação de segurança (se o usuário não colocou a chave ainda)
    if (!process.env.GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "API Key do Gemini não configurada. Fale com o Administrador." }), 
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Chamada para a API do Google Gemini com streaming (Vercel AI SDK)
    const result = streamText({
      model: google('gemini-1.5-pro-latest'),
      messages,
      system: `Você é o Tutor Oficial de Inteligência Artificial da "Ink Authority", uma plataforma online de cursos de tatuagem para tatuadores profissionais e iniciantes. 
      Seu tom deve ser amigável, direto, respeitoso e focado em arte e técnica de tatuagem. 
      Nunca saia do personagem. Se alguém perguntar sobre algo não relacionado à arte, design, marketing para tatuadores ou tatuagem, responda educadamente que você foi treinado apenas para auxiliar no universo da tatuagem.
      Responda em português do Brasil.`
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Erro no Chat API:", error);
    return new Response(
      JSON.stringify({ error: "Erro interno no servidor." }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
