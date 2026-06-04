// Hand-written types mirroring lib/migration_001_core.sql.
// Keep in sync when the schema changes.

export type Database = {
  public: {
    Tables: {
      tenants: {
        Row: {
          id: string
          handle: string
          tier: string
          created_at: string
        }
        Insert: {
          id?: string
          handle: string
          tier?: string
          created_at?: string
        }
        Update: {
          id?: string
          handle?: string
          tier?: string
          created_at?: string
        }
      }
      tenant_members: {
        Row: {
          tenant_id: string
          user_id: string
          role: string
        }
        Insert: {
          tenant_id: string
          user_id: string
          role?: string
        }
        Update: {
          tenant_id?: string
          user_id?: string
          role?: string
        }
      }
      persons: {
        Row: {
          id: string
          tenant_id: string
          name: string
          mission: string
          bio: string
          photo_url: string
          location: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          name?: string
          mission?: string
          bio?: string
          photo_url?: string
          location?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          name?: string
          mission?: string
          bio?: string
          photo_url?: string
          location?: string
          updated_at?: string
        }
      }
      pillars: {
        Row: {
          id: string
          tenant_id: string
          title: string
          description: string
          icon: string
          status: string
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          title?: string
          description?: string
          icon?: string
          status?: string
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          title?: string
          description?: string
          icon?: string
          status?: string
          sort_order?: number
          created_at?: string
        }
      }
      offers: {
        Row: {
          id: string
          tenant_id: string
          pillar_id: string | null
          title: string
          description: string
          kind: string
          price_cents: number
          currency: string
          external_url: string
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          pillar_id?: string | null
          title?: string
          description?: string
          kind?: string
          price_cents?: number
          currency?: string
          external_url?: string
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          pillar_id?: string | null
          title?: string
          description?: string
          kind?: string
          price_cents?: number
          currency?: string
          external_url?: string
          sort_order?: number
          created_at?: string
        }
      }
      facts: {
        Row: {
          id: string
          tenant_id: string
          label: string
          value: string
          sort_order: number
        }
        Insert: {
          id?: string
          tenant_id: string
          label?: string
          value?: string
          sort_order?: number
        }
        Update: {
          id?: string
          tenant_id?: string
          label?: string
          value?: string
          sort_order?: number
        }
      }
      channels: {
        Row: {
          id: string
          tenant_id: string
          platform: string
          url: string
          description: string
          sort_order: number
        }
        Insert: {
          id?: string
          tenant_id: string
          platform?: string
          url?: string
          description?: string
          sort_order?: number
        }
        Update: {
          id?: string
          tenant_id?: string
          platform?: string
          url?: string
          description?: string
          sort_order?: number
        }
      }
    }
    Views: Record<string, never>
    Functions: {
      is_tenant_member: {
        Args: { tid: string }
        Returns: boolean
      }
      bootstrap_tenant: {
        Args: { desired_handle: string }
        Returns: string
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

// Convenience row aliases.
export type Tenant = Database['public']['Tables']['tenants']['Row']
export type TenantMember = Database['public']['Tables']['tenant_members']['Row']
export type Person = Database['public']['Tables']['persons']['Row']
export type Pillar = Database['public']['Tables']['pillars']['Row']
export type Offer = Database['public']['Tables']['offers']['Row']
export type Fact = Database['public']['Tables']['facts']['Row']
export type Channel = Database['public']['Tables']['channels']['Row']
