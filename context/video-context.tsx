"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from "react";
import { getSocket } from "@/lib/socket";
import { FontName, ColorName } from "@/types/video";
import { useAuth } from "@/context/auth-context";
import { storeVideoInSupabase } from "@/app/actions/video-actions";
import { generateSlugAndEmail } from "@/utils/supabase/share-video";
import { useToast } from "@/hooks/use-toast";

// Types
interface VideoState {
  // Video Generation States
  prompt: string;
  narration: string;
  script: any | null;
  duration: string;
  voice: string;

  // Language Selection
  language: string;

  // Video URLs and Status
  videoUrl: string;
  playableVideoUrl: string;
  isRawVideo: boolean;
  thumbnailUrl: string;
  slug: string;

  // Loading and Generation States
  loading: boolean;
  generated: boolean;
  error: string;
  isVideoLoading: boolean;
  isCaptioning: boolean;
  videoGenerationStage: string;
  currentProgress: number;

  // UI States
  showNarrationEditor: boolean;
  showPreviewDrawer: boolean;
  showNarrationWarning: boolean;
  showPreviewWarning: boolean;

  // Font and Style Settings
  fontName: FontName;
  fontBaseColor: ColorName;
  fontHighlightColor: ColorName;

  // Job Management
  currentJobId: string;
  videoStored: boolean;

  // Narration Generation States
  isGeneratingNarration: boolean;
  isGeneratingViralNarration: boolean;
}

interface VideoContextType extends VideoState {
  // State Setters
  setPrompt: (prompt: string) => void;
  setNarration: (narration: string) => void;
  setScript: (script: any) => void;
  setDuration: (duration: number) => void;
  setVoice: (voice: string) => void;
  setLanguage: (language: string) => void;
  setVideoUrl: (url: string) => void;
  setPlayableVideoUrl: (url: string) => void;
  setIsRawVideo: (isRaw: boolean) => void;
  setThumbnailUrl: (thumbnailUrl: string) => void;
  setSlug: (slug: string) => void;
  setLoading: (loading: boolean) => void;
  setGenerated: (generated: boolean) => void;
  setError: (error: string) => void;
  setIsVideoLoading: (loading: boolean) => void;
  setIsCaptioning: (captioning: boolean) => void;
  setVideoGenerationStage: (stage: string) => void;
  setCurrentProgress: (progress: number) => void;
  setShowNarrationEditor: (show: boolean) => void;
  setShowPreviewDrawer: (show: boolean) => void;
  setFontName: (font: FontName) => void;
  setFontBaseColor: (color: ColorName) => void;
  setFontHighlightColor: (color: ColorName) => void;
  setCurrentJobId: (jobId: string) => void;
  setVideoStored: (stored: boolean) => void;
  setIsGeneratingNarration: (generating: boolean) => void;
  setIsGeneratingViralNarration: (generating: boolean) => void;
  setShowPreviewWarning: (show: boolean) => void;
  setShowNarrationWarning: (show: boolean) => void;

  // Utility Functions
  resetVideoState: () => void;
  clearError: () => void;
}

const VideoContext = createContext<VideoContextType | undefined>(undefined);

const languageFontDefaults: Record<string, FontName[]> = {
  English: [
    "Anton",
    "Bangers",
    "BebasNeue",
    "Impact",
    "Knewave",
    "LeagueSpartan",
    "Montserrat",
    "PoetsenOne",
    "Poppins",
  ],
  hindi: ["NotoSansDevanagari"],
};

const initialLanguage = "English";

// Initial state
const initialVideoState: VideoState = {
  prompt: "",
  narration: "",
  script: null,
  duration: "30",
  voice: "alloy",
  language: initialLanguage,
  videoUrl: "",
  playableVideoUrl: "",
  isRawVideo: false,
  thumbnailUrl: "",
  slug: "",
  loading: false,
  generated: false,
  error: "",
  isVideoLoading: false,
  isCaptioning: false,
  videoGenerationStage: "",
  currentProgress: 0,
  showNarrationEditor: false,
  showPreviewDrawer: false,
  showNarrationWarning: false,
  showPreviewWarning: false,
  fontName: languageFontDefaults[initialLanguage][0], // Default tied to language
  fontBaseColor: "white",
  fontHighlightColor: "indigo",
  currentJobId: "",
  videoStored: false,
  isGeneratingNarration: false,
  isGeneratingViralNarration: false,
};

