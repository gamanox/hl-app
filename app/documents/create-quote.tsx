"use client"

import { View, Text, ScrollView, Alert, TouchableOpacity } from "react-native"
import { useState, useEffect } from "react"
import { router } from "expo-router"
import { useForm, Controller, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Ionicons } from "@expo/vector-icons"
import { Card, CardContent, CardHeader } from "../../components/ui/Card"
import { Input } from "../../components/ui/Input"
import { Button } from "../../components/ui/Button"
import { Select } from "../../components/ui/Select"
import { useAuth } from "../../lib/auth"
import { DocumentService, type DocumentItem } from "../../lib/documents"
import { mockWorkOrders } from "../../lib/mock-data"

const quoteSchema = z.object({
  workOrderId: z.string().min(1, "Selecciona una orden de trabajo"),
  items: z
    .array(
      z.object({
        description: z.string().min(1, "Descripción requerida"),
        quantity: z.number().min(1, "Cantidad debe ser mayor a 0"),
        unitPrice: z.number().min(0, "Precio debe ser mayor o igual a 0"),
      }),
    )
    .min(1, "Agrega al menos un item"),
  taxRate: z.number().min(0).max(1),
  notes: z.string().optional(),
  validUntil: z.string().min(1, "Fecha de validez requerida"),
})

type QuoteForm = z.infer<typeof quoteSchema>

