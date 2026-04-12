import { BrowserRouter, Routes, Route } from "react-router-dom";
import PhonemePopper from "./games/PhonemePopper";
import StarTracker from "./games/StarTracker";
import EchoWoods from "./games/EchoWoods";
import GlitchSpotter from "./games/GlitchSpotter";
import RapidRacer from "./games/RapidRacer";
import CVCExplorer from "./games/CVCExplorer";
import TypingQuest from "./games/TypingQuest";
import SyllableSlider from "./games/SyllableSlider";
import RhymeTrampoline from "./games/RhymeTrampoline";
import SoundBlender from "./games/SoundBlender";

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
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Games */}
        <Route path="/game/phoneme-popper/:level" element={<PhonemePopper />} />
        <Route path="/game/star-tracker" element={<StarTracker />} />
        <Route path="/game/echo-woods" element={<EchoWoods />} />
        <Route path="/game/glitch-spotter" element={<GlitchSpotter />} />
        <Route path="/game/rapid-racer" element={<RapidRacer />} />
        
        <Route path="/game/cvc-explorer" element={<CVCExplorer />} />
        <Route path="/game/typing-quest" element={<TypingQuest />} />
        <Route path="/game/syllable-slider" element={<SyllableSlider />} />
        <Route path="/game/rhyme-trampoline" element={<RhymeTrampoline />} />
        <Route path="/game/sound-blender" element={<SoundBlender />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;