export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type SubscriptionStatus = "active" | "cancelled" | "expired";
export type TransactionType = "credit" | "debit";
export type VideoStatus = "processing" | "completed" | "failed";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          name: string | null;
          total_credits: number;
        };
        Insert: {
          id: string;
          created_at?: string;
          updated_at?: string;
          name?: string | null;
          total_credits?: number;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          name?: string | null;
          total_credits?: number;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      subscription_plans: {
        Row: {
          id: string;
          name: string;
          description: string;
          price: number;
          credits_per_month: number;
          duration_months: number;
          is_annual: boolean;
          created_at: string;
          updated_at: string;
          stripe_price_id: string | null;
          stripe_product_id: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          price: number;
          credits_per_month: number;
          duration_months: number;
          is_annual?: boolean;
          created_at?: string;
          updated_at?: string;
          stripe_price_id?: string | null;
          stripe_product_id?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          price?: number;
          credits_per_month?: number;
          duration_months?: number;
          is_annual?: boolean;
          created_at?: string;
          updated_at?: string;
          stripe_price_id?: string | null;
          stripe_product_id?: string | null;
        };
      };
      user_subscriptions: {
        Row: {
          id: string;
          user_id: string;
          plan_id: string;
          start_date: string;
          end_date: string;
          credits_remaining: number;
          status: SubscriptionStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plan_id: string;
          start_date?: string;
          end_date: string;
          credits_remaining: number;
          status?: SubscriptionStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          plan_id?: string;
          start_date?: string;
          end_date?: string;
          credits_remaining?: number;
          status?: SubscriptionStatus;
          created_at?: string;
          updated_at?: string;
        };
      };
      credit_transactions: {
        Row: {
          id: string;
          user_id: string;
          subscription_id: string | null;
          amount: number;
          type: TransactionType;
          description: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          subscription_id?: string | null;
          amount: number;
          type: TransactionType;
          description: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          subscription_id?: string | null;
          amount?: number;
          type?: TransactionType;
          description?: string;
          created_at?: string;
        };
      };
      videos: {
        Row: {
          id: string;
          created_at: string;
          user_id: string;
          video_url: string;
          thumbnail_url: string | null;
          title: string | null;
          description: string | null;
          duration: string;
          status: VideoStatus;
          font_name: string | null;
          base_font_color: string | null;
          highlight_word_color: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          user_id: string;
          video_url: string;
          thumbnail_url: string | null;
          title?: string | null;
          description?: string | null;
          duration: string;
          status?: VideoStatus;
          font_name?: string | null;
          base_font_color?: string | null;
          highlight_word_color?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          user_id?: string;
          video_url?: string;
          thumbnail_url: string | null;
          title?: string | null;
          description?: string | null;
          duration?: string;
          status?: VideoStatus;
          font_name?: string | null;
          base_font_color?: string | null;
          highlight_word_color?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "videos_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      payment_history: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          created_at: string;
          updated_at: string;
          stripe_payment_id: string | null;
          description: string | null;
          credits_purchased: number;
          plan_id: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          created_at?: string;
          updated_at?: string;
          stripe_payment_id?: string | null;
          description?: string | null;
          credits_purchased?: number;
          plan_id?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          amount?: number;
          created_at?: string;
          updated_at?: string;
          stripe_payment_id?: string | null;
          description?: string | null;
          credits_purchased?: number;
          plan_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "credits_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
