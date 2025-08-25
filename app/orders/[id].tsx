"use client"

import { View, Text, ScrollView, Alert, TouchableOpacity } from "react-native"
import { useState, useEffect } from "react"
import { useLocalSearchParams, router } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { Card, CardContent, CardHeader } from "../../components/ui/Card"
import { Badge } from "../../components/ui/Badge"
import { Button } from "../../components/ui/Button"
import { useAuth } from "../../lib/auth"
import { mockWorkOrders } from "../../lib/mock-data"

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams()
  const { profile } = useAuth()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadOrder()
  }, [id])

  const loadOrder = async () => {
    setLoading(true)
    try {
      // For now, use mock data
      const foundOrder = mockWorkOrders.find((o) => o.id === id)
      setOrder(foundOrder)
    } catch (error) {
      Alert.alert("Error", "Error al cargar la orden")
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (newStatus: string) => {
    Alert.alert("Confirmar", `¿Cambiar estado a "${newStatus}"?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Confirmar",
        onPress: async () => {
          // Update status logic here
          setOrder({ ...order, status: newStatus })
          Alert.alert("Éxito", "Estado actualizado")
        },
      },
    ])
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="warning" text="Pendiente" />
      case "assigned":
        return <Badge variant="info" text="Asignada" />
      case "in_progress":
        return <Badge variant="info" text="En Progreso" />
      case "completed":
        return <Badge variant="success" text="Completada" />
      case "cancelled":
        return <Badge variant="error" text="Cancelada" />
      default:
        return <Badge variant="default" text={status} />
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <Badge variant="error" text="Urgente" />
      case "high":
        return <Badge variant="warning" text="Alta" />
      case "medium":
        return <Badge variant="info" text="Media" />
      case "low":
        return <Badge variant="default" text="Baja" />
      default:
        return <Badge variant="default" text={priority} />
    }
  }

  const getTypeLabel = (type: string) => {
    const types = {
      preventive_maintenance: "Mantenimiento Preventivo",
      piping: "Tubería",
      installation: "Instalación",
      measurement: "Medición",
      immediate_service: "Servicio Inmediato",
    }
    return types[type as keyof typeof types] || type
  }

  const canEdit = () => {
    return profile?.role === "admin" || (profile?.role === "client" && order?.client_id === profile.id)
  }

  const canUpdateStatus = () => {
    return profile?.role === "admin" || (profile?.role === "technician" && order?.technician_id === profile.id)
  }

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-lg text-gray-600">Cargando orden...</Text>
      </View>
    )
  }

  if (!order) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-lg text-gray-900">Orden no encontrada</Text>
        <Button title="Volver" onPress={() => router.back()} className="mt-4" />
      </View>
    )
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-6 space-y-6">
        {/* Header Card */}
        <Card>
          <CardHeader>
            <View className="flex-row justify-between items-start">
              <View className="flex-1">
                <Text className="text-xl font-bold text-gray-900 mb-2">{order.title}</Text>
                <Text className="text-gray-600">{getTypeLabel(order.type)}</Text>
              </View>
              {canEdit() && (
                <TouchableOpacity
                  onPress={() => router.push(`/orders/${order.id}/edit`)}
                  className="bg-gray-100 rounded-lg p-2"
                >
                  <Ionicons name="pencil" size={20} color="#374151" />
                </TouchableOpacity>
              )}
            </View>
          </CardHeader>

          <CardContent>
            <View className="flex-row space-x-2 mb-4">
              {getStatusBadge(order.status)}
              {getPriorityBadge(order.priority)}
            </View>

            <Text className="text-gray-700 leading-6">{order.description}</Text>
          </CardContent>
        </Card>

        {/* Details Card */}
        <Card>
          <CardHeader>
            <Text className="text-lg font-semibold text-gray-900">Detalles</Text>
          </CardHeader>
          <CardContent className="space-y-3">
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Cliente:</Text>
              <Text className="font-medium text-gray-900">Empresa ABC</Text>
            </View>
            {order.technician_id && (
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Técnico:</Text>
                <Text className="font-medium text-gray-900">Juan Pérez</Text>
              </View>
            )}
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Creada:</Text>
              <Text className="font-medium text-gray-900">{new Date(order.created_at).toLocaleDateString()}</Text>
            </View>
            {order.scheduled_date && (
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Programada:</Text>
                <Text className="font-medium text-gray-900">{new Date(order.scheduled_date).toLocaleDateString()}</Text>
              </View>
            )}
          </CardContent>
        </Card>

        {/* Status Actions */}
        {canUpdateStatus() && order.status !== "completed" && order.status !== "cancelled" && (
          <Card>
            <CardHeader>
              <Text className="text-lg font-semibold text-gray-900">Acciones</Text>
            </CardHeader>
            <CardContent className="space-y-3">
              {order.status === "pending" && (
                <Button
                  title="Marcar como Asignada"
                  onPress={() => handleStatusUpdate("assigned")}
                  className="w-full"
                />
              )}
              {order.status === "assigned" && (
                <Button title="Iniciar Trabajo" onPress={() => handleStatusUpdate("in_progress")} className="w-full" />
              )}
              {order.status === "in_progress" && (
                <Button title="Completar Orden" onPress={() => handleStatusUpdate("completed")} className="w-full" />
              )}
              <Button
                title="Cancelar Orden"
                variant="outline"
                onPress={() => handleStatusUpdate("cancelled")}
                className="w-full bg-transparent border-error-500"
              />
            </CardContent>
          </Card>
        )}

        {/* Sessions Card (for technicians) */}
        {profile?.role === "technician" && order.technician_id === profile.id && (
          <Card>
            <CardHeader>
              <Text className="text-lg font-semibold text-gray-900">Sesiones de Trabajo</Text>
            </CardHeader>
            <CardContent>
              <Button
                title="Iniciar Nueva Sesión"
                onPress={() => router.push(`/sessions/create?orderId=${order.id}`)}
                className="w-full"
              />
            </CardContent>
          </Card>
        )}
      </View>
    </ScrollView>
  )
}
