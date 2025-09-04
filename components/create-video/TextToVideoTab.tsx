"use client";

import { JSX, useState, useEffect, useRef } from "react";
// import { SharedVideoProps } from "@/types/video";
import VideoForm from "./VideoForm";
import VideoPreview from "./VideoPreview";
import {
  CaptionVideo,
  generateNarration,
  generateViralNarration,
  generateVideo,
  RawVideo,
  storeVideoInSupabase,
} from "@/app/actions/video-actions";
import VideoFields from "./VideoFields";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { AlertCircle, Loader2, Video, Wand2 } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { FontName, ColorName } from "@/types/video";
import Example from "../Example";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { SubscriptionService } from "@/lib/subscription";
import { io, Socket } from "socket.io-client";
import { getSocket } from "@/lib/socket";
import { generateSlugAndEmail } from "@/utils/supabase/share-video";
import { useVideo } from "@/context/video-context";
import { X, ChevronDown } from "lucide-react";

export default function TextToVideoTab({}: // duration,

{}): JSX.Element {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const subscriptionService = new SubscriptionService();
  const [credits, setCredits] = useState<number | null>(null);

  // Use video context instead of local state
  const {
    // State
    prompt,
    narration,
    script,
    duration,
    voice,
    language,
    generated,
    error,
    loading,
    showNarrationEditor,
    showNarrationWarning,
    showPreviewDrawer,
    showPreviewWarning,
    playableVideoUrl,
    videoUrl,
    slug,
    isRawVideo,
    isCaptioning,
    isVideoLoading,
    videoGenerationStage,
    fontName,
    fontBaseColor,
    fontHighlightColor,
    videoStored,
    isGeneratingNarration,
    isGeneratingViralNarration,
    currentProgress,
    currentJobId,

    // Setters
    setPrompt,
    setNarration,
    setScript,
    setDuration,
    setVoice,
    setGenerated,
    setError,
    setLoading,
    setShowNarrationEditor,
    setShowNarrationWarning,
    setShowPreviewDrawer,
    setShowPreviewWarning,
    setPlayableVideoUrl,
    setVideoUrl,
    setIsRawVideo,
    setIsCaptioning,
    setIsVideoLoading,
    setVideoGenerationStage,
    setFontName,
    setFontBaseColor,
    setFontHighlightColor,
    setVideoStored,
    setIsGeneratingNarration,
    setIsGeneratingViralNarration,
    setCurrentProgress,
    setCurrentJobId,

    // Utility functions
    clearError,
  } = useVideo();

  // make slug url
  const slugUrl = slug ? `https://aigenreels.com/api/video/${slug}` : "";

  // Socket.IO references
  const socket = useRef<ReturnType<typeof getSocket>>(getSocket());

  // Fetch credits on mount
  useEffect(() => {
    const fetchCredits = async () => {
      if (!user) return;
      try {
        const sub = await subscriptionService.getUserSubscription(user.id);
        setCredits(sub?.credits_remaining ?? 0);
      } catch {
        setCredits(0);
      }
    };
    fetchCredits();
  }, [user]);

  const handleGenerateNarration = async (): Promise<void> => {
    if (!prompt) return;
    setIsGeneratingNarration(true);
    setError("");
    setGenerated(false);

    try {
      const narrationData = await generateNarration(prompt, duration, language);
      setScript(narrationData);
      setNarration(narrationData.script);
      setShowNarrationEditor(true);
    } catch (err) {
      console.error("Error generating narration:", err);
      setError(
        `Failed to generate narration: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    } finally {
      setIsGeneratingNarration(false);
    }
  };

  const handleGenerateViralNarration = async (): Promise<void> => {
    if (!prompt) return;

    setIsGeneratingViralNarration(true);
    setError("");
    setGenerated(false);

    try {
      const narrationData = await generateViralNarration(prompt, duration);
      setScript(narrationData);
      setNarration(narrationData.script);
      setShowNarrationEditor(true);
    } catch (err) {
      console.error("Error generating narration:", err);
      setError(
        `Failed to generate viral narration: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    } finally {
      setIsGeneratingViralNarration(true);
    }
  };

  const handleGenerateVideo = async (): Promise<void> => {
    if (!script || !user) return;
    if (credits === 0) {
      toast({
        title: "Insufficient Credits",
        description:
          "You do not have enough credits to generate a video. Please purchase more credits.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setError("");
    setGenerated(false);
    setVideoStored(false); // RESET STORAGE FLAG
    // storedJobId.current = ""; // Reset stored job ID for new generation
    setShowNarrationEditor(false);
    setIsRawVideo(false);
    setIsCaptioning(false);
    setVideoUrl("");
    setPlayableVideoUrl("");
    setIsVideoLoading(true);
    setVideoGenerationStage("Preparing video generation...");
    setCurrentProgress(0);

    // Open the preview drawer immediately when video generation starts
    setShowPreviewDrawer(true);

    try {
      // Update script with the edited narration
      const updatedScript = { ...script, script: narration };
      const jobId = await generateVideo(
        updatedScript,
        voice,
        language,
        duration,
        user.id,
        fontName,
        fontBaseColor,
        fontHighlightColor
      );

      console.log("Video generation job created:", jobId);

      // Set current job ID
      setCurrentJobId(jobId);

      // Emit watch_job event to start watching for updates
      if (socket.current && socket.current.connected) {
        console.log("Emitting watch_job event for job:", jobId);
        socket.current.emit("watch_job", { job_id: jobId });
        setVideoGenerationStage("Watching job progress...");
      } else {
        console.error("Socket not connected, cannot watch job");
        setVideoGenerationStage(
          "Connection error - please refresh and try again"
        );
      }

      // Get initial status from RawVideo API
      try {
        const initialData = await RawVideo(jobId);
        console.log("Initial Raw Video Status:", initialData);

        // Check if initialData exists and has status
        if (initialData && initialData.status) {
          setVideoGenerationStage(`Status: ${initialData.status}`);
        } else {
          console.log(
            "No initial status available, waiting for socket updates"
          );
          setVideoGenerationStage("Initializing video generation...");
        }

        // If video is already ready (unlikely but possible)
        if (initialData && initialData.raw_video_url) {
          setVideoUrl(initialData.raw_video_url);
          setPlayableVideoUrl(initialData.raw_video_url);
          setIsRawVideo(true);
          setLoading(false);
          setGenerated(true);
          setVideoGenerationStage("Raw video ready");
        }
      } catch (err) {
        console.error("Error getting initial video status:", err);
        // Don't throw error, just continue with socket updates
        setVideoGenerationStage("Waiting for video generation updates...");
      }

      // Socket will handle the rest of the updates
      // Wait for socket events to complete the process
    } catch (err) {
      console.error("Error in video generation process:", err);
      setError(
        `Failed to generate video: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
      setLoading(false);
      setIsVideoLoading(false);
      setCurrentJobId("");
    }
  };

  const handleNarrationDialogClose = (open: boolean) => {
    if (!open && showNarrationEditor) {
      setShowNarrationWarning(true);
    }
  };

  const confirmNarrationClose = () => {
    setShowNarrationEditor(false);
    setShowNarrationWarning(false);
    setPrompt("");
    setNarration("");
    setScript(null);
  };

  const handlePreviewDrawerClose = (open: boolean) => {
    if (!open && showPreviewDrawer) {
      setShowPreviewWarning(true);
    }
  };

  const confirmPreviewClose = () => {
    setShowPreviewDrawer(false);
    setShowPreviewWarning(false);
  };

  return (
    <div className="grid gap-4 sm:gap-6 grid-cols-1 xl:grid-cols-2 relative px-2 sm:px-4 md:px-6">
      <div>
        <div className="flex flex-col gap-3 sm:gap-5">
          <VideoForm
            textareaLabel="Prompt"
            textareaPlaceholder="A cinematic shot of a futuristic city with flying cars and neon lights..."
            textareaValue={prompt}
            onTextareaChange={(e: any) => setPrompt(e.target.value)}
            duration={duration}
            setDuration={setDuration}
            voice={voice}
            setVoice={setVoice}
            error={error}
            onSubmit={handleGenerateNarration}
            isSubmitDisabled={!prompt || loading}
            loading={loading}
            title="Video Description"
            description="Describe the video you want to generate in detail"
            fontName={fontName}
            setFontName={setFontName}
            fontBaseColor={fontBaseColor}
            setFontBaseColor={setFontBaseColor}
            fontHighlightColor={fontHighlightColor}
            setFontHighlightColor={setFontHighlightColor}
          />
          <VideoFields
            textareaLabel="Prompt"
            textareaPlaceholder="A cinematic shot of a futuristic city with flying cars and neon lights..."
            textareaValue={prompt}
            onTextareaChange={(e) => setPrompt(e.target.value)}
            duration={duration}
            setDuration={setDuration}
            voice={voice}
            language={language}
            setVoice={setVoice}
            error={error}
            onSubmit={handleGenerateNarration}
            isSubmitDisabled={!prompt || loading}
            loading={loading}
            title="Music Selection"
            description="Select your best music to add in background"
            fontName={fontName}
            setFontName={setFontName}
            fontBaseColor={fontBaseColor}
            setFontBaseColor={setFontBaseColor}
            fontHighlightColor={fontHighlightColor}
            setFontHighlightColor={setFontHighlightColor}
          />
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:gap-6">
        {narration && !showNarrationEditor && !generated ? (
          <div className="rounded-full w-fit mx-auto col-span-1 xl:col-span-2">
            <Button
              disabled={loading || !narration}
              className="rounded-full p-3 sm:p-4 bg-green-600 shadow-sm shadow-neutral-500 animate-pulse text-sm sm:text-base"
              onClick={() => setShowNarrationEditor(true)}
            >
              <Video className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="ml-2">Reopen Narration</span>
            </Button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4 w-full">
            <Button
              onClick={handleGenerateNarration}
              disabled={!prompt || loading}
              className="w-full sm:w-fit gap-2 bg-indigo-600 hover:bg-indigo-700 rounded-3xl text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3"
            >
              {isGeneratingNarration ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="hidden xs:inline">Generating...</span>
                  <span className="xs:hidden">Gen...</span>
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4" />
                  <span className="hidden xs:inline">Generate Narration</span>
                  <span className="xs:hidden">Gen Narration</span>
                </>
              )}
            </Button>

            <Button
              onClick={handleGenerateViralNarration}
              disabled={!prompt || loading}
              className="w-full sm:w-fit gap-2 bg-indigo-600 hover:bg-indigo-700 rounded-3xl text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3"
            >
              {isGeneratingViralNarration ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="hidden xs:inline">Generating...</span>
                  <span className="xs:hidden">Gen...</span>
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4" />
                  <span className="hidden xs:inline">Viral Narration</span>
                  <span className="xs:hidden">Viral</span>
                </>
              )}
            </Button>
          </div>
        )}

        <div>
          <Example />
        </div>
      </div>

      {/* Narration Editor Dialog - Enhanced Responsive */}
      <Dialog
        open={showNarrationEditor}
        onOpenChange={handleNarrationDialogClose}
      >
        <DialogContent className="w-[95vw] max-w-[95vw] sm:w-[90vw] sm:max-w-[600px] md:max-w-[700px] lg:max-w-[800px] bg-neutral-950 text-white border-none rounded-2xl sm:rounded-3xl shadow-sm shadow-neutral-500 max-h-[90vh] overflow-y-auto mx-2 sm:mx-auto">
          <DialogHeader className="px-2 sm:px-4 pt-4 sm:pt-6">
            <DialogTitle className="text-lg sm:text-xl font-semibold">
              Edit Narration
            </DialogTitle>
          </DialogHeader>
          <div className="px-2 sm:px-4 py-2 sm:py-4 space-y-3 sm:space-y-4">
            <Textarea
              className="w-full h-48 xs:h-60 sm:h-72 md:h-80 bg-neutral-900 border-none rounded-2xl sm:rounded-3xl text-sm sm:text-base p-3 sm:p-4 resize-none"
              value={narration}
              onChange={(e) => setNarration(e.target.value)}
              placeholder="Edit the generated narration here..."
            />
            <div className="flex flex-col xs:flex-row gap-2 text-xs sm:text-sm text-yellow-500 bg-yellow-500/10 p-3 rounded-xl">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5 xs:mt-0" />
              <p className="leading-relaxed">
                Don't switch{" "}
                <span className="font-bold text-yellow-200">
                  from Text To Video To Narration to Video
                </span>
                , you may lose your video and credit.
              </p>
            </div>
          </div>
          <DialogFooter className="flex-col xs:flex-row gap-2 xs:gap-3 px-2 sm:px-4 pb-4 sm:pb-6">
            <Button
              variant="outline"
              onClick={() => setShowNarrationWarning(true)}
              className="w-full xs:w-auto gap-2 bg-transparent rounded-2xl sm:rounded-3xl text-sm sm:text-base py-2 sm:py-3"
            >
              Cancel
            </Button>
            <Button
              onClick={handleGenerateVideo}
              disabled={loading || !narration}
              className="w-full xs:w-auto gap-2 bg-indigo-600 hover:bg-indigo-700 rounded-2xl sm:rounded-3xl text-sm sm:text-base py-2 sm:py-3"
            >
              Generate Video
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Narration Warning Dialog - Enhanced Responsive */}
      <Dialog
        open={showNarrationWarning}
        onOpenChange={setShowNarrationWarning}
      >
        <DialogContent className="w-[95vw] max-w-[95vw] xs:w-[90vw] xs:max-w-[400px] sm:max-w-[500px] bg-neutral-950 text-white border-none rounded-2xl sm:rounded-3xl shadow-sm shadow-neutral-500 mx-2 sm:mx-auto">
          <DialogHeader className="px-2 sm:px-4 pt-4 sm:pt-6">
            <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500 flex-shrink-0" />
              Warning
            </DialogTitle>
            <DialogDescription className="text-neutral-300 text-sm sm:text-base mt-2 leading-relaxed">
              Closing or canceling the narration editor may result in losing
              your credits and video progress. Are you sure you want to proceed?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col xs:flex-row gap-2 xs:gap-3 px-2 sm:px-4 pb-4 sm:pb-6 pt-2">
            <Button
              variant="outline"
              onClick={() => setShowNarrationWarning(false)}
              className="w-full xs:w-auto gap-2 bg-transparent rounded-2xl sm:rounded-3xl text-sm sm:text-base"
            >
              Continue Editing
            </Button>
            <Button
              variant="destructive"
              onClick={confirmNarrationClose}
              className="bg-indigo-600 hover:bg-indigo-700 w-full xs:w-auto gap-2 rounded-2xl sm:rounded-3xl text-sm sm:text-base"
            >
              Close Anyway
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Video Drawer - Enhanced Responsive with Fixed Close Button */}
      <Drawer open={showPreviewDrawer} onOpenChange={handlePreviewDrawerClose}>
        <DrawerContent className="text-white bg-black/90 sm:bg-transparent backdrop-blur-sm border-none shadow-md shadow-neutral-500 max-h-[95vh] sm:max-h-[100vh] overflow-hidden flex flex-col">
          {/* Fixed Header with Close Button */}
          <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-sm border-b border-white/10 px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between">
            <DrawerHeader className="text-center p-0 flex-1 flex items-center justify-center">
              <DrawerTitle className="text-base sm:text-lg md:text-xl">
                {videoUrl ? (
                  isRawVideo ? (
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                      <span className="text-center">Preview (Raw Video)</span>
                      {isCaptioning && (
                        <div className="flex items-center justify-center gap-1 text-yellow-300 text-xs sm:text-sm font-normal animate-pulse">
                          <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                          <span>Adding captions...</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-center">
                      Preview (Captioned Video)
                    </span>
                  )
                ) : (
                  <div className="flex flex-col xs:flex-row items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                    <span className="text-sm sm:text-base text-center">
                      {videoGenerationStage || "Generating Video..."}
                    </span>
                  </div>
                )}
              </DrawerTitle>
            </DrawerHeader>

            {/* Always visible close button */}
            {/* <Button
              onClick={() => setShowPreviewWarning(true)}
              className="ml-4 p-2 sm:p-3 bg-red-600 hover:bg-red-700 text-white rounded-full min-w-[44px] min-h-[44px] sm:min-w-[48px] sm:min-h-[48px] flex items-center justify-center shadow-lg z-50 touch-manipulation border-none"
              variant="default"
              size="sm"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="sr-only">Close</span>
            </Button> */}
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl px-3 sm:px-4 md:px-6 py-4 sm:py-6 flex flex-col gap-3 sm:gap-4">
              <div className="flex justify-center items-center w-full">
                {videoUrl ? (
                  <div className="w-full max-w-full">
                    <VideoPreview
                      download={slugUrl}
                      generated={generated}
                      videoUrl={videoUrl}
                      loading={loading}
                      onRegenerate={handleGenerateNarration}
                      isRawVideo={isRawVideo}
                      isCaptioning={isCaptioning}
                    />
                  </div>
                ) : (
                  <div className="w-full aspect-video flex flex-col items-center justify-center bg-neutral-900 rounded-lg">
                    <Loader2 className="h-8 w-8 sm:h-12 sm:w-12 animate-spin text-indigo-500 mb-3 sm:mb-4" />
                    <p className="text-base sm:text-lg">
                      <span className="text-base sm:text-lg font-medium text-white">
                        {currentProgress}%
                      </span>
                    </p>
                    <p className="text-xs sm:text-sm text-gray-400 mt-1 sm:mt-2 text-center px-4">
                      This may take a few minutes
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Action Area */}
          <div className="sticky bottom-0 bg-black/80 backdrop-blur-sm border-t border-white/10 px-3 sm:px-4 py-4 sm:py-6">
            <div className="flex flex-col gap-3 w-full max-w-sm mx-auto">
              <Button
                onClick={() => setShowPreviewWarning(true)}
                className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl sm:rounded-3xl text-sm sm:text-base py-3 sm:py-4 px-6 sm:px-8 font-medium shadow-lg border-none min-h-[48px] touch-manipulation"
                variant="default"
              >
                Close Preview
              </Button>

              {/* <DrawerClose asChild>
                <Button
                  className="w-full gap-2 bg-transparent border-2 border-white/20 hover:border-white/40 text-white rounded-2xl sm:rounded-3xl text-xs sm:text-sm py-2 sm:py-3 px-4 sm:px-6 min-h-[44px] touch-manipulation"
                  variant="outline"
                >
                  <ChevronDown className="h-4 w-4" />
                  Swipe Down to Close
                </Button>
              </DrawerClose> */}
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Preview Warning Dialog - Enhanced Responsive */}
      <Dialog open={showPreviewWarning} onOpenChange={setShowPreviewWarning}>
        <DialogContent className="w-[95vw] max-w-[95vw] xs:w-[90vw] xs:max-w-[400px] sm:max-w-[500px] bg-black/90 sm:bg-black/20 backdrop-blur-sm text-white border-none shadow-md shadow-indigo-500 rounded-2xl sm:rounded-3xl mx-2 sm:mx-auto">
          <DialogHeader className="px-2 sm:px-4 pt-4 sm:pt-6">
            <DialogTitle className="flex items-center gap-2 font-medium text-lg sm:text-xl">
              <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500 flex-shrink-0" />
              Warning
            </DialogTitle>
            <DialogDescription className="text-neutral-300 text-sm sm:text-base mt-2 leading-relaxed">
              Are you sure you want to close the preview ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="px-2 sm:px-4 pb-4 sm:pb-6 pt-2">
            <div className="flex flex-col xs:flex-row gap-2 xs:gap-3 w-full xs:w-auto xs:mx-auto">
              <Button
                variant="outline"
                onClick={() => setShowPreviewWarning(false)}
                className="w-full xs:w-auto gap-2 bg-transparent rounded-2xl sm:rounded-3xl text-sm sm:text-base"
              >
                Continue Viewing
              </Button>
              <Button
                variant="destructive"
                onClick={confirmPreviewClose}
                className="bg-indigo-600 hover:bg-indigo-700 w-full xs:w-auto gap-2 rounded-2xl sm:rounded-3xl text-sm sm:text-base"
              >
                Close Anyway
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Floating Reopen Button - Enhanced Responsive with better positioning */}
      {generated && !showPreviewDrawer && (
        <Button
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8 lg:bottom-16 lg:right-4 rounded-full p-3 sm:p-4 shadow-xl z-[100] text-sm sm:text-base 
           hover:bg-indigo-700 text-white border-none min-w-[52px] min-h-[52px] sm:min-w-[60px] sm:min-h-[60px] touch-manipulation"
          onClick={() => setShowPreviewDrawer(true)}
        >
          <Video className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="ml-2 hidden sm:inline">Reopen Preview</span>
          <span className="ml-1 sm:hidden text-xs">Preview</span>
        </Button>
      )}
    </div>
  );
}
