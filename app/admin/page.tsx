import { Users, DollarSign, BookOpen, Share2 } from "lucide-react";

export default function AdminDashboard() {
  const stats = [
    { name: "Total de Alunos", value: "1,248", icon: <Users className="w-5 h-5 text-white" />, trend: "+12%" },
    { name: "Faturamento (Mês)", value: "R$ 48.200", icon: <DollarSign className="w-5 h-5 text-white" />, trend: "+8%" },
    { name: "Cursos Ativos", value: "12", icon: <BookOpen className="w-5 h-5 text-white" />, trend: "0%" },
    { name: "Afiliados Ativos", value: "64", icon: <Share2 className="w-5 h-5 text-white" />, trend: "+24%" },
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
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${stat.trend.startsWith("+") ? "bg-green-500/20 text-green-400" : "bg-white/10 text-white"}`}>
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
              <p className="text-muted-foreground">Gráfico de Faturamento será renderizado aqui</p>
           </div>
        </div>
        <div className="glass p-6 rounded-2xl border border-white/10 h-96 flex flex-col">
           <h3 className="text-lg font-bold mb-4">Últimas Matrículas</h3>
           <div className="flex-1 rounded-xl bg-black/40 border border-white/5 flex items-center justify-center">
              <p className="text-muted-foreground">Lista de alunos recentes</p>
           </div>
        </div>
      </div>
    </div>
  );
}
