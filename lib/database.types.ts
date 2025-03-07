export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      links: {
        Row: {
          id: string
          title: string
          html_content: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          html_content: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          html_content?: string
          created_at?: string
        }
      }
      blocks: {
        Row: {
          id: string
          link_id: string
          type: string
          content: Json
          position: number
          created_at: string
        }
        Insert: {
          id?: string
          link_id: string
          type: string
          content: Json
          position: number
          created_at?: string
        }
        Update: {
          id?: string
          link_id?: string
          type?: string
          content?: Json
          position?: number
          created_at?: string
        }
      }
    }
  }
}

