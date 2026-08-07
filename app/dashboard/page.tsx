"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { PlayCircle, Clock, Trophy, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tighter">Welcome back, Student.</h1>
        <p className="text-muted-foreground font-light">Continue your journey to tattoo excellence.</p>
      </div>

      {/* Continue Watching (Highlight) */}
      <section className="mb-16">
        <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-6">Continue Learning</h2>
        
        <div className="relative rounded-2xl overflow-hidden glass p-1">
          <div className="relative rounded-xl overflow-hidden bg-card group">
            <div className="absolute inset-0">
               <Image 
                 src="https://picsum.photos/seed/realism/1200/600" 
                 alt="Current Course"
                 fill
                 className="object-cover opacity-60 grayscale group-hover:grayscale-0 mix-blend-luminosity group-hover:mix-blend-normal transition-all duration-700"
                 referrerPolicy="no-referrer"
               />
               <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
            </div>
            
            <div className="relative z-10 p-8 md:p-12 flex flex-col justify-end min-h-[400px]">
               <div className="mb-4">
                 <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded text-[10px] uppercase font-bold tracking-widest text-white inline-block">Module 4</span>
               </div>
               <h3 className="text-3xl md:text-5xl font-bold mb-4 max-w-2xl tracking-tighter">Complex Textures in Black & Grey</h3>
               <p className="text-muted-foreground max-w-xl mb-8 font-light">Learn to create the illusion of different skin textures, hair, and fabrics using advanced shading techniques.</p>
               
               <div className="flex flex-col sm:flex-row items-center gap-6">
                 <Link href="/courses/1">
                   <Button size="lg" className="h-14 px-8 w-full sm:w-auto text-[12px] uppercase tracking-wider font-bold rounded-full group/btn">
                     Resume Lesson
                   </Button>
                 </Link>
                 
                 <div className="flex items-center gap-4 w-full sm:w-auto mt-4 sm:mt-0">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Progress</span>
                    <div className="w-full sm:w-48 h-1 bg-white/5 rounded-full overflow-hidden">
                       <div className="h-full bg-primary rounded-full neon-glow" style={{ width: '64%' }} />
                    </div>
                    <span className="text-white font-mono font-bold text-sm">64%</span>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enrolled Courses */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Your Courses</h2>
          <Button variant="ghost" size="sm" className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
            View All <ChevronRight className="ml-1 w-3 h-3" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[
            { id: 1, title: "Mastering Realism: The Complete Guide", author: "Isabela Badini", progress: 64, totalTime: "12h", tag: "Realism" },
            { id: 2, title: "Color Theory for Tattoo Artists", author: "Diego Silva", progress: 20, totalTime: "8h", tag: "Colors" },
            { id: 3, title: "Fineline Secrets", author: "Amanda Alves", progress: 100, totalTime: "5h", tag: "Fineline" }
          ].map((course, i) => (
            <motion.div 
              key={course.id}
              whileHover={{ y: -5 }}
              className="glass rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-300 flex flex-col"
            >
              <div className="aspect-video relative overflow-hidden bg-card group">
                <Image 
                  src={`https://picsum.photos/seed/course${course.id}/600/400`}
                  alt={course.title}
                  fill
                  className="object-cover opacity-60 grayscale group-hover:grayscale-0 mix-blend-luminosity group-hover:mix-blend-normal transition-all duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute top-3 left-3 px-2 py-1 bg-white/10 backdrop-blur-md rounded text-[8px] font-bold uppercase tracking-wider text-white">
                  {course.tag}
                </div>
                
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 backdrop-blur-[2px]">
                  <Link href={`/courses/${course.id}`}>
                    <Button variant="default" className="rounded-full w-12 h-12 p-0 shadow-lg neon-glow">
                      <PlayCircle className="w-5 h-5 ml-0.5" />
                    </Button>
                  </Link>
                </div>
              </div>
              
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-lg mb-1 line-clamp-1">{course.title}</h3>
                <p className="text-[11px] font-light text-muted-foreground mb-4">By {course.author}</p>
                
                <div className="mt-auto space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Progress</span>
                    <span className="text-white font-mono font-bold text-xs">{course.progress}%</span>
                  </div>
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full rounded-full transition-all duration-1000",
                        course.progress === 100 ? "bg-white" : "bg-primary neon-glow"
                      )} 
                      style={{ width: `${course.progress}%` }} 
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
