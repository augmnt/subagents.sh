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
      agent_downloads: {
        Row: {
          agent_id: string | null
          created_at: string
          download_type: string
          id: string
          ip_address: string | null
          referrer: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          agent_id?: string | null
          created_at?: string
          download_type: string
          id?: string
          ip_address?: string | null
          referrer?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          agent_id?: string | null
          created_at?: string
          download_type?: string
          id?: string
          ip_address?: string | null
          referrer?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_downloads_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_downloads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      agent_views: {
        Row: {
          agent_id: string | null
          created_at: string
          id: string
          ip_address: string | null
          referrer: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          agent_id?: string | null
          created_at?: string
          id?: string
          ip_address?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          agent_id?: string | null
          created_at?: string
          id?: string
          ip_address?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_views_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_views_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      agents: {
        Row: {
          allow_comments: boolean
          author_id: string | null
          category_id: string | null
          created_at: string
          demo_url: string | null
          description: string | null
          detailed_description: string | null
          documentation_url: string | null
          download_count: number
          featured: boolean
          framework: string | null
          github_forks: number
          github_last_commit: string | null
          github_owner: string | null
          github_repo_name: string | null
          github_repo_url: string | null
          github_stars: number
          github_sync_enabled: boolean
          homepage_url: string | null
          id: string
          language: string | null
          license: string | null
          name: string
          published_at: string | null
          rating_average: number
          rating_count: number
          status: Database["public"]["Enums"]["agent_status"]
          tags: string[]
          updated_at: string
          version: string
          view_count: number
        }
        Insert: {
          allow_comments?: boolean
          author_id?: string | null
          category_id?: string | null
          created_at?: string
          demo_url?: string | null
          description?: string | null
          detailed_description?: string | null
          documentation_url?: string | null
          download_count?: number
          featured?: boolean
          framework?: string | null
          github_forks?: number
          github_last_commit?: string | null
          github_owner?: string | null
          github_repo_name?: string | null
          github_repo_url?: string | null
          github_stars?: number
          github_sync_enabled?: boolean
          homepage_url?: string | null
          id?: string
          language?: string | null
          license?: string | null
          name: string
          published_at?: string | null
          rating_average?: number
          rating_count?: number
          status?: Database["public"]["Enums"]["agent_status"]
          tags?: string[]
          updated_at?: string
          version?: string
          view_count?: number
        }
        Update: {
          allow_comments?: boolean
          author_id?: string | null
          category_id?: string | null
          created_at?: string
          demo_url?: string | null
          description?: string | null
          detailed_description?: string | null
          documentation_url?: string | null
          download_count?: number
          featured?: boolean
          framework?: string | null
          github_forks?: number
          github_last_commit?: string | null
          github_owner?: string | null
          github_repo_name?: string | null
          github_repo_url?: string | null
          github_stars?: number
          github_sync_enabled?: boolean
          homepage_url?: string | null
          id?: string
          language?: string | null
          license?: string | null
          name?: string
          published_at?: string | null
          rating_average?: number
          rating_count?: number
          status?: Database["public"]["Enums"]["agent_status"]
          tags?: string[]
          updated_at?: string
          version?: string
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "agents_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agents_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          }
        ]
      }
      bookmarks: {
        Row: {
          agent_id: string | null
          created_at: string
          id: string
          user_id: string | null
        }
        Insert: {
          agent_id?: string | null
          created_at?: string
          id?: string
          user_id?: string | null
        }
        Update: {
          agent_id?: string | null
          created_at?: string
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookmarks_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookmarks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      categories: {
        Row: {
          agent_count: number
          color: string
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          agent_count?: number
          color?: string
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          agent_count?: number
          color?: string
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      collection_agents: {
        Row: {
          added_at: string
          agent_id: string | null
          collection_id: string | null
          id: string
          position: number
        }
        Insert: {
          added_at?: string
          agent_id?: string | null
          collection_id?: string | null
          id?: string
          position?: number
        }
        Update: {
          added_at?: string
          agent_id?: string | null
          collection_id?: string | null
          id?: string
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: "collection_agents_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_agents_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          }
        ]
      }
      collections: {
        Row: {
          agent_count: number
          created_at: string
          description: string | null
          id: string
          is_public: boolean
          name: string
          slug: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          agent_count?: number
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          name: string
          slug?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          agent_count?: number
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          name?: string
          slug?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "collections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      follows: {
        Row: {
          created_at: string
          follower_id: string | null
          following_id: string | null
          id: string
        }
        Insert: {
          created_at?: string
          follower_id?: string | null
          following_id?: string | null
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string | null
          following_id?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      github_sync_log: {
        Row: {
          agent_id: string | null
          completed_at: string | null
          data: Json | null
          id: string
          message: string | null
          started_at: string
          status: string
        }
        Insert: {
          agent_id?: string | null
          completed_at?: string | null
          data?: Json | null
          id?: string
          message?: string | null
          started_at?: string
          status: string
        }
        Update: {
          agent_id?: string | null
          completed_at?: string | null
          data?: Json | null
          id?: string
          message?: string | null
          started_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "github_sync_log_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          full_name: string | null
          github_username: string | null
          id: string
          location: string | null
          twitter_username: string | null
          updated_at: string
          username: string | null
          website_url: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          github_username?: string | null
          id: string
          location?: string | null
          twitter_username?: string | null
          updated_at?: string
          username?: string | null
          website_url?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          github_username?: string | null
          id?: string
          location?: string | null
          twitter_username?: string | null
          updated_at?: string
          username?: string | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      review_analytics: {
        Row: {
          agent_id: string
          avg_documentation_rating: number
          avg_performance_rating: number
          avg_reliability_rating: number
          avg_usability_rating: number
          average_rating: number
          created_at: string
          flagged_reviews: number
          helpful_votes: number
          id: string
          new_reviews: number
          period_end: string
          period_start: string
          rating_distribution: Json
          response_rate: number
          total_reviews: number
          total_votes: number
          verified_reviews: number
        }
        Insert: {
          agent_id: string
          avg_documentation_rating?: number
          avg_performance_rating?: number
          avg_reliability_rating?: number
          avg_usability_rating?: number
          average_rating?: number
          created_at?: string
          flagged_reviews?: number
          helpful_votes?: number
          id?: string
          new_reviews?: number
          period_end: string
          period_start: string
          rating_distribution?: Json
          response_rate?: number
          total_reviews?: number
          total_votes?: number
          verified_reviews?: number
        }
        Update: {
          agent_id?: string
          avg_documentation_rating?: number
          avg_performance_rating?: number
          avg_reliability_rating?: number
          avg_usability_rating?: number
          average_rating?: number
          created_at?: string
          flagged_reviews?: number
          helpful_votes?: number
          id?: string
          new_reviews?: number
          period_end?: string
          period_start?: string
          rating_distribution?: Json
          response_rate?: number
          total_reviews?: number
          total_votes?: number
          verified_reviews?: number
        }
        Relationships: [
          {
            foreignKeyName: "review_analytics_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          }
        ]
      }
      review_drafts: {
        Row: {
          agent_id: string
          cons: string[] | null
          content: string | null
          created_at: string
          documentation_rating: number | null
          id: string
          overall_rating: number | null
          performance_rating: number | null
          pros: string[] | null
          reliability_rating: number | null
          title: string | null
          updated_at: string
          usability_rating: number | null
          use_case: string | null
          user_id: string
        }
        Insert: {
          agent_id: string
          cons?: string[] | null
          content?: string | null
          created_at?: string
          documentation_rating?: number | null
          id?: string
          overall_rating?: number | null
          performance_rating?: number | null
          pros?: string[] | null
          reliability_rating?: number | null
          title?: string | null
          updated_at?: string
          usability_rating?: number | null
          use_case?: string | null
          user_id: string
        }
        Update: {
          agent_id?: string
          cons?: string[] | null
          content?: string | null
          created_at?: string
          documentation_rating?: number | null
          id?: string
          overall_rating?: number | null
          performance_rating?: number | null
          pros?: string[] | null
          reliability_rating?: number | null
          title?: string | null
          updated_at?: string
          usability_rating?: number | null
          use_case?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_drafts_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_drafts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      review_edit_history: {
        Row: {
          content_after: string | null
          content_before: string | null
          created_at: string
          edited_by: string | null
          edit_reason: string | null
          id: string
          review_id: string
          title_after: string | null
          title_before: string | null
        }
        Insert: {
          content_after?: string | null
          content_before?: string | null
          created_at?: string
          edited_by?: string | null
          edit_reason?: string | null
          id?: string
          review_id: string
          title_after?: string | null
          title_before?: string | null
        }
        Update: {
          content_after?: string | null
          content_before?: string | null
          created_at?: string
          edited_by?: string | null
          edit_reason?: string | null
          id?: string
          review_id?: string
          title_after?: string | null
          title_before?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "review_edit_history_edited_by_fkey"
            columns: ["edited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_edit_history_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          }
        ]
      }
      review_flags: {
        Row: {
          created_at: string
          description: string | null
          id: string
          reason: Database["public"]["Enums"]["review_flag_reason"]
          resolved_at: string | null
          resolved_by: string | null
          review_id: string
          status: Database["public"]["Enums"]["flag_status"]
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          reason: Database["public"]["Enums"]["review_flag_reason"]
          resolved_at?: string | null
          resolved_by?: string | null
          review_id: string
          status?: Database["public"]["Enums"]["flag_status"]
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          reason?: Database["public"]["Enums"]["review_flag_reason"]
          resolved_at?: string | null
          resolved_by?: string | null
          review_id?: string
          status?: Database["public"]["Enums"]["flag_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_flags_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_flags_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_flags_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      review_responses: {
        Row: {
          content: string
          created_at: string
          id: string
          review_id: string
          status: Database["public"]["Enums"]["review_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          review_id: string
          status?: Database["public"]["Enums"]["review_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          review_id?: string
          status?: Database["public"]["Enums"]["review_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_responses_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_responses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      review_votes: {
        Row: {
          created_at: string
          id: string
          review_id: string
          user_id: string
          vote_type: Database["public"]["Enums"]["vote_type"]
        }
        Insert: {
          created_at?: string
          id?: string
          review_id: string
          user_id: string
          vote_type: Database["public"]["Enums"]["vote_type"]
        }
        Update: {
          created_at?: string
          id?: string
          review_id?: string
          user_id?: string
          vote_type?: Database["public"]["Enums"]["vote_type"]
        }
        Relationships: [
          {
            foreignKeyName: "review_votes_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      reviews: {
        Row: {
          agent_id: string
          cons: string[] | null
          content: string | null
          created_at: string
          documentation_rating: number | null
          edit_count: number
          edit_reason: string | null
          flagged_count: number
          helpful_count: number
          id: string
          image_urls: string[] | null
          is_verified_purchase: boolean
          last_edited_at: string | null
          last_flagged_at: string | null
          moderated_at: string | null
          moderated_by: string | null
          moderation_notes: string | null
          not_helpful_count: number
          overall_rating: number
          performance_rating: number | null
          pros: string[] | null
          quality_score: number
          reliability_rating: number | null
          status: Database["public"]["Enums"]["review_status"]
          title: string | null
          total_votes: number
          updated_at: string
          usability_rating: number | null
          use_case: string | null
          user_id: string
          verification_level: Database["public"]["Enums"]["verification_level"]
        }
        Insert: {
          agent_id: string
          cons?: string[] | null
          content?: string | null
          created_at?: string
          documentation_rating?: number | null
          edit_count?: number
          edit_reason?: string | null
          flagged_count?: number
          helpful_count?: number
          id?: string
          image_urls?: string[] | null
          is_verified_purchase?: boolean
          last_edited_at?: string | null
          last_flagged_at?: string | null
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_notes?: string | null
          not_helpful_count?: number
          overall_rating: number
          performance_rating?: number | null
          pros?: string[] | null
          quality_score?: number
          reliability_rating?: number | null
          status?: Database["public"]["Enums"]["review_status"]
          title?: string | null
          total_votes?: number
          updated_at?: string
          usability_rating?: number | null
          use_case?: string | null
          user_id: string
          verification_level?: Database["public"]["Enums"]["verification_level"]
        }
        Update: {
          agent_id?: string
          cons?: string[] | null
          content?: string | null
          created_at?: string
          documentation_rating?: number | null
          edit_count?: number
          edit_reason?: string | null
          flagged_count?: number
          helpful_count?: number
          id?: string
          image_urls?: string[] | null
          is_verified_purchase?: boolean
          last_edited_at?: string | null
          last_flagged_at?: string | null
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_notes?: string | null
          not_helpful_count?: number
          overall_rating?: number
          performance_rating?: number | null
          pros?: string[] | null
          quality_score?: number
          reliability_rating?: number | null
          status?: Database["public"]["Enums"]["review_status"]
          title?: string | null
          total_votes?: number
          updated_at?: string
          usability_rating?: number | null
          use_case?: string | null
          user_id?: string
          verification_level?: Database["public"]["Enums"]["verification_level"]
        }
        Relationships: [
          {
            foreignKeyName: "reviews_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_moderated_by_fkey"
            columns: ["moderated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      votes: {
        Row: {
          agent_id: string | null
          created_at: string
          id: string
          review_id: string | null
          user_id: string | null
          vote_type: Database["public"]["Enums"]["vote_type"]
        }
        Insert: {
          agent_id?: string | null
          created_at?: string
          id?: string
          review_id?: string | null
          user_id?: string | null
          vote_type: Database["public"]["Enums"]["vote_type"]
        }
        Update: {
          agent_id?: string | null
          created_at?: string
          id?: string
          review_id?: string | null
          user_id?: string | null
          vote_type?: Database["public"]["Enums"]["vote_type"]
        }
        Relationships: [
          {
            foreignKeyName: "votes_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_agent_rating: {
        Args: {
          agent_uuid: string
        }
        Returns: {
          average_rating: number
          total_reviews: number
        }[]
      }
      get_trending_agents: {
        Args: {
          days_back?: number
          limit_count?: number
        }
        Returns: {
          id: string
          name: string
          description: string | null
          category_name: string | null
          author_username: string | null
          rating_average: number
          download_count: number
          recent_downloads: number
          trend_score: number
        }[]
      }
      search_agents: {
        Args: {
          search_query?: string
          category_filter?: string
          tag_filters?: string[]
          sort_by?: string
          limit_count?: number
          offset_count?: number
        }
        Returns: {
          id: string
          name: string
          description: string | null
          detailed_description: string | null
          category_id: string | null
          category_name: string | null
          category_slug: string | null
          category_icon: string | null
          category_color: string | null
          author_id: string | null
          author_username: string | null
          author_full_name: string | null
          author_avatar_url: string | null
          status: Database["public"]["Enums"]["agent_status"]
          version: string
          tags: string[]
          github_repo_url: string | null
          github_repo_name: string | null
          github_owner: string | null
          github_stars: number
          github_forks: number
          github_last_commit: string | null
          github_sync_enabled: boolean
          documentation_url: string | null
          demo_url: string | null
          homepage_url: string | null
          license: string | null
          language: string | null
          framework: string | null
          download_count: number
          view_count: number
          rating_average: number
          rating_count: number
          featured: boolean
          allow_comments: boolean
          created_at: string
          updated_at: string
          published_at: string | null
          search_rank: number | null
          is_bookmarked: boolean | null
        }[]
      }
      sync_github_repo: {
        Args: {
          agent_uuid: string
          repo_data: Json
        }
        Returns: boolean
      }
    }
    Enums: {
      agent_status: "draft" | "published" | "archived" | "under_review"
      flag_status: "pending" | "reviewed" | "resolved" | "dismissed"
      review_flag_reason:
        | "spam"
        | "inappropriate"
        | "fake"
        | "off_topic"
        | "harassment"
        | "other"
      review_status: "active" | "hidden" | "flagged"
      verification_level: "none" | "email" | "github" | "verified_user"
      vote_type: "upvote" | "downvote"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never