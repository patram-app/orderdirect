"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Loader2, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
export interface MenuItemFormValues {
    restaurantSlug: string;
    category: string;
    itemName: string;
    description: string;
    isVeg: boolean;
    hasVariants: boolean;
    price: number;
    variants: Array<{ label: string; price: number }>;
    isSoldOut: boolean;
}
interface MenuItemFormProps {
    initialData?: MenuItemFormValues | null;
    restaurantSlug: string;
    existingCategories: string[];
    onSave: (data: MenuItemFormValues) => Promise<void>;
    onCancel: () => void;
}
export default function MenuItemForm({ initialData, restaurantSlug, existingCategories, onSave, onCancel }: MenuItemFormProps) {
    const [loading, setLoading] = useState(false);
    const [categoryMode, setCategoryMode] = useState<"existing" | "new">(
        initialData?.category && existingCategories.includes(initialData?.category) ? "existing" : "new"
    );
    const [formData, setFormData] = useState<MenuItemFormValues>(
        initialData || {
            restaurantSlug,
            category: "",
            itemName: "",
            description: "",
            isVeg: true,
            hasVariants: false,
            price: 0,
            variants: [{ label: "Half", price: 0 }, { label: "Full", price: 0 }],
            isSoldOut: false,
        }
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.itemName.trim()) {
            toast.error("Item Name is required");
            return;
        }
        if (categoryMode === "new" && !formData.category.trim()) {
            toast.error("Please enter a category name");
            return;
        }
        if (categoryMode === "existing" && !formData.category) {
            toast.error("Please select a category");
            return;
        }
        setLoading(true);
        try {
            await onSave(formData);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };
    const updateVariant = (index: number, field: 'label' | 'price', value: string | number) => {
        const newVariants = [...formData.variants];
        newVariants[index] = { ...newVariants[index], [field]: value };
        setFormData({ ...formData, variants: newVariants });
    };
    const addVariant = () => {
        if (formData.variants.length < 3) {
            setFormData({ ...formData, variants: [...formData.variants, { label: "", price: 0 }] });
        }
    };
    const removeVariant = (index: number) => {
        const newVariants = formData.variants.filter((_, i) => i !== index);
        setFormData({ ...formData, variants: newVariants });
    };
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <Label className="text-sm font-medium">Category</Label>
                {existingCategories.length > 0 && (
                    <RadioGroup
                        value={categoryMode}
                        onValueChange={(v) => {
                            setCategoryMode(v as "existing" | "new");
                            setFormData(prev => ({ ...prev, category: "" }));
                        }}
                        className="flex gap-4"
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="existing" id="cat-existing" />
                            <Label htmlFor="cat-existing" className="cursor-pointer text-sm">Existing Categories</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="new" id="cat-new" />
                            <Label htmlFor="cat-new" className="cursor-pointer text-sm">New Category</Label>
                        </div>
                    </RadioGroup>
                )}
                {categoryMode === "existing" && existingCategories.length > 0 ? (
                    <Select
                        value={formData.category}
                        onValueChange={(val) => setFormData({ ...formData, category: val })}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select category..." />
                        </SelectTrigger>
                        <SelectContent>
                            {existingCategories.map(cat => (
                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                ) : (
                    <div>
                        <Input
                            autoFocus={categoryMode === "new"}
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            placeholder="New category name (e.g. Starters)"
                        />
                        <p className="text-xs text-muted-foreground mt-1 flex items-center">
                            <Info className="w-3 h-3 mr-1" />
                            Use a descriptive name.
                        </p>
                    </div>
                )}
            </div>
            <div className="space-y-2">
                <Label className="text-sm">Item Name</Label>
                <Input
                    required
                    value={formData.itemName}
                    onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                    placeholder="e.g. Butter Chicken"
                />
            </div>
            <div className="space-y-2">
                <Label className="text-sm">Description</Label>
                <Textarea
                    className="resize-none h-20"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the dish..."
                />
            </div>
            <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Dietary Type</Label>
                <div className="grid grid-cols-2 gap-2">
                    <label
                        htmlFor="type-veg"
                        className={cn(
                            "flex items-center gap-2 rounded-md border p-2 cursor-pointer transition",
                            formData.isVeg ? "border-green-500 bg-green-50" : "border-muted hover:bg-muted/50"
                        )}
                    >
                        <Checkbox
                            id="type-veg"
                            checked={formData.isVeg}
                            onCheckedChange={(checked) => { if (checked) setFormData({ ...formData, isVeg: true }); }}
                            className="data-[state=checked]:bg-green-500"
                        />
                        <span className="text-sm">Veg</span>
                    </label>
                    <label
                        htmlFor="type-nonveg"
                        className={cn(
                            "flex items-center gap-2 rounded-md border p-2 cursor-pointer transition",
                            !formData.isVeg ? "border-red-500 bg-red-50" : "border-muted hover:bg-muted/50"
                        )}
                    >
                        <Checkbox
                            id="type-nonveg"
                            checked={!formData.isVeg}
                            onCheckedChange={(checked) => { if (checked) setFormData({ ...formData, isVeg: false }); }}
                            className="data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500 border-red-500 "
                        />
                        <span className="text-sm">Non-Veg</span>
                    </label>
                </div>
            </div>
            <div className="flex items-center justify-between rounded-md border p-2">
                <div className="space-y-0">
                    <Label htmlFor="sold-out" className="cursor-pointer text-sm font-medium">Sold Out</Label>
                    <p className="text-xs text-muted-foreground">Hide from ordering</p>
                </div>
                <Switch
                    id="sold-out"
                    checked={formData.isSoldOut}
                    onCheckedChange={(checked) => setFormData({ ...formData, isSoldOut: checked })}
                />
            </div>
            <div className="space-y-3 pt-3 border-t">
                <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Pricing & Variants</Label>
                    {!formData.hasVariants && (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setFormData({ ...formData, hasVariants: true, variants: [{ label: "Regular", price: formData.price }] })}
                        >
                            <Plus className="h-3 w-3 mr-1" /> Variants
                        </Button>
                    )}
                </div>
                {!formData.hasVariants ? (
                    <div className="flex items-center gap-1 max-w-[150px]">
                        <span className="text-muted-foreground text-sm">₹</span>
                        <Input
                            type="number"
                            required
                            min="0"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                            placeholder="0"
                        />
                    </div>
                ) : (
                    <div className="space-y-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-center text-xs">
                            <Label className="font-medium text-muted-foreground">Variants</Label>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    if (confirm("Revert to single price?")) {
                                        setFormData({ ...formData, hasVariants: false, price: formData.variants[0]?.price || 0, variants: [{ label: "Half", price: 0 }, { label: "Full", price: 0 }] });
                                    }
                                }}
                                className="text-red-500 hover:text-red-600 text-xs p-0"
                            >
                                Revert
                            </Button>
                        </div>
                        {formData.variants.map((variant, idx) => (
                            <div key={idx} className="flex gap-2 items-center">
                                <Input
                                    placeholder="Label (e.g. Half)"
                                    value={variant.label}
                                    onChange={(e) => updateVariant(idx, 'label', e.target.value)}
                                    required={formData.hasVariants}
                                    className="flex-1 text-sm"
                                />
                                <div className="relative w-24">
                                    <span className="absolute left-2 top-2 text-muted-foreground text-xs">₹</span>
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        min="0"
                                        value={variant.price || ''}
                                        onChange={(e) => updateVariant(idx, 'price', Number(e.target.value))}
                                        required={formData.hasVariants}
                                        className="pl-5 text-sm"
                                    />
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="text-muted-foreground hover:text-red-500"
                                    onClick={() => removeVariant(idx)}
                                    disabled={formData.variants.length <= 1}
                                >
                                    <Trash2 size={14} />
                                </Button>
                            </div>
                        ))}
                        {formData.variants.length < 3 && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="w-full text-xs text-blue-600 hover:bg-blue-50 border border-dashed border-blue-200"
                                onClick={addVariant}
                            >
                                <Plus className="h-3 w-3 mr-1" /> Add Option
                            </Button>
                        )}
                    </div>
                )}
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4 border-t sticky  -bottom-0 bg-white z-10 py-2">
                <Button type="button" variant="ghost" onClick={onCancel} disabled={loading} className="w-full bg-gray-100 sm:w-auto text-sm">
                    Cancel
                </Button>
                <Button type="submit" disabled={loading} className="w-full sm:w-auto text-sm">
                    {loading && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
                    Save
                </Button>
            </div>
        </form>
    );
}