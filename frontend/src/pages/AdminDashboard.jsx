import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  Popup,
  useMap,
  Polyline
} from "react-leaflet";
import { ToastContainer, toast } from "react-toastify";
import "leaflet/dist/leaflet.css";
import "react-toastify/dist/ReactToastify.css";
import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow
});

L.Marker.prototype.options.icon = DefaultIcon;

const backendURL = "http://127.0.0.1:8000";

function Recenter({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.setView(position, map.getZoom());
    }
  }, [position, map]);

  return null;
}

export default function AdminDashboard() {

  const [tourists, setTourists] = useState({});
  const [zones, setZones] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [weather, setWeather] = useState(null);
  const [paths, setPaths] = useState({});
  const [alertMessages, setAlertMessages] = useState([]);

  /* FETCH TOURISTS + ZONES */

  useEffect(() => {

    const fetchData = async () => {
      try {

        const tRes = await fetch(`${backendURL}/locations`);
        const tData = await tRes.json();

        const zRes = await fetch(`${backendURL}/zones`);
        const zData = await zRes.json();

        setTourists(tData || {});
        setZones(zData || []);

      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 3000);

    return () => clearInterval(interval);

  }, []);

  /* WEATHER */

  useEffect(() => {

    const fetchWeather = async () => {

      try {

        const res = await fetch(
          "https://api.openweathermap.org/data/2.5/weather?q=Virar&units=metric&appid=221dc25f6d9608b3ced89b02141ebef3"
        );

        const data = await res.json();

        if (!data.main) return;

        setWeather({
          temp: data.main.temp,
          condition: data.weather[0].main,
          humidity: data.main.humidity
        });

      } catch (err) {
        console.error(err);
      }

    };

    fetchWeather();

  }, []);

  /* REAL TIME LOCATION */

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
        });

      },

      err => console.error(err),

      { enableHighAccuracy: true }

    );

    return () => navigator.geolocation.clearWatch(watchId);

  }, []);

  /* DISTANCE FUNCTION */

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

  /* ALERT SYSTEM */

  useEffect(() => {

    Object.keys(tourists).forEach(id => {

      const t = tourists[id];
      if (!t) return;

      zones.forEach(zone => {

        const dist = getDistance(t.lat, t.lng, zone.lat, zone.lng);
        const key = `${id}-${zone.name}`;

        if (dist <= zone.radius && !alerts.includes(key)) {

          const message =
            `${id === "ME" ? "You" : id} entered ${zone.risk} zone`;

          if (zone.risk === "YELLOW") toast.info(message);
          if (zone.risk === "RED") toast.error(message);

          setAlerts(prev => [...prev, key]);
          setAlertMessages(prev => [message, ...prev]);

        }

      });

    });

  }, [tourists, zones]);

  return (
  <div className="min-h-screen bg-linear-to-br from-blue-950 via-blue-900 to-blue-800 text-white p-6">

    <ToastContainer />

    {/* APP TITLE */}
    <div className="w-full text-center mb-10 mt-10">
      <h1 className="text-5xl font-bold text-blue-200 tracking-wide">
        Tourist Safety Monitoring System
      </h1>
      <p className="text-blue-400 text-sm mt-2">
Real-time Geofence Monitoring & Tourist Tracking
</p>
      <div className="w-40 h-1 bg-blue-400 mx-auto mt-3 rounded-full"></div>
    </div>

    <div className="grid grid-cols-12 gap-6">

      {/* LEFT COLUMN */}
      <div className="col-span-3 flex flex-col gap-6">

        {/* CONTROL PANEL */}
        <div className="bg-blue-900/60 backdrop-blur-xl rounded-3xl p-6 border border-blue-700 shadow-2xl">
          <h2 className="text-xl font-bold text-blue-200 mb-4">
            Control Panel
          </h2>

          <div className="bg-blue-800/50 rounded-xl p-4 mb-3">
            <p className="text-sm text-blue-300">Active Tourists</p>
            <p className="text-2xl font-bold">
              {Object.keys(tourists).length}
            </p>
          </div>

          <div className="bg-blue-800/50 rounded-xl p-4 mb-3">
            <p className="text-sm text-blue-300">Danger Zones</p>
            <p className="text-2xl font-bold">{zones.length}</p>
          </div>

          <div className="bg-blue-800/50 rounded-xl p-4">
            <p className="text-sm text-blue-300">System Status</p>
            <p className="text-green-400 font-semibold">
              Monitoring Active
            </p>
          </div>
        </div>

        {/* WEATHER */}
        <div className="bg-blue-900/60 backdrop-blur-xl rounded-3xl p-6 border border-blue-700 shadow-2xl">
          <h3 className="text-lg font-semibold text-blue-200 mb-3">
            Weather
          </h3>

          {weather ? (
            <>
              <p className="text-3xl font-bold">{weather.temp}°C</p>
              <p className="text-blue-200">{weather.condition}</p>
              <p className="text-sm text-blue-400">
                Humidity: {weather.humidity}%
              </p>
            </>
          ) : (
            <p>Loading...</p>
          )}
        </div>

        {/* LIVE ALERTS */}
        <div className="bg-red-900/40 backdrop-blur-xl rounded-3xl p-6 border border-red-700 shadow-2xl max-h-64 overflow-y-auto">
          <h3 className="text-red-300 font-semibold mb-3">
            Live Alerts
          </h3>

          {alertMessages.length === 0 ? (
            <p className="text-red-200 text-sm">No alerts</p>
          ) : (
            alertMessages.map((a, i) => (
              <p key={i} className="text-red-200 text-sm mb-1">
                ⚠ {a}
              </p>
            ))
          )}
        </div>

      </div>

      {/* MAP */}
      <div className="col-span-6 h-150 bg-blue-900/50 backdrop-blur-xl rounded-3xl p-4 border border-blue-700 shadow-2xl">

        <div className="h-full w-full rounded-xl overflow-hidden">

        <MapContainer
  center={
    tourists.ME
      ? [tourists.ME.lat, tourists.ME.lng]
      : [20.427898, 72.785779]
  }
  zoom={16}
  className="h-full w-full"
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
              if (!t) return null;

              return (
                <Marker key={id} position={[t.lat, t.lng]}>
                  <Popup>{id === "ME" ? "You" : id}</Popup>
                </Marker>
              );

            })}

            {paths.ME && (
              <Polyline positions={paths.ME} color="cyan" />
            )}

            {tourists.ME && (
              <Recenter position={[tourists.ME.lat, tourists.ME.lng]} />
            )}

          </MapContainer>

        </div>

      </div>

      {/* TOURIST TABLE */}
      <div className="col-span-3 bg-blue-900/60 backdrop-blur-xl rounded-3xl p-6 border border-blue-700 shadow-2xl">

        <h3 className="text-xl font-semibold text-blue-200 mb-4">
          Tourist Locations
        </h3>

        <table className="w-full text-sm">

          <thead className="text-blue-300 border-b border-blue-700">
            <tr>
              <th className="text-left p-2">ID</th>
              <th className="text-left p-2">Lat</th>
              <th className="text-left p-2">Lng</th>
            </tr>
          </thead>

          <tbody>
            {Object.keys(tourists).map(id => {

              const t = tourists[id];

              return (
                <tr key={id} className="border-b border-blue-800">
                  <td className="p-2">{id === "ME" ? "You" : id}</td>
                  <td className="p-2">{t?.lat?.toFixed(5)}</td>
                  <td className="p-2">{t?.lng?.toFixed(5)}</td>
                </tr>
              );

            })}
          </tbody>

        </table>

      </div>

    </div>

  </div>
);
}