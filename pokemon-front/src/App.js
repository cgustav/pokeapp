import "./App.css";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useNavigate,
} from "react-router-dom";

import PokemonBattle from "./screens/PokemonBattle";
import PokemonInitialScreen from "./screens/Initial";
import PokemonCreateAccountScreen from "./screens/CreateAccount";
import PokemonSelectionScreen from "./screens/PokemonSelection";
import BattleHistory from "./screens/BattleHistory";

function App() {
  return (
    // <div className="w-full h-screen">
    //   <InitialScreen />
    //   {/* <PokemonBattle /> */}
    // </div>

    <Router>
      <Routes>
        <Route path="/" element={<PokemonInitialScreen />} />
        <Route path="/signup" element={<PokemonCreateAccountScreen />} />
        <Route path="/select-pokemon" element={<PokemonSelectionScreen />} />
        {/* <Route path="/battle" element={<PokemonBattle />} /> */}
        <Route path="/battle/:playerPokemonId" element={<PokemonBattle />} />
        <Route path="/battle-history" element={<BattleHistory />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
