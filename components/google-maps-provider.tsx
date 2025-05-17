"use client";

import * as React from "react";

interface GoogleMapsContextType {
  isLoaded: boolean;
  error: string | null;
}

const GoogleMapsContext = React.createContext<GoogleMapsContextType>({
  isLoaded: false,
  error: null,
});

export function useGoogleMaps() {
  return React.useContext(GoogleMapsContext);
}

export function GoogleMapsProvider({
  apiKey,
  children,
}: {
  apiKey: string;
  children: React.ReactNode;
}) {
  const [state, setState] = React.useState<GoogleMapsContextType>({
    isLoaded: false,
    error: null,
  });

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    // If already loaded, don't load again
    if (window.google?.maps) {
      setState({ isLoaded: true, error: null });
      return;
    }

    // Create script element
    const script = document.createElement("script");
    script.id = "google-maps-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;

    // Add load handler
    script.addEventListener("load", () => {
      setState({ isLoaded: true, error: null });
    });

    // Add error handler
    script.addEventListener("error", () => {
      setState({ isLoaded: false, error: "Failed to load Google Maps" });
    });

    // Add script to document
    document.head.appendChild(script);

    return () => {
      // Don't remove the script on cleanup - we want it to persist
    };
  }, [apiKey]);

  return (
    <GoogleMapsContext.Provider value={state}>
      {children}
    </GoogleMapsContext.Provider>
  );
} 