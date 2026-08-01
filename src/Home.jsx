import { APPS } from './apps/registry'
import { version } from '../package.json'

export default function Home({ navigate }) {
  return (
    <div className="home">
      <header className="home-top">
        <h1>Khan Family</h1>
        <p>Our little collection of apps</p>
      </header>

      <div className="tiles">
        {APPS.map((app) => (
          <button
            key={app.slug}
            className="tile"
            style={{ '--accent': app.accent }}
            onClick={() => navigate('/' + app.slug)}
          >
            <span className="tile-emoji">{app.emoji}</span>
            <span className="tile-title">{app.title}</span>
            <span className="tile-tag">{app.tagline}</span>
          </button>
        ))}

        <div className="tile tile-soon" aria-hidden="true">
          <span className="tile-emoji">＋</span>
          <span className="tile-title">More soon</span>
        </div>
      </div>

      <span className="home-version">v{version}</span>
    </div>
  )
}
