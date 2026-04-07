import { useState } from "react";

const BACKEND_URL = "https://atresic-irving-steelless.ngrok-free.dev";

const headers = {
  "Content-Type": "application/json",
  "ngrok-skip-browser-warning": "true"
};

export default function TouristTrackerPage() {
  const [deviceId, setDeviceId] = useState("");
  const [tracking, setTracking] = useState(false);

  const handleStart = async () => {
    if (!deviceId) {
      alert("Enter device ID");
      return;
    }

    try {
      await fetch(`${BACKEND_URL}/real-tourists/register`, {
        method: "POST", headers,
        body: JSON.stringify({ name: deviceId })
      });

      await fetch(`${BACKEND_URL}/real-tourists/start-tracking`, {
        method: "POST", headers,
        body: JSON.stringify({ device_id: deviceId })
      });

      setTracking(true);

      navigator.geolocation.watchPosition(
        async (position) => {
          await fetch(`${BACKEND_URL}/real-tourists/update-location`, {
            method: "POST", headers,
            body: JSON.stringify({
              device_id: deviceId,
              tourist_id: deviceId,
              lat: position.coords.latitude,
              lng: position.coords.longitude
            })
          });
        },
        () => alert("Location permission required"),
        { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
      );

    } catch (err) {
      console.error(err);
      alert("Failed to start tracking");
    }
  };

  return (
    <div>
      <h2>Tourist Device Tracking</h2>
      {!tracking ? (
        <>
          <input
            placeholder="Enter Device ID"
            value={deviceId}
            onChange={(e) => setDeviceId(e.target.value)}
          />
          <button onClick={handleStart}>Start Tracking</button>
        </>
      ) : (
        <h3>Tracking Started Successfully 📍</h3>
      )}
    </div>
  );
}