export default function CreateQuoteScreen() {
  const { profile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [availableOrders, setAvailableOrders] = useState<any[]>([])

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<QuoteForm>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      workOrderId: "",
      items: [{ description: "", quantity: 1, unitPrice: 0 }],
      taxRate: 0.1,
      notes: "",
      validUntil: "",
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  })

  const watchedItems = watch("items")
  const watchedTaxRate = watch("taxRate")

  useEffect(() => {
    loadAvailableOrders()
  }, [])

  const loadAvailableOrders = async () => {
    try {
      // For now, use mock data
      setAvailableOrders(mockWorkOrders)
    } catch (error) {
      Alert.alert("Error", "Error al cargar las órdenes")
    }
  }

  const calculateTotals = () => {
    const items: DocumentItem[] = watchedItems.map((item, index) => ({
      id: index.toString(),
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      total: item.quantity * item.unitPrice,
    }))

    return DocumentService.calculateTotals(items, watchedTaxRate)
  }

  const totals = calculateTotals()

  const onSubmit = async (data: QuoteForm) => {
    setLoading(true)
    try {
      const items: DocumentItem[] = data.items.map((item, index) => ({
        id: index.toString(),
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total: item.quantity * item.unitPrice,
      }))

      const quoteData = {
        work_order_id: data.workOrderId,
        client_id: "client-1", // Get from work order
        items,
        subtotal: totals.subtotal,
        tax_rate: data.taxRate,
        tax_amount: totals.taxAmount,
        total: totals.total,
        notes: data.notes,
        valid_until: data.validUntil,
      }

      const { data: document, error } = await DocumentService.createQuote(quoteData)

      if (error) {
        Alert.alert("Error", "Error al crear la cotización")
      } else {
        Alert.alert("Éxito", "Cotización creada exitosamente", [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ])
      }
    } catch (error) {
      Alert.alert("Error", "Error inesperado al crear la cotización")
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(amount)
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-6 space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <Text className="text-xl font-bold text-gray-900">Nueva Cotización</Text>
            <Text className="text-gray-600">Crea una cotización para enviar al cliente</Text>
          </CardHeader>

          <CardContent className="space-y-4">
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">Orden de Trabajo</Text>
              <Controller
                control={control}
                name="workOrderId"
                render={({ field: { onChange, value } }) => (
                  <Select
                    value={value}
                    onValueChange={onChange}
                    placeholder="Seleccionar orden..."
                    options={availableOrders.map((order) => ({
                      label: `${order.title} - ${order.type}`,
                      value: order.id,
                    }))}
                  />
                )}
              />
              {errors.workOrderId && <Text className="text-error-500 text-sm mt-1">{errors.workOrderId.message}</Text>}
            </View>

            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">Válida Hasta</Text>
              <Controller
                control={control}
                name="validUntil"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input placeholder="YYYY-MM-DD" value={value} onChangeText={onChange} onBlur={onBlur} />
                )}
              />
              {errors.validUntil && <Text className="text-error-500 text-sm mt-1">{errors.validUntil.message}</Text>}
            </View>
          </CardContent>
        </Card>

        {/* Items */}
        <Card>
          <CardHeader>
            <View className="flex-row justify-between items-center">
              <Text className="text-lg font-semibold text-gray-900">Items</Text>
              <TouchableOpacity
                onPress={() => append({ description: "", quantity: 1, unitPrice: 0 })}
                className="bg-primary-500 rounded-lg px-3 py-1 flex-row items-center"
              >
                <Ionicons name="add" size={16} color="white" />
                <Text className="text-white font-medium ml-1">Agregar</Text>
              </TouchableOpacity>
            </View>
          </CardHeader>

          <CardContent className="space-y-4">
            {fields.map((field, index) => (
              <View key={field.id} className="bg-gray-50 rounded-xl p-4">
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="font-medium text-gray-900">Item {index + 1}</Text>
                  {fields.length > 1 && (
                    <TouchableOpacity onPress={() => remove(index)} className="bg-error-500 rounded-lg p-1">
                      <Ionicons name="trash" size={16} color="white" />
                    </TouchableOpacity>
                  )}
                </View>

                <View className="space-y-3">
                  <View>
                    <Text className="text-sm font-medium text-gray-700 mb-1">Descripción</Text>
                    <Controller
                      control={control}
                      name={`items.${index}.description`}
                      render={({ field: { onChange, onBlur, value } }) => (
                        <Input
                          placeholder="Descripción del servicio..."
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                        />
                      )}
                    />
                  </View>

                  <View className="flex-row space-x-3">
                    <View className="flex-1">
                      <Text className="text-sm font-medium text-gray-700 mb-1">Cantidad</Text>
                      <Controller
                        control={control}
                        name={`items.${index}.quantity`}
                        render={({ field: { onChange, onBlur, value } }) => (
                          <Input
                            placeholder="1"
                            value={value.toString()}
                            onChangeText={(text) => onChange(Number(text) || 0)}
                            onBlur={onBlur}
                            keyboardType="numeric"
                          />
                        )}
                      />
                    </View>

                    <View className="flex-1">
                      <Text className="text-sm font-medium text-gray-700 mb-1">Precio Unitario</Text>
                      <Controller
                        control={control}
                        name={`items.${index}.unitPrice`}
                        render={({ field: { onChange, onBlur, value } }) => (
                          <Input
                            placeholder="0.00"
                            value={value.toString()}
                            onChangeText={(text) => onChange(Number(text) || 0)}
                            onBlur={onBlur}
                            keyboardType="numeric"
                          />
                        )}
                      />
                    </View>
                  </View>

                  <View className="flex-row justify-between items-center pt-2 border-t border-gray-200">
                    <Text className="text-sm text-gray-600">Total:</Text>
                    <Text className="font-semibold text-gray-900">
                      {formatCurrency((watchedItems[index]?.quantity || 0) * (watchedItems[index]?.unitPrice || 0))}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </CardContent>
        </Card>

        {/* Totals */}
        <Card>
          <CardHeader>
            <Text className="text-lg font-semibold text-gray-900">Resumen</Text>
          </CardHeader>

          <CardContent className="space-y-3">
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Subtotal:</Text>
              <Text className="font-medium text-gray-900">{formatCurrency(totals.subtotal)}</Text>
            </View>

            <View className="flex-row justify-between items-center">
              <Text className="text-gray-600">Impuestos:</Text>
              <View className="flex-row items-center space-x-2">
                <Controller
                  control={control}
                  name="taxRate"
                  render={({ field: { onChange, value } }) => (
                    <Input
                      value={(value * 100).toString()}
                      onChangeText={(text) => onChange(Number(text) / 100 || 0)}
                      keyboardType="numeric"
                      className="w-16 text-center"
                    />
                  )}
                />
                <Text className="text-gray-600">% = {formatCurrency(totals.taxAmount)}</Text>
              </View>
            </View>

            <View className="flex-row justify-between pt-3 border-t border-gray-200">
              <Text className="text-lg font-bold text-gray-900">Total:</Text>
              <Text className="text-lg font-bold text-primary-600">{formatCurrency(totals.total)}</Text>
            </View>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <Text className="text-lg font-semibold text-gray-900">Notas (Opcional)</Text>
          </CardHeader>

          <CardContent>
            <Controller
              control={control}
              name="notes"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="Notas adicionales para el cliente..."
                  value={value || ""}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  multiline
                  numberOfLines={3}
                />
              )}
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <View className="flex-row space-x-3">
          <Button title="Cancelar" variant="outline" onPress={() => router.back()} className="flex-1 bg-transparent" />
          <Button
            title={loading ? "Creando..." : "Crear Cotización"}
            onPress={handleSubmit(onSubmit)}
            disabled={loading}
            className="flex-1"
          />
        </View>
      </View>
    </ScrollView>
  )
}
