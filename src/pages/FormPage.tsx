import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { DiagnosticData, Competitor } from '../types'
import { supabase } from '../lib/supabase'
import { Plus, Trash2, ArrowRight, Eye, ChevronDown, Info } from 'lucide-react'

const initialData: DiagnosticData = {
  companyName: '',
  responsibleName: '',
  nomeConsultor: '',
  areasDiagnosed: [],
  totalMonthlySearches: 0,
  geographicMarket: '',
  mainKeywords: '',
  crescimentoMercado: 'estavel',
  sazonalidadeExiste: false,
  sazonalidadeMesPico: '',
  sazonalidadeMesBaixa: '',
  currentMonthlyOrganicVisits: 0,
  temSite: true,
  hasSSL: true,
  isMobileResponsive: true,
  temBlog: false,
  totalArtigos: 0,
  pageSpeedMobile: 0,
  pageSpeedDesktop: 0,
  impressoesMensaisGSC: 0,
  cliquesGSC: 0,
  ctrMedioGSC: 0,
  posicaoMediaGSC: 0,
  taxaConversao: 2,
  taxaFechamento: 30,
  ticketMedio: 300,
  mainProblems: [],
  customProblem: '',
  solutions: [],
  solutionDescriptions: {},
  competitors: [],
  chatGptMentions: 'no',
  geminiMentions: 'no',
  perplexityMentions: 'no',
  sentimentVsCompetitors: 'Neutral',
  geoAuditNotes: '',
  runsGoogleAds: false,
  monthlyAdsBudget: 0,
  termsPayingForOrganic: '',
  estimatedMonthlyWaste: 0,
  adsLeakageNotes: '',
  gbpHasProfile: false,
  gbpRating: 0,
  gbpTotalReviews: 0,
  estimatedCpcAverage: 0,
  valuationMultiplier: 36,
  valuationNotes: '',
  roadmapLevel1: '',
  roadmapLevel2: '',
  roadmapLevel3: '',
  timelineSuggestion: '',
  observacaoFinal: '',
}

const AREAS = ['Site/E-commerce', 'SEO', 'GEO', 'Todos os anteriores']
const PROBLEMS = [
  'Não possui site',
  'Possui site mas não é otimizado',
  'Nenhum trabalho de SEO',
  'Nenhum trabalho de GEO',
  'Não faz Google Ads',
]
const SOLUTIONS = ['Auditoria e Ajustes', 'Desenvolvimento de SEO', 'Desenvolvimento de GEO']

// ─── UI Primitives ─────────────────────────────────────────────────────────────

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center gap-3 text-sm font-medium cursor-pointer select-none"
      style={{ color: 'var(--color-text-secondary)' }}
    >
      <div
        className="form-toggle"
        style={{ background: checked ? 'var(--color-blue)' : 'rgba(18,123,240,0.15)' }}
      >
        <div
          className="form-toggle-thumb"
          style={{ transform: checked ? 'translateX(16px)' : 'translateX(0)' }}
        />
      </div>
      {label}
    </button>
  )
}

function CheckPill({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`check-pill ${checked ? 'check-pill-on' : 'check-pill-off'}`}
    >
      {checked && <span>✓</span>}
      {label}
    </button>
  )
}

function FormField({
  label,
  hint,
  required,
  children,
}: {
  label: string
  hint?: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div>
      <label className={`form-label ${required ? 'form-label-required' : ''}`}>{label}</label>
      {children}
      {hint && <p className="form-hint">{hint}</p>}
    </div>
  )
}

function TooltipInfo({ text }: { text: string }) {
  const [show, setShow] = useState(false)
  return (
    <span className="relative inline-block ml-1">
      <button
        type="button"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onFocus={() => setShow(true)}
        onBlur={() => setShow(false)}
        className="inline-flex items-center justify-center w-4 h-4 rounded-full cursor-help"
        style={{ background: 'rgba(18,123,240,0.12)', color: 'var(--color-blue)' }}
        aria-label="Mais informações"
      >
        <Info className="w-2.5 h-2.5" />
      </button>
      {show && (
        <div
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 text-xs rounded-lg px-3 py-2 w-56 text-center leading-relaxed pointer-events-none animate-slide-down"
          style={{
            background: 'rgba(26, 39, 66, 0.92)',
            color: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          }}
        >
          {text}
        </div>
      )}
    </span>
  )
}

// ─── Accordion Section ──────────────────────────────────────────────────────────

