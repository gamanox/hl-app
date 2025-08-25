"use client"

import { useState, useEffect } from "react"
import { View, Text, TextInput, Alert } from "react-native"
import { FlashList } from "@shopify/flash-list"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Plus, Search, Edit, Trash2, Settings, Calendar, User } from "lucide-react-native"

import { Button } from "../../components/ui/Button"
import { Card } from "../../components/ui/Card"
import { Sheet } from "../../components/ui/Sheet"
import { Input } from "../../components/ui/Input"
import { Select } from "../../components/ui/Select"
import { Badge } from "../../components/ui/Badge"
import { useAuth } from "../../lib/auth"
import { supabaseService } from "../../lib/supabase"

// Zod schema for machine validation
const machineSchema = z.object({
  modelo: z.string().min(2, "Modelo debe tener al menos 2 caracteres"),
  numeroSerie: z.string().min(3, "Número de serie debe tener al menos 3 caracteres"),
  fabricante: z.string().min(2, "Fabricante requerido"),
  año: z
    .number()
    .min(1990, "Año debe ser mayor a 1990")
    .max(new Date().getFullYear() + 1),
  clienteId: z.string().min(1, "Cliente requerido"),
  estado: z.enum(["operativa", "mantenimiento", "fuera_servicio"]),
  ubicacion: z.string().min(3, "Ubicación requerida"),
  notas: z.string().optional(),
})

type MachineFormData = z.infer<typeof machineSchema>

interface Machine {
  id: string
  modelo: string
  numeroSerie: string
  fabricante: string
  año: number
  clienteId: string
  cliente?: { nombre: string }
  estado: "operativa" | "mantenimiento" | "fuera_servicio"
  ubicacion: string
  notas?: string
  created_at: string
}

