import { useState } from "react";
import axios from "axios";

export default function TouristTracking() {

  const [deviceId, setDeviceId] = useState("");
  const [tracking, setTracking] = useState(false);

  // ✅ Add your backend URL here so both start-tracking and update-location use it
  const BACKEND_URL = "http://192.168.0.105:8000"; // your laptop IP

  const startTracking = async () => {

    if (!deviceId.trim()) {
      alert("Enter Device ID");
      return;
    }

    try {

      // confirm device exists
      await axios.post(
        `${BACKEND_URL}/real-tourists/start-tracking`,
        {
          device_id: deviceId.trim()
        }
      );

      alert("Tracking started successfully");

      setTracking(true);

      // start GPS tracking AFTER validation
      navigator.geolocation.watchPosition(

        async (position) => {

          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          console.log("Sending:", deviceId, lat, lng);

          try {

            await axios.post(
              `${BACKEND_URL}/real-tourists/update-location`,
              {
                device_id: deviceId.trim(),
                lat: lat,
                lng: lng
              }
            );

            console.log("Location sent successfully");

          } catch (err) {

            console.error("Location update failed:", err);

          }

        },

        (error) => {

          console.error("GPS error:", error);

          alert("Enable location permission on your phone");

        },

        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );

    } catch (err) {

      console.error(err);

      alert("Invalid Device ID");

    }
  };

  return (

    <div style={{ padding: "40px" }}>

      <h2>Tourist Tracking</h2>

      {!tracking ? (

        <>
          <input
            placeholder="Enter Device ID"
            value={deviceId}
            onChange={(e) => setDeviceId(e.target.value)}
          />

          <br /><br />

          <button onClick={startTracking}>
            Start Tracking
          </button>
        </>

      ) : (

        <h3>Tracking Active 📍</h3>

      )}

    </div>
  );
}