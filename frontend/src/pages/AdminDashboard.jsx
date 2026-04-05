import React, { useState, useEffect, useMemo } from "react";
import { ToastContainer, toast } from "react-toastify";
import RegisterTourist from "../components/RegisterTourist";

import Header from "../components/Header";
import ControlPanel from "../components/ControlPanel";
import WeatherCard from "../components/WeatherCard";
import AlertsPanel from "../components/AlertsPanel";
import MapView from "../components/MapView";
import TouristTable from "../components/TouristTable";

import useLiveLocation from "../hooks/useLiveLocation";
import useZones from "../hooks/useZones";
import useWeather from "../hooks/useWeather";
import useAlerts from "../hooks/useAlerts";
import useRealTimeLocation from "../hooks/useRealTimeLocation";

import "react-toastify/dist/ReactToastify.css";
import "leaflet/dist/leaflet.css";

const backendURL = "http://127.0.0.1:8000";

export default function AdminDashboard() {
  const [tourists, setTourists] = useState({
    T1: { lat: 19.34543, lng: 72.80580 },
    T3: { lat: 18.75400, lng: 73.40630 },
    T2: { lat: 18.75070, lng: 73.37760 },
  });
  const [zones, setZones] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [weather, setWeather] = useState(null);
  const [paths, setPaths] = useState({});
  const [alertMessages, setAlertMessages] = useState([]);

  // ---- Real-time locations of all registered devices ----
  useRealTimeLocation(tourists, setTourists);

  const handleNewTourist = (tourist) => {
    // Add tourist to state immediately
    setTourists((prev) => ({
      ...prev,
      [tourist.tourist_id]: { lat: tourist.lat, lng: tourist.lng },
    }));

    // Register tourist in backend
    fetch(`${backendURL}/real-tourists/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
     body: JSON.stringify({
 name: tourist.name
}),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "registered") {
          toast.success(`Device registered: ${tourist.tourist_id}`);
        } else {
          toast.error("Failed to register device");
        }
      })
      .catch((err) => {
        console.error("Register error:", err);
        toast.error("Server error while registering device");
      });
  };

  useLiveLocation(setTourists, setPaths);
  useZones(setZones);
  useWeather(tourists, setWeather);
  useAlerts(setAlerts, setAlertMessages);

  const getRiskPriority = (touristId) => {
    if (!alerts || !alerts[touristId]) return 3;
    const tAlerts = alerts[touristId];
    if (!Array.isArray(tAlerts)) return 3;
    if (tAlerts.some((a) => a.risk === "RED")) return 1;
    if (tAlerts.some((a) => a.risk === "YELLOW")) return 2;
    return 3;
  };

  /*sorting*/
  const sortedTourists = useMemo(() => {
    if (!tourists || Object.keys(tourists).length === 0) return {};
    return Object.entries(tourists)
      .sort((a, b) => getRiskPriority(a[0]) - getRiskPriority(b[0]))
      .reduce((acc, [id, data]) => {
        acc[id] = data;
        return acc;
      }, {});
  }, [tourists, alerts]);

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-950 via-blue-900 to-blue-800 text-white p-6">
      <ToastContainer />
      <Header />

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-3 flex flex-col gap-6">
          <ControlPanel tourists={tourists} zones={zones} />
          <WeatherCard weather={weather} />
          <AlertsPanel alertMessages={alertMessages} />
        </div>

        <div className="col-span-6 flex flex-col gap-6">
          <MapView tourists={tourists} zones={zones} paths={paths} alerts={alerts} />
          <RegisterTourist onNewTourist={handleNewTourist} />
        </div>

        <TouristTable tourists={sortedTourists} />
      </div>
    </div>
  );
}