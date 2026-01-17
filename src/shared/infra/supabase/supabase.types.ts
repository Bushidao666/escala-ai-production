export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      achievement_definitions: {
        Row: {
          category: string
          created_at: string | null
          criteria: Json
          description: string
          icon: string
          id: string
          is_active: boolean | null
          is_hidden: boolean | null
          name: string
          points_value: number | null
          rarity: string | null
          reward_type: string | null
          reward_value: number | null
          sort_order: number | null
          tags: string[] | null
          type: string
          unlock_message: string | null
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          criteria: Json
          description: string
          icon: string
          id: string
          is_active?: boolean | null
          is_hidden?: boolean | null
          name: string
          points_value?: number | null
          rarity?: string | null
          reward_type?: string | null
          reward_value?: number | null
          sort_order?: number | null
          tags?: string[] | null
          type: string
          unlock_message?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          criteria?: Json
          description?: string
          icon?: string
          id?: string
          is_active?: boolean | null
          is_hidden?: boolean | null
          name?: string
          points_value?: number | null
          rarity?: string | null
          reward_type?: string | null
          reward_value?: number | null
          sort_order?: number | null
          tags?: string[] | null
          type?: string
          unlock_message?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      creative_interactions: {
        Row: {
          created_at: string | null
          creative_id: string
          device_type: string | null
          duration_ms: number | null
          id: string
          interaction_type: string
          metadata: Json | null
          screen_size: string | null
          source: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          creative_id: string
          device_type?: string | null
          duration_ms?: number | null
          id?: string
          interaction_type: string
          metadata?: Json | null
          screen_size?: string | null
          source?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          creative_id?: string
          device_type?: string | null
          duration_ms?: number | null
          id?: string
          interaction_type?: string
          metadata?: Json | null
          screen_size?: string | null
          source?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "creative_interactions_creative_id_fkey"
            columns: ["creative_id"]
            isOneToOne: false
            referencedRelation: "creatives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creative_interactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      creative_requests: {
        Row: {
          created_at: string | null
          cta_text: string | null
          description: string | null
          headline: string | null
          id: string
          logo_url: string | null
          primary_color: string | null
          product_images: Json | null
          prompt: string
          requested_formats: string[]
          secondary_color: string | null
          status: Database["public"]["Enums"]["creative_request_status"] | null
          style: string | null
          sub_headline: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          cta_text?: string | null
          description?: string | null
          headline?: string | null
          id?: string
          logo_url?: string | null
          primary_color?: string | null
          product_images?: Json | null
          prompt: string
          requested_formats: string[]
          secondary_color?: string | null
          status?: Database["public"]["Enums"]["creative_request_status"] | null
          style?: string | null
          sub_headline?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          cta_text?: string | null
          description?: string | null
          headline?: string | null
          id?: string
          logo_url?: string | null
          primary_color?: string | null
          product_images?: Json | null
          prompt?: string
          requested_formats?: string[]
          secondary_color?: string | null
          status?: Database["public"]["Enums"]["creative_request_status"] | null
          style?: string | null
          sub_headline?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "creative_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      creatives: {
        Row: {
          background: Database["public"]["Enums"]["background_type"] | null
          created_at: string
          cta_text: string | null
          description: string | null
          error_message: string | null
          format: Database["public"]["Enums"]["creative_format"] | null
          generated_image_url: string | null
          headline: string | null
          id: string
          logo_url: string | null
          output_compression: number | null
          output_format: Database["public"]["Enums"]["output_format"] | null
          primary_color: string | null
          processed_at: string | null
          processing_time_ms: number | null
          product_images: Json | null
          prompt: string
          quality: Database["public"]["Enums"]["image_quality"] | null
          request_id: string | null
          result_url: string | null
          secondary_color: string | null
          status: Database["public"]["Enums"]["creative_status"] | null
          style: string | null
          sub_headline: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          background?: Database["public"]["Enums"]["background_type"] | null
          created_at?: string
          cta_text?: string | null
          description?: string | null
          error_message?: string | null
          format?: Database["public"]["Enums"]["creative_format"] | null
          generated_image_url?: string | null
          headline?: string | null
          id?: string
          logo_url?: string | null
          output_compression?: number | null
          output_format?: Database["public"]["Enums"]["output_format"] | null
          primary_color?: string | null
          processed_at?: string | null
          processing_time_ms?: number | null
          product_images?: Json | null
          prompt: string
          quality?: Database["public"]["Enums"]["image_quality"] | null
          request_id?: string | null
          result_url?: string | null
          secondary_color?: string | null
          status?: Database["public"]["Enums"]["creative_status"] | null
          style?: string | null
          sub_headline?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          background?: Database["public"]["Enums"]["background_type"] | null
          created_at?: string
          cta_text?: string | null
          description?: string | null
          error_message?: string | null
          format?: Database["public"]["Enums"]["creative_format"] | null
          generated_image_url?: string | null
          headline?: string | null
          id?: string
          logo_url?: string | null
          output_compression?: number | null
          output_format?: Database["public"]["Enums"]["output_format"] | null
          primary_color?: string | null
          processed_at?: string | null
          processing_time_ms?: number | null
          product_images?: Json | null
          prompt?: string
          quality?: Database["public"]["Enums"]["image_quality"] | null
          request_id?: string | null
          result_url?: string | null
          secondary_color?: string | null
          status?: Database["public"]["Enums"]["creative_status"] | null
          style?: string | null
          sub_headline?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "creatives_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "creative_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creatives_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      queue_jobs: {
        Row: {
          attempts: number | null
          created_at: string
          creative_id: string
          error_message: string | null
          id: string
          max_attempts: number | null
          priority: number | null
          processing_completed_at: string | null
          processing_started_at: string | null
          status: Database["public"]["Enums"]["job_status"] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          attempts?: number | null
          created_at?: string
          creative_id: string
          error_message?: string | null
          id?: string
          max_attempts?: number | null
          priority?: number | null
          processing_completed_at?: string | null
          processing_started_at?: string | null
          status?: Database["public"]["Enums"]["job_status"] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          attempts?: number | null
          created_at?: string
          creative_id?: string
          error_message?: string | null
          id?: string
          max_attempts?: number | null
          priority?: number | null
          processing_completed_at?: string | null
          processing_started_at?: string | null
          status?: Database["public"]["Enums"]["job_status"] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "queue_jobs_creative_id_fkey"
            columns: ["creative_id"]
            isOneToOne: false
            referencedRelation: "creatives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "queue_jobs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_id: string
          created_at: string | null
          current_progress: number | null
          id: string
          is_featured: boolean | null
          is_new: boolean | null
          max_progress: number | null
          seen_at: string | null
          unlock_context: Json | null
          unlocked_at: string | null
          user_id: string
        }
        Insert: {
          achievement_id: string
          created_at?: string | null
          current_progress?: number | null
          id?: string
          is_featured?: boolean | null
          is_new?: boolean | null
          max_progress?: number | null
          seen_at?: string | null
          unlock_context?: Json | null
          unlocked_at?: string | null
          user_id: string
        }
        Update: {
          achievement_id?: string
          created_at?: string | null
          current_progress?: number | null
          id?: string
          is_featured?: boolean | null
          is_new?: boolean | null
          max_progress?: number | null
          seen_at?: string | null
          unlock_context?: Json | null
          unlocked_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievement_definitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activity_log: {
        Row: {
          activity_type: string
          browser: string | null
          created_at: string | null
          device_type: string | null
          duration_ms: number | null
          id: string
          ip_address: unknown | null
          metadata: Json | null
          os: string | null
          page_url: string | null
          referrer_url: string | null
          resource_id: string | null
          resource_type: string | null
          session_id: string | null
          sub_activity: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          activity_type: string
          browser?: string | null
          created_at?: string | null
          device_type?: string | null
          duration_ms?: number | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          os?: string | null
          page_url?: string | null
          referrer_url?: string | null
          resource_id?: string | null
          resource_type?: string | null
          session_id?: string | null
          sub_activity?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          activity_type?: string
          browser?: string | null
          created_at?: string | null
          device_type?: string | null
          duration_ms?: number | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          os?: string | null
          page_url?: string | null
          referrer_url?: string | null
          resource_id?: string | null
          resource_type?: string | null
          session_id?: string | null
          sub_activity?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_activity_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_favorites: {
        Row: {
          created_at: string | null
          creative_id: string
          folder_name: string | null
          id: string
          notes: string | null
          priority: number | null
          tags: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          creative_id: string
          folder_name?: string | null
          id?: string
          notes?: string | null
          priority?: number | null
          tags?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          creative_id?: string
          folder_name?: string | null
          id?: string
          notes?: string | null
          priority?: number | null
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_favorites_creative_id_fkey"
            columns: ["creative_id"]
            isOneToOne: false
            referencedRelation: "creatives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_insights: {
        Row: {
          action_text: string | null
          action_type: string | null
          action_url: string | null
          category: string
          created_at: string | null
          data: Json | null
          description: string
          dismissed_at: string | null
          expires_at: string | null
          generated_by: string | null
          id: string
          insight_type: string
          is_dismissed: boolean | null
          is_pinned: boolean | null
          is_read: boolean | null
          pinned_at: string | null
          priority: number | null
          read_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          action_text?: string | null
          action_type?: string | null
          action_url?: string | null
          category: string
          created_at?: string | null
          data?: Json | null
          description: string
          dismissed_at?: string | null
          expires_at?: string | null
          generated_by?: string | null
          id?: string
          insight_type: string
          is_dismissed?: boolean | null
          is_pinned?: boolean | null
          is_read?: boolean | null
          pinned_at?: string | null
          priority?: number | null
          read_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          action_text?: string | null
          action_type?: string | null
          action_url?: string | null
          category?: string
          created_at?: string | null
          data?: Json | null
          description?: string
          dismissed_at?: string | null
          expires_at?: string | null
          generated_by?: string | null
          id?: string
          insight_type?: string
          is_dismissed?: boolean | null
          is_pinned?: boolean | null
          is_read?: boolean | null
          pinned_at?: string | null
          priority?: number | null
          read_at?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_insights_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          analytics_opt_out: boolean | null
          created_at: string | null
          dashboard_refresh_interval: number | null
          homepage_layout: string | null
          notify_achievements: boolean | null
          notify_insights: boolean | null
          notify_milestones: boolean | null
          notify_tips: boolean | null
          preferred_stats: string[] | null
          preferred_time_format: string | null
          show_achievements: boolean | null
          show_activity_to_others: boolean | null
          show_insights: boolean | null
          show_quick_actions: boolean | null
          show_recent_activity: boolean | null
          show_stats_dashboard: boolean | null
          theme_variant: string | null
          updated_at: string | null
          use_animations: boolean | null
          use_sound_effects: boolean | null
          user_id: string
        }
        Insert: {
          analytics_opt_out?: boolean | null
          created_at?: string | null
          dashboard_refresh_interval?: number | null
          homepage_layout?: string | null
          notify_achievements?: boolean | null
          notify_insights?: boolean | null
          notify_milestones?: boolean | null
          notify_tips?: boolean | null
          preferred_stats?: string[] | null
          preferred_time_format?: string | null
          show_achievements?: boolean | null
          show_activity_to_others?: boolean | null
          show_insights?: boolean | null
          show_quick_actions?: boolean | null
          show_recent_activity?: boolean | null
          show_stats_dashboard?: boolean | null
          theme_variant?: string | null
          updated_at?: string | null
          use_animations?: boolean | null
          use_sound_effects?: boolean | null
          user_id: string
        }
        Update: {
          analytics_opt_out?: boolean | null
          created_at?: string | null
          dashboard_refresh_interval?: number | null
          homepage_layout?: string | null
          notify_achievements?: boolean | null
          notify_insights?: boolean | null
          notify_milestones?: boolean | null
          notify_tips?: boolean | null
          preferred_stats?: string[] | null
          preferred_time_format?: string | null
          show_achievements?: boolean | null
          show_activity_to_others?: boolean | null
          show_insights?: boolean | null
          show_quick_actions?: boolean | null
          show_recent_activity?: boolean | null
          show_stats_dashboard?: boolean | null
          theme_variant?: string | null
          updated_at?: string | null
          use_animations?: boolean | null
          use_sound_effects?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_sessions: {
        Row: {
          active_time_ms: number | null
          bounce_rate: number | null
          browser: string | null
          created_at: string | null
          creatives_created: number | null
          creatives_viewed: number | null
          device_type: string | null
          downloads_count: number | null
          duration_ms: number | null
          ended_at: string | null
          entry_page: string | null
          exit_page: string | null
          id: string
          ip_address: unknown | null
          os: string | null
          pages_visited: number | null
          referrer_url: string | null
          screen_resolution: string | null
          session_token: string
          started_at: string | null
          total_idle_time_ms: number | null
          updated_at: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          active_time_ms?: number | null
          bounce_rate?: number | null
          browser?: string | null
          created_at?: string | null
          creatives_created?: number | null
          creatives_viewed?: number | null
          device_type?: string | null
          downloads_count?: number | null
          duration_ms?: number | null
          ended_at?: string | null
          entry_page?: string | null
          exit_page?: string | null
          id?: string
          ip_address?: unknown | null
          os?: string | null
          pages_visited?: number | null
          referrer_url?: string | null
          screen_resolution?: string | null
          session_token: string
          started_at?: string | null
          total_idle_time_ms?: number | null
          updated_at?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          active_time_ms?: number | null
          bounce_rate?: number | null
          browser?: string | null
          created_at?: string | null
          creatives_created?: number | null
          creatives_viewed?: number | null
          device_type?: string | null
          downloads_count?: number | null
          duration_ms?: number | null
          ended_at?: string | null
          entry_page?: string | null
          exit_page?: string | null
          id?: string
          ip_address?: unknown | null
          os?: string | null
          pages_visited?: number | null
          referrer_url?: string | null
          screen_resolution?: string | null
          session_token?: string
          started_at?: string | null
          total_idle_time_ms?: number | null
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          auto_refresh_interval: number | null
          created_at: string
          default_background:
            | Database["public"]["Enums"]["background_type"]
            | null
          default_moderation:
            | Database["public"]["Enums"]["moderation_level"]
            | null
          default_output_compression: number | null
          default_output_format:
            | Database["public"]["Enums"]["output_format"]
            | null
          default_quality: Database["public"]["Enums"]["image_quality"] | null
          enable_auto_refresh: boolean | null
          language: string | null
          model: string | null
          openai_api_key: string | null
          retries: number | null
          theme: string | null
          timeout: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_refresh_interval?: number | null
          created_at?: string
          default_background?:
            | Database["public"]["Enums"]["background_type"]
            | null
          default_moderation?:
            | Database["public"]["Enums"]["moderation_level"]
            | null
          default_output_compression?: number | null
          default_output_format?:
            | Database["public"]["Enums"]["output_format"]
            | null
          default_quality?: Database["public"]["Enums"]["image_quality"] | null
          enable_auto_refresh?: boolean | null
          language?: string | null
          model?: string | null
          openai_api_key?: string | null
          retries?: number | null
          theme?: string | null
          timeout?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_refresh_interval?: number | null
          created_at?: string
          default_background?:
            | Database["public"]["Enums"]["background_type"]
            | null
          default_moderation?:
            | Database["public"]["Enums"]["moderation_level"]
            | null
          default_output_compression?: number | null
          default_output_format?:
            | Database["public"]["Enums"]["output_format"]
            | null
          default_quality?: Database["public"]["Enums"]["image_quality"] | null
          enable_auto_refresh?: boolean | null
          language?: string | null
          model?: string | null
          openai_api_key?: string | null
          retries?: number | null
          theme?: string | null
          timeout?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
        Insert: {
          avg_processing_time_ms?: number | null
          avg_session_duration_minutes?: number | null
          calculated_at?: string | null
          creatives_this_month?: number | null
          creatives_this_week?: number | null
          creatives_this_year?: number | null
          creatives_today?: number | null
          current_streak_days?: number | null
          experience_points?: number | null
          fastest_creation_time_ms?: number | null
          favorite_time_of_day?: number | null
          last_activity_date?: string | null
          longest_streak_days?: number | null
          most_used_format?: string | null
          most_used_style?: string | null
          next_level_xp?: number | null
          productivity_score?: number | null
          quality_score?: number | null
          success_rate_percentage?: number | null
          total_achievement_points?: number | null
          total_completed?: number | null
          total_creatives?: number | null
          total_downloads?: number | null
          total_failed?: number | null
          total_likes?: number | null
          total_requests?: number | null
          total_shares?: number | null
          total_time_saved_estimation_ms?: number | null
          total_views?: number | null
          updated_at?: string | null
          user_id: string
          user_level?: number | null
        }
        Update: {
          avg_processing_time_ms?: number | null
          avg_session_duration_minutes?: number | null
          calculated_at?: string | null
          creatives_this_month?: number | null
          creatives_this_week?: number | null
          creatives_this_year?: number | null
          creatives_today?: number | null
          current_streak_days?: number | null
          experience_points?: number | null
          fastest_creation_time_ms?: number | null
          favorite_time_of_day?: number | null
          last_activity_date?: string | null
          longest_streak_days?: number | null
          most_used_format?: string | null
          most_used_style?: string | null
          next_level_xp?: number | null
          productivity_score?: number | null
          quality_score?: number | null
          success_rate_percentage?: number | null
          total_achievement_points?: number | null
          total_completed?: number | null
          total_creatives?: number | null
          total_downloads?: number | null
          total_failed?: number | null
          total_likes?: number | null
          total_requests?: number | null
          total_shares?: number | null
          total_time_saved_estimation_ms?: number | null
          total_views?: number | null
          updated_at?: string | null
          user_id?: string
          user_level?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_stats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          id: string
          name: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id: string
          name?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_and_unlock_achievements: {
        Args: { target_user_id: string }
        Returns: number
      }
      recalculate_user_stats: {
        Args: { target_user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      background_type: "auto" | "transparent" | "opaque"
      creative_format: "9:16" | "1:1" | "16:9" | "4:3" | "3:4"
      creative_request_status:
        | "pending"
        | "processing"
        | "completed"
        | "partial"
        | "failed"
      creative_status:
        | "draft"
        | "queued"
        | "processing"
        | "completed"
        | "failed"
      image_quality: "auto" | "high" | "medium" | "low"
      job_status:
        | "pending"
        | "processing"
        | "completed"
        | "failed"
        | "cancelled"
      moderation_level: "auto" | "low"
      output_format: "png" | "jpeg" | "webp"
      user_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      background_type: ["auto", "transparent", "opaque"],
      creative_format: ["9:16", "1:1", "16:9", "4:3", "3:4"],
      creative_request_status: [
        "pending",
        "processing",
        "completed",
        "partial",
        "failed",
      ],
      creative_status: ["draft", "queued", "processing", "completed", "failed"],
      image_quality: ["auto", "high", "medium", "low"],
      job_status: ["pending", "processing", "completed", "failed", "cancelled"],
      moderation_level: ["auto", "low"],
      output_format: ["png", "jpeg", "webp"],
      user_role: ["admin", "user"],
    },
  },
} as const
