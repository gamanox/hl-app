"use client"

import { useState, useEffect, useMemo } from "react"
import { View, Text, TextInput, ScrollView, Platform } from "react-native"
import { FlashList } from "@shopify/flash-list"
import { useRouter } from "expo-router"
import { format } from "date-fns"
import { es } from "date-fns/locale"

import { Button } from "../../components/ui/Button"
import { Badge } from "../../components/ui/Badge"
import { Select } from "../../components/ui/Select"
import { Card } from "../../components/ui/Card"
import { useAuth } from "../../lib/auth"
import { workOrderService } from "../../lib/work-orders"
import { supabaseService } from "../../lib/supabase"
import type { WorkOrder, User } from "../../lib/zod-schemas"

const WORK_ORDER_TYPES = [
  { label: "Todos los tipos", value: "" },
  { label: "Mantenimiento Preventivo", value: "preventive_maintenance" },
  { label: "Tubería", value: "piping" },
  { label: "Instalación", value: "installation" },
  { label: "Reparación", value: "repair" },
  { label: "Inspección", value: "inspection" },
]

const WORK_ORDER_STATUSES = [
  { label: "Todos los estados", value: "" },
  { label: "Pendiente", value: "pending" },
  { label: "En Progreso", value: "in_progress" },
  { label: "Completado", value: "done" },
  { label: "Archivado", value: "archived" },
]

const PRIORITIES = [
  { label: "Todas las prioridades", value: "" },
  { label: "Baja", value: "low" },
  { label: "Normal", value: "normal" },
  { label: "Alta", value: "high" },
]

