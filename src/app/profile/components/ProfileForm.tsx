"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { 
  User, 
  Save, 
  Loader2, 
  Check, 
  AlertCircle,
  FileText,
  Clock,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { UserProfile } from "../page";
import { profileSchema, type ProfileUpdateData } from '@/app/profile/actions';

/**
 * 🎯 SCHEMA DE VALIDAÇÃO PROFILE FORM
 */
const profileFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(50, 'Nome deve ter no máximo 50 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras e espaços'),
  
  bio: z
    .string()
    .max(200, 'Bio deve ter no máximo 200 caracteres')
    .optional()
    .or(z.literal(''))
});

type ProfileFormData = z.infer<typeof profileFormSchema>;

interface ProfileFormProps {
  profile: UserProfile;
  onUpdate: (data: ProfileUpdateData) => Promise<void>;
  className?: string;
}

/**
 * 🚀 COMPONENTE PROFILE FORM COM AUTO-SAVE REALTIME
 * 
 * Features:
 * - Auto-save com debounce de 2 segundos
 * - Validação em tempo real
 * - Estados visuais elaborados
 * - Desktop-optimized UX
 * - Optimistic updates
 * - Save status indicators
 */
export function ProfileForm({ profile, onUpdate, className }: ProfileFormProps) {
  
  // 🏗️ FORM STATE
  const form = useForm<ProfileUpdateData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile.name || '',
      bio: profile.bio || '',
    },
  });

  // 📊 COMPONENT STATE
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  
  // 🔄 DEBOUNCE REFS
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastFormDataRef = useRef<string>('');

  // 👀 WATCH FORM VALUES
  const watchedValues = form.watch();
  const formDataString = JSON.stringify(watchedValues);

  // 💾 AUTO-SAVE FUNCTION
  const performAutoSave = useCallback(async (data: ProfileUpdateData) => {
    if (!form.formState.isDirty || !form.formState.isValid) return;
    
    setSaveStatus('saving');
    
    try {
      // Preparar dados para envio (apenas campos que mudaram)
      const updates: Partial<UserProfile> = {};
      
      if (data.name !== profile.name) {
        updates.name = data.name;
      }
      
      if (data.bio !== profile.bio) {
        updates.bio = data.bio;
      }

      if (Object.keys(updates).length > 0) {
        await onUpdate(updates);
        setLastSaveTime(new Date());
        setSaveStatus('saved');
        
        // Resetar dirty state
        form.reset(data, { keepValues: true });
        
        // Feedback visual sutil
        toast.success('Perfil salvo automaticamente', {
          description: 'Suas alterações foram salvas',
          duration: 2000
        });
      }
      
    } catch (error: any) {
      setSaveStatus('error');
      toast.error('Erro ao salvar', {
        description: error.message || 'Tente novamente'
      });
    }
  }, [form.formState.isDirty, form.formState.isValid, profile, onUpdate, form.reset]);

  // 🔄 AUTO-SAVE EFFECT
  useEffect(() => {
    // Verificar se os dados mudaram
    if (formDataString === lastFormDataRef.current) {
      return;
    }
    
    lastFormDataRef.current = formDataString;
    
    // Limpar timeout anterior
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Configurar novo timeout para auto-save
    if (form.formState.isDirty && form.formState.isValid) {
      setSaveStatus('idle');
      
      saveTimeoutRef.current = setTimeout(() => {
        performAutoSave(watchedValues);
      }, 2000); // 2 segundos de debounce
    }
    
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [formDataString, form.formState.isDirty, form.formState.isValid, watchedValues, performAutoSave]);

  // 🧹 CLEANUP
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // 💾 MANUAL SAVE HANDLER
  const handleManualSave = useCallback(async (data: ProfileUpdateData) => {
    await performAutoSave(data);
  }, [performAutoSave]);

  // 📝 FORMAT LAST SAVE TIME
  const formatLastSaveTime = useCallback(() => {
    if (!lastSaveTime) return null;
    
    const now = new Date();
    const diff = now.getTime() - lastSaveTime.getTime();
    const seconds = Math.floor(diff / 1000);
    
    if (seconds < 10) return 'agora mesmo';
    if (seconds < 60) return `${seconds}s atrás`;
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m atrás`;
    
    return lastSaveTime.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }, [lastSaveTime]);

  // 🎨 STATUS INDICATOR COMPONENT
  const SaveStatusIndicator = () => {
    switch (saveStatus) {
      case 'saving':
        return (
          <div className="flex items-center space-x-2 text-blue-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Salvando...</span>
          </div>
        );
      case 'saved':
        return (
          <div className="flex items-center space-x-2 text-green-400">
            <Check className="w-4 h-4" />
            <span className="text-sm">Salvo {formatLastSaveTime()}</span>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center space-x-2 text-red-400">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">Erro ao salvar</span>
          </div>
        );
      default:
        return form.formState.isDirty ? (
          <div className="flex items-center space-x-2 text-brand-gray-400">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Auto-save em 2s</span>
          </div>
        ) : null;
    }
  };

  const onSubmit = (data: ProfileUpdateData) => {
    toast.promise(onUpdate(data), {
      loading: 'Salvando alterações...',
      success: 'Perfil atualizado com sucesso!',
      error: 'Falha ao salvar. Tente novamente.',
    });
  };

  return (
    <Card className={cn("card-glass-intense border-brand-gray-700/50", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center space-x-2">
            <User className="w-5 h-5 text-brand-neon-green" />
            <span>Informações Pessoais</span>
          </CardTitle>
          
          {/* 💾 SAVE STATUS */}
          <div className="flex items-center space-x-3">
            <SaveStatusIndicator />
            
            {form.formState.isDirty && (
              <Button
                size="sm"
                onClick={form.handleSubmit(onSubmit)}
                disabled={!form.formState.isValid || saveStatus === 'saving'}
                className="btn-neon text-xs px-3 py-1.5 h-auto"
              >
                <Save className="w-3 h-3 mr-1" />
                Salvar
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        
        {/* 📝 NOME FIELD */}
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium text-brand-gray-300 flex items-center space-x-2">
            <User className="w-4 h-4 text-brand-neon-green" />
            <span>Nome completo</span>
            <span className="text-red-400">*</span>
          </label>
          
          <Input
            id="name"
            {...form.register('name')}
            placeholder="Digite seu nome completo"
            className={cn(
              "input-glass transition-all duration-200",
              "focus:border-brand-neon-green/50 focus:ring-brand-neon-green/25",
              form.formState.errors.name && "border-red-500/50 focus:border-red-500/50 focus:ring-red-500/25"
            )}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
          
          {form.formState.errors.name && (
            <div className="flex items-center space-x-2 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{form.formState.errors.name.message}</span>
            </div>
          )}
          
          {!form.formState.errors.name && watchedValues.name && (
            <p className="text-xs text-brand-gray-500">
              {watchedValues.name.length}/50 caracteres
            </p>
          )}
        </div>

        {/* 📄 BIO FIELD (Placeholder for future implementation) */}
        <div className="space-y-2">
          <label htmlFor="bio" className="text-sm font-medium text-brand-gray-300 flex items-center space-x-2">
            <FileText className="w-4 h-4 text-brand-neon-green" />
            <span>Bio</span>
            <span className="text-xs text-brand-gray-500">(em breve)</span>
          </label>
          
          <Textarea
            id="bio"
            {...form.register('bio')}
            placeholder="Conte um pouco sobre você... (funcionalidade em desenvolvimento)"
            disabled
            className={cn(
              "input-glass min-h-[80px] resize-none transition-all duration-200",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          />
          
          <p className="text-xs text-brand-gray-500">
            Campo bio será habilitado na próxima atualização
          </p>
        </div>

        {/* ⚡ FEATURES INFO */}
        <div className="pt-4 border-t border-brand-gray-700/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-brand-neon-green/5 border border-brand-neon-green/20">
              <div className="w-8 h-8 bg-brand-neon-green/20 rounded-full flex items-center justify-center">
                <Zap className="w-4 h-4 text-brand-neon-green" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Auto-save</p>
                <p className="text-xs text-brand-gray-400">Salva automaticamente em 2s</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
              <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Validação</p>
                <p className="text-xs text-brand-gray-400">Validação em tempo real</p>
              </div>
            </div>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}

export default ProfileForm;