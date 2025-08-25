"use client"

import { useState, useEffect } from "react"
import { View, Text, ScrollView, FlatList } from "react-native"
import {
  VStack,
  HStack,
  Button,
  ButtonText,
  Input,
  InputField,
  Card,
  CardBody,
  Heading,
  Badge,
  BadgeText,
  Pressable,
} from "@gluestack-ui/themed"
import { Plus, Package, Filter } from "lucide-react-native"
import { data as supabaseData } from "../../lib/supabase"

interface Part {
  id: string
  name: string
  cost: number
  category?: string
  description?: string
  inStock?: boolean
}

interface PartsCatalogProps {
  onAddPart: (part: Part, quantity: number) => void
  selectedParts?: string[]
}

const categories = [
  { id: "all", name: "Todos", icon: "📦" },
  { id: "mechanical", name: "Mecánico", icon: "⚙️" },
  { id: "electrical", name: "Eléctrico", icon: "⚡" },
  { id: "hydraulic", name: "Hidráulico", icon: "💧" },
  { id: "pneumatic", name: "Neumático", icon: "💨" },
  { id: "consumables", name: "Consumibles", icon: "🔧" },
]

export default function PartsCatalog({ onAddPart, selectedParts = [] }: PartsCatalogProps) {
  const [parts, setParts] = useState<Part[]>([])
  const [filteredParts, setFilteredParts] = useState<Part[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadParts()
  }, [])

  useEffect(() => {
    filterParts()
  }, [parts, searchQuery, selectedCategory])

  const loadParts = async () => {
    try {
      const { data: partsData } = await supabaseData.listPartsCatalog()
      // Mock data for demonstration
      const mockParts: Part[] = [
        { id: "1", name: "Filtro de Aceite", cost: 25.99, category: "mechanical", inStock: true },
        { id: "2", name: "Correa de Transmisión", cost: 45.5, category: "mechanical", inStock: true },
        { id: "3", name: "Sensor de Temperatura", cost: 89.99, category: "electrical", inStock: false },
        { id: "4", name: "Válvula Hidráulica", cost: 156.75, category: "hydraulic", inStock: true },
        { id: "5", name: "Cilindro Neumático", cost: 234.0, category: "pneumatic", inStock: true },
        { id: "6", name: "Lubricante Industrial", cost: 18.99, category: "consumables", inStock: true },
      ]
      setParts(mockParts)
    } catch (error) {
      console.error("Error loading parts:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterParts = () => {
    let filtered = parts

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((part) => part.category === selectedCategory)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter((part) => part.name.toLowerCase().includes(searchQuery.toLowerCase()))
    }

    setFilteredParts(filtered)
  }

  const handleAddPart = (part: Part) => {
    onAddPart(part, 1) // Default quantity of 1
  }

  const renderPartItem = ({ item: part }: { item: Part }) => (
    <Card className="mb-3">
      <CardBody>
        <HStack space="md" className="items-center justify-between">
          <VStack className="flex-1">
            <HStack space="sm" className="items-center">
              <Text className="font-semibold text-typography-900">{part.name}</Text>
              {!part.inStock && (
                <Badge variant="outline" action="error">
                  <BadgeText>Sin Stock</BadgeText>
                </Badge>
              )}
            </HStack>
            <Text className="text-sm text-typography-600">${part.cost.toFixed(2)}</Text>
            {part.category && (
              <Text className="text-xs text-typography-500 capitalize">
                {categories.find((c) => c.id === part.category)?.name || part.category}
              </Text>
            )}
          </VStack>

          <Button
            size="sm"
            onPress={() => handleAddPart(part)}
            isDisabled={selectedParts.includes(part.id) || !part.inStock}
            variant={selectedParts.includes(part.id) ? "outline" : "solid"}
          >
            <Plus size={16} color={selectedParts.includes(part.id) ? "#666" : "white"} />
            <ButtonText className="ml-1">{selectedParts.includes(part.id) ? "Agregado" : "Agregar"}</ButtonText>
          </Button>
        </HStack>
      </CardBody>
    </Card>
  )

  return (
    <VStack space="md" className="flex-1">
      {/* Search Bar */}
      <HStack space="md" className="items-center">
        <View className="flex-1">
          <Input>
            <InputField placeholder="Buscar partes..." value={searchQuery} onChangeText={setSearchQuery} />
          </Input>
        </View>
        <Button variant="outline" size="sm">
          <Filter size={16} color="#666" />
        </Button>
      </HStack>

      {/* Categories */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <HStack space="sm" className="px-1">
          {categories.map((category) => (
            <Pressable key={category.id} onPress={() => setSelectedCategory(category.id)}>
              <Card className={`px-3 py-2 ${selectedCategory === category.id ? "bg-primary-500" : "bg-background-50"}`}>
                <HStack space="sm" className="items-center">
                  <Text className="text-sm">{category.icon}</Text>
                  <Text
                    className={`text-sm font-medium ${
                      selectedCategory === category.id ? "text-white" : "text-typography-700"
                    }`}
                  >
                    {category.name}
                  </Text>
                </HStack>
              </Card>
            </Pressable>
          ))}
        </HStack>
      </ScrollView>

      {/* Parts List */}
      <VStack className="flex-1">
        <HStack space="md" className="items-center justify-between mb-3">
          <Heading size="md">Catálogo de Partes</Heading>
          <Text className="text-sm text-typography-600">{filteredParts.length} partes</Text>
        </HStack>

        <FlatList
          data={filteredParts}
          renderItem={renderPartItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="items-center justify-center py-8">
              <Package size={48} color="#ccc" />
              <Text className="text-typography-500 mt-2">
                {loading ? "Cargando partes..." : "No se encontraron partes"}
              </Text>
            </View>
          }
        />
      </VStack>
    </VStack>
  )
}
