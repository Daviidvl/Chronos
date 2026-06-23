import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout }    from './AppLayout'
import LoginPage        from '../app/login/page'
import HojePage         from '../app/(app)/hoje/page'
import HabitosPage      from '../app/(app)/habitos/page'
import EstudosPage      from '../app/(app)/estudos/page'
import RotinaPage       from '../app/(app)/rotina/page'
import ConfigPage       from '../app/(app)/configuracoes/page'

// BASE_URL is '/' in dev and '/Chronos/' in production (set by vite.config.ts)
const base = import.meta.env.BASE_URL.replace(/\/$/, '') // '/Chronos' or ''

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: <AppLayout />,
    children: [
      { path: '/',              element: <Navigate to="/hoje" replace /> },
      { path: '/hoje',          element: <HojePage /> },
      { path: '/habitos',       element: <HabitosPage /> },
      { path: '/estudos',       element: <EstudosPage /> },
      { path: '/rotina',        element: <RotinaPage /> },
      { path: '/configuracoes', element: <ConfigPage /> },
      { path: '*',              element: <Navigate to="/hoje" replace /> },
    ],
  },
], { basename: base || '/' })
