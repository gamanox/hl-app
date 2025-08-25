"use client"

import { useState, useEffect } from "react"
import { View, ScrollView, RefreshControl } from "react-native"
import { VStack, HStack, Text, Pressable, Box, Spinner, useToast, Toast, ToastTitle } from "@gluestack-ui/themed"
import { Card, CardContent, CardHeader } from "../../components/ui/Card"
import { Badge } from "../../components/ui/Badge"
import { Button } from "../../components/ui/Button"
import { useAuth } from "../../lib/auth"
import { supabaseService } from "../../lib/supabase"
import { workOrderService } from "../../lib/work-orders"
import type { WorkOrder, User } from "../../lib/zod-schemas"

interface KPIData {
  open: number
  upcoming: number
  inProgress: number
  pendingInvoice: number
}

interface DashboardData {
  kpis: KPIData
  upcomingOrders: WorkOrder[]
  technicians: User[]
}

export default function Dashboard() {
  const { user } = useAuth()
  const toast = useToast()
  const [activeTab, setActiveTab] = useState<"admin" | "technician" | "client">("admin")
  const [data, setData] = useState<DashboardData>({
    kpis: { open: 0, upcoming: 0, inProgress: 0, pendingInvoice: 0 },
    upcomingOrders: [],
    technicians: [],
  })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (user?.rol) {
      setActiveTab(user.rol === "admin" ? "admin" : user.rol === "technician" ? "technician" : "client")
    }
  }, [user?.rol])

  const loadDashboardData = async () => {
    try {
      setLoading(true)

      const filters =
        user?.rol === "client" ? { clienteId: user.id } : user?.rol === "technician" ? { assignedTo: user.id } : {}

      const orders = await supabaseService.listWorkOrders(filters)
      const technicians = user?.rol === "admin" ? await supabaseService.listTechnicians() : []

      const kpis: KPIData = {
        open: orders.filter((o) => o.estado === "pending").length,
        upcoming: orders.filter((o) => {
          const tomorrow = new Date()
          tomorrow.setDate(tomorrow.getDate() + 1)
          return new Date(o.fecha_estimada) <= tomorrow && o.estado !== "done"
        }).length,
        inProgress: orders.filter((o) => o.estado === "in_progress").length,
        pendingInvoice: orders.filter((o) => o.estado === "done" && !o.facturas?.length).length,
      }

      setData({
        kpis,
        upcomingOrders: orders
          .filter((o) => o.estado !== "archived")
          .sort((a, b) => new Date(a.fecha_estimada).getTime() - new Date(b.fecha_estimada).getTime())
          .slice(0, 10),
        technicians,
      })
    } catch (error) {
      console.error("[v0] Dashboard data load error:", error)
      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast nativeID={`toast-${id}`} action="error">
            <ToastTitle>Error loading dashboard data</ToastTitle>
          </Toast>
        ),
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [user])

  const onRefresh = () => {
    setRefreshing(true)
    loadDashboardData()
  }

  const handleQuickAction = async (action: string, orderId: string, value?: any) => {
    try {
      switch (action) {
        case "assign":
          await workOrderService.updateWorkOrder(orderId, { asignados: [value] })
          toast.show({
            placement: "top",
            render: ({ id }) => (
              <Toast nativeID={`toast-${id}`} action="success">
                <ToastTitle>Technician assigned successfully</ToastTitle>
              </Toast>
            ),
          })
          break
        case "status":
          await workOrderService.updateWorkOrder(orderId, { estado: value })
          toast.show({
            placement: "top",
            render: ({ id }) => (
              <Toast nativeID={`toast-${id}`} action="success">
                <ToastTitle>Status updated successfully</ToastTitle>
              </Toast>
            ),
          })
          break
      }
      loadDashboardData()
    } catch (error) {
      console.error("[v0] Quick action error:", error)
      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast nativeID={`toast-${id}`} action="error">
            <ToastTitle>Action failed</ToastTitle>
          </Toast>
        ),
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "warning"
      case "in_progress":
        return "info"
      case "done":
        return "success"
      case "archived":
        return "secondary"
      default:
        return "secondary"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "error"
      case "normal":
        return "info"
      case "low":
        return "secondary"
      default:
        return "secondary"
    }
  }

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Spinner size="large" />
        <Text className="mt-4 text-gray-600">Loading dashboard...</Text>
      </View>
    )
  }

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <VStack space="lg" className="p-4">
        <VStack space="md">
          <Text className="text-2xl font-bold text-gray-900">Dashboard</Text>

          <HStack space="md" className="flex-wrap">
            <Card className="flex-1 min-w-[150px]">
              <CardContent className="p-4">
                <VStack space="xs">
                  <Text className="text-sm text-gray-600">Open Orders</Text>
                  <Text className="text-2xl font-bold text-blue-600">{data.kpis.open}</Text>
                </VStack>
              </CardContent>
            </Card>

            <Card className="flex-1 min-w-[150px]">
              <CardContent className="p-4">
                <VStack space="xs">
                  <Text className="text-sm text-gray-600">Upcoming</Text>
                  <Text className="text-2xl font-bold text-orange-600">{data.kpis.upcoming}</Text>
                </VStack>
              </CardContent>
            </Card>

            <Card className="flex-1 min-w-[150px]">
              <CardContent className="p-4">
                <VStack space="xs">
                  <Text className="text-sm text-gray-600">In Progress</Text>
                  <Text className="text-2xl font-bold text-green-600">{data.kpis.inProgress}</Text>
                </VStack>
              </CardContent>
            </Card>

            <Card className="flex-1 min-w-[150px]">
              <CardContent className="p-4">
                <VStack space="xs">
                  <Text className="text-sm text-gray-600">To Invoice</Text>
                  <Text className="text-2xl font-bold text-purple-600">{data.kpis.pendingInvoice}</Text>
                </VStack>
              </CardContent>
            </Card>
          </HStack>
        </VStack>

        <Card>
          <CardHeader>
            <HStack space="md" className="border-b border-gray-200 pb-3">
              {user?.rol === "admin" && (
                <Pressable onPress={() => setActiveTab("admin")}>
                  <Text
                    className={`px-3 py-2 rounded-md ${activeTab === "admin" ? "bg-blue-100 text-blue-700 font-semibold" : "text-gray-600"}`}
                  >
                    Global Overview
                  </Text>
                </Pressable>
              )}
              {(user?.rol === "technician" || user?.rol === "admin") && (
                <Pressable onPress={() => setActiveTab("technician")}>
                  <Text
                    className={`px-3 py-2 rounded-md ${activeTab === "technician" ? "bg-blue-100 text-blue-700 font-semibold" : "text-gray-600"}`}
                  >
                    Assigned Backlog
                  </Text>
                </Pressable>
              )}
              {(user?.rol === "client" || user?.rol === "admin") && (
                <Pressable onPress={() => setActiveTab("client")}>
                  <Text
                    className={`px-3 py-2 rounded-md ${activeTab === "client" ? "bg-blue-100 text-blue-700 font-semibold" : "text-gray-600"}`}
                  >
                    My Orders
                  </Text>
                </Pressable>
              )}
            </HStack>
          </CardHeader>

          <CardContent>
            <VStack space="md">
              <Text className="text-lg font-semibold text-gray-900">
                {activeTab === "admin"
                  ? "All Upcoming Orders"
                  : activeTab === "technician"
                    ? "My Assigned Orders"
                    : "My Service Orders"}
              </Text>

              {data.upcomingOrders.length === 0 ? (
                <Box className="p-8 text-center">
                  <Text className="text-gray-500">No orders found</Text>
                </Box>
              ) : (
                <VStack space="sm">
                  {data.upcomingOrders.map((order) => (
                    <Card key={order.id} className="border border-gray-200">
                      <CardContent className="p-4">
                        <VStack space="sm">
                          <HStack className="justify-between items-start">
                            <VStack space="xs" className="flex-1">
                              <HStack space="sm" className="items-center">
                                <Text className="font-semibold text-gray-900">{order.id}</Text>
                                <Badge variant={getStatusColor(order.estado)}>{order.estado.replace("_", " ")}</Badge>
                                <Badge variant={getPriorityColor(order.prioridad)}>{order.prioridad}</Badge>
                              </HStack>
                              <Text className="text-sm text-gray-600">{order.tipo}</Text>
                              <Text className="text-xs text-gray-500">
                                Due: {new Date(order.fecha_estimada).toLocaleDateString()}
                              </Text>
                            </VStack>

                            <HStack space="xs">
                              {user?.rol === "admin" && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onPress={() => handleQuickAction("assign", order.id, data.technicians[0]?.id)}
                                  >
                                    <Text className="text-xs">Assign</Text>
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onPress={() => handleQuickAction("status", order.id, "in_progress")}
                                  >
                                    <Text className="text-xs">Start</Text>
                                  </Button>
                                </>
                              )}
                              {user?.rol === "technician" && order.estado === "pending" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onPress={() => handleQuickAction("status", order.id, "in_progress")}
                                >
                                  <Text className="text-xs">Start Work</Text>
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="solid"
                                onPress={() => {
                                  /* Navigate to detail */
                                }}
                              >
                                <Text className="text-xs text-white">Details</Text>
                              </Button>
                            </HStack>
                          </HStack>

                          {order.asignados?.length > 0 && (
                            <HStack space="xs" className="items-center">
                              <Text className="text-xs text-gray-500">Assigned to:</Text>
                              {order.asignados.map((tech, index) => (
                                <Badge key={index} variant="secondary">
                                  <Text className="text-xs">{tech.nombre}</Text>
                                </Badge>
                              ))}
                            </HStack>
                          )}
                        </VStack>
                      </CardContent>
                    </Card>
                  ))}
                </VStack>
              )}
            </VStack>
          </CardContent>
        </Card>
      </VStack>
    </ScrollView>
  )
}
