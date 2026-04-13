import React, { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { DiagnosticData } from '../types'
import { supabase } from '../lib/supabase'
import { ArrowRight, CheckCircle2, XCircle, AlertTriangle, ExternalLink, ChevronRight, ChevronLeft } from 'lucide-react'
import { useDiagnostico } from '../contexts/DiagnosticoContext'

// ─── Formatters ───────────────────────────────────────────────────────────────

const fBRL = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v)
const fNum = (v: number) => new Intl.NumberFormat('pt-BR').format(Math.round(v))
const fPct = (v: number) => `${v.toFixed(1)}%`

// ─── Custom Hooks ─────────────────────────────────────────────────────────────

function useIntersectionObserver(
  ref: React.RefObject<Element>,
  options?: IntersectionObserverInit & { once?: boolean }
) {
  const [isIntersecting, setIsIntersecting] = useState(false)
  useEffect(() => {
    if (!ref.current) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsIntersecting(true)
        if (options?.once) observer.disconnect()
      } else if (!options?.once) {
        setIsIntersecting(false)
      }
    }, options)
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])
  return isIntersecting
}

// ─── CountUp ─────────────────────────────────────────────────────────────────

function CountUp({
  end, duration = 1400, decimals = 0, prefix = '', suffix = '',
}: {
  end: number; duration?: number; decimals?: number; prefix?: string; suffix?: string
}) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useIntersectionObserver(ref, { once: true, threshold: 0.1 })

  useEffect(() => {
    if (!isInView) return
    let start: number | null = null
    let raf: number
    const animate = (t: number) => {
      if (!start) start = t
      const progress = Math.min((t - start) / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 4)
      setCount(ease * end)
      if (progress < 1) raf = requestAnimationFrame(animate)
    }
    raf = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf)
  }, [isInView, end, duration])

  const formatted = count.toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
  return <span ref={ref}>{prefix}{formatted}{suffix}</span>
}

// ─── FadeIn ───────────────────────────────────────────────────────────────────

