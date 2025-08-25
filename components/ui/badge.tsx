import type * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-2xl border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        success: "border-transparent bg-green-100 text-green-800 hover:bg-green-200",
        warning: "border-transparent bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
        info: "border-transparent bg-blue-100 text-blue-800 hover:bg-blue-200",
      },
      priority: {
        low: "border-transparent bg-gray-100 text-gray-700",
        normal: "border-transparent bg-blue-100 text-blue-700",
        high: "border-transparent bg-yellow-100 text-yellow-700",
        urgent: "border-transparent bg-red-100 text-red-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {
  role?: "status" | "img" | "text"
}

function Badge({ className, variant, priority, role = "status", ...props }: BadgeProps) {
  return (
    <div
      className={cn(badgeVariants({ variant, priority }), className)}
      role={role}
      aria-label={role === "status" ? `Status: ${props.children}` : undefined}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
