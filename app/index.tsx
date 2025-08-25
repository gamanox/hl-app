"use client"

import { View, Text } from "react-native"
import { Link, Redirect } from "expo-router"
import { Button, ButtonText } from "@gluestack-ui/themed"
import { useAuth } from "../lib/auth"

export default function WelcomeScreen() {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-lg text-gray-600">Cargando...</Text>
      </View>
    )
  }

  // Redirect to main app if already authenticated
  if (session) {
    return <Redirect href="/(tabs)/dashboard" />
  }

  return (
    <View className="flex-1 justify-center items-center bg-gray-50 p-6">
      <View className="bg-white rounded-2xl p-8 shadow-lg w-full max-w-md">
        <Text className="text-3xl font-bold text-center text-gray-900 mb-2">CNC Service Manager</Text>
        <Text className="text-gray-600 text-center mb-8">
          Gestión profesional de servicios para máquinas CNC de madera
        </Text>

        <View className="space-y-4">
          <Link href="/(auth)/login" asChild>
            <Button className="bg-primary-500 rounded-xl">
              <ButtonText className="text-white font-semibold">Iniciar Sesión</ButtonText>
            </Button>
          </Link>

          <Link href="/(auth)/register" asChild>
            <Button variant="outline" className="border-primary-500 rounded-xl bg-transparent">
              <ButtonText className="text-primary-500 font-semibold">Registrarse</ButtonText>
            </Button>
          </Link>
        </View>
      </View>
    </View>
  )
}
