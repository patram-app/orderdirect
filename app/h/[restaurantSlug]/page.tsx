import { getMenu, getRestaurant } from "@/lib/api";
import RestaurantHeader from "@/components/RestaurantHeader";
import MenuBrowser from "@/components/MenuBrowser";
import CartStickyFooter from "@/components/CartStickyFooter";
import LocationCapture from "@/components/LocationCapture";
import SeoHead from "@/components/SeoHead";
import { buildRestaurantTitle, buildRestaurantDescription } from "@/lib/seo";
import { notFound } from "next/navigation";
import { Metadata } from "next";

type Props = {
    params: Promise<{ restaurantSlug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { restaurantSlug } = await params;
    const restaurant = await getRestaurant(restaurantSlug);

    if (!restaurant) {
        return {
            title: "Restaurant Not Found | DirectOrder",
        };
    }

    return {
        title: buildRestaurantTitle(restaurant),
        description: buildRestaurantDescription(restaurant),
        openGraph: {
            title: buildRestaurantTitle(restaurant),
            description: buildRestaurantDescription(restaurant),
            type: "website",
        },
    };
}

export default async function RestaurantPage({ params }: Props) {
    const { restaurantSlug } = await params;
    const restaurant = await getRestaurant(restaurantSlug);

    if (!restaurant) {
        notFound();
    }

    const menu = await getMenu(restaurantSlug);

    return (
        <main className="min-h-screen bg-gray-50 pb-20">
            <SeoHead restaurant={restaurant} menu={menu} />
            <LocationCapture slug={restaurantSlug} />
            <RestaurantHeader restaurant={restaurant} />
            <MenuBrowser menu={menu} restaurant={restaurant} />
            <CartStickyFooter restaurantSlug={restaurantSlug} />
        </main>
    );
}
