"use client"

import { useState, useEffect } from "react"
import { View, ScrollView, Alert } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import {
  VStack,
  HStack,
  Text,
  Button,
  ButtonText,
  Heading,
  Box,
  Pressable,
  Input,
  InputField,
  Spinner,
} from "@gluestack-ui/themed"
import { Badge } from "../../../components/ui/Badge"
import { Card } from "../../../components/ui/Card"
import { Sheet } from "../../../components/ui/Sheet"
import PartsCatalog from "../../../components/parts/PartsCatalog"
import OrderPartsList from "../../../components/parts/OrderPartsList"
import SignatureDialog from "../../../components/parts/SignatureDialog"
import { useAuth } from "../../../lib/auth"
import { workOrderService } from "../../../lib/work-orders"
import { sessionService } from "../../../lib/sessions"
import { supabase } from "../../../lib/supabase"
import type { WorkOrder, Session, ParteLinea, Quote, PO } from "../../../lib/zod-schemas"

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "sessions", label: "Sesiones" },
  { id: "parts", label: "Partes" },
  { id: "documents", label: "Documentos" },
  { id: "history", label: "Historial" },
]

const STATUS_COLORS = {
  pending: "warning",
  in_progress: "info",
  done: "success",
  archived: "muted",
} as const

const PRIORITY_COLORS = {
  low: "success",
  normal: "info",
  high: "warning",
} as const

