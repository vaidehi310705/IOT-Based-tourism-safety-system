import { useEffect } from "react";

const backendURL = "https://atresic-irving-steelless.ngrok-free.dev";

export default function useZones(setZones) {
  useEffect(() => {
    async function fetchZones() {
      try {
        const res = await fetch(`${backendURL}/zones`);
        const data = await res.json();
        setZones(data || []);
      } catch (err) {
        console.error(err);
        setZones([]);
      }
    }

    fetchZones();
    const interval = setInterval(fetchZones, 5000);

    return () => clearInterval(interval);
  }, [setZones]);
}