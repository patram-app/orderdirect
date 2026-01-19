import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  User,
  Smartphone,
  MessageCircle,
  CheckCircle,
  XCircle,
  ChevronRight,
  Check,
  ChevronDown,
} from "lucide-react";
import HowItWorks from "@/components/HowItWorks";
import FeaturesSection from "@/components/Features";
import Footer from "@/components/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-gray-100 selection:text-black">
      {/* --- Navigation --- */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            {/* <div className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center font-bold text-lg">D</div> */}
            <span className="text-2xl tracking-tight">
              <span className="font-bold">Direct</span>
              <span className="font-medium">Order</span>
            </span>
          </Link>

          {/* Admin CTA */}
          <div className="flex items-center gap-4">
            <Link href="/h/hometown-cafe" className="hidden sm:block">
              <Button
                variant="ghost"
                className="font-medium hover:bg-gray-50 text-gray-600 hover:text-black"
              >
                Demo Restaurant
              </Button>
            </Link>
            <Link href="/admin">
              <Button
                variant="ghost"
                className="gap-2 font-medium hover:bg-gray-50 text-gray-600 hover:text-black"
              >
                <User className="w-4 h-4" />
                Admin Login
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <section className="pt-32 pb-20 px-6 max-w-4xl mx-auto text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="inline-block mb-6 px-4 py-1.5 rounded-full bg-gray-50 border border-gray-100 text-sm font-medium text-gray-500">
          Direct WhatsApp ordering for restaurants
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 leading-[1.1] mb-6">
          Orders, directly to <span className="text-[#25D366]">WhatsApp</span>.
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed mb-10">
          A lightweight menu & ordering tool for restaurants. No app downloads,
          no commissions, no complex billing systems. Just pure, direct orders.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/admin">
            <Button
              size="lg"
              className="h-14 px-8 rounded-full text-base font-semibold bg-gray-900 hover:bg-black text-white shadow-xl shadow-gray-200 hover:shadow-gray-300 transition-all"
            >
              Get Started for Free
              <ChevronRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
          <Link href="/h/hometown-cafe">
            <Button
              variant="outline"
              size="lg"
              className="h-14 px-8 rounded-full text-base border-gray-200 hover:bg-gray-50 text-gray-600"
            >
              Demo Restaurant
            </Button>
          </Link>
        </div>
      </section>

      {/* --- Who We Are / Value Prop --- */}
      <section className="relative py-20 bg-black rounded-3xl text-white overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          {/* Section heading */}
          <div className="max-w-xl mb-14">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
              Why us for you?
            </h2>
            <p className="text-sm md:text-base text-gray-400">
              Built to simplify ordering, without taking control away from you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-14">
            {[
              {
                icon: Smartphone,
                title: "No App Required",
                desc: "Customers scan your QR or open a link and order instantly. No installs, no friction.",
              },
              {
                icon: CheckCircle,
                title: "Zero Commissions",
                desc: "We never take a cut. Orders go directly to you, keeping margins intact.",
              },
              {
                icon: MessageCircle,
                title: "Direct Communication",
                desc: "Orders arrive on your WhatsApp, allowing fast confirmation and personal interaction.",
              },
            ].map((item, i) => (
              <div key={i} className="relative flex flex-col">
                {/* Icon */}
                <div className="mb-6">
                  <item.icon className="w-6 h-6 text-white" />
                </div>

                {/* Title */}
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>

                {/* Description */}
                <p className="text-sm text-gray-400 leading-relaxed max-w-sm">
                  {item.desc}
                </p>

                {/* Dashed divider */}
                {i < 2 && (
                  <>
                    {/* Mobile */}
                    <div className="md:hidden mt-10 border-b border-dashed border-gray-700" />
                    {/* Desktop */}
                    <div className="hidden md:block absolute top-0 right-[-28px] h-full border-r border-dashed border-gray-700" />
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Subtle bottom fade */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black to-transparent" />
      </section>

      {/* --- How It Works --- */}
      <HowItWorks />

      {/* --- Features for Restaurants --- */}
      <FeaturesSection />

      {/* --- What We Handle vs What We Don't --- */}
      <section className="py-24 bg-gray-50 border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12">
            {/* What we do */}
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold mb-2">
                  What{" "}
                  <span className="text-2xl tracking-tight">
                    <span className="font-bold">Direct</span>
                    <span className="font-medium">Order</span>
                  </span>{" "}
                  Handles
                </h3>
                <p className="text-gray-500">
                  We focus on the menu and order format.
                </p>
              </div>
              <ul className="space-y-4">
                {[
                  "Beautiful Digital Menu Display",
                  "Order Formatting & cart management",
                  "WhatsApp Message Generation",
                  "Dine-in / Takeaway / Delivery toggles",
                  "Restaurant details & timings",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="mt-1 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-green-700" />
                    </div>
                    <span className="text-gray-700 font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* What we don't do */}
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold mb-2">
                  What We{" "}
                  <span className="text-gray-900 underline decoration-red-200 decoration-4">
                    Do NOT
                  </span>{" "}
                  Handle
                </h3>
                <p className="text-gray-500">
                  You retain full control over operations.
                </p>
              </div>
              <ul className="space-y-4">
                {[
                  "Online Payment Processing",
                  "Tax Calculations & Invoicing",
                  "Delivery Fleet Management",
                  "Customer Accounts/Login",
                  "Order Status Tracking (Post-WhatsApp)",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="mt-1 w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                      <XCircle className="w-3 h-3 text-red-600" />
                    </div>
                    <span className="text-gray-500">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* --- Disclaimer --- */}
      <section className="py-12 bg-white border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-6">
          <details className="group border border-gray-200 rounded-xl bg-gray-50 overflow-hidden open:ring-2 open:ring-offset-2 open:ring-gray-100 transition-all">
            <summary className="flex items-center justify-between p-4 cursor-pointer font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors select-none">
              <span>Disclaimer</span>
              <ChevronDown className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform duration-200" />
            </summary>
            <div className="p-4 pt-0 text-sm text-gray-500 leading-relaxed border-t border-gray-100 group-open:border-t-0 animate-in fade-in zoom-in-95 duration-200">
              <p className="mb-2">
                DirectOrder is a technology platform that facilitates menu
                browsing and order communication via WhatsApp. We do not process
                payments; prepare food, or handle delivery of any orders.
              </p>
              <p className="mb-2">
                All pricing, taxes, service charges, discounts, and final
                billing are determined and managed solely by the respective
                restaurant outlet.
              </p>
              <p>
                Order confirmation is entirely dependent on the restaurant after
                the order is sent via WhatsApp. For any order-related queries,
                changes, or issues, customers must contact the restaurant
                directly.
              </p>
            </div>
          </details>
        </div>
      </section>

      <Footer />
    </div>
  );
}
