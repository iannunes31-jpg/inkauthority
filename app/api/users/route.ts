import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const client = await clerkClient();
    const response = await client.users.getUserList();
    
    // Check if the response contains the data property (newer Clerk SDKs) or is the array itself
    const usersList: any[] = Array.isArray(response) ? response : (response as any).data || [];
    
    const formattedUsers = usersList.map((user: any) => ({
      id: user.id,
      name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Usuário",
      email: user.emailAddresses[0]?.emailAddress || "Sem email",
      role: user.publicMetadata?.role || "Aluno",
      status: "Ativo", // Clerk users are active unless banned
      joinDate: new Date(user.createdAt).toLocaleDateString("pt-BR"),
      imageUrl: user.imageUrl,
    }));

    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error("Erro ao buscar usuários do Clerk:", error);
    return NextResponse.json({ error: "Erro ao carregar usuários" }, { status: 500 });
  }
}
