import { Stack } from "expo-router"

export default function OrdersLayout() {
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
      <Stack.Screen name="create" options={{ title: "Nueva Orden" }} />
      <Stack.Screen name="[id]" options={{ title: "Detalle de Orden" }} />
      <Stack.Screen name="[id]/edit" options={{ title: "Editar Orden" }} />
    </Stack>
  )
}
