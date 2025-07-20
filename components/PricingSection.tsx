'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import PricingPlan from '@/components/PricingPlan';
import { SubscriptionService } from '@/lib/subscription';
import { SubscriptionPlan } from '@/types/subscription';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/context/auth-context"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface PricingSectionProps {
  showModal?: boolean;
  onPurchase?: (plan: SubscriptionPlan) => void;
  title?: string;
  subtitle?: string;
  className?: string;
}

export default function PricingSection({ 
  showModal = false, 
  onPurchase,
  title = "Simple, Transparent Pricing",
  subtitle = "Choose the plan that works best for your video creation needs",
  className = ""
}: PricingSectionProps) {
  const router = useRouter()
  const { user } = useAuth()
  const subscriptionService = new SubscriptionService()

  const [loading, setLoading] = useState<string | null>(null)
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);

  useEffect(() => {
    loadSubscriptionPlans();
    if (user && user.id) {
      loadCurrentSubscription();
    } else {
      setCurrentSubscription(null);
    }
  }, [user]);

  const loadSubscriptionPlans = async () => {
    try {
      const plans = await subscriptionService.getSubscriptionPlans();
      setSubscriptionPlans(plans);
    } catch (error) {
      console.error('Failed to load subscription plans:', error);
      toast({
        title: "Error",
        description: "Failed to load subscription plans",
        variant: "destructive",
      });
    }
  };

  const loadCurrentSubscription = async () => {
    try {
      if (!user || !user.id) return;
      const sub = await subscriptionService.getUserSubscription(user.id);
      setCurrentSubscription(sub);
    } catch (error) {
      // ignore for now
    }
  };

  const monthlyPlans = subscriptionPlans.filter(plan => !plan.is_annual);
  const annualPlans = subscriptionPlans.filter(plan => plan.is_annual);

  // Find the current plan details if the user has a subscription
  const currentPlan = currentSubscription && subscriptionPlans.length > 0
    ? subscriptionPlans.find(p => p.id === currentSubscription.plan_id)
    : null;
  const currentIsAnnual = currentPlan ? currentPlan.is_annual : false;

  const handlePurchase = (plan: SubscriptionPlan) => {
    if (!user) {
      router.push('/login')
      return
    }

    if (onPurchase) {
      onPurchase(plan);
      return;
    }

    if (showModal) {
      setSelectedPlan(plan);
      setShowPurchaseModal(true);
      return;
    }

    // Direct purchase flow
    setLoading(plan.name)
    createPaymentIntent(plan);
  };

  const createPaymentIntent = async (plan: SubscriptionPlan) => {
    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: plan.price * 100,
          planName: plan.name,
          credits: plan.credits_per_month,
          userId: user?.id,
          priceId: plan.stripe_price_id,
          planId: plan.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast({
          title: 'Error',
          description: errorData.error || 'Failed to create checkout session',
          variant: 'destructive',
        });
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error: any) {
      if (!error.handled) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to redirect to payment. Please try again.',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(null);
    }
  };

  const confirmPurchase = async () => {
    if (!selectedPlan) return;
    setShowPurchaseModal(false);
    setLoading(selectedPlan.name);
    await createPaymentIntent(selectedPlan);
  };

  return (
    <div className={`${className}`}>
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">{title}</h2>
        <p className="text-xl text-neutral-300 max-w-2xl mx-auto">{subtitle}</p>
      </div>

      <Tabs defaultValue="monthly" className="w-full max-w-7xl mx-auto" onValueChange={(value) => setBillingCycle(value as 'monthly' | 'annual')}>
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8 rounded-full overflow-hidden">
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="annual">Annual</TabsTrigger>
        </TabsList>

        <TabsContent value="monthly">
          <div className="grid md:grid-cols-3 gap-8">
            {monthlyPlans.map((plan) => (
              <PricingPlan
                key={plan.id}
                title={plan.name}
                price={plan.price.toString()}
                description={plan.description}
                features={[
                  `${plan.credits_per_month} video generations`,
                  plan.name === "Pro" ? "24/7 support" : "Priority support",
                  plan.name === "Pro" ? "Premium quality" : "High quality"
                ]}
                popular={plan.name === "Pro"}
                onSelectPlan={() => handlePurchase(plan)}
                buttonText={currentIsAnnual ? "Not Available" : (loading === plan.name ? "Redirecting..." : "Get Started")}
                disabled={currentIsAnnual || loading !== null}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="annual">
          <div className="grid md:grid-cols-3 gap-8">
            {annualPlans.map((plan) => (
              <PricingPlan
                key={plan.id}
                title={plan.name}
                price={(plan.price / 12).toFixed(2)}
                description={plan.description}
                features={[
                  `${plan.credits_per_month} video generations`,
                  plan.name === "Pro" ? "24/7 support" : "Priority support",
                  plan.name === "Pro" ? "Premium quality" : "High quality",
                  "Save 20% with annual billing"
                ]}
                popular={plan.name === "Pro"}
                onSelectPlan={() => handlePurchase(plan)}
                buttonText={loading === plan.name ? "Redirecting..." : "Get Started"}
                disabled={loading !== null}
                annualPrice={plan.price.toString()}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {showModal && (
        <Dialog open={showPurchaseModal} onOpenChange={setShowPurchaseModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Purchase</DialogTitle>
              <DialogDescription>
                You are about to purchase {selectedPlan?.credits_per_month} credits for ${selectedPlan?.price}.
                You will be redirected to a secure payment page.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowPurchaseModal(false)}
                disabled={loading !== null}
              >
                Cancel
              </Button>
              <Button
                onClick={confirmPurchase}
                disabled={loading !== null}
              >
                {loading ? "Redirecting..." : "Proceed to Payment"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
} 