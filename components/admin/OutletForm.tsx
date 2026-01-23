"use client";

import { useState, useEffect } from "react";
import { RestaurantDocument } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Save,
  Loader2,
  Info,
  Check,
  X,
  Wand2,
  Lock,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  Plus,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn, normalizeArea, toTitleCase, copyToClipboard } from "@/lib/utils";
import {
  databases,
  DATABASE_ID,
  RESTAURANTS_COLLECTION_ID,
} from "@/lib/appwrite";
import { ID, Query, Permission, Role } from "appwrite";
import { toast } from "sonner";

interface OutletFormProps {
  initialData?: RestaurantDocument | null;
  ownerId: string;
  onSave: (data: RestaurantDocument) => void;
  hasMenuItems?: boolean;
}

const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

// Default data structure
const defaultData = {
  name: "",
  slug: "",
  description: "",
  address: "",
  googleMapsLink: "",
  whatsappNumber: "",
  supportsDineIn: true,
  supportsTakeaway: true,
  supportsDelivery: true,
  onlineOrderingEnabled: true,
  manuallyClosed: false,
  deliveryAreas: [],
  upiId: "",
  monOpen: "10:00",
  monClose: "23:00",
  tueOpen: "10:00",
  tueClose: "23:00",
  wedOpen: "10:00",
  wedClose: "23:00",
  thuOpen: "10:00",
  thuClose: "23:00",
  friOpen: "10:00",
  friClose: "23:00",
  satOpen: "10:00",
  satClose: "23:00",
  sunOpen: "10:00",
  sunClose: "23:00",
};

