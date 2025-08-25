import { View, Text } from "react-native"
import { designTokens } from "@/lib/design-tokens"

interface BadgeProps {
  text: string
  variant?: "default" | "success" | "warning" | "error" | "info"
  priority?: "low" | "normal" | "high" | "urgent"
  className?: string
  accessibilityLabel?: string
  role?: "status" | "img" | "text"
}

export function Badge({
  text,
  variant = "default",
  priority,
  className,
  accessibilityLabel,
  role = "status",
}: BadgeProps) {
  const getVariantStyles = () => {
    if (priority) {
      const priorityColors = designTokens.colors.priority[priority]
      return `bg-[${priorityColors.bg}] border-[${priorityColors.border}]`
    }

    switch (variant) {
      case "success":
        return `bg-[${designTokens.colors.status.success.bg}] border-[${designTokens.colors.status.success.border}]`
      case "warning":
        return `bg-[${designTokens.colors.status.warning.bg}] border-[${designTokens.colors.status.warning.border}]`
      case "error":
        return `bg-[${designTokens.colors.status.error.bg}] border-[${designTokens.colors.status.error.border}]`
      case "info":
        return `bg-[${designTokens.colors.status.info.bg}] border-[${designTokens.colors.status.info.border}]`
      default:
        return "bg-gray-50 border-gray-200"
    }
  }

  const getTextColor = () => {
    if (priority) {
      return designTokens.colors.priority[priority].text
    }

    switch (variant) {
      case "success":
        return designTokens.colors.status.success.text
      case "warning":
        return designTokens.colors.status.warning.text
      case "error":
        return designTokens.colors.status.error.text
      case "info":
        return designTokens.colors.status.info.text
      default:
        return "#6b7280"
    }
  }

  return (
    <View
      className={`px-2 py-1 rounded-2xl border ${getVariantStyles()} ${className}`}
      accessibilityRole={role}
      accessibilityLabel={accessibilityLabel || `${variant || priority} status: ${text}`}
    >
      <Text className="text-xs font-medium" style={{ color: getTextColor() }} accessibilityRole="text">
        {text}
      </Text>
    </View>
  )
}
