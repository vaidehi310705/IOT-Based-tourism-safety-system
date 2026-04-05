import { useEffect, useState } from "react";

const backendURL = "http://127.0.0.1:8000";

export default function useTourists() {

  const [tourists, setTourists] = useState({});

  useEffect(() => {

    async function fetchTourists() {

      try {

        // keep original endpoint (your system depends on it)
        const res = await fetch(
          `${backendURL}/locations`,
          { cache: "no-store" }
        );

        const data = await res.json();

        // backend already returns correct format
        // example:
        // {
        //   T1:{lat,lng},
        //   T2:{lat,lng},
        //   REAL_ME:{lat,lng}
        // }

        const formatted = {};

        Object.keys(data || {}).forEach(id => {

          const t = data[id];

          if (!t) return;

          formatted[id] = {
            lat: t.lat ?? null,
            lng: t.lng ?? null
          };

        });

        // normalize REAL_ME → ME (your MapView expects this)
        const realKey = Object.keys(formatted).find(
          id => id.startsWith("REAL_")
        );

        if (realKey && !formatted["ME"]) {
          formatted["ME"] = formatted[realKey];
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