"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, Video, Search, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";

export default function AdminCourses() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const courses: any[] = [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-1">Cursos & Módulos</h2>
          <p className="text-muted-foreground font-light">Gerencie os conteúdos, faça upload de vídeos e crie módulos.</p>
        </div>
        <Link href="/admin/courses/new">
          <Button className="metallic-gradient text-black font-bold">
            <Plus className="w-4 h-4 mr-2" />
            Nova Aula
          </Button>
        </Link>
      </div>

      <div className="glass p-6 rounded-2xl border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text"
              placeholder="Buscar curso..."
              className="w-full bg-black/50 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-white/30"
            />
          </div>
          <Button variant="outline" className="border-white/10 text-muted-foreground">
            Filtrar <ChevronDown className="w-4 h-4 ml-2" />
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5">
                <th className="pb-3 text-sm font-semibold text-muted-foreground">Título do Curso</th>
                <th className="pb-3 text-sm font-semibold text-muted-foreground">Módulos/Aulas</th>
                <th className="pb-3 text-sm font-semibold text-muted-foreground">Alunos</th>
                <th className="pb-3 text-sm font-semibold text-muted-foreground">Status</th>
                <th className="pb-3 text-sm font-semibold text-muted-foreground text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {courses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted-foreground">
                    <Video className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>Nenhuma aula ou curso cadastrado ainda.</p>
                  </td>
                </tr>
              ) : (
                courses.map((course) => (
                  <tr key={course.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-black/50 border border-white/10 flex items-center justify-center">
                          <Video className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <span className="font-medium text-white">{course.title}</span>
                      </div>
                    </td>
                    <td className="py-4 text-muted-foreground text-sm">{course.modules} Módulos</td>
                    <td className="py-4 text-muted-foreground text-sm">{course.students}</td>
                    <td className="py-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${course.status === 'Publicado' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                        {course.status}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 hover:bg-white/10 rounded-lg text-muted-foreground hover:text-white transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button className="p-2 hover:bg-destructive/20 rounded-lg text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
