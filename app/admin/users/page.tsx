"use client";

import { useEffect, useState } from "react";
import { Search, ChevronDown, User, ShieldAlert, ShieldCheck, ShieldOff, MoreHorizontal, Download, X, Phone, Instagram, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [togglingAdmin, setTogglingAdmin] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch("/api/users");
        if (res.ok) {
          const data = await res.json();
          setUsers(data);
        }
      } catch (error) {
        console.error("Erro ao carregar usuários", error);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  // Aluno (no role), Testador (uses everything + admin panel) or Admin. Only admins can change it.
  const ROLE_VALUE: Record<string, string | null> = { Aluno: null, Testador: "tester", Admin: "admin" };
  const handleSetRole = async (user: any, role: string) => {
    if (role === user.role) return;
    if (role === "Admin" && !confirm(`Dar acesso de ADMIN completo para ${user.name}? Admin pode mudar cargos e ver o painel de Segurança.`)) return;
    setTogglingAdmin(user.id);
    try {
      const res = await fetch('/api/admin/set-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, role: ROLE_VALUE[role] }),
      });
      const body = await res.json().catch(() => ({}));
      if (res.ok) {
        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role } : u));
        setSelectedUser((sel: any) => (sel && sel.id === user.id ? { ...sel, role } : sel));
      } else {
        alert(body.error === 'Forbidden' ? 'Só administradores podem mudar cargos.' : body.error || 'Não foi possível mudar o cargo.');
      }
    } catch {}
    setTogglingAdmin(null);
  };

  const downloadCSV = () => {
    if (users.length === 0) return;

    const headers = ["ID", "Nome", "Email", "Permissão", "Status", "Data de Entrada", "Telefone", "Instagram"];
    const csvRows = [headers.join(",")];

    for (const user of users) {
      const row = [
        user.id,
        `"${user.name}"`,
        `"${user.email}"`,
        `"${user.role}"`,
        `"${user.status}"`,
        `"${user.joinDate}"`,
        `"${user.telefone || ''}"`,
        `"${user.instagram || ''}"`
      ];
      csvRows.push(row.join(","));
    }

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `usuarios_inkauthority_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold mb-1">Gestão de Usuários</h2>
          <p className="text-muted-foreground font-light">Controle os acessos, permissões e histórico de todos os usuários da plataforma.</p>
        </div>
        <Button onClick={downloadCSV} disabled={users.length === 0} className="metallic-gradient text-black font-bold">
          <Download className="w-4 h-4 mr-2" />
          Exportar CSV
        </Button>
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
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted-foreground">
                    <p>Carregando usuários...</p>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted-foreground">
                    <User className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>Nenhum usuário cadastrado ainda.</p>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr 
                    key={user.id} 
                    onClick={() => setSelectedUser(user)}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors group cursor-pointer"
                  >
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        {user.imageUrl ? (
                          <img src={user.imageUrl} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                            <User className="w-4 h-4 text-white" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-white">{user.name}</div>
                          <div className="text-xs text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${user.role === 'Admin' ? 'bg-primary/20 text-white border border-white/20' : user.role === 'Testador' ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30' : 'bg-white/5 text-muted-foreground'}`}>
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
                      <div onClick={(e) => e.stopPropagation()}>
                        <Select
                          value={user.role}
                          onChange={(e) => handleSetRole(user, e.target.value)}
                          disabled={togglingAdmin === user.id}
                          className="w-36 text-xs py-1.5 ml-auto"
                          aria-label="Cargo"
                        >
                          <option value="Aluno">Aluno</option>
                          <option value="Testador">Testador</option>
                          <option value="Admin">Admin</option>
                        </Select>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Detalhes do Usuário */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-md relative shadow-2xl">
            <button 
              onClick={() => setSelectedUser(null)}
              className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-white hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex flex-col items-center mb-6">
              {selectedUser.imageUrl ? (
                <img src={selectedUser.imageUrl} alt={selectedUser.name} className="w-24 h-24 rounded-full object-cover mb-4 border-2 border-white/10" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center mb-4 border-2 border-white/10">
                  <User className="w-10 h-10 text-white" />
                </div>
              )}
              <h3 className="text-xl font-bold text-white">{selectedUser.name}</h3>
              <p className="text-sm text-muted-foreground">{selectedUser.role} • Entrou em {selectedUser.joinDate}</p>
            </div>
            
            <div className="space-y-4 bg-black/50 p-4 rounded-xl border border-white/5">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-medium text-white">{selectedUser.email}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">WhatsApp / Telefone</p>
                  <p className="text-sm font-medium text-white">{selectedUser.telefone}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Instagram className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Instagram</p>
                  <a href={selectedUser.instagram?.includes('http') ? selectedUser.instagram : `https://instagram.com/${selectedUser.instagram?.replace('@', '')}`} target="_blank" rel="noreferrer" className="text-sm font-medium text-primary hover:underline">
                    {selectedUser.instagram}
                  </a>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex gap-3">
              <div className="flex-1">
                <Select
                          value={selectedUser.role}
                          onChange={(e) => handleSetRole(selectedUser, e.target.value)}
                          disabled={togglingAdmin === selectedUser.id}
                          className="w-full text-sm"
                          aria-label="Cargo"
                        >
                          <option value="Aluno">Aluno</option>
                          <option value="Testador">Testador</option>
                          <option value="Admin">Admin</option>
                        </Select>
              </div>
              <Button className="flex-1 metallic-gradient text-black font-bold">Enviar Mensagem</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
