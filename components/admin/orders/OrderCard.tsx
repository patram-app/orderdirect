"use client";

import { OrderDocument } from "@/lib/types";
import { format } from "date-fns";
import { Clock, MapPin, Phone, ShoppingBag, Utensils, Zap } from "lucide-react";
import { useEffect, useState, useMemo } from "react";

interface OrderCardProps {
    order: OrderDocument;
}

export default function OrderCard({ order }: OrderCardProps) {
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
        const interval = setInterval(checkIsNew, 60000); // Re-check every minute
        return () => clearInterval(interval);
    }, [order]);

    const getOrderTypeColor = (type: string) => {
        switch (type) {
            case "dine_in": return "bg-orange-100 text-orange-800 border-orange-200";
            case "takeaway": return "bg-blue-100 text-blue-800 border-blue-200";
            case "delivery": return "bg-green-100 text-green-800 border-green-200";
            default: return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    const getOrderTypeIcon = (type: string) => {
        switch (type) {
            case "dine_in": return <Utensils size={14} className="mr-1" />;
            case "takeaway": return <ShoppingBag size={14} className="mr-1" />;
            case "delivery": return <MapPin size={14} className="mr-1" />;
            default: return null;
        }
    };

    const formatOrderType = (type: string) => {
        return type.replace("_", " ").toUpperCase();
    }

    return (
        <div className={`bg-white rounded-xl shadow-sm border p-5 transition-all duration-500 animate-in slide-in-from-top-2 fade-in ${isNew ? "border-primary/50 ring-1 ring-primary/20 shadow-md" : "border-gray-200"
            }`}>
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border flex items-center ${getOrderTypeColor(order.orderType)}`}>
                            {getOrderTypeIcon(order.orderType)}
                            {formatOrderType(order.orderType)}
                        </span>
                        {isNew && (
                            <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-600 text-[10px] font-bold tracking-wider animate-pulse flex items-center border border-red-100">
                                <Zap size={10} className="mr-1 fill-red-600" /> NEW
                            </span>
                        )}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">{order.customerName}</h3>
                    {order.customerPhone && (
                        <a href={`tel:${order.customerPhone}`} className="text-sm text-gray-500 hover:text-gray-900 flex items-center mt-0.5">
                            <Phone size={12} className="mr-1" /> {order.customerPhone}
                        </a>
                    )}
                </div>
                <div className="text-right">
                    <div className="text-xs text-gray-400 font-medium flex items-center justify-end">
                        <Clock size={12} className="mr-1" />
                        {order.$createdAt ? format(new Date(order.$createdAt), "h:mm a") : "Just now"}
                    </div>
                    <div className="text-xs text-gray-300 mt-0.5">
                        {order.$createdAt ? format(new Date(order.$createdAt), "d MMM") : ""}
                    </div>
                </div>
            </div>

            {/* Location Info */}
            {(order.dineInLocation || order.deliveryAddress) && (
                <div className="mb-4 p-2.5 bg-gray-50 rounded-lg text-sm text-gray-700 border border-gray-100">
                    {order.orderType === 'dine_in' && (
                        <div className="flex items-start">
                            <Utensils size={14} className="mt-0.5 mr-2 text-gray-400" />
                            <span className="font-medium">Table/Loc: {order.dineInLocation}</span>
                        </div>
                    )}
                    {order.orderType === 'delivery' && (
                        <div className="space-y-1">
                            {order.deliveryArea && (
                                <div className="flex items-start">
                                    <MapPin size={14} className="mt-0.5 mr-2 text-gray-400" />
                                    <span className="font-semibold text-gray-900">{order.deliveryArea}</span>
                                </div>
                            )}
                            <div className="pl-6 text-gray-600 leading-snug">
                                {order.deliveryAddress}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Items */}
            <div className="space-y-2 mb-4">
                {parsedItems.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start text-sm">
                        <div className="flex items-start gap-2">
                            <span className="font-bold text-gray-900 min-w-[1.2rem] text-center bg-gray-100 rounded text-xs py-0.5">
                                {item.qty}x
                            </span>
                            <div>
                                <span className="text-gray-800">{item.name}</span>
                                {item.variant && (
                                    <span className="text-gray-500 text-xs ml-1">({item.variant})</span>
                                )}
                            </div>
                        </div>
                        <div className="text-gray-600 font-medium whitespace-nowrap">
                            ₹{item.price * item.qty}
                        </div>
                    </div>
                ))}
            </div>

            {/* Total */}
            <div className="pt-3 border-t border-dashed border-gray-200 flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500">Total Amount</span>
                <span className="text-xl font-bold text-gray-900">₹{order.total}</span>
            </div>
        </div>
    );
}
