"use client"

import { useState, useEffect } from "react"
import { View, ScrollView, Alert } from "react-native"
import { Text, Button, VStack, HStack, Badge, Box, Progress } from "@gluestack-ui/themed"
import { useAuth } from "../../lib/auth"
import { router } from "expo-router"
import { workOrderService } from "../../lib/work-orders"
import { sessionService } from "../../lib/sessions"
import { quickBooksService } from "../../lib/quickbooks"

interface DashboardStats {
  workOrders: { total: number; pending: number; inProgress: number; completed: number }
  sessions: { active: number; todayHours: number; weekHours: number }
  revenue: { thisMonth: number; lastMonth: number; growth: number }
  quickbooks: { connected: boolean; lastSync: Date | null }
}

export default function DashboardScreen() {
  const { user, signOut } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [user])

  const loadDashboardData = async () => {
    try {
      // Load stats based on user role
      const workOrders = await workOrderService.getWorkOrders()
      const sessions = await sessionService.getSessions()

      // Calculate stats
      const workOrderStats = {
        total: workOrders.length,
        pending: workOrders.filter((wo) => wo.status === "pending").length,
        inProgress: workOrders.filter((wo) => wo.status === "in_progress").length,
        completed: workOrders.filter((wo) => wo.status === "completed").length,
      }

      const sessionStats = {
        active: sessions.filter((s) => s.status === "active").length,
        todayHours: 8.5, // Mock data
        weekHours: 42.3, // Mock data
      }

      const revenueStats = {
        thisMonth: 15420,
        lastMonth: 12350,
        growth: 24.8,
      }

      setStats({
        workOrders: workOrderStats,
        sessions: sessionStats,
        revenue: revenueStats,
        quickbooks: {
          connected: quickBooksService.isConnected(),
          lastSync: new Date(),
        },
      })

      // Load recent activity
      setRecentActivity(workOrders.slice(0, 5))
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleQuickAction = (action: string) => {
    switch (action) {
      case "create_order":
        router.push("/orders/create")
        break
      case "start_session":
        router.push("/sessions/create")
        break
      case "request_service":
        router.push("/orders/create")
        break
      case "view_calendar":
        router.push("/calendar")
        break
      case "manage_users":
        router.push("/users")
        break
      case "quickbooks":
        router.push("/quickbooks")
        break
      default:
        Alert.alert("Próximamente", "Esta función estará disponible pronto")
    }
  }

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Cargando dashboard...</Text>
      </View>
    )
  }

  const getRoleBasedContent = () => {
    switch (user?.rol) {
      case "admin":
        return {
          title: "Panel de Administración",
          subtitle: "Gestión completa del sistema CNC",
          primaryColor: "blue",
          stats: [
            {
              label: "Órdenes Totales",
              value: stats?.workOrders.total.toString() || "0",
              subtext: `${stats?.workOrders.pending || 0} pendientes`,
              color: "text-blue-600",
              bgColor: "bg-blue-50",
            },
            {
              label: "Técnicos Activos",
              value: "8",
              subtext: "2 en campo",
              color: "text-green-600",
              bgColor: "bg-green-50",
            },
            {
              label: "Ingresos del Mes",
              value: `$${stats?.revenue.thisMonth.toLocaleString() || "0"}`,
              subtext: `+${stats?.revenue.growth || 0}% vs mes anterior`,
              color: "text-purple-600",
              bgColor: "bg-purple-50",
            },
          ],
          quickActions: [
            { title: "Crear Nueva Orden", action: "create_order", variant: "solid", color: "blue" },
            { title: "Gestionar Usuarios", action: "manage_users", variant: "outline", color: "gray" },
            { title: "QuickBooks", action: "quickbooks", variant: "outline", color: "green" },
            { title: "Ver Reportes", action: "reports", variant: "outline", color: "purple" },
          ],
        }

      case "technician":
        return {
          title: "Panel de Técnico",
          subtitle: "Tus asignaciones y progreso diario",
          primaryColor: "green",
          stats: [
            {
              label: "Órdenes Asignadas",
              value: "6",
              subtext: "2 urgentes",
              color: "text-green-600",
              bgColor: "bg-green-50",
            },
            {
              label: "Horas Hoy",
              value: stats?.sessions.todayHours.toString() || "0",
              subtext: "de 8 horas",
              color: "text-blue-600",
              bgColor: "bg-blue-50",
            },
            {
              label: "Sesiones Activas",
              value: stats?.sessions.active.toString() || "0",
              subtext: "en progreso",
              color: "text-orange-600",
              bgColor: "bg-orange-50",
            },
          ],
          quickActions: [
            { title: "Iniciar Sesión", action: "start_session", variant: "solid", color: "green" },
            { title: "Ver Calendario", action: "view_calendar", variant: "outline", color: "blue" },
            { title: "Mis Órdenes", action: "my_orders", variant: "outline", color: "gray" },
          ],
        }

      default: // client
        return {
          title: "Panel de Cliente",
          subtitle: "Estado de tus servicios CNC",
          primaryColor: "purple",
          stats: [
            {
              label: "Servicios Activos",
              value: "3",
              subtext: "1 en progreso",
              color: "text-purple-600",
              bgColor: "bg-purple-50",
            },
            {
              label: "Órdenes Pendientes",
              value: "1",
              subtext: "esperando asignación",
              color: "text-orange-600",
              bgColor: "bg-orange-50",
            },
            {
              label: "Servicios Completados",
              value: "12",
              subtext: "este año",
              color: "text-green-600",
              bgColor: "bg-green-50",
            },
          ],
          quickActions: [
            { title: "Solicitar Servicio", action: "request_service", variant: "solid", color: "purple" },
            { title: "Ver Historial", action: "view_history", variant: "outline", color: "gray" },
            { title: "Documentos", action: "documents", variant: "outline", color: "blue" },
          ],
        }
    }
  }

  const content = getRoleBasedContent()

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <VStack space="lg" className="p-4">
        {/* Header */}
        <VStack space="xs">
          <Text className="text-2xl font-bold text-gray-900">{content.title}</Text>
          <Text className="text-gray-600">{content.subtitle}</Text>
          <Text className="text-sm text-gray-500">Bienvenido, {user?.nombre}</Text>
        </VStack>

        {/* Stats Cards */}
        <HStack space="md">
          {content.stats.map((stat, index) => (
            <Box key={index} className={`flex-1 p-4 ${stat.bgColor} rounded-lg border border-gray-200`}>
              <VStack space="xs">
                <Text className={`text-2xl font-bold ${stat.color}`}>{stat.value}</Text>
                <Text className="text-sm font-medium text-gray-900">{stat.label}</Text>
                <Text className="text-xs text-gray-600">{stat.subtext}</Text>
              </VStack>
            </Box>
          ))}
        </HStack>

        {/* Progress Indicators (for technicians) */}
        {user?.rol === "technician" && (
          <Box className="p-4 bg-white rounded-lg border border-gray-200">
            <VStack space="md">
              <Text className="text-lg font-semibold">Progreso del Día</Text>
              <VStack space="sm">
                <HStack space="md" className="justify-between items-center">
                  <Text className="text-sm">Horas trabajadas</Text>
                  <Text className="text-sm font-medium">{stats?.sessions.todayHours || 0}/8 hrs</Text>
                </HStack>
                <Progress value={((stats?.sessions.todayHours || 0) / 8) * 100} className="w-full">
                  <Progress.FilledTrack />
                </Progress>
              </VStack>
            </VStack>
          </Box>
        )}

        {/* QuickBooks Status (for admins) */}
        {user?.rol === "admin" && (
          <Box className="p-4 bg-white rounded-lg border border-gray-200">
            <HStack space="md" className="justify-between items-center">
              <VStack space="xs">
                <Text className="text-lg font-semibold">QuickBooks</Text>
                <Text className="text-sm text-gray-600">
                  {stats?.quickbooks.connected ? "Conectado y sincronizado" : "No conectado"}
                </Text>
              </VStack>
              <Badge
                variant={stats?.quickbooks.connected ? "solid" : "outline"}
                action={stats?.quickbooks.connected ? "success" : "muted"}
              >
                <Text className="text-xs">{stats?.quickbooks.connected ? "Activo" : "Inactivo"}</Text>
              </Badge>
            </HStack>
          </Box>
        )}

        {/* Recent Activity */}
        <Box className="p-4 bg-white rounded-lg border border-gray-200">
          <VStack space="md">
            <Text className="text-lg font-semibold">Actividad Reciente</Text>
            <VStack space="sm">
              {recentActivity.slice(0, 4).map((activity, index) => (
                <HStack key={index} space="md" className="justify-between items-center py-2">
                  <VStack space="xs" className="flex-1">
                    <Text className="font-medium text-gray-900">{activity.title || `Orden #${index + 1}`}</Text>
                    <Text className="text-sm text-gray-600">
                      {user?.rol === "client" ? "Técnico asignado" : `Cliente: ${activity.clientId}`}
                    </Text>
                  </VStack>
                  <Badge
                    variant={activity.status === "completed" ? "solid" : "outline"}
                    action={
                      activity.status === "completed"
                        ? "success"
                        : activity.status === "in_progress"
                          ? "warning"
                          : "muted"
                    }
                  >
                    <Text className="text-xs">
                      {activity.status === "pending"
                        ? "Pendiente"
                        : activity.status === "in_progress"
                          ? "En Progreso"
                          : "Completado"}
                    </Text>
                  </Badge>
                </HStack>
              ))}
            </VStack>
          </VStack>
        </Box>

        {/* Quick Actions */}
        <Box className="p-4 bg-white rounded-lg border border-gray-200">
          <VStack space="md">
            <Text className="text-lg font-semibold">Acciones Rápidas</Text>
            <VStack space="sm">
              {content.quickActions.map((action, index) => (
                <Button
                  key={index}
                  onPress={() => handleQuickAction(action.action)}
                  variant={action.variant as any}
                  className={`w-full ${action.variant === "solid" ? `bg-${action.color}-600` : `border-${action.color}-500 bg-transparent`}`}
                >
                  <Text
                    className={`font-medium ${action.variant === "solid" ? "text-white" : `text-${action.color}-600`}`}
                  >
                    {action.title}
                  </Text>
                </Button>
              ))}
            </VStack>
          </VStack>
        </Box>

        {/* Sign Out Button */}
        <Button onPress={signOut} variant="outline" className="border-red-500 bg-transparent">
          <Text className="text-red-500 font-medium">Cerrar Sesión</Text>
        </Button>
      </VStack>
    </ScrollView>
  )
}
