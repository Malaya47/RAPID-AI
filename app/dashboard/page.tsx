'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {  Clock, Film, Plus, Video, Wand2, Coins } from "lucide-react"
import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Database } from "@/types/supabase"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from 'date-fns';
import { UserSubscription } from '@/types/subscription';
import { SubscriptionService } from '@/lib/subscription';

type Video = Database['public']['Tables']['videos']['Row']

export default function DashboardPage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [credits, setCredits] = useState<number>(0)
  const [subscription, setSubscription] = useState<UserSubscription | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const subscriptionService = new SubscriptionService()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Fetch videos
        const { data: videosData, error: videosError } = await supabase
          .from('videos')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (videosError) throw videosError
        setVideos(videosData || [])

        // Fetch subscription
        const userSubscription = await subscriptionService.getUserSubscription(user.id)
        setSubscription(userSubscription)

        // Sync credits with profiles table and set credits state
        if (userSubscription) {
          await subscriptionService.syncUserCredits(user.id)
          setCredits(userSubscription.credits_remaining)
        } else {
          // If no subscription, set credits to 0
          await subscriptionService.syncUserCredits(user.id)
          setCredits(0)
        }

      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [supabase])

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
            {/* <Card className="bg-card/50">
              <CardContent className="p-4 flex items-center gap-2">
                <Coins className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Credits</p>
                  <Skeleton className="h-6 w-12" />
                </div>
              </CardContent>
            </Card> */}
            <Skeleton className="h-10 w-[120px]" />
            <Skeleton className="h-10 w-[140px]" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="bg-neutral-950 border-none shadow-md shadow-neutral-300 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Videos</CardTitle>
              <Film className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
              <p className="text-xs text-muted-foreground">Videos created with our platform</p>
            </CardContent>
          </Card>
          <Card className="bg-neutral-950 border-none shadow-md shadow-neutral-300 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Processing</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
              <p className="text-xs text-muted-foreground">Videos currently being processed</p>
            </CardContent>
          </Card>
          <Card className="bg-neutral-950 border-none shadow-md shadow-neutral-300 text-white">
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
          <Skeleton className="h-10 w-[120px]" />
          <Skeleton className="h-10 w-[140px]" />
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
                  <p className="text-xs text-muted-foreground">Please wait while we fetch your videos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

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
          <Link href="/dashboard/subscription">
            <Button variant="outline" className="gap-2 text-black hover:bg-white/70">
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
        <Card className="bg-neutral-950 border-none shadow-md shadow-neutral-300 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">Total Videos</CardTitle>
            <Film className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{videos.length}</div>
            <p className="text-xs text-muted-foreground">Videos created with our platform</p>
          </CardContent>
        </Card>
        <Card className="bg-neutral-950 border-none shadow-md shadow-neutral-300 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">Processing</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {videos.filter(video => video.status === 'processing').length}
            </div>
            <p className="text-xs text-muted-foreground">Videos currently being processed</p>
          </CardContent>
        </Card>
        <Card className="bg-neutral-950 border-none shadow-md shadow-neutral-300 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">Available Credits</CardTitle>
            <Coins className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{credits}</div>
            <p className="text-xs text-muted-foreground">Credits available for video creation</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1 bg-neutral-950 text-white border-0 shadow-md shadow-neutral-300">
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
                  <p className="text-xs text-muted-foreground">Create your first video to see it here</p>
                </div>
              </div>
            ) : (
              <div className="flex gap-4 overflow-x-auto">
                {videos.slice(0, 3).map((video) => (
                  <div key={video.id} className="w-40 flex-shrink-0">
                    <div className="aspect-[3/4] bg-neutral-950 border rounded-md overflow-hidden mb-2">
                      <video
                        src={video.video_url}
                        className="h-full w-full object-cover"
                        controls={false}
                      />
                    </div>
                    <div className="text-sm font-medium truncate" title={video.title || 'Untitled Video'}>
                      {video.title || 'Untitled Video'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(video.created_at), 'MMM d, yyyy')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Your Videos</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => (
            <Card key={video.id} className="overflow-hidden border-none shadow-md shadow-neutral-300">
              <div className="aspect-square bg-neutral-950 border-none">
                <video
                  src={video.video_url}
                  className="h-full w-full object-contain aspect-[3/4]"
                  controls
                />
              </div>
              <CardHeader className="bg-neutral-950 text-white h-full">
                <CardTitle className="text-lg">{video.title || 'Untitled Video'}</CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
      {/* {subscription && (
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
                      {formatDistanceToNow(new Date(subscription.end_date), { addSuffix: true })}
                    </span>
                    {new Date(subscription.end_date).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000 && (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Your current plan will end on {format(new Date(subscription.end_date), 'MMMM do, yyyy')}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="mt-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Credits Remaining:</span>
              <span className="font-medium">{subscription.credits_remaining}</span>
            </div>
          </div>
        </div>
      )} */}
    </div>
  )
}

