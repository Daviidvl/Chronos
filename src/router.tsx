import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout }    from './AppLayout'
import LoginPage        from '../app/login/page'
import WidgetPage       from '../app/widget/page'
import TimerPage        from '../app/(app)/timer/page'
import ProgressoPage    from '../app/(app)/progresso/page'
import MateriasPage     from '../app/(app)/materias/page'
import RevisoesPage     from '../app/(app)/revisoes/page'

const base = import.meta.env.BASE_URL.replace(/\/$/, '')

export const router = createBrowserRouter([
  { path: '/login',  element: <LoginPage /> },
  { path: '/widget', element: <WidgetPage /> },
  {
    element: <AppLayout />,
    children: [
      { path: '/',          element: <Navigate to="/timer" replace /> },
      { path: '/timer',     element: <TimerPage /> },
      { path: '/progresso', element: <ProgressoPage /> },
      { path: '/materias',  element: <MateriasPage /> },
      { path: '/revisoes',  element: <RevisoesPage /> },
      { path: '*',          element: <Navigate to="/timer" replace /> },
    ],
  },
], { basename: base || '/' })
