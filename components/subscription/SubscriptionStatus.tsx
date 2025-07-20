'use client'
import { useEffect, useState } from 'react';
import { SubscriptionService } from '@/lib/subscription';
import { UserSubscription, CreditTransaction } from '@/types/subscription';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatDistanceToNow, format } from 'date-fns';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/auth-context';

export function SubscriptionStatus() {
    const [subscription, setSubscription] = useState<UserSubscription | null>(null);
    const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
    const { user } = useAuth();
    const subscriptionService = new SubscriptionService();

    useEffect(() => {
        if (user) {
            loadSubscriptionData();
        }
    }, [user]);

    const loadSubscriptionData = async () => {
        if (!user) return;

        try {
            const [userSubscription, creditTransactions] = await Promise.all([
                subscriptionService.getUserSubscription(user.id),
                subscriptionService.getCreditTransactions(user.id)
            ]);

            setSubscription(userSubscription);
            setTransactions(creditTransactions);
        } catch (error) {
            console.error('Failed to load subscription data:', error);
        }
    };

    if (!subscription) {
        return (
            <Card className="bg-neutral-950 border-none shadow-md shadow-neutral-300 text-white">
                <CardHeader>
                    <CardTitle>Manage Subscription</CardTitle>
                    <CardDescription>
                        You do not have an active subscription. Subscribe to a plan to start using credits.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-center mt-4">
                        <a href="#plans">
                            <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded transition">
                                View Plans & Subscribe
                            </button>
                        </a>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const calculateCreditUsage = () => {
        const totalCredits = subscription.credits_remaining;
        const usedCredits = transactions
            .filter(t => t.type === 'debit')
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);
        
        return {
            used: usedCredits,
            total: totalCredits + usedCredits,
            percentage: (usedCredits / (totalCredits + usedCredits)) * 100
        };
    };

    const creditUsage = calculateCreditUsage();
    const endDate = new Date(subscription.end_date);
    const timeRemaining = formatDistanceToNow(endDate, { addSuffix: true });
    const isExpiringSoon = endDate.getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000; // 7 days

    return (
        <div className="space-y-6">
            <Card className="bg-neutral-950 border-none shadow-md shadow-neutral-300 text-white">
                <CardHeader>
                    <CardTitle>Subscription Status</CardTitle>
                    <CardDescription>
                        Your current subscription and credit usage
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold">Subscription Period</h3>
                            <div className="mt-2 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Start Date:</span>
                                    <span>{new Date(subscription.start_date).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">End Date:</span>
                                    <span>{endDate.toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between text-sm items-center">
                                    <span className="text-muted-foreground">Time Remaining:</span>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div className="flex items-center gap-1">
                                                    <span className={isExpiringSoon ? "text-red-600 font-semibold" : ""}>
                                                        {timeRemaining}
                                                    </span>
                                                    {isExpiringSoon && (
                                                        <AlertCircle className="h-4 w-4 text-red-600" />
                                                    )}
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Your current plan will end on {format(endDate, 'MMMM do, yyyy')}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold">Credits</h3>
                            <div className="mt-2">
                                <Progress value={creditUsage.percentage} className="h-2" />
                                <div className="mt-2 flex justify-between text-sm text-muted-foreground">
                                    <span>{creditUsage.used} credits used</span>
                                    <span>{subscription.credits_remaining} credits remaining</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold">Recent Transactions</h3>
                            <div className="space-y-2">
                                {transactions.slice(0, 5).map((transaction) => (
                                    <div
                                        key={transaction.id}
                                        className="flex justify-between items-center p-2 bg-neutral-900 rounded border border-neutral-800"
                                    >
                                        <div>
                                            <p className="font-medium">{transaction.description}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {new Date(transaction.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <span className={`font-semibold ${
                                            transaction.type === 'debit' ? 'text-red-600' : 'text-green-600'
                                        }`}>
                                            {transaction.type === 'debit' ? '-' : '+'}{Math.abs(transaction.amount)} credits
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 