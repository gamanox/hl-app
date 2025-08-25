"use client"

import React, { useState } from "react"
import { View, Text, ScrollView, Switch } from "react-native"
import { router } from "expo-router"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Calendar, Clock, User, Plus, ChevronRight, ChevronLeft } from "lucide-react-native"

import { Button } from "../../components/ui/Button"
import { Input } from "../../components/ui/Input"
import { Select } from "../../components/ui/Select"
import { Card } from "../../components/ui/Card"
import { Badge } from "../../components/ui/Badge"
import { Sheet } from "../../components/ui/Sheet"
import { useAuth } from "../../lib/auth"
import { supabase } from "../../lib/supabase"
import { workOrderService } from "../../lib/work-orders"

// Zod schema for work order creation
const workOrderSchema = z.object({
  clientId: z.string().min(1, "Cliente requerido"),
  machineId: z.string().min(1, "Máquina requerida"),
  type: z.enum(["Preventive", "Piping", "Installation", "Measurement", "Immediate"]),
  scheduledDate: z.string().min(1, "Fecha requerida"),
  estimatedDuration: z.number().min(1, "Duración requerida"),
  priority: z.enum(["low", "normal", "high"]),
  assignedTechnicians: z.array(z.string()).min(1, "Al menos un técnico requerido"),
  requestPartsList: z.boolean(),
  notes: z.string().optional(),
})

type WorkOrderFormData = z.infer<typeof workOrderSchema>

const serviceTypes = [
  {
    value: "Preventive",
    label: "Mantenimiento Preventivo",
    icon: "🔧",
    description: "Mantenimiento programado regular",
  },
  { value: "Piping", label: "Tubería", icon: "🔩", description: "Instalación y reparación de tuberías" },
  { value: "Installation", label: "Instalación", icon: "⚙️", description: "Instalación de nuevos equipos" },
  { value: "Measurement", label: "Medición", icon: "📏", description: "Mediciones y calibraciones" },
  { value: "Immediate", label: "Inmediato", icon: "🚨", description: "Servicio de emergencia" },
]

const priorities = [
  { value: "low", label: "Baja", color: "bg-green-100 text-green-800" },
  { value: "normal", label: "Normal", color: "bg-blue-100 text-blue-800" },
  { value: "high", label: "Alta", color: "bg-red-100 text-red-800" },
]

