"use client";

import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Flame, Mail, Lock, Eye, EyeOff, Sparkles, Zap, AlertCircle, CheckCircle } from "lucide-react";
import { signInWithPassword, signInWithOtp } from "@/app/auth/actions"; // Caminho ajustado para ser absoluto
import Link from "next/link";
import { cn } from "@/shared/lib/utils";

interface LoginUIProps {
  message?: string;
}

// O componente agora é uma exportação nomeada e não mais o padrão
export function LoginUI({ message }: LoginUIProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("password");

  const handlePasswordLogin = async (formData: FormData) => {
    setIsLoading(true);
    try {
      await signInWithPassword(formData);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpLogin = async (formData: FormData) => {
    setIsLoading(true);
    try {
      await signInWithOtp(formData);
    } finally {
      setIsLoading(false);
    }
  };

  // Função para determinar se a mensagem é de sucesso ou erro
  const isSuccessMessage = (message: string) => {
    return message.toLowerCase().includes('check email') || 
           message.toLowerCase().includes('success') ||
           message.toLowerCase().includes('enviado');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-brand-black">
        {/* Animated Background Gradients */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-neon-green/10 rounded-full blur-3xl animate-pulse-neon"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-brand-neon-green/5 rounded-full blur-3xl animate-pulse-neon animation-delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-brand-neon-green/5 to-transparent rounded-full blur-2xl"></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,136,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,136,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-brand-neon-green/20 rounded-full blur-xl animate-glow-pulse"></div>
              <div className="relative bg-gradient-to-br from-brand-neon-green to-brand-neon-green-dark p-4 rounded-2xl">
                <Flame className="w-8 h-8 text-brand-black" />
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-gradient-neon">Creative</span>{" "}
            <span className="text-white">Gen</span>
          </h1>
          <p className="text-brand-gray-500 text-lg font-medium">
            Bem-vindo de volta à plataforma
          </p>
        </div>

        {/* Message Alert */}
        {message && (
          <div className={cn(
            "mb-6 p-4 rounded-lg border flex items-start space-x-3",
            isSuccessMessage(message) 
              ? "bg-emerald-900/20 border-emerald-500/30 text-emerald-300" 
              : "bg-red-900/20 border-red-500/30 text-red-300"
          )}>
            {isSuccessMessage(message) ? (
              <CheckCircle className="w-5 h-5 mt-0.5 text-emerald-400" />
            ) : (
              <AlertCircle className="w-5 h-5 mt-0.5 text-red-400" />
            )}
            <p className="text-sm leading-relaxed">{message}</p>
          </div>
        )}

        {/* Login Card */}
        <Card className="card-glass-intense border-brand-gray-700/50 shadow-2xl shadow-black/50">
          <CardHeader className="space-y-2 pb-6">
            <CardTitle className="text-2xl font-bold text-center text-white">
              Fazer Login
            </CardTitle>
            <CardDescription className="text-center text-brand-gray-500 text-base">
              Escolha seu método de autenticação preferido
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-brand-gray-800/50 border border-brand-gray-700/50 p-1 rounded-lg">
                <TabsTrigger 
                  value="password" 
                  className={cn(
                    "rounded-md transition-all duration-300",
                    activeTab === 'password' && 'btn-glass-active'
                  )}
                >
                  <Lock className={cn("w-4 h-4 mr-2 transition-colors", activeTab !== 'password' && "text-brand-gray-400")} />
                  Senha
                </TabsTrigger>
                <TabsTrigger 
                  value="magic" 
                  className={cn(
                    "rounded-md transition-all duration-300",
                    activeTab === 'magic' && 'btn-glass-active'
                  )}
                >
                  <Zap className={cn("w-4 h-4 mr-2 transition-colors", activeTab !== 'magic' && "text-brand-gray-400")} />
                  Magic Link
                </TabsTrigger>
              </TabsList>

              {/* Password Login */}
              <TabsContent value="password" className="space-y-6">
                <form action={handlePasswordLogin} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white font-medium text-sm">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-brand-gray-500" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        placeholder="seu@email.com"
                        className="input-glass pl-11 h-12 text-white placeholder:text-brand-gray-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-white font-medium text-sm">
                      Senha
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-brand-gray-500" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="••••••••"
                        className="input-glass pl-11 pr-11 h-12 text-white placeholder:text-brand-gray-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-brand-gray-500 hover:text-brand-neon-green transition-colors duration-200"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="btn-neon w-full h-12 text-base font-semibold"
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="w-5 h-5 border-2 border-brand-black/20 border-t-brand-black rounded-full animate-spin mr-2"></div>
                        Entrando...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Lock className="w-5 h-5 mr-2" />
                        Entrar com Senha
                      </div>
                    )}
                  </Button>
                </form>
              </TabsContent>

              {/* Magic Link Login */}
              <TabsContent value="magic" className="space-y-6">
                <div className="text-center py-2">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-brand-neon-green/20 to-brand-neon-green/10 rounded-2xl mb-4">
                    <Sparkles className="w-8 h-8 text-brand-neon-green" />
                  </div>
                  <p className="text-brand-gray-400 text-sm leading-relaxed">
                    Receba um link mágico no seu email para fazer login sem senha
                  </p>
                </div>

                <form action={handleOtpLogin} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="magic-email" className="text-white font-medium text-sm">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-brand-gray-500" />
                      <Input
                        id="magic-email"
                        name="email"
                        type="email"
                        required
                        placeholder="seu@email.com"
                        className="input-glass pl-11 h-12 text-white placeholder:text-brand-gray-500"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="btn-outline-neon w-full h-12 text-base font-semibold"
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="w-5 h-5 border-2 border-brand-neon-green/20 border-t-brand-neon-green rounded-full animate-spin mr-2"></div>
                        Enviando...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Zap className="w-5 h-5 mr-2" />
                        Enviar Magic Link
                      </div>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-brand-gray-700"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-brand-gray-900 px-4 text-brand-gray-500 font-medium">
                  Não tem conta?
                </span>
              </div>
            </div>

            {/* Sign Up Link */}
            <div className="text-center">
              <Link
                href="/auth/signup"
                className="inline-flex items-center text-brand-neon-green hover:text-brand-neon-green-light transition-colors duration-200 font-medium"
              >
                Criar nova conta
                <Sparkles className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-brand-gray-600 text-sm">
            © 2024 Creative Gen. Tecnologia de ponta para criação de conteúdo.
          </p>
        </div>
      </div>
    </div>
  );
} 