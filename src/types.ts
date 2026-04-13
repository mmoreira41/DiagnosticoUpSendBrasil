export interface GbpProfile {
  id: string
  nome?: string
  rating?: number
  totalReviews?: number
}

export interface Competitor {
  id: string
  name: string
  url?: string
  monthlyVisits: number
  hasAptWebsite: boolean
  doesSEO: boolean
  doesGEO: boolean
  runsAds?: boolean
  contentCount?: number
  gbpRating?: number
  gbpReviews?: number
  mainStrength?: string
  mainWeakness?: string
}

export interface DiagnosticData {
  // Identificação
  companyName: string
  responsibleName: string
  nomeConsultor?: string

  // Áreas diagnosticadas
  areasDiagnosed: string[]

  // Mercado
  totalMonthlySearches: number
  geographicMarket: string
  mainKeywords?: string // top 3 separadas por vírgula
  crescimentoMercado?: 'crescendo' | 'estavel' | 'retraindo'
  sazonalidadeExiste?: boolean
  sazonalidadeMesPico?: string
  sazonalidadeMesBaixa?: string

  // Tráfego atual do cliente
  currentMonthlyOrganicVisits: number

  // Site
  temSite?: boolean
  hasSSL?: boolean
  isMobileResponsive?: boolean
  temBlog?: boolean
  totalArtigos?: number
  pageSpeedMobile?: number
  pageSpeedDesktop?: number

  // Google Search Console
  impressoesMensaisGSC?: number
  cliquesGSC?: number
  ctrMedioGSC?: number
  posicaoMediaGSC?: number

  // Métricas de conversão
  taxaConversao?: number  // % — ex: 2.5
  taxaFechamento?: number // % — ex: 30
  ticketMedio?: number    // R$ — ex: 350

  // Problemas / Soluções
  mainProblems: string[]
  customProblem?: string
  solutions: string[]
  solutionDescriptions: Record<string, string>

  // Concorrentes
  competitors: Competitor[]

  // GEO
  chatGptMentions: 'yes' | 'partial' | 'no'
  geminiMentions: 'yes' | 'partial' | 'no'
  perplexityMentions: 'yes' | 'partial' | 'no'
  sentimentVsCompetitors: 'Positive' | 'Neutral' | 'Invisible' | 'Negative'
  geoAuditNotes?: string

  // Ads
  runsGoogleAds: boolean
  monthlyAdsBudget?: number
  termsPayingForOrganic?: string
  estimatedMonthlyWaste?: number
  adsLeakageNotes?: string

  // Google Business Profile
  gbpHasProfile?: boolean
  gbpRating?: number
  gbpTotalReviews?: number
  gbpProfiles?: GbpProfile[]

  // Valuation
  estimatedCpcAverage: number
  valuationMultiplier: number
  valuationNotes?: string

  // Roadmap
  roadmapLevel1: string
  roadmapLevel2: string
  roadmapLevel3: string
  timelineSuggestion: string

  // Fechamento
  observacaoFinal?: string
}