export default function WorkOrdersIndex() {
  const router = useRouter()
  const { user } = useAuth()
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([])
  const [technicians, setTechnicians] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Filter states
  const [searchText, setSearchText] = useState("")
  const [typeFilter, setTypeFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [priorityFilter, setPriorityFilter] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  const loadData = async () => {
    try {
      const filters = {
        type: typeFilter || undefined,
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        search: searchText || undefined,
      }

      const [ordersData, techData] = await Promise.all([
        supabaseService.listWorkOrders(filters),
        supabaseService.listTechnicians(),
      ])

      setWorkOrders(ordersData)
      setTechnicians(techData)
    } catch (error) {
      console.error("Error loading work orders:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [typeFilter, statusFilter, priorityFilter, dateFrom, dateTo])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchText !== "") {
        loadData()
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchText])

  const filteredWorkOrders = useMemo(() => {
    return workOrders.filter((order) => {
      if (
        searchText &&
        !order.id.toLowerCase().includes(searchText.toLowerCase()) &&
        !order.cliente?.nombre?.toLowerCase().includes(searchText.toLowerCase())
      ) {
        return false
      }
      return true
    })
  }, [workOrders, searchText])

  const handleAssignTechnician = async (orderId: string, technicianId: string) => {
    try {
      await workOrderService.assignTechnician(orderId, technicianId)
      loadData() // Refresh data
    } catch (error) {
      console.error("Error assigning technician:", error)
    }
  }

  const handleStatusChange = async (orderId: string, newStatus: WorkOrder["estado"]) => {
    try {
      await workOrderService.updateStatus(orderId, newStatus)
      loadData() // Refresh data
    } catch (error) {
      console.error("Error updating status:", error)
    }
  }

  const handleExport = () => {
    if (Platform.OS === "web") {
      const csvData = filteredWorkOrders.map((order) => ({
        ID: order.id,
        Tipo: order.tipo,
        Estado: order.estado,
        Prioridad: order.prioridad,
        "Fecha Estimada": order.fecha_estimada ? format(new Date(order.fecha_estimada), "dd/MM/yyyy") : "",
        Cliente: order.cliente?.nombre || "",
        Técnico: order.asignados?.[0]?.nombre || "",
      }))

      const csv = [Object.keys(csvData[0]).join(","), ...csvData.map((row) => Object.values(row).join(","))].join("\n")

      const blob = new Blob([csv], { type: "text/csv" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `ordenes-trabajo-${format(new Date(), "yyyy-MM-dd")}.csv`
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "normal":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-gray-100 text-gray-800"
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      case "done":
        return "bg-green-100 text-green-800"
      case "archived":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const renderWorkOrderItem = ({ item }: { item: WorkOrder }) => (
    <Card className="mb-3 p-4">
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <Text className="font-semibold text-lg text-gray-900">{item.id}</Text>
          <Text className="text-sm text-gray-600 capitalize">{item.tipo.replace("_", " ")}</Text>
        </View>
        <View className="flex-row gap-2">
          <Badge className={getPriorityColor(item.prioridad)}>{item.prioridad}</Badge>
          <Badge className={getStatusColor(item.estado)}>{item.estado}</Badge>
        </View>
      </View>

      <View className="mb-3">
        <Text className="text-sm text-gray-600">
          Cliente: <Text className="font-medium">{item.cliente?.nombre || "No asignado"}</Text>
        </Text>
        <Text className="text-sm text-gray-600">
          Técnico: <Text className="font-medium">{item.asignados?.[0]?.nombre || "No asignado"}</Text>
        </Text>
        {item.fecha_estimada && (
          <Text className="text-sm text-gray-600">
            Fecha estimada:{" "}
            <Text className="font-medium">{format(new Date(item.fecha_estimada), "dd/MM/yyyy", { locale: es })}</Text>
          </Text>
        )}
      </View>

      <View className="flex-row gap-2 flex-wrap">
        {user?.rol === "admin" && (
          <>
            <Select
              placeholder="Asignar técnico"
              value=""
              onValueChange={(techId) => handleAssignTechnician(item.id, techId)}
              className="flex-1 min-w-32"
            >
              {technicians.map((tech) => (
                <Select.Item key={tech.id} label={tech.nombre} value={tech.id} />
              ))}
            </Select>

            <Select
              placeholder="Cambiar estado"
              value=""
              onValueChange={(status) => handleStatusChange(item.id, status as WorkOrder["estado"])}
              className="flex-1 min-w-32"
            >
              <Select.Item label="Pendiente" value="pending" />
              <Select.Item label="En Progreso" value="in_progress" />
              <Select.Item label="Completado" value="done" />
              <Select.Item label="Archivado" value="archived" />
            </Select>
          </>
        )}

        <Button
          variant="outline"
          size="sm"
          onPress={() => router.push(`/work-orders/${item.id}`)}
          className="flex-1 min-w-24"
        >
          Ver Detalle
        </Button>
      </View>
    </Card>
  )

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-gray-600">Cargando órdenes de trabajo...</Text>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-gray-50">
      <Card className="m-4 p-4">
        <Text className="text-lg font-semibold mb-4 text-gray-900">Filtros</Text>

        <TextInput
          placeholder="Buscar por ID o cliente..."
          value={searchText}
          onChangeText={setSearchText}
          className="border border-gray-300 rounded-lg px-3 py-2 mb-3 bg-white"
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
          <View className="flex-row gap-3">
            <Select placeholder="Tipo" value={typeFilter} onValueChange={setTypeFilter} className="w-48">
              {WORK_ORDER_TYPES.map((type) => (
                <Select.Item key={type.value} label={type.label} value={type.value} />
              ))}
            </Select>

            <Select placeholder="Estado" value={statusFilter} onValueChange={setStatusFilter} className="w-48">
              {WORK_ORDER_STATUSES.map((status) => (
                <Select.Item key={status.value} label={status.label} value={status.value} />
              ))}
            </Select>

            <Select placeholder="Prioridad" value={priorityFilter} onValueChange={setPriorityFilter} className="w-48">
              {PRIORITIES.map((priority) => (
                <Select.Item key={priority.value} label={priority.label} value={priority.value} />
              ))}
            </Select>
          </View>
        </ScrollView>

        <View className="flex-row gap-3 mb-3">
          <TextInput
            placeholder="Fecha desde (YYYY-MM-DD)"
            value={dateFrom}
            onChangeText={setDateFrom}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 bg-white"
          />
          <TextInput
            placeholder="Fecha hasta (YYYY-MM-DD)"
            value={dateTo}
            onChangeText={setDateTo}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 bg-white"
          />
        </View>

        <View className="flex-row gap-3">
          <Button
            variant="outline"
            onPress={() => {
              setSearchText("")
              setTypeFilter("")
              setStatusFilter("")
              setPriorityFilter("")
              setDateFrom("")
              setDateTo("")
            }}
            className="flex-1"
          >
            Limpiar Filtros
          </Button>

          {Platform.OS === "web" && (
            <Button variant="outline" onPress={handleExport} className="flex-1 bg-transparent">
              Exportar CSV
            </Button>
          )}
        </View>
      </Card>

      <View className="flex-1 px-4">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-lg font-semibold text-gray-900">Órdenes de Trabajo ({filteredWorkOrders.length})</Text>
          <Button size="sm" onPress={() => router.push("/work-orders/create")}>
            Nueva Orden
          </Button>
        </View>

        <FlashList
          data={filteredWorkOrders}
          renderItem={renderWorkOrderItem}
          keyExtractor={(item) => item.id}
          estimatedItemSize={200}
          onRefresh={loadData}
          refreshing={refreshing}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center py-12">
              <Text className="text-gray-500 text-center">No se encontraron órdenes de trabajo</Text>
            </View>
          }
        />
      </View>
    </View>
  )
}
