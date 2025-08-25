"use client"

import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native"
import { useState, useEffect } from "react"
import { router } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { Badge } from "../../components/ui/Badge"
import { Button } from "../../components/ui/Button"
import { Select } from "../../components/ui/Select"
import { useAuth } from "../../lib/auth"
import { mockWorkOrders } from "../../lib/mock-data"

export default function OrdersScreen() {
  const { profile } = useAuth()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const [sortBy, setSortBy] = useState("created_at")

  useEffect(() => {
    loadOrders()
  }, [profile])

  const loadOrders = async () => {
    if (!profile) return

    setLoading(true)
    try {
      // For now, use mock data. In production, use actual API calls
      let filteredOrders = mockWorkOrders

      if (profile.role === "technician") {
        filteredOrders = mockWorkOrders.filter((order) => order.technician_id === profile.id)
      } else if (profile.role === "client") {
        filteredOrders = mockWorkOrders.filter((order) => order.client_id === profile.id)
      }

      setOrders(filteredOrders)
    } catch (error) {
      Alert.alert("Error", "Error al cargar las órdenes")
    } finally {
      setLoading(false)
    }
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

  const filteredOrders = orders.filter((order) => {
    if (filter === "all") return true
    return order.status === filter
  })

  const getScreenTitle = () => {
    switch (profile?.role) {
      case "admin":
        return "Gestión de Órdenes"
      case "technician":
        return "Mis Órdenes Asignadas"
      default:
        return "Mis Servicios"
    }
  }

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-lg text-gray-600">Cargando órdenes...</Text>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white p-6 border-b border-gray-100">
        <View className="flex-row justify-between items-center mb-4">
          <View>
            <Text className="text-2xl font-bold text-gray-900">{getScreenTitle()}</Text>
            <Text className="text-gray-600">{filteredOrders.length} órdenes encontradas</Text>
          </View>
          {(profile?.role === "admin" || profile?.role === "client") && (
            <TouchableOpacity
              onPress={() => router.push("/orders/create")}
              className="bg-primary-500 rounded-xl px-4 py-2 flex-row items-center"
            >
              <Ionicons name="add" size={20} color="white" />
              <Text className="text-white font-semibold ml-1">Nueva</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Filters */}
        <View className="flex-row space-x-3">
          <View className="flex-1">
            <Select
              value={filter}
              onValueChange={setFilter}
              options={[
                { label: "Todas", value: "all" },
                { label: "Pendientes", value: "pending" },
                { label: "Asignadas", value: "assigned" },
                { label: "En Progreso", value: "in_progress" },
                { label: "Completadas", value: "completed" },
              ]}
            />
          </View>
          <View className="flex-1">
            <Select
              value={sortBy}
              onValueChange={setSortBy}
              options={[
                { label: "Fecha Creación", value: "created_at" },
                { label: "Fecha Programada", value: "scheduled_date" },
                { label: "Prioridad", value: "priority" },
                { label: "Estado", value: "status" },
              ]}
            />
          </View>
        </View>
      </View>

      {/* Orders List */}
      <ScrollView className="flex-1 p-6">
        <View className="space-y-4">
          {filteredOrders.map((order) => (
            <TouchableOpacity
              key={order.id}
              onPress={() => router.push(`/orders/${order.id}`)}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
            >
              <View className="flex-row justify-between items-start mb-3">
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-gray-900 mb-1">{order.title}</Text>
                  <Text className="text-sm text-gray-600">{getTypeLabel(order.type)}</Text>
                </View>
                <View className="items-end space-y-1">
                  {getStatusBadge(order.status)}
                  {getPriorityBadge(order.priority)}
                </View>
              </View>

              <Text className="text-gray-700 mb-3" numberOfLines={2}>
                {order.description}
              </Text>

              <View className="flex-row justify-between items-center">
                <View>
                  {profile?.role !== "client" && <Text className="text-sm text-gray-600">Cliente: Empresa ABC</Text>}
                  {profile?.role !== "technician" && order.technician_id && (
                    <Text className="text-sm text-gray-600">Técnico: Juan Pérez</Text>
                  )}
                  {order.scheduled_date && (
                    <Text className="text-sm text-gray-600">
                      Programada: {new Date(order.scheduled_date).toLocaleDateString()}
                    </Text>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={20} color="#6b7280" />
              </View>
            </TouchableOpacity>
          ))}

          {filteredOrders.length === 0 && (
            <View className="bg-white rounded-2xl p-8 items-center">
              <Ionicons name="document-outline" size={48} color="#9ca3af" />
              <Text className="text-lg font-semibold text-gray-900 mt-4 mb-2">No hay órdenes</Text>
              <Text className="text-gray-600 text-center mb-4">
                {filter === "all" ? "No se encontraron órdenes" : `No hay órdenes con estado "${filter}"`}
              </Text>
              {(profile?.role === "admin" || profile?.role === "client") && (
                <Button title="Crear Primera Orden" onPress={() => router.push("/orders/create")} />
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  )
}
