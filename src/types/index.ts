// Types for the simplified Subagents discovery platform

// Core entities
export interface Subagent {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  content: string;
  owner: string;
  repo: string;
  file_path: string;
  tools: string[] | null;
  download_count: number;
  view_count: number;
  github_url: string | null;
  content_hash: string | null;
  last_synced_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Source {
  id: string;
  owner: string;
  repo: string;
  branch: string;
  agents_path: string;
  is_active: boolean;
  last_synced_at: string | null;
  sync_error: string | null;
  created_at: string;
  updated_at: string;
}

export interface Telemetry {
  id: string;
  subagent_id: string | null;
  event_type: 'download' | 'view' | 'copy';
  metadata: Record<string, unknown>;
  created_at: string;
}

// List item (lighter weight for leaderboard)
export interface SubagentListItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  owner: string;
  repo: string;
  tools: string[] | null;
  download_count: number;
  view_count: number;
}

// Platform stats
export interface PlatformStats {
  totalSubagents: number;
  totalDownloads: number;
  totalSources: number;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export interface ListResponse<T> {
  data: T[];
  count: number;
  limit?: number;
  offset?: number;
  query?: string;
}

// Database types for Supabase
export type Database = {
  public: {
    Tables: {
      subagents: {
        Row: Subagent;
        Insert: Omit<Subagent, 'id' | 'created_at' | 'updated_at' | 'download_count' | 'view_count'>;
        Update: Partial<Omit<Subagent, 'id' | 'created_at'>>;
      };
      sources: {
        Row: Source;
        Insert: Omit<Source, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Source, 'id' | 'created_at'>>;
      };
      telemetry: {
        Row: Telemetry;
        Insert: Omit<Telemetry, 'id' | 'created_at'>;
        Update: never;
      };
    };
    Functions: {
      search_subagents: {
        Args: {
          search_query: string;
          max_results?: number;
        };
        Returns: SubagentListItem[];
      };
      increment_download_count: {
        Args: {
          subagent_uuid: string;
        };
        Returns: void;
      };
      increment_view_count: {
        Args: {
          subagent_uuid: string;
        };
        Returns: void;
      };
      get_platform_stats: {
        Args: Record<string, never>;
        Returns: {
          total_subagents: number;
          total_downloads: number;
          total_sources: number;
        }[];
      };
    };
  };
};
