import { Input as GluestackInput, InputField } from "@gluestack-ui/themed"
import type { ComponentProps } from "react"

interface InputProps extends ComponentProps<typeof InputField> {
  label?: string
  error?: string
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <GluestackInput
      variant="outline"
      size="md"
      className={`rounded-xl border-gray-200 ${error ? "border-error-500" : ""} ${className}`}
    >
      <InputField className="text-gray-900 placeholder:text-gray-500" {...props} />
    </GluestackInput>
  )
}
