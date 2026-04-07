import { useEffect, useState } from "react";

const backendURL = "https://atresic-irving-steelless.ngrok-free.dev";

export default function useTourists() {
  const [tourists, setTourists] = useState({});

  useEffect(() => {
    async function fetchTourists() {
      try {
        const res = await fetch(`${backendURL}/locations`, { cache: "no-store" });
        const data = await res.json();

        const formatted = {};

        // ✅ Handle ARRAY response from backend
        if (Array.isArray(data)) {
          data.forEach(t => {
            if (!t || !t.tourist_id) return;
            formatted[t.tourist_id] = {
              lat: t.lat ?? null,
              lng: t.lng ?? null
            };
          });
        } 
        // ✅ Handle OBJECT response (fallback)
        else if (typeof data === "object") {
          Object.keys(data).forEach(id => {
            const t = data[id];
            if (!t) return;
            formatted[id] = {
              lat: t.lat ?? null,
              lng: t.lng ?? null
            };
          });
        }

        setTourists(formatted);

      } catch (err) {
        console.error("Tourist fetch error:", err);
        setTourists({});
      }
    }

    fetchTourists();
    const interval = setInterval(fetchTourists, 3000);
    return () => clearInterval(interval);
  }, []);

  return tourists;
}