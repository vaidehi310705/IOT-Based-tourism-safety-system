const API_KEY = "221dc25f6d9608b3ced89b02141ebef3";

export async function fetchWeather(lat, lng) {
  if (!lat || !lng) return null;

  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${API_KEY}&units=metric`
  );

  if (!res.ok) {
    throw new Error("Weather fetch failed");
  }

  const data = await res.json();

  return {
    temp: Math.round(data.main.temp),
    condition: data.weather[0].main,
    humidity: data.main.humidity,
  };
}