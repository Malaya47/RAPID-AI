"use client";

import type React from "react";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ error: any }>;
  resetPassword: (newPassword: string) => Promise<{ error: any }>;
  signInWithOAuth: (provider: "google") => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  // useEffect(() => {
  //   const getSession = async () => {
  //     const {
  //       data: { session },
  //     } = await supabase.auth.getSession()
  //     setSession(session)
  //     setUser(session?.user ?? null)
  //     setIsLoading(false)
  //   }

  //   getSession()

  //   const {
  //     data: { subscription },
  //   } = supabase.auth.onAuthStateChange((_event, session) => {
  //     setSession(session)
  //     setUser(session?.user ?? null)
  //     setIsLoading(false)
  //   })

  //   return () => {
  //     subscription.unsubscribe()
  //   }
  // }, [supabase])


 const ensureUserProfile = async (userId: string, email: string | undefined) => {
  // Check if profile already exists
  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Error checking user profile:", error.message);
    return;
  }

  if (!data) {
    const { error: insertError } = await supabase.from("profiles").insert({
      id: userId,
      email, // optional if your table includes it
      total_credits: 0, // set default values here
    });

    if (insertError) {
      console.error("Error inserting user profile:", insertError.message);
    }
  }
};


useEffect(() => {
  const getSessionAndHandleProfile = async () => {
    const { data } = await supabase.auth.getSession();
    const session = data.session;

    setSession(session);
    setUser(session?.user ?? null);
    setIsLoading(false);

    if (session?.user) {
      await ensureUserProfile(session.user.id, session.user.email);
    }
  };

  getSessionAndHandleProfile();

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    setSession(session);
    setUser(session?.user ?? null);
    setIsLoading(false);

    if (session?.user) {
      ensureUserProfile(session.user.id, session.user.email);
    }
  });

  return () => {
    subscription.unsubscribe();
  };
}, []);



  // useEffect(() => {
  //   const getSession = async () => {
  //     const { data, error } = await supabase.auth.getSession();
  //     setSession(data.session);
  //     setUser(data.session?.user ?? null);
  //     setIsLoading(false);
  //   };

  //   getSession();

  //   const {
  //     data: { subscription },
  //   } = supabase.auth.onAuthStateChange((_event, session) => {
  //     setSession(session);
  //     setUser(session?.user ?? null);
  //     setIsLoading(false);
  //   });

  //   return () => {
  //     subscription.unsubscribe();
  //   };
  // }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signInWithOAuth = async (provider: "google") => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/dashboard`, // or your desired redirect
      },
    });

    // Insert the new user into the profiles table first check if it exsists or not in the db
  };

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { error };

    const userId = data.user?.id;

    if (!userId) {
      return { error: new Error("User ID not returned after sign-up") };
    }

    // Insert the new user into the profiles table
    const { error: profileError } = await supabase.from("profiles").insert({
      id: userId,
      total_credits: 0, // Optional: set initial credits if needed
    });

    return { error: profileError };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const forgotPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error };
  };

  const resetPassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    return { error };
  };

  const value = {
    user,
    session,
    isLoading,
    signIn,
    signUp,
    signOut,
    forgotPassword,
    resetPassword,
    signInWithOAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
