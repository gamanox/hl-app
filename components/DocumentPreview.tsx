import { View, Platform, Alert, Linking } from "react-native"
import { Button } from "./ui/Button"
import { Card } from "./ui/Card"
import { Download, Share, Mail } from "lucide-react-native"

// Platform-specific imports
let PdfReader: any = null
if (Platform.OS !== "web") {
  try {
    PdfReader = require("react-native-pdf").default
  } catch (error) {
    console.warn("react-native-pdf not available")
  }
}

interface DocumentPreviewProps {
  pdfUrl: string
  title?: string
  onDownload?: () => void
  onShare?: () => void
  onEmail?: () => void
  className?: string
}

export function DocumentPreview({
  pdfUrl,
  title = "Document",
  onDownload,
  onShare,
  onEmail,
  className,
}: DocumentPreviewProps) {
  const handleDownload = async () => {
    try {
      if (Platform.OS === "web") {
        // Web: trigger download
        const link = document.createElement("a")
        link.href = pdfUrl
        link.download = `${title}.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else {
        // Mobile: open in browser or external app
        await Linking.openURL(pdfUrl)
      }
      onDownload?.()
    } catch (error) {
      Alert.alert("Error", "Failed to download document")
    }
  }

  const handleShare = async () => {
    try {
      if (Platform.OS === "web") {
        // Web: use Web Share API or fallback to copy URL
        if (navigator.share) {
          await navigator.share({
            title: title,
            url: pdfUrl,
          })
        } else {
          await navigator.clipboard.writeText(pdfUrl)
          Alert.alert("Success", "Document URL copied to clipboard")
        }
      } else {
        // Mobile: use React Native sharing
        const { Share } = require("react-native")
        await Share.share({
          url: pdfUrl,
          title: title,
          message: `Check out this document: ${title}`,
        })
      }
      onShare?.()
    } catch (error) {
      Alert.alert("Error", "Failed to share document")
    }
  }

  const handleEmail = () => {
    try {
      const subject = encodeURIComponent(`Document: ${title}`)
      const body = encodeURIComponent(`Please find the attached document: ${pdfUrl}`)
      const mailtoUrl = `mailto:?subject=${subject}&body=${body}`

      if (Platform.OS === "web") {
        window.open(mailtoUrl)
      } else {
        Linking.openURL(mailtoUrl)
      }
      onEmail?.()
    } catch (error) {
      Alert.alert("Error", "Failed to open email client")
    }
  }

  const renderPdfViewer = () => {
    if (Platform.OS === "web") {
      // Web: use iframe
      return <iframe src={pdfUrl} className="w-full h-96 border border-border rounded-md" title={title} />
    } else {
      // Mobile: use react-native-pdf if available
      if (PdfReader) {
        return (
          <PdfReader
            source={{ uri: pdfUrl }}
            style={{
              flex: 1,
              width: "100%",
              height: 400,
            }}
            onLoadComplete={(numberOfPages: number) => {
              console.log(`[v0] PDF loaded with ${numberOfPages} pages`)
            }}
            onError={(error: any) => {
              console.error("[v0] PDF load error:", error)
              Alert.alert("Error", "Failed to load PDF")
            }}
          />
        )
      } else {
        // Fallback: show message and download button
        return (
          <View className="flex-1 items-center justify-center p-8 bg-muted rounded-md">
            <Text className="text-muted-foreground text-center mb-4">PDF preview not available on this device</Text>
            <Button onPress={handleDownload} variant="outline">
              <Download size={16} className="mr-2" />
              Open PDF
            </Button>
          </View>
        )
      }
    }
  }

  return (
    <Card className={`p-4 ${className}`}>
      <View className="mb-4">
        <Text className="text-lg font-semibold mb-2">{title}</Text>

        {/* Action Buttons */}
        <View className="flex-row gap-2 mb-4">
          <Button onPress={handleDownload} variant="outline" size="sm" className="flex-1 bg-transparent">
            <Download size={16} className="mr-2" />
            Download
          </Button>

          <Button onPress={handleShare} variant="outline" size="sm" className="flex-1 bg-transparent">
            <Share size={16} className="mr-2" />
            Share
          </Button>

          <Button onPress={handleEmail} variant="outline" size="sm" className="flex-1 bg-transparent">
            <Mail size={16} className="mr-2" />
            Email
          </Button>
        </View>
      </View>

      {/* PDF Viewer */}
      <View className="flex-1">{renderPdfViewer()}</View>
    </Card>
  )
}

// Export for use in other components
export default DocumentPreview
