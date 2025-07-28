"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useAuth } from "@/context/auth-context";
import {
  VideoIcon,
  LayoutDashboardIcon,
  Plus,
  LogOutIcon,
  CreditCard,
} from "lucide-react";

interface SidebarProps {
  className?: string;
}

export function DashboardSidebar({ className }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { signOut } = useAuth();

  const sidebarItems = [
    {
      icon: <LayoutDashboardIcon />,
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      icon: <VideoIcon />,
      label: "Create Video",
      href: "/dashboard/create",
    },
    {
      icon: <CreditCard />,
      label: "Subscription",
      href: "/dashboard/subscription",
    },
  ];

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <>
      <Sidebar className="border-neutral-800">
        <SidebarHeader className="border-b border-neutral-800 bg-neutral-950 text-white">
          <SidebarMenu>
            <SidebarMenuItem>
              <div className="hover:bg-transparent">
                <div className="w-full max-w-5xl">
                  <div className="gap-2 mr-4">
                    <div className="w-full rounded-md text-white">
                      <a
                        href="/"
                        className="flex items-center gap-2 p-2 font-medium text-lg"
                      >
                        <VideoIcon className="text-indigo-500" />
                        AiGenReels
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent className="flex flex-col justify-between h-full bg-neutral-950">
          <div>
            <SidebarMenu className="space-y-3 py-5">
              {sidebarItems.map((item, index) => (
                <SidebarMenuButton
                  key={index}
                  asChild
                  className={cn(
                    "md:w-60 rounded-lg px-3 py-5 text-sm font-medium hover:bg-neutral-900 hover:text-white hover:rounded-full",
                    pathname === item.href
                      ? "bg-neutral-800 text-white rounded-full"
                      : "transparent"
                  )}
                >
                  <Link
                    href={item.href}
                    className="mx-auto py-3 text-neutral-400"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-indigo-500">{item.icon}</span>
                      <span>{item.label}</span>
                    </div>
                  </Link>
                </SidebarMenuButton>
              ))}
            </SidebarMenu>
          </div>

          <SidebarMenu className="border-t border-neutral-800">
            <SidebarMenuItem>
              <SidebarMenuButton asChild className="mlauto my-5">
                <Button
                  variant="outline"
                  className={cn(
                    "md:w-60 px-3 mx-auto py-5 text-sm font-medium hover:bg-neutral-900 hover:text-white hover:rounded-full bg-neutral-800 text-white rounded-full border-neutral-800"
                  )}
                  onClick={handleSignOut}
                >
                  <div className="py-3 text-white text-left mr-auto">
                    <div className="flex items-center justify-start gap-4">
                      <LogOutIcon className="text-indigo-500" />
                      <span>Sign Out</span>
                    </div>
                  </div>
                </Button>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
    </>
  );
}
