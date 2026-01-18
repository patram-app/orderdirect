
import Link from "next/link";
import { Phone, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Footer() {
    const whatsappNumber = "919817285068";
    const whatsappMessage = encodeURIComponent("Hi, Please update me with DirectOrder details.");
    const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

    return (
        <footer className="bg-gray-50 border-t border-gray-200">
            <div className="max-w-6xl mx-auto px-6 py-12 md:py-16">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
                    {/* Brand Section */}
                    <div className="flex flex-col gap-4">
                        <Link href="/" className="flex items-center gap-2">
                            <span className="text-2xl tracking-tight text-gray-900">
                                <span className="font-bold">Direct</span><span className="font-medium">Order</span>
                            </span>
                        </Link>
                        <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
                            Seamless communication between restaurants and customers. Direct orders, zero commissions.
                        </p>
                        <p className="text-gray-400 text-xs mt-2">
                            &copy; {new Date().getFullYear()} DirectOrder. All rights reserved.
                        </p>
                    </div>

                    {/* Contact Section */}
                    <div className="flex flex-col gap-4">
                        <h3 className="font-semibold text-gray-900">Contact Us</h3>
                        <div className="flex flex-col gap-3">
                            <a
                                href="tel:9817285068"
                                className="flex items-center gap-3 text-gray-600 hover:text-gray-900 transition-colors group"
                            >
                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                                    <Phone size={14} />
                                </div>
                                <span className="font-medium text-sm">9817285068</span>
                            </a>
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className="flex flex-col gap-4">
                        <h3 className="font-semibold text-gray-900">Get in Touch</h3>
                        <p className="text-gray-500 text-sm mb-2">
                            Ready to get started for your restaurant? Chat with us on WhatsApp for details.
                        </p>
                        <a
                            href={whatsappLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block"
                        >
                            <Button
                                size="lg"
                                className="w-full sm:w-auto gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white border-none shadow-sm hover:shadow-md transition-all"
                            >
                                <MessageCircle size={18} />
                                Chat on WhatsApp
                            </Button>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
