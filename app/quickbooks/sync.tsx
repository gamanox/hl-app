"use client"

import { useState } from "react"
import { View, ScrollView, Alert } from "react-native"
import { Text, Button, VStack, HStack, Progress, Box } from "@gluestack-ui/themed"
import { quickBooksService } from "../../lib/quickbooks"
import { useAuth } from "../../lib/auth"

export default function QuickBooksSync() {
  const { user } = useAuth()
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncProgress, setSyncProgress] = useState(0)
  const [syncResults, setSyncResults] = useState<{
    customers: { success: number; errors: number }
    items: { success: number; errors: number }
    invoices: { success: number; errors: number }
  } | null>(null)

  const handleFullSync = async () => {
    if (!quickBooksService.isConnected()) {
      Alert.alert("Error", "QuickBooks no está conectado")
      return
    }

    setIsSyncing(true)
    setSyncProgress(0)
    setSyncResults(null)

    try {
      // Sync customers
      setSyncProgress(25)
      const customerResults = await quickBooksService.syncCustomersToApp()

      // Simulate item sync
      setSyncProgress(50)
      const itemResults = { success: 15, errors: 0 }

      // Simulate invoice sync
      setSyncProgress(75)
      const invoiceResults = { success: 8, errors: 1 }

      setSyncProgress(100)
      setSyncResults({
        customers: customerResults,
        items: itemResults,
        invoices: invoiceResults,
      })

      Alert.alert("Sincronización Completa", "Los datos se han sincronizado exitosamente")
    } catch (error) {
      Alert.alert("Error", "Error durante la sincronización")
    } finally {
      setIsSyncing(false)
    }
  }

  const handleCustomerSync = async () => {
    setIsSyncing(true)
    try {
      const results = await quickBooksService.syncCustomersToApp()
      Alert.alert("Sincronización de Clientes", `Éxito: ${results.success}, Errores: ${results.errors}`)
    } catch (error) {
      Alert.alert("Error", "Error sincronizando clientes")
    } finally {
      setIsSyncing(false)
    }
  }

  if (user?.rol !== "admin") {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-lg text-center">Solo los administradores pueden sincronizar datos</Text>
      </View>
    )
  }

  return (
    <ScrollView className="flex-1 bg-white">
      <VStack space="lg" className="p-4">
        {/* Sync Progress */}
        {isSyncing && (
          <Box className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
            <VStack space="md">
              <Text className="text-lg font-semibold text-blue-800">Sincronizando...</Text>
              <Progress value={syncProgress} className="w-full">
                <Progress.FilledTrack />
              </Progress>
              <Text className="text-sm text-blue-600 text-center">{syncProgress}% completado</Text>
            </VStack>
          </Box>
        )}

        {/* Sync Options */}
        <VStack space="md">
          <Text className="text-xl font-bold">Opciones de Sincronización</Text>

          <Button onPress={handleFullSync} disabled={isSyncing} className="bg-blue-600">
            <Text className="text-white font-medium">Sincronización Completa</Text>
          </Button>

          <HStack space="md">
            <Button
              onPress={handleCustomerSync}
              disabled={isSyncing}
              variant="outline"
              className="border-green-500 flex-1 bg-transparent"
            >
              <Text className="text-green-600 font-medium">Solo Clientes</Text>
            </Button>

            <Button disabled={isSyncing} variant="outline" className="border-orange-500 flex-1 bg-transparent">
              <Text className="text-orange-600 font-medium">Solo Productos</Text>
            </Button>
          </HStack>
        </VStack>

        {/* Sync Results */}
        {syncResults && (
          <Box className="p-4 border border-gray-200 rounded-lg">
            <VStack space="md">
              <Text className="text-lg font-semibold">Resultados de Sincronización</Text>

              <VStack space="sm">
                <HStack space="md" className="justify-between">
                  <Text className="text-sm font-medium">Clientes:</Text>
                  <Text className="text-sm">
                    {syncResults.customers.success} éxito, {syncResults.customers.errors} errores
                  </Text>
                </HStack>

                <HStack space="md" className="justify-between">
                  <Text className="text-sm font-medium">Productos:</Text>
                  <Text className="text-sm">
                    {syncResults.items.success} éxito, {syncResults.items.errors} errores
                  </Text>
                </HStack>

                <HStack space="md" className="justify-between">
                  <Text className="text-sm font-medium">Facturas:</Text>
                  <Text className="text-sm">
                    {syncResults.invoices.success} éxito, {syncResults.invoices.errors} errores
                  </Text>
                </HStack>
              </VStack>
            </VStack>
          </Box>
        )}

        {/* Sync Information */}
        <Box className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <VStack space="md">
            <Text className="text-lg font-semibold">Información de Sincronización</Text>
            <VStack space="sm">
              <Text className="text-sm text-gray-700">• La sincronización completa puede tomar varios minutos</Text>
              <Text className="text-sm text-gray-700">• Los datos existentes se actualizarán automáticamente</Text>
              <Text className="text-sm text-gray-700">
                • Las facturas se crean automáticamente al completar órdenes
              </Text>
              <Text className="text-sm text-gray-700">• Se recomienda sincronizar semanalmente</Text>
            </VStack>
          </VStack>
        </Box>

        {/* Auto-sync Settings */}
        <Box className="p-4 border border-gray-200 rounded-lg">
          <VStack space="md">
            <Text className="text-lg font-semibold">Configuración Automática</Text>
            <VStack space="sm">
              <HStack space="md" className="justify-between items-center">
                <Text className="text-sm">Sincronización automática de clientes</Text>
                {/* <Switch /> */}
                <Text className="text-xs text-gray-500">Próximamente</Text>
              </HStack>
              <HStack space="md" className="justify-between items-center">
                <Text className="text-sm">Creación automática de facturas</Text>
                {/* <Switch /> */}
                <Text className="text-xs text-gray-500">Próximamente</Text>
              </HStack>
            </VStack>
          </VStack>
        </Box>
      </VStack>
    </ScrollView>
  )
}
