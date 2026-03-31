import { useEffect, useState } from "react";

const backendURL = "http://127.0.0.1:8000";

export default function useTourists() {
  const [tourists, setTourists] = useState({});

  useEffect(() => {
    async function fetchTourists() {
      try {
        const res = await fetch(`${backendURL}/locations`, {
          cache: "no-store"
        });

        const data = await res.json();

        // normalize REAL_ME → ME (frontend expects ME)
        const clean = {};

        Object.entries(data).forEach(([key, val]) => {
          if (
            val &&
            typeof val.lat === "number" &&
            typeof val.lng === "number"
          ) {
            const newKey = key.startsWith("REAL_") ? "ME" : key;

            clean[newKey] = {
              lat: val.lat,
              lng: val.lng,
              name: typeof val.name === "string" ? val.name : newKey,
              status:
                typeof val.status === "string"
                  ? val.status
                  : "active",
              destination:
                typeof val.destination === "string"
                  ? val.destination
                  : ""
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

    const interval = setInterval(fetchTourists, 3000);

    return () => clearInterval(interval);
  }, []);

  return tourists;
}