import React, { useState } from "react";

const backendURL = "http://192.168.0.105:8000/real-tourists";

export default function RegisterTourist({ onNewTourist }) {

  const [name, setName] = useState("");
  const [deviceId, setDeviceId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (!name.trim()) {

      alert("Please enter tourist name");

      return;

    }

    try {

      setLoading(true);

      const res = await fetch(
        `${backendURL}/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ name })
        }
      );

      if (!res.ok) {

        alert("Registration failed");

        return;

      }

      const data = await res.json();

      setDeviceId(data.device_id);

      // 🔹 Notify AdminDashboard immediately
      if (onNewTourist) {

        onNewTourist({
          tourist_id: data.device_id,
          name: name,
          lat: null,
          lng: null
        });

      }

      setName("");

    } catch (err) {

      console.error("Registration error:", err);

      alert("Server error during registration");

    } finally {

      setLoading(false);

    }

  };

  return (

    <div className="bg-blue-900 p-4 rounded-xl shadow-lg">

      <h2 className="text-lg font-bold mb-2">
        Register Tourist Device
      </h2>

      <form onSubmit={handleSubmit}>

        <input
          placeholder="Tourist Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="p-2 rounded text-black mr-2"
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 px-4 py-2 rounded"
        >
          {loading ? "Registering..." : "Register"}
        </button>

      </form>

      {deviceId && (

        <p className="mt-3">

          Device ID generated:

          <b className="ml-2 text-yellow-300">
            {deviceId}
          </b>

          <br />

          Share this ID with the tourist 📱

        </p>

      )}

    </div>

  );

}