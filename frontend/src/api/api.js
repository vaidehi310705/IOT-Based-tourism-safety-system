const BASE_URL = "http://127.0.0.1:8000";

export const getTourists = async () => {
  try {
    const res = await fetch(`${BASE_URL}/locations`);
    return await res.json();
  } catch (err) {
    console.error("Error fetching tourists:", err);
    return {};
  }
};

export const getAlerts = async () => {
  try {
    const res = await fetch(`${BASE_URL}/alerts`);
    return await res.json();
  } catch (err) {
    console.error("Error fetching alerts:", err);
    return {};
  }
};

export const getZones = async () => {
  try {
    const res = await fetch(`${BASE_URL}/zones`);
    return await res.json();
  } catch (err) {
    console.error("Error fetching zones:", err);
    return {};
  }
};

if (!res.ok) throw new Error("API failed");

export const getPriorityTourists = async () => {
  const res = await fetch("http://127.0.0.1:8000/priority-tourists");
  return res.json();
};