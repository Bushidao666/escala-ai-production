"use client";

import { useEffect, useState, useRef, useMemo } from 'react';
import { createClient } from '@/shared/infra/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

// Simplified Hook State
interface RealtimeState {
  isConnected: boolean;
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
  error: string | null;
}

// Event Handlers
export interface RealtimeHandlers {
  onUpdate?: () => void;
  onConnectionChange?: (connected: boolean) => void;
  onError?: (error: string) => void;
  onCreativeStatusChange?: (creativeId: string, requestId: string | null, newStatus: string) => void;
  onAutoFixExecuted?: (correctedCount: number) => void;
}

// Simplified Configuration
interface RealtimeConfig {
  enabled?: boolean;
  enableDebugLogs?: boolean;
  enableSmartStatusUpdates?: boolean;
  enableAutoFix?: boolean;
  autoFixInterval?: number;
}

const DEFAULT_CONFIG: Required<RealtimeConfig> = {
  enabled: true,
  enableDebugLogs: process.env.NODE_ENV === 'development',
  enableSmartStatusUpdates: true,
  enableAutoFix: true,
  autoFixInterval: 5,
};

// 🆕 Função para executar auto-fix via Edge Function
async function executeAutoFix() {
  try {
    console.log(`🤖 [Auto-Fix] Triggering automated status correction...`);
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const response = await fetch(`${supabaseUrl}/functions/v1/auto-fix-request-statuses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(`Auto-fix failed: ${result.error || response.statusText}`);
    }

    console.log(`✅ [Auto-Fix] Completed: ${result.correctedCount} requests corrected`);
    return result;
    
  } catch (error: any) {
    console.error(`❌ [Auto-Fix] Failed:`, error);
    return { correctedCount: 0, error: error.message };
  }
}

// 🆕 Função para executar atualização inteligente de status
async function executeSmartStatusUpdate(requestId: string) {
  try {
    console.log(`🧠 [Smart Update] Triggering status update for request: ${requestId}`);
    
    // Importa dinamicamente a action (evita circular dependency)
    const { smartUpdateRequestStatus } = await import('@/app/new/actions');
    await smartUpdateRequestStatus(requestId);
    
    console.log(`✅ [Smart Update] Request ${requestId} status updated successfully`);
  } catch (error: any) {
    console.error(`❌ [Smart Update] Failed to update request ${requestId} status:`, error);
  }
}

// 🆕 Debounce utility para evitar múltiplas chamadas simultâneas
const debounceMap = new Map<string, NodeJS.Timeout>();

function debounceSmartUpdate(requestId: string, delay = 2000) {
  // Cancela update anterior se existir
  if (debounceMap.has(requestId)) {
    clearTimeout(debounceMap.get(requestId)!);
  }
  
  // Agenda novo update
  const timeoutId = setTimeout(() => {
    executeSmartStatusUpdate(requestId);
    debounceMap.delete(requestId);
  }, delay);
  
  debounceMap.set(requestId, timeoutId);
}

// 🆕 Auto-fix interval management
let autoFixInterval: NodeJS.Timeout | null = null;

export function useSupabaseRealtime(
  userId: string | null,
  handlers: RealtimeHandlers = {},
  config: RealtimeConfig = {}
) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  // 1. Memoize the supabase client to prevent re-creation on every render
  const supabase = useMemo(() => createClient(), []);
  
  // Simplified State Management
  const [state, setState] = useState<RealtimeState>({
    isConnected: false,
    connectionStatus: 'disconnected',
    error: null,
  });

  // Refs for cleanup
  const channelsRef = useRef<RealtimeChannel[]>([]);

  // Debug logging utility
  const log = (message: string, data?: any) => {
    if (finalConfig.enableDebugLogs) {
      console.log(`[Realtime] ${message}`, data || '');
    }
  };
  
  // 4. Extract handlers to ensure stable references for the useEffect dependency array
  const { onUpdate, onConnectionChange, onError, onCreativeStatusChange, onAutoFixExecuted } = handlers;

  // 🆕 Setup auto-fix interval
  useEffect(() => {
    if (!finalConfig.enableAutoFix || !userId) {
      return;
    }

    const intervalMs = finalConfig.autoFixInterval * 60 * 1000; // Convert minutes to milliseconds
    
    log(`Setting up auto-fix interval: ${finalConfig.autoFixInterval} minutes`);
    
    autoFixInterval = setInterval(async () => {
      try {
        const result = await executeAutoFix();
        if (result.correctedCount > 0 && onAutoFixExecuted) {
          onAutoFixExecuted(result.correctedCount);
        }
        if (result.correctedCount > 0 && onUpdate) {
          onUpdate(); // Refresh UI if corrections were made
        }
      } catch (error) {
        console.error('Auto-fix interval error:', error);
      }
    }, intervalMs);

    return () => {
      if (autoFixInterval) {
        clearInterval(autoFixInterval);
        autoFixInterval = null;
      }
    };
  }, [finalConfig.enableAutoFix, finalConfig.autoFixInterval, userId, onAutoFixExecuted, onUpdate]);

  // Setup realtime connections - NO circular dependencies
  useEffect(() => {
    // Skip if no user or realtime disabled
    if (!userId || !finalConfig.enabled) {
      setState({
        isConnected: false,
        connectionStatus: 'disconnected',
        error: null,
      });
      return;
    }

    log('Setting up realtime channels for user', userId);
    
    setState(prev => ({ ...prev, connectionStatus: 'connecting' }));

    // Cleanup existing channels first
    channelsRef.current.forEach(channel => {
      supabase.removeChannel(channel);
    });
    channelsRef.current = [];

    // Create channels for each table
    const tables = ['creatives', 'queue_jobs', 'creative_requests'];
    const newChannels: RealtimeChannel[] = [];

    tables.forEach(table => {
      // 2. Make channel name stable, removing Date.now()
      const channelName = `${table}-${userId}`;
      
      log(`Creating channel for ${table}`, { channelName, userId });

      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table,
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            log(`Received ${payload.eventType} on ${table}`, payload);
            
            // 🆕 NOVA LÓGICA: Detecção inteligente de mudanças em criativos
            if (table === 'creatives' && finalConfig.enableSmartStatusUpdates && payload.eventType === 'UPDATE') {
              const newRecord = payload.new as any;
              const oldRecord = payload.old as any;
              
              // Verifica se o status mudou e se o creative pertence a um request
              if (newRecord?.status !== oldRecord?.status && newRecord?.request_id) {
                log(`🔄 Creative status changed: ${oldRecord?.status} -> ${newRecord?.status} for request ${newRecord.request_id}`);
                
                // Chama handler customizado se fornecido
                if (onCreativeStatusChange) {
                  onCreativeStatusChange(newRecord.id, newRecord.request_id, newRecord.status);
                }
                
                // 🆕 EXECUTA CORREÇÃO AUTOMÁTICA: Trigger immediate auto-fix for this specific request
                if (finalConfig.enableAutoFix) {
                  // Execute auto-fix específico para este request após um delay
                  setTimeout(async () => {
                    try {
                      const result = await executeAutoFix();
                      if (result.correctedCount > 0 && onAutoFixExecuted) {
                        onAutoFixExecuted(result.correctedCount);
                      }
                    } catch (error) {
                      console.error('Immediate auto-fix error:', error);
                    }
                  }, 3000); // 3 segundos de delay para permitir que outras mudanças sejam processadas
                }
                
                // Executa atualização inteligente com debounce (backup)
                debounceSmartUpdate(newRecord.request_id);
              }
            }
            
            // 🆕 NOVA LÓGICA: Detecção de mudanças diretas em creative_requests
            if (table === 'creative_requests' && payload.eventType === 'UPDATE') {
              const newRecord = payload.new as any;
              const oldRecord = payload.old as any;
              
              if (newRecord?.status !== oldRecord?.status) {
                log(`📊 Request status changed: ${oldRecord?.status} -> ${newRecord?.status} for request ${newRecord.id}`);
              }
            }
            
            // Call the general update handler
            if (onUpdate) {
              onUpdate();
            }
          }
        )
        .subscribe((status, err) => {
          log(`Channel status [${channelName}]: ${status}`, err || '');
          
          if (status === 'SUBSCRIBED') {
            setState(prev => ({ 
              ...prev, 
              isConnected: true, 
              connectionStatus: 'connected',
              error: null 
            }));
            if (onConnectionChange) {
              onConnectionChange(true);
            }
          } else if (status === 'CHANNEL_ERROR') {
            setState(prev => ({ 
              ...prev, 
              connectionStatus: 'error',
              error: err?.message || 'Channel subscription failed'
            }));
            if (onError) {
              onError(err?.message || 'Channel subscription failed');
            }
          } else if (status === 'CLOSED') {
            setState(prev => ({ 
              ...prev, 
              isConnected: false, 
              connectionStatus: 'disconnected' 
            }));
            if (onConnectionChange) {
              onConnectionChange(false);
            }
          }
        });

      newChannels.push(channel);
    });

    channelsRef.current = newChannels;

    // Cleanup function
    return () => {
      log('Cleaning up realtime connections');
      
      // Limpa debounce pendentes
      debounceMap.forEach((timeoutId) => {
        clearTimeout(timeoutId);
      });
      debounceMap.clear();
      
      newChannels.forEach(channel => {
        supabase.removeChannel(channel);
      });
      
      setState({
        isConnected: false,
        connectionStatus: 'disconnected',
        error: null,
      });
      
      if (onConnectionChange) {
        onConnectionChange(false);
      }
    };
  }, [userId, finalConfig.enabled, finalConfig.enableSmartStatusUpdates, finalConfig.enableAutoFix, supabase, onUpdate, onConnectionChange, onError, onCreativeStatusChange]); // 3. Correct dependencies

  // Public API
  return {
    isConnected: state.isConnected,
    connectionStatus: state.connectionStatus,
    error: state.error,
    // 🆕 Função para executar auto-fix manual
    executeAutoFix: () => executeAutoFix(),
  };
} 