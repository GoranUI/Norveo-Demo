import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './theme.css'
import App from './App'
import { UILibrary } from './UILibrary'
import { Portal } from './Portal'
import { BackOffice } from './components/BackOffice/BackOffice'
import { Login } from './components/Login/Login'

/** Path-style URLs (e.g. /projects) keep pathname in the bar: /projects#/backoffice/projects */
function getInitialHash(): string {
  const path = window.location.pathname.replace(/\/$/, '') || '/'
  if (
    path !== '/' &&
    (path.startsWith('/projects') || path.startsWith('/companies'))
  ) {
    const inner = path.slice(1)
    const url = `${window.location.origin}${path}#/backoffice/${inner}`
    window.history.replaceState(null, '', url)
  }
  return window.location.hash
}

function isProtectedRoute(route: string): boolean {
  return route.startsWith('#/app') || route.startsWith('#/backoffice')
}

function isAuthed(): boolean {
  try {
    return localStorage.getItem('norveo-auth') === '1'
  } catch {
    return false
  }
}

export function Root() {
  const [route, setRoute] = useState(getInitialHash)

  useEffect(() => {
    const onHash = () => setRoute(window.location.hash);
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    if (isProtectedRoute(route) && !isAuthed()) {
      window.location.hash = '#/login'
    }
  }, [route])

  if (route === '#/login') {
    return <Login />;
  }

  if (isProtectedRoute(route) && !isAuthed()) {
    return <Login />;
  }

  if (route === '#/ui-library') {
    return <UILibrary />;
  }

  if (route.startsWith('#/backoffice')) {
    return <BackOffice />;
  }

  if (route.startsWith('#/app')) {
    const [pathPart, queryPart] = route.split('?');
    const parts = pathPart.split('/');
    const workspace = parts[2] || undefined;
    const initialProjectId = queryPart
      ? new URLSearchParams(queryPart).get('project') ?? undefined
      : undefined;
    /* `key` forces a remount when crossing the landing/workspace boundary so
       state can't leak from a previous in-app navigation. */
    return <App key={`${workspace || 'landing'}:${initialProjectId ?? ''}`} initialWorkspace={workspace} initialProjectId={initialProjectId} />;
  }

  return <Portal />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
