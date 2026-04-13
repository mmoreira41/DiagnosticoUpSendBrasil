# Prompt de Análise do Site — Diagnóstico Upsend Brasil

> Use este prompt para avaliar a experiência completa da aplicação de diagnóstico SEO/GEO,
> cobrindo impacto visual, usabilidade, animações, performance e persuasão comercial.

---

## Contexto do Produto

Você está analisando uma aplicação React chamada **Diagnóstico Upsend Brasil**.
Ela tem dois fluxos principais:

1. **FormPage** — Formulário onde o consultor insere dados do cliente (métricas SEO, concorrentes, problemas detectados, soluções propostas).
2. **PresentationPage** — Página de apresentação gerada automaticamente com os dados, exibida ao cliente. Usa design sistema "Liquid Glass" (glassmorphism inspirado na Apple), paleta Crystal Blue, tipografia Cormorant Garamond + DM Sans.

O objetivo comercial da apresentação é **converter o diagnóstico em proposta aceita pelo cliente**.

---

## Dimensões de Análise

Avalie cada dimensão abaixo com nota de **1 a 10** e justifique com observações específicas.

---

### 1. Impacto Visual (First Impression)

- [ ] **Hierarquia visual**: O olhar do usuário é guiado naturalmente? Existe uma ordem clara de leitura?
- [ ] **Identidade de marca**: O design system Liquid Glass (glassmorphism, Crystal Blue, backdrop blur) está aplicado com consistência?
- [ ] **Tipografia**: A combinação Cormorant Garamond (títulos) + DM Sans (corpo) cria contraste e elegância adequados?
- [ ] **Uso de cor**: As cores semânticas (verde = sucesso, vermelho = alerta, amarelo = atenção) estão sendo usadas corretamente e com clareza?
- [ ] **Profissionalismo**: A apresentação transmite o nível premium esperado de uma agência de marketing?
- [ ] **Diferenciação**: O design se destaca positivamente em relação a relatórios tradicionais de diagnóstico SEO?

**Nota:** ___/10
**Pontos fortes:**
**Pontos de melhoria:**

---

### 2. Usabilidade — FormPage (Consultor)

- [ ] **Fluxo de preenchimento**: A ordem dos campos faz sentido para um consultor que acabou de fazer o diagnóstico?
- [ ] **Clareza dos campos**: Os labels e placeholders são autoexplicativos sem precisar de instrução adicional?
- [ ] **Feedback de erro/validação**: O usuário sabe quando algo está errado e como corrigir?
- [ ] **Modo de simulação**: O botão "Simular com dados demo" acelera o teste sem complicar o fluxo real?
- [ ] **Navegação**: É claro como avançar, revisar e submeter o formulário?
- [ ] **Recuperação de erros**: Se o envio ao Supabase falhar, a mensagem de erro é clara e acionável?

**Nota:** ___/10
**Pontos fortes:**
**Pontos de melhoria:**

---

### 3. Usabilidade — PresentationPage (Cliente)

- [ ] **Clareza da narrativa**: O cliente consegue entender o diagnóstico sem ter contexto técnico de SEO?
- [ ] **Progressão de conteúdo**: A apresentação tem uma história coerente (problema → impacto → solução → próximo passo)?
- [ ] **Navegação lateral (sidebar)**: É fácil entender em qual seção o usuário está e navegar entre elas?
- [ ] **CTAs**: Existe uma chamada para ação clara ao final? O cliente sabe qual é o próximo passo?
- [ ] **Densidade de informação**: O conteúdo está equilibrado — nem escasso, nem sobrecarregado?
- [ ] **Leitura em voz alta mental**: Um cliente leigo conseguiria explicar o que viu para alguém depois?

**Nota:** ___/10
**Pontos fortes:**
**Pontos de melhoria:**

---

### 4. Animações e Microinterações

- [ ] **Propósito**: Cada animação comunica algo (revelar dado, indicar progresso, destacar resultado) ou é apenas decorativa?
- [ ] **CountUp** (números animados): A duração e a curva de easing transmitem a sensação certa — dados se "materializando"?
- [ ] **FadeIn com translateY**: A entrada das seções por scroll está suave e com delays bem escalonados?
- [ ] **TiltCard** (efeito 3D no mouse): O ângulo (8°) e a perspectiva (900px) estão calibrados — nem exagerado, nem imperceptível?
- [ ] **Termômetro animado**: A animação de preenchimento com bounce (cubic-bezier 0.34, 1.2, 0.64, 1) está satisfatória?
- [ ] **BarraComparacao**: As barras de progresso são legíveis e o delay escalonado funciona bem visualmente?
- [ ] **Consistência**: Há uniformidade nos timings e easings entre os diferentes componentes animados?
- [ ] **Acessibilidade**: As animações respeitam `prefers-reduced-motion`?
- [ ] **Performance**: As animações são fluidas em hardware comum (60fps)? Há janking ou layout shifts?

