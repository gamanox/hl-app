"use client"

import { View, Text, ScrollView, Alert } from "react-native"
import { useState, useEffect } from "react"
import { router } from "expo-router"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardHeader } from "../../components/ui/Card"
import { Input } from "../../components/ui/Input"
import { Button } from "../../components/ui/Button"
import { Select } from "../../components/ui/Select"
import { useAuth } from "../../lib/auth"
import { WorkOrderService } from "../../lib/work-orders"
import { workOrderSchema, type WorkOrderForm } from "../../lib/zod-schemas"

export default function CreateOrderScreen() {
  const { profile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [clients, setClients] = useState<any[]>([])
  const [technicians, setTechnicians] = useState<any[]>([])

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<WorkOrderForm>({
    resolver: zodResolver(workOrderSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "preventive_maintenance",
      priority: "medium",
      clientId: profile?.role === "client" ? profile.id : "",
      technicianId: "",
    },
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    if (profile?.role === "admin") {
      // Load clients and technicians for admin
      const [clientsResult, techniciansResult] = await Promise.all([
        WorkOrderService.getClients(),
        WorkOrderService.getTechnicians(),
      ])

      if (clientsResult.data) setClients(clientsResult.data)
      if (techniciansResult.data) setTechnicians(techniciansResult.data)
    }
  }

  const onSubmit = async (data: WorkOrderForm) => {
    setLoading(true)
    try {
      // For now, simulate API call
      console.log("Creating work order:", data)

      Alert.alert("Éxito", "Orden creada exitosamente", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ])
    } catch (error) {
      Alert.alert("Error", "Error al crear la orden")
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-6">
        <Card>
          <CardHeader>
            <Text className="text-xl font-bold text-gray-900">Nueva Orden de Trabajo</Text>
            <Text className="text-gray-600">Completa los datos para crear una nueva orden</Text>
          </CardHeader>

          <CardContent className="space-y-4">
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">Título</Text>
              <Controller
                control={control}
                name="title"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    placeholder="Ej: Mantenimiento Router CNC"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.title?.message}
                  />
                )}
              />
              {errors.title && <Text className="text-error-500 text-sm mt-1">{errors.title.message}</Text>}
            </View>

            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">Descripción</Text>
              <Controller
                control={control}
                name="description"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    placeholder="Describe el trabajo a realizar..."
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    multiline
                    numberOfLines={4}
                    error={errors.description?.message}
                  />
                )}
              />
              {errors.description && <Text className="text-error-500 text-sm mt-1">{errors.description.message}</Text>}
            </View>

            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">Tipo de Servicio</Text>
              <Controller
                control={control}
                name="type"
                render={({ field: { onChange, value } }) => (
                  <Select
                    value={value}
                    onValueChange={onChange}
                    options={[
                      { label: "Mantenimiento Preventivo", value: "preventive_maintenance" },
                      { label: "Tubería", value: "piping" },
                      { label: "Instalación", value: "installation" },
                      { label: "Medición", value: "measurement" },
                      { label: "Servicio Inmediato", value: "immediate_service" },
                    ]}
                  />
                )}
              />
            </View>

            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">Prioridad</Text>
              <Controller
                control={control}
                name="priority"
                render={({ field: { onChange, value } }) => (
                  <Select
                    value={value}
                    onValueChange={onChange}
                    options={[
                      { label: "Baja", value: "low" },
                      { label: "Media", value: "medium" },
                      { label: "Alta", value: "high" },
                      { label: "Urgente", value: "urgent" },
                    ]}
                  />
                )}
              />
            </View>

            {profile?.role === "admin" && (
              <>
                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-2">Cliente</Text>
                  <Controller
                    control={control}
                    name="clientId"
                    render={({ field: { onChange, value } }) => (
                      <Select
                        value={value}
                        onValueChange={onChange}
                        placeholder="Seleccionar cliente..."
                        options={clients.map((client) => ({
                          label: client.full_name,
                          value: client.id,
                        }))}
                      />
                    )}
                  />
                  {errors.clientId && <Text className="text-error-500 text-sm mt-1">{errors.clientId.message}</Text>}
                </View>

                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-2">Técnico (Opcional)</Text>
                  <Controller
                    control={control}
                    name="technicianId"
                    render={({ field: { onChange, value } }) => (
                      <Select
                        value={value || ""}
                        onValueChange={onChange}
                        placeholder="Asignar más tarde..."
                        options={[
                          { label: "Sin asignar", value: "" },
                          ...technicians.map((tech) => ({
                            label: tech.full_name,
                            value: tech.id,
                          })),
                        ]}
                      />
                    )}
                  />
                </View>
              </>
            )}

            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">Fecha Programada (Opcional)</Text>
              <Controller
                control={control}
                name="scheduledDate"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input placeholder="YYYY-MM-DD" value={value || ""} onChangeText={onChange} onBlur={onBlur} />
                )}
              />
            </View>

            <View className="flex-row space-x-3 mt-6">
              <Button
                title="Cancelar"
                variant="outline"
                onPress={() => router.back()}
                className="flex-1 bg-transparent"
              />
              <Button
                title={loading ? "Creando..." : "Crear Orden"}
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
