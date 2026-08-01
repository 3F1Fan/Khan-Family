import { useState, useEffect, useCallback } from 'react'
import './App.css'
import Home from './Home'
import { APPS } from './apps/registry'

const ROUTES = Object.fromEntries(APPS.map((a) => ['/' + a.slug, a.component]))

export default function App() {
  const [path, setPath] = useState(window.location.pathname)

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const navigate = useCallback((to) => {
    if (to === window.location.pathname) return
    window.history.pushState({}, '', to)
    setPath(to)
    window.scrollTo(0, 0)
  }, [])

  const Screen = ROUTES[path]
  return Screen ? <Screen navigate={navigate} /> : <Home navigate={navigate} />
}
