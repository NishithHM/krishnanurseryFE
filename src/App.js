import './App.css';
import { Alert, Button, Input, LandingTile } from './components';
import access from "./assets/images/access.png";

function App() {

  return (
    <div className="App">
      <div style={{height:300,width:400, margin:"15px"}}>
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
      </div>
    </div>
  );
}

export default App;