export default function OutletForm({
  initialData,
  ownerId,
  onSave,
  hasMenuItems = false,
}: OutletFormProps) {
  const [loading, setLoading] = useState(false);
  const [showAllHours, setShowAllHours] = useState(false);
  const [newAreaInput, setNewAreaInput] = useState("");



  const [formData, setFormData] = useState<Partial<RestaurantDocument>>(
    initialData || defaultData,
  );

  // Deep compare to check for changes - simple stringify for now
  // We compare against initialData OR defaultData if initialData is null
  const [isDirty, setIsDirty] = useState(false);

  const [origin, setOrigin] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  useEffect(() => {
    const compareTo = initialData || defaultData;
    const currentString = JSON.stringify(formData);
    const initialString = JSON.stringify(compareTo);
    setIsDirty(currentString !== initialString);
  }, [formData, initialData]);

  const handleChange = (field: keyof RestaurantDocument, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const generateSlug = () => {
    if (!formData.name) return;
    const slug = formData.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "") // remove special chars
      .trim()
      .split(/\s+/) // split by spaces
      .slice(0, 4) // first 4 words
      .join("-");
    handleChange("slug", slug);
  };

  const handleCopyLink = async () => {
    const fullLink = `${origin}/h/${formData.slug}`;
    const success = await copyToClipboard(fullLink);
    if (success) {
      toast.success("Link copied to clipboard!");
    } else {
      toast.error("Failed to copy link");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Validation: Slug regex
      if (!/^[a-z0-9-]+$/.test(formData.slug || "")) {
        toast.error(
          "Slug must be URL-safe (lowercase, numbers, hyphens only).",
        );
        setLoading(false);
        return;
      }

      let result;
      if (initialData?.$id) {
        // Update
        const dataToSave = { ...formData };
        delete dataToSave.$id;
        delete dataToSave.$createdAt;
        delete dataToSave.$updatedAt;
        delete dataToSave.$permissions;
        delete dataToSave.$databaseId;
        delete dataToSave.$collectionId;
        result = await databases.updateDocument(
          DATABASE_ID,
          RESTAURANTS_COLLECTION_ID,
          initialData.$id,
          dataToSave,
        );
      } else {
        // Create
        // Check if slug exists
        const existing = await databases.listDocuments(
          DATABASE_ID,
          RESTAURANTS_COLLECTION_ID,
          [Query.equal("slug", formData.slug as string)],
        );

        if (existing.total > 0) {
          toast.error("Slug already exists. Please choose a different one.");
          setLoading(false);
          return;
        }

        result = await databases.createDocument(
          DATABASE_ID,
          RESTAURANTS_COLLECTION_ID,
          ID.unique(),
          { ...formData, ownerId } as RestaurantDocument,
          [
            Permission.read(Role.any()),
            Permission.update(Role.user(ownerId)),
            Permission.delete(Role.user(ownerId)),
          ],
        );
      }
      onSave(result as unknown as RestaurantDocument);
      toast.success("Outlet details saved successfully!");
    } catch (error: unknown) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast.error("Failed to save outlet details: " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
    >
      <div className="border-b pb-4">
        <h3 className="text-lg font-bold text-gray-900">Outlet Details</h3>
        <p className="text-sm text-gray-500">
          Basic information about your restaurant.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <div className="space-y-2">
          <div className="flex justify-between">
            <label className="text-sm font-medium text-gray-700">
              Restaurant Name <span className="text-red-500">*</span>
            </label>
            <span className="text-xs text-gray-400">
              {(formData.name || "").length} / 35
            </span>
          </div>
          <div className="relative">
            <input
              required
              disabled={hasMenuItems}
              maxLength={35}
              className={cn(
                "w-full p-2 border rounded-md",
                hasMenuItems && "bg-gray-100 text-gray-500 cursor-not-allowed",
              )}
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="My Restaurant"
              title={
                hasMenuItems
                  ? "Cannot be changed after menu items are added."
                  : ""
              }
            />
            {hasMenuItems && (
              <Lock className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
            )}
          </div>

          {/* Warning Message */}
          {!hasMenuItems && (
            <div className="flex items-start gap-1.5 mt-1.5 text-amber-700 bg-amber-50 p-2 rounded border border-amber-100/50">
              <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              <div className="text-[11px] leading-tight opacity-90">
                <span className="font-semibold block mb-0.5">
                  Please choose carefully.
                </span>
                Once you start adding menu items, you won&apos;t be able to
                change these details.
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 block">
            URL Slug <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              required
              disabled={hasMenuItems}
              maxLength={40}
              className={cn(
                "w-full p-2 border rounded-md pr-10",
                hasMenuItems && "bg-gray-100 text-gray-500 cursor-not-allowed",
              )}
              value={formData.slug}
              onChange={(e) =>
                handleChange("slug", e.target.value.toLowerCase())
              }
              placeholder="my-restaurant-1"
              title={
                hasMenuItems
                  ? "Cannot be changed after menu items are added."
                  : ""
              }
            />
            {hasMenuItems && (
              <Lock className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
            )}
          </div>
          {!hasMenuItems && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={generateSlug}
              className="text-xs h-auto p-0 text-primary hover:text-primary/80 hover:bg-transparent"
            >
              <Wand2 className="mr-1 h-3 w-3" /> Auto-generate from name
            </Button>
          )}

          {/* Full Link Display */}
          {formData.slug && origin && (
            <div className="mt-2 bg-gray-50 border border-gray-200 rounded-lg p-2.5">
              <p className="text-xs text-gray-500 mb-1">
                Your Restaurant Link:
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded truncate border border-blue-100">
                  {origin}/h/{formData.slug}
                </code>
              </div>
              <div className="flex gap-2 mt-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleCopyLink}
                  className="flex-1 h-7 text-xs"
                >
                  <Copy className="h-3 w-3 mr-1.5" /> Copy
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    window.open(`${origin}/h/${formData.slug}`, "_blank")
                  }
                  className="flex-1 h-7 text-xs"
                >
                  <ExternalLink className="h-3 w-3 mr-1.5" /> Open
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2 md:col-span-2">
          <div className="flex justify-between">
            <label className="text-sm font-medium text-gray-700">
              Description
            </label>
            <span className="text-xs text-gray-400">
              {(formData.description || "").length} / 50
            </span>
          </div>
          <input
            maxLength={50}
            className="w-full p-2 border rounded-md"
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="Short description..."
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <div className="flex justify-between">
            <label className="text-sm font-medium text-gray-700">
              Address <span className="text-red-500">*</span>
            </label>
            <span className="text-xs text-gray-400">
              {(formData.address || "").length} / 120
            </span>
          </div>
          <textarea
            required
            maxLength={120}
            className="w-full p-2 border rounded-md h-24 resize-none"
            value={formData.address}
            onChange={(e) => handleChange("address", e.target.value)}
            placeholder="Full physical address..."
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            WhatsApp Number <span className="text-red-500">*</span>
          </label>
          <div className="flex rounded-md border overflow-hidden">
            <div className="bg-gray-100 px-3 py-2 text-gray-500 border-r border-gray-200 select-none font-medium">
              +91
            </div>
            <input
              required
              type="tel"
              className="w-full p-2 focus:outline-none"
              value={(formData.whatsappNumber || "").replace("+91", "")}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, ""); // numbers only
                handleChange("whatsappNumber", "+91" + val);
              }}
              placeholder="9876543210"
            />
          </div>
          <p className="text-xs text-gray-400">
            Used by customers to place orders
          </p>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Google Maps Link
          </label>
          <input
            className="w-full p-2 border rounded-md"
            value={formData.googleMapsLink}
            onChange={(e) => handleChange("googleMapsLink", e.target.value)}
            placeholder="https://maps.app.goo.gl/..."
          />
        </div>
      </div>

      <div className="border-t pt-6 border-b pb-6 space-y-8">

        {/* SECTION 1: Services Offered (Physically) */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            Services Offered
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Which services do you physically support at your outlet?
          </p>
          <div className="flex flex-wrap gap-2">
            {([
              { key: "supportsDineIn", label: "Dine-In" },
              { key: "supportsTakeaway", label: "Takeaway" },
              { key: "supportsDelivery", label: "Delivery" },
            ] as const).map(({ key, label }) => {
              const isEnabled = formData[key];
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() =>
                    handleChange(key as keyof RestaurantDocument, !isEnabled)
                  }
                  className={cn(
                    "flex items-center gap-2 px-4 py-3 rounded-xl border-2 font-medium transition-all flex-1 justify-center min-w-[120px]",
                    isEnabled
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-gray-200 text-gray-400 hover:border-gray-300",
                  )}
                >
                  {isEnabled ? <Check size={16} /> : <X size={16} />}
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* SECTION 2: Online Ordering (WhatsApp) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Online Ordering
              </h3>
              <p className="text-sm text-gray-500">
                Enable this to accept orders via WhatsApp.
              </p>
            </div>

            <Switch
              checked={formData.onlineOrderingEnabled !== false}
              onCheckedChange={(checked) =>
                handleChange("onlineOrderingEnabled", checked)
              }
              className="data-[state=checked]:bg-green-600"
            />
          </div>

          <div className={cn(
            "rounded-xl border-2 p-4 transition-all",
            formData.onlineOrderingEnabled !== false
              ? "border-green-200 bg-green-50"
              : "border-amber-200 bg-amber-50"
          )}>
            <div className="flex items-start gap-3">
              {formData.onlineOrderingEnabled !== false ? (
                <>
                  <div className="bg-green-100 p-2 rounded-full shrink-0">
                    <Check className="text-green-700" size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-green-800">Accepting Online Orders</h4>
                    <p className="text-sm text-green-700/80 mt-1">
                      Customers can browse your menu and place orders via WhatsApp.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-amber-100 p-2 rounded-full shrink-0">
                    <Info className="text-amber-700" size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-amber-800">Menu Only Mode</h4>
                    <p className="text-sm text-amber-700/80 mt-1">
                      Online ordering is <strong>disabled</strong>. Customers can view your menu but cannot place orders via the website. Call button is still visible.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 3: Kitchen Status (Always visible) */}
        <div
          className={cn(
            "flex flex-col gap-3 p-4 rounded-xl border-2 transition-colors animate-in fade-in slide-in-from-top-2",
            formData.manuallyClosed
              ? "border-red-200 bg-red-50"
              : "border-gray-200 bg-gray-50",
          )}
        >
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-bold text-gray-900">
                Kitchen Status
              </Label>
              <p className="text-sm text-gray-500">
                {formData.manuallyClosed
                  ? "Kitchen is CLOSED. Outlet will appear closed."
                  : "Kitchen is OPEN."}
              </p>
            </div>
            <Switch
              checked={!formData.manuallyClosed}
              onCheckedChange={(checked) =>
                handleChange("manuallyClosed", !checked)
              }
              className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-red-600"
            />
          </div>
        </div>

        {/* Feature 1: Delivery Areas */}
        <div>
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-900">Delivery Settings</h3>
            <p className="text-sm text-gray-500">Configure where you deliver.</p>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <Label className="text-sm font-medium text-gray-700">Delivery Areas (Optional)</Label>
              <span className="text-xs text-gray-400">
                {newAreaInput.length} / 70
              </span>
            </div>
            <div className="flex gap-2">
              <input
                id="new-area-input"
                placeholder="e.g. Sector 14, Urban Estate"
                className="flex-1 p-2 border rounded-md"
                maxLength={70}
                value={newAreaInput}
                onChange={(e) => setNewAreaInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const val = normalizeArea(newAreaInput);
                    if (val) {
                      const current = formData.deliveryAreas || [];
                      if (!current.includes(val)) {
                        handleChange("deliveryAreas", [...current, val]);
                      }
                      setNewAreaInput("");
                    }
                  }
                }}
              />
              <Button
                type="button"
                variant="secondary"
                disabled={!newAreaInput.trim()}
                onClick={() => {
                  const val = normalizeArea(newAreaInput);
                  if (val) {
                    const current = formData.deliveryAreas || [];
                    if (!current.includes(val)) {
                      handleChange("deliveryAreas", [...current, val]);
                    }
                    setNewAreaInput("");
                  }
                }}
              >
                <Plus size={16} /> Add
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 mt-2">
              {(formData.deliveryAreas || []).map((area, idx) => (
                <div key={idx} className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm border border-blue-100">
                  <span>{toTitleCase(area)}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const newAreas = [...(formData.deliveryAreas || [])];
                      newAreas.splice(idx, 1);
                      handleChange("deliveryAreas", newAreas);
                    }}
                    className="hover:bg-blue-100 rounded-full p-0.5 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              {(formData.deliveryAreas || []).length === 0 && (
                <p className="text-xs text-gray-400 italic">No specific areas defined. Customers won&apos;t be asked to select an area.</p>
              )}
            </div>
          </div>
        </div>

        {/* Feature 2: UPI ID */}
        <div>
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-900">Payment Settings</h3>
            <p className="text-sm text-gray-500">Configure payment options.</p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label className="text-sm font-medium text-gray-700">UPI ID / VPA (Optional)</Label>
              <span className="text-xs text-gray-400">
                {(formData.upiId || "").length} / 40
              </span>
            </div>
            <div className="relative">
              <input
                className="w-full p-2 border rounded-md pl-10"
                placeholder="merchant@upi"
                maxLength={40}
                value={formData.upiId || ""}
                onChange={(e) => handleChange("upiId", e.target.value)}
              />
              <div className="absolute left-3 top-2.5 text-gray-400 font-bold text-xs">UPI</div>
            </div>
            <p className="text-xs text-gray-500">
              Add your UPI ID to show a &quot;Pay via UPI&quot; button. Leave blank to hide.
            </p>
          </div>
        </div>

      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Opening Hours</h3>
        </div>
        <div className="grid gap-3">
          {(showAllHours ? DAYS : DAYS.slice(0, 1)).map((dayRaw) => {
            const day = dayRaw as typeof DAYS[number];
            const openKey = `${day}Open` as keyof RestaurantDocument;
            const closeKey = `${day}Close` as keyof RestaurantDocument;

            const isOpen =
              formData[openKey] !== "00:00" ||
              formData[closeKey] !== "00:00";
            return (
              <div
                key={day}
                className="flex flex-col p-3 border rounded-xl bg-white space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold uppercase text-sm text-gray-700">
                    {day}
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "text-xs font-medium",
                        isOpen ? "text-green-600" : "text-gray-400",
                      )}
                    >
                      {isOpen ? "Open" : "Closed"}
                    </span>
                    <Switch
                      checked={isOpen}
                      onCheckedChange={(checked) => {
                        if (!checked) {
                          setFormData((prev) => ({
                            ...prev,
                            [openKey]: "00:00",
                            [closeKey]: "00:00",
                          }));
                        } else {
                          setFormData((prev) => ({
                            ...prev,
                            [openKey]: "10:00",
                            [closeKey]: "23:00",
                          }));
                        }
                      }}
                    />
                  </div>
                </div>

                {isOpen && (
                  <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-1">
                    <div>
                      <Label className="text-xs text-gray-500 mb-1 block">
                        Open Time
                      </Label>
                      <input
                        type="time"
                        className="w-full bg-gray-50 p-2 rounded-md border focus:outline-none focus:ring-1 focus:ring-primary h-10"
                        value={formData[openKey] as string}
                        onChange={(e) =>
                          handleChange(
                            openKey,
                            e.target.value,
                          )
                        }
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500 mb-1 block">
                        Close Time
                      </Label>
                      <input
                        type="time"
                        className="w-full bg-gray-50 p-2 rounded-md border focus:outline-none focus:ring-1 focus:ring-primary h-10"
                        value={formData[closeKey] as string}
                        onChange={(e) =>
                          handleChange(
                            closeKey,
                            e.target.value,
                          )
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowAllHours(!showAllHours)}
            className="w-full text-gray-500 hover:text-gray-900 border border-dashed border-gray-300"
          >
            {showAllHours ? (
              <>
                View Less <ChevronUp className="ml-2 h-4 w-4" />
              </>
            ) : (
              <>
                View All Days <ChevronDown className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="flex flex-col items-end pt-4 gap-2">
        {isDirty && (
          <div className="flex items-center text-amber-600 animate-in fade-in slide-in-from-bottom-1 text-sm bg-amber-50 px-3 py-1.5 rounded-full">
            <Info className="w-3.5 h-3.5 mr-1.5" />
            <span>You have unsaved changes</span>
          </div>
        )}

        <Button
          type="submit"
          disabled={loading || !isDirty}
          size="lg"
          className={cn("transition-all", !isDirty && "opacity-70 grayscale")}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" /> Save Outlet Details
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
