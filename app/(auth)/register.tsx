"use client"

import { View, Text, ScrollView, Alert } from "react-native"
import { Link, router } from "expo-router"
import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardHeader } from "../../components/ui/Card"
import { Input } from "../../components/ui/Input"
import { Button } from "../../components/ui/Button"
import { Select } from "../../components/ui/Select"
import { useAuth } from "../../lib/auth"
import { registerSchema, type RegisterForm } from "../../lib/zod-schemas"

export default function RegisterScreen() {
  const { signUp } = useAuth()
  const [loading, setLoading] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      fullName: "",
      role: "client",
    },
  })

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true)
    try {
      const { error } = await signUp(data.email, data.password, data.fullName, data.role)

      if (error) {
        Alert.alert("Error", error)
      } else {
        Alert.alert("Éxito", "Cuenta creada exitosamente", [
          {
            text: "OK",
            onPress: () => router.replace("/(auth)/login"),
          },
        ])
      }
    } catch (error) {
      Alert.alert("Error", "Error inesperado al registrarse")
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="flex-1 justify-center p-6 min-h-screen">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <Text className="text-2xl font-bold text-center text-gray-900 mb-2">Crear Cuenta</Text>
            <Text className="text-gray-600 text-center">Completa los datos para registrarte</Text>
          </CardHeader>

          <CardContent className="space-y-4">
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">Nombre Completo</Text>
              <Controller
                control={control}
                name="fullName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    placeholder="Juan Pérez"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.fullName?.message}
                  />
                )}
              />
              {errors.fullName && <Text className="text-error-500 text-sm mt-1">{errors.fullName.message}</Text>}
            </View>

            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">Email</Text>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    placeholder="tu@email.com"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    error={errors.email?.message}
                  />
                )}
              />
              {errors.email && <Text className="text-error-500 text-sm mt-1">{errors.email.message}</Text>}
            </View>

            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">Contraseña</Text>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    placeholder="••••••••"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    secureTextEntry
                    error={errors.password?.message}
                  />
                )}
              />
              {errors.password && <Text className="text-error-500 text-sm mt-1">{errors.password.message}</Text>}
            </View>

            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">Tipo de Usuario</Text>
              <Controller
                control={control}
                name="role"
                render={({ field: { onChange, value } }) => (
                  <Select
                    value={value}
                    onValueChange={onChange}
                    options={[
                      { label: "Cliente", value: "client" },
                      { label: "Técnico", value: "technician" },
                      { label: "Administrador", value: "admin" },
                    ]}
                  />
                )}
              />
              {errors.role && <Text className="text-error-500 text-sm mt-1">{errors.role.message}</Text>}
            </View>

            <Button
              title={loading ? "Registrando..." : "Crear Cuenta"}
              onPress={handleSubmit(onSubmit)}
              disabled={loading}
              className="mt-6"
            />

            <View className="flex-row justify-center items-center mt-4">
              <Text className="text-gray-600">¿Ya tienes cuenta? </Text>
              <Link href="/(auth)/login" className="text-primary-600 font-semibold">
                Inicia sesión
              </Link>
            </View>
          </CardContent>
        </Card>
      </View>
    </ScrollView>
  )
}
