"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QrCode } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface UpiPaymentDialogProps {
    upiId: string;
    restaurantName: string;
    whatsappNumber: string;

    className?: string; // For trigger styling
    trigger?: React.ReactNode; // Custom trigger
}

export function UpiPaymentDialog({
    upiId,
    restaurantName,
    whatsappNumber,

    className,
    trigger,
}: UpiPaymentDialogProps) {
    const [open, setOpen] = useState(false);

    // Construct UPI Deep Link
    // tr = transaction ref (optional), tn = transaction note (optional), am = amount (optional)
    const encodedName = encodeURIComponent(restaurantName);
    const deepLink = `upi://pay?pa=${upiId}&pn=${encodedName}&cu=INR`;

    // Clean whatsapp number for link (remove + and spaces)
    const cleanWhatsapp = whatsappNumber?.replace(/[^0-9]/g, "") || "";
    const whatsappLink = `https://wa.me/${cleanWhatsapp}`;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                            "gap-2 border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 hover:border-blue-300 transition-colors",
                            className
                        )}
                    >
                        <QrCode size={16} />
                        Pay via UPI
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <span className="bg-blue-100 p-1.5 rounded-full text-blue-600">
                            <QrCode size={18} />
                        </span>
                        UPI Payment
                    </DialogTitle>
                    <DialogDescription>
                        Pay directly to <strong>{restaurantName}</strong>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-2">
                    {/* Instructions */}
                    <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 text-sm text-gray-600 leading-relaxed">
                        <ul className="space-y-2 opacity-90">
                            <li className="flex gap-2">
                                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-xs font-medium">1</span>
                                <span>
                                    Enter the confirmed bill amount manually.
                                </span>
                            </li>
                            <li className="flex gap-2">
                                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-xs font-medium">2</span>
                                <span>
                                    After paying, simply <strong>show the screen</strong> to the owner (if dining in) or share the <strong>screenshot</strong> on <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="text-[#25D366] font-bold decoration-dashed underline underline-offset-4 hover:opacity-80 transition-opacity">WhatsApp</a>.
                                </span>
                            </li>
                        </ul>
                    </div>

                    {/* Action Button */}
                    <Button
                        className="w-full bg-[#25D366] hover:bg-[#1ebc57] text-white shadow-md h-12 text-base font-semibold"
                        onClick={() => {
                            window.location.href = deepLink;
                        }}
                    >
                        Pay via UPI
                    </Button>

                    {/* UPI ID Display (Reference Only) */}
                    <div className="text-center">
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-medium mb-1">
                            Merchant ID (Reference Only)
                        </p>
                        <p className="font-mono text-xs text-gray-500 bg-gray-50 inline-block px-2 py-1 rounded border border-gray-100 select-all">
                            {upiId}
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}