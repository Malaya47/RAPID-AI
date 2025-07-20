export type SubscriptionStatus = 'active' | 'cancelled' | 'expired';
export type TransactionType = 'credit' | 'debit';

export interface SubscriptionPlan {
    id: string;
    name: string;
    description: string;
    price: number;
    credits_per_month: number;
    duration_months: number;
    is_annual: boolean;
    stripe_price_id: string | null;
    stripe_product_id: string | null;
    created_at: string;
    updated_at: string;
}

export interface UserSubscription {
    id: string;
    user_id: string;
    plan_id: string;
    start_date: string;
    end_date: string;
    credits_remaining: number;
    status: SubscriptionStatus;
    created_at: string;
    updated_at: string;
}

export interface CreditTransaction {
    id: string;
    user_id: string;
    subscription_id: string | null;
    amount: number;
    type: TransactionType;
    description: string;
    created_at: string;
} 