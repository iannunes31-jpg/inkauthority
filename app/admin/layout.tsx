import { AdminSidebar } from "@/components/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <div className="pl-64">
        {/* Topbar inside the main content area */}
        <header className="h-20 border-b border-white/5 glass sticky top-0 z-30 flex items-center justify-between px-8">
          <h1 className="text-lg font-bold metallic-text">Dashboard Administrativo</h1>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-semibold">Yuri Admin</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Super Admin</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center neon-glow">
              <span className="font-bold">Y</span>
            </div>
          </div>
        </header>

        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