export default function NewWorkOrderScreen() {
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(0)
  const [showClientSheet, setShowClientSheet] = useState(false)
  const [showMachineSheet, setShowMachineSheet] = useState(false)
  const [clients, setClients] = useState([])
  const [machines, setMachines] = useState([])
  const [technicians, setTechnicians] = useState([])
  const [loading, setLoading] = useState(false)

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<WorkOrderFormData>({
    resolver: zodResolver(workOrderSchema),
    defaultValues: {
      requestPartsList: false,
      priority: "normal",
      assignedTechnicians: [],
    },
  })

  const watchedValues = watch()

  React.useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [clientsData, machinesData, techniciansData] = await Promise.all([
        supabase.listCustomers(),
        supabase.listMachines(),
        supabase.listTechnicians(),
      ])
      setClients(clientsData)
      setMachines(machinesData)
      setTechnicians(techniciansData)
    } catch (error) {
      console.error("Error loading data:", error)
    }
  }

  const onSubmit = async (data: WorkOrderFormData) => {
    setLoading(true)
    try {
      await workOrderService.createWorkOrder(data)
      router.back()
    } catch (error) {
      console.error("Error creating work order:", error)
    } finally {
      setLoading(false)
    }
  }

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1)
  }

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return watchedValues.clientId && watchedValues.machineId
      case 1:
        return watchedValues.type
      case 2:
        return (
          watchedValues.scheduledDate &&
          watchedValues.estimatedDuration &&
          watchedValues.assignedTechnicians?.length > 0
        )
      case 3:
        return true
      default:
        return false
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <View className="space-y-6">
            <Text className="text-xl font-semibold text-gray-900">Cliente y Máquina</Text>

            {/* Client Selection */}
            <View className="space-y-2">
              <Text className="text-sm font-medium text-gray-700">Cliente</Text>
              <View className="flex-row space-x-2">
                <View className="flex-1">
                  <Controller
                    control={control}
                    name="clientId"
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Seleccionar cliente"
                        options={clients.map((c) => ({ value: c.id, label: c.name }))}
                      />
                    )}
                  />
                </View>
                <Button variant="outline" size="sm" onPress={() => setShowClientSheet(true)} className="px-3">
                  <Plus size={16} color="#6B7280" />
                </Button>
              </View>
              {errors.clientId && <Text className="text-sm text-red-600">{errors.clientId.message}</Text>}
            </View>

            {/* Machine Selection */}
            <View className="space-y-2">
              <Text className="text-sm font-medium text-gray-700">Máquina</Text>
              <View className="flex-row space-x-2">
                <View className="flex-1">
                  <Controller
                    control={control}
                    name="machineId"
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Seleccionar máquina"
                        options={machines
                          .filter((m) => !watchedValues.clientId || m.clientId === watchedValues.clientId)
                          .map((m) => ({ value: m.id, label: `${m.model} - ${m.serialNumber}` }))}
                      />
                    )}
                  />
                </View>
                <Button variant="outline" size="sm" onPress={() => setShowMachineSheet(true)} className="px-3">
                  <Plus size={16} color="#6B7280" />
                </Button>
              </View>
              {errors.machineId && <Text className="text-sm text-red-600">{errors.machineId.message}</Text>}
            </View>
          </View>
        )

      case 1:
        return (
          <View className="space-y-6">
            <Text className="text-xl font-semibold text-gray-900">Tipo de Servicio</Text>

            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <View className="space-y-3">
                  {serviceTypes.map((type) => (
                    <Card
                      key={type.value}
                      className={`p-4 border-2 ${
                        field.value === type.value ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white"
                      }`}
                      onPress={() => field.onChange(type.value)}
                    >
                      <View className="flex-row items-center space-x-3">
                        <Text className="text-2xl">{type.icon}</Text>
                        <View className="flex-1">
                          <Text className="font-semibold text-gray-900">{type.label}</Text>
                          <Text className="text-sm text-gray-600">{type.description}</Text>
                        </View>
                        {field.value === type.value && (
                          <View className="w-6 h-6 bg-blue-500 rounded-full items-center justify-center">
                            <Text className="text-white text-xs">✓</Text>
                          </View>
                        )}
                      </View>
                    </Card>
                  ))}
                </View>
              )}
            />
            {errors.type && <Text className="text-sm text-red-600">{errors.type.message}</Text>}
          </View>
        )

      case 2:
        return (
          <View className="space-y-6">
            <Text className="text-xl font-semibold text-gray-900">Programación</Text>

            {/* Scheduled Date */}
            <View className="space-y-2">
              <Text className="text-sm font-medium text-gray-700">Fecha Programada</Text>
              <Controller
                control={control}
                name="scheduledDate"
                render={({ field }) => (
                  <Input
                    value={field.value}
                    onChangeText={field.onChange}
                    placeholder="YYYY-MM-DD"
                    leftIcon={<Calendar size={20} color="#6B7280" />}
                  />
                )}
              />
              {errors.scheduledDate && <Text className="text-sm text-red-600">{errors.scheduledDate.message}</Text>}
            </View>

            {/* Estimated Duration */}
            <View className="space-y-2">
              <Text className="text-sm font-medium text-gray-700">Duración Estimada (horas)</Text>
              <Controller
                control={control}
                name="estimatedDuration"
                render={({ field }) => (
                  <Input
                    value={field.value?.toString() || ""}
                    onChangeText={(text) => field.onChange(Number.parseFloat(text) || 0)}
                    placeholder="2.5"
                    keyboardType="numeric"
                    leftIcon={<Clock size={20} color="#6B7280" />}
                  />
                )}
              />
              {errors.estimatedDuration && (
                <Text className="text-sm text-red-600">{errors.estimatedDuration.message}</Text>
              )}
            </View>

            {/* Priority */}
            <View className="space-y-2">
              <Text className="text-sm font-medium text-gray-700">Prioridad</Text>
              <Controller
                control={control}
                name="priority"
                render={({ field }) => (
                  <View className="flex-row space-x-2">
                    {priorities.map((priority) => (
                      <Button
                        key={priority.value}
                        variant={field.value === priority.value ? "default" : "outline"}
                        size="sm"
                        onPress={() => field.onChange(priority.value)}
                        className="flex-1"
                      >
                        <Text className={field.value === priority.value ? "text-white" : "text-gray-700"}>
                          {priority.label}
                        </Text>
                      </Button>
                    ))}
                  </View>
                )}
              />
            </View>

            {/* Assigned Technicians */}
            <View className="space-y-2">
              <Text className="text-sm font-medium text-gray-700">Técnicos Asignados</Text>
              <Controller
                control={control}
                name="assignedTechnicians"
                render={({ field }) => (
                  <View className="space-y-2">
                    {technicians.map((tech) => (
                      <Card
                        key={tech.id}
                        className={`p-3 border ${
                          field.value?.includes(tech.id) ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white"
                        }`}
                        onPress={() => {
                          const current = field.value || []
                          if (current.includes(tech.id)) {
                            field.onChange(current.filter((id) => id !== tech.id))
                          } else {
                            field.onChange([...current, tech.id])
                          }
                        }}
                      >
                        <View className="flex-row items-center justify-between">
                          <View className="flex-row items-center space-x-3">
                            <User size={20} color="#6B7280" />
                            <Text className="font-medium text-gray-900">{tech.name}</Text>
                          </View>
                          {field.value?.includes(tech.id) && (
                            <View className="w-5 h-5 bg-blue-500 rounded-full items-center justify-center">
                              <Text className="text-white text-xs">✓</Text>
                            </View>
                          )}
                        </View>
                      </Card>
                    ))}
                  </View>
                )}
              />
              {errors.assignedTechnicians && (
                <Text className="text-sm text-red-600">{errors.assignedTechnicians.message}</Text>
              )}
            </View>
          </View>
        )

      case 3:
        return (
          <View className="space-y-6">
            <Text className="text-xl font-semibold text-gray-900">Opciones Adicionales</Text>

            {/* Request Parts List */}
            <View className="flex-row items-center justify-between p-4 bg-gray-50 rounded-lg">
              <View className="flex-1">
                <Text className="font-medium text-gray-900">Solicitar Lista de Partes</Text>
                <Text className="text-sm text-gray-600">Generar automáticamente una lista de partes necesarias</Text>
              </View>
              <Controller
                control={control}
                name="requestPartsList"
                render={({ field }) => (
                  <Switch
                    value={field.value}
                    onValueChange={field.onChange}
                    trackColor={{ false: "#D1D5DB", true: "#3B82F6" }}
                    thumbColor={field.value ? "#FFFFFF" : "#FFFFFF"}
                  />
                )}
              />
            </View>

            {/* Notes */}
            <View className="space-y-2">
              <Text className="text-sm font-medium text-gray-700">Notas Adicionales</Text>
              <Controller
                control={control}
                name="notes"
                render={({ field }) => (
                  <Input
                    value={field.value || ""}
                    onChangeText={field.onChange}
                    placeholder="Instrucciones especiales, observaciones..."
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                )}
              />
            </View>
          </View>
        )

      case 4:
        return (
          <View className="space-y-6">
            <Text className="text-xl font-semibold text-gray-900">Resumen</Text>

            <Card className="p-4 bg-gray-50">
              <View className="space-y-3">
                <View className="flex-row justify-between">
                  <Text className="text-sm text-gray-600">Cliente:</Text>
                  <Text className="text-sm font-medium text-gray-900">
                    {clients.find((c) => c.id === watchedValues.clientId)?.name || "N/A"}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-sm text-gray-600">Máquina:</Text>
                  <Text className="text-sm font-medium text-gray-900">
                    {machines.find((m) => m.id === watchedValues.machineId)?.model || "N/A"}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-sm text-gray-600">Tipo:</Text>
                  <Text className="text-sm font-medium text-gray-900">
                    {serviceTypes.find((t) => t.value === watchedValues.type)?.label || "N/A"}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-sm text-gray-600">Fecha:</Text>
                  <Text className="text-sm font-medium text-gray-900">{watchedValues.scheduledDate || "N/A"}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-sm text-gray-600">Duración:</Text>
                  <Text className="text-sm font-medium text-gray-900">
                    {watchedValues.estimatedDuration || 0} horas
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-sm text-gray-600">Prioridad:</Text>
                  <Badge className={priorities.find((p) => p.value === watchedValues.priority)?.color}>
                    {priorities.find((p) => p.value === watchedValues.priority)?.label}
                  </Badge>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-sm text-gray-600">Técnicos:</Text>
                  <Text className="text-sm font-medium text-gray-900">
                    {watchedValues.assignedTechnicians?.length || 0} asignados
                  </Text>
                </View>
                {watchedValues.requestPartsList && (
                  <View className="flex-row justify-between">
                    <Text className="text-sm text-gray-600">Lista de Partes:</Text>
                    <Text className="text-sm font-medium text-green-600">Solicitada</Text>
                  </View>
                )}
                {watchedValues.notes && (
                  <View className="space-y-1">
                    <Text className="text-sm text-gray-600">Notas:</Text>
                    <Text className="text-sm text-gray-900">{watchedValues.notes}</Text>
                  </View>
                )}
              </View>
            </Card>
          </View>
        )

      default:
        return null
    }
  }

  const stepTitles = ["Cliente & Máquina", "Tipo de Servicio", "Programación", "Opciones", "Resumen"]

  return (
    <View className="flex-1 bg-white">
      {/* Header with Steps */}
      <View className="px-4 py-3 border-b border-gray-200">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-lg font-semibold text-gray-900">Nueva Orden de Trabajo</Text>
          <Text className="text-sm text-gray-500">{currentStep + 1} de 5</Text>
        </View>

        {/* Step Indicators */}
        <View className="flex-row items-center justify-between">
          {stepTitles.map((title, index) => (
            <View key={index} className="flex-1 items-center">
              <View
                className={`w-8 h-8 rounded-full items-center justify-center ${
                  index <= currentStep ? "bg-blue-500" : "bg-gray-200"
                }`}
              >
                <Text className={`text-sm font-medium ${index <= currentStep ? "text-white" : "text-gray-500"}`}>
                  {index + 1}
                </Text>
              </View>
              <Text className="text-xs text-gray-600 mt-1 text-center">{title}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Content */}
      <ScrollView className="flex-1 px-4 py-6">{renderStepContent()}</ScrollView>

      {/* Navigation */}
      <View className="px-4 py-3 border-t border-gray-200">
        <View className="flex-row space-x-3">
          {currentStep > 0 && (
            <Button variant="outline" onPress={prevStep} className="flex-1 bg-transparent">
              <View className="flex-row items-center justify-center space-x-2">
                <ChevronLeft size={16} color="#6B7280" />
                <Text className="text-gray-700">Anterior</Text>
              </View>
            </Button>
          )}

          {currentStep < 4 ? (
            <Button onPress={nextStep} disabled={!canProceed()} className="flex-1">
              <View className="flex-row items-center justify-center space-x-2">
                <Text className="text-white">Siguiente</Text>
                <ChevronRight size={16} color="#FFFFFF" />
              </View>
            </Button>
          ) : (
            <Button onPress={handleSubmit(onSubmit)} loading={loading} disabled={!isValid} className="flex-1">
              <Text className="text-white">Crear Orden</Text>
            </Button>
          )}
        </View>
      </View>

      {/* Client Creation Sheet */}
      <Sheet isOpen={showClientSheet} onClose={() => setShowClientSheet(false)} title="Nuevo Cliente">
        <View className="p-4 space-y-4">
          <Input placeholder="Nombre del cliente" />
          <Input placeholder="Email" />
          <Input placeholder="Teléfono" />
          <Button onPress={() => setShowClientSheet(false)}>
            <Text className="text-white">Crear Cliente</Text>
          </Button>
        </View>
      </Sheet>

      {/* Machine Creation Sheet */}
      <Sheet isOpen={showMachineSheet} onClose={() => setShowMachineSheet(false)} title="Nueva Máquina">
        <View className="p-4 space-y-4">
          <Input placeholder="Modelo" />
          <Input placeholder="Número de serie" />
          <Input placeholder="Año" />
          <Button onPress={() => setShowMachineSheet(false)}>
            <Text className="text-white">Crear Máquina</Text>
          </Button>
        </View>
      </Sheet>
    </View>
  )
}
