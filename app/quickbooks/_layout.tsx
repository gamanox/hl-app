import { Stack } from "expo-router"

export default function QuickBooksLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "QuickBooks Integration",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="sync"
        options={{
          title: "Sync Data",
          headerShown: true,
        }}
      />
    </Stack>
  )
}
