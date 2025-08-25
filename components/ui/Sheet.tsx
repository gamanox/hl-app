"use client"

import type React from "react"
import { useEffect, useRef } from "react"
import { View, Text, Modal, Animated, PanResponder, Dimensions, TouchableOpacity, Platform } from "react-native"
import { designTokens } from "@/lib/design-tokens"

interface SheetProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  snapPoints?: string[]
  title?: string
  accessibilityLabel?: string
  accessibilityHint?: string
}

const { height: SCREEN_HEIGHT } = Dimensions.get("window")

export function Sheet({
  isOpen,
  onClose,
  children,
  snapPoints = ["50%"],
  title,
  accessibilityLabel,
  accessibilityHint,
}: SheetProps) {
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current
  const opacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (isOpen) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: Number.parseInt(designTokens.animation.normal),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: Number.parseInt(designTokens.animation.normal),
          useNativeDriver: true,
        }),
      ]).start()
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: SCREEN_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [isOpen])

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return Math.abs(gestureState.dy) > 5
    },
    onPanResponderMove: (_, gestureState) => {
      if (gestureState.dy > 0) {
        translateY.setValue(gestureState.dy)
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dy > 100 || gestureState.vy > 0.5) {
        onClose()
      } else {
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
        }).start()
      }
    },
  })

  if (Platform.OS === "web") {
    // Use a dialog-like modal for web with accessibility
    return (
      <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose} accessibilityViewIsModal={true}>
        <View
          className="flex-1 justify-center items-center bg-black/50 p-4"
          accessibilityRole="dialog"
          accessibilityLabel={accessibilityLabel || title || "Dialog"}
        >
          <View
            className="bg-white rounded-2xl max-w-md w-full max-h-[80%]"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.25,
              shadowRadius: 25,
              elevation: 25,
            }}
          >
            {title && (
              <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
                <Text className="text-lg font-semibold" accessibilityRole="header">
                  {title}
                </Text>
                <TouchableOpacity
                  onPress={onClose}
                  className="w-11 h-11 justify-center items-center rounded-full"
                  accessibilityRole="button"
                  accessibilityLabel="Close dialog"
                  accessibilityHint="Closes the current dialog"
                >
                  <Text className="text-gray-500 text-xl">×</Text>
                </TouchableOpacity>
              </View>
            )}
            <View className="max-h-96 overflow-hidden">{children}</View>
          </View>
        </View>
      </Modal>
    )
  }

  return (
    <Modal visible={isOpen} transparent animationType="none" onRequestClose={onClose} accessibilityViewIsModal={true}>
      <View className="flex-1">
        {/* Backdrop */}
        <Animated.View
          className="absolute inset-0 bg-black"
          style={{
            opacity: opacity.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.5],
            }),
          }}
        >
          <TouchableOpacity
            className="flex-1"
            onPress={onClose}
            activeOpacity={1}
            accessibilityRole="button"
            accessibilityLabel="Close sheet"
            accessibilityHint="Tap to close the bottom sheet"
          />
        </Animated.View>

        {/* Sheet */}
        <Animated.View
          className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl"
          style={{
            transform: [{ translateY }],
            maxHeight: SCREEN_HEIGHT * 0.9,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.1,
            shadowRadius: 15,
            elevation: 15,
          }}
          {...panResponder.panHandlers}
          accessibilityRole="dialog"
          accessibilityLabel={accessibilityLabel || title || "Bottom sheet"}
          accessibilityHint={accessibilityHint || "Swipe down to close"}
        >
          {/* Handle */}
          <View
            className="items-center py-3"
            accessibilityRole="button"
            accessibilityLabel="Drag handle"
            accessibilityHint="Drag down to close the sheet"
          >
            <View className="w-10 h-1 bg-gray-300 rounded-full" />
          </View>

          {/* Title */}
          {title && (
            <View className="px-6 pb-2">
              <Text className="text-xl font-semibold text-center" accessibilityRole="header">
                {title}
              </Text>
            </View>
          )}

          {/* Content */}
          <View className="flex-1">{children}</View>
        </Animated.View>
      </View>
    </Modal>
  )
}
