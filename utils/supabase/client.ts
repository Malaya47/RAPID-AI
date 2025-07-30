// "use client"

// import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
// import { Database } from "@/types/database.types"

// export const createClient = () => {
//     return createClientComponentClient<Database>()
// }

"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/database.types";

let supabase: ReturnType<typeof createClientComponentClient<Database>>;

export const createClient = () => {
  if (!supabase) {
    supabase = createClientComponentClient<Database>();
  }
  return supabase;
};
