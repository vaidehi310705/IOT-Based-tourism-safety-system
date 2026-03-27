import { useEffect } from "react";
import { toast } from "react-toastify";

const backendURL = "http://127.0.0.1:8000";

let shownAlerts = new Set();

export default function useAlerts(setAlerts, setAlertMessages) {

  useEffect(() => {

    const fetchAlerts = async () => {
      try {
        const res = await fetch(`${backendURL}/api/alerts/alerts`); // ✅ only this changed
        const data = await res.json();

        setAlerts(data);

        const allMessages = [];

        Object.keys(data).forEach(id => {
          data[id].forEach(a => {

            const name = id === "ME" ? "You" : id;
            const message = `${name} entered ${a.risk} zone`;
            const alertKey = `${id}-${a.zone}`;

            allMessages.push(message);

            if (!shownAlerts.has(alertKey)) {
              shownAlerts.add(alertKey);
              toast.error(message, {
                position: "top-right",
                autoClose: 3000,
              });
            }
          });
        });

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