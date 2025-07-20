'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation'; // Changed import
import { createClient } from '@/utils/supabase/client';
import { SubscriptionService } from '@/lib/subscription';

function PaymentSuccessContent() {
  const [status, setStatus] = useState<'loading' | 'succeeded' | 'failed'>('loading');
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      setStatus('failed');
      return;
    }

    async function fetchSession() {
      try {
        const response = await fetch(`/api/checkout-session?session_id=${sessionId}`);
        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        const session = data.session;

        if (session.status === 'complete' && session.payment_status === 'paid') {
          if (!session.metadata || !session.metadata.userId || !session.metadata.credits) {
            console.error('Missing metadata in checkout session', session.metadata);
            setStatus('failed');
            return;
          }

          const userId = session.metadata.userId;
          const purchasedCredits = parseInt(session.metadata.credits, 10);

          // Check if this specific payment (session.id) has already been recorded in payment_history table
          const { data: existingCreditLog, error: fetchCreditLogError } = await supabase
            .from('payment_history')
            .select('id')
            .eq('stripe_payment_id', session.id)
            .maybeSingle();

          if (fetchCreditLogError) {
            throw fetchCreditLogError;
          }

          if (!existingCreditLog) {
            // Record the payment as a transaction log in the payment_history table
            const { error: insertCreditError } = await supabase
              .from('payment_history')
              .insert({
                user_id: userId,
                amount: purchasedCredits,
                stripe_payment_id: session.id,
                plan_id: session.metadata.planId || null,
                credits_purchased: purchasedCredits,
              });

            if (insertCreditError) throw insertCreditError;

            // --- NEW LOGIC: Update user_subscriptions and credit_transactions ---
            const subscriptionService = new SubscriptionService(supabase);
            if (session.metadata.planId) {
              // Create a new subscription (this will also create a credit transaction)
              try {
                await subscriptionService.createSubscription(userId, session.metadata.planId);
              } catch (e) {
                // If already has active subscription, just create a credit transaction for the purchase
                await subscriptionService.createCreditTransaction({
                  user_id: userId,
                  subscription_id: null,
                  amount: purchasedCredits,
                  type: 'credit',
                  description: `Purchased ${purchasedCredits} credits (plan: ${session.metadata.planName})`,
                });
              }
            } else {
              // No planId, just a credit purchase
              await subscriptionService.createCreditTransaction({
                user_id: userId,
                subscription_id: null,
                amount: purchasedCredits,
                type: 'credit',
                description: `Purchased ${purchasedCredits} credits`,
              });
            }
            // --- END NEW LOGIC ---
          }

          setStatus('succeeded');
          // Redirect to dashboard after a short delay
          setTimeout(() => {
            router.push('/dashboard');
          }, 3000);
        } else {
          setStatus('failed');
        }
      } catch (error) {
        console.error('Error fetching checkout session:', error);
        setStatus('failed');
      }
    }

    fetchSession();
  }, [searchParams, router, supabase]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold mb-4">Payment Status</h1>
        {status === 'loading' && (
          <div className="text-blue-600">Verifying your payment...</div>
        )}
        {status === 'succeeded' && (
          <div className="text-green-600">Payment successful! Redirecting to your dashboard...</div>
        )}
        {status === 'failed' && (
          <div className="text-red-600">Payment failed. Please try again or contact support.</div>
        )}
      </div>
    </div>
  );
}

export default function PaymentSuccess() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md text-center">
          <div className="text-blue-600">Loading...</div>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}