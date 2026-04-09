import { BrowserRouter, Routes, Route } from "react-router-dom";
import PhonemePopper from "./games/PhonemePopper";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PhonemePopper />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;