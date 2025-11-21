"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/shared/ui/button";
import { 
  Flame, 
  Home, 
  Plus, 
  Clock, 
  Settings, 
  LogOut, 
  Sparkles,
  Zap,
  Image,
  User,
  ChevronRight,
  ChevronLeft,
  Menu
} from "lucide-react";
import { signOut } from "@/app/auth/actions";
import { createClient } from "@/shared/infra/supabase/client";
import React, { useState, useEffect } from "react";
import { cn } from "@/shared/lib/utils";

const navigation = [
  {
    name: "Home",
    href: "/",
    icon: Home,
    description: "Página inicial"
  },
  {
    name: "Galeria",
    href: "/gallery",
    icon: Image,
    description: "Explore seus criativos"
  },
  {
    name: "Novo Criativo",
    href: "/new",
    icon: Plus,
    description: "Criar novo conteúdo"
  },
  {
    name: "Fila de Processamento",
    href: "/queue",
    icon: Clock,
    description: "Acompanhar progresso"
  },
  {
    name: "Configurações",
    href: "/settings",
    icon: Settings,
    description: "Ajustar preferências"
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<{ name: string, email: string } | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data, error } = await supabase.auth.getUser();

      if (data.user) {
        const userName = data.user.user_metadata?.name || data.user.email?.split('@')[0] || "Usuário";
        setUser({
          name: userName,
          email: data.user.email || "Nenhum email",
        });
      }
    };
    fetchUser();
  }, []);

  const handleSignOut = async () => {
    await signOut();
  };

  const toggleMinimized = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <div className={cn(
      "sidebar-glass flex flex-col h-screen sticky top-0 bg-brand-black/60 border-r border-brand-gray-800/60 backdrop-blur-xl transition-all duration-300 ease-in-out shadow-2xl shadow-black/20 overflow-hidden overflow-x-hidden",
      isMinimized ? "w-20 min-w-20" : "w-80 min-w-80"
    )}>
      {/* Header */}
      <div className={cn(
        "border-b border-brand-gray-800/40 backdrop-blur-sm",
        isMinimized ? "p-4" : "p-6"
      )}>
        {isMinimized ? (
          /* Minimized Header Layout */
          <div className="flex flex-col items-center space-y-4">
            <div className="relative group">
              <div className="absolute inset-0 bg-brand-neon-green/30 rounded-2xl blur-xl animate-glow-pulse group-hover:bg-brand-neon-green/40 transition-colors duration-300"></div>
              <div className="relative bg-gradient-to-br from-brand-neon-green via-brand-neon-green to-brand-neon-green-dark p-3 rounded-2xl shadow-lg shadow-brand-neon-green/25 border border-brand-neon-green/20 group-hover:scale-105 transition-transform duration-200">
                <Flame className="w-6 h-6 text-brand-black drop-shadow-sm" />
              </div>
            </div>
            
            {/* User Indicator for Minimized State */}
            <div className="relative group">
              <div className="w-10 h-10 bg-gradient-to-br from-white/10 via-white/5 to-transparent rounded-xl flex items-center justify-center border border-white/20 shadow-lg shadow-black/10 hover:bg-white/15 hover:border-white/30 transition-all duration-200 hover:scale-105 cursor-pointer">
                <User className="w-5 h-5 text-brand-neon-green" />
              </div>
              {/* Tooltip for user info */}
              <div className="fixed left-24 top-1/2 transform -translate-y-1/2 bg-brand-black/95 text-white text-sm rounded-xl px-4 py-3 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-300 backdrop-blur-xl border border-brand-gray-600/60 shadow-2xl shadow-black/40 z-[9999] min-w-max">
                <div className="relative">
                  <p className="font-semibold text-white">{user ? user.name : "Carregando..."}</p>
                  <p className="text-xs text-brand-gray-400 mt-1">Usuário do sistema</p>
                </div>
                {/* Mini-modal arrow */}
                <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-8 border-transparent border-r-brand-black/95"></div>
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-brand-neon-green/10 to-transparent rounded-xl opacity-50"></div>
              </div>
            </div>
            
            {/* Toggle Button for Minimized State */}
            <Button
              onClick={toggleMinimized}
              size="sm"
              variant="ghost"
              className="text-brand-gray-400 hover:text-white hover:bg-white/15 p-2.5 rounded-xl w-10 h-10 transition-all duration-200 hover:scale-105 border border-transparent hover:border-white/20 shadow-sm hover:shadow-lg hover:shadow-black/20"
              title="Expandir sidebar"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          /* Expanded Header Layout */
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative group">
                <div className="absolute inset-0 bg-brand-neon-green/30 rounded-2xl blur-xl animate-glow-pulse group-hover:bg-brand-neon-green/40 transition-colors duration-300"></div>
                <div className="relative bg-gradient-to-br from-brand-neon-green via-brand-neon-green to-brand-neon-green-dark p-3.5 rounded-2xl shadow-lg shadow-brand-neon-green/25 border border-brand-neon-green/20">
                  <Flame className="w-7 h-7 text-brand-black drop-shadow-sm" />
                </div>
              </div>
              <div className="space-y-1">
                <h1 className="text-xl font-bold leading-none">
                  <span className="text-gradient-neon">Creative</span>{" "}
                  <span className="text-white">Gen</span>
                </h1>
                <p className="text-brand-gray-400 text-sm font-medium leading-none">
                  AI Creative Studio
                </p>
              </div>
            </div>
            
            {/* Toggle Button for Expanded State */}
            <Button
              onClick={toggleMinimized}
              size="sm"
              variant="ghost"
              className="text-brand-gray-400 hover:text-white hover:bg-white/10 p-2.5 rounded-xl transition-all duration-200 hover:scale-105"
              title="Minimizar sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* User Profile Section */}
      {!isMinimized && (
        <div className="p-6 border-b border-brand-gray-800/40">
          <div className="relative overflow-hidden p-5 rounded-2xl bg-gradient-to-br from-white/8 via-white/4 to-transparent border border-white/10 shadow-lg shadow-black/10 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-neon-green/5 to-transparent"></div>
            <div className="relative flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-0 bg-brand-neon-green/20 rounded-xl blur-md"></div>
                <div className="relative w-12 h-12 bg-gradient-to-br from-brand-neon-green/30 to-brand-neon-green/10 rounded-xl flex items-center justify-center border border-brand-neon-green/30 shadow-lg shadow-brand-neon-green/10">
                  <User className="w-6 h-6 text-brand-neon-green" />
                </div>
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <p className="text-sm font-semibold text-white truncate leading-none">
                  {user ? user.name : "Carregando..."}
                </p>
                <p className="text-xs text-brand-gray-400 truncate leading-none">
                  {user ? user.email : "..."}
                </p>
              </div>
              <div className="flex items-center space-x-1.5 bg-brand-neon-green/10 px-2.5 py-1.5 rounded-lg border border-brand-neon-green/20">
                <Sparkles className="w-3.5 h-3.5 text-brand-neon-green" />
                <span className="text-xs font-semibold text-brand-neon-green">PRO</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className={cn(
        "flex-1 overflow-y-auto",
        isMinimized ? "p-4" : "p-5"
      )}>
        <div className={cn(
          isMinimized ? "space-y-3" : "space-y-2"
        )}>
          {!isMinimized && (
            <h2 className="text-xs font-bold text-brand-gray-500 uppercase tracking-wider mb-4 px-3">
              Navegação
            </h2>
          )}
          
          {/* Minimized navigation title indicator */}
          {isMinimized && (
            <div className="flex justify-center mb-2">
              <div className="w-8 h-0.5 bg-gradient-to-r from-transparent via-brand-gray-600 to-transparent rounded-full"></div>
            </div>
          )}
          
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <div key={item.name} className="relative group">
                <Link
                  href={item.href}
                  className={cn(
                    "relative flex items-center justify-center rounded-xl transition-all duration-200 ease-out hover:scale-105 active:scale-95",
                    "hover:bg-white/12 hover:shadow-lg hover:shadow-black/10",
                    isActive 
                      ? "bg-gradient-to-br from-white/15 to-white/8 shadow-lg shadow-black/20 border border-white/15" 
                      : "hover:border hover:border-white/10",
                    isMinimized ? "w-12 h-12 mx-auto" : "p-4"
                  )}
                >
                  {/* Active background glow */}
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-neon-green/15 to-brand-neon-green/5 rounded-xl blur-sm"></div>
                  )}
                  
                  <div className={cn(
                    "relative flex items-center",
                    isMinimized ? "justify-center" : "space-x-4 flex-1"
                  )}>
                    <div className={cn(
                      "relative rounded-lg transition-all duration-300 border shadow-sm",
                      isMinimized ? "p-2" : "p-2.5",
                      isActive 
                        ? "bg-gradient-to-br from-brand-neon-green/25 to-brand-neon-green/15 border-brand-neon-green/50 text-brand-neon-green shadow-brand-neon-green/25" 
                        : "bg-brand-gray-800/70 border-brand-gray-700/70 text-brand-gray-400 group-hover:bg-brand-gray-700/90 group-hover:border-brand-gray-600/90 group-hover:text-white"
                    )}>
                      {isActive && (
                        <div className="absolute inset-0 bg-brand-neon-green/15 rounded-lg blur-sm"></div>
                      )}
                      <Icon className="relative w-5 h-5" />
                    </div>
                    
                    {!isMinimized && (
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "text-sm font-medium transition-colors duration-200 leading-none",
                          isActive ? "text-white" : "text-brand-gray-300 group-hover:text-white"
                        )}>
                          {item.name}
                        </p>
                        <p className={cn(
                          "text-xs transition-colors duration-200 leading-none mt-1",
                          isActive ? "text-brand-gray-400" : "text-brand-gray-500 group-hover:text-brand-gray-400"
                        )}>
                          {item.description}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {/* Active indicator dots */}
                  {isActive && !isMinimized && (
                    <div className="relative w-2 h-2 rounded-full bg-brand-neon-green shadow-lg shadow-brand-neon-green/50">
                      <div className="absolute inset-0 bg-brand-neon-green rounded-full animate-ping opacity-30"></div>
                    </div>
                  )}
                  
                  {/* Active indicator for minimized state - symmetric design */}
                  {isActive && isMinimized && (
                    <>
                      {/* Right active bar */}
                      <div className="absolute -right-1.5 top-1/2 transform -translate-y-1/2 w-1 h-8 rounded-full bg-brand-neon-green shadow-lg shadow-brand-neon-green/70">
                        <div className="absolute inset-0 bg-brand-neon-green rounded-full blur-sm opacity-60 animate-pulse"></div>
                      </div>
                      {/* Left subtle indicator */}
                      <div className="absolute -left-1.5 top-1/2 transform -translate-y-1/2 w-0.5 h-6 rounded-full bg-brand-neon-green/70"></div>
                    </>
                  )}
                </Link>
                
                {/* Enhanced Mini-Modal Tooltip for minimized state */}
                {isMinimized && (
                  <div className="fixed left-24 top-1/2 transform -translate-y-1/2 bg-brand-black/95 text-white rounded-xl px-5 py-4 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-300 backdrop-blur-xl border border-brand-gray-600/60 shadow-2xl shadow-black/40 z-[9999] min-w-max">
                    <div className="relative space-y-2">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-brand-neon-green/20 to-brand-neon-green/10 border border-brand-neon-green/30">
                          <Icon className="w-4 h-4 text-brand-neon-green" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{item.name}</p>
                          <p className="text-xs text-brand-gray-400">{item.description}</p>
                        </div>
                      </div>
                      {/* Status indicator */}
                      {isActive && (
                        <div className="flex items-center space-x-2 text-xs">
                          <div className="w-2 h-2 rounded-full bg-brand-neon-green animate-pulse"></div>
                          <span className="text-brand-neon-green font-medium">Página atual</span>
                        </div>
                      )}
                    </div>
                    {/* Mini-modal arrow */}
                    <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-8 border-transparent border-r-brand-black/95"></div>
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-neon-green/10 to-transparent rounded-xl opacity-50"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className={cn(
        "border-t border-brand-gray-800/40",
        isMinimized ? "p-4" : "p-5"
      )}>
        <div className="relative group">
          <form action={handleSignOut} className="w-full">
            <Button 
              type="submit"
              className={cn(
                "group relative overflow-hidden text-red-400 border border-red-500/20 bg-red-500/5 hover:bg-red-500/15 hover:border-red-500/40 hover:text-red-300 transition-all duration-200 rounded-xl shadow-sm hover:shadow-lg hover:shadow-red-500/15 hover:scale-105 active:scale-95",
                isMinimized ? "w-12 h-12 mx-auto p-0" : "w-full p-4"
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              <div className={cn(
                "relative flex items-center",
                isMinimized ? "justify-center" : "justify-center space-x-3"
              )}>
                <LogOut className="w-4 h-4" />
                {!isMinimized && <span className="font-medium">Sair da Conta</span>}
              </div>
            </Button>
          </form>
          
          {/* Enhanced Mini-Modal Tooltip for logout button when minimized */}
          {isMinimized && (
            <div className="fixed left-24 top-1/2 transform -translate-y-1/2 bg-red-900/95 backdrop-blur-xl text-red-200 rounded-xl px-5 py-4 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-300 border border-red-500/40 shadow-2xl shadow-red-900/40 z-[9999] min-w-max">
              <div className="relative space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-red-500/30 to-red-500/20 border border-red-500/40">
                    <LogOut className="w-4 h-4 text-red-300" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-red-200">Sair da Conta</p>
                    <p className="text-xs text-red-400">Encerrar sessão atual</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-xs">
                  <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></div>
                  <span className="text-red-400 font-medium">Ação irreversível</span>
                </div>
              </div>
              {/* Mini-modal arrow */}
              <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-8 border-transparent border-r-red-900/95"></div>
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/15 to-transparent rounded-xl opacity-60"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 