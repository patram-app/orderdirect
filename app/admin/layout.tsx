"use client";

import AdminHeader from "@/components/admin/AdminHeader";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const isPublicPage = pathname.includes("/login") || pathname.includes("/signup");

    useEffect(() => {
        if (!loading && !user && !isPublicPage) {
            router.push("/admin/login");
        }
    }, [user, loading, router, isPublicPage]);


    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (isPublicPage) {
        return (
            <div className="min-h-screen bg-gray-50 font-sans">
                {children}
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <AdminHeader />
            {children}
        </div>
    );
}
