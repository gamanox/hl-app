import { supabase } from "./supabase"
import type { Database } from "./supabase"

type WorkSession = Database["public"]["Tables"]["work_sessions"]["Row"]
type WorkSessionInsert = Database["public"]["Tables"]["work_sessions"]["Insert"]
type WorkSessionUpdate = Database["public"]["Tables"]["work_sessions"]["Update"]

export class SessionService {
  // Get sessions by technician
  static async getSessionsByTechnician(technicianId: string) {
    const { data, error } = await supabase
      .from("work_sessions")
      .select(`
        *,
        work_order:work_orders(
          id, title, type, client_id,
          client:profiles!work_orders_client_id_fkey(full_name)
        )
      `)
      .eq("technician_id", technicianId)
      .order("start_time", { ascending: false })

    return { data, error }
  }

  // Get active session for technician
  static async getActiveSession(technicianId: string) {
    const { data, error } = await supabase
      .from("work_sessions")
      .select(`
        *,
        work_order:work_orders(
          id, title, type, client_id,
          client:profiles!work_orders_client_id_fkey(full_name)
        )
      `)
      .eq("technician_id", technicianId)
      .eq("status", "active")
      .single()

    return { data, error }
  }

  // Get sessions by work order
  static async getSessionsByWorkOrder(workOrderId: string) {
    const { data, error } = await supabase
      .from("work_sessions")
      .select(`
        *,
        technician:profiles!work_sessions_technician_id_fkey(full_name)
      `)
      .eq("work_order_id", workOrderId)
      .order("start_time", { ascending: false })

    return { data, error }
  }

  // Start new session
  static async startSession(workOrderId: string, technicianId: string, notes?: string) {
    // First, pause any active sessions
    await this.pauseActiveSessions(technicianId)

    const { data, error } = await supabase
      .from("work_sessions")
      .insert({
        work_order_id: workOrderId,
        technician_id: technicianId,
        start_time: new Date().toISOString(),
        status: "active",
        notes: notes || null,
      })
      .select()
      .single()

    return { data, error }
  }

  // Pause session
  static async pauseSession(sessionId: string) {
    const { data, error } = await supabase
      .from("work_sessions")
      .update({
        status: "paused",
      })
      .eq("id", sessionId)
      .select()
      .single()

    return { data, error }
  }

  // Resume session
  static async resumeSession(sessionId: string) {
    const { data, error } = await supabase
      .from("work_sessions")
      .update({
        status: "active",
      })
      .eq("id", sessionId)
      .select()
      .single()

    return { data, error }
  }

  // End session
  static async endSession(sessionId: string, notes?: string) {
    const { data, error } = await supabase
      .from("work_sessions")
      .update({
        end_time: new Date().toISOString(),
        status: "completed",
        notes: notes || undefined,
      })
      .eq("id", sessionId)
      .select()
      .single()

    return { data, error }
  }

  // Update session notes
  static async updateSessionNotes(sessionId: string, notes: string) {
    const { data, error } = await supabase.from("work_sessions").update({ notes }).eq("id", sessionId).select().single()

    return { data, error }
  }

  // Pause all active sessions for technician
  static async pauseActiveSessions(technicianId: string) {
    const { error } = await supabase
      .from("work_sessions")
      .update({ status: "paused" })
      .eq("technician_id", technicianId)
      .eq("status", "active")

    return { error }
  }

  // Calculate session duration
  static calculateDuration(startTime: string, endTime?: string | null): number {
    const start = new Date(startTime)
    const end = endTime ? new Date(endTime) : new Date()
    return Math.floor((end.getTime() - start.getTime()) / 1000 / 60) // minutes
  }

  // Format duration
  static formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }
}

// Mock implementation for compatibility
export const mockSessionService = {
  async getSessions() {
    return [
      {
        id: "1",
        workOrderId: "1",
        technicianId: "tech-1",
        status: "active",
        startTime: new Date().toISOString(),
        endTime: null,
        notes: "Iniciando mantenimiento preventivo",
      },
      {
        id: "2",
        workOrderId: "2",
        technicianId: "tech-2",
        status: "completed",
        startTime: new Date(Date.now() - 3600000).toISOString(),
        endTime: new Date().toISOString(),
        notes: "Instalación completada exitosamente",
      },
    ]
  },
}

// Use mock service for now since we don't have Supabase setup
export const sessionService = mockSessionService
