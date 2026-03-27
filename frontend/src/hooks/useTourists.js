import { useEffect, useState } from "react";

const backendURL = "http://127.0.0.1:8000";

export default function useTourists() {
  const [tourists, setTourists] = useState({});

  useEffect(() => {
    async function fetchTourists() {
      try {
        const res = await fetch(`${backendURL}/api/locations/locations`);
        const data = await res.json();

        // ✅ make sure every value has only simple fields
        const clean = {};
        Object.entries(data).forEach(([key, val]) => {
          if (val && typeof val.lat === "number" && typeof val.lng === "number") {
            clean[key] = {
              lat: val.lat,
              lng: val.lng,
              name: typeof val.name === "string" ? val.name : key,
              status: typeof val.status === "string" ? val.status : "active",
              destination: typeof val.destination === "string" ? val.destination : ""
            };
          }
        });

        setTourists(clean);
      } catch (err) {
        console.error("Failed to fetch tourists:", err);
        setTourists({});
      }
    }

    fetchTourists();
    const interval = setInterval(fetchTourists, 5000);
    return () => clearInterval(interval);
  }, []);

  return tourists;
}