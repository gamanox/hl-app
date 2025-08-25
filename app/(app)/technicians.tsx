"use client"

import { useState, useEffect } from "react"
import { View, Text, TextInput, Alert } from "react-native"
import { FlashList } from "@shopify/flash-list"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Plus, Search, Edit, Trash2, Mail, Phone, Award, Clock } from "lucide-react-native"

import { Button } from "../../components/ui/Button"
import { Card } from "../../components/ui/Card"
import { Sheet } from "../../components/ui/Sheet"
import { Input } from "../../components/ui/Input"
import { Select } from "../../components/ui/Select"
import { Badge } from "../../components/ui/Badge"
import { useAuth } from "../../lib/auth"
import { supabaseService } from "../../lib/supabase"

// Zod schema for technician validation
const technicianSchema = z.object({
  nombre: z.string().min(2, "Nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  telefono: z.string().min(10, "Teléfono debe tener al menos 10 dígitos"),
  especialidad: z.enum(["cnc", "mantenimiento", "instalacion", "reparacion", "general"]),
  nivel: z.enum(["junior", "senior", "especialista"]),
  estado: z.enum(["activo", "inactivo", "vacaciones"]),
  certificaciones: z.string().optional(),
})

type TechnicianFormData = z.infer<typeof technicianSchema>

interface Technician {
  id: string
  nombre: string
  email: string
  telefono: string
  especialidad: "cnc" | "mantenimiento" | "instalacion" | "reparacion" | "general"
  nivel: "junior" | "senior" | "especialista"
  estado: "activo" | "inactivo" | "vacaciones"
  certificaciones?: string
  ordenesActivas?: number
  created_at: string
}

export default function TechniciansScreen() {
  const { profile } = useAuth()
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [loading, setLoading] = useState(true)
  const [searchText, setSearchText] = useState("")
  const [showSheet, setShowSheet] = useState(false)
  const [editingTechnician, setEditingTechnician] = useState<Technician | null>(null)

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<TechnicianFormData>({
    resolver: zodResolver(technicianSchema),
  })

  useEffect(() => {
    loadTechnicians()
  }, [])

  const loadTechnicians = async () => {
    try {
      setLoading(true)
      const data = await supabaseService.listTechnicians()
      setTechnicians(data)
    } catch (error) {
      console.error("Error loading technicians:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredTechnicians = technicians.filter(
    (tech) =>
      tech.nombre.toLowerCase().includes(searchText.toLowerCase()) ||
      tech.email.toLowerCase().includes(searchText.toLowerCase()) ||
      tech.especialidad.toLowerCase().includes(searchText.toLowerCase()),
  )

  const handleCreateEdit = async (data: TechnicianFormData) => {
    try {
      if (editingTechnician) {
        // TODO: Implement update technician
        console.log("Updating technician:", editingTechnician.id, data)
      } else {
        // TODO: Implement create technician
        console.log("Creating technician:", data)
      }

      setShowSheet(false)
      setEditingTechnician(null)
      reset()
      loadTechnicians()
    } catch (error) {
      console.error("Error saving technician:", error)
    }
  }

  const handleEdit = (technician: Technician) => {
    setEditingTechnician(technician)
    reset({
      nombre: technician.nombre,
      email: technician.email,
      telefono: technician.telefono,
      especialidad: technician.especialidad,
      nivel: technician.nivel,
      estado: technician.estado,
      certificaciones: technician.certificaciones,
    })
    setShowSheet(true)
  }

  const handleDelete = (technician: Technician) => {
    Alert.alert("Eliminar Técnico", `¿Estás seguro de que quieres eliminar a ${technician.nombre}?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            // TODO: Implement delete technician
            console.log("Deleting technician:", technician.id)
            loadTechnicians()
          } catch (error) {
            console.error("Error deleting technician:", error)
          }
        },
      },
    ])
  }

  const openCreateSheet = () => {
    setEditingTechnician(null)
    reset({
      nombre: "",
      email: "",
      telefono: "",
      especialidad: "general",
      nivel: "junior",
      estado: "activo",
      certificaciones: "",
    })
    setShowSheet(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "activo":
        return "bg-green-100 text-green-800"
      case "inactivo":
        return "bg-gray-100 text-gray-800"
      case "vacaciones":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case "junior":
        return "bg-yellow-100 text-yellow-800"
      case "senior":
        return "bg-blue-100 text-blue-800"
      case "especialista":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const renderTechnicianItem = ({ item }: { item: Technician }) => (
    <Card className="mb-3 p-4">
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <Text className="font-semibold text-lg text-gray-900">{item.nombre}</Text>
          <Text className="text-sm text-gray-600 capitalize">{item.especialidad}</Text>
        </View>
        <View className="flex-row items-center gap-2">
          <Badge className={getLevelColor(item.nivel)}>{item.nivel}</Badge>
          <Badge className={getStatusColor(item.estado)}>{item.estado}</Badge>
          {profile?.role === "admin" && (
            <View className="flex-row gap-1 ml-2">
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
          <Mail size={16} color="#6B7280" />
          <Text className="text-sm text-gray-600">{item.email}</Text>
        </View>
        <View className="flex-row items-center gap-2">
          <Phone size={16} color="#6B7280" />
          <Text className="text-sm text-gray-600">{item.telefono}</Text>
        </View>
        {item.ordenesActivas !== undefined && (
          <View className="flex-row items-center gap-2">
            <Clock size={16} color="#6B7280" />
            <Text className="text-sm text-gray-600">{item.ordenesActivas} órdenes activas</Text>
          </View>
        )}
        {item.certificaciones && (
          <View className="flex-row items-center gap-2">
            <Award size={16} color="#6B7280" />
            <Text className="text-sm text-gray-600">{item.certificaciones}</Text>
          </View>
        )}
      </View>
    </Card>
  )

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-gray-600">Cargando técnicos...</Text>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-4 py-3 bg-white border-b border-gray-200">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-xl font-semibold text-gray-900">Técnicos</Text>
          {profile?.role === "admin" && (
            <Button size="sm" onPress={openCreateSheet}>
              <View className="flex-row items-center gap-2">
                <Plus size={16} color="#FFFFFF" />
                <Text className="text-white">Nuevo</Text>
              </View>
            </Button>
          )}
        </View>

        {/* Search */}
        <View className="flex-row items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
          <Search size={20} color="#6B7280" />
          <TextInput
            placeholder="Buscar técnicos..."
            value={searchText}
            onChangeText={setSearchText}
            className="flex-1 text-gray-900"
          />
        </View>
      </View>

      {/* List */}
      <View className="flex-1 px-4 py-3">
        <FlashList
          data={filteredTechnicians}
          renderItem={renderTechnicianItem}
          keyExtractor={(item) => item.id}
          estimatedItemSize={180}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center py-12">
              <Text className="text-gray-500 text-center">No se encontraron técnicos</Text>
            </View>
          }
        />
      </View>

      {/* Create/Edit Sheet */}
      <Sheet
        isOpen={showSheet}
        onClose={() => {
          setShowSheet(false)
          setEditingTechnician(null)
          reset()
        }}
        title={editingTechnician ? "Editar Técnico" : "Nuevo Técnico"}
      >
        <View className="p-4 space-y-4">
          <Controller
            control={control}
            name="nombre"
            render={({ field }) => (
              <View>
                <Input placeholder="Nombre completo" value={field.value} onChangeText={field.onChange} />
                {errors.nombre && <Text className="text-sm text-red-600 mt-1">{errors.nombre.message}</Text>}
              </View>
            )}
          />

          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <View>
                <Input
                  placeholder="Email"
                  value={field.value}
                  onChangeText={field.onChange}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {errors.email && <Text className="text-sm text-red-600 mt-1">{errors.email.message}</Text>}
              </View>
            )}
          />

          <Controller
            control={control}
            name="telefono"
            render={({ field }) => (
              <View>
                <Input
                  placeholder="Teléfono"
                  value={field.value}
                  onChangeText={field.onChange}
                  keyboardType="phone-pad"
                />
                {errors.telefono && <Text className="text-sm text-red-600 mt-1">{errors.telefono.message}</Text>}
              </View>
            )}
          />

          <Controller
            control={control}
            name="especialidad"
            render={({ field }) => (
              <View>
                <Select value={field.value} onValueChange={field.onChange} placeholder="Especialidad">
                  <Select.Item label="CNC" value="cnc" />
                  <Select.Item label="Mantenimiento" value="mantenimiento" />
                  <Select.Item label="Instalación" value="instalacion" />
                  <Select.Item label="Reparación" value="reparacion" />
                  <Select.Item label="General" value="general" />
                </Select>
              </View>
            )}
          />

          <View className="flex-row gap-3">
            <Controller
              control={control}
              name="nivel"
              render={({ field }) => (
                <View className="flex-1">
                  <Select value={field.value} onValueChange={field.onChange} placeholder="Nivel">
                    <Select.Item label="Junior" value="junior" />
                    <Select.Item label="Senior" value="senior" />
                    <Select.Item label="Especialista" value="especialista" />
                  </Select>
                </View>
              )}
            />

            <Controller
              control={control}
              name="estado"
              render={({ field }) => (
                <View className="flex-1">
                  <Select value={field.value} onValueChange={field.onChange} placeholder="Estado">
                    <Select.Item label="Activo" value="activo" />
                    <Select.Item label="Inactivo" value="inactivo" />
                    <Select.Item label="Vacaciones" value="vacaciones" />
                  </Select>
                </View>
              )}
            />
          </View>

          <Controller
            control={control}
            name="certificaciones"
            render={({ field }) => (
              <Input
                placeholder="Certificaciones (opcional)"
                value={field.value || ""}
                onChangeText={field.onChange}
                multiline
                numberOfLines={2}
              />
            )}
          />

          <Button onPress={handleSubmit(handleCreateEdit)} disabled={!isValid}>
            <Text className="text-white">{editingTechnician ? "Actualizar" : "Crear"} Técnico</Text>
          </Button>
        </View>
      </Sheet>
    </View>
  )
}