**Nota:** ___/10
**Pontos fortes:**
**Pontos de melhoria:**

---

### 5. Performance e Técnica

- [ ] **Tempo de carregamento inicial**: O FormPage carrega rapidamente (< 2s em conexão 4G)?
- [ ] **Renderização da PresentationPage**: A transição do formulário para a apresentação é instantânea ou há delay perceptível?
- [ ] **Bundle size**: O uso de Lucide React, Supabase client e animações custom está contribuindo para um bundle razoável?
- [ ] **Scroll suave**: O scroll na PresentationPage (especialmente com sidebar sticky) é fluido?
- [ ] **Intersection Observer**: Os gatilhos de animação estão precisos — as animações disparam no momento visualmente correto?
- [ ] **Hydration / estado**: Há estados de carregamento, erros ou flashes indesejados?

**Nota:** ___/10
**Pontos fortes:**
**Pontos de melhoria:**

---

### 6. Responsividade e Mobile

- [ ] **FormPage mobile**: O formulário é preenchível em um smartphone sem frustração?
- [ ] **PresentationPage mobile**: A apresentação é legível e impactante em telas menores?
- [ ] **Sidebar mobile**: A navegação lateral funciona bem em telas pequenas?
- [ ] **Gráficos e visualizações**: Termômetros, barras e cards se adaptam bem ao espaço reduzido?
- [ ] **Tipografia responsiva**: Os tamanhos de fonte mantêm hierarquia e legibilidade em todos os breakpoints?

**Nota:** ___/10
**Pontos fortes:**
**Pontos de melhoria:**

---

### 7. Persuasão e Impacto Comercial

- [ ] **Urgência**: A apresentação cria senso de urgência sem parecer alarmista ou manipulador?
- [ ] **Prova de oportunidade**: Os números (buscas mensais, tráfego perdido, ROI projetado) estão apresentados de forma convincente?
- [ ] **Posicionamento do concorrente**: A comparação com concorrentes é justa, clara e incentiva ação?
- [ ] **Roadmap**: O plano de ação (Level 1/2/3) parece viável e concreto para o cliente?
- [ ] **Valuation de SEO**: O cálculo de valor patrimonial do SEO (`valorization`) está explicado de forma que o cliente compreenda o investimento?
- [ ] **Tonalidade**: O texto equilibra profissionalismo com acessibilidade — não é técnico demais, nem superficial?
- [ ] **Confiança**: A apresentação transmite que a Upsend Brasil é especialista e confiável?

**Nota:** ___/10
**Pontos fortes:**
**Pontos de melhoria:**

---

### 8. Acessibilidade e Inclusão

- [ ] **Contraste de texto**: As combinações de cor de texto sobre fundo glass/blur passam WCAG AA (4.5:1 para texto normal)?
- [ ] **Semântica HTML**: Títulos, listas e regiões estão marcados corretamente para leitores de tela?
- [ ] **Foco de teclado**: É possível navegar pelo formulário e pela apresentação sem mouse?
- [ ] **Alt text**: Ícones com significado semântico têm descrição para tecnologia assistiva?
- [ ] **Redução de movimento**: A flag `prefers-reduced-motion` desativa ou reduz animações intensas?

**Nota:** ___/10
**Pontos fortes:**
**Pontos de melhoria:**

---

## Resumo Executivo

Após completar todas as dimensões, preencha:

| Dimensão | Nota |
|---|---|
| 1. Impacto Visual | /10 |
| 2. Usabilidade — FormPage | /10 |
| 3. Usabilidade — PresentationPage | /10 |
| 4. Animações e Microinterações | /10 |
| 5. Performance e Técnica | /10 |
| 6. Responsividade e Mobile | /10 |
| 7. Persuasão e Impacto Comercial | /10 |
| 8. Acessibilidade e Inclusão | /10 |
| **Média Geral** | **/10** |

---

## Top 3 Melhorias de Alto Impacto

Liste as três mudanças que, se implementadas, mais elevariam a qualidade percebida e a efetividade comercial:

1.
2.
3.

---

## Quick Wins (< 1 dia de trabalho)

Liste melhorias pequenas com alto retorno que podem ser feitas rapidamente:

- 
- 
- 

---

## Observações Finais

*(Espaço livre para insights adicionais, comparações de mercado, sugestões criativas ou riscos identificados)*
