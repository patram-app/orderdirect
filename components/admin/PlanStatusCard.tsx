"use client";

import { PlanType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

interface PlanStatusCardProps {
    plan: PlanType;
    planExpiry: string; // ISO String
    orderingMode?: string;
}

export default function PlanStatusCard({ plan, planExpiry, orderingMode }: PlanStatusCardProps) {
    const now = new Date();
    const expiryDate = new Date(planExpiry || 0);

    // Calculate days remaining
    const diffTime = expiryDate.getTime() - now.getTime();
    const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    const isExpired = diffTime < 0;

    const isPremium = plan === 'whatsapp' || plan === 'admin_orders';
    const canAccessAdminOrders = plan === 'admin_orders';
    const isLowDays = daysRemaining <= 7 && !isExpired;

    return (
        <div className="w-full bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                {/* Left: Plan Info */}
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                        isPremium ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-500"
                    )}>
                        <Sparkles size={20} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg font-bold text-gray-900 capitalize leading-tight">
                                {plan.replace('_', ' ')} Plan
                            </h2>
                            {isPremium && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200 uppercase tracking-wide">
                                    PRO
                                </span>
                            )}
                        </div>
                        <div className="text-xs text-gray-500 font-medium flex items-center gap-2 mt-0.5">
                            <span className={cn(isLowDays ? "text-amber-600" : "text-gray-500")}>
                                {isExpired ? "Expired" : `${daysRemaining} Days Left`}
                            </span>
                            <span>•</span>
                            <span className="capitalize">Mode: {orderingMode?.replace('_', ' ')}</span>
                        </div>
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 self-start sm:self-auto">
                    {canAccessAdminOrders && (
                        <a href="/admin/orders" className="flex items-center gap-2 px-3 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded-lg hover:bg-gray-800 transition-colors">
                            Live Orders
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}