export default function WorkOrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { user } = useAuth()

  const [activeTab, setActiveTab] = useState("overview")
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [parts, setParts] = useState<ParteLinea[]>([])
  const [documents, setDocuments] = useState<(Quote | PO)[]>([])
  const [loading, setLoading] = useState(true)
  const [activeSession, setActiveSession] = useState<Session | null>(null)

  // Sheet states
  const [showEditPart, setShowEditPart] = useState(false)
  const [showSignature, setShowSignature] = useState(false)
  const [showPartsCatalog, setShowPartsCatalog] = useState(false)
  const [showSignatureDialog, setShowSignatureDialog] = useState(false)
  const [editingPart, setEditingPart] = useState<ParteLinea | null>(null)
  const [signingDocument, setSigningDocument] = useState<Quote | PO | null>(null)

  useEffect(() => {
    loadWorkOrderData()
  }, [id])

  const loadWorkOrderData = async () => {
    if (!id) return

    try {
      setLoading(true)
      const [orderData, sessionsData, partsData, docsData] = await Promise.all([
        workOrderService.getById(id),
        sessionService.getByWorkOrderId(id),
        supabase.getWorkOrderParts(id),
        supabase.getWorkOrderDocuments(id),
      ])

      setWorkOrder(orderData)
      setSessions(sessionsData)
      setParts(partsData)
      setDocuments(docsData)

      // Find active session
      const active = sessionsData.find((s) => !s.finishedAt)
      setActiveSession(active || null)
    } catch (error) {
      console.error("Error loading work order:", error)
      Alert.alert("Error", "Failed to load work order data")
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: WorkOrder["estado"]) => {
    if (!workOrder) return

    try {
      await workOrderService.updateStatus(workOrder.id, newStatus)
      setWorkOrder({ ...workOrder, estado: newStatus })
    } catch (error) {
      Alert.alert("Error", "Failed to update status")
    }
  }

  const handleStartSession = async () => {
    if (!workOrder || activeSession) return

    try {
      const newSession = await sessionService.start({
        workOrderId: workOrder.id,
        technicianId: user?.id || "",
        startedAt: new Date(),
        notas: "",
        fotos: [],
        geofence: true,
      })

      setActiveSession(newSession)
      setSessions([newSession, ...sessions])
    } catch (error) {
      Alert.alert("Error", "Failed to start session")
    }
  }

  const handlePauseSession = async () => {
    if (!activeSession) return

    try {
      const updatedSession = await sessionService.pause(activeSession.id)
      setActiveSession(updatedSession)
      setSessions(sessions.map((s) => (s.id === activeSession.id ? updatedSession : s)))
    } catch (error) {
      Alert.alert("Error", "Failed to pause session")
    }
  }

  const handleFinishSession = async () => {
    if (!activeSession) return

    try {
      const finishedSession = await sessionService.finish(activeSession.id)
      setActiveSession(null)
      setSessions(sessions.map((s) => (s.id === activeSession.id ? finishedSession : s)))
    } catch (error) {
      Alert.alert("Error", "Failed to finish session")
    }
  }

  const handleAddPart = () => {
    setEditingPart({
      partId: "",
      nombre: "",
      qty: 1,
      costoEstimado: 0,
    })
    setShowEditPart(true)
  }

  const handleEditPart = (part: ParteLinea) => {
    setEditingPart(part)
    setShowEditPart(true)
  }

  const handleSavePart = async (partData: ParteLinea) => {
    try {
      if (editingPart?.partId) {
        // Update existing part
        await supabase.updateWorkOrderPart(workOrder!.id, partData)
        setParts(parts.map((p) => (p.partId === partData.partId ? partData : p)))
      } else {
        // Add new part
        await supabase.addPartToOrder(workOrder!.id, partData)
        setParts([...parts, partData])
      }
      setShowEditPart(false)
      setEditingPart(null)
    } catch (error) {
      Alert.alert("Error", "Failed to save part")
    }
  }

  const handleAddPartFromCatalog = (part: any, quantity: number) => {
    const newPart: ParteLinea = {
      partId: part.id,
      nombre: part.name,
      qty: quantity,
      costoEstimado: part.cost,
    }
    setParts([...parts, newPart])
    setShowPartsCatalog(false)
  }

  const handleUpdatePart = (index: number, updates: Partial<ParteLinea>) => {
    const updatedParts = [...parts]
    updatedParts[index] = { ...updatedParts[index], ...updates }
    setParts(updatedParts)
  }

  const handleRemovePart = (index: number) => {
    setParts(parts.filter((_, i) => i !== index))
  }

  const handleGenerateQuote = async () => {
    if (!workOrder) return

    try {
      const quote = await supabase.generateQuote(workOrder.id, parts)
      setDocuments([...documents, quote])
      Alert.alert("Success", "Quote generated successfully")
    } catch (error) {
      Alert.alert("Error", "Failed to generate quote")
    }
  }

  const handleGenerateQuoteFromParts = async () => {
    if (!workOrder || parts.length === 0) return

    try {
      const quote = await supabase.generateQuote(workOrder.id, parts)
      setDocuments([...documents, quote])
      Alert.alert("Éxito", "Cotización generada correctamente")
    } catch (error) {
      Alert.alert("Error", "No se pudo generar la cotización")
    }
  }

  const handleGeneratePOFromParts = async () => {
    if (!workOrder || parts.length === 0) return

    try {
      // First generate a quote, then convert to PO
      const quote = await supabase.generateQuote(workOrder.id, parts)
      const po = await supabase.generatePO(quote.id)
      setDocuments([...documents, po])
      Alert.alert("Éxito", "Orden de compra generada correctamente")
    } catch (error) {
      Alert.alert("Error", "No se pudo generar la orden de compra")
    }
  }

  const handleSignDocument = (document: Quote | PO) => {
    setSigningDocument(document)
    setShowSignature(true)
  }

  const handleSignDocumentFromDialog = async (signature: string) => {
    if (!signingDocument) return

    try {
      await supabase.signDocument(signingDocument.id, signature)
      setDocuments(
        documents.map((d) => (d.id === signingDocument.id ? { ...d, firmaCliente: signature, status: "signed" } : d)),
      )
      Alert.alert("Éxito", "Documento firmado correctamente")
    } catch (error) {
      Alert.alert("Error", "No se pudo guardar la firma")
    }
  }

  const handleSaveSignature = async (signature: string) => {
    if (!signingDocument) return

    try {
      await supabase.signDocument(signingDocument.id, signature)
      setDocuments(
        documents.map((d) => (d.id === signingDocument.id ? { ...d, firmaCliente: signature, status: "signed" } : d)),
      )
      setShowSignature(false)
      setSigningDocument(null)
      Alert.alert("Success", "Document signed successfully")
    } catch (error) {
      Alert.alert("Error", "Failed to save signature")
    }
  }

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Spinner size="large" />
      </View>
    )
  }

  if (!workOrder) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-lg text-center">Work order not found</Text>
        <Button onPress={() => router.back()} className="mt-4">
          <ButtonText>Go Back</ButtonText>
        </Button>
      </View>
    )
  }

  const renderHeader = () => (
    <Card className="m-4 p-4">
      <VStack space="md">
        <HStack className="justify-between items-start">
          <VStack space="xs" className="flex-1">
            <Heading size="lg">{workOrder.id}</Heading>
            <HStack space="sm" className="items-center">
              <Badge variant={STATUS_COLORS[workOrder.estado]}>
                {workOrder.estado.replace("_", " ").toUpperCase()}
              </Badge>
              <Badge variant={PRIORITY_COLORS[workOrder.prioridad]}>{workOrder.prioridad.toUpperCase()}</Badge>
            </HStack>
            <Text className="text-sm text-gray-600">
              Estimated: {new Date(workOrder.fecha_estimada).toLocaleDateString()}
            </Text>
          </VStack>

          {user?.rol === "admin" && (
            <VStack space="xs">
              <Button size="sm" onPress={() => router.push(`/work-orders/${id}/edit`)}>
                <ButtonText>Edit</ButtonText>
              </Button>
              <Button size="sm" variant="outline">
                <ButtonText>Generate PDF</ButtonText>
              </Button>
              {workOrder.estado !== "done" && (
                <Button size="sm" variant="solid" onPress={() => handleStatusChange("done")}>
                  <ButtonText>Close Order</ButtonText>
                </Button>
              )}
            </VStack>
          )}
        </HStack>
      </VStack>
    </Card>
  )

  const renderTabs = () => (
    <HStack className="px-4 border-b border-gray-200">
      {TABS.map((tab) => (
        <Pressable
          key={tab.id}
          onPress={() => setActiveTab(tab.id)}
          className={`px-4 py-3 border-b-2 ${activeTab === tab.id ? "border-blue-500" : "border-transparent"}`}
        >
          <Text className={`font-medium ${activeTab === tab.id ? "text-blue-600" : "text-gray-600"}`}>{tab.label}</Text>
        </Pressable>
      ))}
    </HStack>
  )

  const renderOverview = () => (
    <ScrollView className="flex-1 p-4">
      <VStack space="lg">
        <Card className="p-4">
          <Heading size="md" className="mb-3">
            Client & Machine
          </Heading>
          <VStack space="sm">
            <Text>
              <Text className="font-semibold">Client:</Text> {workOrder.clienteId}
            </Text>
            <Text>
              <Text className="font-semibold">Machine:</Text> {workOrder.maquinaId}
            </Text>
            <Text>
              <Text className="font-semibold">Type:</Text> {workOrder.tipo}
            </Text>
            <Text>
              <Text className="font-semibold">Duration:</Text> {workOrder.duracion_estimada}h
            </Text>
          </VStack>
        </Card>

        <Card className="p-4">
          <Heading size="md" className="mb-3">
            Location
          </Heading>
          <Box className="h-48 bg-gray-100 rounded-lg justify-center items-center">
            <Text className="text-gray-500">Map Placeholder</Text>
          </Box>
        </Card>

        <Card className="p-4">
          <Heading size="md" className="mb-3">
            Service Checklist
          </Heading>
          <VStack space="sm">
            <HStack className="items-center" space="sm">
              <Box className="w-4 h-4 border border-gray-300 rounded" />
              <Text>Initial inspection completed</Text>
            </HStack>
            <HStack className="items-center" space="sm">
              <Box className="w-4 h-4 border border-gray-300 rounded" />
              <Text>Parts inventory checked</Text>
            </HStack>
            <HStack className="items-center" space="sm">
              <Box className="w-4 h-4 border border-gray-300 rounded" />
              <Text>Service documentation updated</Text>
            </HStack>
          </VStack>
        </Card>
      </VStack>
    </ScrollView>
  )

  const renderSessions = () => (
    <ScrollView className="flex-1 p-4">
      <VStack space="lg">
        <Card className="p-4">
          <HStack className="justify-between items-center mb-4">
            <Heading size="md">Sessions</Heading>
            {!activeSession && user?.rol !== "cliente" && (
              <Button onPress={handleStartSession}>
                <ButtonText>Start New Session</ButtonText>
              </Button>
            )}
          </HStack>

          {activeSession && (
            <Card className="p-3 bg-blue-50 mb-4">
              <VStack space="sm">
                <Text className="font-semibold text-blue-800">Active Session</Text>
                <Text className="text-sm">Started: {new Date(activeSession.startedAt).toLocaleString()}</Text>
                <HStack space="sm">
                  <Button size="sm" onPress={handlePauseSession}>
                    <ButtonText>Pause</ButtonText>
                  </Button>
                  <Button size="sm" variant="solid" onPress={handleFinishSession}>
                    <ButtonText>Finish</ButtonText>
                  </Button>
                </HStack>
              </VStack>
            </Card>
          )}

          <VStack space="sm">
            {sessions.map((session) => (
              <Card key={session.id} className="p-3">
                <VStack space="xs">
                  <HStack className="justify-between">
                    <Text className="font-medium">{new Date(session.startedAt).toLocaleDateString()}</Text>
                    <Badge variant={session.finishedAt ? "success" : "warning"}>
                      {session.finishedAt ? "Completed" : "In Progress"}
                    </Badge>
                  </HStack>
                  <Text className="text-sm text-gray-600">
                    {new Date(session.startedAt).toLocaleTimeString()} -{" "}
                    {session.finishedAt ? new Date(session.finishedAt).toLocaleTimeString() : "Ongoing"}
                  </Text>
                  {session.notas && <Text className="text-sm">{session.notas}</Text>}
                </VStack>
              </Card>
            ))}
          </VStack>
        </Card>
      </VStack>
    </ScrollView>
  )

  const renderParts = () => (
    <ScrollView className="flex-1 p-4">
      <VStack space="lg">
        <Card className="p-4">
          <HStack className="justify-between items-center mb-4">
            <Heading size="md">Partes de esta Orden</Heading>
            {user?.rol !== "cliente" && (
              <HStack space="sm">
                <Button variant="outline" onPress={() => setShowPartsCatalog(true)} className="bg-transparent">
                  <ButtonText>Catálogo</ButtonText>
                </Button>
                <Button onPress={handleAddPart}>
                  <ButtonText>Agregar Manual</ButtonText>
                </Button>
              </HStack>
            )}
          </HStack>

          <OrderPartsList
            parts={parts}
            onUpdatePart={handleUpdatePart}
            onRemovePart={handleRemovePart}
            onGenerateQuote={handleGenerateQuoteFromParts}
            onGeneratePO={handleGeneratePOFromParts}
            editable={user?.rol !== "cliente"}
          />
        </Card>
      </VStack>
    </ScrollView>
  )

  const renderDocuments = () => (
    <ScrollView className="flex-1 p-4">
      <VStack space="lg">
        <Card className="p-4">
          <Heading size="md" className="mb-4">
            Documents
          </Heading>

          <VStack space="sm">
            {documents.map((doc) => (
              <Card key={doc.id} className="p-3">
                <HStack className="justify-between items-center">
                  <VStack space="xs" className="flex-1">
                    <Text className="font-medium">{doc.numero}</Text>
                    <Text className="text-sm text-gray-600">
                      Total: ${doc.total} • Status: {doc.status}
                    </Text>
                  </VStack>
                  <HStack space="sm">
                    <Button size="sm" variant="outline">
                      <ButtonText>Preview</ButtonText>
                    </Button>
                    {doc.status === "pending" && user?.rol === "cliente" && (
                      <Button
                        size="sm"
                        onPress={() => {
                          setSigningDocument(doc)
                          setShowSignatureDialog(true)
                        }}
                      >
                        <ButtonText>Firmar</ButtonText>
                      </Button>
                    )}
                  </HStack>
                </HStack>
              </Card>
            ))}
          </VStack>
        </Card>
      </VStack>
    </ScrollView>
  )

  const renderHistory = () => (
    <ScrollView className="flex-1 p-4">
      <Card className="p-4">
        <Heading size="md" className="mb-4">
          Activity History
        </Heading>
        <VStack space="sm">
          <Text className="text-sm text-gray-600">Work order created</Text>
          <Text className="text-sm text-gray-600">Technician assigned</Text>
          <Text className="text-sm text-gray-600">Status updated to In Progress</Text>
        </VStack>
      </Card>
    </ScrollView>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return renderOverview()
      case "sessions":
        return renderSessions()
      case "parts":
        return renderParts()
      case "documents":
        return renderDocuments()
      case "history":
        return renderHistory()
      default:
        return renderOverview()
    }
  }

  return (
    <View className="flex-1 bg-gray-50">
      {renderHeader()}
      {renderTabs()}
      {renderTabContent()}

      {/* Parts Catalog Sheet */}
      <Sheet isOpen={showPartsCatalog} onClose={() => setShowPartsCatalog(false)} title="Catálogo de Partes">
        <View className="flex-1 p-4">
          <PartsCatalog onAddPart={handleAddPartFromCatalog} selectedParts={parts.map((p) => p.partId)} />
        </View>
      </Sheet>

      {/* Part Edit Sheet */}
      <Sheet isOpen={showEditPart} onClose={() => setShowEditPart(false)}>
        <VStack space="md" className="p-4">
          <Heading size="md">{editingPart?.partId ? "Edit Part" : "Add Part"}</Heading>

          <Input>
            <InputField
              placeholder="Part Name"
              value={editingPart?.nombre || ""}
              onChangeText={(text) => setEditingPart((prev) => (prev ? { ...prev, nombre: text } : null))}
            />
          </Input>

          <Input>
            <InputField
              placeholder="Quantity"
              value={editingPart?.qty?.toString() || ""}
              onChangeText={(text) =>
                setEditingPart((prev) => (prev ? { ...prev, qty: Number.parseInt(text) || 0 } : null))
              }
              keyboardType="numeric"
            />
          </Input>

          <Input>
            <InputField
              placeholder="Estimated Cost"
              value={editingPart?.costoEstimado?.toString() || ""}
              onChangeText={(text) =>
                setEditingPart((prev) => (prev ? { ...prev, costoEstimado: Number.parseFloat(text) || 0 } : null))
              }
              keyboardType="numeric"
            />
          </Input>

          <HStack space="sm">
            <Button className="flex-1 bg-transparent" variant="outline" onPress={() => setShowEditPart(false)}>
              <ButtonText>Cancel</ButtonText>
            </Button>
            <Button className="flex-1" onPress={() => editingPart && handleSavePart(editingPart)}>
              <ButtonText>Save</ButtonText>
            </Button>
          </HStack>
        </VStack>
      </Sheet>

      {/* Signature Dialog */}
      <SignatureDialog
        isOpen={showSignatureDialog}
        onClose={() => {
          setShowSignatureDialog(false)
          setSigningDocument(null)
        }}
        onSignature={handleSignDocumentFromDialog}
        title="Autorizar Documento"
        documentType={signingDocument?.numero?.startsWith("Q") ? "quote" : "po"}
        documentData={
          signingDocument
            ? {
                number: signingDocument.numero,
                total: signingDocument.total,
                items: parts,
              }
            : undefined
        }
      />
    </View>
  )
}
