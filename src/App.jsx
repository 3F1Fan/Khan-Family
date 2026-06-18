import './App.css'
import { version } from '../package.json'

export default function App() {
  return (
    <main className="app">
      <section className="knee-section">
        <iframe
          className="knee-frame"
          src="/knee-programme.html"
          title="Knee Holding Programme"
        />
      </section>

      <section className="crest-section">
        <img
          className="crest"
          src="https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg"
          alt="Liverpool FC crest"
        />
      </section>

      <span className="version">v{version}</span>
    </main>
  )
}
