"use client"

import { View, Text, ScrollView, Alert } from "react-native"
import { useState, useEffect } from "react"
import { router, useLocalSearchParams } from "expo-router"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardHeader } from "../../components/ui/Card"
import { Button } from "../../components/ui/Button"
import { Select } from "../../components/ui/Select"
import { Textarea } from "../../components/ui/Textarea"
import { useAuth } from "../../lib/auth"
import { mockWorkOrders } from "../../lib/mock-data"
import { sessionSchema, type SessionForm } from "../../lib/zod-schemas"

export default function CreateSessionScreen() {
  const { orderId } = useLocalSearchParams()
  const { profile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [availableOrders, setAvailableOrders] = useState<any[]>([])

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<SessionForm>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      workOrderId: (orderId as string) || "",
      notes: "",
    },
  })

  useEffect(() => {
    loadAvailableOrders()
    if (orderId) {
      setValue("workOrderId", orderId as string)
    }
  }, [orderId])

  const loadAvailableOrders = async () => {
    if (!profile || profile.role !== "technician") return

    try {
      // Load orders assigned to this technician
      const technicianOrders = mockWorkOrders.filter(
        (order) => order.technician_id === profile.id && order.status !== "completed" && order.status !== "cancelled",
      )
      setAvailableOrders(technicianOrders)
    } catch (error) {
      Alert.alert("Error", "Error al cargar las órdenes")
    }
  }

  const onSubmit = async (data: SessionForm) => {
    setLoading(true)
    try {
      // For now, simulate creating session
      console.log("Creating session:", data)

      Alert.alert("Éxito", "Sesión iniciada exitosamente", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ])
    } catch (error) {
      Alert.alert("Error", "Error al iniciar la sesión")
    } finally {
      setLoading(false)
    }
  }

  if (profile?.role !== "technician") {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-lg text-gray-900">Acceso solo para técnicos</Text>
      </View>
    )
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-6">
        <Card>
          <CardHeader>
            <Text className="text-xl font-bold text-gray-900">Nueva Sesión de Trabajo</Text>
            <Text className="text-gray-600">Inicia una nueva sesión para registrar tu tiempo de trabajo</Text>
          </CardHeader>

          <CardContent className="space-y-4">
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">Orden de Trabajo</Text>
              <Controller
                control={control}
                name="workOrderId"
                render={({ field: { onChange, value } }) => (
                  <Select
                    value={value}
                    onValueChange={onChange}
                    placeholder="Seleccionar orden..."
                    options={availableOrders.map((order) => ({
                      label: `${order.title} - ${order.type}`,
                      value: order.id,
                    }))}
                  />
                )}
              />
              {errors.workOrderId && <Text className="text-error-500 text-sm mt-1">{errors.workOrderId.message}</Text>}
            </View>

            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">Notas Iniciales (Opcional)</Text>
              <Controller
                control={control}
                name="notes"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Textarea
                    placeholder="Describe el trabajo que vas a realizar..."
                    value={value || ""}
                    onChangeText={onChange}
                    onBlur={onBlur}
                  />
                )}
              />
            </View>

            <View className="bg-primary-50 rounded-xl p-4 mt-6">
              <Text className="text-primary-900 font-medium mb-2">Información Importante</Text>
              <Text className="text-primary-700 text-sm">• La sesión se iniciará automáticamente al crear</Text>
              <Text className="text-primary-700 text-sm">• Puedes pausar y reanudar la sesión cuando necesites</Text>
              <Text className="text-primary-700 text-sm">• Solo puedes tener una sesión activa a la vez</Text>
            </View>

            <View className="flex-row space-x-3 mt-6">
              <Button
                title="Cancelar"
                variant="outline"
                onPress={() => router.back()}
                className="flex-1 bg-transparent"
              />
              <Button
                title={loading ? "Iniciando..." : "Iniciar Sesión"}
                onPress={handleSubmit(onSubmit)}
                disabled={loading}
                className="flex-1"
              />
            </View>
          </CardContent>
        </Card>
      </View>
    </ScrollView>
  )
}
