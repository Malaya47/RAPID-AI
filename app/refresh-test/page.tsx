// "use client";

// import { useEffect } from "react";
// import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
// import type { Database } from "@/types/supabase";

// export default function RefreshTestPage() {
//   const supabase = createClientComponentClient<Database>();

//   useEffect(() => {
//     const run = async () => {
//       const {
//         data: { session },
//       } = await supabase.auth.getSession();
//       console.log("Current session:", session);

//       const { data, error } = await supabase.auth.refreshSession();
//       console.log("Refreshed session:", data, "Error:", error);
//     };

//     run();
//   }, [supabase]);

//   return <div>Check console for refresh test</div>;
// }
