import { BrowserRouter, Routes, Route } from "react-router-dom";
import PhonemePopper from "./games/PhonemePopper";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import GalaxyMap from "./pages/GalaxyMap";
import Landing from "./pages/Landing";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/map" element={<GalaxyMap />} />
        <Route path="/game/:level" element={<PhonemePopper />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;