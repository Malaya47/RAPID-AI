// "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import PricingPlan from "@/components/PricingPlan";
// import { SubscriptionService } from "@/lib/subscription";
// import { SubscriptionPlan } from "@/types/subscription";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { toast } from "@/hooks/use-toast";
// import { useAuth } from "@/context/auth-context";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";

// interface PricingSectionProps {
//   showModal?: boolean;
//   onPurchase?: (plan: SubscriptionPlan) => void;
//   title?: string;
//   subtitle?: string;
//   className?: string;
// }

// // const PLAN_LEVELS: Record<string, number> = {
// //   "basic-monthly": 1,
// //   "standard-monthly": 2,
// //   "pro-monthly": 3,
// //   "basic-annual": 1,
// //   "standard-annual": 2,
// //   "pro-annual": 3,
// // };

// export default function PricingSection({
//   showModal = false,
//   onPurchase,
//   title = "Simple, Transparent Pricing",
//   subtitle = "Choose the plan that works best for your video creation needs",
//   className = "",
// }: PricingSectionProps) {
//   const router = useRouter();
//   const { user } = useAuth();
//   const subscriptionService = new SubscriptionService();

//   const [loading, setLoading] = useState<string | null>(null);
//   const [subscriptionPlans, setSubscriptionPlans] = useState<
//     SubscriptionPlan[]
//   >([]);
//   const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">(
//     "monthly"
//   );
//   const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(
//     null
//   );
//   const [showPurchaseModal, setShowPurchaseModal] = useState(false);
//   const [currentSubscription, setCurrentSubscription] = useState<any>(null);

//   // const isActive =
//   //   currentSubscription?.status === "active" &&
//   //   new Date(currentSubscription.end_date) > new Date();

//   // const currentPlanLevel = isActive
//   //   ? PLAN_LEVELS[currentSubscription.plan_id] || 0
//   //   : 0; // no active subscription → treat as free user

//   useEffect(() => {
//     loadSubscriptionPlans();
//     if (user && user.id) {
//       loadCurrentSubscription();
//     } else {
//       setCurrentSubscription(null);
//     }
//   }, [user]);

//   const loadSubscriptionPlans = async () => {
//     try {
//       const plans = await subscriptionService.getSubscriptionPlans();
//       setSubscriptionPlans(plans);
//     } catch (error) {
//       console.error("Failed to load subscription plans:", error);
//       toast({
//         title: "Error",
//         description: "Failed to load subscription plans",
//         variant: "destructive",
//       });
//     }
//   };

//   const loadCurrentSubscription = async () => {
//     try {
//       if (!user || !user.id) return;
//       const sub = await subscriptionService.getUserSubscription(user.id);
//       setCurrentSubscription(sub);
//     } catch (error) {
//       // ignore for now
//     }
//   };

//   const monthlyPlans = subscriptionPlans.filter((plan) => !plan.is_annual);
//   const annualPlans = subscriptionPlans.filter((plan) => plan.is_annual);

//   // Find the current plan details if the user has a subscription
//   const currentPlan =
//     currentSubscription && subscriptionPlans.length > 0
//       ? subscriptionPlans.find((p) => p.id === currentSubscription.plan_id)
//       : null;
//   const currentIsAnnual = currentPlan ? currentPlan.is_annual : false;

//   const handlePurchase = (plan: SubscriptionPlan) => {
//     if (!user) {
//       router.push("/login");
//       return;
//     }

//     if (onPurchase) {
//       onPurchase(plan);
//       return;
//     }

//     if (showModal) {
//       setSelectedPlan(plan);
//       setShowPurchaseModal(true);
//       return;
//     }

//     // Direct purchase flow
//     setLoading(plan.name);
//     createPaymentIntent(plan);
//   };

