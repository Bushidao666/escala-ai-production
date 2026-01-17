"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Slider } from "@/shared/ui/slider";
import { Switch } from "@/shared/ui/switch";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/shared/ui/form";
import {
  Settings,
  Key,
  Palette,
  Zap,
  Globe,
  Eye,
  EyeOff,
  Save,
  RotateCcw,
  Sparkles,
  Clock,
  Moon,
  Sun,
  CheckCircle2,
  XCircle,
  Loader2,
  ChevronRight,
  RefreshCw,
  KeyRound,
  SlidersHorizontal,
  CheckCircle,
  XCircle as XCircleIcon
} from "lucide-react";
import { saveSettings, restoreDefaults, getUserSettings, testOpenAiConnection } from "@/modules/settings/application/actions";
import { toast } from "sonner";
import { cn } from "@/shared/lib/utils";
import { settingsSchema, type SettingsFormData, defaultSettings } from "@/modules/settings/dto/settings.schema";
import { useSupabaseRealtime } from "@/shared/hooks/useSupabaseRealtime";
import { createClient } from "@/shared/infra/supabase/client";

type ConnectionStatus = 'idle' | 'testing' | 'success' | 'error';

// Defina handlers e config como constantes estáveis fora do componente
const realtimeHandlers = {};
const realtimeConfig = { enabled: true };

