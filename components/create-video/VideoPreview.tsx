"use client"

import { JSX } from "react"
import { Button } from "@/components/ui/button"
import { Download, Loader2, RotateCcw } from "lucide-react"

interface VideoPreviewProps {
  download: string
  videoUrl: string
  generated: boolean
  loading: boolean
  onRegenerate: () => void
  isRawVideo?: boolean
  isCaptioning?: boolean
}

export default function VideoPreview({
  download,
  videoUrl,
  generated,
  loading,
  onRegenerate,
  isRawVideo = false,
  isCaptioning = false
}: VideoPreviewProps): JSX.Element {
  return (
    <div className="w-full flex flex-col items-center gap-4">
      {generated && videoUrl ? (
        <>
          <div className="relative w-fit md:aspect-video rounded-3xl overflow-hidden border border--800 shadow-md shadow-indigo-500">
            <video
              className="w-full h-full object-"
              src={videoUrl}
              controls
              autoPlay
              loop
            />
            {isRawVideo && isCaptioning && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-yellow-300 text-sm py-1 px-2 text-center">
                Raw version - Captioned version is being prepared...
              </div>
            )}
          </div>
          <div className="flex justify-center gap-2">
            <Button
              onClick={onRegenerate}
              className="rounded-full gap-2 text-black"
              variant="outline"
              disabled={loading}
            >
              <RotateCcw className="h-4 w-4" />
              Regenerate
            </Button>
            <Button
              asChild
              className="rounded-full gap-2 bg-green-600 hover:bg-green-700"
              disabled={loading || !download}
            >
              <a href={download} download="generated-video.mp4" target="_blank" rel="noopener noreferrer">
                <Download className="h-4 w-4" />
                Download
              </a>
            </Button>
          </div>
        </>
      ) : loading ? (
        <div className="w-full aspect-video flex items-center justify-center bg-neutral-900 rounded-3xl">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
            <p className="text-lg font-medium">Generating your video...</p>
            <p className="text-sm text-neutral-400">This may take a minute or two</p>
          </div>
        </div>
      ) : (
        <div className="w-full aspect-video flex items-center justify-center bg-neutral-900 rounded-3xl">
          <p className="text-lg text-neutral-400">Video preview will appear here</p>
        </div>
      )}
    </div>
  )
}