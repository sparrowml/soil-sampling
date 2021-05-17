import logo from './logo.svg';
import { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [response, setResponse] = useState("Waiting...");

  useEffect(() => {
    fetch('http://localhost:9000/', {
      mode: 'cors',
    })
      .then(resp => resp.text())
      .then(setResponse);
  }, [setResponse]);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save.
        </p>
        <a
          className="App-link"
          href="http://localhost:9000/"
          target="_blank"
          rel="noopener noreferrer"
        >
          {response}
        </a>
      </header>
    </div>
  );
}

export default App;
