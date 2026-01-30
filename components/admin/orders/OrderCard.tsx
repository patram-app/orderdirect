"use client";

import { OrderDocument } from "@/lib/types";
import { format } from "date-fns";
import { Clock, MapPin, Phone, ShoppingBag, Utensils, Zap } from "lucide-react";
import { useEffect, useState, useMemo } from "react";

interface OrderCardProps {
    order: OrderDocument;
    isChecked: boolean;
    onToggleCheck: () => void;
}

export default function OrderCard({ order, isChecked, onToggleCheck }: OrderCardProps) {
    const [isNew, setIsNew] = useState(false);
    const parsedItems = useMemo(() => {
        try {
            return order.items.map(itemStr => JSON.parse(itemStr));
        } catch (error) {
            console.error("Failed to parse order items", error);
            return [];
        }
    }, [order.items]);

    useEffect(() => {
        // Check if order is "new" (less than 5 minutes old)
        const checkIsNew = () => {
            if (!order.$createdAt) return;
            const created = new Date(order.$createdAt);
            const now = new Date();
            const diffInMinutes = (now.getTime() - created.getTime()) / 1000 / 60;
            setIsNew(diffInMinutes < 5);
        };

        checkIsNew();
        const interval = setInterval(checkIsNew, 10000); // Re-check every 10 seconds for more precision
        return () => clearInterval(interval);
    }, [order]);

    const getOrderTypeStyles = (type: string) => {
        switch (type) {
            case "dine_in": return { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", icon: <Utensils size={14} /> };
            case "takeaway": return { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", icon: <ShoppingBag size={14} /> };
            case "delivery": return { bg: "bg-green-50", text: "text-green-700", border: "border-green-200", icon: <MapPin size={14} /> };
            default: return { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200", icon: <ShoppingBag size={14} /> };
        }
    };

    const typeStyles = getOrderTypeStyles(order.orderType);

    const formatOrderType = (type: string) => {
        return type.replace("_", " ").toUpperCase();
    }

    return (
        <>
            <div className={`relative rounded-xl transition-all duration-300 overflow-hidden group
                ${!isChecked
                    ? "bg-white scale-[1.02] z-20 animate-focus-pulse"
                    : "bg-white border text-gray-900 border-gray-200 shadow-sm"
                }
            `}>
                <div className="relative z-10 p-5">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                            <div className="flex items-center flex-wrap gap-2 mb-2">
                                <span className={`px-2.5 py-1 rounded-md text-xs font-bold border flex items-center gap-1.5 uppercase tracking-wide ${typeStyles.bg} ${typeStyles.text} ${typeStyles.border}`}>
                                    {typeStyles.icon}
                                    {formatOrderType(order.orderType)}
                                </span>
                                {isNew && (
                                    <span className="px-2 py-1 rounded-md bg-red-100 text-red-700 text-xs font-bold animate-pulse flex items-center gap-1">
                                        <Zap size={12} className="fill-red-700" /> NEW
                                    </span>
                                )}
                            </div>
                            {/* Text Always Black/Dark */}
                            <h3 className="text-lg font-bold leading-tight text-gray-900">
                                {order.customerName}
                            </h3>
                            {order.orderType !== 'dine_in' && order.customerPhone && (
                                <a href={`tel:${order.customerPhone}`} className="text-sm text-gray-500 hover:text-gray-900 flex items-center mt-1 transition-colors w-fit">
                                    <Phone size={13} className="mr-1.5" /> {order.customerPhone}
                                </a>
                            )}
                        </div>

                        <div className="flex flex-col items-end gap-2">
                            <div className="text-xs text-gray-500 font-medium flex items-center bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
                                <Clock size={12} className="mr-1.5" />
                                {order.$createdAt ? format(new Date(order.$createdAt), "h:mm a") : "Just now"}
                            </div>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleCheck();
                                }}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${isChecked
                                    ? "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200"
                                    : "bg-green-600 text-white hover:bg-green-700 shadow-green-200 hover:shadow-green-300 hover:-translate-y-0.5"
                                    }`}
                            >
                                {isChecked ? (
                                    <>
                                        <span className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="w-2.5 h-2.5 text-white"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                        </span>
                                        Checked
                                    </>
                                ) : (
                                    <>
                                        <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                        Check
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Location Info */}
                    {(order.dineInLocation || order.deliveryAddress) && (
                        <div className={`mb-4 p-3 rounded-lg text-sm border ${isChecked ? "bg-gray-50 border-gray-100 text-gray-500" : "bg-blue-50/50 border-blue-100 text-gray-800"}`}>
                            {order.orderType === 'dine_in' && (
                                <div className="flex items-start">
                                    <Utensils size={15} className="mt-0.5 mr-2.5 opacity-70" />
                                    <span className="font-semibold text-base">Loc: {order.dineInLocation}</span>
                                </div>
                            )}
                            {order.orderType === 'delivery' && (
                                <div className="space-y-1.5">
                                    {order.deliveryArea && (
                                        <div className="flex items-start">
                                            <MapPin size={15} className="mt-0.5 mr-2.5 opacity-70" />
                                            <span className="font-bold text-gray-900">{order.deliveryArea}</span>
                                        </div>
                                    )}
                                    <div className="pl-6 text-gray-700 leading-snug">
                                        {order.deliveryAddress}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Items */}
                    <div className="space-y-2.5 mb-5 relative">
                        {/* Divider line for unchecked items to help visual separation - Keep it? Maybe subtle */}
                        {!isChecked && <div className="absolute -left-5 top-0 bottom-0 w-1 bg-green-500/20"></div>}

                        {parsedItems.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-start text-sm">
                                <div className="flex items-start gap-3">
                                    <span className="font-bold min-w-[1.5rem] h-6 flex items-center justify-center rounded text-xs bg-gray-900 text-white">
                                        {item.qty}
                                    </span>
                                    <div>
                                        <div className="font-medium text-gray-900">{item.name}</div>
                                        {item.variant && (
                                            <div className="text-gray-500 text-xs mt-0.5">{item.variant}</div>
                                        )}
                                    </div>
                                </div>
                                <div className="text-gray-900 font-bold whitespace-nowrap text-xs mt-1">
                                    ₹{item.price * item.qty}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Total */}
                    <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-500">Total Amount</span>
                        <span className="text-xl font-bold text-gray-900">₹{order.total}</span>
                    </div>
                </div>
            </div>
            <style jsx>{`
                @keyframes focus-pulse {
                    0% {
                        box-shadow: 0 0 0 0 rgba(22, 163, 74, 0.4);
                        border: 2px solid rgba(134, 239, 172, 0.5); /* Light Green */
                    }
                    50% {
                        box-shadow: 0 0 20px 0 rgba(22, 163, 74, 0.6);
                        border: 2px solid rgba(22, 163, 74, 1); /* Dark/Strong Green */
                    }
                    100% {
                        box-shadow: 0 0 0 0 rgba(22, 163, 74, 0.4);
                        border: 2px solid rgba(134, 239, 172, 0.5); /* Light Green */
                    }
                }
                .animate-focus-pulse {
                    animation: focus-pulse 2s infinite ease-in-out;
                }
            `}</style>
        </>
    );
}
