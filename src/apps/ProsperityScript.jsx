import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { SCRIPT } from './prosperityScript'
import { version } from '../../package.json'

const VOICE_KEY = 'prosperity-voice'
// Names that tend to mark higher-quality, more human-sounding voices.
const QUALITY = ['natural', 'neural', 'premium', 'enhanced', 'siri', 'google']

function scoreVoice(v) {
  const n = (v.name || '').toLowerCase()
  let s = 0
  QUALITY.forEach((k, i) => {
    if (n.includes(k)) s += (QUALITY.length - i) * 10
  })
  if (v.lang === 'en-ZA') s += 8
  else if (v.lang === 'en-GB') s += 5
  else if (v.lang === 'en-US') s += 4
  else if ((v.lang || '').startsWith('en')) s += 2
  if (!v.localService) s += 1
  return s
}

export default function ProsperityScript({ navigate }) {
  const lines = useMemo(() => {
    const out = []
    SCRIPT.sections.forEach((s, si) => s.lines.forEach((text, li) => out.push({ si, li, text })))
    return out
  }, [])

  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window
  const [status, setStatus] = useState('idle') // idle | playing | paused
  const [current, setCurrent] = useState(-1)
  const [rate, setRate] = useState(1)
  const [voices, setVoices] = useState([])
  const [voiceURI, setVoiceURI] = useState(null)
  const runRef = useRef(0)
  const rateRef = useRef(1)
  const voiceRef = useRef(null)
  rateRef.current = rate

  // Load and rank the English voices the device offers.
  useEffect(() => {
    if (!supported) return
    const load = () => {
      const all = window.speechSynthesis
        .getVoices()
        .filter((v) => (v.lang || '').toLowerCase().startsWith('en'))
        .sort((a, b) => scoreVoice(b) - scoreVoice(a))
      if (!all.length) return
      setVoices(all)
      let saved = null
      try {
        saved = localStorage.getItem(VOICE_KEY)
      } catch {
        /* ignore */
      }
      const pick = all.find((v) => v.voiceURI === saved) || all[0]
      setVoiceURI(pick.voiceURI)
      voiceRef.current = pick
    }
    load()
    window.speechSynthesis.onvoiceschanged = load
    return () => {
      window.speechSynthesis.onvoiceschanged = null
    }
  }, [supported])

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
        u.rate = rateRef.current
        u.pitch = 1
        if (voiceRef.current) {
          u.voice = voiceRef.current
          u.lang = voiceRef.current.lang
        }
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
    [supported, lines],
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
    if (status !== 'idle') playFrom(current < 0 ? 0 : current)
  }

  const changeVoice = (uri) => {
    setVoiceURI(uri)
    voiceRef.current = voices.find((v) => v.voiceURI === uri) || null
    try {
      localStorage.setItem(VOICE_KEY, uri)
    } catch {
      /* ignore */
    }
    if (status !== 'idle') playFrom(current < 0 ? 0 : current)
  }

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
          {voices.length > 0 && (
            <select
              className="ps-voice"
              value={voiceURI || ''}
              onChange={(e) => changeVoice(e.target.value)}
              title="Choose the most natural voice on your device"
            >
              {voices.map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          )}
        </div>
      ) : (
        <p className="ps-note">Read-aloud isn’t supported in this browser — the script is below to read.</p>
      )}

      {supported && (
        <p className="ps-tip">
          Tip: for the most human voice, pick one marked <b>Enhanced / Natural / Siri / Google</b> above.
          Those live on your device — iPhone &amp; Mac and recent Chrome have the best ones.
        </p>
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
