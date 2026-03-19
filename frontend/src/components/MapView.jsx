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
import useTourists from "../hooks/useTourists";

import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon,
  iconUrl: markerIcon,
  shadowUrl: markerShadow
});

export default function MapView({ paths, alerts }) {
  const [zones, setZones] = useState([]);
  useZones(setZones);

  const tourists = useTourists();

  // Ref for tracking red zone alarms per tourist
  const redZoneStateRef = useRef({});
  // Ref for Web Audio API alarm
  const alarmRef = useRef(null);

  // Load alarm sound via Web Audio API
  useEffect(() => {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    fetch("/alert.mp3") // place alert.mp3 in public folder
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

  // Check if any tourist enters a red zone
  useEffect(() => {
    if (!tourists || !zones || !alarmRef.current) return;

    Object.keys(tourists).forEach(id => {
      const t = tourists[id];
      zones.forEach(zone => {
        if (zone.risk === "RED") {
          const distance = Math.sqrt(
            Math.pow(t.lat - zone.lat, 2) + Math.pow(t.lng - zone.lng, 2)
          );
          const radiusDeg = zone.radius / 111000; // 1 deg ~ 111 km
          if (distance <= radiusDeg) {
            const key = id + zone.name;
            if (!redZoneStateRef.current[key]) {
              // Trigger alarm once
              alarmRef.current();
              redZoneStateRef.current[key] = true;
              // Reset after 5 seconds
              setTimeout(() => {
                redZoneStateRef.current[key] = false;
              }, 5000);
            }
          }
        }
      });
    });
  }, [tourists, zones]);

  if (!tourists.ME) return <div>Loading map...</div>;

  const initialCenter = [tourists.ME.lat, tourists.ME.lng];

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

          {/* Zones */}
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

          {/* Tourists */}
          {Object.keys(tourists).map(id => {
            const t = tourists[id];
            if (!t) return null;

            return (
              <Marker key={id} position={[t.lat, t.lng]}>
                <Popup>
                  <div>
                    <strong>{id === "ME" ? "You" : id}</strong>
                    {alerts && alerts[id] && (
                      <div style={{ color: "red", marginTop: "5px" }}>
                        ⚠ {alerts[id].map(a => a.zone).join(", ")}
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* ME path */}
          {paths.ME && <Polyline positions={paths.ME} color="cyan" />}
        </MapContainer>
      </div>
    </div>
  );
}