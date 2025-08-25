import { supabase } from "./supabase"
import type { Database } from "./supabase"

type WorkOrder = Database["public"]["Tables"]["work_orders"]["Row"]
type WorkOrderInsert = Database["public"]["Tables"]["work_orders"]["Insert"]
type WorkOrderUpdate = Database["public"]["Tables"]["work_orders"]["Update"]

export class WorkOrderService {
  // Get all work orders (admin only)
  static async getAllWorkOrders() {
    const { data, error } = await supabase
      .from("work_orders")
      .select(`
        *,
        client:profiles!work_orders_client_id_fkey(id, full_name, email),
        technician:profiles!work_orders_technician_id_fkey(id, full_name, email)
      `)
      .order("created_at", { ascending: false })

    return { data, error }
  }

  // Get work orders by technician
  static async getWorkOrdersByTechnician(technicianId: string) {
    const { data, error } = await supabase
      .from("work_orders")
      .select(`
        *,
        client:profiles!work_orders_client_id_fkey(id, full_name, email)
      `)
      .eq("technician_id", technicianId)
      .order("scheduled_date", { ascending: true })

    return { data, error }
  }

  // Get work orders by client
  static async getWorkOrdersByClient(clientId: string) {
    const { data, error } = await supabase
      .from("work_orders")
      .select(`
        *,
        technician:profiles!work_orders_technician_id_fkey(id, full_name, email)
      `)
      .eq("client_id", clientId)
      .order("created_at", { ascending: false })

    return { data, error }
  }

  // Get single work order
  static async getWorkOrder(id: string) {
    const { data, error } = await supabase
      .from("work_orders")
      .select(`
        *,
        client:profiles!work_orders_client_id_fkey(id, full_name, email),
        technician:profiles!work_orders_technician_id_fkey(id, full_name, email)
      `)
      .eq("id", id)
      .single()

    return { data, error }
  }

  // Create work order
  static async createWorkOrder(workOrder: WorkOrderInsert) {
    const { data, error } = await supabase.from("work_orders").insert(workOrder).select().single()

    return { data, error }
  }

  // Update work order
  static async updateWorkOrder(id: string, updates: WorkOrderUpdate) {
    const { data, error } = await supabase
      .from("work_orders")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()

    return { data, error }
  }

  // Delete work order
  static async deleteWorkOrder(id: string) {
    const { error } = await supabase.from("work_orders").delete().eq("id", id)

    return { error }
  }

  // Get available technicians
  static async getTechnicians() {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .eq("role", "technician")
      .order("full_name")

    return { data, error }
  }

  // Get clients
  static async getClients() {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .eq("role", "client")
      .order("full_name")

    return { data, error }
  }
}

// Mock implementation for compatibility
export const mockWorkOrderService = {
  async getWorkOrders() {
    return [
      {
        id: "1",
        title: "Mantenimiento Preventivo CNC-001",
        status: "pending",
        type: "preventive_maintenance",
        priority: "medium",
        clientId: "client-1",
        technicianId: "tech-1",
        scheduledDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      },
      {
        id: "2",
        title: "Instalación Nueva Máquina",
        status: "in_progress",
        type: "installation",
        priority: "high",
        clientId: "client-2",
        technicianId: "tech-2",
        scheduledDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      },
    ]
  },
}

// Use mock service for now since we don't have Supabase setup
export const workOrderService = mockWorkOrderService
