"use client";

import * as React from "react";

interface GoogleMapsScriptProps {
  apiKey: string;
  onLoad?: () => void;
}

// Keep track of script loading state globally
let isScriptLoading = false;
let isScriptLoaded = false;

export function GoogleMapsScript({ apiKey, onLoad }: GoogleMapsScriptProps) {
  React.useEffect(() => {
    if (typeof window === "undefined") return;

    // If script is already loaded, just call onLoad
    if (window.google?.maps) {
      isScriptLoaded = true;
      onLoad?.();
      return;
    }

    // If script is already being loaded, wait for it
    if (isScriptLoading) {
      const checkForGoogle = setInterval(() => {
        if (window.google?.maps) {
          clearInterval(checkForGoogle);
          isScriptLoaded = true;
          onLoad?.();
        }
      }, 100);

      return () => clearInterval(checkForGoogle);
    }

    // Start loading the script
    isScriptLoading = true;

    // Create script element
    const script = document.createElement("script");
    script.id = "google-maps-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;

    // Add load handler
    const handleLoad = () => {
      isScriptLoaded = true;
      isScriptLoading = false;
      onLoad?.();
    };

    // Add error handler
    const handleError = (error: ErrorEvent) => {
      console.error("Error loading Google Maps script:", error);
      isScriptLoading = false;
    };

    script.addEventListener("load", handleLoad);
    script.addEventListener("error", handleError);

    // Check if script already exists
    const existingScript = document.getElementById("google-maps-script");
    if (existingScript) {
      existingScript.remove();
    }

    // Add script to document
    document.head.appendChild(script);

    // Cleanup
    return () => {
      script.removeEventListener("load", handleLoad);
      script.removeEventListener("error", handleError);
    };
  }, [apiKey, onLoad]);

  return null;
} 