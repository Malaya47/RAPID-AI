"use client";

import { JSX, useState, useEffect, useRef } from "react";
import { SharedVideoProps } from "@/types/video";
import VideoForm from "./VideoForm";
import VideoPreview from "./VideoPreview";
import {
  CaptionVideo,
  generateNarration,
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
import { generateSlugAndEmail } from "@/utils/supabase/share-video";

export default function TextToVideoTab({
  duration,
  setDuration,
  voice,
  setVoice,
  generated,
  setGenerated,
  error,
  setError,
  loading,
  setLoading,
}: SharedVideoProps): JSX.Element {
  const { user } = useAuth();
  const router = useRouter();
  const [prompt, setPrompt] = useState<string>("");
  const [narration, setNarration] = useState<string>("");
  const [script, setScript] = useState<any | null>(null);
  const [showNarrationEditor, setShowNarrationEditor] =
    useState<boolean>(false);
  const [showNarrationWarning, setShowNarrationWarning] =
    useState<boolean>(false);
  const [showPreviewDrawer, setShowPreviewDrawer] = useState<boolean>(false);
  const [showPreviewWarning, setShowPreviewWarning] = useState<boolean>(false);
  const [playableVideoUrl, setPlayableVideoUrl] = useState<string>("");
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [isRawVideo, setIsRawVideo] = useState<boolean>(false);
  const [isCaptioning, setIsCaptioning] = useState<boolean>(false);
  const [isVideoLoading, setIsVideoLoading] = useState<boolean>(false);
  const [videoGenerationStage, setVideoGenerationStage] = useState<string>("");
  const [fontName, setFontName] = useState<FontName>("Anton-Regular.ttf");
  const [fontBaseColor, setFontBaseColor] = useState<ColorName>("white");
  const [fontHighlightColor, setFontHighlightColor] =
    useState<ColorName>("indigo");
  const { toast } = useToast();
  const subscriptionService = new SubscriptionService();
  const [credits, setCredits] = useState<number | null>(null);
  const [videoStored, setVideoStored] = useState<boolean>(false);

  // Socket.IO references
  const socket = useRef<Socket | null>(null);
  const currentJobId = useRef<string>("");
  const storedJobId = useRef<string>(""); // Track which job has been stored

  const [currentProgress, setCurrentProgress] = useState(0);

  const totalDurationInSeconds = 360; // 6 minutes
  const maxSimulatedProgress = 98;
  const progressIncrement = maxSimulatedProgress / totalDurationInSeconds;

  // Initialize Socket.IO connection on mount
  useEffect(() => {
    // Initialize socket connection
    socket.current = io(process.env.NEXT_PUBLIC_RAILWAY_API_KEY, {
      transports: ["websocket"],
      autoConnect: true,
    });

    // Listen for job status updates
    socket.current.on(
      "job_status_update",
      (data: {
        status: string;
        raw_video_url?: string;
        captioned_video_url?: string;
        job_id: string;
      }) => {
        console.log("Socket job status update:", data);

        // Only process updates for the current job
        if (data.job_id !== currentJobId.current) {
          return;
        }

        // Update generation stage
        setVideoGenerationStage(`Status: ${data.status}`);

        // Handle raw video URL
        if (data.raw_video_url) {
          console.log("Raw video URL received via socket:", data.raw_video_url);
          setVideoUrl(data.raw_video_url);
          setPlayableVideoUrl(data.raw_video_url);
          setIsRawVideo(true);
          setLoading(false);

          setGenerated(true);

          setVideoGenerationStage("Raw video ready");

          // Start captioning process
          setIsCaptioning(true);
          setVideoGenerationStage("Adding captions...");
        }

        // Handle captioned video URL (final result)
        if (data.captioned_video_url) {
          console.log(
            "Captioned video URL received via socket:",
            data.captioned_video_url
          );
          setVideoUrl(data.captioned_video_url);
          setPlayableVideoUrl(data.captioned_video_url);
          setIsRawVideo(false);
          setIsCaptioning(false);
          setIsVideoLoading(false);
          setVideoGenerationStage("Captioned video ready");
          setCurrentProgress(100);

          // Mark as generated only when captioned video is ready
          setGenerated(true);
        }

        // Handle completion or error states
        if (
          data.status === "completed" ||
          data.status === "failed" ||
          data.status === "error"
        ) {
          setLoading(false);
          setIsVideoLoading(false);
          setIsCaptioning(false);

          if (data.status === "failed" || data.status === "error") {
            setError("Video generation failed. Please try again.");
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

    // Handle socket connection events
    socket.current.on("connect", () => {
      console.log("Socket connected:", socket.current?.id);
    });

    socket.current.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    socket.current.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    // Cleanup on unmount
    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, []);

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

  useEffect(() => {
    if (!loading) return;

    let progress = 0;

    const interval = setInterval(() => {
      progress += progressIncrement;
      if (progress >= maxSimulatedProgress) {
        progress = maxSimulatedProgress;
        clearInterval(interval);
      }
      setCurrentProgress(Math.floor(progress));
    }, 1000); // Update every 1 second

    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    if (generated && !loading) {
      setCurrentProgress(100);
    }
  }, [generated, loading]);

  const handleGenerateNarration = async (): Promise<void> => {
    if (!prompt) return;

    setLoading(true);
    setError("");
    setGenerated(false);

    try {
      const narrationData = await generateNarration(prompt, duration);
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
      setLoading(false);
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
    storedJobId.current = ""; // Reset stored job ID for new generation
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
        duration,
        user.id,
        fontName,
        fontBaseColor,
        fontHighlightColor
      );

      console.log("Video generation job created:", jobId);
      currentJobId.current = jobId;

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
      currentJobId.current = "";
    }
  };

  // Handle storing video when final URL is available
  useEffect(() => {
    const storeVideo = async () => {
      console.log("storeVideo useEffect triggered with:", {
        videoUrl: videoUrl,
        isRawVideo,
        hasUser: !!user,
        generated,
        videoGenerationStage,
        videoStored,
        currentJobId: currentJobId.current,
        storedJobId: storedJobId.current,
      });

      // Only store CAPTIONED videos (final processed videos with captions)
      // Skip if:
      // 1. No video URL
      // 2. It's a raw video (not captioned yet)
      // 3. No user
      // 4. Not marked as generated (final)
      // 5. Not in "Captioned video ready" stage
      // 6. Already stored
      // 7. No current job ID
      // 8. Already stored this specific job
      if (
        !videoUrl ||
        isRawVideo || // IMPORTANT: Skip raw videos, only store captioned videos
        !user ||
        !generated || // Only store when finally generated (set to true only for captioned videos)
        videoGenerationStage !== "Captioned video ready" || // Only store when captions are done
        videoStored ||
        !currentJobId.current ||
        storedJobId.current === currentJobId.current
      ) {
        console.log(
          "Skipping video storage - waiting for captioned video or already stored"
        );
        return;
      }

      console.log("Storing CAPTIONED video for job:", currentJobId.current);

      try {
        setVideoGenerationStage("Saving captioned video to database...");
        setVideoStored(true);
        storedJobId.current = currentJobId.current;

        await storeVideoInSupabase(
          videoUrl, // This will be the captioned video URL
          user.id,
          duration,
          prompt,
          narration
        );
        console.log(
          "Captioned video stored in Supabase successfully for job:",
          currentJobId.current
        );
        // ✅ NEW: Generate slug + send email
        const slug = await generateSlugAndEmail({
          videoUrl,
          userEmail: user.email ?? "",
        });

        if (slug) {
          console.log("Slug generated and email sent:", slug);
        } else {
          console.warn("Slug or email failed");
        }
        setVideoGenerationStage("Captioned video saved successfully");
        currentJobId.current = "";
      } catch (storeErr) {
        console.error("Error storing captioned video in Supabase:", storeErr);
        setVideoStored(false);
        storedJobId.current = "";

        if (
          storeErr instanceof Error &&
          storeErr.message === "Insufficient credits"
        ) {
          setError(
            "You don't have enough credits to generate this video. Please purchase more credits."
          );
          router.push("/pricing");
        } else {
          setError(
            `Captioned video generated but failed to save: ${
              storeErr instanceof Error ? storeErr.message : "Unknown error"
            }`
          );
        }
      }
    };

    storeVideo();
  }, [
    videoUrl,
    isRawVideo,
    user?.id,
    generated,
    videoGenerationStage,
    videoStored,
  ]);

  const handleNarrationDialogClose = (open: boolean) => {
    if (!open && showNarrationEditor) {
      setShowNarrationWarning(true);
    }
  };

  const confirmNarrationClose = () => {
    setShowNarrationEditor(false);
    setShowNarrationWarning(false);
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
    <div className="md:grid gap-6 md:grid-cols-2 relative md:space-y-0 space-y-5">
      <div>
        <div className="">
          <VideoForm
            textareaLabel="Prompt"
            textareaPlaceholder="A cinematic shot of a futuristic city with flying cars and neon lights..."
            textareaValue={prompt}
            onTextareaChange={(e) => setPrompt(e.target.value)}
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
        </div>
        <div className="">
          <VideoFields
            textareaLabel="Prompt"
            textareaPlaceholder="A cinematic shot of a futuristic city with flying cars and neon lights..."
            textareaValue={prompt}
            onTextareaChange={(e) => setPrompt(e.target.value)}
            duration={duration}
            setDuration={setDuration}
            voice={voice}
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

      <div>
        <Example />
      </div>

      {narration && !showNarrationEditor && !generated ? (
        <div className="rounded-full w-fit mx-auto col-span-2">
          <Button
            disabled={loading || !narration}
            className="rounded-full p-4 bg-green-600 shadow-sm shadow-neutral-500 animate-pulse"
            onClick={() => setShowNarrationEditor(true)}
          >
            <Video className="h-5 w-5" />
            <span className="ml-2">Reopen Narration</span>
          </Button>
        </div>
      ) : (
        <div className="rounded-full w-fit mx-auto col-span-2">
          <Button
            onClick={handleGenerateNarration}
            disabled={!prompt || loading}
            className="w-fit gap-2 bg-indigo-600 hover:bg-indigo-700 rounded-3xl"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4" />
                Generate Narration
              </>
            )}
          </Button>
        </div>
      )}

      <Dialog
        open={showNarrationEditor}
        onOpenChange={handleNarrationDialogClose}
      >
        <DialogContent className="sm:max-w-[600px] bg-neutral-950 text-white border-none rounded-3xl shadow-sm shadow-neutral-500">
          <DialogHeader>
            <DialogTitle>Edit Narration</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <Textarea
              className="w-full h-80 bg-neutral-900 border-none rounded-3xl"
              value={narration}
              onChange={(e) => setNarration(e.target.value)}
              placeholder="Edit the generated narration here..."
            />
            <div className="flex gap-2 text-sm text-yellow-500">
              <AlertCircle className="w-5 h-5" />
              <p>
                Don't switch{" "}
                <span className="font-bold text-yellow-200">
                  from Text To Video To Narration to Video
                </span>
                , you may lose your video and credit.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowNarrationWarning(true)}
              className="w-fit gap-2 bg-transparent rounded-3xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleGenerateVideo}
              disabled={loading || !narration}
              className="w-fit gap-2 bg-indigo-600 hover:bg-indigo-700 rounded-3xl"
            >
              Generate Video
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showNarrationWarning}
        onOpenChange={setShowNarrationWarning}
      >
        <DialogContent className="bg-neutral-950 text-white border-none shadow-sm shadow-neutral-500">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              Warning
            </DialogTitle>
            <DialogDescription>
              Closing or canceling the narration editor may result in losing
              your credits and video progress. Are you sure you want to proceed?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowNarrationWarning(false)}
              className="w-fit gap-2 bg-transparent rounded-3xl"
            >
              Continue Editing
            </Button>
            <Button
              variant="destructive"
              onClick={confirmNarrationClose}
              className="w-fit gap-2 rounded-3xl"
            >
              Close Anyway
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Video Drawer - Now shows during loading state as well */}
      <Drawer open={showPreviewDrawer} onOpenChange={handlePreviewDrawerClose}>
        <DrawerContent className="text-white bg-transparent backdrop-blur-sm border-none shadow-md shadow-neutral-500">
          <div className="mx-auto w-full md:max-w-2xl">
            <DrawerHeader>
              <DrawerTitle className="text-center">
                {videoUrl ? (
                  isRawVideo ? (
                    <div className="md:flex text-center items-center justify-center gap-2">
                      <span>Preview (Raw Video)</span>
                      {isCaptioning && (
                        <div className="flex items-center gap-1 text-yellow-300 text-sm font-normal animate-pulse">
                          <Loader2 className="h-4 w-4 animate-spin" />

                          <span>Adding captions...</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    "Preview (Captioned Video)"
                  )
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />

                    <span>{videoGenerationStage || "Generating Video..."}</span>
                  </div>
                )}
              </DrawerTitle>
            </DrawerHeader>
            <div className="p-4 flex flex-col items-center justify-end">
              {videoUrl ? (
                <VideoPreview
                  download={playableVideoUrl}
                  generated={generated}
                  videoUrl={videoUrl}
                  loading={loading}
                  onRegenerate={handleGenerateNarration}
                  isRawVideo={isRawVideo}
                  isCaptioning={isCaptioning}
                />
              ) : (
                <div className="w-full h-64 md:h-96 flex flex-col items-center justify-center bg-neutral-900 rounded-lg">
                  <Loader2 className="h-12 w-12 animate-spin text-indigo-500 mb-4" />
                  <p className="text-lg">
                    <span className="text-lg font-medium text-white">
                      {currentProgress}%
                    </span>
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    This may take a few minutes
                  </p>
                </div>
              )}
            </div>
            <DrawerFooter>
              <DrawerClose asChild>
                <Button
                  onClick={() => setShowPreviewWarning(true)}
                  className="gap-2 bg-transparent rounded-3xl"
                  variant="outline"
                >
                  Close
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>

      <Dialog open={showPreviewWarning} onOpenChange={setShowPreviewWarning}>
        <DialogContent className="bg-black/20 backdrop-blur-sm text-white border-none shadow-md shadow-indigo-500">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-medium">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              Warning
            </DialogTitle>
            <DialogDescription className="text-neutral-300">
              Closing the video preview may result in losing your credits and
              video progress. Are you sure you want to proceed?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <div className="flex gap-2 mx-auto w-fit">
              <Button
                variant="outline"
                onClick={() => setShowPreviewWarning(false)}
                className="w-fit gap-2 bg-transparent rounded-3xl"
              >
                Continue Viewing
              </Button>
              <Button
                variant="destructive"
                onClick={confirmPreviewClose}
                className="w-fit gap-2 rounded-3xl"
              >
                Close Anyway
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {generated && !showPreviewDrawer && (
        <Button
          className="fixed bottom-16 right-4 rounded-full p-4 shadow-lg"
          onClick={() => setShowPreviewDrawer(true)}
        >
          <Video className="h-5 w-5" />
          <span className="ml-2">Reopen Preview</span>
        </Button>
      )}
    </div>
  );
}
