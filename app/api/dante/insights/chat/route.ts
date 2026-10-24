import { auth } from "@clerk/nextjs/server";
import { rateLimit } from "@/lib/rate-limit";
import { createVertex } from "@ai-sdk/google-vertex";
import { streamText } from "ai";
import { userHasAccess, planRequired } from "@/lib/access-server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getInsights, insightsForPrompt } from "@/lib/dante-insights";

export const maxDuration = 60;

// Strategy chat for the artist, grounded in their own Dante conversations and numbers.
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  if (!(await userHasAccess(userId, "dante"))) return planRequired();
  const limited = rateLimit(`dante-chat:${userId}`, 20, 60);
  if (limited) return limited;

  const body = await req.json();
  const messages = (body.messages ?? []).map((m: any) => ({
    role: m.role,
    content:
      typeof m.content === "string"
        ? m.content
        : (m.parts ?? []).filter((p: any) => p.type === "text").map((p: any) => p.text).join(""),
  }));

  const [data, { data: settings }] = await Promise.all([
    getInsights(userId),
    supabaseAdmin.from("ai_settings").select("studio_name, styles, artist_info, currency").eq("clerk_user_id", userId).limit(1).maybeSingle(),
  ]);

  const credentials = JSON.parse(process.env.GOOGLE_VERTEX_CREDENTIALS || "{}");
  const vertex = createVertex({ project: credentials.project_id, location: "global", googleAuthOptions: { credentials } });

  const result = streamText({
    model: vertex("gemini-3.1-flash-lite"),
    messages,
    system: `Voce e o consultor de vendas e marketing do tatuador "${settings?.studio_name || ""}". Ele usa o Dante, um assistente de IA que atende os clientes dele no WhatsApp.
Responda as perguntas dele com base nos DADOS REAIS abaixo: numeros, conversas paradas, em que etapa os clientes desistem, padroes nas mensagens. Quando pedirem estrategia, de acoes concretas e priorizadas (o que fazer hoje, esta semana), citando clientes especificos quando fizer sentido (pelo nome ou final do telefone). Se os dados forem poucos, diga isso e sugira o que observar.
Nunca invente numeros que nao estao nos dados. Responda em portugues do Brasil, direto, com listas curtas quando ajudar.
Estilos do estudio: ${settings?.styles || "-"} | Moeda: ${settings?.currency || "BRL"}

${insightsForPrompt(data)}`,
  });

  return result.toUIMessageStreamResponse();
}
