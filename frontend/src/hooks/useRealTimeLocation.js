import { useEffect } from "react";

const backendURL = "https://atresic-irving-steelless.ngrok-free.dev";

export default function useRealTimeLocation(tourists, setTourists) {
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await fetch(`${backendURL}/real-tourists/locations`, {
          headers: {
            "ngrok-skip-browser-warning": "true"
            }
        });
        const data = await res.json();

        const updated = {};

        Object.entries(data).forEach(([id, t]) => {
          if (!t.lat == null|| !t.lng == null) return; // skip invalid/null data

          updated[id] = {
            name: t.name,
            lat: t.lat,
            lng: t.lng,
        };
      });

        setTourists(updated);
      } catch (err) {
        console.error("Failed to fetch real-time locations:", err);
      }
    };

    fetchLocations();
    const interval = setInterval(fetchLocations, 5000);

    return () => clearInterval(interval);
  }, [setTourists]);
}