export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      generated_posts: {
        Row: {
          best_posting_time: string | null
          created_at: string
          cta_suggestions: string[] | null
          engagement_score: number | null
          features: string | null
          formatting_tips: string[] | null
          generated_content: string
          hashtags: string[] | null
          hook_suggestions: string[] | null
          id: string
          original_content: string | null
          post_type: string
          project_name: string | null
          purpose: string | null
          tech_stack: string | null
          tone: string | null
          user_id: string
        }
        Insert: {
          best_posting_time?: string | null
          created_at?: string
          cta_suggestions?: string[] | null
          engagement_score?: number | null
          features?: string | null
          formatting_tips?: string[] | null
          generated_content: string
          hashtags?: string[] | null
          hook_suggestions?: string[] | null
          id?: string
          original_content?: string | null
          post_type: string
          project_name?: string | null
          purpose?: string | null
          tech_stack?: string | null
          tone?: string | null
          user_id: string
        }
        Update: {
          best_posting_time?: string | null
          created_at?: string
          cta_suggestions?: string[] | null
          engagement_score?: number | null
          features?: string | null
          formatting_tips?: string[] | null
          generated_content?: string
          hashtags?: string[] | null
          hook_suggestions?: string[] | null
          id?: string
          original_content?: string | null
          post_type?: string
          project_name?: string | null
          purpose?: string | null
          tech_stack?: string | null
          tone?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profile_optimizations: {
        Row: {
          created_at: string
          id: string
          keyword_suggestions: string[] | null
          optimized_about: string | null
          optimized_headline: string | null
          original_about: string | null
          original_headline: string | null
          recruiter_summary: string | null
          suggested_skills: string[] | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          keyword_suggestions?: string[] | null
          optimized_about?: string | null
          optimized_headline?: string | null
          original_about?: string | null
          original_headline?: string | null
          recruiter_summary?: string | null
          suggested_skills?: string[] | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          keyword_suggestions?: string[] | null
          optimized_about?: string | null
          optimized_headline?: string | null
          original_about?: string | null
          original_headline?: string | null
          recruiter_summary?: string | null
          suggested_skills?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          about_section: string | null
          created_at: string
          email: string | null
          full_name: string | null
          headline: string | null
          id: string
          linkedin_profile_url: string | null
          profile_picture_url: string | null
          profile_strength_score: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          about_section?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          headline?: string | null
          id?: string
          linkedin_profile_url?: string | null
          profile_picture_url?: string | null
          profile_strength_score?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          about_section?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          headline?: string | null
          id?: string
          linkedin_profile_url?: string | null
          profile_picture_url?: string | null
          profile_strength_score?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
