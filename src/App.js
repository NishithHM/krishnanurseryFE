import './App.css';
import { Alert, Button, Footer, Header, Input, LandingTile } from './components';
import access from "./assets/images/access.png";
import { Login } from './pages';
import { Route, Routes } from "react-router-dom";

function App() {

  return (
    <div className="App">
       {/* <div><Header/></div> */}

       {/* <Login/> */}
      {/* <div style={{height:300,width:400, margin:"15px"}}>
        <LandingTile image={access} title="Access Management" isDisabled={false}/>
      </div>
      <div style={{ width:300, margin:"15px"}}>
        <Input title="User Name" required={false} id="name" errorMessage="Invalid Input"/>
      </div>
      <div style={{ width:300, margin:"15px"}}>
        <Button type="primary" title="Login"/>
      </div>
      <div style={{height:250, width:600, margin:"15px"}}>
        <Alert/>
      </div> */}
      <div>
        {/* <Footer/> */}

        <Routes>
        <Route path="/" exact element={<Login />} />
        
      </Routes>
      </div>
    </div>
  );
}

export default App;
