import useTourists from "../hooks/useTourists";

export default function TouristTable({ tourists }) {// fetch all tourists automatically

  return (
    <div className="col-span-3 bg-blue-900/60 backdrop-blur-xl rounded-3xl p-6 border border-blue-700 shadow-2xl">
      <h3 className="text-xl font-semibold text-blue-200 mb-4">
        Tourist Locations
      </h3>

      <table className="w-full text-sm">
        <thead className="text-blue-300 border-b border-blue-700">
          <tr>
            <th className="text-left p-2">ID</th>
            <th className="text-left p-2">Lat</th>
            <th className="text-left p-2">Lng</th>
          </tr>
        </thead>

        <tbody>
          {Object.keys(tourists).map((id) => {
            const t = tourists[id];
            if (!t) return null;

            return (
              <tr key={id} className="border-b border-blue-800">
                <td className="p-2">{id === "ME" ? "You" : id}</td>
                <td className="p-2">{t.lat?.toFixed(5)}</td>
                <td className="p-2">{t.lng?.toFixed(5)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}