// Tipos gerados automaticamente do Supabase
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          id: string
          name: string | null
          role: 'admin' | 'user' | null
          updated_at: string
        }
      }
      user_stats: {
        Row: {
          avg_processing_time_ms: number | null
          avg_session_duration_minutes: number | null
          calculated_at: string | null
          creatives_this_month: number | null
          creatives_this_week: number | null
          creatives_this_year: number | null
          creatives_today: number | null
          current_streak_days: number | null
          experience_points: number | null
          fastest_creation_time_ms: number | null
          favorite_time_of_day: number | null
          last_activity_date: string | null
          longest_streak_days: number | null
          most_used_format: string | null
          most_used_style: string | null
          next_level_xp: number | null
          productivity_score: number | null
          quality_score: number | null
          success_rate_percentage: number | null
          total_achievement_points: number | null
          total_completed: number | null
          total_creatives: number | null
          total_downloads: number | null
          total_failed: number | null
          total_likes: number | null
          total_requests: number | null
          total_shares: number | null
          total_time_saved_estimation_ms: number | null
          total_views: number | null
          updated_at: string | null
          user_id: string
          user_level: number | null
        }
      }
    }
  }
}

// Tipos de conveniência
export type UserProfile = Database['public']['Tables']['users']['Row'] & {
  bio?: string | null; // Campo extra para o formulário
}

export type UserStats = Database['public']['Tables']['user_stats']['Row'] 