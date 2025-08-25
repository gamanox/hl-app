import "react-native-url-polyfill/auto"
import { createClient } from "@supabase/supabase-js"
import AsyncStorage from "@react-native-async-storage/async-storage"

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          role: "admin" | "technician" | "client"
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          role: "admin" | "technician" | "client"
        }
        Update: {
          full_name?: string
          role?: "admin" | "technician" | "client"
        }
      }
      work_orders: {
        Row: {
          id: string
          client_id: string
          technician_id: string | null
          type: "preventive_maintenance" | "piping" | "installation" | "measurement" | "immediate_service"
          status: "pending" | "assigned" | "in_progress" | "completed" | "cancelled"
          title: string
          description: string
          priority: "low" | "medium" | "high" | "urgent"
          scheduled_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          client_id: string
          technician_id?: string | null
          type: "preventive_maintenance" | "piping" | "installation" | "measurement" | "immediate_service"
          title: string
          description: string
          priority?: "low" | "medium" | "high" | "urgent"
          scheduled_date?: string | null
        }
        Update: {
          technician_id?: string | null
          status?: "pending" | "assigned" | "in_progress" | "completed" | "cancelled"
          title?: string
          description?: string
          priority?: "low" | "medium" | "high" | "urgent"
          scheduled_date?: string | null
        }
      }
      work_sessions: {
        Row: {
          id: string
          work_order_id: string
          technician_id: string
          start_time: string
          end_time: string | null
          status: "active" | "paused" | "completed"
          notes: string | null
          created_at: string
        }
        Insert: {
          work_order_id: string
          technician_id: string
          start_time: string
          notes?: string | null
        }
        Update: {
          end_time?: string | null
          status?: "active" | "paused" | "completed"
          notes?: string | null
        }
      }
      parts_catalog: {
        Row: {
          id: string
          name: string
          cost: number
        }
      }
      work_order_parts: {
        Row: {
          work_order_id: string
          part_id: string
          quantity: number
        }
      }
      quotes: {
        Row: {
          id: string
          work_order_id: string
          items: any[]
          status: string
        }
      }
      purchase_orders: {
        Row: {
          id: string
          quote_id: string
          status: string
        }
      }
    }
  }
}

// Authentication Functions (STUBS)
export const auth = {
  async signInWithOtp(email: string) {
    // TODO: Replace with real Supabase auth
    // return await supabase.auth.signInWithOtp({ email })
    console.log("[STUB] signInWithOtp called with:", email)
    return { data: { user: null, session: null }, error: null }
  },

  async verifyOtp(email: string, token: string) {
    // TODO: Replace with real Supabase auth
    // return await supabase.auth.verifyOtp({ email, token, type: 'email' })
    console.log("[STUB] verifyOtp called with:", email, token)
    return {
      data: {
        user: { id: "1", email, role: "admin" },
        session: { access_token: "mock-token" },
      },
      error: null,
    }
  },

  async signOut() {
    // TODO: Replace with real Supabase auth
    // return await supabase.auth.signOut()
    console.log("[STUB] signOut called")
    return { error: null }
  },
}

