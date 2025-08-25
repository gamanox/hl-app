"use client"

import { View, Text, ScrollView, Alert } from "react-native"
import { useState, useEffect } from "react"
import { useLocalSearchParams, router } from "expo-router"
import { Card, CardContent, CardHeader } from "../../../components/ui/Card"
import { Button } from "../../../components/ui/Button"
import { SignaturePad } from "../../../components/ui/SignaturePad"
import { useAuth } from "../../../lib/auth"
import { DocumentService, type Document } from "../../../lib/documents"

// Mock document for demo
const mockDocument: Document = {
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
    notes: "Cotización válida por 30 días",
    valid_until: "2024-02-15",
  },
  status: "pending_signature",
  created_by: "admin-1",
  created_at: "2024-01-15T10:00:00Z",
  updated_at: "2024-01-15T10:00:00Z",
}

export default function SignDocumentScreen() {
  const { id } = useLocalSearchParams()
  const { profile } = useAuth()
  const [document, setDocument] = useState<Document | null>(null)
  const [signature, setSignature] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [signing, setSigning] = useState(false)

  useEffect(() => {
    loadDocument()
  }, [id])

  const loadDocument = async () => {
    setLoading(true)
    try {
      // For now, use mock data
      setDocument(mockDocument)
    } catch (error) {
      Alert.alert("Error", "Error al cargar el documento")
    } finally {
      setLoading(false)
    }
  }

  const handleSignature = (sig: string) => {
    setSignature(sig)
  }

  const handleSign = async () => {
    if (!signature) {
      Alert.alert("Error", "Por favor, proporciona tu firma")
      return
    }

    setSigning(true)
    try {
      const { data, error } = await DocumentService.signDocument(id as string, signature)

      if (error) {
        Alert.alert("Error", "Error al firmar el documento")
      } else {
        Alert.alert("Éxito", "Documento firmado exitosamente", [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ])
      }
    } catch (error) {
      Alert.alert("Error", "Error inesperado al firmar")
    } finally {
      setSigning(false)
    }
  }

  const handleReject = () => {
    Alert.alert("Rechazar Documento", "¿Estás seguro de que quieres rechazar este documento?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Rechazar",
        style: "destructive",
        onPress: async () => {
          try {
            await DocumentService.rejectDocument(id as string, "Rechazado por el cliente")
            Alert.alert("Documento Rechazado", "El documento ha sido rechazado", [
              {
                text: "OK",
                onPress: () => router.back(),
              },
            ])
          } catch (error) {
            Alert.alert("Error", "Error al rechazar el documento")
          }
        },
      },
    ])
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(amount)
  }

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-lg text-gray-600">Cargando documento...</Text>
      </View>
    )
  }

  if (!document) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-lg text-gray-900">Documento no encontrado</Text>
        <Button title="Volver" onPress={() => router.back()} className="mt-4" />
      </View>
    )
  }

  if (profile?.role !== "client") {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-lg text-gray-900">Solo los clientes pueden firmar documentos</Text>
        <Button title="Volver" onPress={() => router.back()} className="mt-4" />
      </View>
    )
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-6 space-y-6">
        {/* Document Header */}
        <Card>
          <CardHeader>
            <Text className="text-xl font-bold text-gray-900">{document.title}</Text>
            <Text className="text-gray-600">Revisa los detalles y firma para aprobar</Text>
          </CardHeader>
        </Card>

        {/* Document Content */}
        <Card>
          <CardHeader>
            <Text className="text-lg font-semibold text-gray-900">Detalles del Servicio</Text>
          </CardHeader>

          <CardContent className="space-y-4">
            {document.content.items.map((item: any, index: number) => (
              <View key={item.id} className="bg-gray-50 rounded-xl p-4">
                <Text className="font-medium text-gray-900 mb-2">{item.description}</Text>
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">
                    {item.quantity} x {formatCurrency(item.unit_price)}
                  </Text>
                  <Text className="font-medium text-gray-900">{formatCurrency(item.total)}</Text>
                </View>
              </View>
            ))}

            <View className="pt-4 border-t border-gray-200 space-y-2">
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Subtotal:</Text>
                <Text className="font-medium text-gray-900">{formatCurrency(document.content.subtotal)}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Impuestos ({(document.content.tax_rate * 100).toFixed(0)}%):</Text>
                <Text className="font-medium text-gray-900">{formatCurrency(document.content.tax_amount)}</Text>
              </View>
              <View className="flex-row justify-between pt-2 border-t border-gray-200">
                <Text className="text-lg font-bold text-gray-900">Total:</Text>
                <Text className="text-lg font-bold text-primary-600">{formatCurrency(document.content.total)}</Text>
              </View>
            </View>

            {document.content.notes && (
              <View className="pt-4 border-t border-gray-200">
                <Text className="text-sm font-medium text-gray-700 mb-2">Notas:</Text>
                <Text className="text-gray-600">{document.content.notes}</Text>
              </View>
            )}

            {document.content.valid_until && (
              <View className="bg-warning-50 rounded-xl p-3">
                <Text className="text-warning-800 font-medium">
                  Válida hasta: {new Date(document.content.valid_until).toLocaleDateString()}
                </Text>
              </View>
            )}
          </CardContent>
        </Card>

        {/* Signature Section */}
        <Card>
          <CardContent>
            <SignaturePad
              onSignature={handleSignature}
              title="Firma Digital"
              description="Firma aquí para aprobar este documento. Tu firma será legalmente vinculante."
            />
          </CardContent>
        </Card>

        {/* Legal Notice */}
        <Card className="bg-gray-50">
          <CardContent>
            <Text className="text-sm text-gray-600 leading-5">
              Al firmar este documento, confirmas que has revisado todos los detalles y aceptas los términos y
              condiciones del servicio. Esta firma digital tiene la misma validez legal que una firma manuscrita.
            </Text>
          </CardContent>
        </Card>

        {/* Actions */}
        <View className="flex-row space-x-3">
          <Button title="Rechazar" variant="outline" onPress={handleReject} className="flex-1 bg-transparent" />
          <Button
            title={signing ? "Firmando..." : "Firmar y Aprobar"}
            onPress={handleSign}
            disabled={!signature || signing}
            className="flex-1"
          />
        </View>
      </View>
    </ScrollView>
  )
}
