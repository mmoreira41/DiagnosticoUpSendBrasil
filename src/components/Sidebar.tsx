import React from 'react'
import { Eye, TrendingUp, Search, AlertTriangle, DollarSign } from 'lucide-react'
import { cn } from '../lib/utils'
import { useDiagnostico, SECOES } from '../contexts/DiagnosticoContext'
import upsendLogo from '../../upsend-flow-logo.webp'

export const SIDEBAR_WIDTH = 288
export const MOBILE_HEADER_HEIGHT = 56
export const MOBILE_BOTTOM_BAR_HEIGHT = 64

const SECOES_ICONS = {
  espelho:      Eye,
  mercado:      TrendingUp,
  visibilidade: Search,
  perdas:       AlertTriangle,
  valor:        DollarSign,
}

function NavItem({
  id,
  label,
  num,
}: {
  id: string
  label: string
  num: string
  key?: React.Key | null
}) {
  const { secaoAtiva, handleTabSelect } = useDiagnostico()
  const isActive = secaoAtiva === id
  const Icon = SECOES_ICONS[id as keyof typeof SECOES_ICONS]

  return (
    <button
      onClick={() => handleTabSelect(id)}
      className={cn(
        'w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-200 text-left',
        isActive ? 'glass-button text-white' : '',
      )}
      style={{
        borderRadius: '0.875rem',
        color: isActive ? undefined : 'var(--color-text-secondary)',
        background: isActive ? undefined : 'transparent',
      }}
      onMouseEnter={e => {
        if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(18,123,240,0.06)'
      }}
      onMouseLeave={e => {
        if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
      }}
    >
      {Icon && <Icon style={{ width: 17, height: 17, flexShrink: 0 }} />}
      <span style={{ flex: 1 }}>{label}</span>
      <span
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: isActive ? 'rgba(255,255,255,0.6)' : 'var(--color-text-muted)',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {num}
      </span>
    </button>
  )
}

export function Sidebar() {
  const { secaoAtiva } = useDiagnostico()
  const secaoIndex = SECOES.findIndex(s => s.id === secaoAtiva)
  const progressPct = ((secaoIndex + 1) / SECOES.length) * 100

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside
        className="hidden md:flex"
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          height: '100vh',
          width: SIDEBAR_WIDTH,
          flexDirection: 'column',
          zIndex: 50,
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderRight: '1px solid rgba(18,123,240,0.08)',
          boxShadow: '4px 0 24px rgba(64,91,122,0.06)',
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: 80,
            padding: '0 24px',
            borderBottom: '1px solid rgba(18,123,240,0.07)',
            flexShrink: 0,
          }}
        >
          <img
            src={upsendLogo}
            alt="Upsend Flow Logo"
            style={{ height: 44, width: 'auto', objectFit: 'contain' }}
          />
        </div>

        {/* Navigation */}
        <nav
          style={{
            flex: 1,
            padding: '16px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            overflowY: 'auto',
          }}
        >
          <p
            style={{
              fontSize: 10,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'var(--color-text-muted)',
              padding: '0 12px',
              marginBottom: 8,
            }}
          >
            Seções
          </p>
          {SECOES.map(({ id, label, num }) => (
            <NavItem key={id} id={id} label={label} num={num} />
          ))}
        </nav>

        {/* Progress bar */}
        <div style={{ padding: '0 12px 4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Progresso
            </span>
            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-blue)' }}>
              {secaoIndex + 1}/{SECOES.length}
            </span>
          </div>
          <div style={{ height: 4, borderRadius: 4, background: 'rgba(18,123,240,0.1)', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                borderRadius: 4,
                background: 'var(--color-blue)',
                width: `${progressPct}%`,
                transition: 'width 300ms ease',
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '12px',
            borderTop: '1px solid rgba(18,123,240,0.07)',
            marginTop: 8,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 12px',
              borderRadius: '0.875rem',
              background: 'rgba(18,123,240,0.04)',
            }}
          >
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(18,123,240,0.1)',
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-blue)' }}>U</span>
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                Upsend Brasil
              </p>
              <p style={{ fontSize: 11, color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                Diagnóstico Digital
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Mobile: top header com logo ── */}
      <header
        className="flex md:hidden"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: MOBILE_HEADER_HEIGHT,
          zIndex: 50,
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderBottom: '1px solid rgba(18,123,240,0.08)',
          boxShadow: '0 2px 16px rgba(64,91,122,0.06)',
        }}
      >
        <img
          src={upsendLogo}
          alt="Upsend Flow Logo"
          style={{ height: 32, width: 'auto', objectFit: 'contain' }}
        />
      </header>

      {/* ── Mobile: bottom bar com os 5 passos ── */}
      <BottomBar />
    </>
  )
}

function BottomBarItem({ id, label }: { id: string; label: string; key?: React.Key | null }) {
  const { secaoAtiva, handleTabSelect } = useDiagnostico()
  const isActive = secaoAtiva === id
  const Icon = SECOES_ICONS[id as keyof typeof SECOES_ICONS]

  return (
    <button
      onClick={() => handleTabSelect(id)}
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        padding: '8px 4px',
        position: 'relative',
        transition: 'all 150ms ease',
        color: isActive ? 'var(--color-blue)' : 'var(--color-text-muted)',
      }}
    >
      {Icon && (
        <Icon
          style={{
            width: 20,
            height: 20,
            strokeWidth: isActive ? 2.5 : 1.75,
          }}
        />
      )}
      <span
        style={{
          fontSize: 9,
          fontWeight: isActive ? 700 : 500,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          lineHeight: 1,
        }}
      >
        {label}
      </span>
      {isActive && (
        <span
          style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 32,
            height: 2,
            borderRadius: 2,
            background: 'var(--color-blue)',
          }}
        />
      )}
    </button>
  )
}

function BottomBar() {
  return (
    <nav
      className="flex md:hidden"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: MOBILE_BOTTOM_BAR_HEIGHT,
        zIndex: 50,
        alignItems: 'stretch',
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderTop: '1px solid rgba(18,123,240,0.08)',
        boxShadow: '0 -2px 16px rgba(64,91,122,0.06)',
      }}
    >
      {SECOES.map(({ id, label }) => (
        <BottomBarItem key={id} id={id} label={label} />
      ))}
    </nav>
  )
}
