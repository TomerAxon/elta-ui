import React from 'react';
import './App.css';
import Panel from './components/Panel';

function App() {
  return (
    <div className="App">
      <Panel id="panel-1" title="Panel 1" initialPosition={{ x: 50, y: 50 }} />
      <Panel id="panel-2" title="Panel 2" initialPosition={{ x: 500, y: 100 }} />
      <Panel id="panel-3" title="Panel 3" initialPosition={{ x: 250, y: 400 }} />
    </div>
  );
}

export default App;
