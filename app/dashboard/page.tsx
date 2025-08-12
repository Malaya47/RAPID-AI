"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Clock, Film, Plus, Video, Wand2, Coins } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Database } from "@/types/supabase";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { UserSubscription } from "@/types/subscription";
import { SubscriptionService } from "@/lib/subscription";

type Video = Database["public"]["Tables"]["videos"]["Row"];

export default function DashboardPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(3); // Load 6 videos per page
  const [hasMore, setHasMore] = useState(true);
  const [credits, setCredits] = useState<number>(0);
  const [subscription, setSubscription] = useState<UserSubscription | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [totalVideosCount, setTotalVideosCount] = useState(0);
  const supabase = createClient();
  const subscriptionService = new SubscriptionService();

  const fetchVideos = async (page: number) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data: videosData, error } = await supabase
      .from("videos")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw error;

    if (videosData.length < pageSize) {
      setHasMore(false); // No more videos to load
    }

    setVideos((prev) => {
      const existingIds = new Set(prev.map((v) => v.id));
      const newVideos = videosData.filter((v) => !existingIds.has(v.id));
      return [...prev, ...newVideos];
    });
  };

  useEffect(() => {
    const loadInitial = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        // Get total video count
        const { count, error: countError } = await supabase
          .from("videos")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id);

        if (countError) {
          console.error("Error fetching video count:", countError);
        } else {
          setTotalVideosCount(count || 0);
        }

        const userSubscription = await subscriptionService.getUserSubscription(
          user.id
        );
        setSubscription(userSubscription);
        await subscriptionService.syncUserCredits(user.id);
        setCredits(userSubscription?.credits_remaining || 0);

        await fetchVideos(1); // Load first page
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadInitial();
  }, [supabase]);

  const VideoStatCard = ({
    title,
    icon,
    value,
    description,
  }: {
    title: string;
    icon: React.ReactNode;
    value: string | number | React.ReactNode;
    description: string;
  }) => (
    <Card
      className={`bg-neutral-950 border-none shadow-md shadow-indigo-500 text-white }`}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs mt-2 text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="space-y-6 text-white">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <h2 className="text-2xl font-bold">Dashboard</h2>
            </div>
            <p className="text-muted-foreground">Welcome to your dashboard</p>
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-[120px]" />
            <Skeleton className="h-10 w-[140px]" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <VideoStatCard
            title="Total Videos"
            icon={<Film className="h-4 w-4 text-muted-foreground" />}
            value={<Skeleton className="h-8 w-16" />}
            description="Videos created with our platform"
          />
          <VideoStatCard
            title="Processing"
            icon={<Clock className="h-4 w-4 text-muted-foreground" />}
            value={<Skeleton className="h-8 w-16" />}
            description="Videos currently being processed"
          />
          <Card className="bg-neutral-950 border-none shadow-md shadow-indigo-500 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Processing</CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex items-center gap-2">
              <Coins className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Credits</p>
                <Skeleton className="h-6 w-12" />
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Recent Videos</CardTitle>
              <CardDescription>Your recently created videos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex h-[200px] items-center justify-center rounded-md border border-dashed">
                <div className="flex flex-col items-center gap-1 text-center">
                  <Video className="h-10 w-10 text-muted-foreground" />
                  <p className="text-sm font-medium">Loading videos...</p>
                  <p className="text-xs text-muted-foreground">
                    Please wait while we fetch your videos
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-white">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <h2 className="text-2xl font-bold text-indigo-500">Dashboard</h2>
          </div>
          <p className="text-muted-foreground">Welcome to your dashboard</p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/dashboard/subscription">
            <Button
              variant="outline"
              className="gap-2 text-black hover:bg-white/70"
            >
              <Coins className="h-4 w-4" /> Buy Credits
            </Button>
          </Link>
          <Link href="/dashboard/create">
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Create New Video
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <VideoStatCard
          title="Total Videos"
          icon={<Film className="h-4 w-4 text-muted-foreground" />}
          value={totalVideosCount}
          description="Videos created with our platform"
        />
        <VideoStatCard
          title="Processing"
          icon={<Clock className="h-4 w-4 text-muted-foreground" />}
          value={videos.filter((video) => video.status === "processing").length}
          description="Videos currently being processed"
        />
        <VideoStatCard
          title="Available Credits"
          icon={<Coins className="h-4 w-4 text-yellow-500" />}
          value={credits}
          description="Credits available for video creation"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 overflow-hidden">
        <Card className="col-span-1 bg-neutral-950 text-white border-0 shadow-md shadow-indigo-500">
          <CardHeader>
            <CardTitle>Recent Videos</CardTitle>
            <CardDescription>Your recently created videos</CardDescription>
          </CardHeader>
          <CardContent>
            {videos.length === 0 ? (
              <div className="flex h-[200px] items-center justify-center rounded-md border border-dashed">
                <div className="flex flex-col items-center gap-1 text-center">
                  <Video className="h-10 w-10 text-muted-foreground" />
                  <p className="text-sm font-medium">No videos yet</p>
                  <p className="text-xs text-muted-foreground">
                    Create your first video to see it here
                  </p>
                </div>
              </div>
            ) : (
              // <div className="flex gap-4 overflow-x-auto scrollbar-thin scrollbar-thumb-neutral-700">
              //   {videos.slice(0, 3).map((video) => (
              //     <div key={video.id} className="w-40 flex-shrink-0">
              //       <div className="aspect-[3/4] bg-neutral-950 border rounded-md overflow-hidden mb-2 shadow">
              //         <video
              //           src={video.video_url}
              //           poster={video.thumbnail_url || undefined}
              //           className="h-full w-full object-cover"
              //           controls={false}
              //         />
              //       </div>
              //       <div
              //         className="text-sm font-medium truncate"
              //         title={video.title || "Untitled Video"}
              //       >
              //         {video.title || "Untitled Video"}
              //       </div>
              //       <div className="text-xs text-muted-foreground">
              //         {format(new Date(video.created_at), "MMM d, yyyy")}
              //       </div>
              //     </div>
              //   ))}
              // </div>
              <div className="flex gap-4 overflow-x-auto scrollbar-thin scrollbar-thumb-neutral-700">
                {/* Mobile (only first video) */}
                <div className="flex md:hidden gap-4">
                  {videos.slice(0, 1).map((video) => (
                    <div key={video.id} className="w-40 flex-shrink-0">
                      <div className="aspect-[3/4] bg-neutral-950 border rounded-md overflow-hidden mb-2 shadow">
                        <video
                          src={video.video_url}
                          poster={video.thumbnail_url || undefined}
                          className="h-full w-full object-cover"
                          controls={false}
                        />
                      </div>
                      <div
                        className="text-sm font-medium truncate"
                        title={video.title || "Untitled Video"}
                      >
                        {video.title || "Untitled Video"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(video.created_at), "MMM d, yyyy")}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Medium and up (first 3 videos) */}
                <div className="hidden md:flex gap-4">
                  {videos.slice(0, 3).map((video) => (
                    <div key={video.id} className="w-40 flex-shrink-0">
                      <div className="aspect-[3/4] bg-neutral-950 border rounded-md overflow-hidden mb-2 shadow">
                        <video
                          src={video.video_url}
                          poster={video.thumbnail_url || undefined}
                          className="h-full w-full object-cover"
                          controls={false}
                        />
                      </div>
                      <div
                        className="text-sm font-medium truncate"
                        title={video.title || "Untitled Video"}
                      >
                        {video.title || "Untitled Video"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(video.created_at), "MMM d, yyyy")}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Your Videos</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) =>
            video.id ? (
              <Card
                key={video.id}
                className="overflow-hidden border-none shadow-lg shadow-indigo-500 hover:scale-[1.01] transition-transform duration-200"
              >
                <div className="aspect-square bg-neutral-950 border-none">
                  <video
                    src={video.video_url}
                    poster={video.thumbnail_url || undefined}
                    className="h-full w-full object-contain aspect-auto"
                    controls
                  />
                </div>
                <CardHeader className="bg-neutral-950 text-white h-full">
                  <CardTitle className="text-lg">
                    {video.title || "Untitled Video"}
                  </CardTitle>
                </CardHeader>
              </Card>
            ) : null
          )}
        </div>

        {hasMore && (
          <div className="flex justify-center mt-6">
            <Button
              onClick={async () => {
                const nextPage = page + 1;
                setPage(nextPage);
                await fetchVideos(nextPage);
              }}
              className="bg-indigo-600 text-white hover:bg-indigo-700"
            >
              Load More
            </Button>
          </div>
        )}
      </div>

      {/* { {subscription && (
        <div className="mb-6 p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Subscription Status</h3>
              <p className="text-sm text-gray-500">Your current plan details</p>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {formatDistanceToNow(new Date(subscription.end_date), {
                        addSuffix: true,
                      })}
                    </span>
                    {new Date(subscription.end_date).getTime() - Date.now() <
                      7 * 24 * 60 * 60 * 1000 && (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Your current plan will end on{" "}
                    {format(new Date(subscription.end_date), "MMMM do, yyyy")}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="mt-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Credits Remaining:</span>
              <span className="font-medium">
                {subscription.credits_remaining}
              </span>
            </div>
          </div>
        </div>
      )} } */}
    </div>
  );
}
