"use client"

import { useState, useEffect } from "react"
import { View, Text, ScrollView, Alert } from "react-native"
import { router, useLocalSearchParams } from "expo-router"
import * as Location from "expo-location"
import * as ImagePicker from "expo-image-picker"
import {
  VStack,
  HStack,
  Button,
  ButtonText,
  Switch,
  Textarea,
  TextareaInput,
  Input,
  InputField,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Badge,
  BadgeText,
  Pressable,
  Image,
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogCloseButton,
  AlertDialogFooter,
  AlertDialogBody,
} from "@gluestack-ui/themed"
import { Play, Pause, Square, MapPin, Camera, Plus, Trash2, Clock } from "lucide-react-native"
import { useAuth } from "../../lib/auth"
import { sessionService } from "../../lib/sessions"
import { workOrderService } from "../../lib/work-orders"
import type { Session, WorkOrder, ParteLinea } from "../../lib/zod-schemas"

export default function SessionsScreen() {
  const { user } = useAuth()
  const params = useLocalSearchParams()
  const workOrderId = params.workOrderId as string

  const [activeSession, setActiveSession] = useState<Session | null>(null)
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null)
  const [geofenceEnabled, setGeofenceEnabled] = useState(false)
  const [currentLocation, setCurrentLocation] = useState<string>("Obteniendo ubicación...")
  const [notes, setNotes] = useState("")
  const [photos, setPhotos] = useState<string[]>([])
  const [partsUsed, setPartsUsed] = useState<ParteLinea[]>([])
  const [newPart, setNewPart] = useState({ nombre: "", qty: 1, costoEstimado: 0 })
  const [showFinishDialog, setShowFinishDialog] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadData()
    requestLocationPermission()
  }, [workOrderId])

  const loadData = async () => {
    if (workOrderId) {
      const order = await workOrderService.getWorkOrder(workOrderId)
      setWorkOrder(order)

      // Check for active session
      const sessions = await sessionService.listSessions(workOrderId)
      const active = sessions.find((s) => !s.finishedAt)
      setActiveSession(active || null)
    }
  }

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status === "granted") {
        const location = await Location.getCurrentPositionAsync({})
        const address = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        })

        if (address[0]) {
          setCurrentLocation(`${address[0].street || ""} ${address[0].city || ""}`)
        } else {
          setCurrentLocation(`${location.coords.latitude.toFixed(4)}, ${location.coords.longitude.toFixed(4)}`)
        }
      } else {
        setCurrentLocation("Permisos de ubicación denegados")
      }
    } catch (error) {
      console.error("Error getting location:", error)
      setCurrentLocation("Error obteniendo ubicación")
    }
  }

  const handleStartSession = async () => {
    if (!workOrderId) return

    setLoading(true)
    try {
      const session = await sessionService.createSession({
        workOrderId,
        startedAt: new Date(),
        notas: "",
        fotos: [],
        geofence: geofenceEnabled,
      })
      setActiveSession(session)
      Alert.alert("Éxito", "Sesión iniciada correctamente")
    } catch (error) {
      Alert.alert("Error", "No se pudo iniciar la sesión")
    } finally {
      setLoading(false)
    }
  }

  const handlePauseSession = async () => {
    if (!activeSession) return

    setLoading(true)
    try {
      const updatedSession = await sessionService.pauseSession(activeSession.id)
      setActiveSession(updatedSession)
      Alert.alert("Éxito", "Sesión pausada")
    } catch (error) {
      Alert.alert("Error", "No se pudo pausar la sesión")
    } finally {
      setLoading(false)
    }
  }

  const handleResumeSession = async () => {
    if (!activeSession) return

    setLoading(true)
    try {
      const updatedSession = await sessionService.resumeSession(activeSession.id)
      setActiveSession(updatedSession)
      Alert.alert("Éxito", "Sesión reanudada")
    } catch (error) {
      Alert.alert("Error", "No se pudo reanudar la sesión")
    } finally {
      setLoading(false)
    }
  }

  const handleFinishSession = () => {
    setShowFinishDialog(true)
  }

  const confirmFinishSession = async (closeOrder = false) => {
    if (!activeSession) return

    setLoading(true)
    try {
      await sessionService.finishSession(activeSession.id, {
        notas: notes,
        fotos: photos,
        partsUsed,
      })

      if (closeOrder && workOrder) {
        await workOrderService.updateWorkOrder(workOrder.id, { estado: "done" })
      }

      setActiveSession(null)
      setNotes("")
      setPhotos([])
      setPartsUsed([])
      setShowFinishDialog(false)

      Alert.alert("Éxito", closeOrder ? "Sesión finalizada y orden cerrada" : "Sesión finalizada correctamente")

      if (closeOrder) {
        router.back()
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo finalizar la sesión")
    } finally {
      setLoading(false)
    }
  }

  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync()
      if (status !== "granted") {
        Alert.alert("Error", "Se necesitan permisos de cámara")
        return
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      })

      if (!result.canceled && result.assets[0]) {
        setPhotos((prev) => [...prev, result.assets[0].uri])
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo tomar la foto")
    }
  }

  const handleAddPart = () => {
    if (newPart.nombre.trim()) {
      setPartsUsed((prev) => [
        ...prev,
        {
          partId: `part-${Date.now()}`,
          nombre: newPart.nombre,
          qty: newPart.qty,
          costoEstimado: newPart.costoEstimado,
        },
      ])
      setNewPart({ nombre: "", qty: 1, costoEstimado: 0 })
    }
  }

  const handleRemovePart = (index: number) => {
    setPartsUsed((prev) => prev.filter((_, i) => i !== index))
  }

  const getSessionStatus = () => {
    if (!activeSession) return "inactive"
    if (activeSession.finishedAt) return "finished"
    if (activeSession.pausedAt && activeSession.pausedAt.length > 0) {
      const lastPause = activeSession.pausedAt[activeSession.pausedAt.length - 1]
      return new Date(lastPause).getTime() > new Date(activeSession.startedAt).getTime() ? "paused" : "active"
    }
    return "active"
  }

  const sessionStatus = getSessionStatus()
  const isPaused = sessionStatus === "paused"
  const isActive = sessionStatus === "active"

  return (
    <ScrollView className="flex-1 bg-background">
      <VStack space="lg" className="p-4">
        {/* Header */}
        <Card>
          <CardHeader>
            <HStack space="md" className="items-center justify-between">
              <VStack>
                <Heading size="lg">Sesión de Trabajo</Heading>
                {workOrder && (
                  <Text className="text-typography-500">
                    {workOrder.id} - {workOrder.tipo}
                  </Text>
                )}
              </VStack>
              <Badge
                variant={isActive ? "solid" : isPaused ? "outline" : "muted"}
                action={isActive ? "success" : isPaused ? "warning" : "muted"}
              >
                <BadgeText>{isActive ? "Activa" : isPaused ? "Pausada" : "Inactiva"}</BadgeText>
              </Badge>
            </HStack>
          </CardHeader>
        </Card>

        {/* Session Controls */}
        <Card>
          <CardBody>
            <VStack space="lg">
              <HStack space="md" className="justify-center">
                {!activeSession ? (
                  <Button
                    size="xl"
                    action="positive"
                    onPress={handleStartSession}
                    isDisabled={loading}
                    className="flex-1"
                  >
                    <Play size={24} color="white" />
                    <ButtonText className="ml-2">Iniciar Sesión</ButtonText>
                  </Button>
                ) : (
                  <HStack space="md" className="flex-1">
                    {isPaused ? (
                      <Button
                        size="xl"
                        action="positive"
                        onPress={handleResumeSession}
                        isDisabled={loading}
                        className="flex-1"
                      >
                        <Play size={20} color="white" />
                        <ButtonText className="ml-2">Reanudar</ButtonText>
                      </Button>
                    ) : (
                      <Button
                        size="xl"
                        action="secondary"
                        onPress={handlePauseSession}
                        isDisabled={loading}
                        className="flex-1"
                      >
                        <Pause size={20} color="black" />
                        <ButtonText className="ml-2">Pausar</ButtonText>
                      </Button>
                    )}

                    <Button
                      size="xl"
                      action="negative"
                      onPress={handleFinishSession}
                      isDisabled={loading}
                      className="flex-1"
                    >
                      <Square size={20} color="white" />
                      <ButtonText className="ml-2">Finalizar</ButtonText>
                    </Button>
                  </HStack>
                )}
              </HStack>

              {/* Timer Display */}
              {activeSession && (
                <HStack space="md" className="items-center justify-center p-4 bg-background-50 rounded-lg">
                  <Clock size={20} color="#666" />
                  <Text className="text-lg font-semibold">
                    {/* TODO: Implement real-time timer */}
                    Tiempo transcurrido: 1h 23m
                  </Text>
                </HStack>
              )}
            </VStack>
          </CardBody>
        </Card>

        {/* Location & Geofence */}
        <Card>
          <CardBody>
            <VStack space="md">
              <Heading size="md">Ubicación</Heading>

              <HStack space="md" className="items-center justify-between">
                <Text className="text-typography-600">Geocerca</Text>
                <Switch value={geofenceEnabled} onValueChange={setGeofenceEnabled} />
              </HStack>

              <HStack space="md" className="items-center">
                <MapPin size={16} color="#666" />
                <Text className="flex-1 text-typography-600">{currentLocation}</Text>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Session Logging */}
        {activeSession && (
          <>
            {/* Notes */}
            <Card>
              <CardBody>
                <VStack space="md">
                  <Heading size="md">Notas de la Sesión</Heading>
                  <Textarea>
                    <TextareaInput
                      placeholder="Describe el trabajo realizado, problemas encontrados, etc."
                      value={notes}
                      onChangeText={setNotes}
                      multiline
                      numberOfLines={4}
                    />
                  </Textarea>
                </VStack>
              </CardBody>
            </Card>

            {/* Photos */}
            <Card>
              <CardBody>
                <VStack space="md">
                  <HStack space="md" className="items-center justify-between">
                    <Heading size="md">Fotos</Heading>
                    <Button size="sm" onPress={handleTakePhoto}>
                      <Camera size={16} color="white" />
                      <ButtonText className="ml-2">Tomar Foto</ButtonText>
                    </Button>
                  </HStack>

                  {photos.length > 0 && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <HStack space="md">
                        {photos.map((photo, index) => (
                          <View key={index} className="relative">
                            <Image source={{ uri: photo }} alt={`Foto ${index + 1}`} className="w-20 h-20 rounded-lg" />
                            <Pressable
                              onPress={() => setPhotos((prev) => prev.filter((_, i) => i !== index))}
                              className="absolute -top-2 -right-2 bg-error-500 rounded-full p-1"
                            >
                              <Trash2 size={12} color="white" />
                            </Pressable>
                          </View>
                        ))}
                      </HStack>
                    </ScrollView>
                  )}
                </VStack>
              </CardBody>
            </Card>

            {/* Parts Used */}
            <Card>
              <CardBody>
                <VStack space="md">
                  <Heading size="md">Partes Utilizadas</Heading>

                  {/* Add New Part */}
                  <VStack space="sm">
                    <Input>
                      <InputField
                        placeholder="Nombre de la parte"
                        value={newPart.nombre}
                        onChangeText={(text) => setNewPart((prev) => ({ ...prev, nombre: text }))}
                      />
                    </Input>

                    <HStack space="md">
                      <Input className="flex-1">
                        <InputField
                          placeholder="Cantidad"
                          value={newPart.qty.toString()}
                          onChangeText={(text) => setNewPart((prev) => ({ ...prev, qty: Number.parseInt(text) || 1 }))}
                          keyboardType="numeric"
                        />
                      </Input>

                      <Input className="flex-1">
                        <InputField
                          placeholder="Costo estimado"
                          value={newPart.costoEstimado.toString()}
                          onChangeText={(text) =>
                            setNewPart((prev) => ({ ...prev, costoEstimado: Number.parseFloat(text) || 0 }))
                          }
                          keyboardType="numeric"
                        />
                      </Input>

                      <Button size="sm" onPress={handleAddPart}>
                        <Plus size={16} color="white" />
                      </Button>
                    </HStack>
                  </VStack>

                  {/* Parts List */}
                  {partsUsed.map((part, index) => (
                    <HStack
                      key={index}
                      space="md"
                      className="items-center justify-between p-3 bg-background-50 rounded-lg"
                    >
                      <VStack className="flex-1">
                        <Text className="font-semibold">{part.nombre}</Text>
                        <Text className="text-sm text-typography-500">
                          Qty: {part.qty} | Costo: ${part.costoEstimado}
                        </Text>
                      </VStack>

                      <Pressable onPress={() => handleRemovePart(index)}>
                        <Trash2 size={16} color="#ef4444" />
                      </Pressable>
                    </HStack>
                  ))}
                </VStack>
              </CardBody>
            </Card>
          </>
        )}
      </VStack>

      {/* Finish Session Dialog */}
      <AlertDialog isOpen={showFinishDialog} onClose={() => setShowFinishDialog(false)}>
        <AlertDialogBackdrop />
        <AlertDialogContent>
          <AlertDialogHeader>
            <Heading>Finalizar Sesión</Heading>
            <AlertDialogCloseButton />
          </AlertDialogHeader>

          <AlertDialogBody>
            <Text>¿Deseas finalizar la sesión?</Text>
            {workOrder?.estado !== "done" && (
              <Text className="mt-2 text-typography-600">
                También puedes cerrar la orden de trabajo si el servicio está completo.
              </Text>
            )}
          </AlertDialogBody>

          <AlertDialogFooter>
            <HStack space="md">
              <Button variant="outline" onPress={() => setShowFinishDialog(false)} className="flex-1">
                <ButtonText>Cancelar</ButtonText>
              </Button>

              <Button
                action="secondary"
                onPress={() => confirmFinishSession(false)}
                isDisabled={loading}
                className="flex-1"
              >
                <ButtonText>Solo Finalizar</ButtonText>
              </Button>

              {workOrder?.estado !== "done" && (
                <Button
                  action="positive"
                  onPress={() => confirmFinishSession(true)}
                  isDisabled={loading}
                  className="flex-1"
                >
                  <ButtonText>Finalizar y Cerrar Orden</ButtonText>
                </Button>
              )}
            </HStack>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ScrollView>
  )
}
