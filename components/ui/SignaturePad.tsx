"use client"

import { View, Text } from "react-native"
import { useState, useRef } from "react"
import SignatureScreen from "react-native-signature-canvas"
import { Button } from "./Button"

interface SignaturePadProps {
  onSignature: (signature: string) => void
  onClear?: () => void
  title?: string
  description?: string
}

export function SignaturePad({ onSignature, onClear, title = "Firma", description }: SignaturePadProps) {
  const [signature, setSignature] = useState<string>("")
  const signatureRef = useRef<any>(null)

  const handleSignature = (sig: string) => {
    setSignature(sig)
    onSignature(sig)
  }

  const handleClear = () => {
    signatureRef.current?.clearSignature()
    setSignature("")
    onClear?.()
  }

  const handleEmpty = () => {
    console.log("Signature pad is empty")
  }

  const style = `
    .m-signature-pad {
      box-shadow: none;
      border: 2px solid #e5e7eb;
      border-radius: 12px;
    }
    .m-signature-pad--body {
      border: none;
    }
    .m-signature-pad--footer {
      display: none;
    }
    body,html {
      width: 100%; height: 100%;
    }
  `

  return (
    <View className="space-y-4">
      <View>
        <Text className="text-lg font-semibold text-gray-900 mb-2">{title}</Text>
        {description && <Text className="text-gray-600 mb-4">{description}</Text>}
      </View>

      <View className="border-2 border-gray-200 rounded-xl overflow-hidden" style={{ height: 200 }}>
        <SignatureScreen
          ref={signatureRef}
          onOK={handleSignature}
          onEmpty={handleEmpty}
          onClear={handleClear}
          autoClear={false}
          descriptionText=""
          clearText="Limpiar"
          confirmText="Confirmar"
          webStyle={style}
          backgroundColor="#ffffff"
          penColor="#000000"
        />
      </View>

      <View className="flex-row space-x-3">
        <Button title="Limpiar" variant="outline" onPress={handleClear} className="flex-1 bg-transparent" />
        <Button
          title="Confirmar Firma"
          onPress={() => signatureRef.current?.readSignature()}
          disabled={!signature}
          className="flex-1"
        />
      </View>
    </View>
  )
}
