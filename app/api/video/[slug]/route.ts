import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const supabase = await createClient();
  const { slug } = params;

  // 1. Find the S3 URL for this slug
  const { data, error } = await supabase
    .from("video_slugs")
    .select("s3_url")
    .eq("slug", slug as string)
    .single();

  if (error || !data) {
    return new NextResponse("Video not found", { status: 404 });
  }

  const s3Url = data.s3_url;

  try {
    // 2. Stream the video directly from S3
    const s3Res = await fetch(s3Url);

    if (!s3Res.ok || !s3Res.body) {
      throw new Error("Failed to fetch video stream");
    }

    // 3. Set appropriate headers
    return new NextResponse(s3Res.body, {
      status: 200,
      headers: {
        "Content-Type": s3Res.headers.get("content-type") || "video/mp4",
        // "Content-Disposition": `inline; filename="video.mp4"`,
        "Cache-Control": "public, max-age=86400",
        // Pass through Content-Length if available
        ...(s3Res.headers.get("content-length")
          ? { "Content-Length": s3Res.headers.get("content-length")! }
          : {}),
      },
    });
  } catch (err) {
    console.error("Error streaming video:", err);
    return new NextResponse("Server error streaming video", { status: 500 });
  }
}
