import { useEffect } from "react";

const backendURL = "http://127.0.0.1:8000";

export default function useLiveLocation(setTourists, setPaths) {
  useEffect(() => {
    



    if (!("geolocation" in navigator)) return;

    const watchId = navigator.geolocation.watchPosition(
      ({ coords }) => {
        const { latitude, longitude } = coords;

        setTourists(prev => ({
          ...prev,
          ME: { lat: latitude, lng: longitude }
        }));

        setPaths(prev => ({
          ...prev,
          ME: [...(prev.ME || []), [latitude, longitude]]
        }));

        fetch(`${backendURL}/update_location`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tourist_id: "ME",
            lat: latitude,
            lng: longitude
          })
        }).catch(err => console.error(err));
      },
      err => console.error(err),
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [setTourists, setPaths]);
}