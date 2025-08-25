"use client"

import { View, Text, TouchableOpacity, Modal } from "react-native"
import { useState } from "react"
import { Ionicons } from "@expo/vector-icons"

interface SelectOption {
  label: string
  value: string
}

interface SelectProps {
  value: string
  onValueChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  className?: string
}

export function Select({ value, onValueChange, options, placeholder = "Seleccionar...", className }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false)

  const selectedOption = options.find((option) => option.value === value)

  return (
    <View className={className}>
      <TouchableOpacity
        onPress={() => setIsOpen(true)}
        className="flex-row justify-between items-center bg-white border border-gray-200 rounded-xl px-4 py-3"
      >
        <Text className={`${selectedOption ? "text-gray-900" : "text-gray-500"}`}>
          {selectedOption?.label || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#6b7280" />
      </TouchableOpacity>

      <Modal visible={isOpen} transparent animationType="fade">
        <TouchableOpacity className="flex-1 bg-black/50 justify-center items-center" onPress={() => setIsOpen(false)}>
          <View className="bg-white rounded-2xl mx-6 w-80 max-h-96">
            <View className="p-4 border-b border-gray-100">
              <Text className="text-lg font-semibold text-gray-900">Seleccionar opción</Text>
            </View>
            <View className="max-h-64">
              {options.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => {
                    onValueChange(option.value)
                    setIsOpen(false)
                  }}
                  className={`p-4 border-b border-gray-50 ${option.value === value ? "bg-primary-50" : "bg-white"}`}
                >
                  <Text className={`${option.value === value ? "text-primary-600 font-semibold" : "text-gray-900"}`}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  )
}
