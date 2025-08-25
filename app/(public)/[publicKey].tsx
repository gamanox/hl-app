"use client"

import { useState, useEffect } from "react"
import { View, Text, ScrollView, Alert, Linking } from "react-native"
import { useLocalSearchParams, router } from "expo-router"
import {
  CalendarDays,
  FileText,
  Download,
  PenTool,
  Clock,
  CheckCircle,
  AlertCircle,
  MapPin,
  User,
  Wrench,
} from "lucide-react-native"

import { Button } from "../../components/ui/Button"
import { Card } from "../../components/ui/Card"
import { Badge } from "../../components/ui/Badge"
import { SignatureDialog } from "../../components/parts/SignatureDialog"
import type { WorkOrder, Session, Document } from "../../lib/zod-schemas"

interface PublicWorkOrderData {
  workOrder: WorkOrder
  upcomingSessions: Session[]
  pendingDocuments: Document[]
  activityTimeline: Array<{
    id: string
    type: "status_change" | "session_completed" | "document_signed" | "appointment_scheduled"
    title: string
    description: string
    timestamp: string
    visible_to_client: boolean
  }>
}

export default function PublicPortalPage() {
  const { publicKey } = useLocalSearchParams<{ publicKey: string }>()
  const [data, setData] = useState<PublicWorkOrderData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [signatureDialogOpen, setSignatureDialogOpen] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)

  useEffect(() => {
    if (publicKey) {
      loadPublicData()
    }
  }, [publicKey])

  const loadPublicData = async () => {
    try {
      setLoading(true)
      setError(null)

      // TODO: Replace with actual Supabase query using public key
      // const { data: publicData, error } = await supabase
      //   .from('work_orders')
      //   .select(`
      //     *,
      //     sessions(*),
      //     documents(*),
      //     activity_logs(*)
      //   `)
      //   .eq('public_key', publicKey)
      //   .eq('is_public_accessible', true)
      //   .single();

      // Mock data for development
      const mockData: PublicWorkOrderData = {
        workOrder: {
          id: "WO-2024-001",
          type: "Preventive",
          status: "in_progress",
          priority: "normal",
          estimated_date: new Date("2024-01-15"),
          estimated_duration: 4,
          assigned_to: [{ id: "1", name: "Juan Pérez", role: "technician" }],
          created_by: "customer",
          customer_id: "cust-001",
          machine_id: "mach-001",
          sessions: [],
          parts: [],
          quotes: [],
          purchase_orders: [],
          invoices: [],
        },
        upcomingSessions: [
          {
            id: "sess-001",
            work_order_id: "WO-2024-001",
            technician_id: "tech-001",
            scheduled_start: new Date("2024-01-15T09:00:00"),
            estimated_duration: 4,
            status: "scheduled",
            notes: "",
            photos: [],
            geofence_enabled: true,
          },
        ],
        pendingDocuments: [
          {
            id: "doc-001",
            work_order_id: "WO-2024-001",
            type: "quote",
            number: "Q-2024-001",
            status: "pending_signature",
            total: 1250.0,
            pdf_url: "/mock-quote.pdf",
            client_signature: null,
            created_at: new Date("2024-01-10"),
            items: [],
          },
        ],
        activityTimeline: [
          {
            id: "1",
            type: "status_change",
            title: "Orden de trabajo creada",
            description: "Su solicitud de mantenimiento preventivo ha sido registrada",
            timestamp: "2024-01-10T10:00:00Z",
            visible_to_client: true,
          },
          {
            id: "2",
            type: "appointment_scheduled",
            title: "Cita programada",
            description: "Técnico Juan Pérez asignado para el 15 de enero a las 9:00 AM",
            timestamp: "2024-01-12T14:30:00Z",
            visible_to_client: true,
          },
          {
            id: "3",
            type: "document_signed",
            title: "Cotización generada",
            description: "Cotización Q-2024-001 lista para revisión y firma",
            timestamp: "2024-01-13T11:15:00Z",
            visible_to_client: true,
          },
        ],
      }

      setData(mockData)
    } catch (err) {
      console.error("Error loading public data:", err)
      setError("No se pudo cargar la información de la orden")
    } finally {
      setLoading(false)
    }
  }

  const handleSignDocument = (document: Document) => {
    setSelectedDocument(document)
    setSignatureDialogOpen(true)
  }

  const handleSignatureComplete = async (signatureData: string) => {
    if (!selectedDocument) return

    try {
      // TODO: Replace with actual Supabase update
      // await supabase
      //   .from('documents')
      //   .update({
      //     client_signature: signatureData,
      //     status: 'signed',
      //     signed_at: new Date().toISOString()
      //   })
      //   .eq('id', selectedDocument.id);

      console.log("[v0] Document signed:", selectedDocument.id)
      Alert.alert("Éxito", "Documento firmado correctamente")

      // Refresh data
      await loadPublicData()
      setSignatureDialogOpen(false)
      setSelectedDocument(null)
    } catch (error) {
      console.error("Error signing document:", error)
      Alert.alert("Error", "No se pudo firmar el documento")
    }
  }

  const handleDownloadPDF = async (document: Document) => {
    try {
      // TODO: Implement actual PDF download
      // For web: window.open(document.pdf_url)
      // For mobile: use expo-file-system and expo-sharing

      if (document.pdf_url) {
        await Linking.openURL(document.pdf_url)
      }
    } catch (error) {
      console.error("Error downloading PDF:", error)
      Alert.alert("Error", "No se pudo descargar el documento")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "archived":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low":
        return "bg-green-100 text-green-800"
      case "normal":
        return "bg-blue-100 text-blue-800"
      case "high":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "status_change":
        return <CheckCircle size={16} className="text-green-600" />
      case "session_completed":
        return <Wrench size={16} className="text-blue-600" />
      case "document_signed":
        return <FileText size={16} className="text-purple-600" />
      case "appointment_scheduled":
        return <CalendarDays size={16} className="text-orange-600" />
      default:
        return <Clock size={16} className="text-gray-600" />
    }
  }

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-lg text-gray-600">Cargando información...</Text>
      </View>
    )
  }

  if (error || !data) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 p-6">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <Text className="text-xl font-semibold text-gray-900 mb-2">Orden no encontrada</Text>
        <Text className="text-gray-600 text-center mb-6">
          {error || "La orden de trabajo no existe o no está disponible públicamente"}
        </Text>
        <Button onPress={() => router.back()} variant="outline">
          Volver
        </Button>
      </View>
    )
  }

  const { workOrder, upcomingSessions, pendingDocuments, activityTimeline } = data

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-6 py-8">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-2xl font-bold text-gray-900">{workOrder.id}</Text>
          <View className="flex-row gap-2">
            <Badge className={getPriorityColor(workOrder.priority)}>
              {workOrder.priority === "low" ? "Baja" : workOrder.priority === "normal" ? "Normal" : "Alta"}
            </Badge>
            <Badge className={getStatusColor(workOrder.status)}>
              {workOrder.status === "pending"
                ? "Pendiente"
                : workOrder.status === "in_progress"
                  ? "En Progreso"
                  : workOrder.status === "completed"
                    ? "Completada"
                    : "Archivada"}
            </Badge>
          </View>
        </View>

        <Text className="text-lg text-gray-700 mb-2">
          Servicio: {workOrder.type === "Preventive" ? "Mantenimiento Preventivo" : workOrder.type}
        </Text>

        {workOrder.assigned_to.length > 0 && (
          <View className="flex-row items-center">
            <User size={16} className="text-gray-500 mr-2" />
            <Text className="text-gray-600">Técnico: {workOrder.assigned_to[0].name}</Text>
          </View>
        )}
      </View>

      <View className="p-6 space-y-6">
        {/* Upcoming Appointments */}
        {upcomingSessions.length > 0 && (
          <Card className="p-6">
            <View className="flex-row items-center mb-4">
              <CalendarDays size={20} className="text-blue-600 mr-2" />
              <Text className="text-lg font-semibold text-gray-900">Próximas Citas</Text>
            </View>

            {upcomingSessions.map((session) => (
              <View key={session.id} className="bg-blue-50 rounded-lg p-4">
                <Text className="font-medium text-gray-900 mb-1">{formatDate(session.scheduled_start)}</Text>
                <Text className="text-gray-600 mb-2">Duración estimada: {session.estimated_duration} horas</Text>
                {session.geofence_enabled && (
                  <View className="flex-row items-center">
                    <MapPin size={14} className="text-green-600 mr-1" />
                    <Text className="text-sm text-green-700">Verificación de ubicación habilitada</Text>
                  </View>
                )}
              </View>
            ))}
          </Card>
        )}

        {/* Pending Documents */}
        {pendingDocuments.length > 0 && (
          <Card className="p-6">
            <View className="flex-row items-center mb-4">
              <FileText size={20} className="text-purple-600 mr-2" />
              <Text className="text-lg font-semibold text-gray-900">Documentos Pendientes</Text>
            </View>

            {pendingDocuments.map((document) => (
              <View key={document.id} className="border border-gray-200 rounded-lg p-4 mb-3 last:mb-0">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="font-medium text-gray-900">
                    {document.type === "quote"
                      ? "Cotización"
                      : document.type === "purchase_order"
                        ? "Orden de Compra"
                        : "Factura"}{" "}
                    {document.number}
                  </Text>
                  <Text className="text-lg font-semibold text-gray-900">${document.total.toLocaleString()}</Text>
                </View>

                <Badge className="bg-yellow-100 text-yellow-800 mb-3">
                  {document.status === "pending_signature"
                    ? "Pendiente de Firma"
                    : document.status === "signed"
                      ? "Firmado"
                      : "Borrador"}
                </Badge>

                <View className="flex-row gap-2">
                  <Button onPress={() => handleDownloadPDF(document)} variant="outline" size="sm" className="flex-1">
                    <Download size={16} className="mr-2" />
                    Descargar PDF
                  </Button>

                  {document.status === "pending_signature" && (
                    <Button onPress={() => handleSignDocument(document)} size="sm" className="flex-1">
                      <PenTool size={16} className="mr-2" />
                      Firmar
                    </Button>
                  )}
                </View>
              </View>
            ))}
          </Card>
        )}

        {/* Activity Timeline */}
        <Card className="p-6">
          <View className="flex-row items-center mb-4">
            <Clock size={20} className="text-gray-600 mr-2" />
            <Text className="text-lg font-semibold text-gray-900">Historial de Actividades</Text>
          </View>

          <View className="space-y-4">
            {activityTimeline
              .filter((activity) => activity.visible_to_client)
              .map((activity, index) => (
                <View key={activity.id} className="flex-row">
                  <View className="flex-col items-center mr-4">
                    <View className="w-8 h-8 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center">
                      {getActivityIcon(activity.type)}
                    </View>
                    {index < activityTimeline.length - 1 && <View className="w-0.5 h-8 bg-gray-300 mt-2" />}
                  </View>

                  <View className="flex-1 pb-4">
                    <Text className="font-medium text-gray-900 mb-1">{activity.title}</Text>
                    <Text className="text-gray-600 mb-2">{activity.description}</Text>
                    <Text className="text-sm text-gray-500">
                      {new Intl.DateTimeFormat("es-ES", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }).format(new Date(activity.timestamp))}
                    </Text>
                  </View>
                </View>
              ))}
          </View>
        </Card>
      </View>

      {/* Signature Dialog */}
      <SignatureDialog
        isOpen={signatureDialogOpen}
        onClose={() => {
          setSignatureDialogOpen(false)
          setSelectedDocument(null)
        }}
        onSignatureComplete={handleSignatureComplete}
        document={selectedDocument}
      />
    </ScrollView>
  )
}
