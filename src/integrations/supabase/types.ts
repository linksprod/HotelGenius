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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_section_seen: {
        Row: {
          id: string
          last_seen_at: string
          section_key: string
          user_id: string
        }
        Insert: {
          id?: string
          last_seen_at?: string
          section_key: string
          user_id: string
        }
        Update: {
          id?: string
          last_seen_at?: string
          section_key?: string
          user_id?: string
        }
        Relationships: []
      }
      articles: {
        Row: {
          content: string
          created_at: string
          description: string | null
          hero_image: string | null
          id: string
          published_at: string | null
          reading_time: string | null
          slug: string
          title: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string
          description?: string | null
          hero_image?: string | null
          id?: string
          published_at?: string | null
          reading_time?: string | null
          slug: string
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          description?: string | null
          hero_image?: string | null
          id?: string
          published_at?: string | null
          reading_time?: string | null
          slug?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      attractions: {
        Row: {
          created_at: string | null
          description: string
          distance: string
          id: string
          image: string
          name: string
          opening_hours: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          distance: string
          id?: string
          image: string
          name: string
          opening_hours: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          distance?: string
          id?: string
          image?: string
          name?: string
          opening_hours?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      car_rentals: {
        Row: {
          created_at: string | null
          description: string
          id: string
          name: string
          updated_at: string | null
          website: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          name: string
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          name?: string
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      chat_routing: {
        Row: {
          conversation_id: string
          created_at: string
          from_handler: string
          id: string
          reason: string | null
          staff_id: string | null
          to_handler: string
        }
        Insert: {
          conversation_id: string
          created_at?: string
          from_handler: string
          id?: string
          reason?: string | null
          staff_id?: string | null
          to_handler: string
        }
        Update: {
          conversation_id?: string
          created_at?: string
          from_handler?: string
          id?: string
          reason?: string | null
          staff_id?: string | null
          to_handler?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_routing_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_templates: {
        Row: {
          category: string
          created_at: string
          id: string
          is_active: boolean
          message: string
          sort_order: number | null
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          is_active?: boolean
          message: string
          sort_order?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          is_active?: boolean
          message?: string
          sort_order?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      companions: {
        Row: {
          birth_date: string | null
          created_at: string | null
          first_name: string
          id: string
          last_name: string
          relation: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          birth_date?: string | null
          created_at?: string | null
          first_name: string
          id?: string
          last_name: string
          relation: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          birth_date?: string | null
          created_at?: string | null
          first_name?: string
          id?: string
          last_name?: string
          relation?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          assigned_staff_id: string | null
          conversation_type: string
          created_at: string
          current_handler: string
          guest_email: string | null
          guest_id: string | null
          guest_name: string
          hotel_id: string | null
          id: string
          room_number: string | null
          status: string
          updated_at: string
        }
        Insert: {
          assigned_staff_id?: string | null
          conversation_type?: string
          created_at?: string
          current_handler?: string
          guest_email?: string | null
          guest_id?: string | null
          guest_name: string
          id?: string
          room_number?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          assigned_staff_id?: string | null
          conversation_type?: string
          created_at?: string
          current_handler?: string
          guest_email?: string | null
          guest_id?: string | null
          guest_name?: string
          id?: string
          room_number?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      demo_sessions: {
        Row: {
          completed_at: string | null
          created_at: string | null
          duration_seconds: number | null
          email: string | null
          id: string
          ip_address: string | null
          started_at: string | null
          user_agent: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          email?: string | null
          id?: string
          ip_address?: string | null
          started_at?: string | null
          user_agent?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          email?: string | null
          id?: string
          ip_address?: string | null
          started_at?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      demo_settings: {
        Row: {
          created_at: string | null
          email_required: boolean | null
          expiration_message: string | null
          id: string
          is_enabled: boolean | null
          redirect_url: string | null
          time_limit_minutes: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email_required?: boolean | null
          expiration_message?: string | null
          id?: string
          is_enabled?: boolean | null
          redirect_url?: string | null
          time_limit_minutes?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email_required?: boolean | null
          expiration_message?: string | null
          id?: string
          is_enabled?: boolean | null
          redirect_url?: string | null
          time_limit_minutes?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      destination_activities: {
        Row: {
          created_at: string | null
          description: string
          id: string
          image: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          image: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          image?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      destination_categories: {
        Row: {
          created_at: string | null
          icon: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          icon?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          icon?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      event_reservations: {
        Row: {
          created_at: string
          date: string
          event_id: string
          guest_email: string | null
          guest_name: string | null
          guest_phone: string | null
          guests: number
          hotel_id: string | null
          id: string
          room_number: string | null
          special_requests: string | null
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          date: string
          event_id: string
          guest_email?: string | null
          guest_name?: string | null
          guest_phone?: string | null
          guests: number
          id?: string
          room_number?: string | null
          special_requests?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          date?: string
          event_id?: string
          guest_email?: string | null
          guest_name?: string | null
          guest_phone?: string | null
          guests?: number
          id?: string
          room_number?: string | null
          special_requests?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_reservations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          capacity: number | null
          category: string
          created_at: string
          date: string | null
          description: string
          id: string
          image: string
          is_featured: boolean | null
          location: string | null
          recurrence_type: string | null
          restaurant_id: string | null
          spa_facility_id: string | null
          time: string | null
          title: string
          updated_at: string
        }
        Insert: {
          capacity?: number | null
          category: string
          created_at?: string
          date?: string | null
          description: string
          id?: string
          image: string
          is_featured?: boolean | null
          location?: string | null
          recurrence_type?: string | null
          restaurant_id?: string | null
          spa_facility_id?: string | null
          time?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          capacity?: number | null
          category?: string
          created_at?: string
          date?: string | null
          description?: string
          id?: string
          image?: string
          is_featured?: boolean | null
          location?: string | null
          recurrence_type?: string | null
          restaurant_id?: string | null
          spa_facility_id?: string | null
          time?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_spa_facility_id_fkey"
            columns: ["spa_facility_id"]
            isOneToOne: false
            referencedRelation: "spa_facilities"
            referencedColumns: ["id"]
          },
        ]
      }
      guest_feedback: {
        Row: {
          comment: string | null
          created_at: string | null
          guest_email: string
          guest_name: string
          id: string
          rating: number
          updated_at: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          guest_email: string
          guest_name: string
          id?: string
          rating: number
          updated_at?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          guest_email?: string
          guest_name?: string
          id?: string
          rating?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      guest_medical_alerts: {
        Row: {
          alert_type: string
          created_at: string
          description: string
          guest_id: string
          id: string
          severity: string
        }
        Insert: {
          alert_type: string
          created_at?: string
          description: string
          guest_id: string
          id?: string
          severity: string
        }
        Update: {
          alert_type?: string
          created_at?: string
          description?: string
          guest_id?: string
          id?: string
          severity?: string
        }
        Relationships: [
          {
            foreignKeyName: "guest_medical_alerts_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "guests"
            referencedColumns: ["id"]
          },
        ]
      }
      guest_preferences: {
        Row: {
          category: string
          created_at: string
          guest_id: string
          id: string
          value: string
        }
        Insert: {
          category: string
          created_at?: string
          guest_id: string
          id?: string
          value: string
        }
        Update: {
          category?: string
          created_at?: string
          guest_id?: string
          id?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "guest_preferences_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "guests"
            referencedColumns: ["id"]
          },
        ]
      }
      guest_staff_notes: {
        Row: {
          author_name: string
          content: string
          created_at: string
          guest_id: string
          id: string
        }
        Insert: {
          author_name: string
          content: string
          created_at?: string
          guest_id: string
          id?: string
        }
        Update: {
          author_name?: string
          content?: string
          created_at?: string
          guest_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guest_staff_notes_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "guests"
            referencedColumns: ["id"]
          },
        ]
      }
      guests: {
        Row: {
          birth_date: string | null
          check_in_date: string | null
          check_out_date: string | null
          created_at: string | null
          email: string | null
          first_name: string
          guest_type: string | null
          hotel_id: string | null
          id: string
          last_name: string
          nationality: string | null
          phone: string | null
          profile_image: string | null
          room_number: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          birth_date?: string | null
          check_in_date?: string | null
          check_out_date?: string | null
          created_at?: string | null
          email?: string | null
          first_name: string
          guest_type?: string | null
          id?: string
          last_name: string
          nationality?: string | null
          phone?: string | null
          profile_image?: string | null
          room_number?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          birth_date?: string | null
          check_in_date?: string | null
          check_out_date?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string
          guest_type?: string | null
          id?: string
          last_name?: string
          nationality?: string | null
          phone?: string | null
          profile_image?: string | null
          room_number?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      hotel_about: {
        Row: {
          action_link: string
          action_text: string
          additional_info: Json | null
          created_at: string
          description: string
          directory_title: string | null
          facilities: Json | null
          features: Json | null
          hero_image: string | null
          hero_subtitle: string | null
          hero_title: string | null
          hotel_id: string | null
          hotel_policies: Json | null
          icon: string
          id: string
          important_numbers: Json | null
          mission: string | null
          status: string
          title: string
          updated_at: string
          welcome_description: string | null
          welcome_description_extended: string | null
          welcome_title: string | null
        }
        Insert: {
          action_link: string
          action_text: string
          additional_info?: Json | null
          created_at?: string
          description: string
          directory_title?: string | null
          facilities?: Json | null
          features?: Json | null
          hero_image?: string | null
          hero_subtitle?: string | null
          hero_title?: string | null
          hotel_id?: string | null
          hotel_policies?: Json | null
          icon: string
          id?: string
          important_numbers?: Json | null
          mission?: string | null
          status?: string
          title: string
          updated_at?: string
          welcome_description?: string | null
          welcome_description_extended?: string | null
          welcome_title?: string | null
        }
        Update: {
          action_link?: string
          action_text?: string
          additional_info?: Json | null
          created_at?: string
          description?: string
          directory_title?: string | null
          facilities?: Json | null
          features?: Json | null
          hero_image?: string | null
          hero_subtitle?: string | null
          hero_title?: string | null
          hotel_id?: string | null
          hotel_policies?: Json | null
          icon?: string
          id?: string
          important_numbers?: Json | null
          mission?: string | null
          status?: string
          title?: string
          updated_at?: string
          welcome_description?: string | null
          welcome_description_extended?: string | null
          welcome_title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hotel_about_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      hotel_config: {
        Row: {
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          enabled_features: string[] | null
          feedback_hero_image: string | null
          id: string
          logo_url: string | null
          name: string
          primary_color: string
          secondary_color: string
          updated_at: string | null
        }
        Insert: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          enabled_features?: string[] | null
          feedback_hero_image?: string | null
          id?: string
          logo_url?: string | null
          name: string
          primary_color: string
          secondary_color: string
          updated_at?: string | null
        }
        Update: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          enabled_features?: string[] | null
          feedback_hero_image?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          primary_color?: string
          secondary_color?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      hotels: {
        Row: {
          address: string
          config: Json | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          id: string
          logo_url: string | null
          name: string
          primary_color: string | null
          secondary_color: string | null
          slug: string
          subdomain: string | null
          updated_at: string
        }
        Insert: {
          address?: string
          config?: Json | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          name: string
          primary_color?: string | null
          secondary_color?: string | null
          slug: string
          subdomain?: string | null
          updated_at?: string
        }
        Update: {
          address?: string
          config?: Json | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
          primary_color?: string | null
          secondary_color?: string | null
          slug?: string
          subdomain?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          hotel_id: string | null
          id: string
          message_type: string
          metadata: Json | null
          sender_id: string | null
          sender_name: string
          sender_type: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          message_type?: string
          metadata?: Json | null
          sender_id?: string | null
          sender_name: string
          sender_type: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          message_type?: string
          metadata?: Json | null
          sender_id?: string | null
          sender_name?: string
          sender_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      moderator_services: {
        Row: {
          created_at: string | null
          id: string
          service_type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          service_type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          service_type?: string
          user_id?: string
        }
        Relationships: []
      }
      public_transport: {
        Row: {
          created_at: string | null
          description: string
          id: string
          name: string
          updated_at: string | null
          website: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          name: string
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          name?: string
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      request_categories: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean
          name: string
          parent_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name: string
          parent_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name?: string
          parent_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      request_items: {
        Row: {
          category_id: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string | null
        }
        Insert: {
          category_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string | null
        }
        Update: {
          category_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      restaurant_menus: {
        Row: {
          category: string
          created_at: string | null
          description: string
          id: string
          image: string | null
          is_featured: boolean | null
          menu_pdf: string | null
          name: string
          price: number
          restaurant_id: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description: string
          id?: string
          image?: string | null
          is_featured?: boolean | null
          menu_pdf?: string | null
          name: string
          price: number
          restaurant_id?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string
          id?: string
          image?: string | null
          is_featured?: boolean | null
          menu_pdf?: string | null
          name?: string
          price?: number
          restaurant_id?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      restaurants: {
        Row: {
          action_text: string | null
          created_at: string | null
          cuisine: string
          description: string
          hotel_id: string | null
          id: string
          images: string[]
          is_featured: boolean | null
          location: string
          name: string
          open_hours: string
          status: string
          updated_at: string | null
        }
        Insert: {
          action_text?: string | null
          created_at?: string | null
          cuisine: string
          description: string
          hotel_id?: string | null
          id?: string
          images?: string[]
          is_featured?: boolean | null
          location: string
          name: string
          open_hours: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          action_text?: string | null
          created_at?: string | null
          cuisine?: string
          description?: string
          hotel_id?: string | null
          id?: string
          images?: string[]
          is_featured?: boolean | null
          location?: string
          name?: string
          open_hours?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurants_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          amenities: string[] | null
          capacity: number
          created_at: string | null
          floor: number
          hotel_id: string | null
          id: string
          images: string[] | null
          price: number
          room_number: string
          status: string
          type: string
          updated_at: string | null
        }
        Insert: {
          amenities?: string[] | null
          capacity: number
          created_at?: string | null
          floor: number
          id?: string
          images?: string[] | null
          price: number
          room_number: string
          status: string
          type: string
          updated_at?: string | null
        }
        Update: {
          amenities?: string[] | null
          capacity?: number
          created_at?: string | null
          floor?: number
          id?: string
          images?: string[] | null
          price?: number
          room_number?: string
          status?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      service_requests: {
        Row: {
          assigned_to: string | null
          assigned_to_name: string | null
          category_id: string | null
          created_at: string | null
          description: string | null
          guest_id: string
          guest_name: string | null
          hotel_id: string | null
          id: string
          request_item_id: string | null
          room_id: string
          room_number: string | null
          status: string
          type: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          assigned_to_name?: string | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          guest_id: string
          guest_name?: string | null
          id?: string
          request_item_id?: string | null
          room_id: string
          room_number?: string | null
          status?: string
          type: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          assigned_to_name?: string | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          guest_id?: string
          guest_name?: string | null
          id?: string
          request_item_id?: string | null
          room_id?: string
          room_number?: string | null
          status?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_requests_request_item_id_fkey"
            columns: ["request_item_id"]
            isOneToOne: false
            referencedRelation: "request_items"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_categories: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      shop_products: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          image: string | null
          is_featured: boolean | null
          name: string
          price: number | null
          shop_id: string
          status: string | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image?: string | null
          is_featured?: boolean | null
          name: string
          price?: number | null
          shop_id: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image?: string | null
          is_featured?: boolean | null
          name?: string
          price?: number | null
          shop_id?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shop_products_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      shops: {
        Row: {
          category_id: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          description: string
          hours: string | null
          icon: string | null
          id: string
          image: string | null
          is_featured: boolean | null
          is_hotel_shop: boolean | null
          location: string | null
          name: string
          short_description: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          description: string
          hours?: string | null
          icon?: string | null
          id?: string
          image?: string | null
          is_featured?: boolean | null
          is_hotel_shop?: boolean | null
          location?: string | null
          name: string
          short_description?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string
          hours?: string | null
          icon?: string | null
          id?: string
          image?: string | null
          is_featured?: boolean | null
          is_hotel_shop?: boolean | null
          location?: string | null
          name?: string
          short_description?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shops_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "shop_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      spa_bookings: {
        Row: {
          created_at: string | null
          date: string
          facility_id: string | null
          guest_email: string
          guest_name: string
          guest_phone: string | null
          hotel_id: string | null
          id: string
          room_number: string | null
          service_id: string | null
          special_requests: string | null
          status: string
          time: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          facility_id?: string | null
          guest_email: string
          guest_name: string
          guest_phone?: string | null
          id?: string
          room_number?: string | null
          service_id?: string | null
          special_requests?: string | null
          status?: string
          time: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          facility_id?: string | null
          guest_email?: string
          guest_name?: string
          guest_phone?: string | null
          id?: string
          room_number?: string | null
          service_id?: string | null
          special_requests?: string | null
          status?: string
          time?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "spa_bookings_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "spa_facilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spa_bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "spa_services"
            referencedColumns: ["id"]
          },
        ]
      }
      spa_facilities: {
        Row: {
          capacity: number | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          location: string | null
          name: string
          opening_hours: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          capacity?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          location?: string | null
          name: string
          opening_hours?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          capacity?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          location?: string | null
          name?: string
          opening_hours?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      spa_services: {
        Row: {
          category: string
          created_at: string | null
          description: string
          duration: string
          facility_id: string | null
          id: string
          image: string | null
          is_featured: boolean | null
          name: string
          price: number
          status: string
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description: string
          duration: string
          facility_id?: string | null
          id?: string
          image?: string | null
          is_featured?: boolean | null
          name: string
          price: number
          status?: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string
          duration?: string
          facility_id?: string | null
          id?: string
          image?: string | null
          is_featured?: boolean | null
          name?: string
          price?: number
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "spa_services_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "spa_facilities"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          reference_id: string | null
          reference_type: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          reference_id?: string | null
          reference_type?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          reference_id?: string | null
          reference_type?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      stories: {
        Row: {
          category: string
          created_at: string
          description: string
          eventId: string | null
          id: string
          image: string
          is_active: boolean | null
          seen: boolean | null
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          eventId?: string | null
          id?: string
          image: string
          is_active?: boolean | null
          seen?: boolean | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          eventId?: string | null
          id?: string
          image?: string
          is_active?: boolean | null
          seen?: boolean | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stories_event_id_fkey"
            columns: ["eventId"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      table_reservations: {
        Row: {
          created_at: string | null
          date: string
          guest_email: string | null
          guest_name: string | null
          guest_phone: string | null
          guests: number
          hotel_id: string | null
          id: string
          restaurant_id: string | null
          room_number: string | null
          special_requests: string | null
          status: string
          time: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          guest_email?: string | null
          guest_name?: string | null
          guest_phone?: string | null
          guests: number
          id?: string
          restaurant_id?: string | null
          room_number?: string | null
          special_requests?: string | null
          status?: string
          time: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          guest_email?: string | null
          guest_name?: string | null
          guest_phone?: string | null
          guests?: number
          id?: string
          restaurant_id?: string | null
          room_number?: string | null
          special_requests?: string | null
          status?: string
          time?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "table_reservations_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          hotel_id: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          hotel_id?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          hotel_id?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_guest_by_id: {
        Args: { p_user_id: string }
        Returns: {
          birth_date: string | null
          check_in_date: string | null
          check_out_date: string | null
          created_at: string | null
          email: string | null
          first_name: string
          guest_type: string | null
          id: string
          last_name: string
          nationality: string | null
          phone: string | null
          profile_image: string | null
          room_number: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "guests"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      get_user_hotels: {
        Args: { user_id: string }
        Returns: {
          hotel_id: string
          role: string
        }[]
      }
      has_hotel_role: {
        Args: { hotel_id: string; required_role: string; user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      insert_guest_from_registration:
      | {
        Args: {
          birth_date?: string
          check_in_date?: string
          check_out_date?: string
          email: string
          first_name: string
          last_name: string
          nationality?: string
          room_number: string
          user_id: string
        }
        Returns: string
      }
      | {
        Args: {
          birth_date?: string
          check_in_date?: string
          check_out_date?: string
          email: string
          first_name: string
          last_name: string
          nationality?: string
          phone?: string
          profile_image?: string
          room_number: string
          user_id: string
        }
        Returns: string
      }
      is_admin: { Args: { user_id: string }; Returns: boolean }
      is_hotel_admin: {
        Args: { hotel_id: string; user_id: string }
        Returns: boolean
      }
      is_staff_member: { Args: { _user_id: string }; Returns: boolean }
      is_super_admin: { Args: { user_id: string }; Returns: boolean }
      is_user_admin: { Args: { _user_id: string }; Returns: boolean }
      owns_guest_record: {
        Args: { _guest_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
      | "admin"
      | "moderator"
      | "user"
      | "staff"
      | "super_admin"
      | "hotel_admin"
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
    Enums: {
      app_role: [
        "admin",
        "moderator",
        "user",
        "staff",
        "super_admin",
        "hotel_admin",
      ],
    },
  },
} as const
