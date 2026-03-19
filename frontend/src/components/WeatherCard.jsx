export default function WeatherCard({ weather }) {
  return (
    <div className="bg-blue-900/60 backdrop-blur-xl rounded-3xl p-6 border border-blue-700 shadow-2xl">

      <h3 className="text-lg font-semibold text-blue-200 mb-3">
        Weather
      </h3>

      {weather ? (
        <>
          {/* Location Name */}
          {weather.name && (
            <p className="text-blue-300 text-sm mb-1">{weather.name}</p>
          )}

          <p className="text-3xl font-bold">{weather.temp}°C</p>
          <p className="text-blue-200">{weather.condition}</p>
          <p className="text-sm text-blue-400">
            Humidity: {weather.humidity}%
          </p>
        </>
      ) : (
        <p>Loading...</p>
      )}

    </div>
  );
}