export default function SettingsPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [showApiKey, setShowApiKey] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('idle');
  const [connectionError, setConnectionError] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

  // Fetch user ID for realtime connection
  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id ?? null);
    };
    fetchUser();
  }, []);

  // Establish realtime connection with stable props
  useSupabaseRealtime(userId, realtimeHandlers, realtimeConfig);

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: defaultSettings,
  });

  const { control, handleSubmit, reset, watch, setValue, formState: { errors } } = form;

  // Watch API key for connection testing
  const apiKey = watch("openai_api_key");

  // Fetch settings on component mount
  useEffect(() => {
    const fetchSettings = async () => {
      setIsFetching(true);
      try {
        const settings = await getUserSettings() as any;
        if (settings) {
          const formattedSettings: SettingsFormData = {
            openai_api_key: settings.openai_api_key || "",
            model: settings.model || "gpt-image-1",
            default_quality: settings.default_quality || "high",
            default_output_format: settings.default_output_format || "png",
            default_output_compression: settings.default_output_compression || 85,
            default_background: settings.default_background || "auto",
            default_moderation: settings.default_moderation || "auto",
            timeout: settings.timeout || 30000,
            retries: settings.retries || 3,
            theme: settings.theme || "dark",
            language: settings.language || "pt-BR",
          };
          reset(formattedSettings);
        }
      } catch (error) {
        toast.error("Falha ao carregar as configurações.");
      } finally {
        setIsFetching(false);
      }
    };
    fetchSettings();
  }, [reset]);

  const handleTestConnection = async () => {
    setConnectionStatus('testing');
    setConnectionError('');
    const result = await testOpenAiConnection(apiKey);
    if (result.success) {
      setConnectionStatus('success');
      toast.success('Conexão com a API da OpenAI bem-sucedida!');
    } else {
      setConnectionStatus('error');
      setConnectionError(result.error || 'Erro desconhecido');
      toast.error('Falha na conexão', { description: result.error });
    }
  };

  const onSubmit = async (data: SettingsFormData) => {
    setIsLoading(true);
    toast.info("Salvando configurações...");
    try {
      await saveSettings(data);
      toast.success("Configurações salvas com sucesso!");
    } catch (error: any) {
      toast.error("Erro ao salvar configurações", {
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestoreDefaults = async () => {
    setIsLoading(true);
    toast.info("Restaurando configurações padrão...");
    try {
      await restoreDefaults();
      reset(defaultSettings);
      toast.success("Configurações restauradas para o padrão!");
    } catch (error) {
      toast.error("Erro ao restaurar configurações");
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-4 border-brand-neon-green/20 border-t-brand-neon-green rounded-full animate-spin"></div>
          <p className="text-brand-neon-green text-lg font-medium">Carregando Configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="container-glass max-w-4xl mx-auto">
        {/* Cabeçalho Refinado */}
        <header className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-brand-neon-green/20 rounded-xl blur-lg animate-glow-pulse"></div>
              <div className="relative bg-gradient-to-br from-brand-neon-green to-brand-neon-green-dark p-3 rounded-xl">
                <Settings className="w-6 h-6 text-brand-black" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                Configurações
              </h1>
              <p className="text-brand-gray-500 text-lg">
                Ajuste suas preferências e configure a aplicação.
              </p>
            </div>
          </div>
        </header>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Card: API da OpenAI */}
            <Card className="card-glass-intense border-brand-gray-700/50">
              <CardHeader>
                <CardTitle className="flex items-center text-white text-xl">
                  <KeyRound className="w-5 h-5 mr-3 text-brand-neon-green" />
                  API da OpenAI
                </CardTitle>
                <CardDescription className="text-brand-gray-400 pt-1">
                  Insira sua chave da API da OpenAI para habilitar a geração de criativos.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={control}
                  name="openai_api_key"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white font-medium">
                        Chave da API OpenAI
                      </FormLabel>
                      <div className="flex items-center space-x-2">
                        <div className="relative flex-grow">
                          <FormControl>
                            <Input
                              {...field}
                              type={showApiKey ? "text" : "password"}
                              placeholder="sk-..."
                              className="input-glass pr-11 h-12 text-white"
                              onChange={(e) => {
                                field.onChange(e);
                                setConnectionStatus('idle');
                              }}
                            />
                          </FormControl>
                          <button
                            type="button"
                            onClick={() => setShowApiKey(!showApiKey)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-brand-gray-500 hover:text-brand-neon-green transition-colors duration-200"
                          >
                            {showApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                        <Button
                          type="button"
                          onClick={handleTestConnection}
                          disabled={connectionStatus === 'testing' || !apiKey}
                          className="btn-ghost h-12 shrink-0"
                        >
                          {connectionStatus === 'testing' ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <ChevronRight className="w-5 h-5" />
                          )}
                          <span className="ml-2 hidden sm:inline">Testar</span>
                        </Button>
                      </div>
                      <div className="h-5 mt-2">
                        {connectionStatus === 'success' && (
                          <div className="flex items-center text-sm text-brand-neon-green">
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Conexão bem-sucedida!
                          </div>
                        )}
                        {connectionStatus === 'error' && (
                          <div className="flex items-center text-sm text-red-400">
                            <XCircle className="w-4 h-4 mr-2" />
                            {connectionError}
                          </div>
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white font-medium">
                        Modelo de IA
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="input-glass h-12">
                            <SelectValue placeholder="Selecione o modelo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-brand-gray-800 border-brand-gray-700">
                          <SelectItem value="gpt-image-1" className="text-white hover:bg-brand-gray-700">
                            GPT Image 1 (Recomendado)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Card: Configurações de Geração */}
            <Card className="card-glass-intense border-brand-gray-700/50">
              <CardHeader>
                <CardTitle className="flex items-center text-white text-xl">
                  <SlidersHorizontal className="w-5 h-5 mr-3 text-brand-neon-green" />
                  Configurações de Geração Padrão
                </CardTitle>
                <CardDescription className="text-brand-gray-400 pt-1">
                  Defina os valores padrão para a criação de novos criativos.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-x-6 gap-y-8">
                <FormField
                  control={control}
                  name="default_quality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white font-medium">Qualidade Padrão</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="input-glass h-12">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="auto" className="text-white hover:bg-brand-gray-700">Auto</SelectItem>
                          <SelectItem value="high" className="text-white hover:bg-brand-gray-700">Alta</SelectItem>
                          <SelectItem value="medium" className="text-white hover:bg-brand-gray-700">Média</SelectItem>
                          <SelectItem value="low" className="text-white hover:bg-brand-gray-700">Baixa</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>Qualidade da imagem para novas criações.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="default_output_format"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white font-medium">
                        Formato de Saída
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="input-glass h-12">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-brand-gray-800 border-brand-gray-700">
                          <SelectItem value="png" className="text-white hover:bg-brand-gray-700">PNG</SelectItem>
                          <SelectItem value="jpeg" className="text-white hover:bg-brand-gray-700">JPEG</SelectItem>
                          <SelectItem value="webp" className="text-white hover:bg-brand-gray-700">WebP</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="default_output_compression"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="text-white font-medium">Compressão Padrão: {field.value}%</FormLabel>
                      <FormControl>
                        <Slider
                          value={[field.value]}
                          onValueChange={(value: number[]) => field.onChange(value[0])}
                          max={100}
                          step={1}
                        />
                      </FormControl>
                      <FormDescription>
                        Nível de compressão para formatos JPEG e WebP.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="default_background"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white font-medium">
                        Tipo de Fundo
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="input-glass h-12">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-brand-gray-800 border-brand-gray-700">
                          <SelectItem value="auto" className="text-white hover:bg-brand-gray-700">Automático</SelectItem>
                          <SelectItem value="transparent" className="text-white hover:bg-brand-gray-700">Transparente</SelectItem>
                          <SelectItem value="opaque" className="text-white hover:bg-brand-gray-700">Opaco</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="default_moderation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white font-medium">
                        Nível de Moderação
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="input-glass h-12">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-brand-gray-800 border-brand-gray-700">
                          <SelectItem value="auto" className="text-white hover:bg-brand-gray-700">Automático</SelectItem>
                          <SelectItem value="low" className="text-white hover:bg-brand-gray-700">Baixo</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Card: Configurações de Processamento */}
            <Card className="card-glass-intense border-brand-gray-700/50">
              <CardHeader>
                <CardTitle className="flex items-center text-white text-xl">
                  <Clock className="w-5 h-5 mr-3 text-brand-neon-green" />
                  Configurações de Processamento
                </CardTitle>
                <CardDescription className="text-brand-gray-400 pt-1">
                  Ajuste timeouts e tentativas de processamento
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={control}
                    name="timeout"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white font-medium flex items-center">
                          Timeout (ms)
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            min="5000"
                            max="120000"
                            step="1000"
                            className="input-glass h-12 text-white"
                            onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                            value={field.value}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="retries"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white font-medium flex items-center">
                          Tentativas
                        </FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value, 10))} value={field.value.toString()}>
                          <FormControl>
                            <SelectTrigger className="input-glass h-12">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-brand-gray-800 border-brand-gray-700">
                            <SelectItem value="0" className="text-white hover:bg-brand-gray-700">0</SelectItem>
                            <SelectItem value="1" className="text-white hover:bg-brand-gray-700">1</SelectItem>
                            <SelectItem value="2" className="text-white hover:bg-brand-gray-700">2</SelectItem>
                            <SelectItem value="3" className="text-white hover:bg-brand-gray-700">3</SelectItem>
                            <SelectItem value="5" className="text-white hover:bg-brand-gray-700">5</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Card: Configurações da Interface */}
            <Card className="card-glass-intense border-brand-gray-700/50">
              <CardHeader>
                <CardTitle className="flex items-center text-white text-xl">
                  <Palette className="w-5 h-5 mr-3 text-brand-neon-green" />
                  Configurações da Interface
                </CardTitle>
                <CardDescription className="text-brand-gray-400 pt-1">
                  Personalize a aparência e o idioma da plataforma
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-brand-gray-700/50">
                  <FormField
                    control={control}
                    name="theme"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between p-6">
                          <div className="flex items-center space-x-4">
                            {field.value === "dark" ? (
                              <Moon className="w-6 h-6 text-brand-neon-green" />
                            ) : (
                              <Sun className="w-6 h-6 text-yellow-500" />
                            )}
                            <div>
                              <FormLabel className="text-white font-medium text-base">
                                Modo Escuro
                              </FormLabel>
                              <p className="text-sm text-brand-gray-500">
                                Interface otimizada para baixa luminosidade.
                              </p>
                            </div>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value === "dark"}
                              onCheckedChange={(checked) => field.onChange(checked ? "dark" : "light")}
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="language"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between p-6">
                          <div className="flex items-center space-x-4">
                            <Globe className="w-6 h-6 text-brand-neon-green" />
                            <div>
                              <FormLabel className="text-white font-medium text-base">
                                Idioma
                              </FormLabel>
                              <p className="text-sm text-brand-gray-500">
                                Escolha o idioma da interface.
                              </p>
                            </div>
                          </div>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="input-glass w-[180px]">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-brand-gray-800 border-brand-gray-700">
                              <SelectItem value="pt-BR" className="text-white hover:bg-brand-gray-700">
                                🇧🇷 Português (BR)
                              </SelectItem>
                              <SelectItem value="en-US" className="text-white hover:bg-brand-gray-700">
                                🇺🇸 English (US)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-end border-t border-brand-gray-700/50 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handleRestoreDefaults}
                disabled={isLoading}
                className="btn-ghost order-2 sm:order-1 text-brand-gray-300"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Restaurar Padrão
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="btn-primary order-1 sm:order-2"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Salvar Configurações
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}