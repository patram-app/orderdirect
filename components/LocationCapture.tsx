"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";

function LocationCaptureContent({ slug }: { slug: string }) {
    const searchParams = useSearchParams();
    const loc = searchParams.get("loc");

    useEffect(() => {
        if (loc) {
            localStorage.setItem(`prefillLocation_${slug}`, loc);
        }
    }, [loc, slug]);

    return null;
}

export default function LocationCapture({ slug }: { slug: string }) {
    return (
        <Suspense>
            <LocationCaptureContent slug={slug} />
        </Suspense>
    );
}