interface VideoProviderProps {
  children: ReactNode;
}

export function VideoProvider({ children }: VideoProviderProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  // States
  const [state, setState] = useState<VideoState>(initialVideoState);
  const rawVideoToastShown = useRef(false);
  const captionedVideoToastShown = useRef(false);

  // Socket and job management
  const socket = useRef(getSocket());
  const storedJobId = useRef<string>("");

  // Progress simulation
  const totalDurationInSeconds = 120; // 2 minutes
  const maxSimulatedProgress = 100;
  const progressIncrement = maxSimulatedProgress / totalDurationInSeconds;

  // Socket setup and cleanup
  useEffect(() => {
    socket.current.off("job_status_update");

    socket.current.on(
      "job_status_update",
      (data: {
        status: string;
        raw_video_url?: string;
        captioned_video_url?: string;
        job_id: string;
        thumbnail_url?: string;
      }) => {
        console.log("Socket job status update:", data);

        // Only process updates for the current job
        if (data.job_id !== state.currentJobId) {
          console.log(
            `Ignoring update for job ${data.job_id}, current job is ${state.currentJobId}`
          );
          return;
        }

        // Update generation stage
        setState((prev) => ({
          ...prev,
          videoGenerationStage: `Status: ${data.status}`,
        }));

        // Handle raw video URL
        if (data.raw_video_url && !rawVideoToastShown.current) {
          console.log("Raw video URL received via socket:", data.raw_video_url);
          rawVideoToastShown.current = true;
          toast({
            title: "Raw video ready",
            description: "Your raw video is ready...",
            variant: "default",
          });
          setState((prev) => ({
            ...prev,
            videoUrl: data.raw_video_url ?? "",
            playableVideoUrl: data.raw_video_url ?? "",
            isRawVideo: true,
            loading: false,
            generated: true,
            videoGenerationStage: "Raw video ready",
            isCaptioning: true,
          }));
        }

        // Handle thumbnail URL
        if (data.thumbnail_url) {
          setState((prev) => ({
            ...prev,
            thumbnailUrl: data.thumbnail_url ?? "",
          }));
        }

        // Handle captioned video URL (final result)
        if (data.captioned_video_url) {
          console.log(
            "Captioned video URL received via socket:",
            data.captioned_video_url
          );
          setState((prev) => ({
            ...prev,
            videoUrl: data.captioned_video_url ?? "",
            playableVideoUrl: data.captioned_video_url ?? "",
            isRawVideo: false,
            isCaptioning: false,
            isVideoLoading: false,
            videoGenerationStage: "Captioned video ready",
            currentProgress: 100,
            generated: true,
          }));
        }

        // Handle completion or error states
        if (
          data.status === "completed" ||
          data.status === "failed" ||
          data.status === "error"
        ) {
          setState((prev) => ({
            ...prev,
            loading: false,
            isVideoLoading: false,
            isCaptioning: false,
          }));

          if (data.status === "failed" || data.status === "error") {
            setState((prev) => ({
              ...prev,
              error: "Video generation failed. Please try again.",
            }));

            toast({
              title: "Video generation failed",
              description:
                "Try again, there might be an issue in generating video. Your credit will not be deducted.",
              variant: "destructive",
            });
          }
        }
      }
    );

    return () => {
      // Don't disconnect socket on unmount - keep it alive for global updates
      socket.current.off("job_status_update");
    };
  }, [state.currentJobId, toast]);

  // Progress simulation effect
  useEffect(() => {
    if (!state.loading) return;

    let progress = 0;
    const interval = setInterval(() => {
      progress += progressIncrement;
      if (progress >= maxSimulatedProgress) {
        progress = maxSimulatedProgress;
        clearInterval(interval);
      }
      setState((prev) => ({
        ...prev,
        currentProgress: Math.floor(progress),
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [state.loading, progressIncrement, maxSimulatedProgress]);

  // Set progress to 100 when generated
  useEffect(() => {
    if (state.generated && !state.loading) {
      setState((prev) => ({
        ...prev,
        currentProgress: 100,
      }));
    }
  }, [state.generated, state.loading]);

  // Auto-store video when captioned video is ready
  useEffect(() => {
    const storeVideo = async () => {
      console.log("storeVideo useEffect triggered with:", {
        videoUrl: state.videoUrl,
        isRawVideo: state.isRawVideo,
        hasUser: !!user,
        generated: state.generated,
        videoGenerationStage: state.videoGenerationStage,
        videoStored: state.videoStored,
        currentJobId: state.currentJobId,
        storedJobId: storedJobId.current,
      });

      // Only store CAPTIONED videos (final processed videos with captions)
      if (
        !state.videoUrl ||
        state.isRawVideo ||
        !user ||
        !state.generated ||
        state.videoGenerationStage !== "Captioned video ready" ||
        state.videoStored ||
        !state.currentJobId ||
        storedJobId.current === state.currentJobId
      ) {
        console.log(
          "Skipping video storage - waiting for captioned video or already stored"
        );
        return;
      }

      if (captionedVideoToastShown.current) return; // ✅ Prevent duplicate
      captionedVideoToastShown.current = true; // ✅ Set flag before awaiting anything

      toast({
        title: "Captioned video saved",
        description: "Your captioned video has been saved to your account.",
      });

      console.log("Storing CAPTIONED video for job:", state.currentJobId);

      try {
        setState((prev) => ({
          ...prev,
          videoGenerationStage: "Saving captioned video to database...",
          videoStored: true,
        }));

        storedJobId.current = state.currentJobId;

        await storeVideoInSupabase({
          videoUrl: state.videoUrl,
          userId: user.id,
          duration: state.duration,
          title: state.prompt,
          description: state.narration,
          fontName: state.fontName,
          baseFontColor: state.fontBaseColor,
          highlightWordColor: state.fontHighlightColor,
          thumbnailUrl: state.thumbnailUrl,
        });

        console.log(
          "Captioned video stored in Supabase successfully for job:",
          state.currentJobId
        );

        // Clear narration and script after successful storage
        setState((prev) => ({
          ...prev,
          narration: "",
          script: null,
          prompt: "",
        }));

        // Generate slug + send email
        const slug = await generateSlugAndEmail({
          videoUrl: state.videoUrl,
          userEmail: user.email ?? "",
        });

        if (slug) {
          console.log("Slug generated and email sent:", slug);
          setSlug(slug);
        } else {
          console.warn("Slug or email failed");
        }

        setState((prev) => ({
          ...prev,
          videoGenerationStage: "Captioned video saved successfully",
          currentJobId: "",
        }));
      } catch (storeErr) {
        console.error("Error storing captioned video in Supabase:", storeErr);
        setState((prev) => ({
          ...prev,
          videoStored: false,
          error:
            storeErr instanceof Error &&
            storeErr.message === "Insufficient credits"
              ? "You don't have enough credits to generate this video. Please purchase more credits."
              : `Captioned video generated but failed to save: ${
                  storeErr instanceof Error ? storeErr.message : "Unknown error"
                }`,
        }));
        storedJobId.current = "";
      }
    };

    storeVideo();
  }, [
    state.videoUrl,
    state.isRawVideo,
    user?.id,
    state.generated,
    state.videoGenerationStage,
    state.videoStored,
    state.currentJobId,
    state.duration,
    state.prompt,
    state.narration,
    user?.email,
  ]);

  // State setters
  const setPrompt = (prompt: string) =>
    setState((prev) => ({ ...prev, prompt }));
  const setNarration = (narration: string) =>
    setState((prev) => ({ ...prev, narration }));
  const setScript = (script: any) => setState((prev) => ({ ...prev, script }));
  const setDuration = (duration: number) =>
    setState((prev) => ({ ...prev, duration: duration.toString() }));
  const setVoice = (voice: string) => setState((prev) => ({ ...prev, voice }));
  const setLanguage = (language: string) =>
    setState((prev) => ({
      ...prev,
      language,
      fontName: languageFontDefaults[language]?.[0] ?? prev.fontName,
    }));
  const setVideoUrl = (videoUrl: string) =>
    setState((prev) => ({ ...prev, videoUrl }));
  const setPlayableVideoUrl = (playableVideoUrl: string) =>
    setState((prev) => ({ ...prev, playableVideoUrl }));
  const setIsRawVideo = (isRawVideo: boolean) =>
    setState((prev) => ({ ...prev, isRawVideo }));
  const setThumbnailUrl = (thumbnailUrl: string) =>
    setState((prev) => ({ ...prev, thumbnailUrl }));
  const setSlug = (slug: string) => setState((prev) => ({ ...prev, slug }));
  const setLoading = (loading: boolean) =>
    setState((prev) => ({ ...prev, loading }));
  const setGenerated = (generated: boolean) =>
    setState((prev) => ({ ...prev, generated }));
  const setError = (error: string) => setState((prev) => ({ ...prev, error }));
  const setIsVideoLoading = (isVideoLoading: boolean) =>
    setState((prev) => ({ ...prev, isVideoLoading }));
  const setIsCaptioning = (isCaptioning: boolean) =>
    setState((prev) => ({ ...prev, isCaptioning }));
  const setVideoGenerationStage = (videoGenerationStage: string) =>
    setState((prev) => ({ ...prev, videoGenerationStage }));
  const setCurrentProgress = (currentProgress: number) =>
    setState((prev) => ({ ...prev, currentProgress }));
  const setShowNarrationEditor = (showNarrationEditor: boolean) =>
    setState((prev) => ({ ...prev, showNarrationEditor }));
  const setShowPreviewDrawer = (showPreviewDrawer: boolean) =>
    setState((prev) => ({ ...prev, showPreviewDrawer }));
  const setFontName = (fontName: FontName) =>
    setState((prev) => ({ ...prev, fontName }));
  const setFontBaseColor = (fontBaseColor: ColorName) =>
    setState((prev) => ({ ...prev, fontBaseColor }));
  const setFontHighlightColor = (fontHighlightColor: ColorName) =>
    setState((prev) => ({ ...prev, fontHighlightColor }));
  const setCurrentJobId = (currentJobId: string) => {
    rawVideoToastShown.current = false;
    captionedVideoToastShown.current = false;
    setState((prev) => ({ ...prev, currentJobId }));
  };
  const setVideoStored = (videoStored: boolean) =>
    setState((prev) => ({ ...prev, videoStored }));
  const setIsGeneratingNarration = (isGeneratingNarration: boolean) =>
    setState((prev) => ({ ...prev, isGeneratingNarration }));
  const setIsGeneratingViralNarration = (isGeneratingViralNarration: boolean) =>
    setState((prev) => ({ ...prev, isGeneratingViralNarration }));

  // Utility functions
  const resetVideoState = () => {
    setState(initialVideoState);
    storedJobId.current = "";
    rawVideoToastShown.current = false;
    captionedVideoToastShown.current = false;
  };

  const clearError = () => setState((prev) => ({ ...prev, error: "" }));

  // Watch job function that components can call
  const watchJob = (jobId: string) => {
    if (socket.current && socket.current.connected) {
      console.log("Emitting watch_job event for job:", jobId);
      socket.current.emit("watch_job", { job_id: jobId });
      setState((prev) => ({
        ...prev,
        currentJobId: jobId,
        videoGenerationStage: "Watching job progress...",
      }));
    } else {
      console.error("Socket not connected, cannot watch job");
      setState((prev) => ({
        ...prev,
        videoGenerationStage: "Connection error - please refresh and try again",
      }));
    }
  };

  const setShowPreviewWarning = (showPreviewWarning: boolean) =>
    setState((prev) => ({ ...prev, showPreviewWarning }));
  const setShowNarrationWarning = (showNarrationWarning: boolean) =>
    setState((prev) => ({ ...prev, showNarrationWarning }));

  const contextValue: VideoContextType = {
    ...state,
    setPrompt,
    setNarration,
    setScript,
    setDuration,
    setVoice,
    setLanguage,
    setVideoUrl,
    setPlayableVideoUrl,
    setIsRawVideo,
    setThumbnailUrl,
    setSlug,
    setLoading,
    setGenerated,
    setError,
    setIsVideoLoading,
    setIsCaptioning,
    setVideoGenerationStage,
    setCurrentProgress,
    setShowNarrationEditor,
    setShowPreviewDrawer,
    setFontName,
    setFontBaseColor,
    setFontHighlightColor,
    setCurrentJobId,
    setVideoStored,
    setIsGeneratingNarration,
    setIsGeneratingViralNarration,
    setShowPreviewWarning,
    setShowNarrationWarning,
    resetVideoState,
    clearError,
  };

  return (
    <VideoContext.Provider value={contextValue}>
      {children}
    </VideoContext.Provider>
  );
}

// Custom hook to use the video context
export function useVideo(): VideoContextType {
  const context = useContext(VideoContext);
  if (context === undefined) {
    throw new Error("useVideo must be used within a VideoProvider");
  }
  return context;
}
