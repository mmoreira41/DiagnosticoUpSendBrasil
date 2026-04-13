-- Tabela de diagnósticos do Dev1 repo
-- Armazena todos os dados como JSONB — estrutura flexível, sem auth obrigatória

CREATE TABLE IF NOT EXISTS public.diagnosticos (
  id        uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  criado_em timestamptz NOT NULL DEFAULT now(),
  dados     jsonb       NOT NULL
);

COMMENT ON TABLE  public.diagnosticos       IS 'Diagnósticos SEO gerados para prospects.';
COMMENT ON COLUMN public.diagnosticos.dados IS 'DiagnosticData completo serializado como JSON.';

-- Índice para ordenação cronológica
CREATE INDEX IF NOT EXISTS diagnosticos_criado_em_idx ON public.diagnosticos (criado_em DESC);

-- RLS habilitado
ALTER TABLE public.diagnosticos ENABLE ROW LEVEL SECURITY;

-- Leitura pública — link compartilhável sem autenticação
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'diagnosticos' AND policyname = 'leitura_publica_diagnosticos'
  ) THEN
    CREATE POLICY leitura_publica_diagnosticos
      ON public.diagnosticos
      FOR SELECT
      TO anon, authenticated
      USING (true);
  END IF;
END $$;

-- Inserção pública — Dev1 repo não tem auth, qualquer um pode criar
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'diagnosticos' AND policyname = 'insercao_publica_diagnosticos'
  ) THEN
    CREATE POLICY insercao_publica_diagnosticos
      ON public.diagnosticos
      FOR INSERT
      TO anon, authenticated
      WITH CHECK (true);
  END IF;
END $$;
