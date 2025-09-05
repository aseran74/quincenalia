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
      properties: {
        Row: {
          id: string
          created_at: string
          title: string
          location: string
          price: number
          bedrooms: number
          bathrooms: number
          area: number
          description: string | null
          images: string[] | null
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          location: string
          price: number
          bedrooms: number
          bathrooms: number
          area: number
          description?: string | null
          images?: string[] | null
          user_id: string
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          location?: string
          price?: number
          bedrooms?: number
          bathrooms?: number
          area?: number
          description?: string | null
          images?: string[] | null
          user_id?: string
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