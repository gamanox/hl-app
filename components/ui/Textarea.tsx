import { TextInput } from "react-native"
import type { ComponentProps } from "react"

interface TextareaProps extends ComponentProps<typeof TextInput> {
  error?: string
}

export function Textarea({ error, className, ...props }: TextareaProps) {
  return (
    <TextInput
      multiline
      numberOfLines={4}
      textAlignVertical="top"
      className={`bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 ${
        error ? "border-error-500" : ""
      } ${className}`}
      placeholderTextColor="#9ca3af"
      {...props}
    />
  )
}
