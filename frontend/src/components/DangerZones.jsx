import React from "react";
import { Circle, Popup } from "react-leaflet";

function DangerZones({ zones }) {
  return (
    <>
      {zones.map((zone, index) => {
        // Determine color based on zone type
        const color =
          zone.risk === "RED"
            ? "red"
            : zone.risk === "YELLOW"
            ? "yellow"
            : "green"; // fallback

        return (
         <Circle
  key={i}
  center={[zone.lat, zone.lng]}
  radius={zone.radius}
  pathOptions={{
    color: zone.risk === "RED" ? "#ef4444" : "#facc15",
    fillOpacity: 0.25,
    weight: 2,
    className: "pulse-zone"
  }}
>
            {/* Optional popup */}
            <Popup>
              {zone.name} Zone - {zone.risk}
            </Popup>
          </Circle>
        );
      })}
    </>
  );
}

export default DangerZones;