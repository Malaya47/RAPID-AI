"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Typewriter } from "react-simple-typewriter";

export default function SignupPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      const { error } = await signUp(email, password);
      if (error) {
        setError(error.message);
        return;
      }
      setMessage("Check your email for the confirmation link");
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-zinc-950 to-neutral-900 px-4 py-12">
      {/* Heading */}
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent tracking-tight">
          <Typewriter
            words={["Create Your Account"]}
            loop={0} // 0 = infinite
            cursor
            cursorStyle="|"
            typeSpeed={70}
            deleteSpeed={70}
            delaySpeed={1500}
          />
        </h1>
        <p className="text-gray-400 mt-2 text-base">
          Join us and get started right away
        </p>
      </div>

      {/* Signup card */}
      <Card className="w-full max-w-md rounded-2xl border border-zinc-800 bg-neutral-900 shadow-[0_0_40px_#00000040] backdrop-blur-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold text-white">
            Sign up
          </CardTitle>
          <CardDescription className="text-gray-400 text-sm">
            Enter your details below to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {message && (
              <Alert>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="bg-neutral-800 border-neutral-700 text-white placeholder-gray-500 focus-visible:ring-2 focus-visible:ring-indigo-500"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">
                Password
              </Label>
              <PasswordInput
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="bg-neutral-800 border-neutral-700 text-white placeholder-gray-500 focus-visible:ring-2 focus-visible:ring-indigo-500"
              />
              <p className="text-xs text-gray-500">
                Password must be at least 6 characters
              </p>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors duration-200"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin h-4 w-4" />
                  Creating account...
                </span>
              ) : (
                "Create account"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-400">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-indigo-400 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
