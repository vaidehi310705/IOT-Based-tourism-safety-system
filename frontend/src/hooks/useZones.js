import { useEffect } from "react";

const backendURL = "http://127.0.0.1:8000";

export default function useZones(setZones) {
  useEffect(() => {
    async function fetchZones() {
      try {
        const res = await fetch(`${backendURL}/api/locations/zones`); // ✅ fixed URL
        const data = await res.json();
        // ✅ backend returns array directly, but safety check just in case
        setZones(Array.isArray(data) ? data : Object.values(data));
      } catch (err) {
        console.error("Failed to fetch zones:", err);
        setZones([]);
      }
    }

    fetchZones();
    const interval = setInterval(fetchZones, 5000);
    return () => clearInterval(interval);
  }, [setZones]);
}