"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";
import { FloatingMenu } from "./FloatingMenu";
import { ChatWidget } from "./ChatWidget";

const STANDALONE_ROUTES = ["/criar", "/c/"];

export default function ConditionalNav() {
  const path = usePathname();
  const isStandalone = STANDALONE_ROUTES.some((r) => path === r || path.startsWith(r));
  if (isStandalone) return null;
  return (
    <>
      <Navbar />
      <FloatingMenu />
      <ChatWidget />
    </>
  );
}
