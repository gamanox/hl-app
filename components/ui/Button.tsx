import { Button as GluestackButton, ButtonText } from "@gluestack-ui/themed"
import type { ComponentProps } from "react"
import { designTokens } from "@/lib/design-tokens"

interface ButtonProps extends ComponentProps<typeof GluestackButton> {
  title: string
  variant?: "solid" | "outline" | "ghost" | "destructive"
  size?: "sm" | "md" | "lg"
  state?: "default" | "loading" | "disabled"
  accessibilityLabel?: string
  accessibilityHint?: string
}

export function Button({
  title,
  variant = "solid",
  size = "md",
  state = "default",
  accessibilityLabel,
  accessibilityHint,
  className,
  ...props
}: ButtonProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "outline":
        return "border-2 border-primary-500 bg-transparent"
      case "ghost":
        return "bg-transparent"
      case "destructive":
        return "bg-error-500"
      default:
        return "bg-primary-500"
    }
  }

  const getSizeStyles = () => {
    switch (size) {
      case "sm":
        return `h-[${designTokens.touchTargets.sm}] px-3`
      case "lg":
        return `h-[${designTokens.touchTargets.xl}] px-6`
      default:
        return `h-[${designTokens.touchTargets.md}] px-4` // Ensures 44px minimum touch target
    }
  }

  const getStateStyles = () => {
    switch (state) {
      case "loading":
        return "opacity-75"
      case "disabled":
        return "opacity-50"
      default:
        return ""
    }
  }

  return (
    <GluestackButton
      variant={variant}
      size={size}
      className={`rounded-2xl ${getVariantStyles()} ${getSizeStyles()} ${getStateStyles()} ${className}`}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{
        disabled: state === "disabled",
        busy: state === "loading",
      }}
      disabled={state === "disabled" || state === "loading"}
      {...props}
    >
      <ButtonText
        className={`font-semibold ${variant === "outline" ? "text-primary-500" : variant === "ghost" ? "text-foreground" : "text-white"}`}
      >
        {state === "loading" ? "Loading..." : title}
      </ButtonText>
    </GluestackButton>
  )
}
