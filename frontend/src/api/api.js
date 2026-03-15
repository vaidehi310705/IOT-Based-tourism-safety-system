const BASE_URL = "http://127.0.0.1:8000";

export const getTourists = async () => {
  const res = await fetch(`${BASE_URL}/locations`);
  return res.json();
};

export const getAlerts = async () => {
  const res = await fetch(`${BASE_URL}/alerts`);
  return res.json();
};

export const getZones = async () => {
  const res = await fetch(`${BASE_URL}/zones`);
  return res.json();
};