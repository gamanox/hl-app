import { Stack } from "expo-router"

export default function DocumentsLayout() {
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
      <Stack.Screen name="index" options={{ title: "Documentos" }} />
      <Stack.Screen name="create-quote" options={{ title: "Nueva Cotización" }} />
      <Stack.Screen name="create-po" options={{ title: "Nueva Orden de Compra" }} />
      <Stack.Screen name="[id]" options={{ title: "Documento" }} />
      <Stack.Screen name="[id]/sign" options={{ title: "Firmar Documento" }} />
    </Stack>
  )
}
