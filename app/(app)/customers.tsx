"use client"

import { useState, useEffect } from "react"
import { View, Text, TextInput, Alert } from "react-native"
import { FlashList } from "@shopify/flash-list"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Plus, Search, Edit, Trash2, Mail, Phone, MapPin } from "lucide-react-native"

import { Button } from "../../components/ui/Button"
import { Card } from "../../components/ui/Card"
import { Sheet } from "../../components/ui/Sheet"
import { Input } from "../../components/ui/Input"
import { useAuth } from "../../lib/auth"
import { supabaseService } from "../../lib/supabase"

// Zod schema for customer validation
const customerSchema = z.object({
  nombre: z.string().min(2, "Nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  telefono: z.string().min(10, "Teléfono debe tener al menos 10 dígitos"),
  direccion: z.string().min(5, "Dirección debe tener al menos 5 caracteres"),
  empresa: z.string().optional(),
})

type CustomerFormData = z.infer<typeof customerSchema>

interface Customer {
  id: string
  nombre: string
  email: string
  telefono: string
  direccion: string
  empresa?: string
  created_at: string
}

export default function CustomersScreen() {
  const { profile } = useAuth()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchText, setSearchText] = useState("")
  const [showSheet, setShowSheet] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
  })

  useEffect(() => {
    loadCustomers()
  }, [])

  const loadCustomers = async () => {
    try {
      setLoading(true)
      const data = await supabaseService.listCustomers()
      setCustomers(data)
    } catch (error) {
      console.error("Error loading customers:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.nombre.toLowerCase().includes(searchText.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchText.toLowerCase()) ||
      customer.empresa?.toLowerCase().includes(searchText.toLowerCase()),
  )

  const handleCreateEdit = async (data: CustomerFormData) => {
    try {
      if (editingCustomer) {
        // TODO: Implement update customer
        console.log("Updating customer:", editingCustomer.id, data)
      } else {
        // TODO: Implement create customer
        console.log("Creating customer:", data)
      }

      setShowSheet(false)
      setEditingCustomer(null)
      reset()
      loadCustomers()
    } catch (error) {
      console.error("Error saving customer:", error)
    }
  }

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer)
    reset({
      nombre: customer.nombre,
      email: customer.email,
      telefono: customer.telefono,
      direccion: customer.direccion,
      empresa: customer.empresa,
    })
    setShowSheet(true)
  }

  const handleDelete = (customer: Customer) => {
    Alert.alert("Eliminar Cliente", `¿Estás seguro de que quieres eliminar a ${customer.nombre}?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            // TODO: Implement delete customer
            console.log("Deleting customer:", customer.id)
            loadCustomers()
          } catch (error) {
            console.error("Error deleting customer:", error)
          }
        },
      },
    ])
  }

  const openCreateSheet = () => {
    setEditingCustomer(null)
    reset({
      nombre: "",
      email: "",
      telefono: "",
      direccion: "",
      empresa: "",
    })
    setShowSheet(true)
  }

  const renderCustomerItem = ({ item }: { item: Customer }) => (
    <Card className="mb-3 p-4">
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <Text className="font-semibold text-lg text-gray-900">{item.nombre}</Text>
          {item.empresa && <Text className="text-sm text-gray-600">{item.empresa}</Text>}
        </View>
        {profile?.role === "admin" && (
          <View className="flex-row gap-2">
            <Button variant="outline" size="sm" onPress={() => handleEdit(item)} className="px-2">
              <Edit size={16} color="#6B7280" />
            </Button>
            <Button variant="outline" size="sm" onPress={() => handleDelete(item)} className="px-2">
              <Trash2 size={16} color="#EF4444" />
            </Button>
          </View>
        )}
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
        <View className="flex-row items-center gap-2">
          <MapPin size={16} color="#6B7280" />
          <Text className="text-sm text-gray-600">{item.direccion}</Text>
        </View>
      </View>
    </Card>
  )

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-gray-600">Cargando clientes...</Text>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-4 py-3 bg-white border-b border-gray-200">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-xl font-semibold text-gray-900">Clientes</Text>
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
            placeholder="Buscar clientes..."
            value={searchText}
            onChangeText={setSearchText}
            className="flex-1 text-gray-900"
          />
        </View>
      </View>

      {/* List */}
      <View className="flex-1 px-4 py-3">
        <FlashList
          data={filteredCustomers}
          renderItem={renderCustomerItem}
          keyExtractor={(item) => item.id}
          estimatedItemSize={150}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center py-12">
              <Text className="text-gray-500 text-center">No se encontraron clientes</Text>
            </View>
          }
        />
      </View>

      {/* Create/Edit Sheet */}
      <Sheet
        isOpen={showSheet}
        onClose={() => {
          setShowSheet(false)
          setEditingCustomer(null)
          reset()
        }}
        title={editingCustomer ? "Editar Cliente" : "Nuevo Cliente"}
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
            name="direccion"
            render={({ field }) => (
              <View>
                <Input
                  placeholder="Dirección"
                  value={field.value}
                  onChangeText={field.onChange}
                  multiline
                  numberOfLines={2}
                />
                {errors.direccion && <Text className="text-sm text-red-600 mt-1">{errors.direccion.message}</Text>}
              </View>
            )}
          />

          <Controller
            control={control}
            name="empresa"
            render={({ field }) => (
              <Input placeholder="Empresa (opcional)" value={field.value || ""} onChangeText={field.onChange} />
            )}
          />

          <Button onPress={handleSubmit(handleCreateEdit)} disabled={!isValid}>
            <Text className="text-white">{editingCustomer ? "Actualizar" : "Crear"} Cliente</Text>
          </Button>
        </View>
      </Sheet>
    </View>
  )
}
