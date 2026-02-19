import React, { useState } from "react";

export default function TestConnection() {
  const [message, setMessage] = useState("");

  const checkBackend = async () => {
    try {
      const res = await fetch("http://localhost:8000/test");
      const data = await res.json();
      setMessage(data.message);
    } catch (err) {
      console.error(err);
      setMessage("Failed to connect to backend");
    }
  };

  return (
    <div>
      <h2>Backend Connection Test</h2>
      <button onClick={checkBackend}>Check Connection</button>
      <p>{message}</p>
    </div>
  );
}
