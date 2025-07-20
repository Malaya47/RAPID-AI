import React from 'react'
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { CheckCircle } from 'lucide-react';

const PricingPlan = ({ title, price, description, features, popular = false, onSelectPlan, buttonText = "Get Started", disabled = false, annualPrice }: {
    title: string;
    price: string;
    description: string;
    features: string[];
    popular?: boolean;
    onSelectPlan: () => void;
    buttonText?: string;
    disabled?: boolean;
    annualPrice?: string;
}) => {
    return (
        <Card className={`relative overflow-hidden rounded-3xl ${popular ? 'border-indigo-500 bg-transparent' : 'border-neutral-800 bg-transparent scale-95'}`}>
            {popular && (
                <div className="absolute top-0 right-0">
                    <div className="bg-indigo-500 text-white text-xs font-medium py-1 px-3 rounded-bl-lg">
                        Most Popular
                    </div>
                </div>
            )}
            <CardContent className="p-6 pt-8">
                <h3 className="text-xl font-medium text-white mb-2">{title}</h3>
                <div className="flex items-baseline mb-4">
                    <span className="text-3xl font-bold text-white">${price}</span>
                    <span className="text-neutral-400 ml-1">/month</span>
                </div>
                <p className="text-neutral-400 mb-4">{description}</p>

                {annualPrice && (
                    <div className="mb-4">
                        <span className="text-neutral-200 textsm">${annualPrice} billed annually</span>
                    </div>
                )}
                <Button
                    variant={popular ? "outline" : "default"}
                    className="w-full mb-6"
                    onClick={onSelectPlan}
                    disabled={disabled}
                >
                    {buttonText}
                </Button>
                <ul className="space-y-3">
                    {features.map((feature, index) => (
                        <li key={index} className="flex">
                            <CheckCircle className="h-5 w-5 text-indigo-400 mr-2 flex-shrink-0" />
                            <span className="text-neutral-300 text-sm">{feature}</span>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
};

export default PricingPlan