//   const createPaymentIntent = async (plan: SubscriptionPlan) => {
//     try {
//       const response = await fetch("/api/create-payment-intent", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           amount: plan.price * 100,
//           planName: plan.name,
//           credits: plan.credits_per_month,
//           userId: user?.id,
//           priceId: plan.stripe_price_id,
//           planId: plan.id,
//         }),
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         toast({
//           title: "Error",
//           description: errorData.error || "Failed to create checkout session",
//           variant: "destructive",
//         });
//         throw new Error(errorData.error || "Failed to create checkout session");
//       }

//       const { url } = await response.json();
//       window.location.href = url;
//     } catch (error: any) {
//       if (!error.handled) {
//         toast({
//           title: "Error",
//           description:
//             error.message || "Failed to redirect to payment. Please try again.",
//           variant: "destructive",
//         });
//       }
//     } finally {
//       setLoading(null);
//     }
//   };

//   const confirmPurchase = async () => {
//     if (!selectedPlan) return;
//     setShowPurchaseModal(false);
//     setLoading(selectedPlan.name);
//     await createPaymentIntent(selectedPlan);
//   };

//   return (
//     <div className={`${className}`}>
//       <div className="text-center mb-12">
//         <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
//           {title}
//         </h2>
//         <p className="text-xl text-neutral-300 max-w-2xl mx-auto">{subtitle}</p>
//       </div>

//       <Tabs
//         defaultValue="monthly"
//         className="w-full max-w-7xl mx-auto"
//         onValueChange={(value) =>
//           setBillingCycle(value as "monthly" | "annual")
//         }
//       >
//         <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8 rounded-full overflow-hidden">
//           <TabsTrigger value="monthly">Monthly</TabsTrigger>
//           <TabsTrigger value="annual">Annual</TabsTrigger>
//         </TabsList>

//         <TabsContent value="monthly">
//           <div className="grid md:grid-cols-3 gap-8">
//             {monthlyPlans.map((plan) => (
//               <PricingPlan
//                 key={plan.id}
//                 title={plan.name}
//                 price={plan.price.toString()}
//                 description={plan.description}
//                 features={[
//                   `${plan.credits_per_month} video generations`,
//                   plan.name === "Pro" ? "24/7 support" : "Priority support",
//                   plan.name === "Pro" ? "Premium quality" : "High quality",
//                 ]}
//                 popular={plan.name === "Pro"}
//                 onSelectPlan={() => handlePurchase(plan)}
//                 buttonText={
//                   currentIsAnnual
//                     ? "Not Available"
//                     : loading === plan.name
//                     ? "Redirecting..."
//                     : "Get Started"
//                 }
//                 disabled={currentIsAnnual || loading !== null}
//                 // buttonText={
//                 //   currentSubscription?.plan_id === plan.id
//                 //     ? "Current Plan"
//                 //     : PLAN_LEVELS[plan.id] <= currentPlanLevel
//                 //     ? "Not Available"
//                 //     : loading === plan.name
//                 //     ? "Redirecting..."
//                 //     : "Get Started"
//                 // }
//                 // disabled={
//                 //   loading !== null ||
//                 //   currentSubscription?.plan_id === plan.id ||
//                 //   PLAN_LEVELS[plan.id] <= currentPlanLevel
//                 // }
//               />
//             ))}
//           </div>
//         </TabsContent>

//         <TabsContent value="annual">
//           <div className="grid md:grid-cols-3 gap-8">
//             {annualPlans.map((plan) => (
//               <PricingPlan
//                 key={plan.id}
//                 title={plan.name}
//                 price={(plan.price / 12).toFixed(2)}
//                 description={plan.description}
//                 features={[
//                   `${plan.credits_per_month} video generations`,
//                   plan.name === "Pro" ? "24/7 support" : "Priority support",
//                   plan.name === "Pro" ? "Premium quality" : "High quality",
//                   "Save 20% with annual billing",
//                 ]}
//                 popular={plan.name === "Pro"}
//                 onSelectPlan={() => handlePurchase(plan)}
//                 buttonText={
//                   loading === plan.name ? "Redirecting..." : "Get Started"
//                 }
//                 disabled={loading !== null}
//                 // buttonText={
//                 //   currentSubscription?.plan_id === plan.id
//                 //     ? "Current Plan"
//                 //     : PLAN_LEVELS[plan.id] <= currentPlanLevel
//                 //     ? "Not Available"
//                 //     : loading === plan.name
//                 //     ? "Redirecting..."
//                 //     : "Get Started"
//                 // }
//                 // disabled={
//                 //   loading !== null ||
//                 //   currentSubscription?.plan_id === plan.id ||
//                 //   PLAN_LEVELS[plan.id] <= currentPlanLevel
//                 // }
//                 annualPrice={plan.price.toString()}
//               />
//             ))}
//           </div>
//         </TabsContent>
//       </Tabs>

//       {showModal && (
//         <Dialog open={showPurchaseModal} onOpenChange={setShowPurchaseModal}>
//           <DialogContent>
//             <DialogHeader>
//               <DialogTitle>Confirm Purchase</DialogTitle>
//               <DialogDescription>
//                 You are about to purchase {selectedPlan?.credits_per_month}{" "}
//                 credits for ${selectedPlan?.price}. You will be redirected to a
//                 secure payment page.
//               </DialogDescription>
//             </DialogHeader>
//             <DialogFooter>
//               <Button
//                 variant="outline"
//                 onClick={() => setShowPurchaseModal(false)}
//                 disabled={loading !== null}
//               >
//                 Cancel
//               </Button>
//               <Button onClick={confirmPurchase} disabled={loading !== null}>
//                 {loading ? "Redirecting..." : "Proceed to Payment"}
//               </Button>
//             </DialogFooter>
//           </DialogContent>
//         </Dialog>
//       )}
//     </div>
//   );
// }

// New code

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PricingPlan from "@/components/PricingPlan";
import { SubscriptionService } from "@/lib/subscription";
import { SubscriptionPlan } from "@/types/subscription";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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
  className = "",
}: PricingSectionProps) {
  const router = useRouter();
  const { user } = useAuth();
  const subscriptionService = new SubscriptionService();

  const [loading, setLoading] = useState<string | null>(null);
  const [subscriptionPlans, setSubscriptionPlans] = useState<
    SubscriptionPlan[]
  >([]);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">(
    "monthly"
  );
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(
    null
  );
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    loadSubscriptionPlans();
    if (user && user.id) {
      loadCurrentSubscription();
      loadUserProfile();
    } else {
      setCurrentSubscription(null);
      setUserProfile(null);
    }
  }, [user]);

  const loadSubscriptionPlans = async () => {
    try {
      const plans = await subscriptionService.getSubscriptionPlans();
      setSubscriptionPlans(plans);
    } catch (error) {
      console.error("Failed to load subscription plans:", error);
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

  const loadUserProfile = async () => {
    try {
      if (!user || !user.id) return;
      // Get user profile with stripe_customer_id
      const { createClient } = await import("@/utils/supabase/client");
      const supabase = createClient();
      const { data: profile } = await supabase
        .from("profiles")
        .select("stripe_customer_id")
        .eq("id", user.id)
        .single();
      setUserProfile(profile);
    } catch (error) {
      console.error("Failed to load user profile:", error);
    }
  };

  const monthlyPlans = subscriptionPlans.filter((plan) => !plan.is_annual);
  const annualPlans = subscriptionPlans.filter((plan) => plan.is_annual);

  // Find the current plan details if the user has a subscription
  const currentPlan =
    currentSubscription && subscriptionPlans.length > 0
      ? subscriptionPlans.find((p) => p.id === currentSubscription.plan_id)
      : null;

  const isActiveSubscription =
    currentSubscription?.status === "active" &&
    new Date(currentSubscription.end_date) > new Date();

  // const handlePurchase = (plan: SubscriptionPlan) => {
  //   if (!user) {
  //     router.push("/login");
  //     return;
  //   }

  //   if (onPurchase) {
  //     onPurchase(plan);
  //     return;
  //   }

  //   if (showModal) {
  //     setSelectedPlan(plan);
  //     setShowPurchaseModal(true);
  //     return;
  //   }

  //   // Check if user has active subscription and stripe customer
  //   if (isActiveSubscription && userProfile?.stripe_customer_id) {
  //     // Switch plan directly
  //     setLoading(plan.name);
  //     switchPlan(plan);
  //   } else {
  //     // Create new subscription
  //     setLoading(plan.name);
  //     createPaymentIntent(plan);
  //   }
  // };

  // const switchPlan = async (plan: SubscriptionPlan) => {
  //   try {
  //     const response = await fetch("/api/switch-plan", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         customerId: userProfile.stripe_customer_id,
  //         newPriceId: plan.stripe_price_id,
  //         planId: plan.id,
  //         userId: user?.id,
  //       }),
  //     });

  //     if (!response.ok) {
  //       const errorData = await response.json();
  //       toast({
  //         title: "Error",
  //         description: errorData.error || "Failed to switch plan",
  //         variant: "destructive",
  //       });
  //       throw new Error(errorData.error || "Failed to switch plan");
  //     }

  //     toast({
  //       title: "Success!",
  //       description: `Successfully switched to ${plan.name} plan. Your next billing will be prorated.`,
  //     });

  //     // Refresh data
  //     await loadCurrentSubscription();
  //     await loadUserProfile();
  //   } catch (error: any) {
  //     toast({
  //       title: "Error",
  //       description: error.message || "Failed to switch plan",
  //       variant: "destructive",
  //     });
  //   } finally {
  //     setLoading(null);
  //   }
  // };

  const handlePurchase = (plan: SubscriptionPlan) => {
    if (!user) {
      router.push("/login");
      return;
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

    // Check if user has active subscription and stripe customer
    if (isActiveSubscription && userProfile?.stripe_customer_id) {
      // Switch plan directly
      setLoading(plan.name);
      switchPlan(plan);
    } else {
      // Create new subscription
      setLoading(plan.name);
      createPaymentIntent(plan);
    }
  };

  const switchPlan = async (plan: SubscriptionPlan) => {
    try {
      const response = await fetch("/api/switch-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: userProfile.stripe_customer_id,
          newPriceId: plan.stripe_price_id,
          newPlanId: plan.id, // <-- change this
          userId: user?.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: "Plan Switch Failed",
          description: data.error || "Unable to switch plan. Please try again.",
          variant: "destructive",
        });
        throw new Error(data.error || "Switch failed");
      }

      // Success toast with detailed message
      toast({
        title: "Plan Switched Successfully!",
        description: `You are now on the ${plan.name} plan. Prorated credits will be applied and your next billing will reflect any adjustments. Your remaining credits are preserved.`,
        variant: "default",
      });

      // Refresh user subscription and profile credits
      await loadCurrentSubscription();
      await loadUserProfile();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to switch plan",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const createPaymentIntent = async (plan: SubscriptionPlan) => {
    try {
      const response = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
          title: "Error",
          description: errorData.error || "Failed to create checkout session",
          variant: "destructive",
        });
        throw new Error(errorData.error || "Failed to create checkout session");
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error: any) {
      if (!error.handled) {
        toast({
          title: "Error",
          description:
            error.message || "Failed to redirect to payment. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(null);
    }
  };

  const confirmPurchase = async () => {
    if (!selectedPlan) return;
    setShowPurchaseModal(false);

    if (isActiveSubscription && userProfile?.stripe_customer_id) {
      setLoading(selectedPlan.name);
      await switchPlan(selectedPlan);
    } else {
      setLoading(selectedPlan.name);
      await createPaymentIntent(selectedPlan);
    }
  };

  const getButtonText = (plan: SubscriptionPlan) => {
    if (loading === plan.name) {
      return isActiveSubscription && userProfile?.stripe_customer_id
        ? "Switching Plan..."
        : "Redirecting...";
    }

    if (currentSubscription?.plan_id === plan.id) {
      return "Current Plan";
    }

    if (isActiveSubscription && userProfile?.stripe_customer_id) {
      return "Switch to This Plan";
    }

    return "Get Started";
  };

  const isButtonDisabled = (plan: SubscriptionPlan) => {
    return loading !== null || currentSubscription?.plan_id === plan.id;
  };

  return (
    <div className={`${className}`}>
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
          {title}
        </h2>
        <p className="text-xl text-neutral-300 max-w-2xl mx-auto">{subtitle}</p>
        {isActiveSubscription && currentPlan && (
          <p className="text-sm text-blue-400 mt-2">
            Current plan: {currentPlan.name} (
            {currentPlan.is_annual ? "Annual" : "Monthly"})
          </p>
        )}
      </div>

      <Tabs
        defaultValue="monthly"
        className="w-full max-w-7xl mx-auto"
        onValueChange={(value) =>
          setBillingCycle(value as "monthly" | "annual")
        }
      >
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
                  plan.name === "Pro" ? "Premium quality" : "High quality",
                ]}
                popular={plan.name === "Pro"}
                onSelectPlan={() => handlePurchase(plan)}
                buttonText={getButtonText(plan)}
                disabled={isButtonDisabled(plan)}
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
                  "Save 20% with annual billing",
                ]}
                popular={plan.name === "Pro"}
                onSelectPlan={() => handlePurchase(plan)}
                buttonText={getButtonText(plan)}
                disabled={isButtonDisabled(plan)}
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
              <DialogTitle>
                {isActiveSubscription && userProfile?.stripe_customer_id
                  ? "Switch Subscription Plan"
                  : "Confirm Purchase"}
              </DialogTitle>
              <DialogDescription>
                {isActiveSubscription && userProfile?.stripe_customer_id
                  ? `You are about to switch to the ${
                      selectedPlan?.name
                    } plan with ${
                      selectedPlan?.credits_per_month
                    } credits for ${selectedPlan?.price}${
                      selectedPlan?.is_annual ? "/year" : "/month"
                    }. The change will be prorated and reflected in your next billing cycle.`
                  : `You are about to purchase ${
                      selectedPlan?.credits_per_month
                    } credits for ${selectedPlan?.price}${
                      selectedPlan?.is_annual ? "/year" : "/month"
                    }. You will be redirected to a secure payment page.`}
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
              <Button onClick={confirmPurchase} disabled={loading !== null}>
                {loading
                  ? isActiveSubscription && userProfile?.stripe_customer_id
                    ? "Switching Plan..."
                    : "Redirecting..."
                  : isActiveSubscription && userProfile?.stripe_customer_id
                  ? "Switch Plan"
                  : "Proceed to Payment"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
