import Dropdown from "./components/Dropdown/Dropdown";
import "./App.css";

import { Login } from "./pages";
import { Route, Routes } from "react-router-dom";
import { AuthContext } from "./context";
import Protected from "./hocs/protected/Protected";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { isEmpty } from "lodash";

function App() {
  // dummy data sent to select components
  const { lostAuth, user } = useSelector(rState => rState.userSlice)
  const contextVal = isEmpty(user) ? JSON.parse(sessionStorage.getItem('userData')) : user
  const [context, setContext] = useState(contextVal);
  useEffect(()=>{
    if(lostAuth){
        setContext({})
    }
  }, [lostAuth])

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
