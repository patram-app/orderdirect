import { getRestaurant } from "@/lib/api";
import CartPageContent from "@/components/CartPageContent";
import { notFound } from "next/navigation";

export default async function CartPage({ params }: { params: Promise<{ restaurantSlug: string }> }) {
    const { restaurantSlug } = await params;
    const restaurant = await getRestaurant(restaurantSlug);

    if (!restaurant) {
        notFound();
    }

    return <CartPageContent restaurant={restaurant} />;
}
