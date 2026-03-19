import { useEffect } from "react";

const API_KEY = "221dc25f6d9608b3ced89b02141ebef3";

export default function useWeather(tourists, setWeather) {
  useEffect(() => {
    const lat = tourists.ME?.lat;
    const lng = tourists.ME?.lng;

    if (!lat || !lng) return;

    const fetchWeather = async () => {
      try {
        console.log("Fetching weather for:", lat, lng);

        // 🌦️ Weather API
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${API_KEY}&units=metric`
        );

        if (!res.ok) throw new Error("Weather fetch failed");

        const data = await res.json();

        console.log("Coords:", lat, lng);
        console.log("API location:", data.name);

        // 📍 Reverse Geocoding (NEW)
        const geoRes = await fetch(
          `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lng}&limit=1&appid=${API_KEY}`
        );

        const geoData = await geoRes.json();

        const placeName = geoData[0]?.name || data.name;

        console.log("Better location:", placeName);

        // ✅ Final Weather State
        setWeather({
          temp: Math.round(data.main.temp),
          condition: data.weather[0].main,
          humidity: data.main.humidity,
          name: placeName, // ✅ fixed
        });

      } catch (err) {
        console.error("Weather fetch error:", err);
      }
    };

    fetchWeather();

    const interval = setInterval(fetchWeather, 5 * 60 * 1000);

    return () => clearInterval(interval);

  }, [tourists.ME?.lat, tourists.ME?.lng, setWeather]);
}