// src/hooks/useTourists.js
import { useEffect, useState } from "react";

const backendURL = "http://127.0.0.1:8000";

export default function useTourists() {
  const [tourists, setTourists] = useState({});

  useEffect(() => {
    async function fetchTourists() {
      try {
        const res = await fetch(`${backendURL}/locations`);
        const data = await res.json();
        setTourists(data || {});
      } catch (err) {
        console.error("Failed to fetch tourists:", err);
        setTourists({});
      }
    }

    fetchTourists();
    const interval = setInterval(fetchTourists, 5000); // refresh every 5s

    return () => clearInterval(interval);
  }, []);

  return tourists;
}