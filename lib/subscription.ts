import { createClient } from "@/utils/supabase/client";
import {
  SubscriptionPlan,
  UserSubscription,
  CreditTransaction,
} from "@/types/subscription";
import { SupabaseClient } from "@supabase/supabase-js";

export class SubscriptionService {
  private supabase: SupabaseClient;

  constructor(supabaseClient?: SupabaseClient) {
    this.supabase = supabaseClient || createClient();
  }

  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    const { data, error } = await this.supabase
      .from("subscription_plans")
      .select("*")
      .order("price", { ascending: true });

    if (error) throw error;
    return data;
  }

  async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    const { data, error } = await this.supabase
      .from("user_subscriptions")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active")
      .order("end_date", { ascending: false })
      .limit(1);

    if (error) throw error;
    if (data && data.length > 0) return data[0];
    return null;
  }

  async hasActiveSubscription(userId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from("user_subscriptions")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active")
      .gt("end_date", new Date().toISOString())
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return !!data;
  }

  async createSubscription(
    userId: string,
    planId: string
  ): Promise<UserSubscription> {
    // Get plan details
    const { data: plan, error: planError } = await this.supabase
      .from("subscription_plans")
      .select("*")
      .eq("id", planId)
      .single();

    if (planError) throw planError;

    // Get current active subscription (if any)
    const currentSubscription = await this.getUserSubscription(userId);

    // Calculate new subscription details
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + plan.duration_months);

    // Always set credits to the new plan's credits (do not accumulate)
    let totalCredits = plan.credits_per_month;
    let creditTransactionDescription = `Credits from ${plan.name} subscription`;

    // If user has an active subscription, accumulate credits and handle time calculation
    // if (currentSubscription) {
    //     // Add remaining credits from current subscription
    //     totalCredits += currentSubscription.credits_remaining;
    //     creditTransactionDescription = `Plan upgrade: ${currentSubscription.credits_remaining} credits carried over + ${plan.credits_per_month} new credits from ${plan.name}`;
    // }

    // Cancel ALL previous active subscriptions for this user
    await this.supabase
      .from("user_subscriptions")
      .update({ status: "cancelled" })
      .eq("user_id", userId)
      .eq("status", "active");

    // Log the total credits value
    console.log(
      `[createSubscription] Creating new subscription for user ${userId} with totalCredits:`,
      totalCredits
    );

    // Create new subscription
    const { data, error } = await this.supabase
      .from("user_subscriptions")
      .insert({
        user_id: userId,
        plan_id: planId,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        credits_remaining: totalCredits,
        status: "active",
      })
      .select()
      .single();

    if (error) throw error;

    // Create credit transaction
    await this.createCreditTransaction({
      user_id: userId,
      subscription_id: data.id,
      amount: plan.credits_per_month,
      type: "credit",
      description: creditTransactionDescription,
    });

    // Fetch the new active subscription and update profile credits from it
    const newActiveSubscription = await this.getUserSubscription(userId);
    if (newActiveSubscription) {
      await this.updateProfileCredits(
        userId,
        newActiveSubscription.credits_remaining
      );
    }

    return data;
  }

  async updateSubscriptionStatus(
    userId: string,
    status: "cancelled" | "past_due",
    reason?: string
  ): Promise<UserSubscription | null> {
    // Update all active subscriptions of the user
    const { data, error } = await this.supabase
      .from("user_subscriptions")
      .update({
        status,
        cancellation_reason: reason ?? null,
        cancelled_at: status === "cancelled" ? new Date().toISOString() : null,
      })
      .eq("user_id", userId)
      .eq("status", "active")
      .select()
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data;
  }

  async logSubscriptionEvent(userId: string, description: string) {
    const activeSubscription = await this.getUserSubscription(userId);

    await this.createCreditTransaction({
      user_id: userId,
      subscription_id: activeSubscription?.id ?? null,
      amount: 0,
      type: "debit",
      description,
    });
  }

  async cancelOrMarkPastDue(
    userId: string,
    status: "cancelled" | "past_due",
    reason?: string
  ) {
    await this.updateSubscriptionStatus(userId, status, reason);
    const description =
      status === "cancelled"
        ? `Subscription cancelled: ${reason ?? "via system"}. Credits remain.`
        : `Payment failed. Subscription marked past_due. Credits remain.`;

    await this.logSubscriptionEvent(userId, description);
  }

  async switchPlan(
    userId: string,
    newPlanId: string
  ): Promise<UserSubscription> {
    const currentSubscription = await this.getUserSubscription(userId);
    if (!currentSubscription) throw new Error("No active subscription found");

    // Update plan metadata only — do NOT touch credits
    const { data, error } = await this.supabase
      .from("user_subscriptions")
      .update({ plan_id: newPlanId })
      .eq("id", currentSubscription.id)
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  async useCredits(
    userId: string,
    amount: number,
    description: string
  ): Promise<boolean> {
    const subscription = await this.getUserSubscription(userId);
    if (!subscription) throw new Error("No active subscription found");

    if (subscription.credits_remaining < amount) {
      throw new Error("Insufficient credits");
    }

    const newCreditBalance = subscription.credits_remaining - amount;

    // Update subscription credits
    const { error: updateError } = await this.supabase
      .from("user_subscriptions")
      .update({
        credits_remaining: newCreditBalance,
      })
      .eq("id", subscription.id);

    if (updateError) throw updateError;

    // Update profiles table with new credit balance
    await this.updateProfileCredits(userId, newCreditBalance);

    // Create credit transaction
    await this.createCreditTransaction({
      user_id: userId,
      subscription_id: subscription.id,
      amount: -amount,
      type: "debit",
      description,
    });

    return true;
  }

  async createCreditTransaction(
    transaction: Omit<CreditTransaction, "id" | "created_at">
  ): Promise<void> {
    const { error } = await this.supabase
      .from("credit_transactions")
      .insert(transaction);

    if (error) throw error;
  }

  async getCreditTransactions(userId: string): Promise<CreditTransaction[]> {
    const { data, error } = await this.supabase
      .from("credit_transactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  }

  async updateProfileCredits(
    userId: string,
    totalCredits: number
  ): Promise<void> {
    console.log(
      `Updating profile credits for user ${userId} to ${totalCredits}`
    );

    // First, try to update existing profile
    const { data: updateData, error: updateError } = await this.supabase
      .from("profiles")
      .update({ total_credits: totalCredits })
      .eq("id", userId)
      .select();

    console.log("Update result:", { updateData, updateError });

    // If profile doesn't exist, create it
    if (updateError && updateError.code === "PGRST116") {
      console.log("Profile not found, creating new profile");
      const { data: insertData, error: insertError } = await this.supabase
        .from("profiles")
        .insert({
          id: userId,
          total_credits: totalCredits,
        })
        .select();

      console.log("Insert result:", { insertData, insertError });
      if (insertError) throw insertError;
    } else if (updateError) {
      console.error("Error updating profile:", updateError);
      throw updateError;
    }
  }

  async syncUserCredits(userId: string): Promise<void> {
    console.log(`Syncing credits for user ${userId}`);

    // Get user's active subscription
    const subscription = await this.getUserSubscription(userId);
    console.log("Current subscription:", subscription);

    if (subscription) {
      // Sync subscription credits to profiles table
      console.log(
        `Syncing ${subscription.credits_remaining} credits to profiles table`
      );
      await this.updateProfileCredits(userId, subscription.credits_remaining);
    } else {
      // If no active subscription, set credits to 0
      console.log("No active subscription, setting credits to 0");
      await this.updateProfileCredits(userId, 0);
    }
  }

  // Debug method to manually sync credits
  async debugSyncCredits(userId: string): Promise<any> {
    console.log("=== DEBUG SYNC CREDITS ===");

    // Check if user exists in profiles
    const { data: profileData, error: profileError } = await this.supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    console.log("Profile data:", profileData);
    console.log("Profile error:", profileError);

    // Check subscription
    const subscription = await this.getUserSubscription(userId);
    console.log("Subscription data:", subscription);

    // Try to sync
    await this.syncUserCredits(userId);

    // Check profile again
    const { data: updatedProfile, error: updatedError } = await this.supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    console.log("Updated profile:", updatedProfile);
    console.log("Updated error:", updatedError);

    return {
      originalProfile: profileData,
      subscription,
      updatedProfile,
      errors: { profileError, updatedError },
    };
  }
}

// New code

// lib/subscription.ts

// import { createClient } from "@/utils/supabase/client";
// import { SupabaseClient } from "@supabase/supabase-js";
// import {
//   SubscriptionPlan,
//   UserSubscription,
//   CreditTransaction,
// } from "@/types/subscription";

// export class SubscriptionService {
//   private supabase: SupabaseClient;

//   constructor(supabaseClient?: SupabaseClient) {
//     this.supabase = supabaseClient || createClient();
//   }

//   async getUserSubscription(userId: string): Promise<UserSubscription | null> {
//     const { data, error } = await this.supabase
//       .from("user_subscriptions")
//       .select("*")
//       .eq("user_id", userId)
//       .eq("status", "active")
//       .maybeSingle();

//     if (error) throw error;
//     return data;
//   }

//   async updateSubscriptionStatus(
//     userId: string,
//     status: "cancelled" | "past_due",
//     reason?: string
//   ): Promise<UserSubscription | null> {
//     // Update all active subscriptions of the user
//     const { data, error } = await this.supabase
//       .from("user_subscriptions")
//       .update({
//         status,
//         cancellation_reason: reason ?? null,
//         cancelled_at: status === "cancelled" ? new Date().toISOString() : null,
//       })
//       .eq("user_id", userId)
//       .eq("status", "active")
//       .select()
//       .single();

//     if (error && error.code !== "PGRST116") throw error;
//     return data;
//   }

//   async logSubscriptionEvent(userId: string, description: string) {
//     const activeSubscription = await this.getUserSubscription(userId);

//     await this.createCreditTransaction({
//       user_id: userId,
//       subscription_id: activeSubscription?.id ?? null,
//       amount: 0,
//       type: "debit",
//       description,
//     });
//   }

//   async cancelOrMarkPastDue(
//     userId: string,
//     status: "cancelled" | "past_due",
//     reason?: string
//   ) {
//     await this.updateSubscriptionStatus(userId, status, reason);
//     const description =
//       status === "cancelled"
//         ? `Subscription cancelled: ${reason ?? "via system"}. Credits remain.`
//         : `Payment failed. Subscription marked past_due. Credits remain.`;

//     await this.logSubscriptionEvent(userId, description);
//   }

//   async createSubscription(
//     userId: string,
//     planId: string
//   ): Promise<UserSubscription> {
//     // Get plan details
//     const { data: plan, error: planError } = await this.supabase
//       .from("subscription_plans")
//       .select("*")
//       .eq("id", planId)
//       .single();

//     if (planError) throw planError;

//     // Get current active subscription (if any)
//     const currentSubscription = await this.getUserSubscription(userId);

//     // Calculate new subscription details
//     const startDate = new Date();
//     const endDate = new Date();
//     endDate.setMonth(endDate.getMonth() + plan.duration_months);

//     // Always set credits to the new plan's credits (do not accumulate)
//     let totalCredits = plan.credits_per_month;
//     let creditTransactionDescription = `Credits from ${plan.name} subscription`;

//     // If user has an active subscription, accumulate credits and handle time calculation
//     // if (currentSubscription) {
//     //     // Add remaining credits from current subscription
//     //     totalCredits += currentSubscription.credits_remaining;
//     //     creditTransactionDescription = `Plan upgrade: ${currentSubscription.credits_remaining} credits carried over + ${plan.credits_per_month} new credits from ${plan.name}`;
//     // }

//     // Cancel ALL previous active subscriptions for this user
//     await this.supabase
//       .from("user_subscriptions")
//       .update({ status: "cancelled" })
//       .eq("user_id", userId)
//       .eq("status", "active");

//     // Log the total credits value
//     console.log(
//       `[createSubscription] Creating new subscription for user ${userId} with totalCredits:`,
//       totalCredits
//     );

//     // Create new subscription
//     const { data, error } = await this.supabase
//       .from("user_subscriptions")
//       .insert({
//         user_id: userId,
//         plan_id: planId,
//         start_date: startDate.toISOString(),
//         end_date: endDate.toISOString(),
//         credits_remaining: totalCredits,
//         status: "active",
//       })
//       .select()
//       .single();

//     if (error) throw error;

//     // Create credit transaction
//     await this.createCreditTransaction({
//       user_id: userId,
//       subscription_id: data.id,
//       amount: plan.credits_per_month,
//       type: "credit",
//       description: creditTransactionDescription,
//     });

//     // Fetch the new active subscription and update profile credits from it
//     const newActiveSubscription = await this.getUserSubscription(userId);
//     if (newActiveSubscription) {
//       await this.updateProfileCredits(
//         userId,
//         newActiveSubscription.credits_remaining
//       );
//     }

//     return data;
//   }

//   async createCreditTransaction(
//     tx: Omit<CreditTransaction, "id" | "created_at">
//   ) {
//     const { error } = await this.supabase
//       .from("credit_transactions")
//       .insert(tx);
//     if (error) throw error;
//   }

//   async updateProfileCredits(userId: string, totalCredits: number) {
//     const { error } = await this.supabase
//       .from("profiles")
//       .update({ total_credits: totalCredits })
//       .eq("id", userId);
//     if (error) throw error;
//   }
// }