function SecaoAccordion({
  num,
  titulo,
  descricao,
  completa,
  aberta,
  onToggle,
  children,
}: {
  num: number
  titulo: string
  descricao?: string
  completa: boolean
  aberta: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div className={`accordion-section ${aberta ? 'accordion-section-open' : ''}`}>
      <button type="button" onClick={onToggle} className="accordion-header">
        {/* Number badge */}
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm text-white shrink-0 glossy-blue"
          style={{ minWidth: '2.25rem' }}
        >
          {completa ? '✓' : num}
        </div>

        {/* Title + description */}
        <div className="flex-1 min-w-0 text-left">
          <h2
            className="font-display font-bold leading-tight"
            style={{ fontSize: '1.0625rem', color: 'var(--color-text-primary)' }}
          >
            {titulo}
          </h2>
          {descricao && !aberta && (
            <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--color-text-muted)' }}>
              {descricao}
            </p>
          )}
        </div>

        {/* Status chip */}
        {completa && !aberta && (
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 hidden sm:inline-flex"
            style={{ background: 'rgba(16,185,129,0.1)', color: '#059669' }}
          >
            Preenchido
          </span>
        )}

        {/* Chevron */}
        <ChevronDown
          className="w-4 h-4 shrink-0 transition-transform duration-300"
          style={{
            color: 'var(--color-text-muted)',
            transform: aberta ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
      </button>

      {/* Expandable body */}
      <div
        className="accordion-content"
        style={{ maxHeight: aberta ? '9999px' : '0' }}
      >
        <div
          className="px-6 pb-6 pt-2"
          style={{ borderTop: '1px solid rgba(18,123,240,0.07)' }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}

// ─── Competitor card ──────────────────────────────────────────────────────────

function ConcorrenteCard({
  c,
  idx,
  onRemove,
  onUpdate,
}: {
  c: Competitor
  idx: number
  onRemove: () => void
  onUpdate: (field: keyof Competitor, value: string | number | boolean) => void
}) {
  const [expandido, setExpandido] = useState(true)
  const temNome = !!c.name

  return (
    <div className="competitor-card mb-3">
      <div
        className="competitor-card-header"
        onClick={() => setExpandido((p) => !p)}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
            style={{ background: 'var(--color-blue)', opacity: 0.85 }}
          >
            {idx + 1}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>
              {temNome ? c.name : `Concorrente ${idx + 1}`}
            </p>
            {temNome && c.url && (
              <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>
                {c.url}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onRemove() }}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: 'rgba(220,38,38,0.6)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(220,38,38,0.07)' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <ChevronDown
            className="w-4 h-4 transition-transform duration-200"
            style={{
              color: 'var(--color-text-muted)',
              transform: expandido ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          />
        </div>
      </div>

      <div
        className="accordion-content"
        style={{ maxHeight: expandido ? '9999px' : '0' }}
      >
        <div className="px-4 pb-4 pt-1 space-y-4" style={{ borderTop: '1px solid rgba(18,123,240,0.07)' }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Nome da empresa" required>
              <input
                className="form-input"
                value={c.name}
                onChange={(e) => onUpdate('name', e.target.value)}
                placeholder="Ex: Clínica Renovar"
              />
            </FormField>
            <FormField label="Site (URL)">
              <input
                className="form-input"
                value={c.url || ''}
                onChange={(e) => onUpdate('url', e.target.value)}
                placeholder="site.com.br"
              />
            </FormField>
            <FormField label="Acessos orgânicos/mês" hint="Pesquise no SimilarWeb ou Semrush">
              <input
                type="number"
                className="form-input"
                value={c.monthlyVisits || ''}
                onChange={(e) => onUpdate('monthlyVisits', Number(e.target.value))}
                placeholder="Ex: 8000"
              />
            </FormField>
            <FormField label="Avaliação GBP (1–5)">
              <input
                type="number"
                step="0.1"
                min="0"
                max="5"
                className="form-input"
                value={c.gbpRating || ''}
                onChange={(e) => onUpdate('gbpRating', Number(e.target.value))}
                placeholder="Ex: 4.7"
              />
            </FormField>
            <FormField label="Nº avaliações GBP">
              <input
                type="number"
                className="form-input"
                value={c.gbpReviews || ''}
                onChange={(e) => onUpdate('gbpReviews', Number(e.target.value))}
                placeholder="Ex: 180"
              />
            </FormField>
            <FormField label="Qtd. de conteúdos (artigos, páginas)">
              <input
                type="number"
                className="form-input"
                value={c.contentCount || ''}
                onChange={(e) => onUpdate('contentCount', Number(e.target.value))}
                placeholder="Ex: 35"
              />
            </FormField>
          </div>

          <div>
            <p className="form-label mb-2">Presença digital</p>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'hasAptWebsite', label: 'Site otimizado' },
                { key: 'doesSEO', label: 'Faz SEO' },
                { key: 'doesGEO', label: 'Aparece nas IAs' },
                { key: 'runsAds', label: 'Investe em Ads' },
              ].map(({ key, label }) => (
                <React.Fragment key={key}>
                  <CheckPill
                    checked={(c[key as keyof Competitor] as boolean) || false}
                    onChange={(v) => onUpdate(key as keyof Competitor, v)}
                    label={label}
                  />
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Ponto forte principal">
              <input
                className="form-input"
                value={c.mainStrength || ''}
                onChange={(e) => onUpdate('mainStrength', e.target.value)}
                placeholder="Ex: Blog com 48 artigos ranqueados"
              />
            </FormField>
            <FormField label="Ponto fraco principal">
              <input
                className="form-input"
                value={c.mainWeakness || ''}
                onChange={(e) => onUpdate('mainWeakness', e.target.value)}
                placeholder="Ex: Zero estratégia GEO"
              />
            </FormField>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function FormPage() {
  const [data, setData] = useState<DiagnosticData>(initialData)
  const [secoesAbertas, setSecoesAbertas] = useState<Set<number>>(new Set([1]))
  const [salvando, setSalvando] = useState(false)
  const [erroSalvar, setErroSalvar] = useState<string | null>(null)
  const navigate = useNavigate()

  const toggleSecao = (num: number) => {
    setSecoesAbertas((prev) => {
      const next = new Set(prev)
      if (next.has(num)) next.delete(num)
      else next.add(num)
      return next
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setData((prev) => ({ ...prev, [name]: type === 'number' ? Number(value) : value }))
  }

  const handleCheckboxChange = (name: keyof DiagnosticData, value: string, checked: boolean) => {
    setData((prev) => {
      const current = (prev[name] as string[]) || []
      if (value === 'Todos os anteriores' && checked) {
        return { ...prev, [name]: AREAS }
      }
      return { ...prev, [name]: checked ? [...current, value] : current.filter((i) => i !== value) }
    })
  }

  const handleSolutionDescriptionChange = (solution: string, desc: string) => {
    setData((prev) => ({ ...prev, solutionDescriptions: { ...prev.solutionDescriptions, [solution]: desc } }))
  }

  const addCompetitor = () => {
    const novo: Competitor = {
      id: `c${Date.now()}`,
      name: '',
      url: '',
      monthlyVisits: 0,
      hasAptWebsite: false,
      doesSEO: false,
      doesGEO: false,
      runsAds: false,
      contentCount: 0,
      gbpRating: 0,
      gbpReviews: 0,
      mainStrength: '',
      mainWeakness: '',
    }
    setData((prev) => ({ ...prev, competitors: [...prev.competitors, novo] }))
  }

  const removeCompetitor = (id: string) => {
    setData((prev) => ({ ...prev, competitors: prev.competitors.filter((c) => c.id !== id) }))
  }

  const updateCompetitor = (id: string, field: keyof Competitor, value: string | number | boolean) => {
    setData((prev) => ({
      ...prev,
      competitors: prev.competitors.map((c) => (c.id === id ? { ...c, [field]: value } : c)),
    }))
  }

  // ── Completion ────────────────────────────────────────────────────────────────
  const completions = useMemo(
    () => [
      !!data.companyName && data.areasDiagnosed.length > 0,
      data.totalMonthlySearches > 0 && !!data.geographicMarket,
      data.pageSpeedMobile > 0 || data.pageSpeedDesktop > 0,
      data.gbpHasProfile,
      data.taxaConversao > 0 && data.ticketMedio > 0,
      data.mainProblems.length > 0,
      data.competitors.length > 0,
      data.chatGptMentions !== '' || !!data.geoAuditNotes,
      true,
      data.estimatedCpcAverage > 0,
      !!data.roadmapLevel1 && !!data.roadmapLevel2 && !!data.roadmapLevel3,
      !!data.observacaoFinal,
    ],
    [data]
  )

  const progresso = useMemo(() => {
    const criticos = [
      !!data.companyName,
      data.totalMonthlySearches > 0,
      data.currentMonthlyOrganicVisits > 0,
      data.estimatedCpcAverage > 0,
      !!data.roadmapLevel1,
    ]
    return Math.round((criticos.filter(Boolean).length / criticos.length) * 100)
  }, [data])

  // ── Valuation ─────────────────────────────────────────────────────────────────
  const cpcRef = data.estimatedCpcAverage > 0 ? data.estimatedCpcAverage : 8.5
  const visitsRef = data.currentMonthlyOrganicVisits > 0 ? data.currentMonthlyOrganicVisits : 1000
  const ativoHoje = visitsRef * cpcRef * data.valuationMultiplier
  const ativoProjetado = visitsRef * 4 * cpcRef * data.valuationMultiplier
  const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v)

  // ── Submit ─────────────────────────────────────────────────────────────────────
  const handleSimulate = async () => {
    const dummyData: DiagnosticData = {
      companyName: 'Clínica Bem Estar',
      responsibleName: 'Dra. Camila Torres',
      nomeConsultor: 'Ítalo Ribeiro — Consultor Upsend Brasil',
      areasDiagnosed: ['SEO', 'GEO'],
      totalMonthlySearches: 42000,
      geographicMarket: 'São Paulo, SP — Local',
      mainKeywords: 'clínica de estética sp, tratamento facial são paulo, botox zona sul',
      crescimentoMercado: 'crescendo',
      sazonalidadeExiste: true,
      sazonalidadeMesPico: 'Novembro',
      sazonalidadeMesBaixa: 'Fevereiro',
      currentMonthlyOrganicVisits: 1800,
      temSite: true,
      hasSSL: true,
      isMobileResponsive: false,
      temBlog: false,
      totalArtigos: 0,
      pageSpeedMobile: 38,
      pageSpeedDesktop: 71,
      impressoesMensaisGSC: 12400,
      cliquesGSC: 1800,
      ctrMedioGSC: 14.5,
      posicaoMediaGSC: 18.3,
      taxaConversao: 2.5,
      taxaFechamento: 40,
      ticketMedio: 480,
      mainProblems: ['Possui site mas não é otimizado', 'Nenhum trabalho de GEO'],
      customProblem: 'Site não carrega bem no celular — 53% do tráfego é mobile',
      solutions: ['Auditoria e Ajustes', 'Desenvolvimento de SEO', 'Desenvolvimento de GEO'],
      solutionDescriptions: {
        'Auditoria e Ajustes': 'Correção de Core Web Vitals, compressão de imagens, remoção de scripts bloqueantes.',
        'Desenvolvimento de SEO': 'Clusters de conteúdo para estética facial e procedimentos minimamente invasivos.',
        'Desenvolvimento de GEO': 'E-E-A-T para a Dra. Camila, FAQ estruturado para IAs, PR em portais de saúde.',
      },
      competitors: [
        {
          id: 'c1',
          name: 'Clínica Estética Prime',
          url: 'esteticaprime.com.br',
          monthlyVisits: 14000,
          hasAptWebsite: true,
          doesSEO: true,
          doesGEO: false,
          runsAds: true,
          contentCount: 48,
          gbpRating: 4.8,
          gbpReviews: 312,
          mainStrength: 'Blog com 48 artigos ranqueando para palavras de alta intenção',
          mainWeakness: 'Não aparece nas IAs — zero estratégia GEO',
        },
        {
          id: 'c2',
          name: 'Bella Estética BH',
          url: 'bellaestetica.com.br',
          monthlyVisits: 6200,
          hasAptWebsite: true,
          doesSEO: false,
          doesGEO: false,
          runsAds: true,
          contentCount: 8,
          gbpRating: 4.5,
          gbpReviews: 87,
          mainStrength: 'Forte presença no Instagram — 28k seguidores',
          mainWeakness: 'Tráfego orgânico quase zero, 100% dependente de Ads',
        },
      ],
      chatGptMentions: 'no',
      geminiMentions: 'no',
      perplexityMentions: 'partial',
      sentimentVsCompetitors: 'Invisible',
      geoAuditNotes:
        'Clínica Estética Prime aparece no ChatGPT e Gemini. Bella Estética aparece no Gemini. Clínica Bem Estar não é citada em nenhum.',
      runsGoogleAds: true,
      monthlyAdsBudget: 8500,
      termsPayingForOrganic: 'clínica de estética sp, tratamento pele, botox são paulo',
      estimatedMonthlyWaste: 2890,
      adsLeakageNotes: 'Aproximadamente R$ 2.890/mês em termos que a Clínica Prime já ranqueia organicamente.',
      gbpHasProfile: true,
      gbpRating: 4.3,
      gbpTotalReviews: 47,
      estimatedCpcAverage: 9.2,
      valuationMultiplier: 36,
      valuationNotes: 'Tráfego atual de 1.800 visitas/mês × R$ 9,20/clique = R$ 16.560/mês em mídia equivalente.',
      roadmapLevel1:
        'Correção de Core Web Vitals (LCP mobile de 6,2s para < 2,5s), schema markup para saúde, otimização de meta tags, GBP completado.',
      roadmapLevel2:
        '12 artigos estratégicos, FAQ estruturado para IAs, PR digital em 4 portais de saúde para E-E-A-T.',
      roadmapLevel3:
        'Expansão para cidades vizinhas, dominância em featured snippets, clusters de autoridade consolidados.',
      timelineSuggestion: '12 a 18 meses',
      observacaoFinal:
        'A Clínica Bem Estar está num momento crítico. O mercado de estética em SP cresce 22% ao ano e dois concorrentes já investem em SEO. Existe uma janela de 6 meses antes que a posição deles nas IAs fique consolidada.',
    }
    setSalvando(true)
    setErroSalvar(null)
    const { data: result, error } = await supabase.from('diagnosticos').insert({ dados: dummyData }).select('id').single()
    setSalvando(false)
    if (error || !result) {
      setErroSalvar('Erro ao salvar. Verifique as variáveis de ambiente do Supabase.')
      return
    }
    navigate(`/diagnostico/${result.id}`)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSalvando(true)
    setErroSalvar(null)
    const { data: result, error } = await supabase.from('diagnosticos').insert({ dados: data }).select('id').single()
    setSalvando(false)
    if (error || !result) {
      setErroSalvar('Erro ao salvar o diagnóstico. Tente novamente.')
      return
    }
    navigate(`/diagnostico/${result.id}`)
  }

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ background: 'var(--color-bg-base)' }}>
      <div className="max-w-2xl mx-auto">

        {/* ── Header ────────────────────────────────────────────────────────── */}
        <div className="text-center mb-8 pt-2">
          <h1
            className="font-display font-bold mb-2"
            style={{ fontSize: 'clamp(1.75rem, 4vw, 2.25rem)', color: 'var(--color-text-primary)' }}
          >
            Diagnóstico Digital
          </h1>
          <p className="text-sm mb-1" style={{ color: 'var(--color-text-muted)' }}>
            Preencha os dados do prospect para gerar o relatório interativo · ~5 minutos
          </p>

          <button
            type="button"
            onClick={handleSimulate}
            disabled={salvando}
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl transition-all"
            style={{
              background: 'rgba(255,255,255,0.85)',
              border: '1.5px solid rgba(18,123,240,0.18)',
              color: 'var(--color-blue)',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 2px 12px rgba(18,123,240,0.08)',
            }}
          >
            <Eye className="w-4 h-4" />
            Ver exemplo simulado
          </button>
        </div>

        {/* ── Progress bar ─────────────────────────────────────────────────── */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>
              Campos críticos preenchidos
            </span>
            <span className="text-xs font-bold" style={{ color: 'var(--color-blue)' }}>
              {progresso}%
            </span>
          </div>
          <div className="form-progress-bar">
            <div className="form-progress-fill" style={{ width: `${progresso}%` }} />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">

          {/* ═══ Seção 1 — Identificação ═══════════════════════════════════ */}
          <SecaoAccordion
            num={1}
            titulo="Identificação"
            descricao={data.companyName || 'Nome da empresa, responsável, consultor'}
            completa={completions[0]}
            aberta={secoesAbertas.has(1)}
            onToggle={() => toggleSecao(1)}
          >
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Nome da empresa" required>
                  <input
                    name="companyName"
                    value={data.companyName}
                    onChange={handleChange}
                    required
                    className="form-input"
                    placeholder="Ex: Clínica Bem Estar"
                  />
                </FormField>
                <FormField label="Responsável no cliente">
                  <input
                    name="responsibleName"
                    value={data.responsibleName}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Nome do dono ou gerente"
                  />
                </FormField>
                <div className="sm:col-span-2">
                  <FormField label="Seu nome — Consultor Upsend">
                    <input
                      name="nomeConsultor"
                      value={data.nomeConsultor || ''}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Ex: Ana Paula — Analista de Ativos Digitais"
                    />
                  </FormField>
                </div>
              </div>

              <div>
                <p className="form-label">Áreas diagnosticadas</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {AREAS.map((area) => (
                    <React.Fragment key={area}>
                      <CheckPill
                        checked={data.areasDiagnosed.includes(area)}
                        onChange={(v) => handleCheckboxChange('areasDiagnosed', area, v)}
                        label={area}
                      />
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          </SecaoAccordion>

          {/* ═══ Seção 2 — Mercado ════════════════════════════════════════════ */}
          <SecaoAccordion
            num={2}
            titulo="Mercado"
            descricao="Volume de buscas, mercado geográfico, keywords"
            completa={completions[1]}
            aberta={secoesAbertas.has(2)}
            onToggle={() => toggleSecao(2)}
          >
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  label="Volume total de buscas/mês"
                  hint="Total de buscas mensais pelo segmento na região"
                  required
                >
                  <input
                    type="number"
                    name="totalMonthlySearches"
                    value={data.totalMonthlySearches || ''}
                    onChange={handleChange}
                    required
                    className="form-input"
                    placeholder="Ex: 42000"
                  />
                </FormField>
                <FormField
                  label="Acessos orgânicos atuais/mês"
                  hint="Visitas mensais vindas de buscas (sem pagar)"
                  required
                >
                  <input
                    type="number"
                    name="currentMonthlyOrganicVisits"
                    value={data.currentMonthlyOrganicVisits || ''}
                    onChange={handleChange}
                    required
                    className="form-input"
                    placeholder="Ex: 1800"
                  />
                </FormField>
                <div className="sm:col-span-2">
                  <FormField label="Mercado geográfico" required>
                    <input
                      name="geographicMarket"
                      value={data.geographicMarket}
                      onChange={handleChange}
                      required
                      className="form-input"
                      placeholder="Ex: São Paulo, SP — Local"
                    />
                  </FormField>
                </div>
                <div className="sm:col-span-2">
                  <FormField label="Top 3 keywords do segmento" hint="Separadas por vírgula">
                    <input
                      name="mainKeywords"
                      value={data.mainKeywords || ''}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="clínica estética sp, tratamento facial, botox sp"
                    />
                  </FormField>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Crescimento do mercado">
                  <select
                    name="crescimentoMercado"
                    value={data.crescimentoMercado || 'estavel'}
                    onChange={handleChange}
                    className="form-input"
                  >
                    <option value="crescendo">📈 Crescendo</option>
                    <option value="estavel">➡️ Estável</option>
                    <option value="retraindo">📉 Retraindo</option>
                  </select>
                </FormField>
                <div className="flex items-center h-full pt-6">
                  <Toggle
                    checked={data.sazonalidadeExiste || false}
                    onChange={(v) => setData((p) => ({ ...p, sazonalidadeExiste: v }))}
                    label="Tem sazonalidade?"
                  />
                </div>
              </div>

              {data.sazonalidadeExiste && (
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Mês de pico">
                    <input
                      name="sazonalidadeMesPico"
                      value={data.sazonalidadeMesPico || ''}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Ex: Novembro"
                    />
                  </FormField>
                  <FormField label="Mês de baixa">
                    <input
                      name="sazonalidadeMesBaixa"
                      value={data.sazonalidadeMesBaixa || ''}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Ex: Fevereiro"
                    />
                  </FormField>
                </div>
              )}
            </div>
          </SecaoAccordion>

          {/* ═══ Seção 3 — Site ═══════════════════════════════════════════════ */}
          <SecaoAccordion
            num={3}
            titulo="Site"
            descricao="Velocidade, responsividade, blog"
            completa={completions[2]}
            aberta={secoesAbertas.has(3)}
            onToggle={() => toggleSecao(3)}
          >
            <div className="space-y-5 pt-4">
              <div>
                <p className="form-label mb-3">Status técnico</p>
                <div className="flex flex-wrap gap-3">
                  {[
                    { key: 'temSite', label: 'Possui site' },
                    { key: 'hasSSL', label: 'HTTPS/SSL ativo' },
                    { key: 'isMobileResponsive', label: 'Responsivo no mobile' },
                    { key: 'temBlog', label: 'Tem blog/conteúdo' },
                  ].map(({ key, label }) => (
                    <React.Fragment key={key}>
                      <CheckPill
                        checked={(data[key as keyof DiagnosticData] as boolean) || false}
                        onChange={(v) => setData((p) => ({ ...p, [key]: v }))}
                        label={label}
                      />
                    </React.Fragment>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <FormField
                  label="PageSpeed Mobile"
                  hint="0–100 · ideal: > 70"
                >
                  <input
                    type="number"
                    name="pageSpeedMobile"
                    value={data.pageSpeedMobile || ''}
                    onChange={handleChange}
                    className="form-input"
                    min="0"
                    max="100"
                    placeholder="Ex: 48"
                  />
                </FormField>
                <FormField
                  label="PageSpeed Desktop"
                  hint="0–100 · ideal: > 90"
                >
                  <input
                    type="number"
                    name="pageSpeedDesktop"
                    value={data.pageSpeedDesktop || ''}
                    onChange={handleChange}
                    className="form-input"
                    min="0"
                    max="100"
                    placeholder="Ex: 82"
                  />
                </FormField>
                {data.temBlog && (
                  <div className="sm:col-span-2">
                    <FormField label="Nº de artigos publicados">
                      <input
                        type="number"
                        name="totalArtigos"
                        value={data.totalArtigos || ''}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="Ex: 24"
                      />
                    </FormField>
                  </div>
                )}
              </div>
            </div>
          </SecaoAccordion>

          {/* ═══ Seção 4 — Google Business Profile ═══════════════════════════ */}
          <SecaoAccordion
            num={4}
            titulo="Google Business Profile"
            descricao="Avaliação, total de reviews"
            completa={completions[3]}
            aberta={secoesAbertas.has(4)}
            onToggle={() => toggleSecao(4)}
          >
            <div className="space-y-4 pt-4">
              <Toggle
                checked={data.gbpHasProfile || false}
                onChange={(v) => setData((p) => ({ ...p, gbpHasProfile: v }))}
                label="Possui GBP configurado?"
              />

              {data.gbpHasProfile && (
                <div className="grid grid-cols-2 gap-4 pt-1">
                  <FormField label="Avaliação (1–5 estrelas)">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      name="gbpRating"
                      value={data.gbpRating || ''}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Ex: 4.3"
                    />
                  </FormField>
                  <FormField label="Total de avaliações">
                    <input
                      type="number"
                      name="gbpTotalReviews"
                      value={data.gbpTotalReviews || ''}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Ex: 87"
                    />
                  </FormField>
                </div>
              )}
            </div>
          </SecaoAccordion>

          {/* ═══ Seção 5 — Métricas de Conversão ════════════════════════════ */}
          <SecaoAccordion
            num={5}
            titulo="Métricas de Conversão"
            descricao="Taxas usadas para calcular receita não capturada"
            completa={completions[4]}
            aberta={secoesAbertas.has(5)}
            onToggle={() => toggleSecao(5)}
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <FormField
                label={
                  <>
                    Taxa de conversão do site (%)
                    <TooltipInfo text="% de visitantes que viram leads. Média do mercado: 2–3%. Use 2 se não souber." />
                  </>
                }
                hint="Visitantes → leads"
              >
                <input
                  type="number"
                  step="0.1"
                  name="taxaConversao"
                  value={data.taxaConversao || ''}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Ex: 2.5"
                />
              </FormField>
              <FormField
                label={
                  <>
                    Taxa de fechamento (%)
                    <TooltipInfo text="% de leads que viram clientes pagantes. Média: 20–40%. Use 30 se não souber." />
                  </>
                }
                hint="Leads → clientes"
              >
                <input
                  type="number"
                  step="1"
                  name="taxaFechamento"
                  value={data.taxaFechamento || ''}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Ex: 35"
                />
              </FormField>
              <FormField
                label="Ticket médio (R$)"
                hint="Valor médio por cliente novo"
              >
                <input
                  type="number"
                  step="10"
                  name="ticketMedio"
                  value={data.ticketMedio || ''}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Ex: 480"
                />
              </FormField>
            </div>
          </SecaoAccordion>

          {/* ═══ Seção 6 — Problemas e Soluções ══════════════════════════════ */}
          <SecaoAccordion
            num={6}
            titulo="Problemas e Soluções"
            descricao="O que foi identificado e o que será proposto"
            completa={completions[5]}
            aberta={secoesAbertas.has(6)}
            onToggle={() => toggleSecao(6)}
          >
            <div className="space-y-5 pt-4">
              <div>
                <p className="form-label mb-2">Problemas identificados</p>
                <div className="flex flex-wrap gap-2">
                  {PROBLEMS.map((p) => (
                    <React.Fragment key={p}>
                      <CheckPill
                        checked={data.mainProblems.includes(p)}
                        onChange={(v) => handleCheckboxChange('mainProblems', p, v)}
                        label={p}
                      />
                    </React.Fragment>
                  ))}
                </div>
              </div>

              <FormField label="Problema personalizado" hint="Algo específico que o template não cobre">
                <input
                  name="customProblem"
                  value={data.customProblem || ''}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Ex: Taxa de conversão muito baixa no mobile"
                />
              </FormField>

              <div>
                <p className="form-label mb-2">Soluções propostas</p>
                <div className="space-y-3">
                  {SOLUTIONS.map((s) => (
                    <div key={s}>
                      <CheckPill
                        checked={data.solutions.includes(s)}
                        onChange={(v) => handleCheckboxChange('solutions', s, v)}
                        label={s}
                      />
                      {data.solutions.includes(s) && (
                        <div className="mt-2 ml-1">
                          <textarea
                            value={data.solutionDescriptions[s] || ''}
                            onChange={(e) => handleSolutionDescriptionChange(s, e.target.value)}
                            className="form-input"
                            style={{ minHeight: '64px' }}
                            placeholder={`Descreva a abordagem para ${s}...`}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </SecaoAccordion>

          {/* ═══ Seção 7 — Concorrentes ═══════════════════════════════════════ */}
          <SecaoAccordion
            num={7}
            titulo="Concorrentes"
            descricao={
              data.competitors.length > 0
                ? `${data.competitors.length} concorrente${data.competitors.length > 1 ? 's' : ''} cadastrado${data.competitors.length > 1 ? 's' : ''}`
                : 'Adicione até 4 concorrentes diretos'
            }
            completa={completions[6]}
            aberta={secoesAbertas.has(7)}
            onToggle={() => toggleSecao(7)}
          >
            <div className="pt-4 space-y-2">
              {data.competitors.length === 0 && (
                <p className="text-sm text-center py-6" style={{ color: 'var(--color-text-muted)' }}>
                  Nenhum concorrente cadastrado ainda. Adicione ao menos 1 para o relatório ficar mais rico.
                </p>
              )}

              {data.competitors.map((c, idx) => (
                <React.Fragment key={c.id}>
                  <ConcorrenteCard
                    c={c}
                    idx={idx}
                    onRemove={() => removeCompetitor(c.id)}
                    onUpdate={(field, value) => updateCompetitor(c.id, field, value)}
                  />
                </React.Fragment>
              ))}

              {data.competitors.length < 4 && (
                <button
                  type="button"
                  onClick={addCompetitor}
                  className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl w-full justify-center transition-all mt-2"
                  style={{
                    background: 'rgba(18,123,240,0.05)',
                    border: '1.5px dashed rgba(18,123,240,0.25)',
                    color: 'var(--color-blue)',
                  }}
                >
                  <Plus className="w-4 h-4" />
                  Adicionar concorrente
                  <span className="text-xs font-normal opacity-60">
                    ({data.competitors.length}/4)
                  </span>
                </button>
              )}
            </div>
          </SecaoAccordion>

          {/* ═══ Seção 8 — Auditoria GEO ══════════════════════════════════════ */}
          <SecaoAccordion
            num={8}
            titulo="Auditoria GEO"
            descricao="Visibilidade nas IAs: ChatGPT, Gemini, Perplexity"
            completa={completions[7]}
            aberta={secoesAbertas.has(8)}
            onToggle={() => toggleSecao(8)}
          >
            <div className="space-y-4 pt-4">
              <div
                className="rounded-xl px-4 py-3 text-sm"
                style={{ background: 'rgba(18,123,240,0.05)', border: '1px solid rgba(18,123,240,0.1)', color: 'var(--color-text-secondary)' }}
              >
                💡 Teste manualmente: pergunte às IAs "Qual a melhor [segmento] em [cidade]?" e registre se a marca aparece.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {(['chatGptMentions', 'geminiMentions', 'perplexityMentions'] as const).map((field, i) => (
                  <div key={field}>
                    <FormField label={`${['ChatGPT', 'Gemini', 'Perplexity'][i]} cita a marca?`}>
                      <select name={field} value={data[field]} onChange={handleChange} className="form-input">
                        <option value="yes">✅ Sim, cita</option>
                        <option value="partial">🔶 Parcialmente</option>
                        <option value="no">❌ Não aparece</option>
                      </select>
                    </FormField>
                  </div>
                ))}
              </div>

              <FormField label="Sentimento vs concorrentes">
                <select name="sentimentVsCompetitors" value={data.sentimentVsCompetitors} onChange={handleChange} className="form-input">
                  <option value="Positive">🟢 Positivo — é recomendada</option>
                  <option value="Neutral">🟡 Neutro — aparece sem destaque</option>
                  <option value="Invisible">⚪ Invisível — não aparece</option>
                  <option value="Negative">🔴 Negativo — menções ruins</option>
                </select>
              </FormField>

              <FormField
                label="Notas da auditoria GEO"
                hint="Cole os textos reais das IAs ou descreva o que encontrou"
              >
                <textarea
                  name="geoAuditNotes"
                  value={data.geoAuditNotes || ''}
                  onChange={handleChange}
                  className="form-input"
                  style={{ minHeight: '90px' }}
                  placeholder='Ex: "A Clínica X aparece no ChatGPT quando pergunto sobre estética em SP. A marca do cliente não é citada em nenhuma das 3 IAs testadas."'
                />
              </FormField>
            </div>
          </SecaoAccordion>

          {/* ═══ Seção 9 — Ads / Vazamento ════════════════════════════════════ */}
          <SecaoAccordion
            num={9}
            titulo="Vazamento de Verba (Ads)"
            descricao="Anúncios pagos que competem com resultados orgânicos"
            completa={completions[8]}
            aberta={secoesAbertas.has(9)}
            onToggle={() => toggleSecao(9)}
          >
            <div className="space-y-4 pt-4">
              <Toggle
                checked={data.runsGoogleAds}
                onChange={(v) => setData((p) => ({ ...p, runsGoogleAds: v }))}
                label="Cliente investe em Google Ads?"
              />

              {data.runsGoogleAds && (
                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Orçamento mensal (R$)">
                      <input
                        type="number"
                        name="monthlyAdsBudget"
                        value={data.monthlyAdsBudget || ''}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="Ex: 8500"
                      />
                    </FormField>
                    <FormField
                      label="Desperdício estimado (R$)"
                      hint="Gasto em termos que já ranquearia organicamente"
                    >
                      <input
                        type="number"
                        name="estimatedMonthlyWaste"
                        value={data.estimatedMonthlyWaste || ''}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="Ex: 2800"
                      />
                    </FormField>
                  </div>
                  <FormField label="Termos pagos que poderiam ser orgânicos">
                    <textarea
                      name="termsPayingForOrganic"
                      value={data.termsPayingForOrganic || ''}
                      onChange={handleChange}
                      className="form-input"
                      style={{ minHeight: '70px' }}
                      placeholder="clínica de estética sp, tratamento pele, botox são paulo..."
                    />
                  </FormField>
                  <FormField label="Notas sobre o vazamento">
                    <textarea
                      name="adsLeakageNotes"
                      value={data.adsLeakageNotes || ''}
                      onChange={handleChange}
                      className="form-input"
                      style={{ minHeight: '70px' }}
                      placeholder="Ex: R$ 2.890/mês em termos que o concorrente já ranqueia organicamente"
                    />
                  </FormField>
                </div>
              )}
            </div>
          </SecaoAccordion>

          {/* ═══ Seção 10 — Valuation de Tráfego ════════════════════════════ */}
          <SecaoAccordion
            num={10}
            titulo="Valuation de Tráfego"
            descricao="Patrimônio digital atual e projetado"
            completa={completions[9]}
            aberta={secoesAbertas.has(10)}
            onToggle={() => toggleSecao(10)}
          >
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  label={
                    <>
                      CPC médio estimado (R$)
                      <TooltipInfo text="Custo por clique no Google Ads para as keywords do segmento. Pesquise no Keyword Planner do Google Ads. Sem acesso, use R$ 8–15 para saúde/serviços." />
                    </>
                  }
                  required
                  hint="Pesquise no Google Keyword Planner"
                >
                  <input
                    type="number"
                    step="0.01"
                    name="estimatedCpcAverage"
                    value={data.estimatedCpcAverage || ''}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Ex: 9.20"
                  />
                </FormField>
                <FormField
                  label={
                    <>
                      Multiplicador de valuation
                      <TooltipInfo text="Quantos meses de receita de mídia equivalente vale o ativo. Padrão: 36 (3 anos)." />
                    </>
                  }
                >
                  <input
                    type="number"
                    name="valuationMultiplier"
                    value={data.valuationMultiplier}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="36"
                  />
                </FormField>
              </div>

              {/* Preview do valuation */}
              <div
                className="rounded-xl p-4 space-y-3"
                style={{ background: 'rgba(18,123,240,0.04)', border: '1.5px solid rgba(18,123,240,0.1)' }}
              >
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-blue)', opacity: 0.7 }}>
                  Preview do Valuation
                </p>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Ativo digital hoje</p>
                    {data.currentMonthlyOrganicVisits === 0 && (
                      <p className="text-xs mt-0.5" style={{ color: 'rgba(245,158,11,0.8)' }}>
                        ↑ usando 1.000 visitas como referência
                      </p>
                    )}
                  </div>
                  <span className="font-display font-bold text-lg" style={{ color: 'var(--color-blue)' }}>
                    {fmt(ativoHoje)}
                  </span>
                </div>
                <div
                  className="flex justify-between items-center pt-2"
                  style={{ borderTop: '1px solid rgba(18,123,240,0.1)' }}
                >
                  <div>
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Projetado em 12 meses (4× tráfego)</p>
                  </div>
                  <span className="font-display font-bold text-xl" style={{ color: '#059669' }}>
                    {fmt(ativoProjetado)}
                  </span>
                </div>
              </div>

              <FormField label="Notas do valuation">
                <textarea
                  name="valuationNotes"
                  value={data.valuationNotes || ''}
                  onChange={handleChange}
                  className="form-input"
                  style={{ minHeight: '70px' }}
                  placeholder="Ex: Tráfego atual de 1.800 visitas/mês × R$ 9,20/clique = R$ 16.560/mês em mídia equivalente"
                />
              </FormField>
            </div>
          </SecaoAccordion>

          {/* ═══ Seção 11 — Roadmap Estratégico ══════════════════════════════ */}
          <SecaoAccordion
            num={11}
            titulo="Roadmap Estratégico"
            descricao="3 níveis de execução + prazo"
            completa={completions[10]}
            aberta={secoesAbertas.has(11)}
            onToggle={() => toggleSecao(11)}
          >
            <div className="space-y-4 pt-4">
              {[
                {
                  name: 'roadmapLevel1' as const,
                  label: 'Nível 1 — Arrumar a Casa',
                  sub: 'Semanas 1–4',
                  color: 'rgba(18,123,240,0.1)',
                  placeholder: 'Correções técnicas, quick wins, otimizações imediatas, GBP...',
                },
                {
                  name: 'roadmapLevel2' as const,
                  label: 'Nível 2 — Reconstrução com IA',
                  sub: 'Meses 2–4',
                  color: 'rgba(139,92,246,0.1)',
                  placeholder: 'Estratégia GEO, conteúdo de autoridade, E-E-A-T...',
                },
                {
                  name: 'roadmapLevel3' as const,
                  label: 'Nível 3 — Crescimento e Dominância',
                  sub: 'Meses 5–18',
                  color: 'rgba(16,185,129,0.1)',
                  placeholder: 'Expansão regional, clusters de autoridade, redução de Ads...',
                },
              ].map(({ name, label, sub, color, placeholder }) => (
                <div key={name}>
                  <div className="flex items-baseline gap-2 mb-1.5">
                    <label className="form-label mb-0" style={{ fontSize: '0.8rem' }}>{label}</label>
                    <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{sub}</span>
                  </div>
                  <textarea
                    name={name}
                    value={data[name]}
                    onChange={handleChange}
                    required
                    className="form-input"
                    style={{ minHeight: '72px', background: color, borderColor: color.replace('0.1', '0.2') }}
                    placeholder={placeholder}
                  />
                </div>
              ))}

              <FormField label="Prazo total sugerido" required>
                <input
                  type="text"
                  name="timelineSuggestion"
                  value={data.timelineSuggestion}
                  onChange={handleChange}
                  required
                  className="form-input"
                  placeholder="Ex: 12 a 18 meses"
                />
              </FormField>
            </div>
          </SecaoAccordion>

          {/* ═══ Seção 12 — Fechamento com Voz Humana ════════════════════════ */}
          <SecaoAccordion
            num={12}
            titulo="Fechamento com Voz Humana"
            descricao="Mensagem direta ao cliente, assinada por você"
            completa={completions[11]}
            aberta={secoesAbertas.has(12)}
            onToggle={() => toggleSecao(12)}
          >
            <div className="pt-4">
              <FormField
                label="Observação final — voz do consultor"
                hint="Aparece no final do diagnóstico. Escreva em primeira pessoa, de consultor para dono de negócio."
              >
                <textarea
                  name="observacaoFinal"
                  value={data.observacaoFinal || ''}
                  onChange={handleChange}
                  className="form-input"
                  style={{ minHeight: '120px' }}
                  placeholder="O que você viu, o que acredita, por que agora. Ex: 'Olha, o mercado de estética em SP está crescendo 22% ao ano. Dois dos seus concorrentes já estão investindo em SEO. Existe uma janela de 6 meses...'"
                />
              </FormField>
            </div>
          </SecaoAccordion>

          {/* ── Submit ───────────────────────────────────────────────────── */}
          <div className="pt-4 space-y-3">
            {erroSalvar && (
              <div
                className="rounded-xl px-4 py-3 text-sm text-center"
                style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.15)', color: 'rgba(220,38,38,0.85)' }}
              >
                {erroSalvar}
              </div>
            )}

            {progresso < 100 && (
              <p className="text-xs text-center" style={{ color: 'var(--color-text-muted)' }}>
                Preencha ao menos: empresa, volume de buscas, acessos orgânicos, CPC médio e roadmap nível 1
              </p>
            )}

            <button
              type="submit"
              disabled={salvando}
              className="glossy-blue w-full px-8 py-4 rounded-2xl font-semibold transition-all flex items-center justify-center gap-3 text-base text-white disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ boxShadow: '0 8px 24px rgba(18,123,240,0.3)' }}
            >
              {salvando ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Gerando diagnóstico...
                </>
              ) : (
                <>
                  Gerar Diagnóstico
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </form>

        <p className="text-center text-xs mt-8 pb-8" style={{ color: 'var(--color-text-muted)' }}>
          Upsend Brasil · Diagnóstico Digital · Dados salvos de forma segura
        </p>
      </div>
    </div>
  )
}
