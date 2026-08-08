import { Users, DollarSign, BookOpen, Share2 } from "lucide-react";

export default function AdminDashboard() {
  const stats = [
    { name: "Total de Alunos", value: "0", icon: <Users className="w-5 h-5 text-white" />, trend: "N/D" },
    { name: "Faturamento (Mês)", value: "R$ 0,00", icon: <DollarSign className="w-5 h-5 text-white" />, trend: "N/D" },
    { name: "Cursos Ativos", value: "0", icon: <BookOpen className="w-5 h-5 text-white" />, trend: "N/D" },
    { name: "Afiliados Ativos", value: "0", icon: <Share2 className="w-5 h-5 text-white" />, trend: "N/D" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Visão Geral</h2>
        <p className="text-muted-foreground font-light">Acompanhe as métricas principais da plataforma.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="glass p-6 rounded-2xl border border-white/10 relative overflow-hidden group hover:border-white/30 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center neon-glow">
                {stat.icon}
              </div>
              <span className="text-xs font-bold px-2 py-1 rounded-full bg-white/10 text-white/50">
                {stat.trend}
              </span>
            </div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">{stat.name}</h3>
            <p className="text-3xl font-bold metallic-text">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass p-6 rounded-2xl border border-white/10 h-96 flex flex-col">
           <h3 className="text-lg font-bold mb-4">Faturamento Anual</h3>
           <div className="flex-1 rounded-xl bg-black/40 border border-white/5 flex items-center justify-center">
              <p className="text-muted-foreground">Dados insuficientes para gerar o gráfico</p>
           </div>
        </div>
        <div className="glass p-6 rounded-2xl border border-white/10 h-96 flex flex-col">
           <h3 className="text-lg font-bold mb-4">Últimas Matrículas</h3>
           <div className="flex-1 rounded-xl bg-black/40 border border-white/5 flex items-center justify-center">
              <p className="text-muted-foreground">Nenhuma matrícula recente</p>
           </div>
        </div>
      </div>
    </div>
  );
}
