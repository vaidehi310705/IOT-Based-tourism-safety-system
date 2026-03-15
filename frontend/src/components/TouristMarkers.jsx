import React from "react";
import { Marker, Popup } from "react-leaflet";

function TouristMarkers({ tourists }) {
  return (
    <>
      {Object.keys(tourists).map((id) => {
        const t = tourists[id];
        if (!t || t.lat == null || t.lng == null) return null;

        return (
          <Marker key={id} position={[t.lat, t.lng]}>
            <Popup className="text-sm">
              <div className="space-y-1">
                <p className="font-semibold">{id === "ME" ? "You" : `Tourist ${id}`}</p>
                <p>Lat: {t.lat.toFixed(5)}</p>
                <p>Lng: {t.lng.toFixed(5)}</p>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}

export default TouristMarkers;