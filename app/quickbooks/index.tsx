"use client"

import { useState, useEffect } from "react"
import { View, ScrollView, Alert } from "react-native"
import { Text, Button, VStack, HStack, Badge, Box } from "@gluestack-ui/themed"
import { quickBooksService } from "../../lib/quickbooks"
import { useAuth } from "../../lib/auth"
import { router } from "expo-router"

export default function QuickBooksIntegration() {
  const { user } = useAuth()
  const [connectionInfo, setConnectionInfo] = useState(quickBooksService.getConnectionInfo())
  const [isConnecting, setIsConnecting] = useState(false)
  const [syncStats, setSyncStats] = useState<{ customers: number; invoices: number } | null>(null)

  useEffect(() => {
    // Handle OAuth redirect (in a real app, you'd use deep linking)
    const handleDeepLink = (url: string) => {
      const urlObj = new URL(url)
      const code = urlObj.searchParams.get("code")
      const realmId = urlObj.searchParams.get("realmId")

      if (code && realmId) {
        handleOAuthCallback(code, realmId)
      }
    }

    // In a real app, you'd set up deep link listener here
    // Linking.addEventListener('url', handleDeepLink)
  }, [])

  const handleOAuthCallback = async (code: string, realmId: string) => {
    setIsConnecting(true)
    try {
      const success = await quickBooksService.exchangeCodeForTokens(code, realmId)
      if (success) {
        setConnectionInfo(quickBooksService.getConnectionInfo())
        Alert.alert("Success", "QuickBooks connected successfully!")
      } else {
        Alert.alert("Error", "Failed to connect to QuickBooks")
      }
    } catch (error) {
      Alert.alert("Error", "Failed to connect to QuickBooks")
    } finally {
      setIsConnecting(false)
    }
  }

  const handleConnect = async () => {
    try {
      const authUrl = await quickBooksService.initiateOAuth()

      // In a real app, this would open the browser for OAuth
      Alert.alert(
        "QuickBooks OAuth",
        "In a production app, this would open your browser to authenticate with QuickBooks.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Simulate Success",
            onPress: () => {
              // Simulate successful connection for demo
              quickBooksService.exchangeCodeForTokens("demo_code", "demo_realm_id")
              setConnectionInfo(quickBooksService.getConnectionInfo())
            },
          },
        ],
      )
    } catch (error) {
      Alert.alert("Error", "Failed to initiate QuickBooks connection")
    }
  }

  const handleDisconnect = () => {
    Alert.alert("Disconnect QuickBooks", "Are you sure you want to disconnect from QuickBooks?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Disconnect",
        style: "destructive",
        onPress: () => {
          quickBooksService.disconnect()
          setConnectionInfo(quickBooksService.getConnectionInfo())
          setSyncStats(null)
        },
      },
    ])
  }

  const handleSync = () => {
    router.push("/quickbooks/sync")
  }

  if (user?.rol !== "admin") {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-lg text-center">
          Solo los administradores pueden acceder a la integración de QuickBooks
        </Text>
      </View>
    )
  }

  return (
    <ScrollView className="flex-1 bg-white">
      <VStack space="lg" className="p-4">
        {/* Connection Status */}
        <Box className="p-4 border border-gray-200 rounded-lg">
          <VStack space="md">
            <HStack space="md" className="items-center">
              <Text className="text-lg font-semibold">Estado de Conexión</Text>
              <Badge
                variant={connectionInfo.connected ? "solid" : "outline"}
                action={connectionInfo.connected ? "success" : "muted"}
              >
                <Text className="text-xs">{connectionInfo.connected ? "Conectado" : "Desconectado"}</Text>
              </Badge>
            </HStack>

            {connectionInfo.connected && (
              <VStack space="sm">
                <Text className="text-sm text-gray-600">Company ID: {connectionInfo.companyId}</Text>
                {connectionInfo.tokenExpiry && (
                  <Text className="text-sm text-gray-600">
                    Token expira: {connectionInfo.tokenExpiry.toLocaleDateString()}
                  </Text>
                )}
              </VStack>
            )}
          </VStack>
        </Box>

        {/* Connection Actions */}
        <VStack space="md">
          {!connectionInfo.connected ? (
            <Button onPress={handleConnect} disabled={isConnecting} className="bg-blue-600">
              <Text className="text-white font-medium">{isConnecting ? "Conectando..." : "Conectar QuickBooks"}</Text>
            </Button>
          ) : (
            <HStack space="md">
              <Button onPress={handleSync} className="bg-green-600 flex-1">
                <Text className="text-white font-medium">Sincronizar Datos</Text>
              </Button>
              <Button onPress={handleDisconnect} variant="outline" className="border-red-500 flex-1 bg-transparent">
                <Text className="text-red-500 font-medium">Desconectar</Text>
              </Button>
            </HStack>
          )}
        </VStack>

        {/* Sync Statistics */}
        {syncStats && (
          <Box className="p-4 border border-gray-200 rounded-lg">
            <VStack space="md">
              <Text className="text-lg font-semibold">Última Sincronización</Text>
              <HStack space="lg">
                <VStack space="xs" className="items-center">
                  <Text className="text-2xl font-bold text-blue-600">{syncStats.customers}</Text>
                  <Text className="text-sm text-gray-600">Clientes</Text>
                </VStack>
                <VStack space="xs" className="items-center">
                  <Text className="text-2xl font-bold text-green-600">{syncStats.invoices}</Text>
                  <Text className="text-sm text-gray-600">Facturas</Text>
                </VStack>
              </HStack>
            </VStack>
          </Box>
        )}

        {/* Features */}
        <Box className="p-4 border border-gray-200 rounded-lg">
          <VStack space="md">
            <Text className="text-lg font-semibold">Funcionalidades</Text>
            <VStack space="sm">
              <Text className="text-sm text-gray-700">• Sincronización de clientes</Text>
              <Text className="text-sm text-gray-700">• Creación automática de facturas</Text>
              <Text className="text-sm text-gray-700">• Sincronización de productos/servicios</Text>
              <Text className="text-sm text-gray-700">• Reportes financieros integrados</Text>
            </VStack>
          </VStack>
        </Box>

        {/* Instructions */}
        <Box className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <VStack space="md">
            <Text className="text-lg font-semibold text-blue-800">Instrucciones de Configuración</Text>
            <VStack space="sm">
              <Text className="text-sm text-blue-700">
                1. Conecta tu cuenta de QuickBooks usando el botón de arriba
              </Text>
              <Text className="text-sm text-blue-700">2. Autoriza el acceso a tu empresa en QuickBooks</Text>
              <Text className="text-sm text-blue-700">3. Sincroniza los datos para comenzar la integración</Text>
              <Text className="text-sm text-blue-700">
                4. Las facturas se crearán automáticamente al completar órdenes
              </Text>
            </VStack>
          </VStack>
        </Box>
      </VStack>
    </ScrollView>
  )
}
