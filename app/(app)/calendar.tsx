"use client"

import { useState, useEffect } from "react"
import { View, Text, ScrollView } from "react-native"
import { Agenda } from "react-native-calendars"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { Select } from "@/components/ui/Select"
import { Sheet } from "@/components/ui/Sheet"
import { useAuth } from "@/lib/auth"
import { sessionService } from "@/lib/sessions"
import { workOrderService } from "@/lib/work-orders"
import type { Sesion, User } from "@/lib/zod-schemas"

interface AgendaItem {
  id: string
  workOrderId: string
  title: string
  technician: string
  duration: number
  priority: "low" | "normal" | "high"
  status: string
  time: string
  height?: number
}

interface AgendaItems {
  [date: string]: AgendaItem[]
}

export default function CalendarScreen() {
  const { user } = useAuth()
  const [items, setItems] = useState<AgendaItems>({})
  const [selectedItem, setSelectedItem] = useState<AgendaItem | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [filters, setFilters] = useState({
    technician: "all",
    orderType: "all",
    status: "all",
  })
  const [technicians, setTechnicians] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCalendarData()
    loadTechnicians()
  }, [filters])

  const loadCalendarData = async () => {
    try {
      setLoading(true)
      // Mock data - replace with actual API calls
      const sessions = await sessionService.listSessions()
      const workOrders = await workOrderService.listWorkOrders(filters)

      const agendaItems: AgendaItems = {}

      // Convert sessions to agenda items
      sessions.forEach((session: Sesion) => {
        const date = new Date(session.startedAt).toISOString().split("T")[0]
        const workOrder = workOrders.find((wo) => wo.id === session.workOrderId)

        if (!agendaItems[date]) {
          agendaItems[date] = []
        }

        agendaItems[date].push({
          id: session.id,
          workOrderId: session.workOrderId || "",
          title: workOrder?.tipo || "Maintenance",
          technician: workOrder?.asignados?.[0]?.nombre || "Unassigned",
          duration: 2, // Default 2 hours
          priority: workOrder?.prioridad || "normal",
          status: workOrder?.estado || "pending",
          time: new Date(session.startedAt).toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        })
      })

      setItems(agendaItems)
    } catch (error) {
      console.error("Error loading calendar data:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadTechnicians = async () => {
    try {
      // Mock data - replace with actual API call
      const techList = [
        { id: "1", nombre: "Juan Pérez", rol: "technician" },
        { id: "2", nombre: "María García", rol: "technician" },
        { id: "3", nombre: "Carlos López", rol: "technician" },
      ]
      setTechnicians(techList as User[])
    } catch (error) {
      console.error("Error loading technicians:", error)
    }
  }

  const handleCreateSession = () => {
    setSelectedItem(null)
    setIsSheetOpen(true)
  }

  const handleEditSession = (item: AgendaItem) => {
    setSelectedItem(item)
    setIsSheetOpen(true)
  }

  const handleSaveSession = async (sessionData: any) => {
    try {
      if (selectedItem) {
        // Update existing session
        await sessionService.updateSession(selectedItem.id, sessionData)
      } else {
        // Create new session
        await sessionService.createSession(sessionData)
      }
      setIsSheetOpen(false)
      loadCalendarData()
    } catch (error) {
      console.error("Error saving session:", error)
    }
  }

  const renderItem = (item: AgendaItem) => {
    const priorityColors = {
      low: "bg-green-100 text-green-800",
      normal: "bg-blue-100 text-blue-800",
      high: "bg-red-100 text-red-800",
    }

    return (
      <Card className="mb-2 p-4">
        <View className="flex-row justify-between items-start">
          <View className="flex-1">
            <Text className="font-semibold text-lg">{item.title}</Text>
            <Text className="text-gray-600 mt-1">
              {item.technician} • {item.time}
            </Text>
            <Text className="text-gray-500 text-sm mt-1">Duración: {item.duration}h</Text>
          </View>
          <View className="items-end">
            <Badge className={priorityColors[item.priority]}>{item.priority.toUpperCase()}</Badge>
            <Badge className="mt-1 bg-gray-100 text-gray-800">{item.status}</Badge>
          </View>
        </View>

        <View className="flex-row justify-end mt-3 space-x-2">
          <Button variant="outline" size="sm" onPress={() => handleEditSession(item)}>
            Editar
          </Button>
          <Button
            size="sm"
            onPress={() => {
              /* Navigate to work order detail */
            }}
          >
            Ver Orden
          </Button>
        </View>
      </Card>
    )
  }

  const renderEmptyDate = () => {
    return (
      <View className="flex-1 justify-center items-center p-8">
        <Text className="text-gray-500 text-center">No hay sesiones programadas para este día</Text>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-white">
      {/* Filters */}
      <View className="p-4 border-b border-gray-200">
        <Text className="text-lg font-semibold mb-3">Filtros</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row space-x-3">
            <Select
              value={filters.technician}
              onValueChange={(value) => setFilters((prev) => ({ ...prev, technician: value }))}
              placeholder="Técnico"
            >
              <Select.Item label="Todos" value="all" />
              {technicians.map((tech) => (
                <Select.Item key={tech.id} label={tech.nombre} value={tech.id} />
              ))}
            </Select>

            <Select
              value={filters.orderType}
              onValueChange={(value) => setFilters((prev) => ({ ...prev, orderType: value }))}
              placeholder="Tipo"
            >
              <Select.Item label="Todos" value="all" />
              <Select.Item label="Mantenimiento Preventivo" value="preventive_maintenance" />
              <Select.Item label="Tubería" value="piping" />
              <Select.Item label="Instalación" value="installation" />
            </Select>

            <Select
              value={filters.status}
              onValueChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
              placeholder="Estado"
            >
              <Select.Item label="Todos" value="all" />
              <Select.Item label="Pendiente" value="pending" />
              <Select.Item label="En Progreso" value="in_progress" />
              <Select.Item label="Completado" value="done" />
            </Select>
          </View>
        </ScrollView>
      </View>

      {/* Calendar */}
      <Agenda
        items={items}
        loadItemsForMonth={loadCalendarData}
        selected={new Date().toISOString().split("T")[0]}
        renderItem={renderItem}
        renderEmptyDate={renderEmptyDate}
        rowHasChanged={(r1, r2) => r1.id !== r2.id}
        showClosingKnob={true}
        refreshControl={null}
        refreshing={loading}
        theme={{
          agendaDayTextColor: "#1f2937",
          agendaDayNumColor: "#1f2937",
          agendaTodayColor: "#3b82f6",
          agendaKnobColor: "#3b82f6",
          selectedDayBackgroundColor: "#3b82f6",
          todayTextColor: "#3b82f6",
          dayTextColor: "#1f2937",
          textDisabledColor: "#9ca3af",
          dotColor: "#3b82f6",
          selectedDotColor: "#ffffff",
          arrowColor: "#3b82f6",
          monthTextColor: "#1f2937",
          indicatorColor: "#3b82f6",
          textDayFontWeight: "500",
          textMonthFontWeight: "600",
          textDayHeaderFontWeight: "600",
          textDayFontSize: 16,
          textMonthFontSize: 18,
          textDayHeaderFontSize: 14,
        }}
      />

      {/* Floating Action Button */}
      {user?.rol === "admin" && (
        <View className="absolute bottom-6 right-6">
          <Button onPress={handleCreateSession} className="w-14 h-14 rounded-full bg-blue-600">
            <Text className="text-white text-2xl">+</Text>
          </Button>
        </View>
      )}

      {/* Session Form Sheet */}
      <Sheet isOpen={isSheetOpen} onClose={() => setIsSheetOpen(false)}>
        <SessionForm
          session={selectedItem}
          technicians={technicians}
          onSave={handleSaveSession}
          onCancel={() => setIsSheetOpen(false)}
        />
      </Sheet>
    </View>
  )
}

// Session Form Component
function SessionForm({
  session,
  technicians,
  onSave,
  onCancel,
}: {
  session: AgendaItem | null
  technicians: User[]
  onSave: (data: any) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    technician: session?.technician || "",
    duration: session?.duration || 2,
    priority: session?.priority || "normal",
    date: new Date().toISOString().split("T")[0],
    time: session?.time || "09:00",
  })

  const handleSave = () => {
    onSave(formData)
  }

  return (
    <View className="p-6">
      <Text className="text-xl font-semibold mb-4">{session ? "Editar Sesión" : "Nueva Sesión"}</Text>

      <View className="space-y-4">
        <View>
          <Text className="text-sm font-medium mb-2">Técnico</Text>
          <Select
            value={formData.technician}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, technician: value }))}
            placeholder="Seleccionar técnico"
          >
            {technicians.map((tech) => (
              <Select.Item key={tech.id} label={tech.nombre} value={tech.nombre} />
            ))}
          </Select>
        </View>

        <View>
          <Text className="text-sm font-medium mb-2">Duración (horas)</Text>
          <Select
            value={formData.duration.toString()}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, duration: Number.parseInt(value) }))}
            placeholder="Duración"
          >
            <Select.Item label="1 hora" value="1" />
            <Select.Item label="2 horas" value="2" />
            <Select.Item label="4 horas" value="4" />
            <Select.Item label="8 horas" value="8" />
          </Select>
        </View>

        <View>
          <Text className="text-sm font-medium mb-2">Prioridad</Text>
          <Select
            value={formData.priority}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, priority: value as any }))}
            placeholder="Prioridad"
          >
            <Select.Item label="Baja" value="low" />
            <Select.Item label="Normal" value="normal" />
            <Select.Item label="Alta" value="high" />
          </Select>
        </View>
      </View>

      <View className="flex-row justify-end space-x-3 mt-6">
        <Button variant="outline" onPress={onCancel}>
          Cancelar
        </Button>
        <Button onPress={handleSave}>{session ? "Actualizar" : "Crear"}</Button>
      </View>
    </View>
  )
}
