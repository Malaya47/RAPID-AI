"use server";

import { createClient } from "@/utils/supabase/server";
import { Database } from "@/types/supabase";

interface JobStatusResponse {
  status: string;
  video_url?: string;
  raw_video_url?: string;
  captioned_video_url?: string;
}

async function checkAndDeductCredits(userId: string): Promise<boolean> {
  const supabase = await createClient();

  // Get user's current credits from the profiles table
  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("total_credits")
    .eq("id", userId)
    .single();

  if (profileError || !profileData) {
    throw new Error("Failed to fetch user profile or credits");
  }

  if (profileData.total_credits < 1) {
    throw new Error("Insufficient credits");
  }

  // Deduct one credit from the profiles table
  const { error: updateError } = await supabase
    .from("profiles")
    .update({ total_credits: profileData.total_credits - 1 })
    .eq("id", userId);

  if (updateError) {
    throw new Error("Failed to deduct credits");
  }

  return true;
}

export async function storeVideoInSupabase(
  videoUrl: string,
  userId: string,
  duration: string,
  title?: string,
  description?: string,
  fontName?: string,
  baseFontColor?: string,
  highlightWordColor?: string
): Promise<void> {
  const supabase = await createClient();

  try {
    // Check and deduct credits before storing video
    await checkAndDeductCredits(userId);

    const { data, error } = await supabase
      .from("videos")
      .insert({
        user_id: userId,
        video_url: videoUrl,
        duration,
        title,
        description,
        status: "completed",
        font_name: fontName,
        base_font_color: baseFontColor,
        highlight_word_color: highlightWordColor,
      })
      .select();

    if (error) {
      console.error("Supabase error details:", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });
      throw new Error(`Failed to store video in Supabase: ${error.message}`);
    }

    console.log("Successfully stored video:", data);
  } catch (error) {
    console.error("Error in storeVideoInSupabase:", error);
    throw error;
  }
}

export async function generateNarration(
  scriptPrompt: string,
  timeLimit: string
): Promise<any> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_RAILWAY_API_KEY}/generate-narration/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        script_prompt: scriptPrompt,
        time_limit: timeLimit,
        user_id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      }),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Narration API request failed with status ${response.status}`
    );
  }

  return response.json();
}

export async function generateViralNarration(
  scriptPrompt: string,
  timeLimit: string
): Promise<any> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_RAILWAY_API_KEY}/generate-narration-new/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        script_prompt: scriptPrompt,
        time_limit: timeLimit,
        user_id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      }),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Viral narration API request failed with status ${response.status}`
    );
  }

  return response.json();
}

/**
 * Generates a video based on narration data, voice, and time limit
 */
export async function generateVideo(
  narrationData: any,
  voice: string,
  timeLimit: string,
  userId: string,
  fontName: string,
  baseFontColor: string,
  highlightWordColor: string
): Promise<string> {
  const videoResponse = await fetch(
    `${process.env.NEXT_PUBLIC_RAILWAY_API_KEY}/generate-short/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        script_prompt: narrationData,
        voice: voice,
        time_limit: timeLimit,
        user_id: userId,
        font_name: fontName,
        base_font_color: baseFontColor,
        highlight_word_color: highlightWordColor,
      }),
    }
  );

  if (!videoResponse.ok) {
    throw new Error(
      `Video generation failed with status ${videoResponse.status}`
    );
  }

  const videoData = await videoResponse.json();
  return videoData.job_id;
}

/**
 * Checks the status of a job and returns the video URL when completed
 */

export async function RawVideo(jobId: string): Promise<JobStatusResponse> {
  const params = new URLSearchParams({
    job_id: jobId,
  });

  const response: any = await fetch(
    `${
      process.env.NEXT_PUBLIC_RAILWAY_API_KEY
    }/raw-video-url-status?${params.toString()}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to get job status. Status: ${response.status}`);
  }

  const data = await response.json();

  if (data?.status === "failed") {
    throw new Error(`Video generation failed. Status: ${data.status}`);
  }

  return data;
}

export async function CaptionVideo(jobId: string): Promise<JobStatusResponse> {
  const params = new URLSearchParams({
    job_id: jobId,
  });

  const response: any = await fetch(
    `${
      process.env.NEXT_PUBLIC_RAILWAY_API_KEY
    }/captioned-video-status?${params.toString()}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to get job status. Status: ${response.status}`);
  }

  const data = await response.json();

  if (data.status === "failed") {
    throw new Error(`Captioning failed. Status: ${data.status}`);
  }

  return data;
}
