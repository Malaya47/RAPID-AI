import PricingSection from "@/components/PricingSection";
import { SubscriptionStatus } from "@/components/subscription/SubscriptionStatus";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function SubscriptionPage() {
  return (
    <div className="space-y-6 text-white">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <h2 className="text-2xl font-bold">Subscription</h2>
          </div>
          <p className="text-muted-foreground">
            Manage your subscription and credits
          </p>
        </div>
      </div>

      <div className="space-y-8">
        <SubscriptionStatus />
        <PricingSection />
      </div>
    </div>
  );
}
