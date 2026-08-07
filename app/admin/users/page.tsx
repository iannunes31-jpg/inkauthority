"use client";

import { Search, ChevronDown, User, ShieldAlert, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminUsers() {
  const users = [
    { id: 1, name: "Lucas Silva", email: "lucas@example.com", role: "Aluno", status: "Ativo", joinDate: "12/08/2026" },
    { id: 2, name: "Mariana Costa", email: "mariana@example.com", role: "Aluno", status: "Inativo", joinDate: "05/08/2026" },
    { id: 3, name: "Carlos Admin", email: "carlos@inkauthority.com", role: "Admin", status: "Ativo", joinDate: "01/01/2026" },
    { id: 4, name: "João Pedro", email: "joao@example.com", role: "Afiliado", status: "Ativo", joinDate: "20/07/2026" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">Gestão de Usuários</h2>
        <p className="text-muted-foreground font-light">Controle os acessos, permissões e histórico de todos os usuários da plataforma.</p>
      </div>

      <div className="glass p-6 rounded-2xl border border-white/10">
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text"
              placeholder="Buscar por nome ou email..."
              className="w-full bg-black/50 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-white/30"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="border-white/10 text-muted-foreground">
              Cargo <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
            <Button variant="outline" className="border-white/10 text-muted-foreground">
              Status <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5">
                <th className="pb-3 text-sm font-semibold text-muted-foreground">Usuário</th>
                <th className="pb-3 text-sm font-semibold text-muted-foreground">Permissão</th>
                <th className="pb-3 text-sm font-semibold text-muted-foreground">Status</th>
                <th className="pb-3 text-sm font-semibold text-muted-foreground">Data de Entrada</th>
                <th className="pb-3 text-sm font-semibold text-muted-foreground text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-white">{user.name}</div>
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${user.role === 'Admin' ? 'bg-primary/20 text-white border border-white/20' : 'bg-white/5 text-muted-foreground'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-4">
                    <span className={`text-xs flex items-center gap-1 ${user.status === 'Ativo' ? 'text-green-400' : 'text-red-400'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'Ativo' ? 'bg-green-400' : 'bg-red-400'}`}></span>
                      {user.status}
                    </span>
                  </td>
                  <td className="py-4 text-muted-foreground text-sm">{user.joinDate}</td>
                  <td className="py-4 text-right">
                    <button className="p-2 hover:bg-white/10 rounded-lg text-muted-foreground hover:text-white transition-colors">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
