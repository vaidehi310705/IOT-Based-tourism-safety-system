import { useState, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  Popup,
  Polyline
} from "react-leaflet";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import useZones from "../hooks/useZones";

import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon,
  iconUrl: markerIcon,
  shadowUrl: markerShadow
});

export default function MapView({ tourists, paths, alerts }) {
  const [zones, setZones] = useState([]);
  useZones(setZones);

  const redZoneStateRef = useRef({});
  const alarmRef = useRef(null);

  useEffect(() => {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    fetch("/alert.mp3")
      .then(res => res.arrayBuffer())
      .then(data => audioCtx.decodeAudioData(data))
      .then(buffer => {
        alarmRef.current = () => {
          const source = audioCtx.createBufferSource();
          source.buffer = buffer;
          source.connect(audioCtx.destination);
          source.start();
        };
      })
      .catch(err => console.error("Error loading alarm:", err));
  }, []);

  useEffect(() => {
    if (!tourists || !zones || !alarmRef.current) return;
    Object.keys(tourists).forEach(id => {
      const t = tourists[id];
      zones.forEach(zone => {
        if (zone.risk === "RED") {
          const distance = Math.sqrt(
            Math.pow(t.lat - zone.lat, 2) + Math.pow(t.lng - zone.lng, 2)
          );
          const radiusDeg = zone.radius / 111000;
          if (distance <= radiusDeg) {
            const key = id + zone.name;
            if (!redZoneStateRef.current[key]) {
              alarmRef.current();
              redZoneStateRef.current[key] = true;
              setTimeout(() => {
                redZoneStateRef.current[key] = false;
              }, 5000);
            }
          }
        }
      });
    });
  }, [tourists, zones]);

  const touristList = Object.values(tourists);
  if (touristList.length === 0) return <div>Loading map...</div>;
  const first = touristList[0];
  const initialCenter = [first.lat ?? 19.076, first.lng ?? 72.877];

  return (
    <div className="col-span-6 h-162.5 bg-blue-900/50 backdrop-blur-xl rounded-3xl p-4 border border-blue-700 shadow-2xl">
      <div className="h-full w-full rounded-xl overflow-hidden">
        <MapContainer
          center={initialCenter}
          zoom={17}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={true}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {zones.map((zone, i) => (
            <Circle
              key={i}
              center={[zone.lat, zone.lng]}
              radius={zone.radius}
              pathOptions={{
                color: zone.risk === "RED" ? "#ef4444" : "#facc15",
                fillOpacity: 0.25
              }}
            />
          ))}

          {Object.keys(tourists).map(id => {
            const t = tourists[id];
            if (!t || t.lat == null || t.lng == null) return null;

            // ✅ safely get alert zones
            const touristAlerts = alerts && Array.isArray(alerts[id]) ? alerts[id] : [];

            return (
              <Marker key={id} position={[t.lat, t.lng]}>
                <Popup>
                  <div>
                    <strong>{id}</strong>
                    {touristAlerts.length > 0 && (
                      <div style={{ color: "red", marginTop: "5px" }}>
                        ⚠ {touristAlerts.map(a => a.zone).join(", ")}
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {paths.ME && <Polyline positions={paths.ME} color="cyan" />}

        </MapContainer>
      </div>
    </div>
  );
}