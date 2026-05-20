import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="app">
      <header className="app-header">
        <a href="https://vite.dev" target="_blank" rel="noreferrer">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank" rel="noreferrer">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
        <h1>Braahmi Academy — Static UI</h1>
        <p>Edit <code>src/App.jsx</code> and save to test hot reload.</p>
        <button type="button" onClick={() => setCount((c) => c + 1)}>
          Count is {count}
        </button>
      </header>
    </div>
  )
}

export default App
