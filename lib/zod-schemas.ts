import { z } from "zod"

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
})

export const registerSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  fullName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  role: z.enum(["admin", "technician", "client"]),
})

// Work Order schemas
export const workOrderSchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
  type: z.enum(["preventive_maintenance", "piping", "installation", "measurement", "immediate_service"]),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  scheduledDate: z.string().optional(),
  clientId: z.string().uuid(),
  technicianId: z.string().uuid().optional(),
})

// Session schemas
export const sessionSchema = z.object({
  workOrderId: z.string().uuid(),
  notes: z.string().optional(),
})

export const sessionUpdateSchema = z.object({
  notes: z.string().optional(),
  status: z.enum(["active", "paused", "completed"]).optional(),
})

// User schema
export const userSchema = z.object({
  id: z.string().uuid(),
  rol: z.enum(["admin", "technician", "client"]),
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
})

// ParteLinea schema
export const parteLineaSchema = z.object({
  partId: z.string(),
  nombre: z.string().min(1, "El nombre de la parte es requerido"),
  qty: z.number().positive("La cantidad debe ser positiva"),
  costoEstimado: z.number().nonnegative("El costo no puede ser negativo"),
})

// Sesion schema (comprehensive version)
export const sesionSchema = z.object({
  id: z.string().uuid(),
  startedAt: z.date(),
  pausedAt: z.array(z.date()).default([]),
  finishedAt: z.date().optional(),
  notas: z.string().optional(),
  fotos: z.array(z.string().url()).default([]),
  geofence: z.boolean().default(false),
})

// Quote/PO/Invoice schemas
export const quoteSchema = z.object({
  id: z.string().uuid(),
  numero: z.string(),
  status: z.enum(["draft", "sent", "approved", "rejected"]),
  total: z.number().nonnegative(),
  pdfUrl: z.string().url().optional(),
  firmaCliente: z.string().optional(), // Can be URL or base64 signature
})

export const poSchema = z.object({
  id: z.string().uuid(),
  numero: z.string(),
  status: z.enum(["draft", "sent", "approved", "rejected"]),
  total: z.number().nonnegative(),
  pdfUrl: z.string().url().optional(),
  firmaCliente: z.string().optional(),
})

export const invoiceSchema = z.object({
  id: z.string().uuid(),
  numero: z.string(),
  status: z.enum(["draft", "sent", "paid", "overdue"]),
  total: z.number().nonnegative(),
  pdfUrl: z.string().url().optional(),
  firmaCliente: z.string().optional(),
})

// WorkOrder schema (comprehensive version)
export const workOrderComprehensiveSchema = z.object({
  id: z.string().regex(/^WO-\d{4}$/, "ID debe tener formato WO-XXXX"),
  tipo: z.enum(["preventive_maintenance", "piping", "installation", "measurement", "immediate_service"]),
  estado: z.enum(["pending", "in_progress", "done", "archived"]).default("pending"),
  prioridad: z.enum(["low", "normal", "high"]).default("normal"),
  fecha_estimada: z.date().optional(),
  duracion_estimada: z.number().positive().optional(),
  asignados: z.array(userSchema).default([]),
  creado_por: z.enum(["customer", "technician", "admin"]),
  clienteId: z.string().uuid(),
  maquinaId: z.string().uuid().optional(),
  sesiones: z.array(sesionSchema).default([]),
  partes: z.array(parteLineaSchema).default([]),
  cotizaciones: z.array(quoteSchema).default([]),
  ordenes_compra: z.array(poSchema).default([]),
  facturas: z.array(invoiceSchema).default([]),
})

// Types
export type LoginForm = z.infer<typeof loginSchema>
export type RegisterForm = z.infer<typeof registerSchema>
export type WorkOrderForm = z.infer<typeof workOrderSchema>
export type SessionForm = z.infer<typeof sessionSchema>
export type SessionUpdate = z.infer<typeof sessionUpdateSchema>
export type User = z.infer<typeof userSchema>
export type ParteLinea = z.infer<typeof parteLineaSchema>
export type Sesion = z.infer<typeof sesionSchema>
export type Quote = z.infer<typeof quoteSchema>
export type PO = z.infer<typeof poSchema>
export type Invoice = z.infer<typeof invoiceSchema>
export type WorkOrderComprehensive = z.infer<typeof workOrderComprehensiveSchema>
