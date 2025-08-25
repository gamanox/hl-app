"use client"

import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native"
import { useState, useEffect } from "react"
import { router } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { Card, CardContent, CardHeader } from "../../components/ui/Card"
import { Badge } from "../../components/ui/Badge"
import { Button } from "../../components/ui/Button"
import { useAuth } from "../../lib/auth"
import { mockWorkOrders, mockWorkSessions } from "../../lib/mock-data"
import { SessionService } from "../../lib/sessions"

export default function CalendarScreen() {
  const { profile } = useAuth()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [scheduledOrders, setScheduledOrders] = useState<any[]>([])
  const [activeSession, setActiveSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCalendarData()
  }, [selectedDate, profile])

  const loadCalendarData = async () => {
    if (!profile) return

    setLoading(true)
    try {
      // Load scheduled orders for selected date
      const dateStr = selectedDate.toISOString().split("T")[0]
      let orders = mockWorkOrders.filter((order) => {
        if (!order.scheduled_date) return false
        return order.scheduled_date.startsWith(dateStr)
      })

      // Filter by role
      if (profile.role === "technician") {
        orders = orders.filter((order) => order.technician_id === profile.id)
      } else if (profile.role === "client") {
        orders = orders.filter((order) => order.client_id === profile.id)
      }

      setScheduledOrders(orders)

      // Load active session for technicians
      if (profile.role === "technician") {
        const activeSessionData = mockWorkSessions.find(
          (session) => session.technician_id === profile.id && session.status === "active",
        )
        setActiveSession(activeSessionData)
      }
    } catch (error) {
      Alert.alert("Error", "Error al cargar el calendario")
    } finally {
      setLoading(false)
    }
  }

  const handleStartSession = async (orderId: string) => {
    try {
      // For now, simulate starting session
      const newSession = {
        id: `session-${Date.now()}`,
        work_order_id: orderId,
        technician_id: profile?.id,
        start_time: new Date().toISOString(),
        end_time: null,
        status: "active",
        notes: null,
        created_at: new Date().toISOString(),
      }
      setActiveSession(newSession)
      Alert.alert("Éxito", "Sesión iniciada")
    } catch (error) {
      Alert.alert("Error", "Error al iniciar sesión")
    }
  }

  const handlePauseSession = async () => {
    if (!activeSession) return

    try {
      setActiveSession({ ...activeSession, status: "paused" })
      Alert.alert("Éxito", "Sesión pausada")
    } catch (error) {
      Alert.alert("Error", "Error al pausar sesión")
    }
  }

  const handleEndSession = async () => {
    if (!activeSession) return

    Alert.alert("Confirmar", "¿Finalizar la sesión actual?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Finalizar",
        onPress: async () => {
          try {
            setActiveSession(null)
            Alert.alert("Éxito", "Sesión finalizada")
          } catch (error) {
            Alert.alert("Error", "Error al finalizar sesión")
          }
        },
      },
    ])
  }

  const getWeekDays = () => {
    const days = []
    const startOfWeek = new Date(selectedDate)
    startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay())

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      days.push(day)
    }
    return days
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getTypeLabel = (type: string) => {
    const types = {
      preventive_maintenance: "Mantenimiento",
      piping: "Tubería",
      installation: "Instalación",
      measurement: "Medición",
      immediate_service: "Servicio Inmediato",
    }
    return types[type as keyof typeof types] || type
  }

  const weekDays = getWeekDays()

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-6 space-y-6">
        {/* Active Session Card */}
        {profile?.role === "technician" && activeSession && (
          <Card className="border-primary-200 bg-primary-50">
            <CardHeader>
              <View className="flex-row justify-between items-center">
                <Text className="text-lg font-semibold text-primary-900">Sesión Activa</Text>
                <Badge variant="success" text="En Progreso" />
              </View>
            </CardHeader>
            <CardContent>
              <Text className="font-medium text-primary-900 mb-2">Orden: Mantenimiento Preventivo #1</Text>
              <Text className="text-primary-700 mb-4">
                Iniciada: {formatTime(activeSession.start_time)} • Duración:{" "}
                {SessionService.formatDuration(
                  SessionService.calculateDuration(activeSession.start_time, activeSession.end_time),
                )}
              </Text>
              <View className="flex-row space-x-3">
                <Button title="Pausar" variant="outline" onPress={handlePauseSession} className="flex-1 bg-white" />
                <Button title="Finalizar" onPress={handleEndSession} className="flex-1" />
              </View>
            </CardContent>
          </Card>
        )}

        {/* Calendar Header */}
        <Card>
          <CardHeader>
            <View className="flex-row justify-between items-center">
              <Text className="text-xl font-bold text-gray-900">
                {selectedDate.toLocaleDateString("es-ES", { month: "long", year: "numeric" })}
              </Text>
              <TouchableOpacity
                onPress={() => setSelectedDate(new Date())}
                className="bg-primary-500 rounded-lg px-3 py-1"
              >
                <Text className="text-white font-medium">Hoy</Text>
              </TouchableOpacity>
            </View>
          </CardHeader>

          {/* Week View */}
          <CardContent>
            <View className="flex-row justify-between">
              {weekDays.map((day, index) => {
                const isSelected = day.toDateString() === selectedDate.toDateString()
                const isToday = day.toDateString() === new Date().toDateString()

                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => setSelectedDate(day)}
                    className={`items-center p-3 rounded-xl ${
                      isSelected ? "bg-primary-500" : isToday ? "bg-primary-100" : "bg-transparent"
                    }`}
                  >
                    <Text
                      className={`text-xs font-medium mb-1 ${
                        isSelected ? "text-white" : isToday ? "text-primary-600" : "text-gray-600"
                      }`}
                    >
                      {day.toLocaleDateString("es-ES", { weekday: "short" }).toUpperCase()}
                    </Text>
                    <Text
                      className={`text-lg font-bold ${
                        isSelected ? "text-white" : isToday ? "text-primary-600" : "text-gray-900"
                      }`}
                    >
                      {day.getDate()}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </View>
          </CardContent>
        </Card>

        {/* Scheduled Orders */}
        <Card>
          <CardHeader>
            <Text className="text-lg font-semibold text-gray-900">
              Órdenes Programadas - {selectedDate.toLocaleDateString("es-ES", { weekday: "long", day: "numeric" })}
            </Text>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Text className="text-gray-600 text-center py-4">Cargando...</Text>
            ) : scheduledOrders.length > 0 ? (
              <View className="space-y-3">
                {scheduledOrders.map((order) => (
                  <TouchableOpacity
                    key={order.id}
                    onPress={() => router.push(`/orders/${order.id}`)}
                    className="bg-gray-50 rounded-xl p-4"
                  >
                    <View className="flex-row justify-between items-start mb-2">
                      <View className="flex-1">
                        <Text className="font-semibold text-gray-900">{order.title}</Text>
                        <Text className="text-sm text-gray-600">{getTypeLabel(order.type)}</Text>
                      </View>
                      <Text className="text-sm font-medium text-primary-600">{formatTime(order.scheduled_date)}</Text>
                    </View>

                    <View className="flex-row justify-between items-center">
                      <View>
                        {profile?.role !== "client" && (
                          <Text className="text-sm text-gray-600">Cliente: Empresa ABC</Text>
                        )}
                        {profile?.role !== "technician" && order.technician_id && (
                          <Text className="text-sm text-gray-600">Técnico: Juan Pérez</Text>
                        )}
                      </View>

                      {profile?.role === "technician" && order.technician_id === profile.id && !activeSession && (
                        <Button title="Iniciar" onPress={() => handleStartSession(order.id)} className="px-4 py-1" />
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View className="items-center py-8">
                <Ionicons name="calendar-outline" size={48} color="#9ca3af" />
                <Text className="text-lg font-semibold text-gray-900 mt-4 mb-2">Sin órdenes programadas</Text>
                <Text className="text-gray-600 text-center">No hay órdenes programadas para este día</Text>
              </View>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        {profile?.role === "technician" && (
          <Card>
            <CardHeader>
              <Text className="text-lg font-semibold text-gray-900">Acciones Rápidas</Text>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                title="Ver Mis Sesiones"
                variant="outline"
                onPress={() => router.push("/sessions")}
                className="w-full bg-transparent"
              />
              <Button
                title="Reportar Tiempo"
                variant="outline"
                onPress={() => router.push("/sessions/report")}
                className="w-full bg-transparent"
              />
            </CardContent>
          </Card>
        )}
      </View>
    </ScrollView>
  )
}
