"use client";

import { useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Printer, RefreshCw, Link as LinkIcon, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function QrCodeGenerator() {
    const [restaurantInput, setRestaurantInput] = useState("");
    const [tableInput, setTableInput] = useState("");
    const [restaurantName, setRestaurantName] = useState("Restaurant Name");
    const [previewUrl, setPreviewUrl] = useState("https://directorder.shop");
    const [isValid, setIsValid] = useState(true);

    const printRef = useRef<HTMLDivElement>(null);

    const handleGenerate = () => {
        let slug = restaurantInput.trim();
        let url = "";

        if (!slug) {
            setIsValid(false);
            toast.error("Please enter a restaurant slug or URL");
            return;
        }

        // Parse input to get slug
        try {
            if (slug.includes("directorder.shop")) {
                const urlObj = new URL(slug.startsWith("http") ? slug : `https://${slug}`);
                if (urlObj.hostname !== "directorder.shop" && urlObj.hostname !== "www.directorder.shop") {
                    setIsValid(false);
                    toast.error("Only directorder.shop URLs are allowed");
                    return;
                }
                const pathParts = urlObj.pathname.split('/').filter(Boolean);
                if (pathParts.length > 0) {
                    slug = pathParts[0];
                }
            } else if (slug.includes(".")) {
                // If it looks like a domain but not directorder.shop
                setIsValid(false);
                toast.error("Only directorder.shop domains are supported");
                return;
            }
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
            // If URL parsing fails, assume it's a raw slug
        }

        url = `https://directorder.shop/${slug}`;

        if (tableInput.trim()) {
            // Slugify table input: "Table 4" -> "table_4"
            const locParam = tableInput.trim().toLowerCase().replace(/\s+/g, "_");
            url += `?loc=${locParam}`;
        }

        setPreviewUrl(url);
        setIsValid(true);
        toast.success("QR Code updated!");
    };

    const handlePrint = () => {
        if (!isValid) {
            toast.error("Please generate a valid QR code first");
            return;
        }
        window.print();
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8 print:p-0 print:bg-white">
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 print:block">
                {/* Configuration Panel - Hidden on Print */}
                <div className="space-y-6 print:hidden">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">QR Code Generator</h1>
                        <p className="text-muted-foreground mt-2">
                            Generate physical QR cards for your tables and rooms.
                        </p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Configuration</CardTitle>
                            <CardDescription>Enter details to customize your QR card</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Restaurant Slug or URL</Label>
                                <div className="relative">
                                    <LinkIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="e.g. mumbaiya-misal or https://directorder.shop/..."
                                        className="pl-9"
                                        value={restaurantInput}
                                        onChange={(e) => setRestaurantInput(e.target.value)}
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Only <b>directorder.shop</b> links are supported.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label>Table or Room (Optional)</Label>
                                <Input
                                    placeholder="e.g. Table 4, Room 101"
                                    value={tableInput}
                                    onChange={(e) => setTableInput(e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Will be converted to a location tag (e.g. ?loc=table_4)
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label>Restaurant Name (for Card)</Label>
                                <Input
                                    placeholder="e.g. Mumbaiya Misal Vadapav"
                                    value={restaurantName}
                                    onChange={(e) => setRestaurantName(e.target.value)}
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button onClick={handleGenerate} className="flex-1">
                                    <RefreshCw className="mr-2 h-4 w-4" /> Update Preview
                                </Button>
                                <Button variant="outline" onClick={handlePrint} className="flex-1">
                                    <Printer className="mr-2 h-4 w-4" /> Print Card
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-blue-50 border-blue-200">
                        <CardContent className="pt-6 flex gap-3">
                            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                            <div className="space-y-1">
                                <h4 className="font-medium text-blue-900">Printing Instructions</h4>
                                <ul className="text-sm text-blue-800 list-disc list-inside space-y-1">
                                    <li>Click &quot;Print Card&quot; to open browser print dialog.</li>
                                    <li>Ensure <b>Background Graphics</b> is enabled in print settings.</li>
                                    <li>Set margins to <b>None</b> or <b>Minimum</b> if possible.</li>
                                    <li>The card is sized to <b>10cm x 15cm</b> suitable for table stands.</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Live Preview Area */}
                <div className="flex flex-col items-center justify-center min-h-[600px] bg-gray-100 rounded-xl border border-dashed border-gray-300 print:min-h-0 print:bg-transparent print:border-none print:block print:p-0">
                    <p className="mb-4 text-sm font-medium text-muted-foreground print:hidden">Live Preview (Scaled)</p>

                    {/* The QR Card */}
                    <div
                        ref={printRef}
                        className="bg-white text-black flex flex-col items-center text-center shadow-2xl print:shadow-none mx-auto relative overflow-hidden font-sans print:absolute print:top-0 print:left-0"
                        style={{
                            width: '10cm',
                            height: '15cm',
                            // In preview mode, we might scale it down if needed, but for now let's keep it exact or rely on responsive container
                        }}
                    >
                        {/* Header */}
                        <div className="w-full bg-black text-white p-6 flex items-center justify-center min-h-[3.5cm]">
                            <h1 className="text-2xl font-medium leading-tight px-2 break-words w-full" style={{ fontFamily: 'sans-serif' }}>
                                {restaurantName || "Restaurant Name"}
                            </h1>
                        </div>

                        {/* Content */}
                        <div className="flex-1 flex flex-col items-center w-full px-6 pt-4 pb-6">
                            {/* Table Label */}
                            <div className="w-full border-b-2 border-black pb-1 mb-6">
                                <h2 className="text-xl font-bold">
                                    {tableInput || "Table No. --"}
                                </h2>
                            </div>

                            {/* QR Code */}
                            <div className="flex-1 flex items-center justify-center w-full mb-4">
                                <div className="p-1 bg-white">
                                    <QRCodeSVG
                                        value={previewUrl}
                                        size={200} // This is pixels, effectively acts as vector base size
                                        level="H"
                                        includeMargin={false}
                                        className="w-full h-auto max-w-[6cm] max-h-[6cm]"
                                    />
                                </div>
                            </div>

                            {/* Call to Action */}
                            <div className="w-full border-t-2 border-black pt-2 mt-auto">
                                <h3 className="text-lg font-bold mb-3">
                                    Scan to View Menu & Order
                                </h3>

                                <div className="flex flex-col items-center justify-center text-xs text-gray-500 gap-1">
                                    <span>Powered by</span>
                                    <div className="flex items-center gap-1">
                                        <span className="font-bold text-lg text-black">Direct</span>
                                        <span className="font-light text-lg text-black">Order</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <p className="mt-8 text-xs text-muted-foreground max-w-xs text-center print:hidden">
                        The preview above represents the physical size of 10cm x 15cm.
                        Actual print size depends on your printer settings.
                    </p>
                </div>
            </div>

            {/* Print Styles */}
            <style jsx global>{`
                @media print {
                    @page {
                        size: 10cm 15cm;
                        margin: 0;
                    }
                    body {
                        visibility: hidden;
                        background: white;
                    }
                    div.print\\:block {
                        display: block !important;
                    }
                    div.print\\:hidden {
                        display: none !important;
                    }
                    /* Target the card container specifically */
                    div[class*="min-h-screen"] > div > div:last-child {
                        visibility: visible;
                        position: absolute;
                        left: 0;
                        top: 0;
                        margin: 0;
                        padding: 0;
                        width: 10cm;
                        height: 15cm;
                        background: white;
                    }
                    /* Ensure the card itself is visible */
                    div[class*="min-h-screen"] > div > div:last-child > div {
                        visibility: visible !important;
                        box-shadow: none !important;
                    }
                }
            `}</style>
        </div>
    );
}
