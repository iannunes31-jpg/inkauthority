"use client";

import { FloatingMenu } from "@/components/FloatingMenu";
import { ChatWidget } from "@/components/ChatWidget";
import { useEffect, useState } from "react";

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <main className="relative min-h-screen w-full m-0 p-0 overflow-hidden bg-[#050505] pt-[72px]">
        {mounted && (
          <iframe 
            src="/index-nova.html?v=360" 
            className="w-full" 
            style={{ height: 'calc(100vh - 72px)', border: 'none' }}
            title="Ink Authority Landing Page"
          />
        )}
      </main>
      <FloatingMenu />
      <ChatWidget />
    </>
  );
}
