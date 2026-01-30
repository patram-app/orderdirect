"use client";

import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, User, Utensils, ClipboardList } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminHeader() {
    const { user, logout } = useAuth();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const pathname = usePathname();

    if (!user) return null;

    const navLinks = [
        { name: "My Outlet", href: "/admin", icon: Utensils },
    ];

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <h1 className="text-2xl text-gray-900 tracking-tight">
                        <span className="font-bold">Direct</span>
                        <span className="font-medium">Order</span>
                    </h1>

                    {/* Desktop Warning Nav */}
                    <nav className="hidden md:flex gap-1">
                        {navLinks.map((link) => {
                            const Icon = link.icon;
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                                        ? "bg-gray-100 text-gray-900"
                                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                                        }`}
                                >
                                    <Icon size={18} />
                                    {link.name}
                                </Link>
                            )
                        })}
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    {/* Mobile Order Link (Icon Only) */}
                    <Link href="/admin/orders" className="md:hidden text-gray-600">
                        <ClipboardList size={24} />
                    </Link>

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
    );
}
