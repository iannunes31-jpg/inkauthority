import { createVertex } from '@ai-sdk/google-vertex';
import { streamText } from 'ai';

// Permitir tempo maior de execução no servidor (Edge)
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Verificação de segurança (se o usuário não colocou a chave ainda)
    if (!process.env.GOOGLE_VERTEX_CREDENTIALS) {
      return new Response(
        JSON.stringify({ error: "Credenciais do Vertex AI não configuradas (GOOGLE_VERTEX_CREDENTIALS). Fale com o Administrador." }), 
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    let vertex;
    try {
      const credentials = JSON.parse(process.env.GOOGLE_VERTEX_CREDENTIALS);
      vertex = createVertex({
        project: credentials.project_id,
        location: 'us-central1', // Região padrão recomendada para Gemini no Vertex
        googleAuthOptions: {
          credentials
        }
      });
    } catch (parseError: any) {
      return new Response(
        JSON.stringify({ error: "O JSON do Vertex AI (GOOGLE_VERTEX_CREDENTIALS) é inválido ou está mal formatado." }), 
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Chamada para a API do Google Vertex AI com streaming (Vercel AI SDK)
    const result = streamText({
      model: vertex('gemini-2.5-flash'), // Usando 2.5-flash conforme solicitado
      messages,
      system: `Você é o Tutor Oficial de Inteligência Artificial da "Ink Authority", uma plataforma online de cursos de tatuagem para tatuadores profissionais e iniciantes. 
      Seu tom deve ser amigável, direto, respeitoso e focado em arte e técnica de tatuagem. 
      Nunca saia do personagem. Se alguém perguntar sobre algo não relacionado à arte, design, marketing para tatuadores ou tatuagem, responda educadamente que você foi treinado apenas para auxiliar no universo da tatuagem.
      
      REGRA IMPORTANTE SOBRE SUPORTE:
      Embora você seja um tutor de tatuagem, se o aluno solicitar "suporte", "ajuda com a conta", "problemas na plataforma" ou pedir para falar com um atendente humano, você DEVE enviar o contato do WhatsApp de Suporte. Diga algo como: "Para problemas técnicos ou suporte, por favor chame nosso time no WhatsApp: [Insira o Link/Número do WhatsApp]".
      
      Responda em português do Brasil.`
    });

    return result.toTextStreamResponse();
  } catch (error: any) {
    console.error("Erro no Chat API:", error);
    return new Response(
      JSON.stringify({ error: error?.message || "Erro interno no servidor." }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
