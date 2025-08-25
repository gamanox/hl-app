export const designTokens = {
  // Border Radius
  radius: {
    none: "0px",
    sm: "4px",
    md: "8px",
    lg: "12px",
    xl: "16px",
    "2xl": "20px",
    "3xl": "24px",
    full: "9999px",
  },

  // Shadows with proper contrast for accessibility
  shadows: {
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
  },

  // Grid and Spacing (8px base unit for consistency)
  spacing: {
    0: "0px",
    1: "4px",
    2: "8px",
    3: "12px",
    4: "16px",
    5: "20px",
    6: "24px",
    8: "32px",
    10: "40px",
    12: "48px",
    16: "64px",
    20: "80px",
    24: "96px",
    32: "128px",
  },

  // Touch targets (minimum 44px for accessibility)
  touchTargets: {
    sm: "40px",
    md: "44px", // WCAG minimum
    lg: "48px",
    xl: "56px",
  },

  // Typography with proper line heights for readability
  typography: {
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2,
    },
    fontSize: {
      xs: "12px",
      sm: "14px",
      base: "16px",
      lg: "18px",
      xl: "20px",
      "2xl": "24px",
      "3xl": "30px",
    },
  },

  // Color system with AA contrast ratios
  colors: {
    // Status colors with proper contrast
    status: {
      success: {
        bg: "#dcfce7",
        text: "#166534",
        border: "#bbf7d0",
      },
      warning: {
        bg: "#fef3c7",
        text: "#92400e",
        border: "#fde68a",
      },
      error: {
        bg: "#fee2e2",
        text: "#dc2626",
        border: "#fecaca",
      },
      info: {
        bg: "#dbeafe",
        text: "#1d4ed8",
        border: "#bfdbfe",
      },
    },
    // Priority colors
    priority: {
      low: {
        bg: "#f3f4f6",
        text: "#6b7280",
        border: "#d1d5db",
      },
      normal: {
        bg: "#dbeafe",
        text: "#1d4ed8",
        border: "#bfdbfe",
      },
      high: {
        bg: "#fef3c7",
        text: "#92400e",
        border: "#fde68a",
      },
      urgent: {
        bg: "#fee2e2",
        text: "#dc2626",
        border: "#fecaca",
      },
    },
  },

  // Animation durations
  animation: {
    fast: "150ms",
    normal: "300ms",
    slow: "500ms",
  },
} as const

export type DesignTokens = typeof designTokens
