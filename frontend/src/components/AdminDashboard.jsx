import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Circle, Popup } from "react-leaflet";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./AdminDashboard.css";

const backendURL = "http://127.0.0.1:8000"; // change if needed

// Component for tourist markers
function TouristMarkers({ tourists }) {
  return (
    <>
      {Object.keys(tourists).map((id) => (
        <Marker key={id} position={[tourists[id].lat, tourists[id].lng]}>
          <Popup>{id}</Popup>
        </Marker>
      ))}
    </>
  );
}

export default function AdminDashboard() {
  const [tourists, setTourists] = useState({});
  const [alerts, setAlerts] = useState([]);

  const zones = [
    { name: "Green", lat: 19.07, lng: 72.87, radius: 500, color: "green" },
    { name: "Yellow", lat: 19.08, lng: 72.88, radius: 300, color: "yellow" },
    { name: "Red", lat: 19.09, lng: 72.89, radius: 200, color: "red" },
  ];

  // Fetch tourists every 5 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${backendURL}/locations`);
        const data = await res.json();
        setTourists(data);
      } catch (err) {
        console.error(err);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Detect zone alerts
  useEffect(() => {
    for (const id in tourists) {
      const t = tourists[id];
      zones.forEach((zone) => {
        const dist = getDistance(t.lat, t.lng, zone.lat, zone.lng);
        if (dist <= zone.radius) {
          if (zone.color === "yellow" && !alerts.includes(`${id}-yellow`)) {
            toast.info(`${id} entered Yellow Zone`);
            setAlerts((prev) => [...prev, `${id}-yellow`]);
          }
          if (zone.color === "red" && !alerts.includes(`${id}-red`)) {
            toast.error(`${id} entered Red Zone`);
            setAlerts((prev) => [...prev, `${id}-red`]);
          }
        }
      });
    }
  }, [tourists]);

  // Haversine distance
  const getDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371000;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  return (
    <div className="dashboard">
      <ToastContainer />

      {/* Left column */}
      <div className="left-column">
        <div className="box">
          <h3>Weather</h3>
          <p>28°C, Sunny</p>
        </div>
        <div className="box">
          <h3>Tourist Info</h3>
          <p>Total Tourists: {Object.keys(tourists).length}</p>
        </div>
        <div className="box">
          <h3>Other Info</h3>
          <p>Placeholder</p>
        </div>
      </div>

      {/* Center map */}
      <div className="center-map">
        <MapContainer
          center={[19.07, 72.87]}
          zoom={14}
          style={{ width: "100%", height: "100%" }}
          scrollWheelZoom={true}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          {zones.map((zone, idx) => (
            <Circle
              key={idx}
              center={[zone.lat, zone.lng]}
              radius={zone.radius}
              color={zone.color}
            />
          ))}
          <TouristMarkers tourists={tourists} />
        </MapContainer>
      </div>

      {/* Right column */}
      <div className="right-column">
        <h3>Tourist List</h3>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Lat</th>
              <th>Lng</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(tourists).map((id) => (
              <tr key={id}>
                <td>{id}</td>
                <td>{tourists[id].lat.toFixed(5)}</td>
                <td>{tourists[id].lng.toFixed(5)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
