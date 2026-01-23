"use client";

import { useCart } from "@/context/CartContext";
import { generateWhatsAppLink } from "@/lib/whatsappUtils";
import { ArrowLeft, Minus, Plus, UtensilsCrossed, Clock, XCircle, MapPin, User, Phone, Store, Bike, AlertCircle, ShoppingBag, Info, ChevronDown, Trash2, Truck } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Restaurant } from "@/lib/types";
import { getRestaurantStatus } from "@/lib/restaurantStatus";
import RestaurantStatusBanner from "@/components/RestaurantStatusBanner";
import { cn, toTitleCase } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UpiPaymentDialog } from "@/components/UpiPaymentDialog";

// Inline Component for Countdown Banner
function AutoClearCountdown({
    lastOrderTime,
    onCancel,
    className
}: {
    lastOrderTime: number;
    onCancel: () => void;
    className?: string
}) {
    const [timeLeft, setTimeLeft] = useState<number>(0);

    useEffect(() => {
        // Update countdown
        const interval = setInterval(() => {
            // 30 Seconds timer (30000ms)
            const remaining = 30000 - (Date.now() - lastOrderTime);
            setTimeLeft(Math.max(0, remaining));
        }, 100);

        return () => clearInterval(interval);
    }, [lastOrderTime]);

    if (timeLeft <= 0) return null;

    const seconds = Math.ceil(timeLeft / 1000);

    return (
        <div className={cn("bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col gap-3 shadow-sm", className)}>
            <div className="flex items-start gap-3">
                <div className="bg-amber-100 p-2 rounded-full shrink-0">
                    <Clock className="text-amber-600" size={20} />
                </div>
                <div>
                    <h4 className="font-bold text-gray-900">Order Placed</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                        Clearing cart in <span className="font-mono font-bold text-amber-700 text-lg">{seconds}s</span>.
                        <br />
                        If you didn&apos;t send the message, press &quot;Don&apos;t Clear&quot;.
                    </p>
                </div>
            </div>
            <Button
                variant="outline"
                size="sm"
                onClick={onCancel}
                className="self-end border-amber-300 text-amber-800 hover:bg-amber-100 hover:text-amber-900"
            >
                <XCircle size={16} className="mr-2" />
                Don&apos;t Clear Cart
            </Button>
        </div>
    );
}

