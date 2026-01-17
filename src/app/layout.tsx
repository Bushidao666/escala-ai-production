import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/widgets/sidebar/ui/sidebar";
import { Toaster } from "@/shared/ui/sonner";
import { cn } from "@/shared/lib/utils";
import { createClient } from "@/shared/infra/supabase/server";
import { AnimatedBackground } from '@/shared/ui/animated-background';
import { headers } from 'next/headers';
import { SpeedInsights } from "@vercel/speed-insights/next"
import { RealtimeStatusIndicator } from '@/shared/ui/RealtimeStatusIndicator';
import { ThemeProvider } from "next-themes";

const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ["latin"], 
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Creative Gen - AI Creative Studio",
  description: "Plataforma de geração de criativos com inteligência artificial. Crie conteúdo visual profissional em segundos.",
  keywords: ["AI", "creative", "generator", "marketing", "design", "automation"],
  authors: [{ name: "Creative Gen Team" }],
  creator: "Creative Gen",
  publisher: "Creative Gen",
  robots: "index, follow",
  openGraph: {
    title: "Creative Gen - AI Creative Studio",
    description: "Plataforma de geração de criativos com inteligência artificial",
    type: "website",
    locale: "pt_BR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Creative Gen - AI Creative Studio",
    description: "Plataforma de geração de criativos com inteligência artificial",
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: "#00ff88",
  colorScheme: "dark",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const headerStore = await headers();
  const pathname = headerStore.get('next-url') || '';

  const showSidebar = !!session && pathname !== '/';

  return (
    <html lang="pt-BR" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className={cn(
          "min-h-screen w-full bg-brand-black font-sans antialiased overflow-x-hidden",
          inter.variable,
          jetbrainsMono.variable
        )}
      >
        <div className="relative flex min-h-screen">
          <AnimatedBackground />
          {showSidebar ? (
            <>
              <Sidebar />
              <main className="flex-1 overflow-auto">
                <div className="min-h-screen">
                  {children}
                </div>
              </main>
            </>
          ) : (
            <main className="w-full">
              {children}
            </main>
          )}
        </div>

        {/* Toast Notifications */}
        <Toaster 
          position="top-right"
          toastOptions={{
            className: "glass-intense border-brand-gray-700/50 text-white",
            style: {
              background: "rgba(26, 26, 26, 0.85)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              backdropFilter: "blur(16px)",
            },
          }}
        />

        {/* Performance Optimization Scripts */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Preload critical fonts
              if ('fonts' in document) {
                document.fonts.load('400 16px Inter');
                document.fonts.load('500 16px Inter');
                document.fonts.load('600 16px Inter');
                document.fonts.load('700 16px Inter');
              }
              
              // Optimize smooth scrolling
              if ('scrollBehavior' in document.documentElement.style) {
                document.documentElement.style.scrollBehavior = 'smooth';
              }
            `,
          }}
        />

        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster />
          <SpeedInsights/>
          <RealtimeStatusIndicator />
        </ThemeProvider>
      </body>
    </html>
  );
}
