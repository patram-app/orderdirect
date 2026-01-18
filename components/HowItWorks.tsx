"use client";

import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

const steps = [
  {
    step: "1",
    title: "Scan & Open Menu",
    desc: "Customer scans QR code or opens your menu link.",
  },
  {
    step: "2",
    title: "Select Items",
    desc: "Items and variants are added to cart easily.",
  },
  {
    step: "3",
    title: "Send to WhatsApp",
    desc: "Order is sent as a formatted WhatsApp message.",
  },
  {
    step: "4",
    title: "Confirm & Prepare",
    desc: "Restaurant confirms the order and prepares it.",
  },
];

function StepCard({ step, title, desc }: (typeof steps)[number]) {
  return (
    <div className="group relative h-[300px] rounded-2xl border border-gray-100 bg-white p-6 flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      
      {/* BACKGROUND STEP NUMBER */}
      <div className="absolute -top-8 -left-4 text-[150px]  font-extrabold text-emerald-500/10 -rotate-6 select-none pointer-events-none">
        {step}
      </div>

      {/* CONTENT */}
      <div className="relative flex flex-col h-full">
        {/* Step label */}
        <span className="inline-block text-xs font-semibold uppercase tracking-wide text-emerald-600 mb-2">
          Step {step}
        </span>

        {/* Push content to bottom */}
        <div className="flex-1" />

        {/* Bottom content */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {title}
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            {desc}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="py-16 md:py-24 px-6 bg-gray-50"
    >
      {/* HEADING */}
      <div className="text-center max-w-xl mx-auto mb-12">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
          How{" "}
          <span className="font-bold">Direct</span>
          <span className="font-medium">Order</span> Works
        </h2>
        <p className="text-sm md:text-base text-gray-500">
          Simple, direct WhatsApp ordering flow.
        </p>
      </div>

      {/* ================= MOBILE: CAROUSEL ================= */}
      <div className="md:hidden">
        <Carousel
          opts={{ align: "start" }}
          plugins={[
            Autoplay({
              delay: 3500,
              stopOnInteraction: true,
            }),
          ]}
          className="w-full"
        >
          <CarouselContent className="-ml-4 pr-[30%]">
            {steps.map((step) => (
              <CarouselItem
                key={step.step}
                className="pl-4 basis-[90%]"
              >
                <StepCard {...step} />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        <p className="mt-4 text-xs text-gray-400 text-center">
          Swipe to explore steps →
        </p>
      </div>

      {/* ================= DESKTOP: GRID ================= */}
      <div className="hidden md:block max-w-6xl mx-auto relative">
        {/* Connector line */}
        <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-200 -z-10" />

        <div className="grid grid-cols-4 gap-6">
          {steps.map((step) => (
            <StepCard key={step.step} {...step} />
          ))}
        </div>
      </div>
    </section>
  );
}
