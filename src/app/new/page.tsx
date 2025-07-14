"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// 🚀 NOVAS IMPORTAÇÕES para múltiplos formatos
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { ImageUpload, type UploadedImage } from "@/components/ui/image-upload";
import { ColorPicker } from "@/components/ui/color-picker";
import { 
  Sparkles, 
  Image as ImageIcon, 
  Palette, 
  Type, 
  Monitor,
  Save, 
  Send,
  RotateCcw,
  Loader2,
  Wand2,
  Eye,
  Info,
  Layers,
  Settings2,
  // 🚀 NOVOS ÍCONES para múltiplos formatos
  Grid,
  Zap,
  Target
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { 
  createCreativeSchema, 
  type CreateCreativeData,
  defaultCreativeValues,
  FORMAT_LABELS,
  CREATIVE_STYLES,
  // 🚀 NOVAS IMPORTAÇÕES para múltiplos formatos
  createCreativeRequestSchema,
  type CreateCreativeRequestData,
  defaultCreativeRequestValues,
  MULTI_FORMAT_PRESETS,
  // 🆕 NOVAS IMPORTAÇÕES para quantidade e variações
  VARIATION_STYLE_OPTIONS,
  QUANTITY_PRESETS
} from "@/lib/schemas/creative";
import { 
  createCreative, 
  saveDraft, 
  getUserDefaults,
  debugAuth,
  // 🚀 NOVA IMPORTAÇÃO para requests multi-formato
  createCreativeRequest
} from "./actions";
import { useSupabaseRealtime } from "@/hooks/useSupabaseRealtime";
import { createClient } from "@/lib/supabase/client";

// Defina handlers e config como constantes estáveis fora do componente
const realtimeHandlers = { onUpdate: () => {} };
const realtimeConfig = { enabled: true };

export default function NewCreativePage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDraftSaving, setIsDraftSaving] = useState(false);
  const [isFetchingDefaults, setIsFetchingDefaults] = useState(true);
  const [activeTab, setActiveTab] = useState("basic");
  const [userDefaults, setUserDefaults] = useState<any>(null);
  
  // 🚀 NOVO: Estado para controlar modo de múltiplos formatos
  const [isMultiFormat, setIsMultiFormat] = useState(false);
  const [selectedFormats, setSelectedFormats] = useState<string[]>(['1:1']);

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

  const form = useForm<CreateCreativeData>({
    resolver: zodResolver(createCreativeSchema),
    defaultValues: defaultCreativeValues,
    mode: "onChange",
  });

  const { control, handleSubmit, reset, watch, setValue, formState: { errors, isDirty } } = form;

  // Watch para preview das informações
  const watchedValues = watch();
  const hasLogo = watchedValues.logo_url && watchedValues.logo_url.length > 0;
  const hasProducts = watchedValues.product_images && watchedValues.product_images.length > 0;

  // Busca configurações padrão do usuário
  useEffect(() => {
    const fetchDefaults = async () => {
      try {
        const userDefaults = await getUserDefaults();
        // Combina os padrões do usuário com os padrões da aplicação
        const combinedDefaults = {
          ...defaultCreativeValues,
          ...userDefaults,
        };
        // Reset o form com os valores combinados
        reset(combinedDefaults);
      } catch (error) {
        console.error("Erro ao buscar configurações do usuário:", error);
      } finally {
        setIsFetchingDefaults(false);
      }
    };

    fetchDefaults();
  }, [reset]);

  // 🚀 NOVO: Submissão que suporta ambos os modos
  const onSubmit = async (data: CreateCreativeData) => {
    setIsLoading(true);
    
    if (isMultiFormat) {
      toast.info("Criando múltiplos criativos...", {
        description: `Gerando ${selectedFormats.length} formato(s)`
      });

      try {
        // Converte data para CreateCreativeRequestData
        const requestData: CreateCreativeRequestData = {
          title: data.title,
          description: data.description,
          prompt: data.prompt,
          style: data.style,
          primary_color: data.primary_color,
          secondary_color: data.secondary_color,
          headline: data.headline,
          sub_headline: data.sub_headline,
          cta_text: data.cta_text,
          logo_url: data.logo_url,
          product_images: data.product_images,
          requested_formats: selectedFormats as any,
          // 🆕 NOVOS CAMPOS: Quantidade e Variações
          quantity: data.quantity,
          enable_variations: data.enable_variations,
          variation_style: data.variation_style
        };

        const result = await createCreativeRequest(requestData);
        
        // ✅ CORRIGIDO: Resetar loading imediatamente após sucesso
        setIsLoading(false);
        
        toast.success("Múltiplos criativos criados!", {
          description: result.message,
          action: {
            label: "Ver Fila",
            onClick: () => window.location.href = "/queue"
          }
        });
        
        // Limpa o formulário para nova criação
        reset(defaultCreativeValues);
        setSelectedFormats(['1:1']);
        
      } catch (error: any) {
        setIsLoading(false);
        toast.error("Erro ao criar criativos", {
          description: error.message
        });
      }
    } else {
      toast.info("Criando criativo...", {
        description: "Adicionando à fila de processamento"
      });

      try {
        const result = await createCreative(data);
        
        // ✅ CORRIGIDO: Resetar loading imediatamente após sucesso
        setIsLoading(false);
        
        toast.success("Criativo criado!", {
          description: result.message,
          action: {
            label: "Ver Fila",
            onClick: () => window.location.href = "/queue"
          }
        });
        
        // Limpa o formulário para nova criação
        reset(defaultCreativeValues);
        
      } catch (error: any) {
        setIsLoading(false);
        toast.error("Erro ao criar criativo", {
          description: error.message
        });
      }
    }
  };

  // Salvar como rascunho
  const handleSaveDraft = async () => {
    setIsDraftSaving(true);
    toast.info("Salvando rascunho...");

    try {
      const formData = form.getValues();
      await saveDraft(formData);
      toast.success("Rascunho salvo com sucesso!");
      reset(formData);
    } catch (error: any) {
      toast.error("Erro ao salvar rascunho", {
        description: error.message
      });
    } finally {
      setIsDraftSaving(false);
    }
  };

  // Limpar formulário
  const handleClearForm = () => {
    reset(defaultCreativeValues);
    toast.info("Formulário limpo");
  };

  // Renderiza um estado de carregamento enquanto busca os padrões
  if (isFetchingDefaults) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-4 border-brand-neon-green/20 border-t-brand-neon-green rounded-full animate-spin"></div>
          <p className="text-brand-neon-green text-lg font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Premium */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-0 bg-brand-neon-green/20 rounded-2xl blur-xl animate-glow-pulse"></div>
                <div className="relative bg-gradient-to-br from-brand-neon-green via-brand-neon-green to-brand-neon-green-dark p-4 rounded-2xl shadow-lg">
                  <Wand2 className="w-7 h-7 text-brand-black" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white tracking-tight">
                  Criar Novo Criativo
                </h1>
                <p className="text-brand-gray-400 text-lg mt-1">
                  Descreva sua visão e deixe a IA criar o criativo perfeito
                  {isFetchingDefaults && (
                    <span className="ml-2 text-brand-neon-green text-sm animate-pulse">
                      (Carregando configurações...)
                    </span>
                  )}
                </p>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              <Button
                type="button"
                onClick={handleClearForm}
                className="btn-ghost h-10 px-4"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Limpar
              </Button>
              <Button
                type="button"
                onClick={handleSaveDraft}
                disabled={isDraftSaving || !isDirty}
                className="btn-outline-neon h-10 px-4"
              >
                {isDraftSaving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {isDraftSaving ? "Salvando..." : "Salvar Rascunho"}
              </Button>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
              
              {/* Main Form - 3 columns */}
              <div className="xl:col-span-3">
                <Card className="card-glass-intense border-brand-gray-700/50 overflow-hidden">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-white text-xl">Configuração do Criativo</CardTitle>
                    <CardDescription className="text-brand-gray-400">
                      Organize suas informações em seções para criar o criativo perfeito
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                      <TabsList className="grid w-full grid-cols-4 p-3 gap-2 rounded-none border-b border-brand-gray-700/30 backdrop-blur-sm relative z-10 !h-auto !bg-transparent !bg-none" style={{ background: 'transparent !important', backgroundColor: 'transparent !important' }}>
                        <TabsTrigger 
                          value="basic" 
                          className={cn(
                            "relative group py-2 px-3 rounded-lg transition-all duration-500 flex flex-col items-center h-14 overflow-hidden",
                            "before:absolute before:inset-0 before:bg-gradient-to-br before:from-transparent before:via-white/5 before:to-transparent before:opacity-0 before:transition-opacity before:duration-500",
                            "after:absolute after:inset-0 after:bg-gradient-to-t after:from-brand-neon-green/10 after:to-transparent after:opacity-0 after:transition-all after:duration-500 after:scale-95",
                            activeTab !== 'basic' && [
                              "text-brand-gray-400 hover:text-white",
                              "hover:bg-gradient-to-br hover:from-brand-gray-700/30 hover:via-brand-gray-600/20 hover:to-brand-gray-700/30",
                              "hover:before:opacity-100 hover:shadow-lg hover:shadow-brand-gray-900/20",
                              "hover:border-brand-gray-600/30 border border-transparent"
                            ],
                            activeTab === 'basic' && [
                              "text-white bg-gradient-to-br from-brand-neon-green/20 via-brand-neon-green/10 to-transparent",
                              "border border-brand-neon-green/30 shadow-lg shadow-brand-neon-green/20",
                              "before:opacity-100 after:opacity-100 after:scale-100",
                              "ring-1 ring-brand-neon-green/20"
                            ]
                          )}
                        >
                          <Sparkles className={cn(
                            "w-4 h-4 mb-1 transition-all duration-500 group-hover:scale-110",
                            activeTab === 'basic' ? "text-brand-neon-green drop-shadow-sm" : "group-hover:text-brand-neon-green/70"
                          )} />
                          <span className={cn(
                            "text-xs font-semibold tracking-wide transition-all duration-500",
                            activeTab === 'basic' && "text-shadow-sm"
                          )}>
                            Básico
                          </span>
                        </TabsTrigger>
                        
                        <TabsTrigger 
                          value="media" 
                          className={cn(
                            "relative group py-2 px-3 rounded-lg transition-all duration-500 flex flex-col items-center h-14 overflow-hidden",
                            "before:absolute before:inset-0 before:bg-gradient-to-br before:from-transparent before:via-white/5 before:to-transparent before:opacity-0 before:transition-opacity before:duration-500",
                            "after:absolute after:inset-0 after:bg-gradient-to-t after:from-brand-neon-green/10 after:to-transparent after:opacity-0 after:transition-all after:duration-500 after:scale-95",
                            activeTab !== 'media' && [
                              "text-brand-gray-400 hover:text-white",
                              "hover:bg-gradient-to-br hover:from-brand-gray-700/30 hover:via-brand-gray-600/20 hover:to-brand-gray-700/30",
                              "hover:before:opacity-100 hover:shadow-lg hover:shadow-brand-gray-900/20",
                              "hover:border-brand-gray-600/30 border border-transparent"
                            ],
                            activeTab === 'media' && [
                              "text-white bg-gradient-to-br from-brand-neon-green/20 via-brand-neon-green/10 to-transparent",
                              "border border-brand-neon-green/30 shadow-lg shadow-brand-neon-green/20",
                              "before:opacity-100 after:opacity-100 after:scale-100",
                              "ring-1 ring-brand-neon-green/20"
                            ]
                          )}
                        >
                          <ImageIcon className={cn(
                            "w-4 h-4 mb-1 transition-all duration-500 group-hover:scale-110",
                            activeTab === 'media' ? "text-brand-neon-green drop-shadow-sm" : "group-hover:text-brand-neon-green/70"
                          )} />
                          <span className={cn(
                            "text-xs font-semibold tracking-wide transition-all duration-500",
                            activeTab === 'media' && "text-shadow-sm"
                          )}>
                            Mídia
                          </span>
                        </TabsTrigger>
                        
                        <TabsTrigger 
                          value="design" 
                          className={cn(
                            "relative group py-2 px-3 rounded-lg transition-all duration-500 flex flex-col items-center h-14 overflow-hidden",
                            "before:absolute before:inset-0 before:bg-gradient-to-br before:from-transparent before:via-white/5 before:to-transparent before:opacity-0 before:transition-opacity before:duration-500",
                            "after:absolute after:inset-0 after:bg-gradient-to-t after:from-brand-neon-green/10 after:to-transparent after:opacity-0 after:transition-all after:duration-500 after:scale-95",
                            activeTab !== 'design' && [
                              "text-brand-gray-400 hover:text-white",
                              "hover:bg-gradient-to-br hover:from-brand-gray-700/30 hover:via-brand-gray-600/20 hover:to-brand-gray-700/30",
                              "hover:before:opacity-100 hover:shadow-lg hover:shadow-brand-gray-900/20",
                              "hover:border-brand-gray-600/30 border border-transparent"
                            ],
                            activeTab === 'design' && [
                              "text-white bg-gradient-to-br from-brand-neon-green/20 via-brand-neon-green/10 to-transparent",
                              "border border-brand-neon-green/30 shadow-lg shadow-brand-neon-green/20",
                              "before:opacity-100 after:opacity-100 after:scale-100",
                              "ring-1 ring-brand-neon-green/20"
                            ]
                          )}
                        >
                          <Palette className={cn(
                            "w-4 h-4 mb-1 transition-all duration-500 group-hover:scale-110",
                            activeTab === 'design' ? "text-brand-neon-green drop-shadow-sm" : "group-hover:text-brand-neon-green/70"
                          )} />
                          <span className={cn(
                            "text-xs font-semibold tracking-wide transition-all duration-500",
                            activeTab === 'design' && "text-shadow-sm"
                          )}>
                            Design
                          </span>
                        </TabsTrigger>
                        
                        <TabsTrigger 
                          value="technical" 
                          className={cn(
                            "relative group py-2 px-3 rounded-lg transition-all duration-500 flex flex-col items-center h-14 overflow-hidden",
                            "before:absolute before:inset-0 before:bg-gradient-to-br before:from-transparent before:via-white/5 before:to-transparent before:opacity-0 before:transition-opacity before:duration-500",
                            "after:absolute after:inset-0 after:bg-gradient-to-t after:from-brand-neon-green/10 after:to-transparent after:opacity-0 after:transition-all after:duration-500 after:scale-95",
                            activeTab !== 'technical' && [
                              "text-brand-gray-400 hover:text-white",
                              "hover:bg-gradient-to-br hover:from-brand-gray-700/30 hover:via-brand-gray-600/20 hover:to-brand-gray-700/30",
                              "hover:before:opacity-100 hover:shadow-lg hover:shadow-brand-gray-900/20",
                              "hover:border-brand-gray-600/30 border border-transparent"
                            ],
                            activeTab === 'technical' && [
                              "text-white bg-gradient-to-br from-brand-neon-green/20 via-brand-neon-green/10 to-transparent",
                              "border border-brand-neon-green/30 shadow-lg shadow-brand-neon-green/20",
                              "before:opacity-100 after:opacity-100 after:scale-100",
                              "ring-1 ring-brand-neon-green/20"
                            ]
                          )}
                        >
                          <Settings2 className={cn(
                            "w-4 h-4 mb-1 transition-all duration-500 group-hover:scale-110",
                            activeTab === 'technical' ? "text-brand-neon-green drop-shadow-sm" : "group-hover:text-brand-neon-green/70"
                          )} />
                          <span className={cn(
                            "text-xs font-semibold tracking-wide transition-all duration-500",
                            activeTab === 'technical' && "text-shadow-sm"
                          )}>
                            Técnico
                          </span>
                        </TabsTrigger>
                      </TabsList>

                      {/* Basic Tab */}
                      <TabsContent value="basic" className="p-6 space-y-6 mt-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <FormField
                            control={control}
                            name="title"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white font-medium text-sm">
                                  Título do Criativo
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder="Ex: Campanha de Verão 2024"
                                    className="input-glass h-10 text-white"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={control}
                            name="style"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white font-medium text-sm">
                                  Estilo do Criativo
                                </FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="input-glass h-10">
                                      <SelectValue placeholder="Selecione um estilo" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="bg-brand-gray-800 border-brand-gray-700">
                                    {CREATIVE_STYLES.map((style) => (
                                      <SelectItem 
                                        key={style} 
                                        value={style}
                                        className="text-white hover:bg-brand-gray-700"
                                      >
                                        {style}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={control}
                          name="prompt"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white font-medium text-sm">
                                Descrição do Criativo
                              </FormLabel>
                              <FormControl>
                                <Textarea
                                  {...field}
                                  placeholder="Ex: Uma imagem promocional vibrante para nossa coleção de verão, com cores tropicais, modelos jovens na praia, elementos de design moderno..."
                                  className="input-glass min-h-[100px] text-white resize-none"
                                />
                              </FormControl>
                              <FormDescription className="text-brand-gray-400 text-xs">
                                Descreva detalhadamente o criativo que você deseja. Seja específico sobre cores, estilo, elementos e atmosfera.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white font-medium text-sm">
                                Notas Adicionais (Opcional)
                              </FormLabel>
                              <FormControl>
                                <Textarea
                                  {...field}
                                  placeholder="Ex: Este criativo será usado no Instagram e Facebook. Público-alvo: mulheres 25-35 anos..."
                                  className="input-glass min-h-[70px] text-white resize-none"
                                />
                              </FormControl>
                              <FormDescription className="text-brand-gray-400 text-xs">
                                Informações extras sobre contexto, público-alvo ou uso
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Text Fields Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                          <FormField
                            control={control}
                            name="headline"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white font-medium text-sm">
                                  Headline Principal
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder="Ex: Coleção Verão 2024"
                                    className="input-glass h-10 text-white"
                                    maxLength={60}
                                  />
                                </FormControl>
                                <FormDescription className="text-brand-gray-400 text-xs">
                                  Máx. 60 caracteres
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={control}
                            name="sub_headline"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white font-medium text-sm">
                                  Sub-headline
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder="Ex: Looks frescos e modernos"
                                    className="input-glass h-10 text-white"
                                    maxLength={120}
                                  />
                                </FormControl>
                                <FormDescription className="text-brand-gray-400 text-xs">
                                  Máx. 120 caracteres
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={control}
                            name="cta_text"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white font-medium text-sm">
                                  Call-to-Action (CTA)
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder="Ex: Compre Agora"
                                    className="input-glass h-10 text-white"
                                    maxLength={25}
                                  />
                                </FormControl>
                                <FormDescription className="text-brand-gray-400 text-xs">
                                  Máx. 25 caracteres
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </TabsContent>

                      {/* Media Tab */}
                      <TabsContent value="media" className="p-6 space-y-6 mt-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Logo Upload */}
                          <FormField
                            control={control}
                            name="logo_url"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white font-medium text-sm">
                                  Logo da Empresa
                                </FormLabel>
                                <FormControl>
                                  <ImageUpload
                                    images={field.value ? [{ url: field.value, filename: 'logo', size: 0, type: 'image' }] : []}
                                    onImagesChange={(newImages) => {
                                      const newUrl = newImages[0]?.url || "";
                                      field.onChange(newUrl);
                                    }}
                                    multiple={false}
                                    maxFiles={1}
                                    placeholder="Adicione o logo da sua empresa"
                                    className="w-full"
                                  />
                                </FormControl>
                                <FormDescription className="text-brand-gray-400 text-xs">
                                  O logo será incorporado automaticamente no criativo
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Product Images Upload */}
                          <FormField
                            control={control}
                            name="product_images"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white font-medium text-sm">
                                  Imagens de Produtos/Referências
                                </FormLabel>
                                <FormControl>
                                  <ImageUpload
                                    images={field.value || []}
                                    onImagesChange={field.onChange}
                                    multiple={true}
                                    maxFiles={5}
                                    placeholder="Adicione até 5 imagens"
                                    className="w-full"
                                  />
                                </FormControl>
                                <FormDescription className="text-brand-gray-400 text-xs">
                                  Imagens de produtos, referências visuais ou elementos que devem aparecer no criativo
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </TabsContent>

                      {/* Design Tab */}
                      <TabsContent value="design" className="p-6 space-y-6 mt-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <FormField
                            control={control}
                            name="primary_color"
                            render={({ field }) => (
                              <FormItem>
                                <ColorPicker
                                  label="Cor Primária"
                                  value={field.value}
                                  onChange={field.onChange}
                                  placeholder="#FF6B6B"
                                />
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={control}
                            name="secondary_color"
                            render={({ field }) => (
                              <FormItem>
                                <ColorPicker
                                  label="Cor Secundária"
                                  value={field.value}
                                  onChange={field.onChange}
                                  placeholder="#4ECDC4"
                                />
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* 🚀 NOVO: Toggle para modo de múltiplos formatos */}
                        <div className="col-span-full mb-6 p-4 rounded-lg bg-gradient-to-br from-brand-neon-green/5 via-transparent to-brand-neon-green/5 border border-brand-neon-green/20">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 rounded-lg bg-brand-neon-green/20">
                                <Grid className="w-5 h-5 text-brand-neon-green" />
                              </div>
                              <div>
                                <h3 className="text-white font-semibold text-sm">Modo de Múltiplos Formatos</h3>
                                <p className="text-brand-gray-400 text-xs">
                                  {isMultiFormat 
                                    ? `Gera ${selectedFormats.length} formato(s) em uma única solicitação`
                                    : "Gera apenas um formato por vez"
                                  }
                                </p>
                              </div>
                            </div>
                            <Switch
                              checked={isMultiFormat}
                              onCheckedChange={setIsMultiFormat}
                              className="data-[state=checked]:bg-brand-neon-green"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* 🚀 MODIFICADO: Campo de formato adaptativo */}
                          {isMultiFormat ? (
                            <div className="col-span-full">
                              <FormLabel className="text-white font-medium text-sm mb-4 block">
                                Formatos Selecionados
                              </FormLabel>
                              
                              {/* Presets Rápidos */}
                              <div className="flex flex-wrap gap-2 mb-4">
                                {Object.entries(MULTI_FORMAT_PRESETS).map(([key, preset]) => (
                                  <button
                                    key={key}
                                    type="button"
                                    onClick={() => setSelectedFormats([...preset.formats])}
                                    className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-brand-gray-700/50 hover:bg-brand-neon-green/20 border border-brand-gray-600/50 hover:border-brand-neon-green/50 transition-all duration-200"
                                  >
                                    <span className="text-lg">{preset.icon}</span>
                                    <div className="text-left">
                                      <div className="text-white text-xs font-medium">{preset.name}</div>
                                      <div className="text-brand-gray-400 text-xs">{preset.description}</div>
                                    </div>
                                  </button>
                                ))}
                              </div>

                              {/* Checkboxes de Formatos */}
                              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                                {Object.entries(FORMAT_LABELS).map(([key, label]) => (
                                  <div 
                                    key={key}
                                    className="flex items-center space-x-3 p-3 rounded-lg border border-brand-gray-600/50 hover:border-brand-neon-green/50 transition-all duration-200"
                                  >
                                    <Checkbox
                                      id={`format-${key}`}
                                      checked={selectedFormats.includes(key)}
                                      onCheckedChange={(checked) => {
                                        if (checked) {
                                          setSelectedFormats(prev => [...prev, key]);
                                        } else {
                                          setSelectedFormats(prev => prev.filter(f => f !== key));
                                        }
                                      }}
                                      className="border-brand-gray-500 data-[state=checked]:bg-brand-neon-green data-[state=checked]:border-brand-neon-green"
                                    />
                                    <label 
                                      htmlFor={`format-${key}`}
                                      className="text-white text-sm font-medium cursor-pointer"
                                    >
                                      {label}
                                    </label>
                                  </div>
                                ))}
                              </div>

                              {selectedFormats.length === 0 && (
                                <p className="text-red-400 text-sm mt-2">
                                  Selecione pelo menos um formato
                                </p>
                              )}
                            </div>
                          ) : (
                            <FormField
                              control={control}
                              name="format"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white font-medium text-sm">
                                    Formato
                                  </FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                      <SelectTrigger className="input-glass h-10">
                                        <SelectValue placeholder="Selecione um formato" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="bg-brand-gray-800 border-brand-gray-700">
                                      {Object.entries(FORMAT_LABELS).map(([key, label]) => (
                                        <SelectItem 
                                          key={key} 
                                          value={key}
                                          className="text-white hover:bg-brand-gray-700"
                                        >
                                          {label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}

                          <FormField
                            control={control}
                            name="background"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white font-medium text-sm">
                                  Fundo
                                </FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value}
                                  defaultValue={userDefaults?.background}
                                >
                                  <FormControl>
                                    <SelectTrigger className="input-glass h-10">
                                      <SelectValue placeholder="Selecione o fundo" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="bg-brand-gray-800 border-brand-gray-700">
                                    <SelectItem value="auto" className="text-white hover:bg-brand-gray-700">
                                      Automático
                                    </SelectItem>
                                    <SelectItem value="transparent" className="text-white hover:bg-brand-gray-700">
                                      Transparente
                                    </SelectItem>
                                    <SelectItem value="white" className="text-white hover:bg-brand-gray-700">
                                      Branco
                                    </SelectItem>
                                    <SelectItem value="black" className="text-white hover:bg-brand-gray-700">
                                      Preto
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* 🆕 NOVA SEÇÃO: Controles de Quantidade e Variações */}
                        <div className="col-span-full mt-6 space-y-6">
                          {/* Seção de Quantidade */}
                          <div className="p-4 rounded-lg bg-gradient-to-br from-orange-500/5 via-transparent to-orange-500/5 border border-orange-500/20">
                            <div className="flex items-center space-x-3 mb-4">
                              <div className="p-2 rounded-lg bg-orange-500/20">
                                <Target className="w-5 h-5 text-orange-500" />
                              </div>
                              <div>
                                <h3 className="text-white font-semibold text-sm">Quantidade de Criativos</h3>
                                <p className="text-brand-gray-400 text-xs">
                                  {isMultiFormat 
                                    ? `${watchedValues.quantity || 1} criativo(s) por formato (${selectedFormats.length} formatos = ${(watchedValues.quantity || 1) * selectedFormats.length} total)`
                                    : `${watchedValues.quantity || 1} criativo(s) para o formato selecionado`
                                  }
                                </p>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              <FormField
                                control={control}
                                name="quantity"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-white font-medium text-sm">
                                      Quantidade
                                    </FormLabel>
                                    <div className="space-y-3">
                                      {/* Presets Rápidos */}
                                      <div className="flex flex-wrap gap-2">
                                        {QUANTITY_PRESETS.map((preset) => (
                                          <button
                                            key={preset.value}
                                            type="button"
                                            onClick={() => field.onChange(preset.value)}
                                            className={cn(
                                              "px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                                              field.value === preset.value
                                                ? "bg-orange-500/20 text-orange-500 border border-orange-500/50"
                                                : "bg-brand-gray-700/50 text-white border border-brand-gray-600/50 hover:border-orange-500/50 hover:bg-orange-500/10",
                                              preset.recommended && "ring-1 ring-orange-500/30"
                                            )}
                                          >
                                            {preset.label}
                                            {preset.recommended && (
                                              <span className="ml-1 text-xs">⭐</span>
                                            )}
                                          </button>
                                        ))}
                                      </div>
                                      
                                      {/* Input manual */}
                                      <FormControl>
                                        <Input
                                          type="number"
                                          min="1"
                                          max="10"
                                          value={field.value}
                                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                                          className="input-glass h-10 text-white"
                                          placeholder="Quantidade personalizada"
                                        />
                                      </FormControl>
                                    </div>
                                    <FormDescription className="text-brand-gray-400 text-xs">
                                      Cada criativo será gerado de forma independente
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={control}
                                name="enable_variations"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-white font-medium text-sm">
                                      Variações Inteligentes
                                    </FormLabel>
                                    <div className="space-y-4">
                                      <div className="flex items-center justify-between p-3 rounded-lg border border-brand-gray-600/50">
                                        <div>
                                          <span className="text-white text-sm font-medium">Ativar Variações</span>
                                          <p className="text-brand-gray-400 text-xs">
                                            {field.value 
                                              ? "Criará versões diferentes do mesmo conceito"
                                              : "Todos os criativos serão similares"
                                            }
                                          </p>
                                        </div>
                                        <FormControl>
                                          <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            className="data-[state=checked]:bg-orange-500"
                                          />
                                        </FormControl>
                                      </div>
                                      
                                      {field.value && (
                                        <FormField
                                          control={control}
                                          name="variation_style"
                                          render={({ field: variationField }) => (
                                            <FormItem>
                                              <FormLabel className="text-white font-medium text-xs">
                                                Tipo de Variação
                                              </FormLabel>
                                              <div className="grid grid-cols-1 gap-2">
                                                {Object.entries(VARIATION_STYLE_OPTIONS).map(([key, option]) => (
                                                  <button
                                                    key={key}
                                                    type="button"
                                                    onClick={() => variationField.onChange(key)}
                                                    className={cn(
                                                      "flex items-center space-x-3 p-3 rounded-lg border text-left transition-all duration-200",
                                                      variationField.value === key
                                                        ? "bg-orange-500/20 border-orange-500/50 text-orange-500"
                                                        : "border-brand-gray-600/50 text-white hover:border-orange-500/50 hover:bg-orange-500/10"
                                                    )}
                                                  >
                                                    <span className="text-lg">{option.icon}</span>
                                                    <div>
                                                      <div className="text-sm font-medium">{option.name}</div>
                                                      <div className="text-xs opacity-70">{option.description}</div>
                                                    </div>
                                                  </button>
                                                ))}
                                              </div>
                                              <FormMessage />
                                            </FormItem>
                                          )}
                                        />
                                      )}
                                    </div>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      {/* Technical Tab */}
                      <TabsContent value="technical" className="p-6 space-y-6 mt-4">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                                     <FormField
                             control={control}
                             name="quality"
                             render={({ field }) => (
                               <FormItem>
                                 <FormLabel className="text-white font-medium text-sm">
                                   Qualidade
                                 </FormLabel>
                                 <Select
                                   onValueChange={field.onChange}
                                   value={field.value}
                                   defaultValue={userDefaults?.quality}
                                 >
                                   <FormControl>
                                     <SelectTrigger className="input-glass h-10">
                                       <SelectValue placeholder="Selecione a qualidade" />
                                     </SelectTrigger>
                                   </FormControl>
                                   <SelectContent className="bg-brand-gray-800 border-brand-gray-700">
                                     <SelectItem value="auto" className="text-white hover:bg-brand-gray-700">
                                       Auto (Recomendado)
                                     </SelectItem>
                                     <SelectItem value="high" className="text-white hover:bg-brand-gray-700">
                                       Alta (Mais lenta)
                                     </SelectItem>
                                     <SelectItem value="medium" className="text-white hover:bg-brand-gray-700">
                                       Média (Balanceada)
                                     </SelectItem>
                                     <SelectItem value="low" className="text-white hover:bg-brand-gray-700">
                                       Baixa (Mais rápida)
                                     </SelectItem>
                                   </SelectContent>
                                 </Select>
                                 <FormDescription className="text-brand-gray-400 text-xs">
                                   Auto detecta a melhor qualidade automaticamente
                                 </FormDescription>
                                 <FormMessage />
                               </FormItem>
                             )}
                           />

                          <FormField
                            control={control}
                            name="output_format"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white font-medium text-sm">
                                  Formato de Saída
                                </FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value}
                                  defaultValue={userDefaults?.output_format}
                                >
                                  <FormControl>
                                    <SelectTrigger className="input-glass h-10">
                                      <SelectValue placeholder="Formato" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="bg-brand-gray-800 border-brand-gray-700">
                                    <SelectItem value="png" className="text-white hover:bg-brand-gray-700">PNG</SelectItem>
                                    <SelectItem value="jpeg" className="text-white hover:bg-brand-gray-700">JPG</SelectItem>
                                    <SelectItem value="webp" className="text-white hover:bg-brand-gray-700">WebP</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={control}
                            name="output_compression"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white font-medium text-sm">
                                  Compressão: {field.value}%
                                </FormLabel>
                                <FormControl>
                                                                     <Slider
                                     min={10}
                                     max={100}
                                     step={10}
                                     value={[field.value]}
                                     onValueChange={(value: number[]) => field.onChange(value[0])}
                                     className="w-full"
                                   />
                                </FormControl>
                                <FormDescription className="text-brand-gray-400 text-xs">
                                  Menor = arquivo menor, Maior = melhor qualidade
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </TabsContent>

                    </Tabs>
                  </CardContent>
                </Card>
              </div>

              {/* Preview Sidebar - 1 column */}
              <div className="xl:col-span-1">
                <div className="sticky top-6">
                  <Card className="card-glass-intense border-brand-gray-700/50">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center text-white text-lg">
                        <Eye className="w-5 h-5 mr-2 text-brand-neon-green" />
                        Preview Live
                      </CardTitle>
                      <CardDescription className="text-brand-gray-400 text-sm">
                        Visualização em tempo real das suas configurações
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      
                      {/* Creative Info */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-brand-gray-400 text-sm">Título:</span>
                          <span className="text-white text-sm font-medium truncate ml-2">
                            {watchedValues.title || "Sem título"}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-brand-gray-400 text-sm">Estilo:</span>
                                                     <Badge className="bg-brand-neon-green/20 text-brand-neon-green border-brand-neon-green/50 text-xs">
                             {watchedValues.style || "Não definido"}
                           </Badge>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-brand-gray-400 text-sm">Formato:</span>
                          {isMultiFormat ? (
                            <div className="flex flex-wrap gap-1">
                              {selectedFormats.map((format) => (
                                <Badge 
                                  key={format}
                                  className="bg-brand-neon-green/20 text-brand-neon-green border-brand-neon-green/50 text-xs"
                                >
                                  {FORMAT_LABELS[format as keyof typeof FORMAT_LABELS]}
                                </Badge>
                              ))}
                              {selectedFormats.length === 0 && (
                                <span className="text-red-400 text-sm">Nenhum formato</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-white text-sm">
                              {FORMAT_LABELS[watchedValues.format as keyof typeof FORMAT_LABELS] || "Não definido"}
                            </span>
                          )}
                        </div>

                        {watchedValues.primary_color && (
                          <div className="flex items-center justify-between">
                            <span className="text-brand-gray-400 text-sm">Cor Primária:</span>
                            <div className="flex items-center space-x-2">
                              <div 
                                className="w-4 h-4 rounded-full border border-brand-gray-600"
                                style={{ backgroundColor: watchedValues.primary_color }}
                              ></div>
                              <span className="text-white text-xs font-mono">
                                {watchedValues.primary_color}
                              </span>
                            </div>
                          </div>
                        )}

                        {watchedValues.secondary_color && (
                          <div className="flex items-center justify-between">
                            <span className="text-brand-gray-400 text-sm">Cor Secundária:</span>
                            <div className="flex items-center space-x-2">
                              <div 
                                className="w-4 h-4 rounded-full border border-brand-gray-600"
                                style={{ backgroundColor: watchedValues.secondary_color }}
                              ></div>
                              <span className="text-white text-xs font-mono">
                                {watchedValues.secondary_color}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* 🆕 NOVA SEÇÃO: Quantidade e Variações */}
                        <div className="flex items-center justify-between">
                          <span className="text-brand-gray-400 text-sm">Quantidade:</span>
                          <div className="flex items-center space-x-2">
                            <Badge className="bg-orange-500/20 text-orange-500 border-orange-500/50 text-xs">
                              {watchedValues.quantity || 1} criativo{(watchedValues.quantity || 1) > 1 ? 's' : ''}
                            </Badge>
                            {isMultiFormat && selectedFormats.length > 0 && (
                              <span className="text-brand-gray-400 text-xs">
                                (= {(watchedValues.quantity || 1) * selectedFormats.length} total)
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-brand-gray-400 text-sm">Variações:</span>
                          <div className="flex items-center space-x-2">
                            <Badge className={cn(
                              "text-xs",
                              watchedValues.enable_variations
                                ? "bg-purple-500/20 text-purple-500 border-purple-500/50"
                                : "bg-brand-gray-700/50 text-brand-gray-400 border-brand-gray-600/50"
                            )}>
                              {watchedValues.enable_variations ? "✓ Ativadas" : "Desativadas"}
                            </Badge>
                            {watchedValues.enable_variations && watchedValues.variation_style && (
                              <span className="text-xs text-purple-400">
                                ({VARIATION_STYLE_OPTIONS[watchedValues.variation_style as keyof typeof VARIATION_STYLE_OPTIONS]?.name})
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Media Status */}
                      <div className="pt-3 border-t border-brand-gray-700/50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-brand-gray-400 text-sm">Mídia:</span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-brand-gray-500">Logo:</span>
                                                         <Badge className={cn(
                               "text-xs",
                               hasLogo 
                                 ? "bg-brand-neon-green/20 text-brand-neon-green border-brand-neon-green/50" 
                                 : "bg-brand-gray-700/50 text-brand-gray-400 border-brand-gray-600/50"
                             )}>
                               {hasLogo ? "✓ Adicionado" : "Não adicionado"}
                             </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-brand-gray-500">Produtos:</span>
                                                         <Badge className={cn(
                               "text-xs",
                               hasProducts 
                                 ? "bg-brand-neon-green/20 text-brand-neon-green border-brand-neon-green/50" 
                                 : "bg-brand-gray-700/50 text-brand-gray-400 border-brand-gray-600/50"
                             )}>
                               {hasProducts ? `✓ ${watchedValues.product_images?.length || 0} imagem(ns)` : "Não adicionado"}
                             </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Text Content */}
                      {(watchedValues.headline || watchedValues.sub_headline || watchedValues.cta_text) && (
                        <div className="pt-3 border-t border-brand-gray-700/50">
                          <span className="text-brand-gray-400 text-sm mb-2 block">Textos:</span>
                          <div className="space-y-2">
                            {watchedValues.headline && (
                              <div className="bg-brand-gray-900/50 p-2 rounded-lg">
                                <span className="text-xs text-brand-gray-500 block mb-1">Headline:</span>
                                <span className="text-white text-sm font-semibold">
                                  {watchedValues.headline}
                                </span>
                              </div>
                            )}
                            {watchedValues.sub_headline && (
                              <div className="bg-brand-gray-900/50 p-2 rounded-lg">
                                <span className="text-xs text-brand-gray-500 block mb-1">Sub-headline:</span>
                                <span className="text-white text-sm">
                                  {watchedValues.sub_headline}
                                </span>
                              </div>
                            )}
                            {watchedValues.cta_text && (
                              <div className="bg-brand-gray-900/50 p-2 rounded-lg">
                                <span className="text-xs text-brand-gray-500 block mb-1">CTA:</span>
                                <span className="text-brand-neon-green text-sm font-semibold">
                                  {watchedValues.cta_text}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Technical Settings */}
                      <div className="pt-3 border-t border-brand-gray-700/50">
                        <span className="text-brand-gray-400 text-sm mb-2 block">Configurações:</span>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                                                     <div className="flex flex-col">
                             <span className="text-brand-gray-500">Qualidade:</span>
                             <span className="text-white capitalize">{watchedValues.quality}</span>
                           </div>
                          <div className="flex flex-col">
                            <span className="text-brand-gray-500">Formato:</span>
                            <span className="text-white uppercase">{watchedValues.output_format}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-brand-gray-500">Compressão:</span>
                            <span className="text-white">{watchedValues.output_compression}%</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-brand-gray-500">Fundo:</span>
                            <span className="text-white capitalize">{watchedValues.background}</span>
                          </div>
                        </div>
                      </div>

                      {/* Generate Button */}
                      <div className="pt-4">
                        <Button
                          type="submit"
                          disabled={isLoading || (isMultiFormat && selectedFormats.length === 0)}
                          className="w-full btn-neon h-12 text-base font-semibold"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                              {isMultiFormat ? "Criando múltiplos..." : "Criando..."}
                            </>
                          ) : (
                            <>
                              {isMultiFormat ? (
                                <>
                                  <Grid className="w-5 h-5 mr-2" />
                                  Gerar {(watchedValues.quantity || 1) * selectedFormats.length} Criativo{(watchedValues.quantity || 1) * selectedFormats.length !== 1 ? 's' : ''}
                                  <span className="ml-1 text-xs opacity-70">
                                    ({selectedFormats.length} formato{selectedFormats.length !== 1 ? 's' : ''} × {watchedValues.quantity || 1})
                                  </span>
                                </>
                              ) : (
                                <>
                                  <Send className="w-5 h-5 mr-2" />
                                  Gerar {watchedValues.quantity || 1} Criativo{(watchedValues.quantity || 1) !== 1 ? 's' : ''}
                                </>
                              )}
                            </>
                          )}
                        </Button>
                      </div>

                    </CardContent>
                  </Card>
                </div>
              </div>

            </div>
          </form>
        </Form>
      </div>
    </div>
  );
} 