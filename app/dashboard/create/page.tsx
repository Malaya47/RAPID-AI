// src/app/create-video/page.tsx
"use client"

import { JSX, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import TextToVideoTab from "@/components/create-video/TextToVideoTab"
import { DurationOption, VoiceOption } from "@/types/video"
import NarrationToVideoTab from "@/components/create-video/NarrationToVideoTab"
import { SidebarTrigger } from "@/components/ui/sidebar"


export default function CreateVideoPage(): JSX.Element {
  const [duration, setDuration] = useState<DurationOption>("30-45")
  const [voice, setVoice] = useState<VoiceOption>("alloy")
  const [generated, setGenerated] = useState<boolean>(false)
  const [videoUrl, setVideoUrl] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)

  // Shared state and handlers that will be passed to both tabs
  const sharedProps = {
    duration,
    setDuration,
    voice,
    setVoice,
    generated,
    setGenerated,
    videoUrl,
    setVideoUrl,
    error,
    setError,
    loading,
    setLoading
  }

  return (
    <div className="space-y-6 text-white w-full">
      <div>
        <div className="flex items-center gap-2">
          <SidebarTrigger />
          <h2 className="text-2xl font-bold ">Create New Video</h2>
        </div>
        <p className="text-muted-foreground">Generate a video using AI by describing what you want to see</p>
      </div>

      <Tabs defaultValue="text-to-video" className="w-full">
        <TabsList className="grid w-full max-w-xs grid-cols-2 bg-neutral-800 rounded-3xl">
          <TabsTrigger className="data-[state=active]:bg-neutral-100 rounded-3xl" value="text-to-video">Generate AI Script</TabsTrigger>
          <TabsTrigger className="data-[state=active]:bg-neutral-100 rounded-3xl" value="narration-to-video">Own Script</TabsTrigger>
        </TabsList>
        <TabsContent value="text-to-video" className="mt-4">
          <TextToVideoTab {...sharedProps} />
        </TabsContent>
        <TabsContent value="narration-to-video" className="mt-4">
          <NarrationToVideoTab {...sharedProps} />
        </TabsContent>
      </Tabs>
    </div>
  )
}