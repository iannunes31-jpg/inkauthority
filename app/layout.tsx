import type {Metadata} from 'next';
import { Inter, Orbitron } from 'next/font/google';
import ConditionalNav from '@/components/ConditionalNav';
import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import './globals.css';

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const orbitron = Orbitron({ subsets: ["latin"], variable: "--font-orbitron" });

export const metadata: Metadata = {
  title: "Ink Authority",
  description: "High-end tattoo education platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="pt-BR">
        <body className={`${inter.variable} ${orbitron.variable} font-sans antialiased min-h-screen bg-background text-foreground`} suppressHydrationWarning>
          <ConditionalNav />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
