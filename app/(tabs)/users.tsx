"use client"

import { View, Text } from "react-native"
import { useAuth } from "../../lib/auth"
import { Redirect } from "expo-router"

export default function UsersScreen() {
  const { profile } = useAuth()

  // Only admins can access this screen
  if (profile?.role !== "admin") {
    return <Redirect href="/(tabs)/dashboard" />
  }

  return (
    <View className="flex-1 justify-center items-center bg-gray-50">
      <Text className="text-xl font-semibold text-gray-900">Gestión de Usuarios</Text>
      <Text className="text-gray-600 mt-2">Panel de administración de usuarios próximamente</Text>
    </View>
  )
}