// Data Functions (STUBS)
export const data = {
  async listWorkOrders(filters?: { status?: string; technician_id?: string; client_id?: string }) {
    // TODO: Replace with real Supabase query with RLS
    // RLS Policy: Users can only see work orders based on their role:
    // - admin: all work orders
    // - technician: assigned work orders
    // - client: their own work orders
    // return await supabase.from('work_orders').select('*').match(filters || {})
    console.log("[STUB] listWorkOrders called with filters:", filters)
    return {
      data: [{ id: "WO-001", title: "Mock Work Order", status: "pending", client_id: "1" }],
      error: null,
    }
  },

  async getWorkOrder(id: string) {
    // TODO: Replace with real Supabase query with RLS
    // RLS Policy: Same as listWorkOrders - role-based access
    // return await supabase.from('work_orders').select('*').eq('id', id).single()
    console.log("[STUB] getWorkOrder called with id:", id)
    return {
      data: { id, title: "Mock Work Order", status: "pending" },
      error: null,
    }
  },

  async createWorkOrder(workOrderData: any) {
    // TODO: Replace with real Supabase insert with RLS
    // RLS Policy: Only admins and clients can create work orders
    // return await supabase.from('work_orders').insert(workOrderData).select().single()
    console.log("[STUB] createWorkOrder called with:", workOrderData)
    return {
      data: { id: "WO-" + Date.now(), ...workOrderData },
      error: null,
    }
  },

  async updateWorkOrder(id: string, updates: any) {
    // TODO: Replace with real Supabase update with RLS
    // RLS Policy: Admins can update all, technicians can update assigned orders, clients can update their own
    // return await supabase.from('work_orders').update(updates).eq('id', id).select().single()
    console.log("[STUB] updateWorkOrder called with:", id, updates)
    return {
      data: { id, ...updates },
      error: null,
    }
  },

  async listSessions(workOrderId?: string) {
    // TODO: Replace with real Supabase query with RLS
    // RLS Policy: Users can only see sessions for work orders they have access to
    // const query = supabase.from('work_sessions').select('*')
    // if (workOrderId) query.eq('work_order_id', workOrderId)
    // return await query
    console.log("[STUB] listSessions called with workOrderId:", workOrderId)
    return {
      data: [{ id: "S-001", work_order_id: workOrderId, status: "active" }],
      error: null,
    }
  },

  async createSession(workOrderId: string, technicianId: string, startTime: string) {
    // TODO: Replace with real Supabase insert with RLS
    // RLS Policy: Only assigned technicians can create sessions for their work orders
    // return await supabase.from('work_sessions').insert({
    //   work_order_id: workOrderId,
    //   technician_id: technicianId,
    //   start_time: startTime,
    //   status: 'active'
    // }).select().single()
    console.log("[STUB] createSession called with:", workOrderId, technicianId, startTime)
    return {
      data: { id: "S-" + Date.now(), work_order_id: workOrderId, technician_id: technicianId },
      error: null,
    }
  },

  async finishSession(sessionId: string, endTime: string, notes?: string) {
    // TODO: Replace with real Supabase update with RLS
    // RLS Policy: Only the session owner (technician) can finish their sessions
    // return await supabase.from('work_sessions').update({
    //   end_time: endTime,
    //   status: 'completed',
    //   notes
    // }).eq('id', sessionId).select().single()
    console.log("[STUB] finishSession called with:", sessionId, endTime, notes)
    return {
      data: { id: sessionId, end_time: endTime, status: "completed" },
      error: null,
    }
  },

  async listPartsCatalog() {
    // TODO: Replace with real Supabase query
    // RLS Policy: All authenticated users can view parts catalog
    // return await supabase.from('parts_catalog').select('*')
    console.log("[STUB] listPartsCatalog called")
    return {
      data: [{ id: "P-001", name: "Mock Part", cost: 25.99 }],
      error: null,
    }
  },

  async addPartToOrder(workOrderId: string, partId: string, quantity: number) {
    // TODO: Replace with real Supabase insert with RLS
    // RLS Policy: Only admins and assigned technicians can add parts to work orders
    // return await supabase.from('work_order_parts').insert({
    //   work_order_id: workOrderId,
    //   part_id: partId,
    //   quantity
    // }).select().single()
    console.log("[STUB] addPartToOrder called with:", workOrderId, partId, quantity)
    return {
      data: { work_order_id: workOrderId, part_id: partId, quantity },
      error: null,
    }
  },

  async generateQuote(workOrderId: string, items: any[]) {
    // TODO: Replace with real Supabase insert and PDF generation
    // RLS Policy: Only admins can generate quotes
    // return await supabase.from('quotes').insert({
    //   work_order_id: workOrderId,
    //   items,
    //   status: 'draft'
    // }).select().single()
    console.log("[STUB] generateQuote called with:", workOrderId, items)
    return {
      data: { id: "Q-" + Date.now(), work_order_id: workOrderId, status: "draft" },
      error: null,
    }
  },

  async generatePO(quoteId: string) {
    // TODO: Replace with real Supabase insert and PDF generation
    // RLS Policy: Only admins can generate purchase orders
    // return await supabase.from('purchase_orders').insert({
    //   quote_id: quoteId,
    //   status: 'pending'
    // }).select().single()
    console.log("[STUB] generatePO called with quoteId:", quoteId)
    return {
      data: { id: "PO-" + Date.now(), quote_id: quoteId, status: "pending" },
      error: null,
    }
  },

  async listCustomers() {
    // TODO: Replace with real Supabase query with RLS
    // RLS Policy: Admins see all customers, clients see only themselves
    // return await supabase.from('profiles').select('*').eq('role', 'client')
    console.log("[STUB] listCustomers called")
    return {
      data: [{ id: "1", full_name: "Mock Customer", email: "customer@example.com", role: "client" }],
      error: null,
    }
  },

  async listMachines() {
    // TODO: Replace with real Supabase query with RLS
    // RLS Policy: Users can only see machines they have access to based on work orders
    // return await supabase.from('machines').select('*')
    console.log("[STUB] listMachines called")
    return {
      data: [{ id: "M-001", name: "CNC Machine 1", model: "Haas VF-2", client_id: "1" }],
      error: null,
    }
  },

  async listTechnicians() {
    // TODO: Replace with real Supabase query with RLS
    // RLS Policy: Only admins can see all technicians
    // return await supabase.from('profiles').select('*').eq('role', 'technician')
    console.log("[STUB] listTechnicians called")
    return {
      data: [{ id: "2", full_name: "Mock Technician", email: "tech@example.com", role: "technician" }],
      error: null,
    }
  },
}

// RLS policy examples as comments
/*
RLS POLICY EXAMPLES TO IMPLEMENT:

-- Work Orders Policy
CREATE POLICY "work_orders_policy" ON work_orders FOR ALL USING (
  CASE 
    WHEN auth.jwt() ->> 'role' = 'admin' THEN true
    WHEN auth.jwt() ->> 'role' = 'technician' THEN technician_id = auth.uid()
    WHEN auth.jwt() ->> 'role' = 'client' THEN client_id = auth.uid()
    ELSE false
  END
);

-- Work Sessions Policy  
CREATE POLICY "work_sessions_policy" ON work_sessions FOR ALL USING (
  technician_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM work_orders 
    WHERE work_orders.id = work_sessions.work_order_id 
    AND (
      work_orders.client_id = auth.uid() OR 
      auth.jwt() ->> 'role' = 'admin'
    )
  )
);

-- Profiles Policy
CREATE POLICY "profiles_policy" ON profiles FOR ALL USING (
  id = auth.uid() OR auth.jwt() ->> 'role' = 'admin'
);
*/
