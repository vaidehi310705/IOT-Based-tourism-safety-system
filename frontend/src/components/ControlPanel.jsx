export default function ControlPanel({ tourists, zones }) {

  return (
    <div className="bg-blue-900/60 backdrop-blur-xl rounded-3xl p-6 border border-blue-700 shadow-2xl">

      <h2 className="text-xl font-bold text-blue-200 mb-4">
        Control Panel
      </h2>

      <div className="bg-blue-800/50 rounded-xl p-4 mb-3">
        <p className="text-sm text-blue-300">Active Tourists</p>
        <p className="text-2xl font-bold">
          {Object.keys(tourists).length}
        </p>
      </div>

      <div className="bg-blue-800/50 rounded-xl p-4 mb-3">
        <p className="text-sm text-blue-300">Danger Zones</p>
        <p className="text-2xl font-bold">{zones.length}</p>
      </div>

      <div className="bg-blue-800/50 rounded-xl p-4">
        <p className="text-sm text-blue-300">System Status</p>
        <p className="text-green-400 font-semibold">
          Monitoring Active
        </p>
      </div>

    </div>
  );

}