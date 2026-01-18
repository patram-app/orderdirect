import {
    Lock,
    Clock,
    Power,
    Share2,
    Store,
    Utensils,
} from "lucide-react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

const features = [
    {
        icon: Lock,
        title: "Admin Panel",
        desc: "Manage restaurant details and menu easily from one place.",
        accent: "bg-violet-50 text-violet-600",
    },
    {
        icon: Clock,
        title: "Automatic Open / Close",
        desc: "Orders automatically stop outside your business hours.",
        accent: "bg-amber-50 text-amber-600",
    },
    {
        icon: Power,
        title: "Manual Control",
        desc: "Instantly pause or resume accepting orders anytime.",
        accent: "bg-rose-50 text-rose-600",
    },
    {
        icon: Share2,
        title: "Easy Shareable Link",
        desc: "One link or QR code that customers can open instantly.",
        accent: "bg-blue-50 text-blue-600",
    },
    {
        icon: Store,
        title: "Your Restaurant Page",
        desc: "Dedicated page with details, location, and timings.",
        accent: "bg-emerald-50 text-emerald-600",
    },
    {
        icon: Utensils,
        title: "Simple Menu Management",
        desc: "Add, edit, or update items quickly on mobile.",
        accent: "bg-orange-50 text-orange-600",
    },
];

export default function FeaturesSection() {
    return (
        <section className="py-16 md:py-24 bg-white">
            <div className="max-w-6xl mx-auto px-6">
                {/* Heading */}
                <div className="text-center max-w-xl mx-auto mb-12">
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
                        Features for Restaurants
                    </h2>
                    <p className="text-sm md:text-base text-gray-500">
                        Everything you need to manage digital orders easily.
                    </p>
                </div>

                {/* ================= MOBILE: COLLAPSIBLE ================= */}
                <div className="md:hidden max-w-md mx-auto">
                    <Accordion type="single" collapsible className="space-y-3">
                        {features.map((feature, i) => (
                            <AccordionItem
                                key={i}
                                value={`feature-${i}`}
                                className="border rounded-xl px-4"
                            >
                                <AccordionTrigger className="py-4 hover:no-underline">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`w-9 h-9 rounded-lg flex items-center justify-center ${feature.accent}`}
                                        >
                                            <feature.icon className="w-4 h-4" />
                                        </div>
                                        <span className="font-semibold text-gray-900 text-left">
                                            {feature.title}
                                        </span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="pb-4 text-sm text-gray-600">
                                    {feature.desc}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>

                {/* ================= DESKTOP: GRID ================= */}
                <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, i) => (
                        <div
                            key={i}
                            className="rounded-2xl border border-gray-200 bg-white p-6 transition hover:shadow-md"
                        >
                            <div
                                className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${feature.accent}`}
                            >
                                <feature.icon className="w-5 h-5" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">
                                {feature.title}
                            </h3>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                {feature.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
