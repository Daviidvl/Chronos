import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout }    from './AppLayout'
import LoginPage        from '../app/login/page'
import InicioPage       from '../app/(app)/inicio/page'

const base = import.meta.env.BASE_URL.replace(/\/$/, '')

export const router = createBrowserRouter([
  { path: '/login',  element: <LoginPage /> },
  {
    element: <AppLayout />,
    children: [
      { path: '/',  element: <InicioPage /> },
      { path: '*',  element: <Navigate to="/" replace /> },
    ],
  },
], { basename: base || '/' })
