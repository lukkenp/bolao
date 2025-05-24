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
      favorite_tickets: {
        Row: {
          created_at: string | null
          id: string
          ticket_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          ticket_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          ticket_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorite_tickets_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          }
        ]
      }
      generated_games: {
        Row: {
          created_at: string | null
          expires_at: string | null
          generated_combinations: number[] | null
          id: string
          numbers_per_game: number
          selected_numbers: number[] | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          generated_combinations?: number[] | null
          id?: string
          numbers_per_game?: number
          selected_numbers?: number[] | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          generated_combinations?: number[] | null
          id?: string
          numbers_per_game?: number
          selected_numbers?: number[] | null
          user_id?: string | null
        }
        Relationships: []
      }
      lottery_results: {
        Row: {
          created_at: string
          draw_date: string
          draw_number: number
          id: string
          lottery_type: string
          numbers: number[]
          prize_values: Json | null
        }
        Insert: {
          created_at?: string
          draw_date: string
          draw_number: number
          id?: string
          lottery_type: string
          numbers: number[]
          prize_values?: Json | null
        }
        Update: {
          created_at?: string
          draw_date?: string
          draw_number?: number
          id?: string
          lottery_type?: string
          numbers?: number[]
          prize_values?: Json | null
        }
        Relationships: []
      }
      lottery_results_cache: {
        Row: {
          created_at: string | null
          draw_date: string
          draw_number: string
          id: string
          lottery_type: string
          response: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          draw_date: string
          draw_number: string
          id?: string
          lottery_type: string
          response: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          draw_date?: string
          draw_number?: string
          id?: string
          lottery_type?: string
          response?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      participants: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          pool_id: string | null
          status: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name: string
          pool_id?: string | null
          status?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          pool_id?: string | null
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "participants_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "pools"
            referencedColumns: ["id"]
          }
        ]
      }
      pools: {
        Row: {
          admin_id: string
          contribution_amount: number
          created_at: string
          draw_date: string
          id: string
          lottery_type: string
          max_participants: number
          name: string
          num_tickets: number
          status: string
        }
        Insert: {
          admin_id: string
          contribution_amount: number
          created_at?: string
          draw_date: string
          id?: string
          lottery_type: string
          max_participants: number
          name: string
          num_tickets?: number
          status?: string
        }
        Update: {
          admin_id?: string
          contribution_amount?: number
          created_at?: string
          draw_date?: string
          id?: string
          lottery_type?: string
          max_participants?: number
          name?: string
          num_tickets?: number
          status?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          name?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
        }
        Relationships: []
      }
      ticket_results: {
        Row: {
          created_at: string
          draw_number: number
          hits: number
          id: string
          prize_value: number | null
          ticket_id: string | null
        }
        Insert: {
          created_at?: string
          draw_number: number
          hits: number
          id?: string
          prize_value?: number | null
          ticket_id?: string | null
        }
        Update: {
          created_at?: string
          draw_number?: number
          hits?: number
          id?: string
          prize_value?: number | null
          ticket_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ticket_results_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          }
        ]
      }
      tickets: {
        Row: {
          created_at: string
          id: string
          numbers: number[]
          pool_id: string | null
          ticket_number: string
        }
        Insert: {
          created_at?: string
          id?: string
          numbers: number[]
          pool_id?: string | null
          ticket_number: string
        }
        Update: {
          created_at?: string
          id?: string
          numbers?: number[]
          pool_id?: string | null
          ticket_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "tickets_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "pools"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_ticket_results: {
        Args: { p_ticket_id: string; p_draw_number: number }
        Returns: {
          id: string
          ticket_number: string
          numbers: number[]
          winning_numbers: number[]
          hits: number
          prize: number
        }[]
      }
      cleanup_expired_games: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
} 