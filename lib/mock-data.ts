// Mock data for development and testing
export const mockUsers = [
  {
    id: "1",
    email: "admin@cnc.com",
    full_name: "Admin Usuario",
    role: "admin" as const,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    email: "tecnico@cnc.com",
    full_name: "Juan Técnico",
    role: "technician" as const,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "3",
    email: "cliente@empresa.com",
    full_name: "María Cliente",
    role: "client" as const,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
]

export const mockWorkOrders = [
  {
    id: "wo-1",
    client_id: "3",
    technician_id: "2",
    type: "preventive_maintenance" as const,
    status: "in_progress" as const,
    title: "Mantenimiento Preventivo Router CNC",
    description: "Revisión completa del sistema de router CNC, limpieza y calibración",
    priority: "medium" as const,
    scheduled_date: "2024-01-15T09:00:00Z",
    created_at: "2024-01-10T00:00:00Z",
    updated_at: "2024-01-12T00:00:00Z",
  },
  {
    id: "wo-2",
    client_id: "3",
    technician_id: null,
    type: "installation" as const,
    status: "pending" as const,
    title: "Instalación Nueva Máquina CNC",
    description: "Instalación y configuración de nueva máquina CNC para corte de madera",
    priority: "high" as const,
    scheduled_date: "2024-01-20T08:00:00Z",
    created_at: "2024-01-08T00:00:00Z",
    updated_at: "2024-01-08T00:00:00Z",
  },
  {
    id: "wo-3",
    client_id: "3",
    technician_id: "2",
    type: "immediate_service" as const,
    status: "completed" as const,
    title: "Reparación Urgente Sistema Aspiración",
    description: "Falla en el sistema de aspiración, requiere atención inmediata",
    priority: "urgent" as const,
    scheduled_date: "2024-01-05T14:00:00Z",
    created_at: "2024-01-05T13:00:00Z",
    updated_at: "2024-01-05T18:00:00Z",
  },
]

export const mockWorkSessions = [
  {
    id: "ws-1",
    work_order_id: "wo-1",
    technician_id: "2",
    start_time: "2024-01-15T09:00:00Z",
    end_time: null,
    status: "active" as const,
    notes: "Iniciando revisión del sistema de router",
    created_at: "2024-01-15T09:00:00Z",
  },
  {
    id: "ws-2",
    work_order_id: "wo-3",
    technician_id: "2",
    start_time: "2024-01-05T14:00:00Z",
    end_time: "2024-01-05T18:00:00Z",
    status: "completed" as const,
    notes: "Reparación completada. Sistema de aspiración funcionando correctamente.",
    created_at: "2024-01-05T14:00:00Z",
  },
]

// Helper functions for mock data
export const getWorkOrdersByTechnician = (technicianId: string) => {
  return mockWorkOrders.filter((order) => order.technician_id === technicianId)
}

export const getWorkOrdersByClient = (clientId: string) => {
  return mockWorkOrders.filter((order) => order.client_id === clientId)
}

export const getActiveSessionsByTechnician = (technicianId: string) => {
  return mockWorkSessions.filter((session) => session.technician_id === technicianId && session.status === "active")
}

export const getWorkOrderById = (orderId: string) => {
  return mockWorkOrders.find((order) => order.id === orderId)
}
