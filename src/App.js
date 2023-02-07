import Dropdown from "./components/Dropdown/Dropdown";
import "./App.css";

import { Login, Test, Employee } from "./pages";
import { Route, Routes } from "react-router-dom";

function App() {
  // dummy data sent to select components

  return (
    <div className="App">
      <Routes>
        <Route path="/" exact element={<Login />} />
        <Route path="/components" exact element={<Test />} />
        <Route path="/add-employee" exact element={<Employee />} />
      </Routes>
    </div>
  );
}

export default App;