export default function MachinesScreen() {
  const { profile } = useAuth()
  const [machines, setMachines] = useState<Machine[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchText, setSearchText] = useState("")
  const [showSheet, setShowSheet] = useState(false)
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null)

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<MachineFormData>({
    resolver: zodResolver(machineSchema),
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [machinesData, customersData] = await Promise.all([
        supabaseService.listMachines(),
        supabaseService.listCustomers(),
      ])
      setMachines(machinesData)
      setCustomers(customersData)
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredMachines = machines.filter(
    (machine) =>
      machine.modelo.toLowerCase().includes(searchText.toLowerCase()) ||
      machine.numeroSerie.toLowerCase().includes(searchText.toLowerCase()) ||
      machine.fabricante.toLowerCase().includes(searchText.toLowerCase()) ||
      machine.cliente?.nombre?.toLowerCase().includes(searchText.toLowerCase()),
  )

  const handleCreateEdit = async (data: MachineFormData) => {
    try {
      if (editingMachine) {
        // TODO: Implement update machine
        console.log("Updating machine:", editingMachine.id, data)
      } else {
        // TODO: Implement create machine
        console.log("Creating machine:", data)
      }

      setShowSheet(false)
      setEditingMachine(null)
      reset()
      loadData()
    } catch (error) {
      console.error("Error saving machine:", error)
    }
  }

  const handleEdit = (machine: Machine) => {
    setEditingMachine(machine)
    reset({
      modelo: machine.modelo,
      numeroSerie: machine.numeroSerie,
      fabricante: machine.fabricante,
      año: machine.año,
      clienteId: machine.clienteId,
      estado: machine.estado,
      ubicacion: machine.ubicacion,
      notas: machine.notas,
    })
    setShowSheet(true)
  }

  const handleDelete = (machine: Machine) => {
    Alert.alert("Eliminar Máquina", `¿Estás seguro de que quieres eliminar ${machine.modelo}?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            // TODO: Implement delete machine
            console.log("Deleting machine:", machine.id)
            loadData()
          } catch (error) {
            console.error("Error deleting machine:", error)
          }
        },
      },
    ])
  }

  const openCreateSheet = () => {
    setEditingMachine(null)
    reset({
      modelo: "",
      numeroSerie: "",
      fabricante: "",
      año: new Date().getFullYear(),
      clienteId: "",
      estado: "operativa",
      ubicacion: "",
      notas: "",
    })
    setShowSheet(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "operativa":
        return "bg-green-100 text-green-800"
      case "mantenimiento":
        return "bg-yellow-100 text-yellow-800"
      case "fuera_servicio":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const renderMachineItem = ({ item }: { item: Machine }) => (
    <Card className="mb-3 p-4">
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <Text className="font-semibold text-lg text-gray-900">{item.modelo}</Text>
          <Text className="text-sm text-gray-600">
            {item.fabricante} • {item.año}
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          <Badge className={getStatusColor(item.estado)}>{item.estado.replace("_", " ")}</Badge>
          {profile?.role === "admin" && (
            <View className="flex-row gap-1">
              <Button variant="outline" size="sm" onPress={() => handleEdit(item)} className="px-2">
                <Edit size={16} color="#6B7280" />
              </Button>
              <Button variant="outline" size="sm" onPress={() => handleDelete(item)} className="px-2">
                <Trash2 size={16} color="#EF4444" />
              </Button>
            </View>
          )}
        </View>
      </View>

      <View className="space-y-2">
        <View className="flex-row items-center gap-2">
          <Settings size={16} color="#6B7280" />
          <Text className="text-sm text-gray-600">S/N: {item.numeroSerie}</Text>
        </View>
        <View className="flex-row items-center gap-2">
          <User size={16} color="#6B7280" />
          <Text className="text-sm text-gray-600">{item.cliente?.nombre || "Cliente no asignado"}</Text>
        </View>
        <View className="flex-row items-center gap-2">
          <Calendar size={16} color="#6B7280" />
          <Text className="text-sm text-gray-600">{item.ubicacion}</Text>
        </View>
        {item.notas && <Text className="text-sm text-gray-500 italic mt-2">{item.notas}</Text>}
      </View>
    </Card>
  )

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-gray-600">Cargando máquinas...</Text>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-4 py-3 bg-white border-b border-gray-200">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-xl font-semibold text-gray-900">Máquinas</Text>
          {profile?.role === "admin" && (
            <Button size="sm" onPress={openCreateSheet}>
              <View className="flex-row items-center gap-2">
                <Plus size={16} color="#FFFFFF" />
                <Text className="text-white">Nueva</Text>
              </View>
            </Button>
          )}
        </View>

        {/* Search */}
        <View className="flex-row items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
          <Search size={20} color="#6B7280" />
          <TextInput
            placeholder="Buscar máquinas..."
            value={searchText}
            onChangeText={setSearchText}
            className="flex-1 text-gray-900"
          />
        </View>
      </View>

      {/* List */}
      <View className="flex-1 px-4 py-3">
        <FlashList
          data={filteredMachines}
          renderItem={renderMachineItem}
          keyExtractor={(item) => item.id}
          estimatedItemSize={180}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center py-12">
              <Text className="text-gray-500 text-center">No se encontraron máquinas</Text>
            </View>
          }
        />
      </View>

      {/* Create/Edit Sheet */}
      <Sheet
        isOpen={showSheet}
        onClose={() => {
          setShowSheet(false)
          setEditingMachine(null)
          reset()
        }}
        title={editingMachine ? "Editar Máquina" : "Nueva Máquina"}
      >
        <View className="p-4 space-y-4">
          <Controller
            control={control}
            name="modelo"
            render={({ field }) => (
              <View>
                <Input placeholder="Modelo" value={field.value} onChangeText={field.onChange} />
                {errors.modelo && <Text className="text-sm text-red-600 mt-1">{errors.modelo.message}</Text>}
              </View>
            )}
          />

          <Controller
            control={control}
            name="fabricante"
            render={({ field }) => (
              <View>
                <Input placeholder="Fabricante" value={field.value} onChangeText={field.onChange} />
                {errors.fabricante && <Text className="text-sm text-red-600 mt-1">{errors.fabricante.message}</Text>}
              </View>
            )}
          />

          <View className="flex-row gap-3">
            <Controller
              control={control}
              name="numeroSerie"
              render={({ field }) => (
                <View className="flex-1">
                  <Input placeholder="Número de Serie" value={field.value} onChangeText={field.onChange} />
                  {errors.numeroSerie && (
                    <Text className="text-sm text-red-600 mt-1">{errors.numeroSerie.message}</Text>
                  )}
                </View>
              )}
            />

            <Controller
              control={control}
              name="año"
              render={({ field }) => (
                <View className="w-24">
                  <Input
                    placeholder="Año"
                    value={field.value?.toString() || ""}
                    onChangeText={(text) => field.onChange(Number.parseInt(text) || 0)}
                    keyboardType="numeric"
                  />
                  {errors.año && <Text className="text-sm text-red-600 mt-1">{errors.año.message}</Text>}
                </View>
              )}
            />
          </View>

          <Controller
            control={control}
            name="clienteId"
            render={({ field }) => (
              <View>
                <Select value={field.value} onValueChange={field.onChange} placeholder="Seleccionar cliente">
                  {customers.map((customer) => (
                    <Select.Item key={customer.id} label={customer.nombre} value={customer.id} />
                  ))}
                </Select>
                {errors.clienteId && <Text className="text-sm text-red-600 mt-1">{errors.clienteId.message}</Text>}
              </View>
            )}
          />

          <Controller
            control={control}
            name="estado"
            render={({ field }) => (
              <View>
                <Select value={field.value} onValueChange={field.onChange} placeholder="Estado">
                  <Select.Item label="Operativa" value="operativa" />
                  <Select.Item label="En Mantenimiento" value="mantenimiento" />
                  <Select.Item label="Fuera de Servicio" value="fuera_servicio" />
                </Select>
              </View>
            )}
          />

          <Controller
            control={control}
            name="ubicacion"
            render={({ field }) => (
              <View>
                <Input placeholder="Ubicación" value={field.value} onChangeText={field.onChange} />
                {errors.ubicacion && <Text className="text-sm text-red-600 mt-1">{errors.ubicacion.message}</Text>}
              </View>
            )}
          />

          <Controller
            control={control}
            name="notas"
            render={({ field }) => (
              <Input
                placeholder="Notas (opcional)"
                value={field.value || ""}
                onChangeText={field.onChange}
                multiline
                numberOfLines={3}
              />
            )}
          />

          <Button onPress={handleSubmit(handleCreateEdit)} disabled={!isValid}>
            <Text className="text-white">{editingMachine ? "Actualizar" : "Crear"} Máquina</Text>
          </Button>
        </View>
      </Sheet>
    </View>
  )
}
