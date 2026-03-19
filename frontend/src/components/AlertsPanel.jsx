export default function AlertsPanel({ alertMessages }) {

  return (
    <div className="bg-red-900/40 backdrop-blur-xl rounded-3xl p-6 border border-red-700 shadow-2xl max-h-64 overflow-y-auto">

      <h3 className="text-red-300 font-semibold mb-3">
        Live Alerts
      </h3>

      {alertMessages.length === 0 ? (
        <p className="text-red-200 text-sm">No alerts</p>
      ) : (
        alertMessages.map((a, i) => (
          <p key={i} className="text-red-200 text-sm mb-1">
            ⚠ {a}
          </p>
        ))
      )}

    </div>
  );

}