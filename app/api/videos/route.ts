import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page")) || 1;
  const pageSize = Number(searchParams.get("pageSize")) || 3;

  const supabase = await createClient(); // ✅ await here

  // ✅ Get the logged-in user from the auth session
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  console.log(user);

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // ✅ Only fetch videos belonging to the logged-in user
  const { data, error } = await supabase
    .from("videos")
    .select("*")
    .eq("user_id", user.id) // <-- filter by user_id
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
