import { LotteryType } from './index';

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      favorite_tickets: {
        Row: {
          id: string
          user_id: string
          lottery_type: string
          numbers: number[]
          name: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          lottery_type: string
          numbers: number[]
          name?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          lottery_type?: string
          numbers?: number[]
          name?: string | null
          created_at?: string
        }
      }
      participants: {
        Row: {
          id: string
          user_id: string | null
          pool_id: string
          name: string
          email: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          pool_id: string
          name: string
          email: string
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          pool_id?: string
          name?: string
          email?: string
          status?: string
          created_at?: string
        }
      }
      pools: {
        Row: {
          id: string
          name: string
          lottery_type: string
          draw_date: string
          num_tickets: number
          max_participants: number
          contribution_amount: number
          admin_id: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          lottery_type: string
          draw_date: string
          num_tickets: number
          max_participants: number
          contribution_amount: number
          admin_id: string
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          lottery_type?: string
          draw_date?: string
          num_tickets?: number
          max_participants?: number
          contribution_amount?: number
          admin_id?: string
          status?: string
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          name: string
          email: string
          created_at: string
        }
        Insert: {
          id: string
          name: string
          email: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          created_at?: string
        }
      }
      tickets: {
        Row: {
          id: string
          pool_id: string
          ticket_number: string
          numbers: number[]
          created_at: string
        }
        Insert: {
          id?: string
          pool_id: string
          ticket_number: string
          numbers: number[]
          created_at?: string
        }
        Update: {
          id?: string
          pool_id?: string
          ticket_number?: string
          numbers?: number[]
          created_at?: string
        }
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
  }
}

export interface SupabaseUser {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
}

export interface SupabasePoolParticipantResponse {
  id: string;
  status: 'confirmed' | 'pending';
  numbers?: number[];
  users: SupabaseUser;
}

export interface SupabasePoolParticipant {
  id: string;
  pool_id: string;
  user_id: string;
  status: string;
  numbers?: number[];
  users: SupabaseUser;
}

export type SupabaseParticipant = Database['public']['Tables']['participants']['Row'];
export type SupabaseTicket = Database['public']['Tables']['tickets']['Row'];

export interface SupabasePool {
  id: string;
  name: string;
  lottery_type: LotteryType;
  draw_date: string;
  draw_time: string;
  contribution_amount: number;
  max_participants: number;
  admin_id: string;
  status: string;
  created_at: string;
  num_tickets: number;
  description?: string;
  is_open?: boolean;
}

export type SupabaseFavoriteTicket = Database['public']['Tables']['favorite_tickets']['Row']; 