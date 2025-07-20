import type React from "react"
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar"
import Link from "next/link"
import { Video } from "lucide-react"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <DashboardSidebar />
      <div className="md:mx-auto p-5 bg-black w-full">
        <main>
          {children}
        </main>
      </div>
    </SidebarProvider>
  )
}

