"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { cn } from '@/shared/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { 
  TrendingUp, 
  TrendingDown,
  Activity,
  Clock,
  Target,
  Trophy,
  Zap,
  BarChart3,
  Calendar,
  Users,
  Sparkles,
  Award,
  Star,
  RefreshCw,
  Eye,
  Heart,
  Image as ImageIcon,
  Timer,
  Gauge
} from 'lucide-react';
import { format, formatDistanceToNow, subDays, isToday, isYesterday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { UserStats, UserProfile } from '../actions';

interface StatsRealtimeProps {
  stats: UserStats | null;
  profile?: UserProfile | null;
  isLoading?: boolean;
  isConnected?: boolean;
  className?: string;
}

/**
 * 🚀 COMPONENTE STATS REALTIME DASHBOARD DESKTOP
 * 
 * Features:
 * - Real-time animated counters
 * - Trend analysis with visual indicators
 * - Performance metrics dashboard
 * - Desktop-optimized layout (1366x768, 1920x1080, 3440x1440)
 * - Connection status awareness
 * - Visual feedback for changes
 */
export function StatsRealtime({ 
  stats, 
  profile, 
  isLoading = false, 
  isConnected = true, 
  className 
}: StatsRealtimeProps) {
  
  // 📊 PREVIOUS STATS FOR COMPARISON
  const [previousStats, setPreviousStats] = useState<UserStats | null>(null);
  const [animatingFields, setAnimatingFields] = useState<Set<string>>(new Set());

  // 🔄 UPDATE DETECTION
  useEffect(() => {
    if (stats && previousStats) {
      const changedFields = new Set<string>();
      
      // Detectar campos que mudaram para animação
      if ((stats.total_creatives || 0) !== (previousStats.total_creatives || 0)) {
        changedFields.add('total_creatives');
      }
      if ((stats.total_views || 0) !== (previousStats.total_views || 0)) {
        changedFields.add('total_views');
      }
      if ((stats.total_achievement_points || 0) !== (previousStats.total_achievement_points || 0)) {
        changedFields.add('total_achievement_points');
      }
      
      if (changedFields.size > 0) {
        setAnimatingFields(changedFields);
        
        // Remover animação depois de 2 segundos
        setTimeout(() => {
          setAnimatingFields(new Set());
        }, 2000);
      }
    }
    
    setPreviousStats(stats);
  }, [stats, previousStats]);

  // 📈 CALCULATED METRICS
  const calculatedMetrics = useMemo(() => {
    if (!stats || !profile) return null;
    
    const now = new Date();
    const createdAt = new Date(profile.created_at);
    const daysSinceJoined = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
    const totalCreatives = stats.total_creatives || 0;
    const totalViews = stats.total_views || 0;
    
    return {
      daysSinceJoined,
      creativesPerDay: daysSinceJoined > 0 ? (totalCreatives / daysSinceJoined).toFixed(1) : '0',
      avgProcessingTime: totalCreatives > 0 && stats.avg_processing_time_ms ? 
        Math.round(stats.avg_processing_time_ms / 1000) : 0,
      viewRate: totalCreatives > 0 ? 
        Math.round((totalViews / totalCreatives) * 100) : 0
    };
  }, [stats, profile]);

  // 🎯 ACHIEVEMENT LEVELS
  const achievementLevel = useMemo(() => {
    if (!stats) return { level: 'Iniciante', progress: 0, next: 10 };
    
    const total = stats.total_creatives || 0;
    
    if (total >= 1000) return { level: 'Mestre', progress: 100, next: null };
    if (total >= 500) return { level: 'Expert', progress: (total - 500) / 500 * 100, next: 1000 };
    if (total >= 100) return { level: 'Avançado', progress: (total - 100) / 400 * 100, next: 500 };
    if (total >= 25) return { level: 'Intermediário', progress: (total - 25) / 75 * 100, next: 100 };
    if (total >= 10) return { level: 'Novato', progress: (total - 10) / 15 * 100, next: 25 };
    
    return { level: 'Iniciante', progress: total / 10 * 100, next: 10 };
  }, [stats]);

  // 🎨 ANIMATED COUNTER COMPONENT
  const AnimatedCounter = ({ 
    value, 
    isAnimating, 
    suffix = '', 
    className: counterClassName 
  }: { 
    value: number; 
    isAnimating?: boolean; 
    suffix?: string; 
    className?: string; 
  }) => (
    <span className={cn(
      "transition-all duration-500",
      isAnimating && "text-brand-neon-green scale-110",
      counterClassName
    )}>
      {value.toLocaleString('pt-BR')}{suffix}
    </span>
  );

  // 💾 LOADING STATE
  if (isLoading) {
    return <StatsRealtimeSkeleton className={className} />;
  }

  if (!stats) {
    return (
      <div className={cn("space-y-6", className)}>
        <Card className="card-glass-intense border-brand-gray-700/50">
          <CardContent className="p-8 text-center">
            <Activity className="w-12 h-12 mx-auto mb-4 text-brand-gray-500" />
            <p className="text-brand-gray-400">Nenhuma estatística disponível</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      
      {/* 🔗 CONNECTION STATUS BAR */}
      <div className={cn(
        "flex items-center justify-between p-3 rounded-lg transition-all duration-300",
        isConnected 
          ? "bg-green-500/10 border border-green-500/20" 
          : "bg-red-500/10 border border-red-500/20"
      )}>
        <div className="flex items-center space-x-2">
          <div className={cn(
            "w-2 h-2 rounded-full",
            isConnected ? "bg-green-400 animate-pulse" : "bg-red-400"
          )} />
          <span className={cn(
            "text-sm font-medium",
            isConnected ? "text-green-400" : "text-red-400"
          )}>
            {isConnected ? 'Dados em tempo real' : 'Desconectado'}
          </span>
        </div>
        
        <Button
          size="sm"
          variant="ghost"
          className="h-6 px-2 text-xs"
          onClick={() => window.location.reload()}
        >
          <RefreshCw className="w-3 h-3 mr-1" />
          Atualizar
        </Button>
      </div>

      {/* 📊 MAIN STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        
        {/* 🎨 TOTAL CREATIVES */}
        <Card className="card-glass-intense border-brand-gray-700/50 hover:border-brand-neon-green/30 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-brand-gray-400 mb-1">Total de Criativos</p>
                <p className="text-2xl font-bold text-white">
                  <AnimatedCounter 
                    value={stats.total_creatives || 0} 
                    isAnimating={animatingFields.has('total_creatives')}
                  />
                </p>
                {calculatedMetrics && (
                  <p className="text-xs text-brand-gray-500 mt-1">
                    {calculatedMetrics.creativesPerDay}/dia em média
                  </p>
                )}
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ⭐ TOTAL VIEWS */}
        <Card className="card-glass-intense border-brand-gray-700/50 hover:border-yellow-500/30 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-brand-gray-400 mb-1">Views</p>
                <p className="text-2xl font-bold text-white">
                  <AnimatedCounter 
                    value={stats.total_views || 0} 
                    isAnimating={animatingFields.has('total_views')}
                  />
                </p>
                {calculatedMetrics && (
                  <p className="text-xs text-brand-gray-500 mt-1">
                    {calculatedMetrics.viewRate}% dos criativos
                  </p>
                )}
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 🏆 ACHIEVEMENTS */}
        <Card className="card-glass-intense border-brand-gray-700/50 hover:border-green-500/30 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-brand-gray-400 mb-1">Pontos</p>
                <p className="text-2xl font-bold text-white">
                  <AnimatedCounter 
                    value={stats.total_achievement_points || 0} 
                    isAnimating={animatingFields.has('total_achievement_points')}
                  />
                </p>
                <p className="text-xs text-brand-gray-500 mt-1">
                  Nível: {achievementLevel.level}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg flex items-center justify-center">
                <Trophy className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ⏱️ PROCESSING TIME */}
        <Card className="card-glass-intense border-brand-gray-700/50 hover:border-blue-500/30 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-brand-gray-400 mb-1">Tempo Médio</p>
                <p className="text-2xl font-bold text-white">
                  {calculatedMetrics?.avgProcessingTime || 0}s
                </p>
                <p className="text-xs text-brand-gray-500 mt-1">
                  Por criativo
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg flex items-center justify-center">
                <Timer className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 📈 PERFORMANCE DASHBOARD */}
      <Card className="card-glass-intense border-brand-gray-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Gauge className="w-5 h-5 text-brand-neon-green" />
            <span>Performance & Progresso</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* 🎯 ACHIEVEMENT PROGRESS */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-brand-gray-300">
                Progresso para {achievementLevel.level}
              </span>
              <span className="text-xs text-brand-gray-400">
                {achievementLevel.next ? `${stats.total_creatives}/${achievementLevel.next}` : 'Máximo'}
              </span>
            </div>
            <div className="w-full bg-brand-gray-800 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-brand-neon-green to-green-400 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${Math.min(achievementLevel.progress, 100)}%` }}
              />
            </div>
          </div>

          {/* 📊 METRICS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* 📅 TEMPO ATIVO */}
            <div className="p-4 rounded-lg bg-brand-gray-800/30 border border-brand-gray-700/50">
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-white">Tempo Ativo</span>
              </div>
              <p className="text-lg font-bold text-white">
                {calculatedMetrics?.daysSinceJoined || 0} dias
              </p>
              <p className="text-xs text-brand-gray-400">
                Desde {profile?.created_at ? format(new Date(profile.created_at), 'dd MMM yyyy', { locale: ptBR }) : 'N/A'}
              </p>
            </div>

            {/* ⚡ TAXA DE FAVORITOS */}
            <div className="p-4 rounded-lg bg-brand-gray-800/30 border border-brand-gray-700/50">
              <div className="flex items-center space-x-2 mb-2">
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-medium text-white">Taxa Favoritos</span>
              </div>
              <p className="text-lg font-bold text-white">
                {calculatedMetrics?.viewRate || 0}%
              </p>
              <p className="text-xs text-brand-gray-400">
                {stats.total_views} de {stats.total_creatives} criativos
              </p>
            </div>

            {/* 🔄 ÚLTIMA ATIVIDADE */}
            <div className="p-4 rounded-lg bg-brand-gray-800/30 border border-brand-gray-700/50">
              <div className="flex items-center space-x-2 mb-2">
                <Eye className="w-4 h-4 text-green-400" />
                <span className="text-sm font-medium text-white">Última Atividade</span>
              </div>
              <p className="text-lg font-bold text-white">
                {stats.last_activity_date ? format(new Date(stats.last_activity_date), 'dd/MM', { locale: ptBR }) : 'N/A'}
              </p>
              <p className="text-xs text-brand-gray-400">
                {stats.last_activity_date ? formatDistanceToNow(new Date(stats.last_activity_date), { addSuffix: true, locale: ptBR }) : 'Sem registro'}
              </p>
            </div>
          </div>

        </CardContent>
      </Card>

    </div>
  );
}

/**
 * 💀 LOADING SKELETON
 */
function StatsRealtimeSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-6", className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="card-glass-intense border-brand-gray-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="w-20 h-4 bg-brand-gray-700 rounded animate-pulse" />
                  <div className="w-16 h-8 bg-brand-gray-700 rounded animate-pulse" />
                  <div className="w-24 h-3 bg-brand-gray-700 rounded animate-pulse" />
                </div>
                <div className="w-12 h-12 bg-brand-gray-700 rounded-lg animate-pulse" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card className="card-glass-intense border-brand-gray-700/50">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="w-48 h-6 bg-brand-gray-700 rounded animate-pulse" />
            <div className="w-full h-2 bg-brand-gray-700 rounded animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-4 bg-brand-gray-700/20 rounded-lg">
                  <div className="space-y-2">
                    <div className="w-24 h-4 bg-brand-gray-700 rounded animate-pulse" />
                    <div className="w-16 h-6 bg-brand-gray-700 rounded animate-pulse" />
                    <div className="w-20 h-3 bg-brand-gray-700 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default StatsRealtime;