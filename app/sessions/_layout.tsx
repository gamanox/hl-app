import { Stack } from "expo-router"

export default function SessionsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "#3b82f6",
        },
        headerTintColor: "#ffffff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Mis Sesiones" }} />
      <Stack.Screen name="create" options={{ title: "Nueva Sesión" }} />
      <Stack.Screen name="[id]" options={{ title: "Detalle de Sesión" }} />
      <Stack.Screen name="report" options={{ title: "Reporte de Tiempo" }} />
    </Stack>
  )
}
