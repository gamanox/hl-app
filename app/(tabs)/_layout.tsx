"use client"

import { Tabs, Redirect } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../../lib/auth"
import { View, Text } from "react-native"

export default function TabLayout() {
  const { session, profile, loading } = useAuth()

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-lg text-gray-600">Cargando...</Text>
      </View>
    )
  }

  if (!session) {
    return <Redirect href="/(auth)/login" />
  }

  // Role-based tab configuration
  const getTabsForRole = () => {
    const baseTabs = [
      {
        name: "dashboard",
        title: "Dashboard",
        icon: "home" as const,
      },
      {
        name: "profile",
        title: "Perfil",
        icon: "person" as const,
      },
    ]

    if (profile?.role === "admin") {
      return [
        ...baseTabs.slice(0, 1), // Dashboard
        {
          name: "calendar",
          title: "Calendario",
          icon: "calendar" as const,
        },
        {
          name: "orders",
          title: "Órdenes",
          icon: "list" as const,
        },
        {
          name: "users",
          title: "Usuarios",
          icon: "people" as const,
        },
        ...baseTabs.slice(1), // Profile
      ]
    }

    if (profile?.role === "technician") {
      return [
        ...baseTabs.slice(0, 1), // Dashboard
        {
          name: "calendar",
          title: "Calendario",
          icon: "calendar" as const,
        },
        {
          name: "orders",
          title: "Mis Órdenes",
          icon: "list" as const,
        },
        ...baseTabs.slice(1), // Profile
      ]
    }

    // Client role
    return [
      ...baseTabs.slice(0, 1), // Dashboard
      {
        name: "orders",
        title: "Mis Servicios",
        icon: "list" as const,
      },
      ...baseTabs.slice(1), // Profile
    ]
  }

  const tabs = getTabsForRole()

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#3b82f6",
        tabBarInactiveTintColor: "#6b7280",
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopWidth: 1,
          borderTopColor: "#e5e7eb",
          paddingBottom: 8,
          paddingTop: 8,
          height: 80,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
        headerStyle: {
          backgroundColor: "#3b82f6",
        },
        headerTintColor: "#ffffff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ color, size }) => <Ionicons name={tab.icon} size={size} color={color} />,
          }}
        />
      ))}
    </Tabs>
  )
}
