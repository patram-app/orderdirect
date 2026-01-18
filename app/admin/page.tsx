"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import OutletForm from "@/components/admin/OutletForm";
import MenuManager from "@/components/admin/MenuManager";
import { databases, DATABASE_ID, RESTAURANTS_COLLECTION_ID, MENU_ITEMS_COLLECTION_ID } from "@/lib/appwrite";
import { RestaurantDocument } from "@/lib/types";
import { Query } from "appwrite";
import Footer from "@/components/Footer";

export default function AdminDashboard() {
    const { user, loading: authLoading, logout } = useAuth();
    const router = useRouter();
    const [restaurant, setRestaurant] = useState<RestaurantDocument | null>(null);
    const [hasMenuItems, setHasMenuItems] = useState(false);
    const [loading, setLoading] = useState(true);

    const [isProfileOpen, setIsProfileOpen] = useState(false);

    useEffect(() => {
        const fetchRestaurant = async () => {
            setLoading(true);
            try {
                // NOTE: In a multi-tenant app, we'd query by Owner ID. 
                // For this single-admin demo, we'll just fetch the first restaurant found 
                const res = await databases.listDocuments(
                    DATABASE_ID,
                    RESTAURANTS_COLLECTION_ID,
                    [
                        Query.equal("ownerId", user!.$id),
                        Query.limit(1)
                    ]
                );
                if (res.total > 0) {
                    const restDoc = res.documents[0] as unknown as RestaurantDocument;
                    setRestaurant(restDoc);

                    // Check for menu items (Lock logic)
                    const menuRes = await databases.listDocuments(
                        DATABASE_ID,
                        MENU_ITEMS_COLLECTION_ID,
                        [
                            Query.equal("restaurantSlug", restDoc.slug),
                            Query.limit(1)
                        ]
                    );
                    setHasMenuItems(menuRes.total > 0);
                }
            } catch (error) {
                console.error("Failed to fetch restaurant", error);
            } finally {
                setLoading(false);
            }
        };

        if (!authLoading && !user) {
            router.push("/admin/login");
        } else if (user) {
            fetchRestaurant();
        }
    }, [user, authLoading, router]);

    const handleOutletSave = (data: RestaurantDocument) => {
        setRestaurant(data);
        // After save, we refresh just to be sure, or just update state
        alert("Outlet details saved successfully!");
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Admin Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">

                        <h1 className="text-2xl text-gray-900 tracking-tight">
                            <span className="font-bold">Direct</span>
                            <span className="font-medium">Order</span>
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Button
                                variant="outline"
                                size="icon"
                                className="w-10 h-10 rounded-full border-gray-200 hover:bg-gray-100 hover:text-gray-900"
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                            >
                                <User className="h-5 w-5 text-gray-600" />
                            </Button>

                            {isProfileOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setIsProfileOpen(false)}
                                    />
                                    <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl z-50 p-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                        <div className="px-3 py-2.5 border-b border-gray-50 mb-1 bg-gray-50/50 rounded-t-lg">
                                            <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                                            <p className="text-xs text-gray-500 truncate mt-0.5">{user.email}</p>
                                        </div>
                                        <button
                                            onClick={() => { logout(); setIsProfileOpen(false); }}
                                            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors"
                                        >
                                            <LogOut size={16} />
                                            Sign Out
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

                {/* 1. Outlet Section */}
                <section>
                    <OutletForm
                        initialData={restaurant}
                        ownerId={user.$id}
                        onSave={handleOutletSave}
                        hasMenuItems={hasMenuItems}
                    />
                </section>

                {/* 2. Menu Section (Locked if no restaurant) */}
                <section className={`transition-opacity duration-300 ${!restaurant ? "opacity-50 pointer-events-none grayscale" : ""}`}>
                    {!restaurant && (
                        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl mb-4 text-amber-800 text-sm font-medium">
                            🔒 Please complete and save outlet details above to unlock Menu Management.
                        </div>
                    )}

                    {restaurant && (
                        <div className="bg-white  p-6 rounded-2xl shadow-sm border border-gray-100">
                            <MenuManager restaurantSlug={restaurant.slug} />
                        </div>
                    )}
                </section>

            </main>
            <Footer />
        </div>
    );
}
