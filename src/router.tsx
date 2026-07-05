import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout }  from './AppLayout'
import LoginPage      from '../app/login/page'
import EstudosPage    from '../app/(app)/estudos/page'
import WidgetPage     from '../app/widget/page'

const base = import.meta.env.BASE_URL.replace(/\/$/, '')

export const router = createBrowserRouter([
  { path: '/login',  element: <LoginPage /> },
  { path: '/widget', element: <WidgetPage /> },
  {
    element: <AppLayout />,
    children: [
      { path: '/',        element: <Navigate to="/estudos" replace /> },
      { path: '/estudos', element: <EstudosPage /> },
      { path: '*',        element: <Navigate to="/estudos" replace /> },
    ],
  },
], { basename: base || '/' })
