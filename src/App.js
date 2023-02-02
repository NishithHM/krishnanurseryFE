import './App.css';
import { Input, LandingTile } from './components';
import access from "./assets/images/access.png";

function App() {

  return (
    <div className="App">
      <div style={{height:300,width:400, margin:"15px"}}>
        <LandingTile image={access} title="Access Management" isDisabled={false}/>
      </div>
      <div style={{height:20, width:300, margin:"15px"}}>
        <Input title="User Name" required={false} id="name"/>
      </div>
    </div>
  );
}

export default App;
