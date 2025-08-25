"use client"

import { useState, useRef } from "react"
import { View, Text, Dimensions } from "react-native"
import { VStack, HStack, Button, ButtonText, Heading } from "@gluestack-ui/themed"
import SignatureScreen from "react-native-signature-canvas"
import { Sheet } from "../ui/Sheet"

interface SignatureDialogProps {
  isOpen: boolean
  onClose: () => void
  onSignature: (signature: string) => void
  title: string
  documentType: "quote" | "po"
  documentData?: {
    number: string
    total: number
    items: any[]
  }
}

export default function SignatureDialog({
  isOpen,
  onClose,
  onSignature,
  title,
  documentType,
  documentData,
}: SignatureDialogProps) {
  const [signature, setSignature] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const signatureRef = useRef<any>(null)

  const { width } = Dimensions.get("window")
  const signatureWidth = width - 80
  const signatureHeight = 200

  const handleSignature = (sig: string) => {
    setSignature(sig)
  }

  const handleConfirm = async () => {
    if (!signature) return

    setLoading(true)
    try {
      await onSignature(signature)
      handleClear()
      onClose()
    } catch (error) {
      console.error("Error saving signature:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setSignature("")
    signatureRef.current?.clearSignature()
  }

  const style = `
    .m-signature-pad {
      box-shadow: none;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
    }
    .m-signature-pad--body {
      border: none;
    }
    .m-signature-pad--footer {
      display: none;
    }
    body,html {
      width: ${signatureWidth}px;
      height: ${signatureHeight}px;
      margin: 0;
      padding: 0;
    }
  `

  return (
    <Sheet isOpen={isOpen} onClose={onClose} title={title}>
      <VStack space="lg" className="p-4">
        {/* Document Summary */}
        {documentData && (
          <View className="p-4 bg-background-50 rounded-lg">
            <VStack space="sm">
              <HStack space="md" className="items-center justify-between">
                <Text className="font-semibold">{documentType === "quote" ? "Cotización" : "Orden de Compra"}:</Text>
                <Text className="font-medium">{documentData.number}</Text>
              </HStack>
              <HStack space="md" className="items-center justify-between">
                <Text className="text-typography-600">Total:</Text>
                <Text className="font-bold text-primary-600">${documentData.total.toFixed(2)}</Text>
              </HStack>
              <Text className="text-sm text-typography-500">{documentData.items.length} partes incluidas</Text>
            </VStack>
          </View>
        )}

        {/* Authorization Text */}
        <View className="p-4 bg-warning-50 rounded-lg border border-warning-200">
          <Text className="text-sm text-warning-800">
            <Text className="font-semibold">Autorización:</Text> Al firmar este documento, autorizo la{" "}
            {documentType === "quote" ? "cotización" : "orden de compra"} por el monto especificado y acepto los
            términos y condiciones.
          </Text>
        </View>

        {/* Signature Pad */}
        <VStack space="md">
          <Heading size="sm">Firma del Cliente</Heading>
          <View
            className="border border-border-300 rounded-lg"
            style={{ width: signatureWidth, height: signatureHeight }}
          >
            <SignatureScreen
              ref={signatureRef}
              onOK={handleSignature}
              onEmpty={() => setSignature("")}
              descriptionText=""
              clearText="Limpiar"
              confirmText="Confirmar"
              webStyle={style}
              autoClear={false}
              imageType="image/png"
            />
          </View>

          <Text className="text-xs text-typography-500 text-center">Firme en el área de arriba</Text>
        </VStack>

        {/* Action Buttons */}
        <HStack space="md">
          <Button variant="outline" onPress={handleClear} className="flex-1 bg-transparent" isDisabled={!signature}>
            <ButtonText>Limpiar</ButtonText>
          </Button>

          <Button variant="outline" onPress={onClose} className="flex-1 bg-transparent">
            <ButtonText>Cancelar</ButtonText>
          </Button>

          <Button onPress={handleConfirm} className="flex-1" isDisabled={!signature} isLoading={loading}>
            <ButtonText>{documentType === "quote" ? "Autorizar Cotización" : "Autorizar Orden"}</ButtonText>
          </Button>
        </HStack>
      </VStack>
    </Sheet>
  )
}
