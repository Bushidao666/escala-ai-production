"use client";

import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Flame, Mail, Lock, Eye, EyeOff, Sparkles, UserPlus, CheckCircle } from "lucide-react";
import { signUp } from "@/modules/auth/application/actions";
import Link from "next/link";

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSignup = async (formData: FormData) => {
    setIsLoading(true);
    try {
      await signUp(formData);
    } finally {
      setIsLoading(false);
    }
  };

  const passwordsMatch = password === confirmPassword && password.length > 0;
  const passwordStrength = getPasswordStrength(password);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-brand-black">
        {/* Animated Background Gradients */}
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-brand-neon-green/8 rounded-full blur-3xl animate-pulse-neon"></div>
        <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-brand-neon-green/5 rounded-full blur-3xl animate-pulse-neon animation-delay-1500"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-radial from-brand-neon-green/4 to-transparent rounded-full blur-2xl"></div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,136,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,136,0.02)_1px,transparent_1px)] bg-[size:60px_60px]"></div>
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
            Junte-se à revolução criativa
          </p>
        </div>

        {/* Signup Card */}
        <Card className="card-glass-intense border-brand-gray-700/50 shadow-2xl shadow-black/50">
          <CardHeader className="space-y-2 pb-6">
            <CardTitle className="text-2xl font-bold text-center text-white">
              Criar Conta
            </CardTitle>
            <CardDescription className="text-center text-brand-gray-500 text-base">
              Comece sua jornada de criação de conteúdo
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form action={handleSignup} className="space-y-5">
              {/* Email Field */}
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

              {/* Password Field */}
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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

                {/* Password Strength Indicator */}
                {password.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-brand-gray-500">Força da senha</span>
                      <span className={`font-medium ${getPasswordStrengthColor(passwordStrength)}`}>
                        {getPasswordStrengthText(passwordStrength)}
                      </span>
                    </div>
                    <div className="w-full bg-brand-gray-800 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthBarColor(passwordStrength)}`}
                        style={{ width: `${(passwordStrength / 4) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-white font-medium text-sm">
                  Confirmar Senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-brand-gray-500" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-glass pl-11 pr-11 h-12 text-white placeholder:text-brand-gray-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-brand-gray-500 hover:text-brand-neon-green transition-colors duration-200"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {/* Password Match Indicator */}
                {confirmPassword.length > 0 && (
                  <div className="flex items-center text-xs mt-2">
                    {passwordsMatch ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-brand-neon-green mr-2" />
                        <span className="text-brand-neon-green">Senhas coincidem</span>
                      </>
                    ) : (
                      <>
                        <div className="w-4 h-4 rounded-full border-2 border-red-500 mr-2"></div>
                        <span className="text-red-400">Senhas não coincidem</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading || !passwordsMatch || passwordStrength < 2}
                className="btn-neon w-full h-12 text-base font-semibold mt-6"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="w-5 h-5 border-2 border-brand-black/20 border-t-brand-black rounded-full animate-spin mr-2"></div>
                    Criando conta...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <UserPlus className="w-5 h-5 mr-2" />
                    Criar Conta
                  </div>
                )}
              </Button>
            </form>

            {/* Terms */}
            <div className="mt-6 text-center">
              <p className="text-brand-gray-500 text-xs leading-relaxed">
                Ao criar uma conta, você concorda com nossos{" "}
                <a href="#" className="text-brand-neon-green hover:text-brand-neon-green-light transition-colors duration-200">
                  Termos de Serviço
                </a>{" "}
                e{" "}
                <a href="#" className="text-brand-neon-green hover:text-brand-neon-green-light transition-colors duration-200">
                  Política de Privacidade
                </a>
              </p>
            </div>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-brand-gray-700"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-brand-gray-900 px-4 text-brand-gray-500 font-medium">
                  Já tem conta?
                </span>
              </div>
            </div>

            {/* Login Link */}
            <div className="text-center">
              <Link
                href="/auth/login"
                className="inline-flex items-center text-brand-neon-green hover:text-brand-neon-green-light transition-colors duration-200 font-medium"
              >
                Fazer login
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

// Helper functions for password strength
function getPasswordStrength(password: string): number {
  let strength = 0;

  if (password.length >= 8) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;

  return Math.min(strength, 4);
}

function getPasswordStrengthText(strength: number): string {
  switch (strength) {
    case 0:
    case 1: return "Fraca";
    case 2: return "Regular";
    case 3: return "Boa";
    case 4: return "Forte";
    default: return "Fraca";
  }
}

function getPasswordStrengthColor(strength: number): string {
  switch (strength) {
    case 0:
    case 1: return "text-red-400";
    case 2: return "text-yellow-400";
    case 3: return "text-blue-400";
    case 4: return "text-brand-neon-green";
    default: return "text-red-400";
  }
}

function getPasswordStrengthBarColor(strength: number): string {
  switch (strength) {
    case 0:
    case 1: return "bg-red-500";
    case 2: return "bg-yellow-500";
    case 3: return "bg-blue-500";
    case 4: return "bg-brand-neon-green";
    default: return "bg-red-500";
  }
}