import { useState, useEffect, useCallback } from 'react'
import { DECK } from '../questions'
import { version } from '../../package.json'

const STORE_KEY = 'talking-hearts-v1'

function shuffledOrder(n) {
  const a = Array.from({ length: n }, (_, i) => i)
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function loadSaved() {
  try {
    const s = JSON.parse(localStorage.getItem(STORE_KEY))
    if (s && Array.isArray(s.order) && s.order.length === DECK.length && Number.isInteger(s.pos)) {
      return s
    }
  } catch {
    /* ignore */
  }
  return null
}

export default function TalkingHearts({ navigate }) {
  const saved = loadSaved()
  const [order, setOrder] = useState(() => saved?.order ?? shuffledOrder(DECK.length))
  const [pos, setPos] = useState(() => saved?.pos ?? 0)

  useEffect(() => {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify({ order, pos }))
    } catch {
      /* ignore */
    }
  }, [order, pos])

  const total = DECK.length
  const next = useCallback(() => setPos((p) => Math.min(p + 1, total - 1)), [total])
  const prev = useCallback(() => setPos((p) => Math.max(p - 1, 0)), [])
  const reset = useCallback(() => {
    setOrder(shuffledOrder(total))
    setPos(0)
  }, [total])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') next()
      if (e.key === 'ArrowLeft') prev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [next, prev])

  const card = DECK[order[pos]]
  const atStart = pos === 0
  const atEnd = pos === total - 1

  return (
    <div className="th">
      <button className="th-home" onClick={() => navigate('/')}>
        ‹ Apps
      </button>

      <header className="th-top">
        <h1 className="th-title">Talking&nbsp;Hearts</h1>
        <p className="th-sub">{total} questions — deep, playful &amp; everything between</p>
      </header>

      <div className="th-card" key={pos}>
        <span className="th-cat">{card.category}</span>
        <p className="th-q">{card.q}</p>
        <span className="th-count">
          {pos + 1} <i>/ {total}</i>
        </span>
      </div>

      {atEnd && <p className="th-end">That’s the last card — shuffle to go again.</p>}

      <div className="th-controls">
        <button className="th-btn ghost" onClick={prev} disabled={atStart}>
          ‹ Back
        </button>
        <button className="th-btn primary" onClick={next} disabled={atEnd}>
          Next ›
        </button>
      </div>

      <button className="th-reset" onClick={reset}>
        ↺ Shuffle &amp; reset
      </button>

      <span className="th-version">v{version}</span>
    </div>
  )
}
