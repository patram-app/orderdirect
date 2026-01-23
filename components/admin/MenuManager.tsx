"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { MenuItemDocument } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Trash2, Loader2, Utensils, ChevronDown, ChevronUp } from "lucide-react";
import { databases, DATABASE_ID, MENU_ITEMS_COLLECTION_ID } from "@/lib/appwrite";
import { ID, Query, Permission, Role } from "appwrite";
import MenuItemForm, { MenuItemFormValues } from "./MenuItemForm";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface MenuManagerProps {
    restaurantSlug: string;
}

export default function MenuManager({ restaurantSlug }: MenuManagerProps) {
    const { user } = useAuth();
    const [items, setItems] = useState<MenuItemDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<MenuItemFormValues | null>(null);
    const [searchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

    // Fetch Items
    const fetchItems = useCallback(async () => {
        setLoading(true);
        try {
            const res = await databases.listDocuments(
                DATABASE_ID,
                MENU_ITEMS_COLLECTION_ID,
                [Query.equal("restaurantSlug", restaurantSlug), Query.limit(250), Query.orderAsc("$createdAt")]
            );
            setItems(res.documents as unknown as MenuItemDocument[]);
        } catch (error) {
            console.error("Error fetching menu:", error);
            toast.error("Failed to load menu items");
        } finally {
            setLoading(false);
        }
    }, [restaurantSlug]);

    useEffect(() => {
        if (restaurantSlug) fetchItems();
    }, [restaurantSlug, fetchItems]);

    // Group items for UI
    const groupedItems = useMemo(() => {
        return items.reduce<{ [key: string]: MenuItemDocument[] }>((acc, item) => {
            const key = `${item.category}-${item.itemName}`;
            if (!acc[key]) acc[key] = [];
            acc[key].push(item);
            return acc;
        }, {});
    }, [items]);

    // Filter and Group by Category for display
    const filteredGroupedItems = useMemo(() => {
        const query = searchQuery.toLowerCase();
        const groups = Object.values(groupedItems);

        const filtered = groups.filter(group => {
            const item = group[0];
            return (
                item.itemName.toLowerCase().includes(query) ||
                item.description?.toLowerCase().includes(query) ||
                item.category.toLowerCase().includes(query)
            );
        });

        // Re-group by Category
        const byCategory: { [category: string]: MenuItemDocument[][] } = {};
        filtered.forEach(group => {
            const cat = group[0].category;
            if (!byCategory[cat]) byCategory[cat] = [];
            byCategory[cat].push(group);
        });

        return byCategory;
    }, [groupedItems, searchQuery]);

    const categories = useMemo(() => Object.keys(filteredGroupedItems), [filteredGroupedItems]);

    useEffect(() => {
        // Set first category as active initially if none selected
        if (!activeCategory && categories.length > 0) {
            setActiveCategory(categories[0]);
        }
    }, [activeCategory, categories]);

    // const scrollToCategory = (cat: string) => {
    //     setActiveCategory(cat);
    //     const element = document.getElementById(`category-${cat}`);
    //     if (element) {
    //         element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    //         // Adjust for sticky header offset
    //         window.scrollBy(0, -140);
    //     }
    // };

    const handleSave = async (data: MenuItemFormValues) => {
        try {
            // 0. Client-Side Validation (Fail fast)
            if (data.itemName.length > 100) {
                toast.error("Item name is too long (max 100 chars)");
                return;
            }
            if (data.category.length > 40) {
                toast.error("Category is too long (max 40 chars)");
                return;
            }
            if (data.description.length > 250) {
                toast.error("Description is too long (max 250 chars)");
                return;
            }
            if (!data.hasVariants) {
                // No extra validation needed for single item price as it's number
            } else {
                for (const v of data.variants) {
                    if (v.label.length > 20) {
                        toast.error(`Variant "${v.label}" is too long (max 20 chars)`);
                        return;
                    }
                }
            }

            // 1. Identify Existing Documents
            // Map existing docs by variant key for O(1) lookup
            const existingDocsMap = new Map<string, MenuItemDocument>();
            if (editingItem) {
                const currentDocs = items.filter(
                    i => i.itemName === editingItem.itemName && i.category === editingItem.category
                );
                currentDocs.forEach(doc => {
                    // Use a unique key for "no variant" (null) to distinguish from literal "null" string
                    const key = doc.variant === null ? "___NULL_VARIANT___" : doc.variant;
                    existingDocsMap.set(key, doc);
                });
            }

            // 2. Prepare Target Variants
            const targetVariants = !data.hasVariants
                ? [{ variant: null, price: data.price }]
                : data.variants.map(v => ({ variant: v.label, price: v.price }));

            // Common data (mutable fields only)
            const commonData = {
                restaurantSlug: data.restaurantSlug,
                category: data.category,
                itemName: data.itemName,
                description: data.description,
                isVeg: data.isVeg,
                isSoldOut: data.isSoldOut,
            };

            const updates: Promise<unknown>[] = [];
            const creates: Promise<unknown>[] = [];

            // Track keys that we matched so we know what to delete LATER
            const matchedKeys = new Set<string>();

            // 3. Prepare Update & Create Promises
            for (const target of targetVariants) {
                const key = target.variant === null ? "___NULL_VARIANT___" : target.variant;
                const existing = existingDocsMap.get(key);

                if (existing) {
                    // MATCH FOUND -> UPDATE
                    matchedKeys.add(key);

                    const updatePayload = {
                        ...commonData,
                        variant: target.variant,
                        price: target.price
                        // ownerId is NOT sent on update, system fields excluded
                    };

                    updates.push(databases.updateDocument(
                        DATABASE_ID,
                        MENU_ITEMS_COLLECTION_ID,
                        existing.$id,
                        updatePayload
                    ));
                } else {
                    // NO MATCH -> CREATE
                    const createPayload = {
                        ...commonData,
                        ownerId: user!.$id, // Required for create
                        variant: target.variant,
                        price: target.price
                    };

                    const permissions = [
                        Permission.read(Role.any()),
                        Permission.update(Role.user(user!.$id)),
                        Permission.delete(Role.user(user!.$id))
                    ];

                    creates.push(databases.createDocument(
                        DATABASE_ID,
                        MENU_ITEMS_COLLECTION_ID,
                        ID.unique(),
                        createPayload,
                        permissions
                    ));
                }
            }

            // 4. CRITICAL: Execute Updates and Creates FIRST
            // If these fail, we throw and NEVER run the deletes.
            try {
                await Promise.all([...updates, ...creates]);
            } catch (error) {
                console.error("Update/Create failed:", error);
                toast.error("Failed to save changes. No items were deleted.");
                throw error; // Stop execution
            }

            // 5. Calculate Deletes (Only run if we reached here)
            // Any key in existingDocsMap that is NOT in matchedKeys is a delete
            const deletes: Promise<unknown>[] = [];
            existingDocsMap.forEach((doc, key) => {
                if (!matchedKeys.has(key)) {
                    deletes.push(databases.deleteDocument(
                        DATABASE_ID,
                        MENU_ITEMS_COLLECTION_ID,
                        doc.$id
                    ));
                }
            });

            // 6. Execute Deletes
            if (deletes.length > 0) {
                await Promise.all(deletes);
            }

            setIsDialogOpen(false);
            setEditingItem(null);
            fetchItems();
            toast.success("Menu item saved successfully");
        } catch (error) {
            console.error(error);
            // Verify if error was already tossed by inner try-catch
            if (error instanceof Error && error.message !== "Failed to save changes. No items were deleted.") {
                toast.error("Failed to save menu item");
            }
            // Logic above is slightly redundant but safe. The inner catch re-throws.
        }
    };

    const handleDelete = async (itemName: string, category: string) => {
        if (!confirm(`Are you sure you want to delete "${itemName}"? This cannot be undone.`)) return;

        const itemsToDelete = items.filter(i => i.itemName === itemName && i.category === category);
        try {
            await Promise.all(itemsToDelete.map(i => databases.deleteDocument(DATABASE_ID, MENU_ITEMS_COLLECTION_ID, i.$id)));
            fetchItems();
            toast.success("Item deleted");
        } catch {
            toast.error("Failed to delete item");
        }
    };

    const openEdit = (group?: MenuItemDocument[], prefilledCategory?: string) => {
        if (group) {
            const first = group[0];
            const isVariant = group.length > 1 || (group.length === 1 && group[0].variant !== null);

            const variants = isVariant
                ? group.map(g => ({ label: g.variant || "", price: g.price }))
                : [{ label: "Half", price: 0 }, { label: "Full", price: 0 }];

            setEditingItem({
                restaurantSlug,
                category: first.category,
                itemName: first.itemName,
                description: first.description || "",
                isVeg: first.isVeg,
                isSoldOut: first.isSoldOut,
                hasVariants: isVariant,
                price: !isVariant ? first.price : 0,
                variants: variants
            });
        } else {
            setEditingItem({
                restaurantSlug,
                category: prefilledCategory || (activeCategory || ""),
                itemName: "",
                description: "",
                isVeg: true,
                hasVariants: false,
                price: 0,
                variants: [{ label: "Half", price: 0 }, { label: "Full", price: 0 }],
                isSoldOut: false,
            });
        }
        setIsDialogOpen(true);
    };

    return (
        <div className="min-h-screen bg-gray-50/30 -m-6 p-6">
            {/* Header Section */}
            <div className=" z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 -mx-6 px-6 pb-4 pt-2 mb-6 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl text-gray-900 tracking-tight font-bold">
                            Menu Management
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            {items.length} items in {categories.length} categories
                        </p>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <Button
                            onClick={() => openEdit(undefined)}
                            className="flex-1 sm:flex-none shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
                        >
                            <Plus className="mr-2 h-4 w-4" /> Add New Item
                        </Button>


                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            {/* <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search items, descriptions, categories..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 bg-gray-50 border-gray-200 focus:bg-white transition-all"
                    />
                </div> */}

            {/* Category Navigation */}
            {/* {categories.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none mask-fade-right">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => scrollToCategory(cat)}
                                className={cn(
                                    "px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all border",
                                    activeCategory === cat
                                        ? "bg-gray-900 text-white border-gray-900 shadow-sm"
                                        : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                                )}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                )} */}

            {/* Content Area */}
            {
                loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        <p className="mt-4 text-muted-foreground animate-pulse">Loading menu...</p>
                    </div>
                ) : categories.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                        <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Utensils className="h-8 w-8 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">No items found</h3>
                        <p className="text-muted-foreground max-w-sm mx-auto mt-2 mb-6">
                            {searchQuery ? "No items match your search." : "Get started by adding your first menu item."}
                        </p>
                        <Button onClick={() => openEdit(undefined)} variant="outline">
                            <Plus className="mr-2 h-4 w-4" /> Add Item
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-8 pb-20">
                        {categories.map(cat => {
                            const isExpanded = expandedCategories[cat];
                            return (
                                <div key={cat} id={`category-${cat}`} className="scroll-mt-40 space-y-4">
                                    <div
                                        className="flex items-center justify-between cursor-pointer select-none hover:bg-gray-50/50 p-2 -mx-2 rounded-lg transition-colors"
                                        onClick={() => setExpandedCategories(prev => ({ ...prev, [cat]: !prev[cat] }))}
                                    >
                                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                            {cat}
                                            <span className="text-xs font-normal text-muted-foreground bg-gray-100 px-2 py-0.5 rounded-full">
                                                {filteredGroupedItems[cat].length}
                                            </span>
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openEdit(undefined, cat);
                                                }}
                                                className="text-xs text-primary hover:bg-primary/5 h-8"
                                            >
                                                <Plus className="h-3 w-3 mr-1" /> Add to {cat}
                                            </Button>
                                            <div className="h-8 w-8 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
                                                {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                            </div>
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 animate-in slide-in-from-top-2 fade-in duration-200">
                                            {filteredGroupedItems[cat].map(group => {
                                                const item = group[0];
                                                const hasVariants = group.length > 1 || item.variant !== null;

                                                return (
                                                    <div key={item.$id} className="group bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all hover:border-gray-200 relative overflow-hidden">
                                                        {/* Sold Out Overlay/Badge */}
                                                        {item.isSoldOut && (
                                                            <div className="absolute top-0 right-0 bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-1 rounded-bl-lg z-10 uppercase tracking-wide">
                                                                Sold Out
                                                            </div>
                                                        )}

                                                        <div className="flex justify-between items-start mb-3">
                                                            <div className="flex gap-3">
                                                                <div className={cn(
                                                                    "mt-1 w-4 h-4 rounded flex items-center justify-center border shrink-0",
                                                                    item.isVeg ? "border-green-600" : "border-red-600"
                                                                )}>
                                                                    <div className={cn(
                                                                        "w-2 h-2 rounded-full",
                                                                        item.isVeg ? "bg-green-600" : "bg-red-600"
                                                                    )} />
                                                                </div>
                                                                <div>
                                                                    <h4 className={cn("font-bold text-gray-900 leading-tight", item.isSoldOut && "text-gray-400")}>
                                                                        {item.itemName}
                                                                    </h4>
                                                                    {item.description && (
                                                                        <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                                                                            {item.description}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="bg-gray-50/50 rounded-lg p-3 space-y-2 mb-3">
                                                            {hasVariants ? (
                                                                <div className="space-y-1.5">
                                                                    {[...group]
                                                                        .sort((a, b) =>
                                                                            a.price !== b.price
                                                                                ? a.price - b.price
                                                                                : (a.variant ?? "").localeCompare(b.variant ?? "")
                                                                        )

                                                                        .map(v => (
                                                                            <div
                                                                                key={v.$id}
                                                                                className="flex justify-between items-center text-sm"
                                                                            >
                                                                                <span className="text-gray-600 font-medium text-xs uppercase tracking-wide">
                                                                                    {v.variant}
                                                                                </span>
                                                                                <span className="font-semibold text-gray-900">
                                                                                    ₹{v.price}
                                                                                </span>
                                                                            </div>
                                                                        ))}
                                                                </div>
                                                            ) : (
                                                                <div className="flex justify-between items-center">
                                                                    <span className="text-xs text-gray-500 font-medium">Price</span>
                                                                    <span className="font-bold text-lg text-gray-900">
                                                                        ₹{item.price}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>


                                                        <div className="flex gap-2 pt-2 border-t border-gray-50">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="flex-1 h-8 text-xs font-medium hover:bg-gray-50 hover:text-gray-900"
                                                                onClick={() => openEdit(group)}
                                                            >
                                                                <Edit2 className="w-3 h-3 mr-1.5" /> Edit
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 border-red-100 hover:border-red-200"
                                                                onClick={() => handleDelete(item.itemName, item.category)}
                                                            >
                                                                <Trash2 className="w-3 h-3" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )
            }

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto scrollbar-none">
                    <DialogHeader>
                        <DialogTitle>{editingItem ? 'Edit Item' : 'Add New Item'}</DialogTitle>
                        <DialogDescription>
                            {editingItem ? 'Make changes to your menu item here.' : 'Add a new delicious item to your menu.'}
                        </DialogDescription>
                    </DialogHeader>
                    <MenuItemForm
                        restaurantSlug={restaurantSlug}
                        initialData={editingItem}
                        existingCategories={categories}
                        onSave={handleSave}
                        onCancel={() => setIsDialogOpen(false)}
                    />
                </DialogContent>
            </Dialog>
        </div >
    );
}
