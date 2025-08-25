"use client"

import { View, Text, ScrollView, Alert, TextInput } from "react-native"
import { Link, router } from "expo-router"
import { useState, useRef, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Card, CardContent, CardHeader } from "../../components/ui/Card"
import { Input } from "../../components/ui/Input"
import { Button } from "../../components/ui/Button"
import { signInWithOtp, verifyOtp } from "../../lib/supabase"

const emailSchema = z.object({
  email: z.string().email("Email inválido").min(1, "Email requerido"),
})

const otpSchema = z.object({
  otp: z.string().length(6, "Código debe tener 6 dígitos").regex(/^\d+$/, "Solo números"),
})

type EmailForm = z.infer<typeof emailSchema>
type OtpForm = z.infer<typeof otpSchema>

export default function LoginScreen() {
  const [step, setStep] = useState<1 | 2>(1)
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""])
  const otpRefs = useRef<(TextInput | null)[]>([])

  const emailForm = useForm<EmailForm>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  })

  const otpForm = useForm<OtpForm>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  })

  const onSendOtp = async (data: EmailForm) => {
    setLoading(true)
    try {
      const result = await signInWithOtp(data.email)

      if (result.success) {
        setEmail(data.email)
        setStep(2)
        Alert.alert("Éxito", "Código OTP enviado a tu email")
      } else {
        Alert.alert("Error", result.error || "Error al enviar código")
      }
    } catch (error) {
      Alert.alert("Error", "Error inesperado al enviar código")
    } finally {
      setLoading(false)
    }
  }

  const onVerifyOtp = async () => {
    const otpCode = otpValues.join("")
    if (otpCode.length !== 6) {
      Alert.alert("Error", "Ingresa el código completo de 6 dígitos")
      return
    }

    setLoading(true)
    try {
      const result = await verifyOtp(otpCode)

      if (result.success && result.user) {
        Alert.alert("Éxito", "Sesión iniciada correctamente")
        router.replace("/(tabs)/dashboard")
      } else {
        Alert.alert("Error", result.error || "Código inválido")
      }
    } catch (error) {
      Alert.alert("Error", "Error inesperado al verificar código")
    } finally {
      setLoading(false)
    }
  }

  const handleOtpChange = (value: string, index: number) => {
    const newValues = [...otpValues]
    newValues[index] = value

    // Handle paste
    if (value.length > 1) {
      const pastedCode = value.slice(0, 6).split("")
      for (let i = 0; i < 6; i++) {
        newValues[i] = pastedCode[i] || ""
      }
      setOtpValues(newValues)
      // Focus last filled input or next empty
      const nextIndex = Math.min(pastedCode.length, 5)
      otpRefs.current[nextIndex]?.focus()
      return
    }

    newValues[index] = value
    setOtpValues(newValues)

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !otpValues[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  useEffect(() => {
    if (step === 2) {
      setTimeout(() => otpRefs.current[0]?.focus(), 100)
    }
  }, [step])

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="flex-1 justify-center p-6 min-h-screen">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <Text className="text-2xl font-bold text-center text-gray-900 mb-2">
              {step === 1 ? "Iniciar Sesión" : "Verificar Código"}
            </Text>
            <Text className="text-gray-600 text-center">
              {step === 1 ? "Ingresa tu email para recibir un código de acceso" : `Código enviado a ${email}`}
            </Text>
          </CardHeader>

          <CardContent className="space-y-4">
            {step === 1 ? (
              <>
                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-2">Email</Text>
                  <Controller
                    control={emailForm.control}
                    name="email"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <Input
                        placeholder="tu@email.com"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoComplete="email"
                        accessibilityLabel="Ingresa tu email"
                        accessibilityHint="Email para recibir código de acceso"
                        error={emailForm.formState.errors.email?.message}
                      />
                    )}
                  />
                  {emailForm.formState.errors.email && (
                    <Text className="text-red-500 text-sm mt-1">{emailForm.formState.errors.email.message}</Text>
                  )}
                </View>

                <Button
                  title={loading ? "Enviando..." : "Enviar Código OTP"}
                  onPress={emailForm.handleSubmit(onSendOtp)}
                  disabled={loading}
                  className="mt-6"
                />
              </>
            ) : (
              <>
                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-4 text-center">
                    Ingresa el código de 6 dígitos
                  </Text>
                  <View className="flex-row justify-between mb-4">
                    {otpValues.map((value, index) => (
                      <TextInput
                        key={index}
                        ref={(ref) => (otpRefs.current[index] = ref)}
                        className="w-12 h-12 border-2 border-gray-300 rounded-lg text-center text-lg font-semibold focus:border-blue-500"
                        value={value}
                        onChangeText={(text) => handleOtpChange(text, index)}
                        onKeyPress={({ nativeEvent }) => handleOtpKeyPress(nativeEvent.key, index)}
                        keyboardType="numeric"
                        maxLength={6} // Allow paste
                        selectTextOnFocus
                        accessibilityLabel={`Dígito ${index + 1} del código OTP`}
                        accessibilityHint={`Ingresa el dígito ${index + 1} de 6`}
                      />
                    ))}
                  </View>
                </View>

                <Button
                  title={loading ? "Verificando..." : "Verificar"}
                  onPress={onVerifyOtp}
                  disabled={loading || otpValues.join("").length !== 6}
                  className="mt-4"
                />

                <Button
                  title="Volver"
                  onPress={() => {
                    setStep(1)
                    setOtpValues(["", "", "", "", "", ""])
                  }}
                  variant="outline"
                  disabled={loading}
                  className="mt-2"
                />
              </>
            )}

            <View className="mt-6 p-4 bg-blue-50 rounded-lg">
              <Text className="text-sm text-blue-800 text-center mb-2">¿Eres cliente y necesitas acceso rápido?</Text>
              <Link
                href="/portal"
                className="text-blue-600 font-semibold text-center underline"
                accessibilityLabel="Acceder al portal público para clientes"
              >
                Acceder al Portal Público
              </Link>
            </View>

            <View className="flex-row justify-center items-center mt-4">
              <Text className="text-gray-600">¿No tienes cuenta? </Text>
              <Link href="/(auth)/register" className="text-blue-600 font-semibold">
                Regístrate
              </Link>
            </View>
          </CardContent>
        </Card>
      </View>
    </ScrollView>
  )
}
