import logo from './logo.svg';
import {useState} from 'react'
import './App.css';
import axios from 'axios'

function App() {
  const [number, setNumber] = useState(0)  
  const onClick=()=>{
    axios.post('http://65.0.204.124:8000/api/create/user', {}).then(res=>{
        axios.get('http://65.0.204.124:8000/api/get/user').then(val=>{
            setNumber(JSON.stringify(val.data))
        })
    })
  }
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React {number}
        </a>
        
      <button style={{height:20, width:230}} onClick={onClick}>generateNumber</button>
        
      </header>
    </div>
  );
}

export default App;
