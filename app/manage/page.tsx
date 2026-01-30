"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAdminRestaurants, updateRestaurantPlan } from "@/lib/api";
import { Restaurant, PlanType, OrderingMode } from "@/lib/types";
import { Loader2, Save, Calendar, Shield, Settings2, ExternalLink, Smartphone } from "lucide-react";
import { account } from "@/lib/appwrite";
import Link from "next/link";

export default function SuperAdminPage() {
    const router = useRouter();
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [loading, setLoading] = useState(true);
    const [authLoading, setAuthLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Edit Form State
    const [formData, setFormData] = useState({
        plan: "menu" as PlanType,
        orderingMode: "menu" as OrderingMode,
        planExpiry: ""
    });

    // Auth Check
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const user = await account.get();
                if (!user.labels.includes("admin")) {
                    alert("Access Denied: Admin only area.");
                    router.push("/");
                    return;
                }
                setAuthLoading(false);
            } catch (error) {
                console.error("Auth check failed", error);
                router.push("/");
            }
        };
        checkAuth();
    }, [router]);

    const loadData = async () => {
        setLoading(true);
        const data = await getAdminRestaurants();
        setRestaurants(data);
        setLoading(false);
    };

    useEffect(() => {
        if (!authLoading) {
            const fetchInitialData = async () => {
                const data = await getAdminRestaurants();
                setRestaurants(data);
                setLoading(false);
            };
            fetchInitialData();
        }
    }, [authLoading]);

    const handleEditClick = (r: Restaurant) => {
        setEditingId(r.id);
        setFormData({
            plan: r.plan,
            orderingMode: r.orderingMode,
            planExpiry: r.planExpiry ? new Date(r.planExpiry).toISOString().split('T')[0] : "" // YYYY-MM-DD
        });
    };

    const handleSave = async (id: string) => {
        if (!confirm("Are you sure you want to update this restaurant's settings?")) return;

        const expiryDate = formData.planExpiry ? new Date(formData.planExpiry).toISOString() : new Date().toISOString();

        const success = await updateRestaurantPlan(id, {
            plan: formData.plan,
            orderingMode: formData.orderingMode,
            planExpiry: expiryDate
        });

        if (success) {
            alert("Updated successfully!");
            setEditingId(null);
            loadData();
        } else {
            alert("Failed to update.");
        }
    };

    if (authLoading || loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={32} /></div>;

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-8 gap-4">
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Shield className="text-blue-600" />
                        Super Admin: Plan Management
                    </h1>
                    <button onClick={() => loadData()} className="text-sm text-blue-600 hover:underline self-start md:self-auto">Refresh List</button>
                </div>

                {/* --- DESKTOP TABLE VIEW (Hidden on Mobile) --- */}
                <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold">
                            <tr>
                                <th className="p-4">Restaurant</th>
                                <th className="p-4">Plan / Mode</th>
                                <th className="p-4">Expiry</th>
                                <th className="p-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {restaurants.map(r => (
                                <tr key={r.id} className="hover:bg-gray-50/50">
                                    <td className="p-4">
                                        <div className="font-medium text-gray-900">{r.name}</div>
                                        <div className="text-xs text-gray-500 font-mono">{r.slug}</div>
                                    </td>

                                    {editingId === r.id ? (
                                        // --- EDIT MODE (Desktop) ---
                                        <>
                                            <td className="p-4 space-y-2">
                                                <select
                                                    className="w-full border rounded p-1 text-sm bg-gray-50"
                                                    value={formData.plan}
                                                    onChange={e => setFormData({ ...formData, plan: e.target.value as PlanType })}
                                                >
                                                    <option value="menu">Plan: Menu Only</option>
                                                    <option value="whatsapp">Plan: WhatsApp</option>
                                                    <option value="admin_orders">Plan: Admin Orders</option>
                                                </select>
                                                <select
                                                    className="w-full border rounded p-1 text-sm bg-gray-50"
                                                    value={formData.orderingMode}
                                                    onChange={e => setFormData({ ...formData, orderingMode: e.target.value as OrderingMode })}
                                                >
                                                    <option value="menu">Mode: Menu</option>
                                                    <option value="whatsapp">Mode: WhatsApp</option>
                                                    <option value="admin_orders">Mode: Admin Orders</option>
                                                </select>
                                            </td>
                                            <td className="p-4">
                                                <input
                                                    type="date"
                                                    className="w-full border rounded p-1 text-sm"
                                                    value={formData.planExpiry}
                                                    onChange={e => setFormData({ ...formData, planExpiry: e.target.value })}
                                                />
                                            </td>
                                            <td className="p-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button onClick={() => handleSave(r.id)} className="p-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200" title="Save">
                                                        <Save size={16} />
                                                    </button>
                                                    <button onClick={() => setEditingId(null)} className="text-xs text-gray-500 hover:text-gray-700">
                                                        Cancel
                                                    </button>
                                                </div>
                                            </td>
                                        </>
                                    ) : (
                                        // --- VIEW MODE (Desktop) ---
                                        <>
                                            <td className="p-4">
                                                <div className="flex flex-col gap-1 items-start">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide
                                                        ${r.plan === 'admin_orders' ? 'bg-purple-100 text-purple-800' :
                                                            r.plan === 'whatsapp' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                        {r.plan.replace('_', ' ')}
                                                    </span>
                                                    <span className="text-xs text-gray-500 capitalize flex items-center gap-1">
                                                        <Smartphone size={12} />
                                                        {r.orderingMode?.replace('_', ' ')}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                                    <Calendar size={14} />
                                                    {r.planExpiry ? new Date(r.planExpiry).toLocaleDateString() : "No Expiry"}
                                                </div>
                                            </td>
                                            <td className="p-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button onClick={() => handleEditClick(r)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Edit">
                                                        <Settings2 size={16} />
                                                    </button>
                                                    <Link href={`/h/${r.slug}`} target="_blank" className="p-1.5 text-gray-600 hover:bg-gray-100 rounded" title="Visit Page">
                                                        <ExternalLink size={16} />
                                                    </Link>
                                                </div>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* --- MOBILE CARD VIEW (Visible on Mobile) --- */}
                <div className="md:hidden grid gap-4">
                    {restaurants.map(r => (
                        <div key={r.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="font-bold text-gray-900">{r.name}</div>
                                    <div className="text-xs text-gray-500 font-mono">{r.slug}</div>
                                </div>
                                <div className="flex gap-2">
                                    {editingId !== r.id && (
                                        <>
                                            <button onClick={() => handleEditClick(r)} className="p-2 text-blue-600 bg-blue-50 rounded-lg">
                                                <Settings2 size={18} />
                                            </button>
                                            <Link href={`/h/${r.slug}`} target="_blank" className="p-2 text-gray-600 bg-gray-50 rounded-lg">
                                                <ExternalLink size={18} />
                                            </Link>
                                        </>
                                    )}
                                </div>
                            </div>

                            {editingId === r.id ? (
                                // --- EDIT MODE (Mobile) ---
                                <div className="space-y-3 pt-2 border-t border-gray-100 animate-in fade-in slide-in-from-top-2">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-1">
                                            <label className="text-[10px] uppercase font-bold text-gray-400">Plan</label>
                                            <select
                                                className="w-full border rounded-lg p-2 text-sm bg-gray-50"
                                                value={formData.plan}
                                                onChange={e => setFormData({ ...formData, plan: e.target.value as PlanType })}
                                            >
                                                <option value="menu">Menu Only</option>
                                                <option value="whatsapp">WhatsApp</option>
                                                <option value="admin_orders">Admin Orders</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] uppercase font-bold text-gray-400">Mode</label>
                                            <select
                                                className="w-full border rounded-lg p-2 text-sm bg-gray-50"
                                                value={formData.orderingMode}
                                                onChange={e => setFormData({ ...formData, orderingMode: e.target.value as OrderingMode })}
                                            >
                                                <option value="menu">Menu</option>
                                                <option value="whatsapp">WhatsApp</option>
                                                <option value="admin_orders">Admin Orders</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] uppercase font-bold text-gray-400">Plan Expiry</label>
                                        <input
                                            type="date"
                                            className="w-full border rounded-lg p-2 text-sm"
                                            value={formData.planExpiry}
                                            onChange={e => setFormData({ ...formData, planExpiry: e.target.value })}
                                        />
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        <button onClick={() => handleSave(r.id)} className="flex-1 bg-green-600 text-white rounded-lg py-2 text-sm font-medium">
                                            Save Changes
                                        </button>
                                        <button onClick={() => setEditingId(null)} className="flex-1 bg-gray-100 text-gray-700 rounded-lg py-2 text-sm font-medium">
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                // --- VIEW MODE (Mobile) ---
                                <div className="grid grid-cols-2 gap-4 text-xs">
                                    <div>
                                        <div className="text-gray-400 mb-1">Current Plan</div>
                                        <span className={`inline-flex px-2 py-1 rounded-md font-medium capitalize
                                            ${r.plan === 'admin_orders' ? 'bg-purple-100 text-purple-800' :
                                                r.plan === 'whatsapp' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {r.plan.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <div>
                                        <div className="text-gray-400 mb-1">Ordering Mode</div>
                                        <span className="font-medium text-gray-700 capitalize">{r.orderingMode?.replace('_', ' ')}</span>
                                    </div>
                                    <div className="col-span-2 flex items-center gap-2 text-gray-500 bg-gray-50 p-2 rounded-lg">
                                        <Calendar size={14} />
                                        <span>Expires: {r.planExpiry ? new Date(r.planExpiry).toLocaleDateString() : "No Expiry"}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {restaurants.length === 0 && !loading && (
                    <div className="text-center p-8 text-gray-500">No restaurants found.</div>
                )}
            </div>
        </div>
    );
}
