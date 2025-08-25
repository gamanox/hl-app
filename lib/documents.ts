import { supabase } from "./supabase"

export interface Document {
  id: string
  work_order_id: string
  type: "quote" | "purchase_order" | "invoice" | "report"
  title: string
  content: any // JSON content
  status: "draft" | "pending_signature" | "signed" | "rejected"
  client_signature?: string
  client_signed_at?: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface DocumentItem {
  id: string
  description: string
  quantity: number
  unit_price: number
  total: number
}

export interface QuoteData {
  work_order_id: string
  client_id: string
  items: DocumentItem[]
  subtotal: number
  tax_rate: number
  tax_amount: number
  total: number
  notes?: string
  valid_until: string
}

export class DocumentService {
  // Get documents by work order
  static async getDocumentsByWorkOrder(workOrderId: string) {
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("work_order_id", workOrderId)
      .order("created_at", { ascending: false })

    return { data, error }
  }

  // Get documents by client
  static async getDocumentsByClient(clientId: string) {
    const { data, error } = await supabase
      .from("documents")
      .select(`
        *,
        work_order:work_orders(id, title, type)
      `)
      .eq("client_id", clientId)
      .order("created_at", { ascending: false })

    return { data, error }
  }

  // Create quote
  static async createQuote(quoteData: QuoteData) {
    const document = {
      work_order_id: quoteData.work_order_id,
      type: "quote" as const,
      title: `Cotización - Orden ${quoteData.work_order_id}`,
      content: quoteData,
      status: "pending_signature" as const,
      created_by: "current_user_id", // Replace with actual user ID
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // For now, return mock response
    return {
      data: { ...document, id: `doc-${Date.now()}` },
      error: null,
    }
  }

  // Create purchase order
  static async createPurchaseOrder(poData: QuoteData) {
    const document = {
      work_order_id: poData.work_order_id,
      type: "purchase_order" as const,
      title: `Orden de Compra - Orden ${poData.work_order_id}`,
      content: poData,
      status: "pending_signature" as const,
      created_by: "current_user_id",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    return {
      data: { ...document, id: `doc-${Date.now()}` },
      error: null,
    }
  }

  // Sign document
  static async signDocument(documentId: string, signature: string) {
    const updates = {
      client_signature: signature,
      client_signed_at: new Date().toISOString(),
      status: "signed" as const,
      updated_at: new Date().toISOString(),
    }

    // For now, return mock response
    return {
      data: { id: documentId, ...updates },
      error: null,
    }
  }

  // Reject document
  static async rejectDocument(documentId: string, reason?: string) {
    const updates = {
      status: "rejected" as const,
      rejection_reason: reason,
      updated_at: new Date().toISOString(),
    }

    return {
      data: { id: documentId, ...updates },
      error: null,
    }
  }

  // Generate PDF (mock implementation)
  static async generatePDF(document: Document): Promise<string> {
    // In a real implementation, this would generate a PDF
    // For now, return a mock URL
    return `https://example.com/documents/${document.id}.pdf`
  }

  // Calculate totals
  static calculateTotals(items: DocumentItem[], taxRate = 0.1) {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0)
    const taxAmount = subtotal * taxRate
    const total = subtotal + taxAmount

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      taxAmount: Math.round(taxAmount * 100) / 100,
      total: Math.round(total * 100) / 100,
    }
  }
}
