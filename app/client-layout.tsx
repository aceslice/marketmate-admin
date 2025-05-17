"use client";

import { GoogleMapsProvider } from "@/components/google-maps-provider";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <GoogleMapsProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}>
      {children}
    </GoogleMapsProvider>
  );
} 