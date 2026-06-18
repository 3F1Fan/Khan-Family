import './App.css'
import { version } from '../package.json'

export default function App() {
  return (
    <main className="app">
      <img
        className="crest"
        src="https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg"
        alt="Liverpool FC crest"
      />
      <span className="version">v{version}</span>
    </main>
  )
}
