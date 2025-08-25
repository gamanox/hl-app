"use client"

import React from "react"
import { View, Text, FlatList } from "react-native"
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
  Pressable,
} from "@gluestack-ui/themed"
import { Trash2, Edit3, Package } from "lucide-react-native"
import type { ParteLinea } from "../../lib/zod-schemas"

interface OrderPartsListProps {
  parts: ParteLinea[]
  onUpdatePart: (index: number, updates: Partial<ParteLinea>) => void
  onRemovePart: (index: number) => void
  onGenerateQuote: () => void
  onGeneratePO: () => void
  editable?: boolean
}

export default function OrderPartsList({
  parts,
  onUpdatePart,
  onRemovePart,
  onGenerateQuote,
  onGeneratePO,
  editable = true,
}: OrderPartsListProps) {
  const [editingIndex, setEditingIndex] = React.useState<number | null>(null)
  const [editValues, setEditValues] = React.useState<Partial<ParteLinea>>({})

  const subtotal = parts.reduce((sum, part) => sum + part.qty * part.costoEstimado, 0)
  const tax = subtotal * 0.08 // 8% tax
  const total = subtotal + tax

  const handleStartEdit = (index: number, part: ParteLinea) => {
    setEditingIndex(index)
    setEditValues(part)
  }

  const handleSaveEdit = () => {
    if (editingIndex !== null && editValues) {
      onUpdatePart(editingIndex, editValues)
      setEditingIndex(null)
      setEditValues({})
    }
  }

  const handleCancelEdit = () => {
    setEditingIndex(null)
    setEditValues({})
  }

  const renderPartItem = ({ item: part, index }: { item: ParteLinea; index: number }) => {
    const isEditing = editingIndex === index
    const lineTotal = part.qty * part.costoEstimado

    return (
      <Card className="mb-3">
        <CardBody>
          {isEditing ? (
            <VStack space="md">
              {/* Editing Mode */}
              <Input>
                <InputField
                  placeholder="Nombre de la parte"
                  value={editValues.nombre || ""}
                  onChangeText={(text) => setEditValues((prev) => ({ ...prev, nombre: text }))}
                />
              </Input>

              <HStack space="md">
                <View className="flex-1">
                  <Input>
                    <InputField
                      placeholder="Cantidad"
                      value={editValues.qty?.toString() || ""}
                      onChangeText={(text) => setEditValues((prev) => ({ ...prev, qty: Number.parseInt(text) || 0 }))}
                      keyboardType="numeric"
                    />
                  </Input>
                </View>

                <View className="flex-1">
                  <Input>
                    <InputField
                      placeholder="Costo"
                      value={editValues.costoEstimado?.toString() || ""}
                      onChangeText={(text) =>
                        setEditValues((prev) => ({ ...prev, costoEstimado: Number.parseFloat(text) || 0 }))
                      }
                      keyboardType="numeric"
                    />
                  </Input>
                </View>
              </HStack>

              <HStack space="md">
                <Button variant="outline" size="sm" onPress={handleCancelEdit} className="flex-1 bg-transparent">
                  <ButtonText>Cancelar</ButtonText>
                </Button>
                <Button size="sm" onPress={handleSaveEdit} className="flex-1">
                  <ButtonText>Guardar</ButtonText>
                </Button>
              </HStack>
            </VStack>
          ) : (
            <VStack space="sm">
              {/* Display Mode */}
              <HStack space="md" className="items-center justify-between">
                <VStack className="flex-1">
                  <Text className="font-semibold text-typography-900">{part.nombre}</Text>
                  <HStack space="md" className="items-center">
                    <Text className="text-sm text-typography-600">Qty: {part.qty}</Text>
                    <Text className="text-sm text-typography-600">${part.costoEstimado.toFixed(2)} c/u</Text>
                    <Text className="text-sm font-medium text-typography-900">Total: ${lineTotal.toFixed(2)}</Text>
                  </HStack>
                </VStack>

                {editable && (
                  <HStack space="sm">
                    <Pressable onPress={() => handleStartEdit(index, part)}>
                      <Edit3 size={16} color="#666" />
                    </Pressable>
                    <Pressable onPress={() => onRemovePart(index)}>
                      <Trash2 size={16} color="#ef4444" />
                    </Pressable>
                  </HStack>
                )}
              </HStack>
            </VStack>
          )}
        </CardBody>
      </Card>
    )
  }

  return (
    <VStack space="md" className="flex-1">
      <HStack space="md" className="items-center justify-between">
        <Heading size="md">Partes de esta Orden</Heading>
        <Text className="text-sm text-typography-600">{parts.length} partes</Text>
      </HStack>

      {parts.length === 0 ? (
        <View className="items-center justify-center py-8">
          <Package size={48} color="#ccc" />
          <Text className="text-typography-500 mt-2">No hay partes agregadas</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={parts}
            renderItem={renderPartItem}
            keyExtractor={(_, index) => index.toString()}
            showsVerticalScrollIndicator={false}
          />

          {/* Totals */}
          <Card className="bg-background-50">
            <CardBody>
              <VStack space="sm">
                <HStack space="md" className="items-center justify-between">
                  <Text className="text-typography-600">Subtotal:</Text>
                  <Text className="font-medium">${subtotal.toFixed(2)}</Text>
                </HStack>
                <HStack space="md" className="items-center justify-between">
                  <Text className="text-typography-600">Impuestos (8%):</Text>
                  <Text className="font-medium">${tax.toFixed(2)}</Text>
                </HStack>
                <View className="h-px bg-border-300 my-1" />
                <HStack space="md" className="items-center justify-between">
                  <Text className="font-semibold text-lg">Total:</Text>
                  <Text className="font-bold text-lg text-primary-600">${total.toFixed(2)}</Text>
                </HStack>
              </VStack>
            </CardBody>
          </Card>

          {/* Action Buttons */}
          <HStack space="md">
            <Button
              variant="outline"
              onPress={onGenerateQuote}
              className="flex-1 bg-transparent"
              isDisabled={parts.length === 0}
            >
              <ButtonText>Generar Quote</ButtonText>
            </Button>
            <Button onPress={onGeneratePO} className="flex-1" isDisabled={parts.length === 0}>
              <ButtonText>Generar Purchase Order</ButtonText>
            </Button>
          </HStack>
        </>
      )}
    </VStack>
  )
}
