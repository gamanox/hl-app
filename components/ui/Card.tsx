import type React from "react"
import { View } from "react-native"
import type { ComponentProps } from "react"

interface CardProps extends ComponentProps<typeof View> {
  children: React.ReactNode
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <View className={`bg-white rounded-2xl p-4 shadow-sm border border-gray-100 ${className}`} {...props}>
      {children}
    </View>
  )
}

export function CardHeader({ children, className, ...props }: CardProps) {
  return (
    <View className={`mb-3 ${className}`} {...props}>
      {children}
    </View>
  )
}

export function CardContent({ children, className, ...props }: CardProps) {
  return (
    <View className={`${className}`} {...props}>
      {children}
    </View>
  )
}

export function CardFooter({ children, className, ...props }: CardProps) {
  return (
    <View className={`mt-3 pt-3 border-t border-gray-100 ${className}`} {...props}>
      {children}
    </View>
  )
}
