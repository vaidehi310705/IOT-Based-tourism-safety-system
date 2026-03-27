const BASE_URL = "http://127.0.0.1:8000";

export const getTourists = async () => {
  try {
    const res = await fetch(`${BASE_URL}/api/locations/locations`); // ✅ fixed
    if (!res.ok) throw new Error("API failed");
    return await res.json();
  } catch (err) {
    console.error("Error fetching tourists:", err);
    return {};
  }
};

export const getAlerts = async () => {
  try {
    const res = await fetch(`${BASE_URL}/api/alerts/alerts`); // ✅ fixed
    if (!res.ok) throw new Error("API failed");
    return await res.json();
  } catch (err) {
    console.error("Error fetching alerts:", err);
    return {};
  }
};

export const getZones = async () => {
  try {
    const res = await fetch(`${BASE_URL}/api/locations/zones`); // ✅ fixed
    if (!res.ok) throw new Error("API failed");
    const data = await res.json();
    return Array.isArray(data) ? data : Object.values(data); // ✅ always returns array
  } catch (err) {
    console.error("Error fetching zones:", err);
    return []; // ✅ return empty array not {}
  }
};

export const updateLocation = async (tourist_id, lat, lng) => {
  try {
    const res = await fetch(`${BASE_URL}/api/locations/update_location`, { // ✅ fixed
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tourist_id, lat, lng })
    });
    if (!res.ok) throw new Error("API failed");
    return await res.json();
  } catch (err) {
    console.error("Error updating location:", err);
  }
};

export const getPriorityTourists = async () => {
  try {
    const res = await fetch(`${BASE_URL}/api/locations/priority-tourists`); // ✅ fixed
    if (!res.ok) throw new Error("API failed");
    return await res.json();
  } catch (err) {
    console.error("Error fetching priority tourists:", err);
    return [];
  }
};

export const registerTourist = async (name, phone, emergency_contact, destination) => {
  try {
    const res = await fetch(`${BASE_URL}/api/auth/register`, { // ✅ registration endpoint
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone, emergency_contact, destination })
    });
    if (!res.ok) throw new Error("Registration failed");
    return await res.json();
  } catch (err) {
    console.error("Error registering tourist:", err);
    return null;
  }
};