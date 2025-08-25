// QuickBooks API configuration
const QB_BASE_URL = "https://sandbox-quickbooks.api.intuit.com"
const QB_DISCOVERY_URL = "https://appcenter.intuit.com/connect/oauth2"

export interface QBCustomer {
  Id: string
  Name: string
  CompanyName?: string
  PrimaryEmailAddr?: { Address: string }
  PrimaryPhone?: { FreeFormNumber: string }
  BillAddr?: {
    Line1?: string
    City?: string
    CountrySubDivisionCode?: string
    PostalCode?: string
  }
}

export interface QBItem {
  Id: string
  Name: string
  Description?: string
  UnitPrice?: number
  Type: "Inventory" | "NonInventory" | "Service"
}

export interface QBInvoice {
  Id: string
  DocNumber: string
  TxnDate: string
  DueDate?: string
  TotalAmt: number
  Balance: number
  CustomerRef: { value: string; name: string }
  Line: Array<{
    Amount: number
    DetailType: string
    SalesItemLineDetail?: {
      ItemRef: { value: string; name: string }
      Qty?: number
      UnitPrice?: number
    }
  }>
}

class QuickBooksService {
  private accessToken: string | null = null
  private refreshToken: string | null = null
  private companyId: string | null = null
  private tokenExpiry: Date | null = null

  // OAuth Authentication
  async initiateOAuth(): Promise<string> {
    const state = Math.random().toString(36).substring(7)
    const scope = "com.intuit.quickbooks.accounting"

    const authUrl =
      `${QB_DISCOVERY_URL}?` +
      `client_id=${process.env.EXPO_PUBLIC_QB_CLIENT_ID}&` +
      `scope=${encodeURIComponent(scope)}&` +
      `redirect_uri=${encodeURIComponent(process.env.EXPO_PUBLIC_QB_REDIRECT_URI!)}&` +
      `response_type=code&` +
      `access_type=offline&` +
      `state=${state}`

    return authUrl
  }

