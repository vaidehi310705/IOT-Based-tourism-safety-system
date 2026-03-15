import React from "react";
import { MapContainer, TileLayer } from "react-leaflet";

function MapView({ children, center = [19.346222, 72.804806], zoom = 15, height = "full" }) {
  return (
    <div className={`w-full ${height === "full" ? "h-full" : ""}`}>
      <MapContainer
        center={center}
        zoom={zoom}
        className="w-full h-full" // Tailwind handles sizing
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        {children}
      </MapContainer>
    </div>
  );
}

export default MapView;