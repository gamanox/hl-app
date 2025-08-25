// QuickBooks integration utilities
export interface QBConfig {
  clientId: string
  clientSecret: string
  environment: "sandbox" | "production"
  redirectUri: string
}

export interface QBInvoice {
  id?: string
  customerId: string
  amount: number
  description: string
  dueDate: string
  items: QBInvoiceItem[]
}

export interface QBInvoiceItem {
  description: string
  quantity: number
  rate: number
  amount: number
}

export class QuickBooksService {
  private config: QBConfig

  constructor(config: QBConfig) {
    this.config = config
  }

  // Generate OAuth URL for QuickBooks connection
  getAuthUrl(): string {
    const baseUrl =
      this.config.environment === "sandbox"
        ? "https://appcenter.intuit.com/connect/oauth2"
        : "https://appcenter.intuit.com/connect/oauth2"

    const params = new URLSearchParams({
      client_id: this.config.clientId,
      scope: "com.intuit.quickbooks.accounting",
      redirect_uri: this.config.redirectUri,
      response_type: "code",
      access_type: "offline",
    })

    return `${baseUrl}?${params.toString()}`
  }

  // Create invoice (to be implemented with actual QB API)
  async createInvoice(invoice: QBInvoice): Promise<{ success: boolean; invoiceId?: string; error?: string }> {
    // This would integrate with actual QuickBooks API
    // For now, return mock response
    return {
      success: true,
      invoiceId: `INV-${Date.now()}`,
    }
  }

  // Get customer info (to be implemented with actual QB API)
  async getCustomer(customerId: string): Promise<any> {
    // Mock implementation
    return {
      id: customerId,
      name: "Mock Customer",
      email: "customer@example.com",
    }
  }
}

// Export singleton instance
export const qbService = new QuickBooksService({
  clientId: process.env.EXPO_PUBLIC_QB_CLIENT_ID || "",
  clientSecret: process.env.EXPO_PUBLIC_QB_CLIENT_SECRET || "",
  environment: "sandbox",
  redirectUri: process.env.EXPO_PUBLIC_QB_REDIRECT_URI || "",
})

/**
 * QuickBooks OAuth Flow:
 * 1. User clicks "Connect to QuickBooks" -> calls connectQuickBooks()
 * 2. User is redirected to QB OAuth page
 * 3. QB redirects back with code -> calls handleCallback(code)
 * 4. Server exchanges code for access/refresh tokens
 * 5. Tokens are stored in Supabase with encryption
 * 6. Refresh tokens are used to maintain connection
 *
 * Token Storage in Supabase:
 * - Table: qb_connections
 * - Columns: user_id, company_id, access_token (encrypted), refresh_token (encrypted),
 *           expires_at, created_at, updated_at
 * - RLS: Users can only access their own connections
 */

// Connect to QuickBooks - initiates OAuth flow
export async function connectQuickBooks(): Promise<{ success: boolean; authUrl?: string; error?: string }> {
  try {
    console.log("[v0] Initiating QuickBooks connection...")

    // TODO: Replace with actual API call
    const response = await fetch("/api/qb/connect", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: "current-user-id", // TODO: Get from auth context
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "Failed to initiate QB connection")
    }

    console.log("[v0] QB connection initiated successfully")
    return {
      success: true,
      authUrl: data.authUrl,
    }
  } catch (error) {
    console.error("[v0] QB connection error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Handle OAuth callback from QuickBooks
export async function handleCallback(code: string, realmId: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.log("[v0] Handling QB OAuth callback...")

    // TODO: Replace with actual API call
    const response = await fetch("/api/qb/callback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code,
        realmId,
        userId: "current-user-id", // TODO: Get from auth context
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "Failed to complete QB connection")
    }

    console.log("[v0] QB OAuth callback handled successfully")

    // TODO: Update local state/cache with connection status
    // TODO: Store connection info in Supabase:
    // await supabase.from('qb_connections').upsert({
    //   user_id: userId,
    //   company_id: realmId,
    //   access_token: encrypt(data.accessToken),
    //   refresh_token: encrypt(data.refreshToken),
    //   expires_at: new Date(Date.now() + data.expiresIn * 1000),
    //   updated_at: new Date(),
    // })

    return { success: true }
  } catch (error) {
    console.error("[v0] QB callback error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Create QuickBooks invoice from work order
export async function createInvoiceFromWorkOrder(workOrderId: string): Promise<{
  success: boolean
  invoiceId?: string
  qbInvoiceId?: string
  error?: string
}> {
  try {
    console.log("[v0] Creating QB invoice for work order:", workOrderId)

    // TODO: Replace with actual API call
    const response = await fetch("/api/qb/invoice", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        workOrderId,
        userId: "current-user-id", // TODO: Get from auth context
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "Failed to create QB invoice")
    }

    console.log("[v0] QB invoice created successfully:", data.qbInvoiceId)

    // TODO: Update work order with QB invoice reference
    // await supabase.from('work_orders').update({
    //   qb_invoice_id: data.qbInvoiceId,
    //   qb_invoice_url: data.invoiceUrl,
    //   updated_at: new Date(),
    // }).eq('id', workOrderId)

    return {
      success: true,
      invoiceId: data.invoiceId,
      qbInvoiceId: data.qbInvoiceId,
    }
  } catch (error) {
    console.error("[v0] QB invoice creation error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Handle QuickBooks webhooks (for real-time updates)
export async function webhookHandler(payload: any): Promise<{ success: boolean; error?: string }> {
  try {
    console.log("[v0] Processing QB webhook:", payload.eventNotifications?.[0]?.dataChangeEvent?.entities?.[0]?.name)

    // TODO: Replace with actual API call
    const response = await fetch("/api/qb/webhook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "Failed to process QB webhook")
    }

    console.log("[v0] QB webhook processed successfully")

    // TODO: Update local data based on webhook events
    // - Invoice status changes
    // - Customer updates
    // - Payment notifications
    // - Item catalog changes

    return { success: true }
  } catch (error) {
    console.error("[v0] QB webhook error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Check QuickBooks connection status
export async function getConnectionStatus(): Promise<{
  connected: boolean
  companyName?: string
  expiresAt?: Date
  error?: string
}> {
  try {
    // TODO: Check connection status from Supabase
    // const { data, error } = await supabase
    //   .from('qb_connections')
    //   .select('company_id, expires_at, company_name')
    //   .eq('user_id', userId)
    //   .single()

    // Mock response for now
    return {
      connected: false, // TODO: Return actual connection status
      companyName: "Mock Company",
      expiresAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 180 days
    }
  } catch (error) {
    console.error("[v0] QB connection status error:", error)
    return {
      connected: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
