import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);

interface Props {
  jobId: string;
}

export default function VideoStatusListener({ jobId }: Props) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("processing");

  useEffect(() => {
    if (!jobId) return;

    // 1. Initial fetch in case the job already completed
    // const fetchInitialStatus = async () => {
    //   const { data: job, error: jobError } = await supabase
    //     .from("jobs")
    //     .select("status")
    //     .eq("id", jobId)
    //     .single();

    //   if (jobError) {
    //     console.error("Job fetch error:", jobError.message);
    //     return;
    //   }

    //   setStatus(job.status);

    //   if (job.status === "completed") {
    //     fetchVideoUrl();
    //   } else if (job.status === "failed") {
    //     alert("Video generation failed.");
    //   }
    // };

    const fetchVideoUrl = async () => {
      const { data: video, error: videoError } = await supabase
        .from("videos")
        .select("raw_video_url") // or "captioned_video_url" if needed
        .eq("job_id", jobId)
        .single();

      if (videoError) {
        console.error("Video fetch error:", videoError.message);
        return;
      }

      if (video?.raw_video_url) {
        setVideoUrl(video.raw_video_url);
      }
    };

    // fetchInitialStatus();

    // 2. Realtime listener for job status change
    console.log("Subscribing to channel for job ID:", jobId);
    const channel = supabase
      .channel("job-status-listener")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "jobs",
        },
        (payload) => {
          const updatedJobId = (payload.new as any).id;
          const newStatus = (payload.new as any).status;

          if (updatedJobId === jobId) {
            setStatus(newStatus);

            if (newStatus === "completed") {
              fetchVideoUrl();
            } else if (newStatus === "failed") {
              alert("Video generation failed.");
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.realtime.removeChannel(channel);
    };
  }, [jobId]);

  if (status === "completed" && videoUrl) {
    return (
      <video controls width="500">
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    );
  }

  return <p>Video is {status}...</p>;
}
