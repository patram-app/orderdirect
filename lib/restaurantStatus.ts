import { Restaurant } from "@/lib/types";

export type RestaurantStatus = "OPEN" | "CLOSED" | "MANUALLY_CLOSED";

export function getRestaurantStatus(restaurant: Restaurant): RestaurantStatus {
    if (restaurant.manuallyClosed) {
        return "MANUALLY_CLOSED";
    }

    // Time check logic
    const now = new Date();
    const dayKey = now.toLocaleDateString("en-US", { weekday: "short" }).toLowerCase();
    const todayTimings = restaurant.timings[dayKey];

    if (!todayTimings) {
        return "CLOSED";
    }

    // FEATURE 1: Explicit Closed Logic
    if (todayTimings.open === "00:00" && todayTimings.close === "00:00") {
        return "CLOSED";
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
        if (currentTime >= openTime || currentTime <= closeTime) {
            return "OPEN";
        }
    } else {
        if (currentTime >= openTime && currentTime <= closeTime) {
            return "OPEN";
        }
    }

    return "CLOSED";
}
