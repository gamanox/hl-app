"use client"

import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native"
import { useState, useEffect } from "react"
import { router } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { Badge } from "../../components/ui/Badge"
import { Button } from "../../components/ui/Button"
import { Select } from "../../components/ui/Select"
import { useAuth } from "../../lib/auth"
import { mockWorkSessions } from "../../lib/mock-data"
import { SessionService } from "../../lib/sessions"

export default function SessionsScreen() {
  const { profile } = useAuth()
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    loadSessions()
  }, [profile])

  const loadSessions = async () => {
    if (!profile || profile.role !== "technician") return

    setLoading(true)
    try {
      // For now, use mock data
      const technicianSessions = mockWorkSessions.filter((session) => session.technician_id === profile.id)
      setSessions(technicianSessions)
    } catch (error) {
      Alert.alert("Error", "Error al cargar las sesiones")
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="success" text="Activa" />
      case "paused":
        return <Badge variant="warning" text="Pausada" />
      case "completed":
        return <Badge variant="info" text="Completada" />
      default:
        return <Badge variant="default" text={status} />
    }
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const filteredSessions = sessions.filter((session) => {
    if (filter === "all") return true
    return session.status === filter
  })

  if (profile?.role !== "technician") {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-lg text-gray-900">Acceso solo para técnicos</Text>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white p-6 border-b border-gray-100">
        <View className="flex-row justify-between items-center mb-4">
          <View>
            <Text className="text-2xl font-bold text-gray-900">Mis Sesiones</Text>
            <Text className="text-gray-600">{filteredSessions.length} sesiones encontradas</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/sessions/create")}
            className="bg-primary-500 rounded-xl px-4 py-2 flex-row items-center"
          >
            <Ionicons name="add" size={20} color="white" />
            <Text className="text-white font-semibold ml-1">Nueva</Text>
          </TouchableOpacity>
        </View>

        {/* Filter */}
        <Select
          value={filter}
          onValueChange={setFilter}
          options={[
            { label: "Todas", value: "all" },
            { label: "Activas", value: "active" },
            { label: "Pausadas", value: "paused" },
            { label: "Completadas", value: "completed" },
          ]}
        />
      </View>

      {/* Sessions List */}
      <ScrollView className="flex-1 p-6">
        <View className="space-y-4">
          {loading ? (
            <Text className="text-center text-gray-600 py-8">Cargando sesiones...</Text>
          ) : filteredSessions.length > 0 ? (
            filteredSessions.map((session) => (
              <TouchableOpacity
                key={session.id}
                onPress={() => router.push(`/sessions/${session.id}`)}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
              >
                <View className="flex-row justify-between items-start mb-3">
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-gray-900 mb-1">Orden: Mantenimiento Preventivo #1</Text>
                    <Text className="text-sm text-gray-600">Cliente: Empresa ABC</Text>
                  </View>
                  {getStatusBadge(session.status)}
                </View>

                <View className="space-y-2">
                  <View className="flex-row justify-between">
                    <Text className="text-sm text-gray-600">Inicio:</Text>
                    <Text className="text-sm font-medium text-gray-900">{formatDateTime(session.start_time)}</Text>
                  </View>
                  {session.end_time && (
                    <View className="flex-row justify-between">
                      <Text className="text-sm text-gray-600">Fin:</Text>
                      <Text className="text-sm font-medium text-gray-900">{formatDateTime(session.end_time)}</Text>
                    </View>
                  )}
                  <View className="flex-row justify-between">
                    <Text className="text-sm text-gray-600">Duración:</Text>
                    <Text className="text-sm font-medium text-primary-600">
                      {SessionService.formatDuration(
                        SessionService.calculateDuration(session.start_time, session.end_time),
                      )}
                    </Text>
                  </View>
                </View>

                {session.notes && (
                  <View className="mt-3 pt-3 border-t border-gray-100">
                    <Text className="text-sm text-gray-700">{session.notes}</Text>
                  </View>
                )}

                <View className="flex-row justify-end mt-3">
                  <Ionicons name="chevron-forward" size={20} color="#6b7280" />
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View className="bg-white rounded-2xl p-8 items-center">
              <Ionicons name="time-outline" size={48} color="#9ca3af" />
              <Text className="text-lg font-semibold text-gray-900 mt-4 mb-2">No hay sesiones</Text>
              <Text className="text-gray-600 text-center mb-4">
                {filter === "all" ? "No has registrado sesiones aún" : `No hay sesiones con estado "${filter}"`}
              </Text>
              <Button title="Crear Primera Sesión" onPress={() => router.push("/sessions/create")} />
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  )
}
