const backendURL = "https://atresic-irving-steelless.ngrok-free.dev";

export async function fetchZones() {

  const res = await fetch(`${backendURL}/zones`);

  if (!res.ok) {
    throw new Error("Failed to fetch zones");
  }

  const data = await res.json();

  return data.map(z => ({
    ...z,
    lat: Number(z.lat),
    lng: Number(z.lng),
    radius: Number(z.radius)
  }));

}