export default function CartPageContent({ restaurant }: { restaurant: Restaurant }) {
    const { cartItems, customerDetails, setCustomerDetails, getCartTotal, updateQuantity, placeOrder, cancelAutoClear, lastOrderTime, dontClear, clearCart } = useCart(restaurant.slug);
    const [orderType, setOrderType] = useState<"dine-in" | "takeaway" | "delivery">(() => {
        if (restaurant.supports.dineIn) return "dine-in";
        if (restaurant.supports.takeaway) return "takeaway";
        return "delivery";
    });
    const [tableNumber, setTableNumber] = useState("");
    const [mounted, setMounted] = useState(false);
    const [isTaxInfoOpen, setIsTaxInfoOpen] = useState(false);

    const [selectedDeliveryArea, setSelectedDeliveryArea] = useState<string>("");

    // Error state for validation
    const [errors, setErrors] = useState<{
        name?: string;
        phone?: string;
        address?: string;
        tableNumber?: string;
        deliveryArea?: string;
    }>({});

    const restaurantStatus = getRestaurantStatus(restaurant);
    const isOrderingDisabled = restaurantStatus === "MANUALLY_CLOSED" || !restaurant.onlineOrderingEnabled;

    // Determine supported order types
    const supportedOrderTypes = useMemo(() => [
        restaurant.supports.dineIn ? "dine-in" : null,
        restaurant.supports.takeaway ? "takeaway" : null,
        restaurant.supports.delivery ? "delivery" : null,
    ].filter(Boolean) as ("dine-in" | "takeaway" | "delivery")[], [restaurant]);

    const isInitialized = useRef(false);

    // Effect 1: Handle hydration mismatch
    useEffect(() => {
        // eslint-disable-next-line
        setMounted(true);
    }, []);

    // Effect 2: Initialization and Updates
    useEffect(() => {
        // Run this logic only once on mount/initialization
        if (!isInitialized.current) {
            const prefillLoc = localStorage.getItem(`prefillLocation_${restaurant.slug}`);

            if (prefillLoc && restaurant.supports.dineIn) {
                // Feature: QR Prefill - Force Dine-in and set location
                // Format: "table_1" -> "Table 1", "room_4" -> "Room 4"
                const formattedLoc = prefillLoc
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, char => char.toUpperCase());

                // eslint-disable-next-line
                setTableNumber(formattedLoc);
                setOrderType("dine-in");
            } else {
                // Default fallback: If current default (from useState) isn't supported, pick first supported (Priority: Dine-In > Takeaway > Delivery)
                if (supportedOrderTypes.length > 0 && !supportedOrderTypes.includes(orderType)) {
                    setOrderType(supportedOrderTypes[0]);
                }
            }
            isInitialized.current = true;
        } else {
            // Re-validation on subsequent updates (only if support changes)
            if (supportedOrderTypes.length > 0 && !supportedOrderTypes.includes(orderType)) {
                setOrderType(supportedOrderTypes[0]);
            }
        }
    }, [supportedOrderTypes, restaurant.supports.dineIn, orderType, restaurant.slug]);


    if (!mounted) return null;

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-gray-50">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
                    <UtensilsCrossed className="text-gray-300" size={40} />
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
                <p className="text-gray-500 mb-8 max-w-xs mx-auto">Add delicious items from the menu to start your order.</p>
                <Link href={`/h/${restaurant.slug}`}>
                    <Button size="lg" className="rounded-full px-8 bg-primary text-primary-foreground hover:bg-primary/90 shadow-md">Browse Menu</Button>
                </Link>
                {/* Feature 2: UPI on Empty Cart */}
                {restaurant.upiId && (
                    <div className="mt-8 pt-8 border-t border-gray-100 w-full max-w-xs flex flex-col items-center">
                        <p className="text-sm text-gray-500 mb-3">Want to pay for a previous order?</p>
                        <UpiPaymentDialog
                            upiId={restaurant.upiId}
                            restaurantName={restaurant.name}
                            whatsappNumber={restaurant.whatsappNumber}
                        />
                    </div>
                )}
            </div>
        );
    }

    const validateForm = () => {
        const newErrors: typeof errors = {};
        let isValid = true;

        if (!customerDetails.name?.trim()) {
            newErrors.name = "Please enter your name";
            isValid = false;
        }

        if ((orderType === "takeaway" || orderType === "delivery") && !customerDetails.phone?.trim()) {
            newErrors.phone = "Phone number is required";
            isValid = false;
        }

        if (orderType === "delivery" && !customerDetails.address?.trim()) {
            newErrors.address = "Delivery address is required";
            isValid = false;
        }

        if (orderType === "delivery" && restaurant.deliveryAreas.length > 0 && !selectedDeliveryArea) {
            newErrors.deliveryArea = "Please select a delivery area";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handlePlaceOrder = () => {
        if (isOrderingDisabled) return;

        if (!validateForm()) {
            // Shake effect or scroll to error could be added here
            const firstErrorField = document.querySelector('.error-input');
            firstErrorField?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        const finalTableNumber = (orderType === "dine-in" && !tableNumber?.trim())
            ? "Will inform on arrival"
            : tableNumber;

        const link = generateWhatsAppLink(restaurant, {
            customerName: customerDetails.name,
            phone: customerDetails.phone,
            address: customerDetails.address,
            tableNumber: finalTableNumber,
            deliveryArea: selectedDeliveryArea, // Feature 1
            orderType,
            items: cartItems,
            total: getCartTotal(),
        });

        // FEATURE: Auto-clear logic
        placeOrder();

        window.open(link, "_blank");
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header */}
            <div className="bg-white max-w-xl mx-auto px-4 py-4 shadow-sm sticky top-0 z-20 flex items-center gap-4">
                <Link href={`/h/${restaurant.slug}`} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft className="text-gray-700" size={20} />
                </Link>
                <h1 className="text-lg font-bold text-gray-900 flex-1">Your Cart</h1>
                {cartItems.length > 0 && (
                    <button
                        onClick={() => {
                            if (window.confirm("Are you sure you want to clear your cart?")) {
                                clearCart();
                            }
                        }}
                        className="text-xs font-medium text-red-600 flex items-center gap-1 hover:bg-red-50 p-2 rounded-lg transition-colors"
                    >
                        <Trash2 size={16} />
                        Clear
                    </button>
                )}
            </div>

            <div className="p-4 space-y-6 max-w-lg mx-auto">
                <RestaurantStatusBanner
                    status={restaurantStatus}
                    whatsappNumber={restaurant.whatsappNumber}
                    onlineOrderingEnabled={restaurant.onlineOrderingEnabled}
                    className="mb-0"
                />

                {/* Auto Clear Countdown */}
                {lastOrderTime && !dontClear && (
                    <AutoClearCountdown
                        lastOrderTime={lastOrderTime}
                        onCancel={cancelAutoClear}
                        className="animate-in fade-in slide-in-from-top-4 duration-500"
                    />
                )}

                {/* Items List */}
                <div className="bg-white rounded-2xl p-4 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] divide-y divide-gray-100">
                    {cartItems.map((item) => (
                        <div key={`${item.name}-${item.variant}`} className="flex gap-3 py-4 first:pt-0 last:pb-0">
                            {/* Left Side: Info */}
                            <div className="flex-1">
                                <div className="flex items-start gap-2">
                                    <div className={cn(
                                        "w-4 h-4 rounded border flex items-center justify-center mt-0.5",
                                        item.isVeg ? "border-green-600" : "border-red-600"
                                    )}>
                                        <div className={cn(
                                            "w-2 h-2 rounded-full",
                                            item.isVeg ? "bg-green-600" : "bg-red-600"
                                        )} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 text-sm leading-tight">{item.name}</h3>
                                        <div className="text-sm font-medium text-gray-700 mt-1">₹{(item.price || 0) * item.quantity}</div>
                                        {item.variant && (
                                            <div className="text-xs text-gray-500 mt-1 uppercase">{item.variant}</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Right Side: Quantity Controls */}
                            <div className="flex items-center self-start pt-0.5">
                                {isOrderingDisabled ? (
                                    <div className="flex items-center bg-gray-100 rounded-lg border border-gray-200 h-8 opacity-70 cursor-not-allowed px-1">
                                        <div className="w-7 h-full flex items-center justify-center text-gray-400"><Minus size={14} /></div>
                                        <span className="min-w-[1.5rem] text-center text-sm font-bold text-gray-500">{item.quantity}</span>
                                        <div className="w-7 h-full flex items-center justify-center text-gray-400"><Plus size={14} /></div>
                                    </div>
                                ) : (
                                    <div className="flex items-center bg-white rounded-lg border border-gray-200 h-8 shadow-sm">
                                        <button
                                            onClick={() => updateQuantity(item.name, item.quantity - 1, item.variant)}
                                            className="w-8 h-full flex items-center justify-center text-green-600 hover:bg-green-50 rounded-l-lg transition-colors border-r border-gray-100"
                                        >
                                            <Minus size={14} strokeWidth={2.5} />
                                        </button>
                                        <span className="w-8 text-center text-sm font-bold text-gray-800">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.name, item.quantity + 1, item.variant)}
                                            className="w-8 h-full flex items-center justify-center text-green-600 hover:bg-green-50 rounded-r-lg transition-colors border-l border-gray-100"
                                        >
                                            <Plus size={14} strokeWidth={2.5} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bill Details */}
                <div className="bg-white rounded-2xl p-4 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] space-y-3">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Bill Summary</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Estimated Item Total</span>

                            <span>₹{getCartTotal()}</span>
                        </div>

                        {/* Disclaimer instead of Tax breakdown */}
                        <div className="bg-blue-50/50 rounded-lg p-3 border border-blue-100/50">
                            <button
                                onClick={() => setIsTaxInfoOpen(!isTaxInfoOpen)}
                                className="flex items-center gap-2 text-xs font-medium text-blue-700 w-full text-left"
                            >
                                <Info size={14} />
                                <span>Price & Billing Information</span>
                                <ChevronDown size={12} className={cn("ml-auto transition-transform", isTaxInfoOpen ? "rotate-180" : "")} />
                            </button>
                            {isTaxInfoOpen && (
                                <p className="text-[11px] text-blue-600/80 mt-2 leading-relaxed">
                                    Prices shown are indicative. Final bill (including GST or other charges, if any)
                                    is decided by the restaurant at billing time.
                                </p>

                            )}
                        </div>

                        <div className="h-px bg-gray-100 my-2" />
                        <div className="flex justify-between font-bold text-base text-gray-900">
                            <span>Estimated Total</span>

                            <span>₹{getCartTotal()}</span>
                        </div>
                    </div>
                </div>

                {/* Order Type & Details - Only if Online Ordering is Enabled */}

                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-gray-900 px-1">Order Details</h3>
                    <div className="bg-white rounded-2xl p-4 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] space-y-6">
                        {/* ... (Existing Order Type Selector and Inputs) ... */}
                        {/* Order Type Selector - Dynamic Grid */}
                        {supportedOrderTypes.length > 0 && (
                            <div className={cn(
                                "grid gap-2 p-1 bg-gray-100/80 rounded-xl",
                                supportedOrderTypes.length === 1 && "grid-cols-1",
                                supportedOrderTypes.length === 2 && "grid-cols-2",
                                supportedOrderTypes.length === 3 && "grid-cols-3"
                            )}>
                                {supportedOrderTypes.includes("dine-in") && (
                                    <button
                                        onClick={() => { setOrderType("dine-in"); setErrors({}); }}
                                        className={cn(
                                            "flex flex-col items-center justify-center gap-1 py-2.5 rounded-lg text-xs font-medium transition-all duration-200",
                                            orderType === 'dine-in'
                                                ? "bg-white text-primary shadow-sm ring-1 ring-black/5"
                                                : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                                        )}
                                    >
                                        <Store size={18} />
                                        Dine-In
                                    </button>
                                )}
                                {supportedOrderTypes.includes("takeaway") && (
                                    <button
                                        onClick={() => { setOrderType("takeaway"); setErrors({}); }}
                                        className={cn(
                                            "flex flex-col items-center justify-center gap-1 py-2.5 rounded-lg text-xs font-medium transition-all duration-200",
                                            orderType === 'takeaway'
                                                ? "bg-white text-primary shadow-sm ring-1 ring-black/5"
                                                : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                                        )}
                                    >
                                        <ShoppingBag size={18} />
                                        Takeaway
                                    </button>
                                )}
                                {supportedOrderTypes.includes("delivery") && (
                                    <button
                                        onClick={() => { setOrderType("delivery"); setErrors({}); }}
                                        className={cn(
                                            "flex flex-col items-center justify-center gap-1 py-2.5 rounded-lg text-xs font-medium transition-all duration-200",
                                            orderType === 'delivery'
                                                ? "bg-white text-primary shadow-sm ring-1 ring-black/5"
                                                : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                                        )}
                                    >
                                        <Bike size={18} />
                                        Delivery
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Input Fields */}
                        <div className="space-y-4">
                            {/* Name Input */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide ml-1">Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Enter your name"
                                        value={customerDetails.name}
                                        onChange={(e) => {
                                            setCustomerDetails({ ...customerDetails, name: e.target.value });
                                            if (errors.name) setErrors({ ...errors, name: undefined });
                                        }}
                                        className={cn(
                                            "w-full pl-10 pr-4 py-3 bg-white rounded-xl border outline-none transition-all placeholder:text-gray-400 text-gray-900",
                                            errors.name
                                                ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 error-input"
                                                : "border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10"
                                        )}
                                    />
                                </div>
                                {errors.name && (
                                    <p className="text-red-500 text-xs flex items-center gap-1 ml-1 animate-in slide-in-from-top-1">
                                        <AlertCircle size={12} /> {errors.name}
                                    </p>
                                )}
                            </div>

                            {/* Phone Input */}
                            {orderType !== "dine-in" && (
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide ml-1">
                                        Phone Number
                                        <span className="text-red-500 ml-0.5">*</span>
                                    </label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="tel"
                                            placeholder="Receiver’s phone number"
                                            value={customerDetails.phone}
                                            onChange={(e) => {
                                                setCustomerDetails({ ...customerDetails, phone: e.target.value });
                                                if (errors.phone) setErrors({ ...errors, phone: undefined });
                                            }}
                                            className={cn(
                                                "w-full pl-10 pr-4 py-3 bg-white rounded-xl border outline-none transition-all placeholder:text-gray-400 text-gray-900",
                                                errors.phone
                                                    ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 error-input"
                                                    : "border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10"
                                            )}
                                        />
                                    </div>
                                    {errors.phone && (
                                        <p className="text-red-500 text-xs flex items-center gap-1 ml-1 animate-in slide-in-from-top-1">
                                            <AlertCircle size={12} /> {errors.phone}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Feature 1: Delivery Area Select */}
                            {orderType === "delivery" && restaurant.deliveryAreas.length > 0 && (
                                <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide ml-1">
                                        Delivery Area <span className="text-red-500">*</span>
                                    </label>
                                    <Select
                                        value={selectedDeliveryArea}
                                        onValueChange={(val) => {
                                            setSelectedDeliveryArea(val);
                                            if (errors.deliveryArea) setErrors({ ...errors, deliveryArea: undefined });
                                        }}
                                    >
                                        <SelectTrigger className={cn(
                                            "w-full bg-white rounded-xl h-12 border transition-all",
                                            errors.deliveryArea
                                                ? "border-red-300 ring-4 ring-red-500/10 focus:ring-red-500/10 error-input"
                                                : "border-gray-200 focus:ring-4 focus:ring-primary/10 hover:border-gray-300"
                                        )}>
                                            <div className="flex items-center gap-3 text-left">
                                                <Truck size={18} className="text-gray-400 shrink-0 ml-0.5" />
                                                <SelectValue placeholder="Select your area" />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {restaurant.deliveryAreas.map((area) => (
                                                <SelectItem key={area} value={area}>{toTitleCase(area)}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.deliveryArea && (
                                        <p className="text-red-500 text-xs flex items-center gap-1 ml-1 animate-in slide-in-from-top-1">
                                            <AlertCircle size={12} /> {errors.deliveryArea}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Conditional Inputs */}
                            {orderType === "delivery" && (
                                <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide ml-1">Delivery Address</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                                        <textarea
                                            placeholder="Complete address (House No, Street, Landmark)"
                                            value={customerDetails.address}
                                            onChange={(e) => {
                                                setCustomerDetails({ ...customerDetails, address: e.target.value });
                                                if (errors.address) setErrors({ ...errors, address: undefined });
                                            }}
                                            className={cn(
                                                "w-full pl-10 pr-4 py-3 bg-white rounded-xl border outline-none transition-all h-24 resize-none placeholder:text-gray-400 text-gray-900 leading-relaxed",
                                                errors.address
                                                    ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 error-input"
                                                    : "border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10"
                                            )}
                                        />
                                    </div>
                                    {errors.address && (
                                        <p className="text-red-500 text-xs flex items-center gap-1 ml-1 animate-in slide-in-from-top-1">
                                            <AlertCircle size={12} /> {errors.address}
                                        </p>
                                    )}
                                </div>
                            )}

                            {orderType === "dine-in" && (
                                <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide ml-1">Table / Room / Location <span className="text-gray-400 font-normal lowercase ml-1">(optional)</span></label>
                                    <div className="relative">
                                        <Store className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="text"
                                            placeholder="e.g. Table 5, Room 203, Will inform on arrival"
                                            value={tableNumber}
                                            onChange={(e) => {
                                                setTableNumber(e.target.value);
                                            }}
                                            className={cn(
                                                "w-full pl-10 pr-4 py-3 bg-white rounded-xl border outline-none transition-all placeholder:text-gray-400 text-gray-900 border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10"
                                            )}
                                        />
                                    </div>
                                    <p className="text-11px text-gray-400 ml-1">If you haven’t arrived yet, you can leave this blank.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>

            <div className="flex flex-col items-center justify-center pb-8 gap-4">
                {/* Feature 2: UPI on Cart Bottom */}
                {restaurant.upiId && cartItems.length > 0 && (
                    <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex flex-col items-center gap-2 w-full max-w-sm">
                        <p className="text-xs font-medium text-blue-700">Have you placed the order? Pay now.</p>
                        <UpiPaymentDialog
                            upiId={restaurant.upiId} // Fix: pass string directly, not object
                            restaurantName={restaurant.name}
                            whatsappNumber={restaurant.whatsappNumber}

                            className="bg-white border-blue-200 shadow-sm"
                        />
                    </div>
                )}

                <div className="text-xs tracking-wide text-gray-400">
                    Powered by
                </div>

                <Link
                    href="/"
                    className="flex items-center gap-1.5 opacity-90 hover:opacity-100 transition-opacity"
                >
                    <span className="text-2xl tracking-tight">
                        <span className="font-bold">Direct</span>
                        <span className="font-medium">Order</span>
                    </span>
                </Link>
            </div>

            {/* Bottom Sticky CTA */}
            <div className="fixed bottom-0 left-0 right-0 bg-white p-4 border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-20">
                <div className="max-w-lg mx-auto flex items-center justify-between gap-4">
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-500 uppercase font-medium">Estimated total</span>
                        <span className="text-xl font-bold text-gray-900">₹{getCartTotal()}</span>
                    </div>
                    <Button
                        onClick={handlePlaceOrder}
                        disabled={isOrderingDisabled}
                        className={cn(
                            "flex-1 h-12 text-base font-semibold rounded-xl shadow-lg transition-all active:scale-[0.98]",
                            isOrderingDisabled
                                ? "bg-gray-200 text-gray-500 cursor-not-allowed hover:bg-gray-200 shadow-none border border-gray-300"
                                : "bg-[#25D366] hover:bg-[#1ebc57] text-white shadow-green-500/30"
                        )}
                    >
                        {isOrderingDisabled
                            ? (!restaurant.onlineOrderingEnabled ? "Ordering Disabled (Menu Only)" : "Ordering Disabled")
                            : "Place Order on WhatsApp"}
                    </Button>
                </div>
            </div>
        </div >
    );
}
