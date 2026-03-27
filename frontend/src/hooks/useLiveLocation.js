import { useEffect } from "react";

const backendURL = "http://127.0.0.1:8000";

export default function useLiveLocation(setTourists, setPaths) {
  useEffect(() => {

    const init = async () => {
      let touristId = localStorage.getItem("touristId");

      if (!touristId) {
        try {
          const res = await fetch(`${backendURL}/api/auth/register`, { // ✅ fixed URL
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({          // ✅ send required fields
              name: "Browser User",
              phone: "0000000000",
              emergency_contact: "0000000000",
              destination: "Unknown"
            })
          });
          const data = await res.json();
          touristId = data.tourist_id;      // ✅ fixed field name
          localStorage.setItem("touristId", touristId);
        } catch (err) {
          console.error("Register failed:", err);
          return;
        }
      }

      if (!("geolocation" in navigator)) return;

      const watchId = navigator.geolocation.watchPosition(
        ({ coords }) => {
          const { latitude, longitude } = coords;

          setTourists(prev => ({
            ...prev,
            [touristId]: { lat: latitude, lng: longitude }
          }));

          setPaths(prev => ({
            ...prev,
            [touristId]: [...(prev[touristId] || []), [latitude, longitude]]
          }));

          fetch(`${backendURL}/api/locations/update_location`, { // ✅ fixed URL
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              tourist_id: touristId,        // ✅ fixed field name
              lat: latitude,
              lng: longitude
            })
          }).catch(err => console.error("Update failed:", err));
        },
        err => console.error(err),
        { enableHighAccuracy: true }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    };

    init();

  }, [setTourists, setPaths]);
}