import AdminDashboard from "./pages/AdminDashboard";
import "./index.css";
import "leaflet/dist/leaflet.css";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

function App() {
  return (
  <>
  <AdminDashboard />
  <ToastContainer />
  </>
  );
}

export default App;