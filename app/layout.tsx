import type React from "react";
import "./globals.css";
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { AuthProvider } from "@/context/auth-context";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const poppins = Poppins({
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Video Generator",
  description: "Generate amazing videos with AI",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${poppins.className} scroll-smooth tracking-wide bg-black`}
      >
        <AuthProvider>
          <Toaster />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
