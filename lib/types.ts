export interface Link {
  id: string
  title: string
  slug?: string
  htmlContent: string
  createdAt: string
  blocks?: Block[]
}

export interface Block {
  id: string
  type: string
  content: any
  position?: number
}

export interface SupabaseLink {
  id: string
  title: string
  slug?: string
  html_content: string
  created_at: string
}

export interface SupabaseBlock {
  id: string
  link_id: string
  type: string
  content: any
  position: number
  created_at: string
}

