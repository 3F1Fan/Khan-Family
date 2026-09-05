import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { SCRIPT } from './prosperityScript'
import { version } from '../../package.json'

export default function ProsperityScript({ navigate }) {
  // Flatten every spoken line into one ordered list for playback + highlighting.
  const lines = useMemo(() => {
    const out = []
    SCRIPT.sections.forEach((s, si) => s.lines.forEach((text, li) => out.push({ si, li, text })))
    return out
  }, [])

  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window
  const [status, setStatus] = useState('idle') // idle | playing | paused
  const [current, setCurrent] = useState(-1)
  const [rate, setRate] = useState(1)
  const runRef = useRef(0)

  const stop = useCallback(() => {
    runRef.current += 1
    if (supported) window.speechSynthesis.cancel()
    setStatus('idle')
    setCurrent(-1)
  }, [supported])

  const playFrom = useCallback(
    (start) => {
      if (!supported) return
      window.speechSynthesis.cancel()
      const run = ++runRef.current
      setStatus('playing')
      let i = start
      const step = () => {
        if (run !== runRef.current) return
        if (i >= lines.length) {
          setStatus('idle')
          setCurrent(-1)
          return
        }
        setCurrent(i)
        const u = new SpeechSynthesisUtterance(lines[i].text)
        u.rate = rate
        u.onend = () => {
          if (run !== runRef.current) return
          i += 1
          step()
        }
        u.onerror = () => {
          if (run !== runRef.current) return
          i += 1
          step()
        }
        window.speechSynthesis.speak(u)
      }
      step()
    },
    [supported, lines, rate],
  )

  const onMainButton = () => {
    if (status === 'idle') playFrom(0)
    else if (status === 'playing') {
      window.speechSynthesis.pause()
      setStatus('paused')
    } else {
      window.speechSynthesis.resume()
      setStatus('playing')
    }
  }

  const changeRate = (r) => {
    setRate(r)
    if (status !== 'idle') playFrom(current < 0 ? 0 : current) // restart current line at new speed
  }

  // Stop speech if the user leaves the page.
  useEffect(() => () => { if (supported) window.speechSynthesis.cancel() }, [supported])

  return (
    <div className="ps">
      <button className="ps-home" onClick={() => navigate('/')}>
        ‹ Apps
      </button>

      <header className="ps-top">
        <h1 className="ps-title">{SCRIPT.title}</h1>
        <p className="ps-sub">{SCRIPT.subtitle}</p>
      </header>

      {supported ? (
        <div className="ps-bar">
          <button className="ps-play" onClick={onMainButton}>
            {status === 'idle' ? '▶ Read aloud' : status === 'playing' ? '⏸ Pause' : '▶ Resume'}
          </button>
          <button className="ps-stop" onClick={stop} disabled={status === 'idle'}>
            ⏹ Stop
          </button>
          <div className="ps-speed">
            {[0.8, 1, 1.2].map((r) => (
              <button
                key={r}
                className={'ps-rate' + (rate === r ? ' on' : '')}
                onClick={() => changeRate(r)}
              >
                {r}×
              </button>
            ))}
          </div>
        </div>
      ) : (
        <p className="ps-note">Read-aloud isn’t supported in this browser — the script is below to read.</p>
      )}

      <div className="ps-script">
        {SCRIPT.sections.map((s, si) => (
          <section className="ps-section" key={si}>
            <p className="ps-cue">{s.cue}</p>
            {s.lines.map((text, li) => {
              const idx = lines.findIndex((l) => l.si === si && l.li === li)
              const on = idx === current
              return (
                <p
                  key={li}
                  className={'ps-line' + (on ? ' on' : '')}
                  onClick={() => playFrom(idx)}
                  title="Click to read aloud from here"
                >
                  {text}
                </p>
              )
            })}
          </section>
        ))}
      </div>

      {SCRIPT.disclaimer && <p className="ps-disclaimer">⚠️ {SCRIPT.disclaimer}</p>}

      <span className="ps-version">v{version}</span>
    </div>
  )
}
