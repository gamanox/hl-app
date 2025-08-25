"use client"

import { useState, useEffect } from "react"
import { View, Text, ScrollView, Alert } from "react-native"
import { useAuth } from "@/lib/auth"
import { quickBooksService } from "@/lib/qb"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { Switch } from "@/components/ui/Switch"
import { Separator } from "@/components/ui/Separator"
import { Bell, Settings, Shield, RefreshCw, ExternalLink, Users, Lock } from "lucide-react-native"

interface NotificationSettings {
  emailNotifications: {
    newWorkOrder: boolean
    statusUpdate: boolean
    sessionStarted: boolean
    documentSigned: boolean
    invoiceGenerated: boolean
  }
  pushNotifications: {
    newWorkOrder: boolean
    statusUpdate: boolean
    sessionStarted: boolean
    documentSigned: boolean
    invoiceGenerated: boolean
  }
}

interface QBIntegration {
  connected: boolean
  lastSync: Date | null
  companyName?: string
  status: "connected" | "disconnected" | "error"
}

export default function SettingsScreen() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: {
      newWorkOrder: true,
      statusUpdate: true,
      sessionStarted: false,
      documentSigned: true,
      invoiceGenerated: true,
    },
    pushNotifications: {
      newWorkOrder: true,
      statusUpdate: false,
      sessionStarted: true,
      documentSigned: true,
      invoiceGenerated: false,
    },
  })

  const [qbIntegration, setQbIntegration] = useState<QBIntegration>({
    connected: false,
    lastSync: null,
    status: "disconnected",
  })

  const [syncLogs, setSyncLogs] = useState([
    { id: 1, timestamp: new Date(), type: "success", message: "Customers synced successfully (15 records)" },
    {
      id: 2,
      timestamp: new Date(Date.now() - 3600000),
      type: "warning",
      message: "Invoice sync completed with 2 warnings",
    },
    {
      id: 3,
      timestamp: new Date(Date.now() - 7200000),
      type: "error",
      message: "Connection timeout during items sync",
    },
  ])

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      // TODO: Load actual settings from Supabase
      // const settings = await supabase.getSettings(user.id);
      console.log("[v0] Loading user settings...")
    } catch (error) {
      console.error("[v0] Error loading settings:", error)
    }
  }

  const handleNotificationToggle = (category: "emailNotifications" | "pushNotifications", event: string) => {
    setNotifications((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [event]: !prev[category][event as keyof NotificationSettings["emailNotifications"]],
      },
    }))

    // TODO: Save to Supabase
    console.log("[v0] Notification setting updated:", category, event)
  }

  const handleConnectQuickBooks = async () => {
    try {
      setLoading(true)
      const result = await quickBooksService.connectQuickBooks()
      if (result.success) {
        setQbIntegration((prev) => ({
          ...prev,
          connected: true,
          status: "connected",
          companyName: result.companyName,
        }))
        Alert.alert("Success", "QuickBooks connected successfully!")
      }
    } catch (error) {
      Alert.alert("Error", "Failed to connect to QuickBooks")
      console.error("[v0] QB connection error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSyncNow = async () => {
    try {
      setLoading(true)
      // TODO: Implement actual sync
      await new Promise((resolve) => setTimeout(resolve, 2000))
      setQbIntegration((prev) => ({
        ...prev,
        lastSync: new Date(),
      }))
      Alert.alert("Success", "Sync completed successfully!")
    } catch (error) {
      Alert.alert("Error", "Sync failed")
    } finally {
      setLoading(false)
    }
  }

  const renderNotificationSection = () => (
    <Card className="p-4 mb-4">
      <View className="flex-row items-center mb-4">
        <Bell size={20} className="text-primary mr-2" />
        <Text className="text-lg font-semibold">Notifications</Text>
      </View>

      <Text className="text-sm font-medium mb-3 text-muted-foreground">Email Notifications</Text>
      {Object.entries(notifications.emailNotifications).map(([key, value]) => (
        <View key={key} className="flex-row items-center justify-between py-2">
          <Text className="text-sm capitalize">{key.replace(/([A-Z])/g, " $1").toLowerCase()}</Text>
          <Switch value={value} onValueChange={() => handleNotificationToggle("emailNotifications", key)} />
        </View>
      ))}

      <Separator className="my-4" />

      <Text className="text-sm font-medium mb-3 text-muted-foreground">Push Notifications</Text>
      {Object.entries(notifications.pushNotifications).map(([key, value]) => (
        <View key={key} className="flex-row items-center justify-between py-2">
          <Text className="text-sm capitalize">{key.replace(/([A-Z])/g, " $1").toLowerCase()}</Text>
          <Switch value={value} onValueChange={() => handleNotificationToggle("pushNotifications", key)} />
        </View>
      ))}
    </Card>
  )

  const renderIntegrationsSection = () => (
    <Card className="p-4 mb-4">
      <View className="flex-row items-center mb-4">
        <Settings size={20} className="text-primary mr-2" />
        <Text className="text-lg font-semibold">Integrations</Text>
      </View>

      <View className="mb-4">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-base font-medium">QuickBooks</Text>
          <Badge variant={qbIntegration.status === "connected" ? "default" : "secondary"} className="capitalize">
            {qbIntegration.status}
          </Badge>
        </View>

        {qbIntegration.connected && qbIntegration.companyName && (
          <Text className="text-sm text-muted-foreground mb-2">Connected to: {qbIntegration.companyName}</Text>
        )}

        {qbIntegration.lastSync && (
          <Text className="text-sm text-muted-foreground mb-3">
            Last sync: {qbIntegration.lastSync.toLocaleString()}
          </Text>
        )}

        <View className="flex-row gap-2">
          {!qbIntegration.connected ? (
            <Button onPress={handleConnectQuickBooks} loading={loading} className="flex-1">
              <ExternalLink size={16} className="mr-2" />
              Connect QuickBooks
            </Button>
          ) : (
            <>
              <Button variant="outline" onPress={handleSyncNow} loading={loading} className="flex-1 bg-transparent">
                <RefreshCw size={16} className="mr-2" />
                Sync Now
              </Button>
              <Button
                variant="destructive"
                onPress={() => {
                  setQbIntegration((prev) => ({
                    ...prev,
                    connected: false,
                    status: "disconnected",
                    companyName: undefined,
                  }))
                }}
                className="flex-1"
              >
                Disconnect
              </Button>
            </>
          )}
        </View>
      </View>

      {qbIntegration.connected && (
        <>
          <Separator className="my-4" />
          <Text className="text-sm font-medium mb-3">Sync Logs</Text>
          <View className="max-h-32">
            <ScrollView>
              {syncLogs.map((log) => (
                <View key={log.id} className="flex-row items-start py-2">
                  <Badge
                    variant={log.type === "success" ? "default" : log.type === "warning" ? "secondary" : "destructive"}
                    className="mr-2 mt-0.5"
                  >
                    {log.type}
                  </Badge>
                  <View className="flex-1">
                    <Text className="text-sm">{log.message}</Text>
                    <Text className="text-xs text-muted-foreground">{log.timestamp.toLocaleString()}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </>
      )}
    </Card>
  )

  const renderSecuritySection = () => {
    if (user?.role !== "admin") return null

    return (
      <Card className="p-4 mb-4">
        <View className="flex-row items-center mb-4">
          <Shield size={20} className="text-primary mr-2" />
          <Text className="text-lg font-semibold">Security & Access</Text>
        </View>

        <View className="space-y-3">
          <View className="flex-row items-center justify-between py-2">
            <View className="flex-1">
              <Text className="text-sm font-medium">Role Management</Text>
              <Text className="text-xs text-muted-foreground">Manage user roles and permissions</Text>
            </View>
            <Button variant="outline" size="sm">
              <Users size={16} className="mr-2" />
              Manage
            </Button>
          </View>

          <Separator />

          <View className="flex-row items-center justify-between py-2">
            <View className="flex-1">
              <Text className="text-sm font-medium">Row Level Security</Text>
              <Text className="text-xs text-muted-foreground">Configure database access policies</Text>
            </View>
            <Button variant="outline" size="sm">
              <Lock size={16} className="mr-2" />
              Configure
            </Button>
          </View>

          <Separator />

          <View className="bg-muted p-3 rounded-lg">
            <Text className="text-xs text-muted-foreground">
              <Text className="font-medium">TODO:</Text> Implement RLS policies in Supabase:
              {"\n"}• Customers can only see their own work orders
              {"\n"}• Technicians can only see assigned orders
              {"\n"}• Admins have full access to all data
              {"\n"}• Session data is restricted by work order access
            </Text>
          </View>
        </View>
      </Card>
    )
  }

  return (
    <ScrollView className="flex-1 bg-background p-4">
      <Text className="text-2xl font-bold mb-6">Settings</Text>

      {renderNotificationSection()}
      {renderIntegrationsSection()}
      {renderSecuritySection()}

      <View className="pb-8">
        <Text className="text-xs text-muted-foreground text-center">CNC Service Management v1.0.0</Text>
      </View>
    </ScrollView>
  )
}
