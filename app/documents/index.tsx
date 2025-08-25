"use client"

import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native"
import { useState, useEffect } from "react"
import { router } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { Badge } from "../../components/ui/Badge"
import { Button } from "../../components/ui/Button"
import { Select } from "../../components/ui/Select"
import { useAuth } from "../../lib/auth"
import type { Document } from "../../lib/documents"

// Mock documents data
const mockDocuments: Document[] = [
  {
    id: "doc-1",
    work_order_id: "wo-1",
    type: "quote",
    title: "Cotización - Mantenimiento Preventivo",
    content: {
      items: [
        { id: "1", description: "Revisión completa del sistema", quantity: 1, unit_price: 500, total: 500 },
        { id: "2", description: "Limpieza y calibración", quantity: 1, unit_price: 300, total: 300 },
      ],
      subtotal: 800,
      tax_rate: 0.1,
      tax_amount: 80,
      total: 880,
    },
    status: "pending_signature",
    created_by: "admin-1",
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z",
  },
  {
    id: "doc-2",
    work_order_id: "wo-2",
    type: "purchase_order",
    title: "Orden de Compra - Instalación CNC",
    content: {
      items: [
        { id: "1", description: "Instalación de máquina CNC", quantity: 1, unit_price: 2500, total: 2500 },
        { id: "2", description: "Configuración inicial", quantity: 1, unit_price: 800, total: 800 },
      ],
      subtotal: 3300,
      tax_rate: 0.1,
      tax_amount: 330,
      total: 3630,
    },
    status: "signed",
    client_signature: "data:image/png;base64,signature_data",
    client_signed_at: "2024-01-16T14:30:00Z",
    created_by: "admin-1",
    created_at: "2024-01-16T09:00:00Z",
    updated_at: "2024-01-16T14:30:00Z",
  },
]

export default function DocumentsScreen() {
  const { profile } = useAuth()
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    loadDocuments()
  }, [profile])

  const loadDocuments = async () => {
    if (!profile) return

    setLoading(true)
    try {
      // For now, use mock data
      let filteredDocs = mockDocuments

      // Filter by role
      if (profile.role === "client") {
        // In real implementation, filter by client_id
        filteredDocs = mockDocuments
      }

      setDocuments(filteredDocs)
    } catch (error) {
      Alert.alert("Error", "Error al cargar los documentos")
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge variant="default" text="Borrador" />
      case "pending_signature":
        return <Badge variant="warning" text="Pendiente Firma" />
      case "signed":
        return <Badge variant="success" text="Firmado" />
      case "rejected":
        return <Badge variant="error" text="Rechazado" />
      default:
        return <Badge variant="default" text={status} />
    }
  }

  const getTypeLabel = (type: string) => {
    const types = {
      quote: "Cotización",
      purchase_order: "Orden de Compra",
      invoice: "Factura",
      report: "Reporte",
    }
    return types[type as keyof typeof types] || type
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(amount)
  }

  const filteredDocuments = documents.filter((doc) => {
    if (filter === "all") return true
    return doc.status === filter
  })

  const canCreateDocuments = profile?.role === "admin" || profile?.role === "technician"

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white p-6 border-b border-gray-100">
        <View className="flex-row justify-between items-center mb-4">
          <View>
            <Text className="text-2xl font-bold text-gray-900">Documentos</Text>
            <Text className="text-gray-600">{filteredDocuments.length} documentos encontrados</Text>
          </View>
          {canCreateDocuments && (
            <View className="flex-row space-x-2">
              <TouchableOpacity
                onPress={() => router.push("/documents/create-quote")}
                className="bg-primary-500 rounded-xl px-3 py-2 flex-row items-center"
              >
                <Ionicons name="document-text" size={16} color="white" />
                <Text className="text-white font-semibold ml-1 text-sm">Cotización</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push("/documents/create-po")}
                className="bg-success-500 rounded-xl px-3 py-2 flex-row items-center"
              >
                <Ionicons name="receipt" size={16} color="white" />
                <Text className="text-white font-semibold ml-1 text-sm">Orden</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Filter */}
        <Select
          value={filter}
          onValueChange={setFilter}
          options={[
            { label: "Todos", value: "all" },
            { label: "Borradores", value: "draft" },
            { label: "Pendientes", value: "pending_signature" },
            { label: "Firmados", value: "signed" },
            { label: "Rechazados", value: "rejected" },
          ]}
        />
      </View>

      {/* Documents List */}
      <ScrollView className="flex-1 p-6">
        <View className="space-y-4">
          {loading ? (
            <Text className="text-center text-gray-600 py-8">Cargando documentos...</Text>
          ) : filteredDocuments.length > 0 ? (
            filteredDocuments.map((document) => (
              <TouchableOpacity
                key={document.id}
                onPress={() => router.push(`/documents/${document.id}`)}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
              >
                <View className="flex-row justify-between items-start mb-3">
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-gray-900 mb-1">{document.title}</Text>
                    <Text className="text-sm text-gray-600">{getTypeLabel(document.type)}</Text>
                  </View>
                  {getStatusBadge(document.status)}
                </View>

                <View className="space-y-2">
                  <View className="flex-row justify-between">
                    <Text className="text-sm text-gray-600">Total:</Text>
                    <Text className="text-sm font-medium text-gray-900">{formatCurrency(document.content.total)}</Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-sm text-gray-600">Creado:</Text>
                    <Text className="text-sm font-medium text-gray-900">
                      {new Date(document.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                  {document.client_signed_at && (
                    <View className="flex-row justify-between">
                      <Text className="text-sm text-gray-600">Firmado:</Text>
                      <Text className="text-sm font-medium text-success-600">
                        {new Date(document.client_signed_at).toLocaleDateString()}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Action buttons for pending documents */}
                {document.status === "pending_signature" && profile?.role === "client" && (
                  <View className="flex-row space-x-2 mt-4 pt-3 border-t border-gray-100">
                    <Button
                      title="Firmar"
                      onPress={() => router.push(`/documents/${document.id}/sign`)}
                      className="flex-1 py-2"
                    />
                    <Button
                      title="Rechazar"
                      variant="outline"
                      onPress={() => {
                        Alert.alert("Confirmar", "¿Rechazar este documento?", [
                          { text: "Cancelar", style: "cancel" },
                          { text: "Rechazar", style: "destructive" },
                        ])
                      }}
                      className="flex-1 py-2 bg-transparent border-error-500"
                    />
                  </View>
                )}

                <View className="flex-row justify-end mt-2">
                  <Ionicons name="chevron-forward" size={20} color="#6b7280" />
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View className="bg-white rounded-2xl p-8 items-center">
              <Ionicons name="document-outline" size={48} color="#9ca3af" />
              <Text className="text-lg font-semibold text-gray-900 mt-4 mb-2">No hay documentos</Text>
              <Text className="text-gray-600 text-center mb-4">
                {filter === "all" ? "No se encontraron documentos" : `No hay documentos con estado "${filter}"`}
              </Text>
              {canCreateDocuments && (
                <Button title="Crear Primer Documento" onPress={() => router.push("/documents/create-quote")} />
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  )
}
