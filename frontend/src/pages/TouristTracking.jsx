import { useState } from "react";

const BACKEND_URL = "https://atresic-irving-steelless.ngrok-free.dev";

const headers = {
  "Content-Type": "application/json",
  "ngrok-skip-browser-warning": "true"
};

export default function TouristTracking() {
  const [deviceId, setDeviceId] = useState("");
  const [tracking, setTracking] = useState(false);

  const startTracking = async () => {
    if (!deviceId.trim()) {
      alert("Enter your name");
      return;
    }

    const id = deviceId.trim().toLowerCase().replace(" ", "_");

    try {
      await fetch(`${BACKEND_URL}/real-tourists/register`, {
        method: "POST", headers,
        body: JSON.stringify({ name: id })
      });

      await fetch(`${BACKEND_URL}/real-tourists/start-tracking`, {
        method: "POST", headers,
        body: JSON.stringify({ device_id: id })
      });

      setTracking(true);

      // ✅ Use getCurrentPosition in interval instead of watchPosition
      const sendLocation = () => {
        navigator.geolocation.getCurrentPosition(
          async ({ coords }) => {
            try {
              await fetch(`${BACKEND_URL}/real-tourists/update-location`, {
                method: "POST", headers,
                body: JSON.stringify({
                  device_id: id,
                  tourist_id: id,
                  lat: coords.latitude,
                  lng: coords.longitude
                })
              });
            } catch (err) {
              console.error("Location update failed:", err);
            }
          },
          (err) => console.error("GPS error:", err),
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      };

      sendLocation(); // send immediately
      setInterval(sendLocation, 5000); // then every 5 seconds

    } catch (err) {
      console.error(err);
      alert("Failed to start tracking. Try again.");
    }
  };

  return (
    <div style={{ padding: "40px" }}>
      <h2>Tourist Tracking</h2>
      {!tracking ? (
        <>
          <input
            placeholder="Enter your name"
            value={deviceId}
            onChange={(e) => setDeviceId(e.target.value)}
          />
          <br /><br />
          <button onClick={startTracking}>Start Tracking</button>
        </>
      ) : (
        <h3>Tracking Active 📍 — {deviceId}</h3>
      )}
    </div>
  );
}