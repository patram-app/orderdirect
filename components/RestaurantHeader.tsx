
"use client";

import { useRef } from "react";
import { Restaurant } from "@/lib/types";
import { MapPin, Clock, Phone, ChevronDown, Utensils, Bike } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UpiPaymentDialog } from "./UpiPaymentDialog";
import { toTitleCase } from "@/lib/utils";

export default function RestaurantHeader({ restaurant }: { restaurant: Restaurant }) {
    const detailsRef = useRef<HTMLDetailsElement>(null);

    // Get current day/time
    const now = new Date();
    const dayKey = now.toLocaleDateString("en-US", { weekday: "short" }).toLowerCase(); // 'mon', 'tue', etc.
    const todayTimings = restaurant.timings[dayKey];

    // Helper to check if currently open time-wise
    const isTimeOpen = () => {
        if (!todayTimings) return false;

        // FEATURE 1: Explicit Closed Logic
        if (todayTimings.open === "00:00" && todayTimings.close === "00:00") {
            return false;
        }

        const currentHours = now.getHours();
        const currentMinutes = now.getMinutes();
        const currentTime = currentHours * 60 + currentMinutes;

        const [openHour, openMinute] = todayTimings.open.split(':').map(Number);
        const [closeHour, closeMinute] = todayTimings.close.split(':').map(Number);

        const openTime = openHour * 60 + openMinute;
        const closeTime = closeHour * 60 + closeMinute;

        // Handle crossing midnight (e.g. 10:00 to 02:00)
        if (closeTime < openTime) {
            return currentTime >= openTime || currentTime <= closeTime;
        }

        return currentTime >= openTime && currentTime <= closeTime;
    };

    const isOpen = !restaurant.manuallyClosed && isTimeOpen();

    // Helper to format 24h time to 12h AM/PM
    const formatTime = (timeStr: string) => {
        if (!timeStr) return "";
        const [hourStr, minStr] = timeStr.split(':');
        let hour = parseInt(hourStr, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        hour = hour % 12;
        hour = hour ? hour : 12; // '0' should be '12'
        return `${hour}:${minStr} ${ampm}`;
    };



    // Ordered days for display
    const daysOrder = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
    const dayLabels: Record<string, string> = {
        mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday", fri: "Friday", sat: "Saturday", sun: "Sunday"
    };

    return (
        <div className="relative max-w-xl mx-auto bg-background dark:bg-card pt-8 pb-6 mb-2 rounded-b-[2.5rem] shadow-sm overflow-hidden isolate">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 right-0 -z-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute top-10 left-10 -z-10 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl"></div>

            <div className="px-6">
                {/* Header Top Section */}
                <div className="flex flex-col gap-1.5 mb-6">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {restaurant.supports.dineIn && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 border border-primary/20">
                                <Utensils size={10} /> Dine-In
                            </span>
                        )}
                        {restaurant.supports.takeaway && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-300 border border-orange-100 dark:border-orange-800">
                                <Bike size={10} /> Takeaway
                            </span>
                        )}
                        {restaurant.supports.delivery && (
                            restaurant.deliveryAreas && restaurant.deliveryAreas.length > 0 ? (
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <button className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-300 border border-blue-100 dark:border-blue-800 hover:bg-blue-100 transition-colors cursor-pointer">
                                            <Bike size={10} /> Delivery <ChevronDown size={10} />
                                        </button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-xs">
                                        <DialogHeader>
                                            <DialogTitle className="flex items-center gap-2">
                                                <Bike size={18} className="text-blue-600" />
                                                Delivery Areas
                                            </DialogTitle>
                                        </DialogHeader>
                                        <div className="py-2">
                                            <p className="text-sm text-gray-500 mb-3">
                                                We deliver to the following areas:
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {restaurant.deliveryAreas.map((area, cls) => (
                                                    <span key={cls} className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md text-sm border border-blue-100">
                                                        {toTitleCase(area)}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-300 border border-blue-100 dark:border-blue-800">
                                    <Bike size={10} /> Delivery
                                </span>
                            )
                        )}
                    </div>

                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground dark:text-foreground leading-tight">
                        {restaurant.name}
                    </h1>
                    <p className="text-sm font-medium text-muted-foreground line-clamp-2 leading-relaxed">
                        {restaurant.description}
                    </p>
                </div>

                {/* Status Bar - Always Visible */}
                <div className="flex items-center gap-3 mb-6">
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${isOpen
                        ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800'
                        : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800'
                        }`}>
                        <span className={`w-2 h-2 rounded-full ${isOpen ? 'bg-green-600 animate-pulse' : 'bg-red-600'}`}></span>
                        {isOpen ? "Open Now" : "Closed"}
                    </div>
                    <div className="h-4 w-px bg-border"></div>
                    <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                        <Clock size={13} />
                        <span>Today: {todayTimings && !(todayTimings.open === "00:00" && todayTimings.close === "00:00") ? `${formatTime(todayTimings.open)} - ${formatTime(todayTimings.close)}` : "Closed"}</span>
                    </div>
                </div>

                {/* Menu Only Banner */}
                {restaurant.orderingMode === 'menu' && (
                    <div className="mb-6 animate-in fade-in slide-in-from-top-2">
                        <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-xs font-medium leading-normal w-full">
                            <Phone size={14} className="shrink-0 fill-current" />
                            <span>
                                <strong>Menu Only:</strong> Online ordering unavailable. Please call or visit to order.
                            </span>
                        </div>
                    </div>
                )}



                {/* Interactive Details Accordion */}
                {/* Minimal Interactive Details */}
                <div className="pt-0 relative">
                    <details className="group w-full" ref={detailsRef}>
                        <summary className="inline-flex items-center  gap-1 cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden text-foreground/70 hover:text-primary/80 transition-colors">
                            <span className="text-sm font-semibold underline underline-offset-4 decoration-foreground/70 decoration-dashed group-hover:decoration-primary/60 transition-all">
                                Outlet Details
                            </span>
                            <ChevronDown size={14} className="group-open:rotate-180 transition-transform duration-300" />
                        </summary>

                        <div className="mt-4 pl-0 space-y-6 animate-in slide-in-from-top-2 fade-in duration-300 relative">


                            {/* Address & Contact */}
                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="mt-0.5 min-w-[18px]"><MapPin size={16} className="text-muted-foreground" /></div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">Full Address</span>
                                        <p className="text-sm text-foreground leading-snug">{restaurant.address}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="mt-0.5 min-w-[18px]"><Phone size={16} className="text-muted-foreground" /></div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">Contact Number</span>
                                        <a href={`tel:+${restaurant.whatsappNumber}`} className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                                            {restaurant.whatsappNumber}
                                        </a>
                                    </div>
                                </div>
                            </div>

                            <div className="h-px bg-border/40 w-full"></div>

                            {/* Timings */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <Clock size={16} className="text-muted-foreground" />
                                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">Opening Hours</span>
                                </div>

                                <div className="grid grid-cols-1 gap-2 pl-6">
                                    {daysOrder.map((day) => {
                                        const time = restaurant.timings[day];
                                        const isToday = day === dayKey;
                                        return (
                                            <div key={day} className={`flex justify-between items-center text-sm ${isToday ? "font-bold text-foreground" : ""}`}>
                                                <span className={`capitalize w-24 font-medium ${isToday ? "text-primary" : "text-muted-foreground"}`}>
                                                    {dayLabels[day]} {isToday && <span className="text-[10px] ml-1 uppercase bg-primary/10 px-1 py-0.5 rounded text-primary">Today</span>}
                                                </span>
                                                <div className="flex-1 h-px bg-border/40 mx-3 border-dashed"></div>
                                                <span className={`font-medium ${isToday ? "text-foreground" : "text-muted-foreground"}`}>
                                                    {(time && (time.open !== "00:00" || time.close !== "00:00")) ? `${formatTime(time.open)} - ${formatTime(time.close)}` : "Closed"}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {restaurant.googleMapsLink && (
                                <div className="pt-2">
                                    <a
                                        href={restaurant.googleMapsLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 w-full py-2.5 bg-secondary/50 border border-border/50 rounded-lg text-sm font-semibold text-foreground hover:bg-secondary transition-colors shadow-sm"
                                    >
                                        <MapPin size={14} /> Get Directions
                                    </a>
                                </div>
                            )}
                        </div>
                    </details>

                    {/* Feature 2: UPI Button Inline */}
                    {restaurant.upiId && (
                        <div className="absolute top-0 right-0">
                            <UpiPaymentDialog
                                upiId={restaurant.upiId}
                                restaurantName={restaurant.name}
                                whatsappNumber={restaurant.whatsappNumber}
                                trigger={
                                    <button className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5">
                                        Pay via UPI
                                    </button>
                                }
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
