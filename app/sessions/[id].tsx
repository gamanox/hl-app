"use client"

import { View, Text, ScrollView, Alert, TouchableOpacity } from "react-native"
import { useState, useEffect } from "react"
import { useLocalSearchParams, router } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { Card, CardContent, CardHeader } from "../../components/ui/Card"
import { Badge } from "../../components/ui/Badge"
import { Button } from "../../components/ui/Button"
import { Input } from "../../components/ui/Input"
import { useAuth } from "../../lib/auth"
import { mockWorkSessions } from "../../lib/mock-data"
import { SessionService } from "../../lib/sessions"

export default function SessionDetailScreen() {
  const { id } = useLocalSearchParams()
  const { profile } = useAuth()
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [notes, setNotes] = useState("")
  const [editingNotes, setEditingNotes] = useState(false)

  useEffect(() => {
    loadSession()
  }, [id])

  const loadSession = async () => {
    setLoading(true)
    try {
      // For now, use mock data
      const foundSession = mockWorkSessions.find((s) => s.id === id)
      setSession(foundSession)
      setNotes(foundSession?.notes || "")
    } catch (error) {
      Alert.alert("Error", "Error al cargar la sesión")
    } finally {
      setLoading(false)
    }
  }

  const handlePauseResume = async () => {
    if (!session) return

    const action = session.status === "active" ? "pausar" : "reanudar"
    const newStatus = session.status === "active" ? "paused" : "active"

    Alert.alert("Confirmar", `¿${action.charAt(0).toUpperCase() + action.slice(1)} la sesión?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Confirmar",
        onPress: async () => {
          try {
            setSession({ ...session, status: newStatus })
            Alert.alert("Éxito", `Sesión ${action === "pausar" ? "pausada" : "reanudada"}`)
          } catch (error) {
            Alert.alert("Error", `Error al ${action} la sesión`)
          }
        },
      },
    ])
  }

  const handleEndSession = async () => {
    if (!session) return

    Alert.alert("Confirmar", "¿Finalizar la sesión? Esta acción no se puede deshacer.", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Finalizar",
        style: "destructive",
        onPress: async () => {
          try {
            setSession({
              ...session,
              status: "completed",
              end_time: new Date().toISOString(),
            })
            Alert.alert("Éxito", "Sesión finalizada")
          } catch (error) {
            Alert.alert("Error", "Error al finalizar la sesión")
          }
        },
      },
    ])
  }

  const handleSaveNotes = async () => {
    try {
      setSession({ ...session, notes })
      setEditingNotes(false)
      Alert.alert("Éxito", "Notas guardadas")
    } catch (error) {
      Alert.alert("Error", "Error al guardar las notas")
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

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-lg text-gray-600">Cargando sesión...</Text>
      </View>
    )
  }

  if (!session) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-lg text-gray-900">Sesión no encontrada</Text>
        <Button title="Volver" onPress={() => router.back()} className="mt-4" />
      </View>
    )
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-6 space-y-6">
        {/* Session Header */}
        <Card>
          <CardHeader>
            <View className="flex-row justify-between items-start">
              <View className="flex-1">
                <Text className="text-xl font-bold text-gray-900 mb-2">Sesión de Trabajo</Text>
                <Text className="text-gray-600">Orden: Mantenimiento Preventivo #1</Text>
              </View>
              {getStatusBadge(session.status)}
            </View>
          </CardHeader>

          <CardContent>
            <View className="space-y-3">
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Inicio:</Text>
                <Text className="font-medium text-gray-900">{formatDateTime(session.start_time)}</Text>
              </View>
              {session.end_time && (
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Fin:</Text>
                  <Text className="font-medium text-gray-900">{formatDateTime(session.end_time)}</Text>
                </View>
              )}
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Duración:</Text>
                <Text className="font-medium text-primary-600">
                  {SessionService.formatDuration(
                    SessionService.calculateDuration(session.start_time, session.end_time),
                  )}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Cliente:</Text>
                <Text className="font-medium text-gray-900">Empresa ABC</Text>
              </View>
            </View>
          </CardContent>
        </Card>

        {/* Session Controls */}
        {session.status !== "completed" && (
          <Card>
            <CardHeader>
              <Text className="text-lg font-semibold text-gray-900">Controles de Sesión</Text>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                title={session.status === "active" ? "Pausar Sesión" : "Reanudar Sesión"}
                variant={session.status === "active" ? "outline" : "solid"}
                onPress={handlePauseResume}
                className={session.status === "active" ? "w-full bg-transparent" : "w-full"}
              />
              <Button
                title="Finalizar Sesión"
                variant="outline"
                onPress={handleEndSession}
                className="w-full bg-transparent border-error-500"
              />
            </CardContent>
          </Card>
        )}

        {/* Notes Section */}
        <Card>
          <CardHeader>
            <View className="flex-row justify-between items-center">
              <Text className="text-lg font-semibold text-gray-900">Notas</Text>
              {!editingNotes && (
                <TouchableOpacity onPress={() => setEditingNotes(true)} className="bg-gray-100 rounded-lg p-2">
                  <Ionicons name="pencil" size={16} color="#374151" />
                </TouchableOpacity>
              )}
            </View>
          </CardHeader>
          <CardContent>
            {editingNotes ? (
              <View className="space-y-3">
                <Input
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Agregar notas sobre el trabajo realizado..."
                  multiline
                  numberOfLines={4}
                />
                <View className="flex-row space-x-3">
                  <Button
                    title="Cancelar"
                    variant="outline"
                    onPress={() => {
                      setNotes(session.notes || "")
                      setEditingNotes(false)
                    }}
                    className="flex-1 bg-transparent"
                  />
                  <Button title="Guardar" onPress={handleSaveNotes} className="flex-1" />
                </View>
              </View>
            ) : (
              <Text className="text-gray-700 leading-6">
                {session.notes || "No hay notas para esta sesión. Toca el ícono de editar para agregar notas."}
              </Text>
            )}
          </CardContent>
        </Card>
      </View>
    </ScrollView>
  )
}
