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

  const prevStateRef = useRef({});
  const alarmRef = useRef(null);
  const audioCtxRef = useRef(null);

  // AUDIO INITIALIZER
  useEffect(() => {

    const initAudio = async () => {

      audioCtxRef.current =
        new (window.AudioContext || window.webkitAudioContext)();

      if (audioCtxRef.current.state === "suspended") {
        await audioCtxRef.current.resume();
      }

      fetch("/alert.mp3")
        .then(res => res.arrayBuffer())
        .then(data =>
          audioCtxRef.current.decodeAudioData(data)
        )
        .then(buffer => {

          alarmRef.current = () => {

            const source =
              audioCtxRef.current.createBufferSource();

            source.buffer = buffer;
            source.connect(audioCtxRef.current.destination);
            source.start();

          };

        });

    };

    window.addEventListener("click", initAudio, { once: true });

    return () =>
      window.removeEventListener("click", initAudio);

  }, []);


  // RED-ZONE ENTER DETECTION
  useEffect(() => {

    if (!tourists || !zones || !alarmRef.current) return;

    Object.keys(tourists).forEach(id => {

      const t = tourists[id];

      if (!t || t.lat === null || t.lng === null) return;

      zones.forEach(zone => {

        if (zone.risk !== "RED") return;

        const distance = Math.sqrt(
          Math.pow(t.lat - zone.lat, 2) +
          Math.pow(t.lng - zone.lng, 2)
        );

        const radiusDeg = zone.radius / 111000;

        const isInside = distance <= radiusDeg;

        const key = id + zone.name;

        const wasInside =
          prevStateRef.current[key] || false;

        if (isInside && !wasInside) {

          alarmRef.current();

        }

        prevStateRef.current[key] = isInside;

      });

    });

  }, [tourists, zones]);


  // FILTER VALID TOURISTS ONLY
  const validTourists = Object.keys(tourists).filter(id => {

    const t = tourists[id];

    return (
      t &&
      t.lat !== null &&
      t.lng !== null &&
      !isNaN(t.lat) &&
      !isNaN(t.lng)
    );

  });


  // DEFAULT MAP CENTER (Virar fallback)
  const initialCenter =
    validTourists.length > 0
      ? [
          tourists[validTourists[0]].lat,
          tourists[validTourists[0]].lng
        ]
      : [19.455, 72.811];


  return (

    <div className="col-span-20 h-122.5 bg-blue-900/50 backdrop-blur-xl rounded-3xl p-4 border border-blue-700 shadow-2xl">

      <div className="h-full w-full rounded-xl overflow-hidden">

        <MapContainer
          center={initialCenter}
          zoom={17}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={true}
        >

          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />


          {/* ZONES */}

          {zones.map((zone, i) => (

            <Circle
              key={i}
              center={[zone.lat, zone.lng]}
              radius={zone.radius}
              pathOptions={{
                color:
                  zone.risk === "RED"
                    ? "#ef4444"
                    : "#facc15",
                fillOpacity: 0.25
              }}
            />

          ))}


          {/* TOURISTS */}

          {validTourists.map(id => {

            const t = tourists[id];

            return (

              <Marker
                key={id}
                position={[t.lat, t.lng]}
              >

                <Popup>

                  <div>

                    <strong>{id}</strong>

                    {alerts &&
                      alerts[id] && (

                        <div
                          style={{
                            color: "red",
                            marginTop: "5px"
                          }}
                        >

                          ⚠ {alerts[id]
                            .map(a => a.zone)
                            .join(", ")}

                        </div>

                      )}

                  </div>

                </Popup>

              </Marker>

            );

          })}


          {/* PATH */}

          {paths?.ME && (

            <Polyline
              positions={paths.ME}
              color="cyan"
            />

          )}

        </MapContainer>

      </div>

    </div>

  );

}