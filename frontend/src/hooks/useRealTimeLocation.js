import { useEffect } from "react";

const backendURL = "http://127.0.0.1:8000/real-tourists";

export default function useRealTimeLocation(tourists, setTourists) {
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await fetch(`${backendURL}/locations`);
        const data = await res.json();

        if (!Array.isArray(data)) return;

        const updated = {};
        data.forEach((t) => {
          updated[t.tourist_id] = {
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