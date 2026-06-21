'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { useState } from 'react'
import {
  Home, Sun, Repeat2, CheckSquare, Calendar,
  Target, TrendingUp, BarChart2, Settings, PanelLeftClose, PanelLeftOpen
} from 'lucide-react'

const NAV = [
  {
    items: [
      { href: '/home',    icon: Home,        label: 'Home' },
      { href: '/hoje',    icon: Sun,         label: 'Hoje' },
    ],
  },
  {
    label: 'Organização',
    items: [
      { href: '/habitos', icon: Repeat2,     label: 'Hábitos' },
      { href: '/tarefas', icon: CheckSquare, label: 'Tarefas' },
      { href: '/agenda',  icon: Calendar,    label: 'Agenda' },
      { href: '/metas',   icon: Target,      label: 'Metas' },
    ],
  },
  {
    label: 'Análise',
    items: [
      { href: '/insights',  icon: TrendingUp, label: 'Insights' },
      { href: '/analytics', icon: BarChart2,  label: 'Analytics' },
    ],
  },
]

function NavLink({ href, icon: Icon, label, active, collapsed }: {
  href: string; icon: typeof Home; label: string; active: boolean; collapsed: boolean
}) {
  return (
    <Link href={href}>
      <div
        className="relative flex items-center gap-2.5 rounded-[10px] transition-colors duration-150"
        style={{
          padding: collapsed ? '9px 10px' : '8px 10px',
          justifyContent: collapsed ? 'center' : 'flex-start',
          background: active ? 'var(--surface-2)' : 'transparent',
          color: active ? 'var(--t1)' : 'var(--t3)',
        }}
        onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'; (e.currentTarget as HTMLElement).style.color = 'var(--t2)' }}
        onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--t3)' } }}
      >
        {active && (
          <motion.div
            layoutId="sidebar-pill"
            className="absolute inset-0 rounded-[10px]"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border-2)' }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
          />
        )}
        <Icon
          size={15}
          strokeWidth={active ? 2 : 1.6}
          className="relative z-10 flex-shrink-0"
          style={{ color: active ? 'var(--accent)' : 'inherit' }}
        />
        {!collapsed && (
          <span className="relative z-10 text-[13px] font-medium leading-none">{label}</span>
        )}
      </div>
    </Link>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className="hidden md:flex flex-col h-full flex-shrink-0 transition-all duration-300"
      style={{
        width: collapsed ? 52 : 'var(--sidebar-w)',
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center h-14 flex-shrink-0"
        style={{ padding: collapsed ? '0 14px' : '0 16px', borderBottom: '1px solid var(--border)' }}
      >
        {collapsed ? (
          <div className="w-6 h-6 rounded-[7px] flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
            style={{ background: 'var(--accent)' }}>C</div>
        ) : (
          <span className="text-[14px] font-semibold tracking-tight" style={{ color: 'var(--t1)', letterSpacing: '-0.2px' }}>
            Chronos
          </span>
        )}
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto py-3" style={{ padding: collapsed ? '12px 6px' : '12px 8px' }}>
        {NAV.map((section, si) => (
          <div key={si} className="mb-4">
            {section.label && !collapsed && (
              <p className="section-label px-2 mb-1.5">{section.label}</p>
            )}
            {!section.label && si > 0 && !collapsed && (
              <div className="divider mx-2 mb-3" />
            )}
            <div className="space-y-0.5">
              {section.items.map(item => (
                <NavLink
                  key={item.href}
                  {...item}
                  active={pathname === item.href || pathname.startsWith(item.href + '/')}
                  collapsed={collapsed}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ padding: collapsed ? '8px 6px' : '8px 8px', borderTop: '1px solid var(--border)' }}>
        <NavLink href="/configuracoes" icon={Settings} label="Configurações" active={pathname === '/configuracoes'} collapsed={collapsed} />
        <button
          onClick={() => setCollapsed(c => !c)}
          className="w-full flex items-center gap-2.5 rounded-[10px] mt-1 text-[var(--t3)] transition-colors hover:text-[var(--t2)] hover:bg-[var(--surface-2)]"
          style={{ padding: collapsed ? '9px 10px' : '8px 10px', justifyContent: collapsed ? 'center' : 'flex-start' }}
        >
          {collapsed ? <PanelLeftOpen size={15} strokeWidth={1.6} /> : <PanelLeftClose size={15} strokeWidth={1.6} />}
          {!collapsed && <span className="text-[13px] font-medium">Recolher</span>}
        </button>
      </div>
    </aside>
  )
}
