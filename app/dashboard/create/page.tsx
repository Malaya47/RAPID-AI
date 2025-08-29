// src/app/create-video/page.tsx
"use client";

import { JSX, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TextToVideoTab from "@/components/create-video/TextToVideoTab";
// import { DurationOption, VoiceOption } from "@/types/video";
import NarrationToVideoTab from "@/components/create-video/NarrationToVideoTab";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useVideo } from "@/context/video-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CreateVideoPage(): JSX.Element {
  // const [duration, setDuration] = useState<DurationOption>("30-45")
  // const [voice, setVoice] = useState<VoiceOption>("alloy")
  // const [generated, setGenerated] = useState<boolean>(false)
  // const [videoUrl, setVideoUrl] = useState<string>("")
  // const [error, setError] = useState<string>("")
  // const [loading, setLoading] = useState<boolean>(false)

  // Shared state and handlers that will be passed to both tabs
  // const sharedProps = {
  //   duration,
  //   setDuration,
  //   voice,
  //   setVoice,
  //   generated,
  //   setGenerated,
  //   videoUrl,
  //   setVideoUrl,
  //   error,
  //   setError,
  //   loading,
  //   setLoading
  // }
  const { playableVideoUrl, currentProgress, setLanguage } = useVideo();

  return (
    <div className="relative space-y-6 text-white w-full min-h-screen">
      {/* Loading Percentage UI */}
      {currentProgress !== 0 && currentProgress !== 100 && (
        <div className="fixed top-4 right-4 bg-indigo-500 text-white px-4 py-2 rounded-xl shadow-lg z-50">
          Generating video... {currentProgress}%
        </div>
      )}
      <div>
        <div className="flex items-center gap-2">
          <SidebarTrigger />
          <h2 className="text-2xl font-bold ">Create New Video</h2>
        </div>
        <p className="text-muted-foreground">
          Generate a video using AI by describing what you want to see
        </p>
      </div>

      <Tabs defaultValue="text-to-video" className="w-full">
        <TabsList className="grid w-full max-w-xs grid-cols-2 bg-neutral-800 rounded-3xl">
          <TabsTrigger
            className="data-[state=active]:bg-neutral-100 rounded-3xl"
            value="text-to-video"
          >
            Generate AI Script
          </TabsTrigger>
          <TabsTrigger
            className="data-[state=active]:bg-neutral-100 rounded-3xl"
            value="narration-to-video"
          >
            Own Script
          </TabsTrigger>
        </TabsList>
        {/* Language Selector */}
        <div className="mt-5 w-40">
          <Select
            defaultValue="English"
            // onValueChange={(value) => setLanguage(value)} // capture value here
            onValueChange={(value) => {
              setLanguage(value);
            }}
          >
            <SelectTrigger className="rounded-3xl bg-neutral-800 text-white">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="English">English</SelectItem>
              <SelectItem value="hindi">Hindi</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <TabsContent value="text-to-video" className="mt-4">
          {/* <TextToVideoTab {...sharedProps} /> */}
          <TextToVideoTab />
        </TabsContent>
        <TabsContent value="narration-to-video" className="mt-4">
          {/* <NarrationToVideoTab {...sharedProps} /> */}
          <h1>Feature coming soon.....</h1>
        </TabsContent>
      </Tabs>
    </div>
  );
}
