import { useEffect } from "react";
import { toast } from "react-toastify";

const backendURL = "https://atresic-irving-steelless.ngrok-free.dev";

let shownAlerts = new Set();

export default function useAlerts(setAlerts, setAlertMessages) {

  useEffect(() => {

    const fetchAlerts = async () => {
      try {
        const res = await fetch(`${backendURL}/alerts`);
        const data = await res.json();

        setAlerts(data);

        const allMessages = [];   // ✅ for UI

        Object.keys(data).forEach(id => {
          data[id].forEach(a => {

            const name = id === "ME" ? "You" : id;
            const message = `${name} entered ${a.risk} zone`;

            const alertKey = `${id}-${a.zone}`;

            // ✅ ALWAYS add to UI
            allMessages.push(message);

            // ✅ ONLY new → toast
            if (!shownAlerts.has(alertKey)) {
              shownAlerts.add(alertKey);

              toast.error(message, {
                position: "top-right",
                autoClose: 3000,
              });
            }

          });
        });

        // ✅ update UI with ALL alerts
        setAlertMessages(allMessages);

      } catch (err) {
        console.error(err);
      }
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 3000);

    return () => clearInterval(interval);

  }, [setAlerts, setAlertMessages]);
}