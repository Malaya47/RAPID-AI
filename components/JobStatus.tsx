"use client";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:4000");

export default function JobStatus({ jobId }: { jobId: string }) {
  const [status, setStatus] = useState("processing");
  const [videoUrl, setVideoUrl] = useState("");

  useEffect(() => {
    const handleUpdate = (data: any) => {
      if (data.jobId === jobId) {
        setStatus(data.status);
        setVideoUrl(data.videoUrl);
      }
    };

    socket.on("jobStatusUpdated", handleUpdate);

    return () => {
      socket.off("jobStatusUpdated", handleUpdate);
    };
  }, [jobId]);

  return status === "completed" && videoUrl ? (
    <video controls width="500">
      <source src={videoUrl} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  ) : (
    <p>Status: {status}</p>
  );
}