  async exchangeCodeForTokens(code: string, realmId: string): Promise<boolean> {
    try {
      const response = await fetch("https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${btoa(`${process.env.EXPO_PUBLIC_QB_CLIENT_ID}:${process.env.EXPO_PUBLIC_QB_CLIENT_SECRET}`)}`,
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: process.env.EXPO_PUBLIC_QB_REDIRECT_URI!,
        }),
      })

      const data = await response.json()

      if (data.access_token) {
        this.accessToken = data.access_token
        this.refreshToken = data.refresh_token
        this.companyId = realmId
        this.tokenExpiry = new Date(Date.now() + data.expires_in * 1000)

        // Store tokens securely (in production, use secure storage)
        // await SecureStore.setItemAsync('qb_access_token', this.accessToken)
        // await SecureStore.setItemAsync('qb_refresh_token', this.refreshToken)
        // await SecureStore.setItemAsync('qb_company_id', this.companyId)

        return true
      }
      return false
    } catch (error) {
      console.error("Error exchanging code for tokens:", error)
      return false
    }
  }

  async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) return false

    try {
      const response = await fetch("https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${btoa(`${process.env.EXPO_PUBLIC_QB_CLIENT_ID}:${process.env.EXPO_PUBLIC_QB_CLIENT_SECRET}`)}`,
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: this.refreshToken,
        }),
      })

      const data = await response.json()

      if (data.access_token) {
        this.accessToken = data.access_token
        this.refreshToken = data.refresh_token
        this.tokenExpiry = new Date(Date.now() + data.expires_in * 1000)
        return true
      }
      return false
    } catch (error) {
      console.error("Error refreshing token:", error)
      return false
    }
  }

  private async makeQBRequest(endpoint: string, method: "GET" | "POST" = "GET", body?: any) {
    if (!this.accessToken || !this.companyId) {
      throw new Error("QuickBooks not authenticated")
    }

    // Check if token needs refresh
    if (this.tokenExpiry && new Date() >= this.tokenExpiry) {
      await this.refreshAccessToken()
    }

    const url = `${QB_BASE_URL}/v3/company/${this.companyId}/${endpoint}`

    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    })

    if (!response.ok) {
      throw new Error(`QuickBooks API error: ${response.statusText}`)
    }

    return response.json()
  }

  // Customer operations
  async getCustomers(): Promise<QBCustomer[]> {
    try {
      const response = await this.makeQBRequest("query?query=SELECT * FROM Customer")
      return response.QueryResponse?.Customer || []
    } catch (error) {
      console.error("Error fetching customers:", error)
      return []
    }
  }

  async createCustomer(customer: Partial<QBCustomer>): Promise<QBCustomer | null> {
    try {
      const response = await this.makeQBRequest("customers", "POST", { Customer: customer })
      return response.QueryResponse?.Customer?.[0] || null
    } catch (error) {
      console.error("Error creating customer:", error)
      return null
    }
  }

  // Item operations
  async getItems(): Promise<QBItem[]> {
    try {
      const response = await this.makeQBRequest("query?query=SELECT * FROM Item")
      return response.QueryResponse?.Item || []
    } catch (error) {
      console.error("Error fetching items:", error)
      return []
    }
  }

  async createItem(item: Partial<QBItem>): Promise<QBItem | null> {
    try {
      const response = await this.makeQBRequest("items", "POST", { Item: item })
      return response.QueryResponse?.Item?.[0] || null
    } catch (error) {
      console.error("Error creating item:", error)
      return null
    }
  }

  // Invoice operations
  async getInvoices(): Promise<QBInvoice[]> {
    try {
      const response = await this.makeQBRequest("query?query=SELECT * FROM Invoice")
      return response.QueryResponse?.Invoice || []
    } catch (error) {
      console.error("Error fetching invoices:", error)
      return []
    }
  }

  async createInvoice(invoice: Partial<QBInvoice>): Promise<QBInvoice | null> {
    try {
      const response = await this.makeQBRequest("invoices", "POST", { Invoice: invoice })
      return response.QueryResponse?.Invoice?.[0] || null
    } catch (error) {
      console.error("Error creating invoice:", error)
      return null
    }
  }

  // Sync operations
  async syncCustomersToApp(): Promise<{ success: number; errors: number }> {
    const customers = await this.getCustomers()
    let success = 0
    let errors = 0

    for (const customer of customers) {
      try {
        // Here you would sync to your local database
        // await supabase.from('customers').upsert({
        //   qb_id: customer.Id,
        //   name: customer.Name,
        //   email: customer.PrimaryEmailAddr?.Address,
        //   phone: customer.PrimaryPhone?.FreeFormNumber,
        //   company: customer.CompanyName
        // })
        success++
      } catch (error) {
        console.error(`Error syncing customer ${customer.Id}:`, error)
        errors++
      }
    }

    return { success, errors }
  }

  async syncInvoicesFromApp(workOrderId: string): Promise<boolean> {
    try {
      // Get work order data from your app
      // const workOrder = await getWorkOrder(workOrderId)
      // const customer = await getCustomer(workOrder.clienteId)

      // Create invoice in QuickBooks
      const invoiceData = {
        CustomerRef: { value: "1" }, // Replace with actual customer QB ID
        Line: [
          {
            Amount: 100.0,
            DetailType: "SalesItemLineDetail",
            SalesItemLineDetail: {
              ItemRef: { value: "1", name: "Service" },
              Qty: 1,
              UnitPrice: 100.0,
            },
          },
        ],
      }

      const invoice = await this.createInvoice(invoiceData)
      return !!invoice
    } catch (error) {
      console.error("Error syncing invoice to QuickBooks:", error)
      return false
    }
  }

  // Connection status
  isConnected(): boolean {
    return !!(this.accessToken && this.companyId)
  }

  getConnectionInfo() {
    return {
      connected: this.isConnected(),
      companyId: this.companyId,
      tokenExpiry: this.tokenExpiry,
    }
  }

  disconnect() {
    this.accessToken = null
    this.refreshToken = null
    this.companyId = null
    this.tokenExpiry = null

    // Clear stored tokens
    // SecureStore.deleteItemAsync('qb_access_token')
    // SecureStore.deleteItemAsync('qb_refresh_token')
    // SecureStore.deleteItemAsync('qb_company_id')
  }
}

export const quickBooksService = new QuickBooksService()