function FadeIn({
  children, delay = 0, className = '',
}: {
  children: React.ReactNode; delay?: number; className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useIntersectionObserver(ref, { once: true, threshold: 0.05 })
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isInView ? 1 : 0,
        transform: isInView ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 500ms ease-out ${delay}ms, transform 500ms ease-out ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

// ─── Termômetro ───────────────────────────────────────────────────────────────

function Termometro({ score, label }: { score: number; label: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useIntersectionObserver(ref, { once: true, threshold: 0.3 })
  const [fill, setFill] = useState(0)

  useEffect(() => {
    if (isInView) {
      const t = setTimeout(() => setFill(Math.min(100, Math.max(0, score))), 150)
      return () => clearTimeout(t)
    }
  }, [isInView, score])

  const cor = score >= 67 ? '#16a34a' : score >= 34 ? '#d97706' : '#dc2626'
  const zona = score >= 67 ? 'Referência' : score >= 34 ? 'Parcial' : 'Invisível'

  return (
    <div ref={ref} className="flex flex-col items-center gap-3 select-none">
      <div className="relative w-10 h-52 rounded-full overflow-hidden"
        style={{ background: 'rgba(18,123,240,0.06)', border: '1.5px solid rgba(18,123,240,0.15)' }}>
        <div className="absolute top-0 left-0 right-0" style={{ height: '33.3%', background: 'rgba(22,163,74,0.08)' }} />
        <div className="absolute left-0 right-0" style={{ top: '33.3%', height: '33.3%', background: 'rgba(217,119,6,0.08)' }} />
        <div className="absolute bottom-0 left-0 right-0" style={{ height: '33.3%', background: 'rgba(220,38,38,0.08)' }} />
        <div className="absolute left-0 right-0 border-t border-dashed" style={{ top: '33.3%', borderColor: 'rgba(18,123,240,0.12)' }} />
        <div className="absolute left-0 right-0 border-t border-dashed" style={{ top: '66.6%', borderColor: 'rgba(18,123,240,0.12)' }} />
        <div
          className="absolute bottom-0 left-1 right-1 rounded-full"
          style={{
            height: `${fill}%`,
            backgroundColor: cor,
            transition: 'height 1.6s cubic-bezier(0.34, 1.2, 0.64, 1)',
            opacity: 0.85,
          }}
        />
      </div>
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center font-black text-white text-sm shadow-lg"
        style={{ backgroundColor: cor, transition: 'background-color 1.6s ease' }}
      >
        {score}
      </div>
      <div className="text-center">
        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">{label}</div>
        <div className="text-xs font-bold mt-0.5" style={{ color: cor }}>{zona}</div>
      </div>
    </div>
  )
}

// ─── TiltCard ─────────────────────────────────────────────────────────────────

function TiltCard({
  children, delay = 0, className = '',
}: {
  children: React.ReactNode; delay?: number; className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect()
      const x = (e.clientX - r.left) / r.width - 0.5
      const y = (e.clientY - r.top) / r.height - 0.5
      el.style.transform = `perspective(900px) rotateX(${-y * 8}deg) rotateY(${x * 8}deg) translateZ(4px)`
    }
    const onLeave = () => { el.style.transform = 'perspective(900px) rotateX(0) rotateY(0)'; el.style.transition = 'transform 400ms ease' }
    const onEnter = () => { el.style.transition = 'none' }
    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    el.addEventListener('mouseenter', onEnter)
    return () => { el.removeEventListener('mousemove', onMove); el.removeEventListener('mouseleave', onLeave); el.removeEventListener('mouseenter', onEnter) }
  }, [])
  return (
    <FadeIn delay={delay} className="h-full">
      <div ref={ref} className={`glass-panel p-6 h-full ${className}`}>{children}</div>
    </FadeIn>
  )
}

// ─── Barra de comparação ──────────────────────────────────────────────────────

function BarraComparacao({
  label, valor, max, cor = 'var(--color-blue)', delay = 0,
}: {
  label: string; valor: number; max: number; cor?: string; delay?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useIntersectionObserver(ref, { once: true })
  const pct = max > 0 ? Math.min(100, (valor / max) * 100) : 0

  return (
    <div ref={ref} className="space-y-1.5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold truncate" style={{ color: 'var(--color-text-secondary)', maxWidth: '160px' }}>
          {label}
        </span>
        <span className="font-mono text-xs font-bold shrink-0" style={{ color: 'var(--color-text-secondary)' }}>
          {fNum(valor)}<span className="font-normal opacity-60 ml-0.5">/mês</span>
        </span>
      </div>
      <div className="h-3 rounded-full overflow-hidden" style={{ background: 'rgba(18,123,240,0.08)' }}>
        <div
          className="h-full rounded-full relative overflow-hidden"
          style={{
            width: isInView ? `${pct}%` : '0%',
            backgroundColor: cor,
            transition: `width 1.2s ease-out ${delay}ms`,
          }}
        >
          <div
            className="absolute inset-0 rounded-full opacity-40"
            style={{
              background: 'linear-gradient(90deg, transparent 40%, rgba(255,255,255,0.4) 60%, transparent 80%)',
            }}
          />
        </div>
      </div>
    </div>
  )
}

// ─── Alerta financeiro ────────────────────────────────────────────────────────

function AlertaFinanceiro({
  descricao, valor, hasValue = true, delay = 0,
}: {
  descricao: string; valor: string; hasValue?: boolean; delay?: number
}) {
  return (
    <FadeIn delay={delay}>
      <div
        className="p-5 rounded-2xl flex items-start gap-4"
        style={{
          background: 'rgba(220,38,38,0.04)',
          border: '1px solid rgba(220,38,38,0.14)',
          borderLeftWidth: '3px',
          borderLeftColor: '#dc2626',
        }}
      >
        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#dc2626', opacity: 0.8 }} />
        <div className="flex-1 min-w-0">
          <p className="text-text-primary text-sm font-medium leading-snug">{descricao}</p>
        </div>
        <div className="shrink-0 text-right">
          {hasValue ? (
            <span className="font-mono font-bold text-sm" style={{ color: '#dc2626' }}>{valor}</span>
          ) : (
            <span className="font-mono text-sm text-text-muted">{valor}</span>
          )}
        </div>
      </div>
    </FadeIn>
  )
}

// ─── Sub-header de seção ──────────────────────────────────────────────────────

function SecaoHeader({
  num, titulo, subtitulo,
}: {
  num: string; titulo: string; subtitulo: string
}) {
  return (
    <FadeIn>
      <div className="mb-12">
        <div className="flex items-end gap-4 mb-3">
          <span
            className="hero-number select-none leading-none"
            style={{ fontSize: 'clamp(64px, 10vw, 100px)', color: 'rgba(18,123,240,0.08)' }}
          >{num}</span>
          <div className="pb-1">
            <div
              className="text-[10px] font-bold uppercase tracking-[0.3em] mb-1.5"
              style={{ color: 'var(--color-blue)' }}
            >Seção {num} / 05</div>
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary">{titulo}</h2>
          </div>
        </div>
        <p className="text-text-secondary font-light ml-1">{subtitulo}</p>
      </div>
    </FadeIn>
  )
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

const SECOES = [
  { id: 'espelho', label: 'Visão Geral', num: '01' },
  { id: 'mercado', label: 'Mercado', num: '02' },
  { id: 'visibilidade', label: 'Visibilidade', num: '03' },
  { id: 'perdas', label: 'Perdas', num: '04' },
  { id: 'valor', label: 'Valor & Plano', num: '05' },
]

function NavSecoes({
  ativa, onSelect,
}: {
  ativa: string; onSelect: (id: string) => void
}) {
  return (
    <header className="tab-nav fixed top-0 right-0 z-40" style={{ left: 288 }}>
      {/* Tabs — full width, no overflow */}
      <nav className="flex items-stretch w-full">
        {SECOES.map(({ id, label, num }) => (
          <button
            key={id}
            onClick={() => onSelect(id)}
            className={`tab-btn flex-1 py-4 text-[10px] font-bold uppercase tracking-[0.08em] flex flex-col items-center gap-0.5 md:flex-row md:justify-center md:gap-1.5 ${ativa === id ? 'active' : ''}`}
          >
            <span className="opacity-40 text-[9px]">{num}</span>
            <span className="leading-none">{label}</span>
          </button>
        ))}
      </nav>

      {/* Progress bar */}
      <div style={{ height: '2px', background: 'rgba(18,123,240,0.06)' }}>
        <div
          style={{
            height: '100%',
            background: 'var(--color-blue)',
            width: `${((SECOES.findIndex(s => s.id === ativa) + 1) / SECOES.length) * 100}%`,
            transition: 'width 300ms ease',
            opacity: 0.5,
          }}
        />
      </div>
    </header>
  )
}

// ─── Prev / Next nav ──────────────────────────────────────────────────────────

function TabNav({ ativa, onSelect }: { ativa: string; onSelect: (id: string) => void }) {
  const idx = SECOES.findIndex(s => s.id === ativa)
  const prev = idx > 0 ? SECOES[idx - 1] : null
  const next = idx < SECOES.length - 1 ? SECOES[idx + 1] : null

  return (
    <div className="flex items-center justify-between pt-12 pb-4 px-1">
      {prev ? (
        <button
          onClick={() => onSelect(prev.id)}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-muted hover:text-text-primary transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          {prev.num} · {prev.label}
        </button>
      ) : <div />}
      {next ? (
        <button
          onClick={() => onSelect(next.id)}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-muted hover:text-text-primary transition-colors"
        >
          {next.num} · {next.label}
          <ChevronRight className="w-4 h-4" />
        </button>
      ) : <div />}
    </div>
  )
}

// ─── SEÇÃO 1: O ESPELHO ───────────────────────────────────────────────────────

function SecaoEspelho({ data, onNext }: { data: DiagnosticData; onNext: () => void }) {
  const fatia = data.totalMonthlySearches > 0
    ? Math.max(1, Math.round((data.currentMonthlyOrganicVisits / data.totalMonthlySearches) * 100))
    : 0

  const buscasSemana = Math.round(data.totalMonthlySearches / 4)
  const visitas = data.currentMonthlyOrganicVisits
  const paraConc = Math.max(0, buscasSemana - Math.round(visitas / 4))

  const taxaConversao = data.taxaConversao ?? 2
  const taxaFechamento = data.taxaFechamento ?? 30
  const ticketMedio = data.ticketMedio ?? 300
  const custoPorSemana = Math.round(
    (buscasSemana - Math.round(visitas / 4)) * (taxaConversao / 100) * (taxaFechamento / 100) * ticketMedio
  )

  const heroColor = fatia <= 5 ? '#dc2626' : fatia <= 15 ? '#d97706' : 'var(--color-blue)'
  const heroGlow = fatia <= 5
    ? 'rgba(220,38,38,0.2)'
    : fatia <= 15 ? 'rgba(217,119,6,0.2)' : 'rgba(18,123,240,0.2)'

  // Bloco 3 — termômetros
  const shareScore = data.totalMonthlySearches > 0
    ? Math.min(100, Math.round((visitas / data.totalMonthlySearches) * 2000))
    : 0
  const googleScore = Math.round(shareScore * 0.6 + (data.pageSpeedMobile ?? 0) * 0.4)
  const geoMap: Record<string, number> = { yes: 100, partial: 55, no: 0 }
  const geoScore = Math.round(
    ((geoMap[data.chatGptMentions] ?? 0) + (geoMap[data.geminiMentions] ?? 0) + (geoMap[data.perplexityMentions] ?? 0)) / 3
  )

  // Bloco 4 — concorrente mais forte
  const concMaisForte = data.competitors.length > 0
    ? [...data.competitors].sort((a, b) => b.monthlyVisits - a.monthlyVisits)[0]
    : null
  const multiplicador = concMaisForte && visitas > 0
    ? (concMaisForte.monthlyVisits / visitas).toFixed(1)
    : null

  // Bloco 5 — patrimônio digital
  const cpc = data.estimatedCpcAverage ?? 0
  const mult = data.valuationMultiplier ?? 36
  const valuationAtual = cpc > 0 ? Math.round(visitas * cpc * mult) : 0
  const valuationProjetado = cpc > 0 ? Math.round(visitas * 4 * cpc * mult) : 0

  // Bloco 6 — alertas
  const demandaIgnorada = Math.max(0, data.totalMonthlySearches - visitas)
  const receitaNaoCapturada = Math.round(demandaIgnorada * (taxaConversao / 100) * (taxaFechamento / 100) * ticketMedio)
  type Alerta = { desc: string; val: string; hasVal: boolean }
  const alertas: Alerta[] = []
  if (geoScore < 34 && receitaNaoCapturada > 0) {
    const invis = 3 - [data.chatGptMentions, data.geminiMentions, data.perplexityMentions].filter((m) => m !== 'no').length
    alertas.push({ desc: `Invisível em ${invis} motor${invis !== 1 ? 'es' : ''} de IA`, val: `${fBRL(Math.round(receitaNaoCapturada * 0.3))}/mês`, hasVal: true })
  }
  if (data.runsGoogleAds && (data.estimatedMonthlyWaste ?? 0) > 0) {
    alertas.push({ desc: 'Verba em Ads em termos que poderiam ser orgânicos', val: `${fBRL(data.estimatedMonthlyWaste ?? 0)}/mês`, hasVal: true })
  }
  if ((data.pageSpeedMobile ?? 0) > 0 && (data.pageSpeedMobile ?? 100) < 70) {
    const bounce = (data.pageSpeedMobile ?? 100) < 50 ? 53 : 38
    alertas.push({ desc: `PageSpeed Mobile ${data.pageSpeedMobile}/100 — velocidade crítica`, val: `${bounce}% de abandono`, hasVal: false })
  }

  return (
    <section className="px-4">
      {/* ── Blocos 1 & 2 — hero ──────────────────────────────────────── */}
      <div className="min-h-[calc(100vh-70px)] flex flex-col items-center justify-center text-center relative overflow-hidden py-20">
        {/* Atmospheric glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
            style={{ background: `radial-gradient(circle, ${heroGlow} 0%, transparent 65%)` }}
          />
        </div>

        <FadeIn className="relative z-10 w-full max-w-2xl">
          {/* Eyebrow */}
          <div className="flex items-center justify-center gap-3 mb-10">
            <div className="h-px w-10" style={{ background: 'var(--color-blue)', opacity: 0.3 }} />
            <p className="text-[10px] font-bold uppercase tracking-[0.35em]" style={{ color: 'var(--color-blue)' }}>
              Diagnóstico Digital · {data.companyName}
            </p>
            <div className="h-px w-10" style={{ background: 'var(--color-blue)', opacity: 0.3 }} />
          </div>

          {/* Pergunta */}
          <p className="text-lg md:text-2xl font-light text-text-secondary mb-2 leading-relaxed">
            De cada{' '}
            <span className="font-bold text-text-primary">100 pessoas</span>{' '}
            buscando{' '}
            <span className="display-italic" style={{ color: heroColor, fontSize: '1.1em' }}>
              {data.mainKeywords?.split(',')[0]?.trim() || 'o que você vende'}
            </span>{' '}
            em {data.geographicMarket || 'sua região'}…
          </p>

          {/* Hero number */}
          <div className="my-6 relative select-none">
            <div
              className="hero-number flex items-start justify-center leading-none"
              style={{ fontSize: 'clamp(110px, 22vw, 190px)', color: heroColor, textShadow: `0 0 100px ${heroGlow}` }}
            >
              <CountUp end={fatia} duration={2000} />
              <span style={{ fontSize: '0.35em', marginTop: '0.18em', marginLeft: '0.08em', opacity: 0.7 }}>%</span>
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] mt-1 text-text-muted">
              do mercado chega até você
            </p>
            <p className="text-[10px] tracking-wider mt-1" style={{ color: 'var(--color-text-muted)', opacity: 0.55 }}>
              os outros {100 - fatia}% vão para seus concorrentes
            </p>
          </div>

          {/* Market tags */}
          <div className="flex items-center justify-center gap-2 mb-10 flex-wrap">
            {[data.geographicMarket, ...data.areasDiagnosed].filter(Boolean).map((tag, i) => (
              <span
                key={i}
                className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full text-text-muted"
                style={{ border: '1px solid rgba(18,123,240,0.15)', background: 'rgba(18,123,240,0.04)' }}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Sub-card — Esta semana */}
          <FadeIn delay={400}>
            <div className="glass-panel p-7 rounded-2xl text-left max-w-lg mx-auto">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] mb-4" style={{ color: 'var(--color-blue)' }}>
                Esta semana
              </p>
              <p className="text-base md:text-lg font-light text-text-primary leading-relaxed">
                <span className="font-bold text-text-primary"><CountUp end={buscasSemana} /></span>{' '}
                buscas por{' '}
                <em className="text-text-secondary">
                  {data.mainKeywords?.split(',')[0]?.trim() || data.geographicMarket}
                </em>
                {'. '}
                <span className="font-bold" style={{ color: '#dc2626' }}><CountUp end={paraConc} /></span>{' '}
                foram para seus concorrentes.
              </p>
              {custoPorSemana > 0 && (
                <div className="mt-4 pt-4 flex items-center justify-between" style={{ borderTop: '1px solid rgba(18,123,240,0.1)' }}>
                  <span className="text-xs text-text-muted">Custo estimado da perda</span>
                  <span className="font-bold text-sm" style={{ color: '#dc2626' }}>
                    <CountUp end={custoPorSemana} prefix="R$ " />
                  </span>
                </div>
              )}
            </div>
          </FadeIn>
        </FadeIn>
      </div>

      {/* ── Blocos 3–7 — sumário executivo ──────────────────────────── */}
      <div className="max-w-2xl mx-auto pb-16 space-y-4">

        {/* Bloco 3 — Onde você está no novo mapa das buscas */}
        <FadeIn>
          <div className="glass-panel p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-text-muted mb-6 text-center">
              Onde você está no novo mapa das buscas
            </p>
            <div className="flex justify-center gap-16">
              <Termometro score={googleScore} label="Google" />
              <Termometro score={geoScore} label="Inteligência Artificial" />
            </div>
          </div>
        </FadeIn>

        {/* Bloco 4 — O concorrente que está ganhando */}
        {concMaisForte && multiplicador && (
          <FadeIn delay={80}>
            <div
              className="glass-panel p-6"
              style={{ borderLeft: '3px solid rgba(220,38,38,0.35)' }}
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-text-muted mb-3">
                O concorrente que está ganhando o que deveria ser seu
              </p>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-text-primary text-base">{concMaisForte.name}</p>
                  <p className="text-sm text-text-secondary mt-1">
                    Captura aproximadamente{' '}
                    <span className="font-bold" style={{ color: '#dc2626' }}>{multiplicador}×</span>{' '}
                    mais do mercado do que você
                  </p>
                  {concMaisForte.mainStrength && (
                    <p className="text-xs text-text-muted mt-1.5 leading-relaxed">{concMaisForte.mainStrength}</p>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-2xl font-bold" style={{ color: '#dc2626' }}>{fNum(concMaisForte.monthlyVisits)}</div>
                  <div className="text-[10px] text-text-muted mt-0.5">visitas/mês</div>
                </div>
              </div>
            </div>
          </FadeIn>
        )}

        {/* Bloco 5 — Patrimônio digital */}
        {valuationAtual > 0 && (
          <FadeIn delay={140}>
            <div className="glass-panel p-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-text-muted mb-4">
                Patrimônio digital
              </p>
              <div className="flex items-center justify-between gap-4">
                <div className="text-center flex-1">
                  <div className="text-[10px] text-text-muted mb-1 uppercase tracking-wider">Hoje</div>
                  <div className="text-xl font-bold text-text-primary">{fBRL(valuationAtual)}</div>
                </div>
                <ArrowRight className="w-5 h-5 shrink-0" style={{ color: 'var(--color-blue)', opacity: 0.4 }} />
                <div className="text-center flex-1">
                  <div className="text-[10px] mb-1 uppercase tracking-wider" style={{ color: 'var(--color-blue)' }}>
                    Projetado 12 meses
                  </div>
                  <div className="text-xl font-bold" style={{ color: 'var(--color-blue)' }}>{fBRL(valuationProjetado)}</div>
                </div>
              </div>
              <p className="text-[10px] text-text-muted text-center mt-3 pt-3" style={{ borderTop: '1px solid rgba(18,123,240,0.08)' }}>
                {fNum(visitas)} visitas/mês × R$ {cpc.toFixed(2)}/clique × {mult}×
              </p>
            </div>
          </FadeIn>
        )}

        {/* Bloco 6 — Alertas que custam dinheiro agora */}
        {alertas.length > 0 && (
          <FadeIn delay={200}>
            <div className="glass-panel p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-text-muted mb-4">
                Alertas que custam dinheiro agora
              </p>
              <div className="space-y-3">
                {alertas.slice(0, 3).map((a, i) => (
                  <div key={i} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" style={{ color: '#dc2626', opacity: 0.7 }} />
                      <span className="text-sm text-text-secondary truncate">{a.desc}</span>
                    </div>
                    <span
                      className="font-mono font-bold text-xs shrink-0"
                      style={{ color: a.hasVal ? '#dc2626' : 'var(--color-text-muted)' }}
                    >
                      {a.val}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        )}

        {/* Bloco 7 — Se nada mudar */}
        <FadeIn delay={260}>
          <div
            className="p-5 rounded-2xl text-sm font-light text-text-secondary leading-relaxed"
            style={{
              background: 'rgba(220,38,38,0.04)',
              border: '1px solid rgba(220,38,38,0.1)',
              borderLeftWidth: '3px',
              borderLeftColor: '#dc2626',
            }}
          >
            Se o cenário atual se mantiver por mais 12 meses, a{' '}
            <strong className="text-text-primary">{data.companyName}</strong> terá ficado de fora de{' '}
            <strong className="text-text-primary">{fNum(demandaIgnorada * 12)} buscas qualificadas</strong>.{' '}
            {concMaisForte
              ? <><strong className="text-text-primary">{concMaisForte.name}</strong> estará</>
              : 'Seu concorrente estará'
            }{' '}
            consolidando uma posição que leva em média{' '}
            <strong className="text-text-primary">18 meses</strong> para ser deslocada após estabelecida.
          </div>
        </FadeIn>

        {/* CTA */}
        <FadeIn delay={360}>
          <div className="pt-2 flex justify-center">
            <button
              onClick={onNext}
              className="flex items-center gap-2.5 text-sm font-bold px-6 py-3 rounded-2xl transition-all"
              style={{ background: 'var(--color-blue)', color: 'white', boxShadow: '0 4px 20px rgba(18,123,240,0.28)' }}
              onMouseEnter={(e) => {
                const btn = e.currentTarget as HTMLButtonElement
                btn.style.transform = 'translateY(-1px)'
                btn.style.boxShadow = '0 8px 28px rgba(18,123,240,0.36)'
              }}
              onMouseLeave={(e) => {
                const btn = e.currentTarget as HTMLButtonElement
                btn.style.transform = ''
                btn.style.boxShadow = '0 4px 20px rgba(18,123,240,0.28)'
              }}
            >
              Ver diagnóstico completo
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}

// ─── SEÇÃO 2: MERCADO E CONCORRÊNCIA ─────────────────────────────────────────

function SecaoMercado({ data }: { data: DiagnosticData }) {
  const fatia = data.totalMonthlySearches > 0
    ? ((data.currentMonthlyOrganicVisits / data.totalMonthlySearches) * 100)
    : 0

  const concMaisForte = [...data.competitors].sort((a, b) => b.monthlyVisits - a.monthlyVisits)[0]
  const maxVisits = Math.max(data.currentMonthlyOrganicVisits, concMaisForte?.monthlyVisits ?? 0, 100)

  const concFazSEO = data.competitors.filter((c) => c.doesSEO).length
  const concFazGEO = data.competitors.filter((c) => c.doesGEO).length
  const concNaFrente = data.competitors.filter((c) => c.monthlyVisits > data.currentMonthlyOrganicVisits).length

  const mediaConcorrentes = data.competitors.length > 0
    ? data.competitors.reduce((acc, c) => acc + c.monthlyVisits, 0) / data.competitors.length
    : 0
  const multiplicadorConc = mediaConcorrentes > 0 && data.currentMonthlyOrganicVisits > 0
    ? (mediaConcorrentes / data.currentMonthlyOrganicVisits).toFixed(1)
    : null

  const keywords = data.mainKeywords?.split(',').map((k) => k.trim()).filter(Boolean) ?? []

  const crescimentoLabel: Record<string, string> = {
    crescendo: '📈 Crescendo',
    estavel: '→ Estável',
    retraindo: '📉 Retraindo',
  }

  return (
    <section className="py-12 px-4 max-w-5xl mx-auto">
      <SecaoHeader
        num="02"
        titulo="Mercado & Concorrência"
        subtitulo="O tamanho do que está em jogo — e quem está capturando o que deveria ser seu."
      />

      {/* Tamanho da Oportunidade */}
      <div className="mb-12">
        <FadeIn>
          <h3 className="text-[11px] font-bold uppercase tracking-[0.25em] text-text-muted mb-6">
            Tamanho da Oportunidade
          </h3>
        </FadeIn>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <TiltCard delay={0}>
            <div className="text-[11px] font-light text-text-muted mb-1 uppercase tracking-wider">Buscas/mês</div>
            <div className="text-3xl font-bold text-text-primary"><CountUp end={data.totalMonthlySearches} /></div>
            <div className="text-xs text-text-muted mt-1">{data.geographicMarket}</div>
          </TiltCard>
          <TiltCard delay={80}>
            <div className="text-[11px] font-light text-text-muted mb-1 uppercase tracking-wider">Buscas/semana</div>
            <div className="text-3xl font-bold text-text-primary"><CountUp end={Math.round(data.totalMonthlySearches / 4)} /></div>
          </TiltCard>
          <TiltCard delay={160}>
            <div className="text-[11px] font-light text-text-muted mb-1 uppercase tracking-wider">Sua fatia atual</div>
            <div className="text-3xl font-bold" style={{ color: fatia <= 5 ? '#dc2626' : fatia <= 15 ? '#d97706' : 'var(--color-blue)' }}>
              <CountUp end={parseFloat(fatia.toFixed(1))} decimals={1} suffix="%" />
            </div>
          </TiltCard>
          <TiltCard delay={240}>
            <div className="text-[11px] font-light text-text-muted mb-1 uppercase tracking-wider">Mercado</div>
            <div className="text-xl font-bold text-text-primary">{crescimentoLabel[data.crescimentoMercado ?? 'estavel']}</div>
            {data.sazonalidadeExiste && (
              <div className="text-xs text-text-muted mt-1">Pico: {data.sazonalidadeMesPico} · Baixa: {data.sazonalidadeMesBaixa}</div>
            )}
          </TiltCard>
        </div>

        {keywords.length > 0 && (
          <FadeIn delay={200}>
            <div className="glass-panel p-5 mb-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-text-muted mb-3">Principais Keywords do Segmento</p>
              <div className="flex flex-wrap gap-2">
                {keywords.map((kw, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-full text-sm font-medium text-text-primary"
                    style={{ border: '1px solid rgba(18,123,240,0.15)', background: 'rgba(18,123,240,0.05)' }}
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          </FadeIn>
        )}
      </div>

      {/* Concorrentes */}
      {data.competitors.length > 0 && (
        <div className="mb-12">
          <FadeIn>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.25em] text-text-muted mb-6">
              O Que os Concorrentes Têm
            </h3>
          </FadeIn>
          <div className="space-y-3">
            {data.competitors.map((c, i) => {
              const isAhead = c.monthlyVisits > data.currentMonthlyOrganicVisits
              const caps = [
                { label: 'Site', val: c.hasAptWebsite },
                { label: 'SEO', val: c.doesSEO },
                { label: 'IA', val: c.doesGEO },
                { label: 'Ads', val: c.runsAds },
              ]
              return (
                <FadeIn key={c.id} delay={i * 100}>
                  <div
                    className="rounded-2xl p-5"
                    style={{
                      background: isAhead ? 'rgba(220,38,38,0.04)' : 'rgba(255,255,255,0.72)',
                      border: `1px solid ${isAhead ? 'rgba(220,38,38,0.14)' : 'rgba(18,123,240,0.1)'}`,
                      backdropFilter: 'blur(16px)',
                    }}
                  >
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-bold text-text-primary text-base">{c.name}</span>
                          {c.url && (
                            <a href={`https://${c.url}`} target="_blank" rel="noopener noreferrer"
                              className="transition-opacity opacity-30 hover:opacity-70">
                              <ExternalLink className="w-3 h-3 text-text-muted" />
                            </a>
                          )}
                          {isAhead && (
                            <span
                              className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
                              style={{ background: 'rgba(220,38,38,0.1)', color: '#dc2626' }}
                            >À frente</span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {caps.map(({ label, val }) => (
                            <span
                              key={label}
                              className="text-[10px] font-bold px-2.5 py-1 rounded-md"
                              style={{
                                background: val ? 'rgba(22,163,74,0.08)' : 'rgba(220,38,38,0.06)',
                                color: val ? '#16a34a' : 'rgba(220,38,38,0.75)',
                                border: `1px solid ${val ? 'rgba(22,163,74,0.18)' : 'rgba(220,38,38,0.14)'}`,
                              }}
                            >
                              {val ? '✓' : '×'} {label}
                            </span>
                          ))}
                          {c.contentCount !== undefined && c.contentCount > 0 && (
                            <span
                              className="text-[10px] font-bold px-2.5 py-1 rounded-md text-text-muted"
                              style={{ background: 'rgba(18,123,240,0.05)', border: '1px solid rgba(18,123,240,0.1)' }}
                            >
                              {c.contentCount} conteúdos
                            </span>
                          )}
                          {c.gbpRating ? (
                            <span
                              className="text-[10px] font-bold px-2.5 py-1 rounded-md"
                              style={{ background: 'rgba(217,119,6,0.08)', color: '#d97706', border: '1px solid rgba(217,119,6,0.18)' }}
                            >
                              ★ {c.gbpRating} ({c.gbpReviews})
                            </span>
                          ) : null}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div
                          className="hero-number"
                          style={{ fontSize: '2.2rem', color: isAhead ? '#dc2626' : 'var(--color-text-primary)' }}
                        >
                          {fNum(c.monthlyVisits)}
                        </div>
                        <div className="text-[10px] mt-0.5 text-text-muted">visitas/mês</div>
                      </div>
                    </div>
                    {(c.mainStrength || c.mainWeakness) && (
                      <div
                        className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3"
                        style={{ borderTop: '1px solid rgba(18,123,240,0.08)' }}
                      >
                        {c.mainStrength && (
                          <div className="flex items-start gap-2 text-xs">
                            <span className="shrink-0 mt-0.5 font-bold" style={{ color: '#16a34a' }}>+</span>
                            <span className="text-text-secondary">{c.mainStrength}</span>
                          </div>
                        )}
                        {c.mainWeakness && (
                          <div className="flex items-start gap-2 text-xs">
                            <span className="shrink-0 mt-0.5 font-bold" style={{ color: '#dc2626' }}>−</span>
                            <span className="text-text-secondary">{c.mainWeakness}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </FadeIn>
              )
            })}
          </div>
        </div>
      )}

      {/* Você vs. O Mercado */}
      <div className="mb-6">
        <FadeIn>
          <h3 className="text-[11px] font-bold uppercase tracking-[0.25em] text-text-muted mb-6">
            Você vs. O Mercado
          </h3>
        </FadeIn>

        <div className="glass-panel p-6 mb-4">
          <div className="space-y-4">
            <BarraComparacao label={data.companyName} valor={data.currentMonthlyOrganicVisits} max={maxVisits} cor="var(--color-blue)" />
            {data.competitors.map((c, i) => (
              <React.Fragment key={c.id}>
                <BarraComparacao
                  label={c.name}
                  valor={c.monthlyVisits}
                  max={maxVisits}
                  cor={c.monthlyVisits > data.currentMonthlyOrganicVisits ? 'rgba(220,38,38,0.65)' : 'rgba(18,123,240,0.4)'}
                  delay={i * 80}
                />
              </React.Fragment>
            ))}
          </div>
        </div>

        <FadeIn delay={300}>
          <div className="glass-panel p-6">
            <p className="text-base leading-relaxed text-text-primary font-light">
              O mercado de <strong>{data.mainKeywords?.split(',')[0]?.trim() || data.geographicMarket}</strong>{' '}
              movimenta <strong>{fNum(data.totalMonthlySearches)} buscas por mês</strong>.{' '}
              Você captura <strong>{fatia.toFixed(1)}%</strong> disso.{' '}
              {concMaisForte && (
                <>
                  {concMaisForte.name} captura{' '}
                  <strong>{((concMaisForte.monthlyVisits / data.totalMonthlySearches) * 100).toFixed(1)}%</strong>.{' '}
                </>
              )}
              {multiplicadorConc && (
                <>
                  Seus concorrentes capturam em média{' '}
                  <strong style={{ color: '#dc2626' }}>{multiplicadorConc}× mais</strong> do mercado do que você.
                </>
              )}
              {concMaisForte && data.ticketMedio && (
                <>{' '}Essa diferença representa aproximadamente{' '}
                  <strong>{fBRL(Math.round((concMaisForte.monthlyVisits - data.currentMonthlyOrganicVisits) * ((data.taxaConversao ?? 2) / 100) * ((data.taxaFechamento ?? 30) / 100) * data.ticketMedio))}</strong>{' '}
                  em receita mensal indo para outro lugar.
                </>
              )}
            </p>
            <div className="flex flex-wrap gap-4 mt-4 pt-4 text-sm text-text-muted" style={{ borderTop: '1px solid rgba(18,123,240,0.08)' }}>
              {concNaFrente > 0 && <span><strong className="text-text-primary">{concNaFrente}</strong> concorrente{concNaFrente > 1 ? 's' : ''} à sua frente em tráfego</span>}
              {concFazSEO > 0 && <span><strong className="text-text-primary">{concFazSEO}</strong> investem em SEO</span>}
              {concFazGEO > 0 && <span><strong className="text-text-primary">{concFazGEO}</strong> aparecem nas IAs</span>}
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}

// ─── SEÇÃO 3: VISIBILIDADE DIGITAL ───────────────────────────────────────────

function SecaoVisibilidade({ data }: { data: DiagnosticData }) {
  const shareScore = data.totalMonthlySearches > 0
    ? Math.min(100, Math.round((data.currentMonthlyOrganicVisits / data.totalMonthlySearches) * 2000))
    : 0
  const speedScore = data.pageSpeedMobile ?? 0
  const googleScore = Math.round(shareScore * 0.6 + speedScore * 0.4)

  const geoMap: Record<string, number> = { yes: 100, partial: 55, no: 0 }
  const geoScore = Math.round(
    (geoMap[data.chatGptMentions] + geoMap[data.geminiMentions] + geoMap[data.perplexityMentions]) / 3
  )

  const plataformas = [
    { label: 'ChatGPT', status: data.chatGptMentions },
    { label: 'Gemini', status: data.geminiMentions },
    { label: 'Perplexity', status: data.perplexityMentions },
  ]

  const statusLabel: Record<string, { label: string; cor: string }> = {
    yes: { label: 'Citado', cor: '#16a34a' },
    partial: { label: 'Parcial', cor: '#d97706' },
    no: { label: 'Invisível', cor: '#dc2626' },
  }

  const lcpClass = (data.pageSpeedMobile ?? 0) >= 70 ? 'Rápido' : (data.pageSpeedMobile ?? 0) >= 50 ? 'Médio' : 'Crítico'
  const lcpCor = (data.pageSpeedMobile ?? 0) >= 70 ? '#16a34a' : (data.pageSpeedMobile ?? 0) >= 50 ? '#d97706' : '#dc2626'

  const concMelhorAvaliado = [...data.competitors].sort((a, b) => (b.gbpRating ?? 0) - (a.gbpRating ?? 0))[0]

  return (
    <section className="py-12 px-4 max-w-5xl mx-auto">
      <SecaoHeader
        num="03"
        titulo="Visibilidade Digital"
        subtitulo="Como o Google e as Inteligências Artificiais te veem hoje."
      />

      {/* Termômetros */}
      <FadeIn delay={100}>
        <div className="glass-panel p-8 mb-8 flex flex-col items-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-text-muted mb-8">
            Onde Você Está no Novo Mapa das Buscas
          </p>
          <div className="flex gap-16 md:gap-24 justify-center">
            <Termometro score={googleScore} label="Google" />
            <Termometro score={geoScore} label="Inteligência Artificial" />
          </div>
          <p className="text-sm text-text-muted text-center mt-6 max-w-md font-light leading-relaxed">
            O Google você já conhece. A IA é o novo canal — e quem não existe nela está perdendo a próxima geração de clientes antes mesmo de ser considerado.
          </p>
        </div>
      </FadeIn>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Seu site */}
        <FadeIn delay={200}>
          <div className="glass-panel p-6 h-full">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.25em] text-text-muted mb-4" style={{ color: 'rgba(56,73,94,0.45)' }}>Seu Site Hoje</h3>
            <div className="space-y-3">
              {[
                { label: 'Possui site', val: data.temSite ?? true },
                { label: 'HTTPS / SSL', val: data.hasSSL ?? true },
                { label: 'Responsivo no mobile', val: data.isMobileResponsive ?? true },
                { label: 'Blog com conteúdo', val: data.temBlog ?? false },
              ].map(({ label, val }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">{label}</span>
                  {val
                    ? <span className="flex items-center gap-1 text-xs font-bold text-green-600"><CheckCircle2 className="w-4 h-4" /> Sim</span>
                    : <span className="flex items-center gap-1 text-xs font-bold text-red-500"><XCircle className="w-4 h-4" /> Não</span>
                  }
                </div>
              ))}
              {(data.pageSpeedMobile ?? 0) > 0 && (
                <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid rgba(18,123,240,0.08)' }}>
                  <span className="text-sm text-text-secondary">PageSpeed Mobile</span>
                  <span className="flex items-center gap-2 text-sm font-bold" style={{ color: lcpCor }}>
                    {data.pageSpeedMobile}/100 — {lcpClass}
                  </span>
                </div>
              )}
              {data.temBlog && (data.totalArtigos ?? 0) > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">Conteúdos publicados</span>
                  <span className="text-sm font-bold text-text-primary">{data.totalArtigos}</span>
                </div>
              )}
            </div>
            {(data.temSite ?? true) && (
              <p className="text-xs text-text-muted mt-4 pt-3" style={{ borderTop: '1px solid rgba(18,123,240,0.08)' }}>
                Seu site está{' '}
                <strong style={{ color: (data.isMobileResponsive && (data.pageSpeedMobile ?? 0) >= 50) ? '#16a34a' : '#dc2626' }}>
                  {(data.isMobileResponsive && (data.pageSpeedMobile ?? 0) >= 50) ? 'apto' : 'parcialmente inapto'}
                </strong>{' '}
                para crescimento orgânico.
              </p>
            )}
          </div>
        </FadeIn>

        {/* Google Search Console */}
        <FadeIn delay={300}>
          <div className="glass-panel p-6 h-full">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.25em] text-text-muted mb-4">Como o Google Te Vê</h3>
            {(data.impressoesMensaisGSC ?? 0) > 0 ? (
              <>
                <div className="space-y-3 mb-4">
                  {[
                    { label: 'Impressões/mês', val: fNum(data.impressoesMensaisGSC ?? 0) },
                    { label: 'Cliques/mês', val: fNum(data.cliquesGSC ?? 0) },
                    { label: 'CTR médio', val: fPct(data.ctrMedioGSC ?? 0) },
                    { label: 'Posição média', val: `#${(data.posicaoMediaGSC ?? 0).toFixed(1)}` },
                  ].map(({ label, val }) => (
                    <div key={label} className="flex items-center justify-between">
                      <span className="text-sm text-text-secondary">{label}</span>
                      <span className="text-sm font-bold text-text-primary">{val}</span>
                    </div>
                  ))}
                </div>
                {(data.impressoesMensaisGSC ?? 0) > 0 && (data.cliquesGSC ?? 0) > 0 && (
                  <div
                    className="rounded-xl p-3 text-sm text-text-secondary"
                    style={{ background: 'rgba(18,123,240,0.05)' }}
                  >
                    De cada <strong>100 pessoas</strong> que viram seu site no Google,{' '}
                    <strong className="text-text-primary">
                      {Math.round(((data.cliquesGSC ?? 0) / (data.impressoesMensaisGSC ?? 1)) * 100)} entraram.
                    </strong>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-text-muted">Dados do Search Console não fornecidos — acesso não disponível para este diagnóstico.</p>
            )}
          </div>
        </FadeIn>
      </div>

      {/* IAs */}
      <FadeIn delay={350}>
        <div className="glass-panel p-6 mb-6">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.25em] text-text-muted mb-6">
            Como as Inteligências Artificiais Te Veem
          </h3>
          <div className="grid grid-cols-3 gap-3 mb-5">
            {plataformas.map(({ label, status }) => {
              const s = statusLabel[status]
              const aiLogos: Record<string, string> = {
                ChatGPT: '/ChatGPT-Logo.png',
                Gemini: '/gemini-google-icon-symbol-logo-free-png.webp',
                Perplexity: '/perplexity-color.png',
              }
              return (
                <div
                  key={label}
                  className="text-center p-5 rounded-xl"
                  style={{
                    background: `${s.cor}08`,
                    border: `1px solid ${s.cor}22`,
                  }}
                >
                  <div className="flex justify-center mb-3">
                    <img
                      src={aiLogos[label]}
                      alt={label}
                      className="w-10 h-10 object-contain"
                    />
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted mb-2">{label}</div>
                  <div className="text-sm font-bold" style={{ color: s.cor }}>{s.label}</div>
                </div>
              )
            })}
          </div>
          {data.geoAuditNotes && (
            <div
              className="rounded-xl p-4 text-sm text-text-secondary leading-relaxed border-l-2 mb-4"
              style={{ background: 'rgba(18,123,240,0.04)', borderLeftColor: 'var(--color-blue)' }}
            >
              {data.geoAuditNotes}
            </div>
          )}
          <div className="pt-4 flex items-center gap-4" style={{ borderTop: '1px solid rgba(18,123,240,0.08)' }}>
            <div>
              <span className="text-xs text-text-muted">Score GEO </span>
              <span className="font-bold text-base" style={{ color: geoScore >= 67 ? '#16a34a' : geoScore >= 34 ? '#d97706' : '#dc2626' }}>
                {geoScore}/100
              </span>
            </div>
            <div className="h-4 w-px" style={{ background: 'rgba(18,123,240,0.15)' }} />
            <div>
              <span className="text-xs text-text-muted">Sentimento </span>
              <span className="text-xs font-bold text-text-primary">{data.sentimentVsCompetitors}</span>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* GBP */}
      {data.gbpHasProfile && (
        <FadeIn delay={400}>
          <div className="glass-panel p-6">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.25em] text-text-muted mb-4">Google Business Profile</h3>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-text-primary">{data.gbpRating?.toFixed(1) ?? '—'}</div>
                <div className="text-xs text-text-muted mt-1">{data.gbpTotalReviews} avaliações</div>
              </div>
              {concMelhorAvaliado?.gbpRating && concMelhorAvaliado.gbpRating > (data.gbpRating ?? 0) && (
                <div className="flex items-center gap-3 text-sm text-text-secondary">
                  <span className="text-2xl text-red-400">→</span>
                  <span>
                    <strong>{concMelhorAvaliado.name}</strong> tem{' '}
                    <strong style={{ color: '#dc2626' }}>{concMelhorAvaliado.gbpRating} ★</strong>{' '}
                    ({concMelhorAvaliado.gbpReviews} avaliações)
                  </span>
                </div>
              )}
            </div>
          </div>
        </FadeIn>
      )}

      <FadeIn delay={500}>
        <div className="glass-panel p-6 mt-6">
          <p className="text-base font-light text-text-primary leading-relaxed">
            Hoje você é encontrado por <strong>{fNum(data.currentMonthlyOrganicVisits)} pessoas/mês</strong> no Google e mencionado por{' '}
            <strong>{plataformas.filter((p) => p.status !== 'no').length}</strong> das 3 principais IAs.{' '}
            Seus concorrentes aparecem em{' '}
            <strong>{data.competitors.filter((c) => c.doesGEO).length}</strong> delas.{' '}
            No novo comportamento de busca, quem não existe nas IAs está perdendo a próxima geração de clientes antes mesmo de ser considerado.
          </p>
        </div>
      </FadeIn>
    </section>
  )
}

// ─── Helper geoScore ──────────────────────────────────────────────────────────

function calcGeoScore(data: DiagnosticData): number {
  const m: Record<string, number> = { yes: 100, partial: 55, no: 0 }
  return Math.round((m[data.chatGptMentions] + m[data.geminiMentions] + m[data.perplexityMentions]) / 3)
}

// ─── SEÇÃO 4: O QUE VOCÊ ESTÁ PERDENDO ───────────────────────────────────────

function SecaoPerdas({ data }: { data: DiagnosticData }) {
  const tc = data.taxaConversao ?? 2
  const tf = data.taxaFechamento ?? 30
  const ticket = data.ticketMedio ?? 300

  const demandaIgnorada = Math.max(0, data.totalMonthlySearches - data.currentMonthlyOrganicVisits)
  const leadsPerdidos = Math.round(demandaIgnorada * (tc / 100))
  const clientesPerdidos = Math.round(leadsPerdidos * (tf / 100))
  const receitaNaoCapturada = clientesPerdidos * ticket
  const custoPorDia = Math.round(receitaNaoCapturada / 30)
  const custo12m = receitaNaoCapturada * 12

  type Alerta = { descricao: string; valor: string; hasValue: boolean }
  const alertas: Alerta[] = []

  const gs = calcGeoScore(data)
  if (gs < 34 && receitaNaoCapturada > 0) {
    alertas.push({
      descricao: `Invisível em ${3 - [data.chatGptMentions, data.geminiMentions, data.perplexityMentions].filter((m) => m !== 'no').length} motores de IA → receita não capturada`,
      valor: `${fBRL(Math.round(receitaNaoCapturada * 0.3))}/mês`,
      hasValue: true,
    })
  }

  if (data.runsGoogleAds && (data.estimatedMonthlyWaste ?? 0) > 0) {
    alertas.push({
      descricao: `${fBRL(data.estimatedMonthlyWaste ?? 0)} em Ads em termos que poderiam ser orgânicos → desperdício mensurável`,
      valor: `${fBRL(data.estimatedMonthlyWaste ?? 0)}/mês`,
      hasValue: true,
    })
  }

  if ((data.pageSpeedMobile ?? 0) > 0 && (data.pageSpeedMobile ?? 100) < 70) {
    const bounce = data.pageSpeedMobile! < 50 ? 53 : 38
    alertas.push({
      descricao: `PageSpeed Mobile ${data.pageSpeedMobile}/100 → ${bounce}% dos visitantes abandonam antes de ver sua oferta`,
      valor: `${bounce}% de abandono`,
      hasValue: false,
    })
  }

  if (alertas.length === 0 && receitaNaoCapturada > 0) {
    alertas.push({
      descricao: `Demanda orgânica não capturada → ${fNum(demandaIgnorada)} buscas/mês sem você`,
      valor: `${fBRL(receitaNaoCapturada)}/mês`,
      hasValue: true,
    })
  }

  const concMaisForte = [...data.competitors].sort((a, b) => b.monthlyVisits - a.monthlyVisits)[0]

  return (
    <section className="py-12 px-4 max-w-5xl mx-auto">
      <SecaoHeader
        num="04"
        titulo="O Que Você Está Perdendo"
        subtitulo="A demanda existe. A questão é quem vai capturá-la."
      />

      {/* Demanda ignorada */}
      <div className="mb-10">
        <FadeIn>
          <h3 className="text-[11px] font-bold uppercase tracking-[0.25em] text-text-muted mb-5">
            A Demanda Que Nunca Chegou Até Você
          </h3>
        </FadeIn>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Por hora', val: Math.round(demandaIgnorada / 30 / 24) },
            { label: 'Por dia', val: Math.round(demandaIgnorada / 30) },
            { label: 'Por semana', val: Math.round(demandaIgnorada / 4) },
            { label: 'Por mês', val: demandaIgnorada },
          ].map(({ label, val }, i) => (
            <TiltCard key={label} delay={i * 80}>
              <div className="text-[11px] font-light text-text-muted mb-1 uppercase tracking-wider">{label}</div>
              <div className="text-3xl font-bold" style={{ color: 'var(--color-blue)' }}>
                <CountUp end={val} />
              </div>
              <div className="text-xs text-text-muted mt-1">buscas sem você</div>
            </TiltCard>
          ))}
        </div>

        <FadeIn delay={300}>
          <div className="glass-panel p-5">
            <p className="text-base font-light text-text-primary leading-relaxed">
              <strong>A cada hora</strong>, aproximadamente{' '}
              <strong>{fNum(Math.round(demandaIgnorada / 30 / 24))} pessoas</strong> buscam{' '}
              {data.mainKeywords?.split(',')[0]?.trim() || `por ${data.geographicMarket}`}{' '}
              e não chegam até você.
            </p>
          </div>
        </FadeIn>
      </div>

      {/* Custo real */}
      {receitaNaoCapturada > 0 && (
        <div className="mb-10">
          <FadeIn>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.25em] text-text-muted mb-5">
              O Custo Real da Invisibilidade
            </h3>
          </FadeIn>

          {/* Número hero */}
          <FadeIn delay={0}>
            <div
              className="rounded-2xl p-8 mb-4"
              style={{ background: 'rgba(220,38,38,0.05)', border: '1px solid rgba(220,38,38,0.16)' }}
            >
              <div className="text-[10px] font-bold uppercase tracking-[0.3em] mb-3" style={{ color: 'rgba(220,38,38,0.7)' }}>
                Receita não capturada por mês
              </div>
              <div
                className="hero-number mb-2"
                style={{
                  fontSize: 'clamp(56px, 11vw, 90px)',
                  color: '#dc2626',
                  textShadow: '0 0 60px rgba(220,38,38,0.2)',
                }}
              >
                <CountUp end={receitaNaoCapturada} prefix="R$ " />
              </div>
              <p className="text-sm text-text-muted">
                {fNum(clientesPerdidos)} clientes/mês × {fBRL(ticket)} ticket médio
              </p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-2 gap-4 mb-5">
            <FadeIn delay={80}>
              <div className="glass-panel p-6 h-full">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted mb-3">
                  Acumulado em 12 meses
                </div>
                <div
                  className="hero-number"
                  style={{ fontSize: 'clamp(38px, 7vw, 60px)', color: 'var(--color-text-primary)' }}
                >
                  <CountUp end={custo12m} prefix="R$ " />
                </div>
              </div>
            </FadeIn>
            <FadeIn delay={160}>
              <div className="glass-panel p-6 h-full">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted mb-3">
                  Custo por dia
                </div>
                <div
                  className="hero-number"
                  style={{ fontSize: 'clamp(38px, 7vw, 60px)', color: 'var(--color-text-primary)' }}
                >
                  <CountUp end={custoPorDia} prefix="R$ " />
                </div>
                <p className="text-xs text-text-muted mt-2">saindo pela porta todo dia</p>
              </div>
            </FadeIn>
          </div>
        </div>
      )}

      {/* Ads ou custo evitado */}
      {data.runsGoogleAds ? (
        <div className="mb-10">
          <FadeIn>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.25em] text-text-muted mb-5">
              Vazamento de Verba em Ads
            </h3>
          </FadeIn>
          <div className="grid md:grid-cols-2 gap-4">
            <TiltCard delay={0}>
              <div className="text-[11px] font-light text-text-muted mb-1 uppercase tracking-wider">Budget mensal total</div>
              <div className="text-3xl font-bold text-text-primary"><CountUp end={data.monthlyAdsBudget ?? 0} prefix="R$ " /></div>
            </TiltCard>
            <TiltCard delay={80}>
              <div className="text-[11px] font-light text-text-muted mb-1 uppercase tracking-wider">Estimativa de desperdício</div>
              <div className="text-3xl font-bold" style={{ color: '#dc2626' }}><CountUp end={data.estimatedMonthlyWaste ?? 0} prefix="R$ " /></div>
              {(data.monthlyAdsBudget ?? 0) > 0 && (data.estimatedMonthlyWaste ?? 0) > 0 && (
                <div className="text-xs text-text-muted mt-1">
                  {Math.round(((data.estimatedMonthlyWaste ?? 0) / (data.monthlyAdsBudget ?? 1)) * 100)}% do orçamento
                </div>
              )}
            </TiltCard>
          </div>
          {data.adsLeakageNotes && (
            <FadeIn delay={200}>
              <div className="glass-panel p-4 mt-4 text-sm text-text-secondary border-l-2" style={{ borderLeftColor: 'var(--color-blue)' }}>
                {data.adsLeakageNotes}
              </div>
            </FadeIn>
          )}
          <FadeIn delay={300}>
            <p className="text-sm text-text-muted mt-4 italic px-1 display-italic" style={{ fontSize: '1.05rem' }}>
              "Você está pagando aluguel por palavras que deveriam ser suas por direito."
            </p>
          </FadeIn>
        </div>
      ) : (
        <div className="mb-10">
          <FadeIn>
            <div className="glass-panel p-6">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.25em] text-text-muted mb-3">Custo Evitado com SEO</h3>
              {data.estimatedCpcAverage > 0 && (
                <>
                  <p className="text-base font-light text-text-secondary mb-3 leading-relaxed">
                    Quando seu orgânico estiver consolidado, você não precisará pagar{' '}
                    <strong className="text-text-primary">
                      {fBRL(Math.round(data.currentMonthlyOrganicVisits * 4 * data.estimatedCpcAverage))}/mês
                    </strong>{' '}
                    em anúncios para ter o mesmo resultado.
                  </p>
                  <p className="text-sm text-text-muted">
                    Acumulado em 12 meses: <strong>{fBRL(Math.round(data.currentMonthlyOrganicVisits * 4 * data.estimatedCpcAverage * 12))}</strong> em Ads que você não vai precisar pagar.
                  </p>
                </>
              )}
            </div>
          </FadeIn>
        </div>
      )}

      {/* Alertas */}
      {alertas.length > 0 && (
        <div className="mb-10">
          <FadeIn>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.25em] text-text-muted mb-5">
              Os Alertas Que Custam Dinheiro Agora
            </h3>
          </FadeIn>
          <div className="space-y-3">
            {alertas.slice(0, 3).map((a, i) => (
              <AlertaFinanceiro key={i} descricao={a.descricao} valor={a.valor} hasValue={a.hasValue} delay={i * 100} />
            ))}
          </div>
        </div>
      )}

      {/* Se nada mudar */}
      <FadeIn delay={200}>
        <div
          className="p-7 rounded-2xl"
          style={{
            background: 'rgba(220,38,38,0.04)',
            border: '1px solid rgba(220,38,38,0.14)',
            borderLeftWidth: '4px',
            borderLeftColor: '#dc2626',
          }}
        >
          <p className="text-base font-light text-text-primary leading-relaxed">
            Se o cenário atual se mantiver por mais 12 meses, a <strong>{data.companyName}</strong> terá ficado de fora de aproximadamente{' '}
            <strong>{fNum(demandaIgnorada * 12)} buscas qualificadas</strong>. No mesmo período,{' '}
            {concMaisForte ? <strong>{concMaisForte.name}</strong> : 'seu concorrente principal'}{' '}
            estará consolidando sua posição como referência no Google e nas IAs — posição que leva em média{' '}
            <strong>18 meses</strong> para ser deslocada após estabelecida.
          </p>
        </div>
      </FadeIn>

      <FadeIn delay={400}>
        <div className="glass-panel p-6 mt-4">
          <p className="text-base font-light text-text-primary leading-relaxed">
            Nos últimos 12 meses, a invisibilidade digital da <strong>{data.companyName}</strong> representou aproximadamente{' '}
            <strong style={{ color: '#dc2626' }}>{fBRL(custo12m)}</strong> em receita não capturada. São{' '}
            <strong>{fNum(clientesPerdidos * 12)} clientes potenciais</strong> que buscaram o que você vende, não te encontraram, e foram para um concorrente. Este número cresce todo mês que passa sem ação.
          </p>
        </div>
      </FadeIn>
    </section>
  )
}

// ─── SEÇÃO 5: VALOR E PLANO ───────────────────────────────────────────────────

function SecaoValor({ data }: { data: DiagnosticData }) {
  const tc = data.taxaConversao ?? 2
  const tf = data.taxaFechamento ?? 30
  const ticket = data.ticketMedio ?? 300

  const valorMensalAtual = data.currentMonthlyOrganicVisits * data.estimatedCpcAverage
  const valuationAtual = Math.round(valorMensalAtual * data.valuationMultiplier)

  const trafegoProjetado = data.currentMonthlyOrganicVisits * 4
  const valorMensalProjetado = trafegoProjetado * data.estimatedCpcAverage
  const valuationProjetado = Math.round(valorMensalProjetado * data.valuationMultiplier)

  const receitaAdicionalMensal12m = Math.round(
    (trafegoProjetado - data.currentMonthlyOrganicVisits) * (tc / 100) * (tf / 100) * ticket
  )
  const receitaAdicionalAcumulada = receitaAdicionalMensal12m * 12

  const projecoes = [
    { periodo: '30 dias', trafego: Math.round(data.currentMonthlyOrganicVisits * 1.25), acoes: data.roadmapLevel1?.split('\n')[0] || 'Correções técnicas e quick wins' },
    { periodo: '60 dias', trafego: Math.round(data.currentMonthlyOrganicVisits * 1.8), acoes: 'Primeiros artigos indexando, sinais de presença nas IAs' },
    { periodo: '90 dias', trafego: Math.round(data.currentMonthlyOrganicVisits * 2.4), acoes: 'Autoridade começando a se consolidar, redução do custo de aquisição' },
  ]

  return (
    <section className="py-12 px-4 max-w-5xl mx-auto">
      <SecaoHeader
        num="05"
        titulo="Valor & Plano de Crescimento"
        subtitulo="SEO não é custo. É o ativo mais previsível do seu negócio."
      />

      {/* O que você já vale */}
      <div className="mb-12">
        <FadeIn>
          <h3 className="text-[11px] font-bold uppercase tracking-[0.25em] text-text-muted mb-5">O Que Você Já Vale Hoje</h3>
        </FadeIn>

        {valuationAtual > 0 ? (
          <FadeIn delay={100}>
            <div
              className="rounded-2xl p-8 mb-4"
              style={{ background: 'rgba(18,123,240,0.04)', border: '1px solid rgba(18,123,240,0.14)' }}
            >
              <div className="grid md:grid-cols-2 gap-8 md:gap-0">
                <div className="text-center md:text-left md:pr-8 md:border-r" style={{ borderColor: 'rgba(18,123,240,0.1)' }}>
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-text-muted mb-3">Patrimônio digital hoje</p>
                  <div
                    className="hero-number"
                    style={{ fontSize: 'clamp(40px, 8vw, 68px)', color: 'var(--color-text-primary)' }}
                  >
                    <CountUp end={valuationAtual} prefix="R$ " duration={2000} />
                  </div>
                </div>
                <div className="text-center md:text-right md:pl-8">
                  <p
                    className="text-[10px] font-bold uppercase tracking-[0.3em] mb-3"
                    style={{ color: 'var(--color-blue)' }}
                  >Projetado em 12 meses</p>
                  <div
                    className="hero-number"
                    style={{
                      fontSize: 'clamp(40px, 8vw, 68px)',
                      color: 'var(--color-blue)',
                      textShadow: '0 0 40px rgba(18,123,240,0.2)',
                    }}
                  >
                    <CountUp end={valuationProjetado} prefix="R$ " duration={2200} />
                  </div>
                </div>
              </div>
              <p
                className="text-center text-xs text-text-muted mt-6 pt-5"
                style={{ borderTop: '1px solid rgba(18,123,240,0.08)' }}
              >
                Baseado em {fNum(data.currentMonthlyOrganicVisits)} acessos/mês × R$ {data.estimatedCpcAverage.toFixed(2)}/clique × {data.valuationMultiplier}×.{' '}
                Projeção: {data.valuationMultiplier === 36 ? '4×' : '3×'} o tráfego atual em 12 meses com SEO estruturado.
              </p>
            </div>
          </FadeIn>
        ) : (
          <FadeIn delay={100}>
            <div className="glass-panel p-8 text-center">
              <p className="text-xl font-bold text-text-primary mb-2">Patrimônio digital ainda não construído</p>
              <p className="text-text-secondary font-light">Esta não é uma falha — é uma oportunidade. O ativo ainda pode ser criado do zero.</p>
            </div>
          </FadeIn>
        )}

        {data.valuationNotes && (
          <FadeIn delay={200}>
            <div className="glass-panel p-5 text-sm text-text-secondary leading-relaxed border-l-2 mt-4" style={{ borderLeftColor: 'var(--color-blue)' }}>
              {data.valuationNotes}
            </div>
          </FadeIn>
        )}
      </div>

      {/* Receita adicional */}
      {receitaAdicionalMensal12m > 0 && (
        <div className="mb-12">
          <FadeIn>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.25em] text-text-muted mb-5">O Que Você Vai Gerar</h3>
          </FadeIn>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: 'Receita adicional/mês (12 meses)', val: receitaAdicionalMensal12m },
              { label: 'Receita adicional acumulada', val: receitaAdicionalAcumulada },
              { label: 'Diferença de patrimônio', val: valuationProjetado - valuationAtual },
            ].map(({ label, val }, i) => (
              <TiltCard key={label} delay={i * 100}>
                <div className="text-[11px] font-light text-text-muted mb-1 uppercase tracking-wider leading-tight">{label}</div>
                <div className="text-2xl font-bold" style={{ color: 'var(--color-blue)' }}>
                  <CountUp end={val} prefix="R$ " />
                </div>
              </TiltCard>
            ))}
          </div>
        </div>
      )}

      {/* 30/60/90 dias */}
      <div className="mb-12">
        <FadeIn>
          <h3 className="text-[11px] font-bold uppercase tracking-[0.25em] text-text-muted mb-5">Onde Você Estará em 30, 60 e 90 Dias</h3>
        </FadeIn>
        <div className="grid md:grid-cols-3 gap-4">
          {projecoes.map(({ periodo, trafego, acoes }, i) => {
            const leads = Math.round((trafego - data.currentMonthlyOrganicVisits) * (tc / 100))
            const receita = Math.round(leads * (tf / 100) * ticket)
            const isFirst = i === 0
            return (
              <FadeIn key={periodo} delay={i * 120}>
                <div
                  className="glass-panel p-6 h-full relative overflow-hidden"
                  style={isFirst ? { border: '1px solid rgba(18,123,240,0.25)' } : {}}
                >
                  <div
                    className="absolute -right-2 -top-4 hero-number opacity-5 select-none"
                    style={{ fontSize: '80px', color: 'var(--color-blue)', lineHeight: 1 }}
                  >{i + 1}</div>
                  <div
                    className="text-[11px] font-bold uppercase tracking-widest mb-3"
                    style={{ color: 'var(--color-blue)' }}
                  >{periodo}</div>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-text-muted">Tráfego projetado</span>
                      <span className="font-bold text-text-primary">{fNum(trafego)}/mês</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-text-muted">Leads adicionais</span>
                      <span className="font-bold text-text-primary">+{fNum(Math.max(0, leads))}</span>
                    </div>
                    {receita > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-text-muted">Receita adicional</span>
                        <span className="font-bold" style={{ color: 'var(--color-blue)' }}>{fBRL(receita)}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-text-muted leading-relaxed">{acoes}</p>
                </div>
              </FadeIn>
            )
          })}
        </div>
      </div>

      {/* Plano em 3 níveis */}
      <div className="mb-12">
        <FadeIn>
          <h3 className="text-[11px] font-bold uppercase tracking-[0.25em] text-text-muted mb-5">O Plano em 3 Níveis</h3>
        </FadeIn>
        <div className="space-y-3">
          {[
            { num: 1, titulo: 'Ajuste', subtitulo: 'Arrumar a Casa', prazo: 'Semanas 1–4', conteudo: data.roadmapLevel1, cor: 'var(--color-blue)', corRaw: 'rgba(18,123,240' },
            { num: 2, titulo: 'Reconstrução', subtitulo: 'Foco em IA', prazo: 'Meses 2–4', conteudo: data.roadmapLevel2, cor: '#7c3aed', corRaw: 'rgba(124,58,237' },
            { num: 3, titulo: 'Crescimento', subtitulo: 'Dominância', prazo: data.timelineSuggestion || 'Longo Prazo', conteudo: data.roadmapLevel3, cor: '#16a34a', corRaw: 'rgba(22,163,74' },
          ].map((nivel, i) => (
            <FadeIn key={nivel.num} delay={i * 120}>
              <div
                className="rounded-2xl p-7 relative overflow-hidden"
                style={{
                  background: `${nivel.corRaw},0.04)`,
                  border: `1px solid ${nivel.corRaw},0.15)`,
                  borderLeftWidth: '4px',
                  borderLeftColor: nivel.cor,
                }}
              >
                <div
                  className="absolute -right-2 top-2 hero-number select-none pointer-events-none"
                  style={{ fontSize: '8rem', color: `${nivel.corRaw},0.07)`, lineHeight: 1 }}
                >
                  {nivel.num}
                </div>
                <div className="flex flex-wrap items-start gap-3 mb-4 relative">
                  <div className="hero-number leading-none" style={{ fontSize: '2.5rem', color: nivel.cor }}>
                    {nivel.num}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-text-primary">{nivel.titulo}</h4>
                    <div className="flex flex-wrap gap-2 mt-1.5">
                      <span
                        className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                        style={{ background: `${nivel.corRaw},0.1)`, color: nivel.cor }}
                      >{nivel.subtitulo}</span>
                      <span
                        className="text-[10px] font-bold px-2.5 py-1 rounded-full text-text-muted"
                        style={{ background: 'rgba(18,123,240,0.05)', border: '1px solid rgba(18,123,240,0.12)' }}
                      >{nivel.prazo}</span>
                    </div>
                  </div>
                </div>
                <p className="font-light text-text-secondary leading-relaxed whitespace-pre-wrap text-sm relative">
                  {nivel.conteudo}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>

      {/* Insight final */}
      <FadeIn delay={300}>
        <div
          className="p-7 rounded-2xl mb-6"
          style={{ background: 'rgba(18,123,240,0.05)', border: '1px solid rgba(18,123,240,0.15)' }}
        >
          <div
            className="display-italic mb-4"
            style={{ color: 'rgba(18,123,240,0.7)', fontSize: '1.25rem' }}
          >
            "A pergunta não é se alguém vai capturar essa demanda. A pergunta é se vai ser você ou seu concorrente."
          </div>
          <p className="text-base font-light text-text-secondary leading-relaxed">
            Com o plano executado, a <strong className="text-text-primary">{data.companyName}</strong> sai de{' '}
            <strong className="text-text-primary">{fBRL(valuationAtual)}</strong> para{' '}
            <strong style={{ color: 'var(--color-blue)' }}>{fBRL(valuationProjetado)}</strong> em patrimônio digital, gerando{' '}
            <strong className="text-text-primary">{fBRL(receitaAdicionalMensal12m)}/mês</strong> em receita adicional em 12 meses — sem depender de anúncios pagos.
          </p>
        </div>
      </FadeIn>

      {/* Fechamento humano */}
      {(data.observacaoFinal || data.nomeConsultor) && (
        <FadeIn delay={400}>
          <div
            className="glass-panel p-8"
            style={{ borderTop: '3px solid rgba(18,123,240,0.25)' }}
          >
            {data.observacaoFinal && (
              <p className="text-base font-light text-text-primary leading-relaxed mb-7 whitespace-pre-wrap">
                {data.observacaoFinal}
              </p>
            )}
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="font-bold text-text-primary">{data.nomeConsultor || 'Analista de Ativos Digitais'}</p>
                <p className="text-sm" style={{ color: 'var(--color-blue)' }}>Upsend Brasil</p>
              </div>
              <p className="text-xs text-text-muted">
                {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <p
              className="text-xs italic mt-4 pt-4 text-text-muted"
              style={{ borderTop: '1px solid rgba(18,123,240,0.08)' }}
            >
              Este diagnóstico foi construído com análise humana dedicada para mapear a realidade específica da {data.companyName}. Não é um relatório automático — é um mapa do seu próximo movimento.
            </p>
          </div>
        </FadeIn>
      )}
    </section>
  )
}

// ─── CTA Footer ───────────────────────────────────────────────────────────────

function CTAFooter({ companyName }: { companyName: string }) {
  return (
    <footer
      className="relative overflow-hidden py-24 px-4 text-center"
      style={{ borderTop: '1px solid rgba(18,123,240,0.1)' }}
    >
      {/* Atmospheric glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[280px]"
          style={{ background: 'radial-gradient(ellipse at top, rgba(18,123,240,0.1) 0%, transparent 70%)' }}
        />
      </div>

      <FadeIn className="relative z-10 max-w-xl mx-auto">
        {/* Eyebrow */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="h-px w-10" style={{ background: 'var(--color-blue)', opacity: 0.3 }} />
          <p
            className="text-[10px] font-bold uppercase tracking-[0.35em]"
            style={{ color: 'var(--color-blue)' }}
          >Próximo Passo</p>
          <div className="h-px w-10" style={{ background: 'var(--color-blue)', opacity: 0.3 }} />
        </div>

        {/* Headline */}
        <h2
          className="font-bold mb-5 leading-tight text-text-primary"
          style={{ fontSize: 'clamp(26px, 5vw, 42px)' }}
        >
          Pronto para transformar este{' '}
          <span className="display-italic" style={{ color: 'var(--color-blue)' }}>
            diagnóstico em resultados?
          </span>
        </h2>

        <p className="text-text-secondary font-light max-w-md mx-auto mb-10 leading-relaxed">
          Cada ponto no score é receita que está na mesa. Nossa equipe já sabe o que fazer para{' '}
          <strong className="text-text-primary">{companyName}</strong> — a questão é quando você quer começar.
        </p>

        {/* CTA */}
        <a
          href="https://wa.me/5531984979207"
          target="_blank"
          rel="noopener noreferrer"
          className="glossy-blue inline-flex items-center gap-3 px-10 py-4 rounded-xl text-base font-bold text-white"
        >
          Falar com a Upsend <ArrowRight className="w-5 h-5" />
        </a>

        <p className="text-xs text-text-muted mt-4">
          Resposta em até 2 horas úteis · Sem compromisso
        </p>

        <div
          className="mt-12 pt-7"
          style={{ borderTop: '1px solid rgba(18,123,240,0.08)' }}
        >
          <div
            className="font-display font-bold mb-1"
            style={{ fontSize: '1.1rem', color: 'var(--color-blue)', letterSpacing: '0.05em' }}
          >
            Upsend Brasil
          </div>
          <p className="text-xs text-text-muted">
            Diagnóstico gerado em {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </FadeIn>
    </footer>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function PresentationPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [data, setData] = useState<DiagnosticData | null>(null)
  const [loading, setLoading] = useState(true)
  const { secaoAtiva, transitioning, handleTabSelect } = useDiagnostico()

  useEffect(() => {
    if (!slug) {
      setLoading(false)
      return
    }

    async function carregar() {
      const { data: result, error } = await supabase
        .from('diagnosticos')
        .select('dados')
        .eq('id', slug)
        .single()

      if (!error && result?.dados) {
        setData(result.dados as DiagnosticData)
      }

      setLoading(false)
    }

    carregar()
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-10 h-10 border-2 rounded-full animate-spin"
            style={{ borderColor: 'rgba(18,123,240,0.2)', borderTopColor: 'var(--color-blue)' }}
          />
          <p className="text-text-muted font-mono text-xs tracking-[0.3em] uppercase">
            Carregando diagnóstico…
          </p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-primary font-bold text-xl mb-4">Diagnóstico não encontrado</p>
          <button onClick={() => navigate('/')} className="glossy-blue text-white px-6 py-2.5 rounded-lg text-sm">
            Voltar ao formulário
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-base">
      {/* Tab content with fade transition */}
      <div
        style={{
          opacity: transitioning ? 0 : 1,
          transform: transitioning ? 'translateY(8px)' : 'translateY(0)',
          transition: 'opacity 160ms ease, transform 160ms ease',
        }}
      >
        {secaoAtiva === 'espelho' && (
          <SecaoEspelho data={data} onNext={() => handleTabSelect('mercado')} />
        )}
        {secaoAtiva === 'mercado' && <SecaoMercado data={data} />}
        {secaoAtiva === 'visibilidade' && <SecaoVisibilidade data={data} />}
        {secaoAtiva === 'perdas' && <SecaoPerdas data={data} />}
        {secaoAtiva === 'valor' && <SecaoValor data={data} />}

        {/* Prev / Next at bottom of each section */}
        <div className="max-w-5xl mx-auto px-4 pb-10">
          <TabNav ativa={secaoAtiva} onSelect={handleTabSelect} />
        </div>
      </div>
    </div>
  )
}
