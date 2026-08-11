import { createVertex } from '@ai-sdk/google-vertex';
import { streamText } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // SDK v7: messages come inside a "messages" key
    const messages = body.messages ?? [];

    if (!process.env.GOOGLE_VERTEX_CREDENTIALS) {
      return new Response(
        JSON.stringify({ error: "Credenciais do Vertex AI nao configuradas (GOOGLE_VERTEX_CREDENTIALS)." }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    let vertex;
    try {
      const credentials = JSON.parse(process.env.GOOGLE_VERTEX_CREDENTIALS);
      vertex = createVertex({
        project: credentials.project_id,
        location: 'us-central1',
        googleAuthOptions: { credentials }
      });
    } catch {
      return new Response(
        JSON.stringify({ error: "O JSON do Vertex AI e invalido ou mal formatado." }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Convert SDK v7 UIMessage parts format to simple string messages
    const formattedMessages = messages.map((m: any) => {
      let content = '';
      if (typeof m.content === 'string') {
        content = m.content;
      } else if (Array.isArray(m.parts)) {
        content = m.parts
          .filter((p: any) => p.type === 'text')
          .map((p: any) => p.text)
          .join('');
      }
      return { role: m.role, content };
    });

    const result = streamText({
      model: vertex('gemini-2.5-flash'),
      messages: formattedMessages,
      system: `Voce e o Tutor Oficial de Inteligencia Artificial da "Ink Authority", uma plataforma online de cursos de tatuagem para tatuadores profissionais e iniciantes.
      Seu tom deve ser amigavel, direto, respeitoso e focado em arte e tecnica de tatuagem.
      Nunca saia do personagem. Se alguem perguntar sobre algo nao relacionado a arte, design, marketing para tatuadores ou tatuagem, responda educadamente que voce foi treinado apenas para auxiliar no universo da tatuagem.
      
      REGRA IMPORTANTE SOBRE SUPORTE:
      Se o aluno solicitar "suporte", "ajuda com a conta", "problemas na plataforma" ou pedir para falar com um atendente humano, diga: "Para problemas tecnicos ou suporte, por favor chame nosso time no WhatsApp."
      
      Responda em portugues do Brasil.`
    });

    return result.toUIMessageStreamResponse();
  } catch (error: any) {
    console.error("Erro no Chat API:", error);
    return new Response(
      JSON.stringify({ error: error?.message || "Erro interno no servidor." }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
