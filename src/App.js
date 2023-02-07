import Dropdown from "./components/Dropdown/Dropdown";
import "./App.css";

import { Login, Test, Employee } from "./pages";
import { Route, Routes } from "react-router-dom";
import { AuthContext } from "./context";
import Protected from "./hocs/protected/Protected";
import { useState } from "react";

function App() {
  // dummy data sent to select components
  const [context, setContext] = useState({});
  return (
    <div className="App">
      <AuthContext.Provider value={[context, setContext]}>
        <Routes>
          <Route path="/" exact element={<Login />} />
          <Route path="/authorised/*" element={<Protected />} />
        </Routes>
      </AuthContext.Provider>
    </div>
  );
}

export default App;
