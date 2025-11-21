"use client";

import { useState, useEffect, useMemo } from 'react';
import { useSupabaseRealtime } from '@/shared/hooks/useSupabaseRealtime';
import { createClient } from '@/shared/infra/supabase/client';
import { Badge } from "@/shared/ui/badge";
import { cn } from "@/shared/lib/utils";
import { Wifi, WifiOff, AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * Renders a small, real-time status indicator for the Supabase connection.
 * Only visible in development mode.
 */

// Define handlers and config as stable constants outside the component
const realtimeHandlers = {};
const realtimeConfig = { enableDebugLogs: true };

export function RealtimeStatusIndicator() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id ?? null);
    };
    fetchUser();
  }, []);

  const { connectionStatus, error } = useSupabaseRealtime(
    userId, 
    realtimeHandlers, 
    realtimeConfig
  );

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const getStatusInfo = () => {
    switch (connectionStatus) {
      case 'connected':
        return { 
          icon: <Wifi className="h-3 w-3" />, 
          text: `Realtime On`, 
          className: 'bg-green-500 hover:bg-green-600',
          tooltip: `Conexão Realtime ativa.`
        };
      case 'connecting':
        return { 
          icon: <RefreshCw className="h-3 w-3 animate-spin" />, 
          text: 'Connecting...', 
          className: 'bg-yellow-500 hover:bg-yellow-600',
          tooltip: 'Estabelecendo conexão com o servidor...'
        };
      case 'error':
        return { 
          icon: <AlertTriangle className="h-3 w-3" />, 
          text: 'Error', 
          className: 'bg-red-500 hover:bg-red-600',
          tooltip: error || 'Erro na conexão realtime'
        };
      default:
        return { 
          icon: <WifiOff className="h-3 w-3" />, 
          text: 'Realtime Off', 
          className: 'bg-gray-500 hover:bg-gray-600',
          tooltip: 'Conexão realtime não estabelecida'
        };
    }
  };

  const { icon, text, className, tooltip } = getStatusInfo();

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Badge 
        className={cn("flex items-center gap-2 text-white border-none cursor-help", className)}
        title={tooltip}
      >
        {icon}
        <span className="text-xs">{text}</span>
      </Badge>
    </div>
  );
} 