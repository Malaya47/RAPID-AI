"use server";
import { createClient } from "./server";
import { nanoid } from "nanoid";
import { sendEmail } from "@/lib/email";

export async function generateSlugAndEmail({
  videoUrl,
  userEmail,
}: {
  videoUrl: string;
  userEmail: string;
}): Promise<string | null> {
  const slug = nanoid(8); // e.g., abc123xy

  const supabase = await createClient();

  const { error } = await supabase.from("video_slugs").insert([
    {
      slug,
      s3_url: videoUrl,
      email: userEmail,
      created_at: new Date(),
    },
  ] as any);

  if (error) {
    console.error("Failed to save slug mapping:", error);
    return null;
  }

  const shareUrl = `https://aigenreels.com/api/video/${slug}`;

  const emailSent = await sendEmail({
    to: userEmail,
    subject: "🎬 Your Aigenreels video is ready!",
    html: `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2>Your video is ready!</h2>
        <p>Click the button below to watch it:</p>
        <a href="${shareUrl}" style="background:#6366f1;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;">Watch Video</a>
        <p style="margin-top:20px;">Or copy this link:<br><a href="${shareUrl}">${shareUrl}</a></p>
        <p style="margin-top:40px;">– Aigenreels</p>
      </div>
    `,
  });

  return emailSent ? slug : null;
}
