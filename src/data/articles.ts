import type { ArticleItem, ContentBlock } from "@/lib/types";

const p = (text: string): ContentBlock => ({ type: "p", text });
const h2 = (text: string): ContentBlock => ({ type: "h2", text });
const h3 = (text: string): ContentBlock => ({ type: "h3", text });
const ul = (items: string[]): ContentBlock => ({ type: "ul", items });
const ol = (items: string[]): ContentBlock => ({ type: "ol", items });
const callout = (text: string): ContentBlock => ({ type: "callout", text });
const code = (text: string, lang = "ts"): ContentBlock => ({ type: "code", text, lang });
const table = (rows: string[][]): ContentBlock => ({ type: "table", rows });

function a(slug: string, title: string, excerpt: string, category: string, tags: string[], author: string, publishedAt: string, body: ContentBlock[], featured = false): ArticleItem {
  return { kind: "article", slug, title, excerpt, category, tags, author, publishedAt, readingTime: Math.max(3, Math.round(body.reduce((acc, b) => acc + (b.text?.length ?? 0) + (b.items?.join(" ").length ?? 0), 0) / 1000)), body, featured };
}

export const ARTICLES: ArticleItem[] = [
  a("como-escrever-prompts-que-funcionam", "Como escrever prompts que realmente funcionam: um método em 6 partes", "Pare de tentar a sorte. Um prompt bom é uma especificação: papel, contexto, tarefa, formato, restrições e exemplos. Veja como montar cada parte.", "inteligencia-artificial", ["prompts", "ChatGPT", "Claude", "método"], "Marina Costa", "2026-03-16", [
    p("A maioria dos prompts ruins tem o mesmo defeito: pedem um resultado sem descrever o problema. O modelo preenche as lacunas com a média da internet, e a média da internet é genérica."),
    h2("As seis partes"),
    ol(["Papel — quem o modelo deve ser (especialista em X com experiência em Y).", "Contexto — situação, público, o que já foi tentado.", "Tarefa — o verbo principal e um único objetivo.", "Formato — estrutura, tamanho, idioma, tom.", "Restrições — o que evitar, limites, critérios de qualidade.", "Exemplos — um ou dois exemplos do resultado esperado."]),
    h2("Antes e depois"),
    code("Antes:\n\"Escreve um e-mail para cliente.\"\n\nDepois:\n\"Você é gerente de contas de uma agência. Escreva um e-mail para um cliente (dono de restaurante, pouco técnico) explicando que a campanha atrasou 3 dias por um problema nosso. Tom: direto e responsável, sem jargão. Máximo 120 palavras. Termine com uma ação concreta e uma data.\"", "text"),
    h2("Erros comuns"),
    ul(["Pedir várias coisas em um só prompt. Divida em etapas.", "Não dizer o público. 'Explique X' para um CEO e para um estagiário são pedidos diferentes.", "Esquecer o formato. Você quer lista, tabela, parágrafo, JSON?", "Aceitar a primeira resposta. Peça críticas e alternativas."]),
    callout("O Prompt Builder do Nexo monta essa estrutura para você a partir de campos simples. Experimente em /prompts/builder."),
    h2("Iteração é parte do método"),
    p("Prompts bons raramente saem prontos. Trate a primeira resposta como rascunho, peça ao modelo que avalie o próprio resultado contra os critérios e refine. Três iterações curtas superam um prompt gigante."),
  ], true),
  a("typescript-strict-vale-a-pena", "TypeScript strict vale a pena? O que muda na prática em um projeto React", "Ativar o modo estrito assusta no início, mas reduz uma classe inteira de bugs. Veja as opções que mais importam e como migrar sem parar o time.", "programacao", ["TypeScript", "React", "qualidade"], "Rafael Lima", "2026-03-13", [
    p("O `strict: true` do TypeScript é um conjunto de flags. Algumas têm impacto enorme; outras, quase nenhum no dia a dia. Entender a diferença ajuda a decidir por onde começar."),
    h2("As que mais importam"),
    table([["Flag", "O que pega", "Impacto"], ["strictNullChecks", "Acesso a valores possivelmente nulos", "Alto"], ["noImplicitAny", "Parâmetros sem tipo", "Alto"], ["noUncheckedIndexedAccess", "Acesso a índices de array/objeto", "Médio"], ["strictFunctionTypes", "Variância em callbacks", "Baixo"]]),
    h2("Migração incremental"),
    ol(["Ative strict no tsconfig e conte os erros.", "Adicione // @ts-expect-error nos pontos críticos com um comentário de motivo.", "Corrija por módulo, começando pelos mais usados.", "Proíba novos ts-expect-error via lint."]),
    code("// Antes\nfunction total(items) { return items.reduce((a, i) => a + i.price, 0); }\n\n// Depois\nfunction total(items: { price: number }[]): number {\n  return items.reduce((a, i) => a + i.price, 0);\n}"),
    p("O ganho real aparece em refatorações: mudar o formato de um objeto e ter o compilador apontando todos os lugares afetados. Em times com rotatividade, isso vale mais do que qualquer documentação."),
  ]),
  a("seo-para-sites-de-ferramentas", "SEO para sites de ferramentas: como ranquear calculadoras e conversores", "Páginas de ferramentas têm intenção de busca clara e alta recorrência. Veja a estrutura que funciona: título, explicação, exemplos, FAQ e links internos.", "marketing", ["SEO", "ferramentas", "conteúdo"], "Marina Costa", "2026-03-11", [
    p("Quem busca 'calculadora de juros compostos' quer calcular — não ler um ensaio. Mas o Google precisa de contexto para entender e confiar na página. O equilíbrio está em colocar a ferramenta no topo e o conteúdo de apoio logo abaixo."),
    h2("Estrutura que ranqueia"),
    ol(["H1 com a palavra-chave exata e a ferramenta imediatamente visível.", "Resultado claro, sem exigir rolagem em mobile.", "Seção 'como funciona' com a fórmula.", "Exemplos numéricos reais.", "FAQ com perguntas que as pessoas realmente fazem (use o 'as pessoas também perguntam').", "Links para ferramentas relacionadas."]),
    h2("Sinais técnicos"),
    ul(["Carregamento rápido: ferramentas devem funcionar em menos de 1 s.", "Schema FAQPage e BreadcrumbList.", "URL curta e estável: /ferramentas/juros-compostos.", "Title com até 60 caracteres e description com 150–160."]),
    callout("Cada página de ferramenta do Nexo segue exatamente essa estrutura. Use como referência."),
    h2("O erro mais comum"),
    p("Criar 50 variações da mesma calculadora com títulos diferentes. Isso é conteúdo duplicado e canibaliza o ranking. Melhor uma página robusta com modos do que dez páginas rasas."),
  ]),
  a("modo-escuro-bem-feito", "Modo escuro bem feito: além de inverter cores", "Dark mode não é #000 com texto branco. Envolve elevação, contraste, saturação e imagens. Um guia prático com tokens CSS.", "design", ["dark mode", "CSS", "acessibilidade"], "Júlia Andrade", "2026-03-09", [
    p("Um bom tema escuro reduz brilho sem reduzir legibilidade. Os erros mais comuns: preto puro (causa halo em OLED e cansa), texto 100% branco (contraste excessivo) e cores saturadas que 'vibram' sobre fundo escuro."),
    h2("Princípios"),
    ul(["Fundo quase preto (#0b0b0a, #111) em vez de #000.", "Texto principal em branco levemente quebrado (#f3f3ef).", "Elevação por clareza: superfícies mais altas são levemente mais claras.", "Dessature cores de marca em 10–20% no tema escuro.", "Reduza a opacidade de imagens muito claras."]),
    h2("Tokens semânticos"),
    code(":root { --bg: #fbfbf9; --fg: #111110; --surface: #fff; --line: #e7e6e1; }\n.dark { --bg: #0b0b0a; --fg: #f3f3ef; --surface: #151514; --line: #262624; }\n\n.card { background: var(--surface); border: 1px solid var(--line); color: var(--fg); }", "css"),
    p("Com tokens semânticos, o componente não sabe em que tema está — ele só usa 'superfície' e 'borda'. Trocar o tema vira uma classe na raiz."),
    h2("Não esqueça"),
    ul(["Respeite prefers-color-scheme como padrão inicial.", "Persista a escolha do usuário.", "Evite flash de tema errado: aplique a classe antes do React montar.", "Teste contraste nos dois temas com uma ferramenta de contraste."]),
  ]),
  a("juros-compostos-explicados-com-exemplos", "Juros compostos explicados com exemplos reais (e a calculadora para conferir)", "Por que começar cedo importa mais do que aportar muito, como a taxa mensal engana e o que acontece quando os juros trabalham contra você.", "financas", ["juros compostos", "investimentos", "educação financeira"], "Pedro Nascimento", "2026-03-06", [
    p("A fórmula é curta: M = C × (1 + i)^t. O que ela esconde é que o expoente — o tempo — é a variável que mais pesa. Dobrar o prazo faz muito mais efeito do que dobrar o aporte."),
    h2("Três cenários"),
    table([["Cenário", "Aporte mensal", "Prazo", "Taxa", "Resultado"], ["Começou aos 25", "R$ 500", "40 anos", "0,7% a.m.", "≈ R$ 2,3 mi"], ["Começou aos 35", "R$ 1.000", "30 anos", "0,7% a.m.", "≈ R$ 1,9 mi"], ["Começou aos 45", "R$ 2.000", "20 anos", "0,7% a.m.", "≈ R$ 1,3 mi"]]),
    p("Quem começou dez anos antes aportou metade e terminou com mais. Isso é o efeito do expoente."),
    h2("A armadilha da taxa mensal"),
    p("Um cartão com '12% ao mês' não custa 144% ao ano. Custa (1,12)^12 − 1 = 290% ao ano. Composição funciona nos dois sentidos: a favor no investimento, contra na dívida."),
    h3("Como comparar taxas"),
    ul(["Converta tudo para a mesma base (anual ou mensal) com equivalência composta.", "Desconte a inflação para saber o ganho real.", "Considere impostos sobre o rendimento."]),
    callout("Teste seus números na calculadora de juros compostos do Nexo — ela mostra a evolução período a período."),
  ]),
  a("metodo-de-produtividade-que-nao-e-app", "O método de produtividade que não é um app: revisão semanal em 20 minutos", "Ferramentas ajudam, mas a maioria dos sistemas falha por falta de revisão. Um ritual simples, com perguntas fixas, resolve.", "produtividade", ["produtividade", "planejamento", "hábitos"], "Júlia Andrade", "2026-03-03", [
    p("Todo sistema de produtividade morre da mesma forma: a lista fica desatualizada, você para de confiar nela e volta a operar por e-mail e memória. A revisão semanal é a manutenção que impede isso."),
    h2("O ritual"),
    ol(["Esvazie: capture tudo que está na cabeça, no e-mail e em papéis (5 min).", "Revise a semana passada: o que ficou pendente e por quê (5 min).", "Olhe as próximas duas semanas no calendário (3 min).", "Escolha no máximo três prioridades para a semana (5 min).", "Elimine ou delegue o que não vai fazer (2 min)."]),
    h2("Perguntas fixas"),
    ul(["O que eu estou evitando?", "O que só eu posso fazer?", "O que posso parar de fazer sem que ninguém perceba?"]),
    p("O poder está na repetição. Após um mês, o ritual leva menos de 20 minutos e a sua lista volta a ser confiável."),
    callout("A matriz de Eisenhower e o rastreador de hábitos do Nexo funcionam bem como suporte visual para esse ritual."),
  ]),
  a("passkeys-o-fim-das-senhas", "Passkeys: o que são, como funcionam e por que você deve ativar hoje", "A autenticação sem senha saiu do papel. Entenda a criptografia por trás, as limitações e como migrar suas contas principais.", "seguranca", ["passkeys", "autenticação", "segurança"], "Rafael Lima", "2026-02-28", [
    p("Senhas são segredos compartilhados: você sabe, o site sabe, e qualquer um que roube o banco de dados do site também sabe. Passkeys trocam isso por um par de chaves — a privada nunca sai do seu dispositivo."),
    h2("Como funciona"),
    ol(["Ao cadastrar, seu dispositivo gera um par de chaves para aquele site.", "O site guarda apenas a chave pública.", "No login, o site envia um desafio; seu dispositivo assina com a chave privada após biometria ou PIN.", "Nada reutilizável trafega — phishing e vazamentos perdem efeito."]),
    h2("Limitações atuais"),
    ul(["Sincronização entre ecossistemas diferentes ainda é desajeitada.", "Nem todo site suporta.", "Perder todos os dispositivos exige um caminho de recuperação, geralmente e-mail ou códigos."]),
    h2("Por onde começar"),
    p("E-mail principal, gerenciador de senhas e banco. Esses três protegem o resto. Enquanto migra, use senhas únicas e longas onde passkeys não estão disponíveis."),
  ]),
  a("precificacao-para-freelancers", "Precificação para freelancers: a conta que quase ninguém faz", "Cobrar por hora sem saber quantas horas são faturáveis é a receita para trabalhar muito e ganhar pouco. Veja o cálculo completo.", "negocios", ["freelancer", "precificação", "finanças"], "Pedro Nascimento", "2026-02-24", [
    p("Um profissional que quer ganhar R$ 10 mil por mês divide por 160 horas e chega a R$ 62,50 por hora. Depois descobre que só 90 horas são faturáveis e que ainda há impostos, equipamento e férias."),
    h2("O cálculo completo"),
    ol(["Renda líquida desejada por ano.", "+ Impostos e contribuições.", "+ Custos: equipamento, software, internet, contabilidade.", "+ Reserva para férias e imprevistos (10–15%).", "÷ Horas faturáveis reais por ano (geralmente 50–60% das horas trabalhadas)."]),
    table([["Item", "Valor anual"], ["Renda desejada", "R$ 120.000"], ["Impostos (~15%)", "R$ 18.000"], ["Custos", "R$ 12.000"], ["Reserva", "R$ 15.000"], ["Total", "R$ 165.000"], ["÷ 1.080 h faturáveis", "R$ 153/h"]]),
    p("R$ 153, não R$ 62,50. A diferença entre os dois é a diferença entre um negócio sustentável e um emprego disfarçado sem benefícios."),
    callout("Use a calculadora de valor da hora freelancer do Nexo para fazer essa conta com os seus números."),
  ]),
  a("componentes-acessiveis-react", "Componentes acessíveis em React: checklist prático para menus, modais e abas", "Acessibilidade não é opcional nem difícil — é uma lista de comportamentos esperados. Foco, teclado, ARIA e movimento reduzido.", "programacao", ["acessibilidade", "React", "UI"], "Júlia Andrade", "2026-02-20", [
    p("A maioria dos problemas de acessibilidade em interfaces React vem de componentes customizados que reimplementam elementos nativos sem replicar o comportamento de teclado."),
    h2("Checklist por componente"),
    h3("Menu / dropdown"),
    ul(["Abre com Enter, Espaço e seta para baixo.", "Setas navegam entre itens; Esc fecha e devolve o foco ao botão.", "aria-expanded no botão e role=menu na lista."]),
    h3("Modal"),
    ul(["Foco vai para o modal ao abrir e volta ao acionador ao fechar.", "Tab fica preso dentro (focus trap).", "role=dialog, aria-modal e aria-labelledby."]),
    h3("Abas"),
    ul(["Setas trocam de aba; Tab entra no conteúdo.", "role=tablist / tab / tabpanel com aria-selected."]),
    h2("Movimento"),
    code("@media (prefers-reduced-motion: reduce) {\n  * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }\n}", "css"),
    p("Use o elemento nativo sempre que possível (button, dialog, details). Quando não der, bibliotecas headless já resolvem o teclado por você."),
  ]),
  a("como-avaliar-uma-ferramenta-de-ia-antes-de-adotar", "Como avaliar uma ferramenta de IA antes de adotar na empresa", "Demonstrações impressionam; o que importa é o desempenho nos seus dados. Um roteiro de avaliação em duas semanas.", "negocios", ["IA", "gestão", "avaliação"], "Marina Costa", "2026-02-16", [
    p("Toda ferramenta de IA parece mágica na demo. O trabalho de avaliação é descobrir onde ela falha nos seus casos — e se o custo da falha é aceitável."),
    h2("Roteiro de duas semanas"),
    ol(["Defina 3 tarefas reais e frequentes.", "Colete 20 exemplos de cada, com o resultado esperado.", "Rode a ferramenta e classifique: correto, aceitável com edição, errado.", "Meça o tempo total com e sem a ferramenta, incluindo revisão.", "Calcule custo mensal projetado com o volume real."]),
    h2("Perguntas para o fornecedor"),
    ul(["Onde os dados são processados e por quanto tempo ficam armazenados?", "Os dados são usados para treinar modelos?", "Como é o comportamento em caso de indisponibilidade?", "Há registro de auditoria das ações?"]),
    callout("Regra prática: se a taxa de 'errado' passa de 10% em tarefas com impacto financeiro, a ferramenta precisa de revisão humana obrigatória — e isso deve entrar na conta do custo."),
  ]),
  a("escrever-para-a-web-clareza", "Escrever para a web: as 10 regras de clareza que valem para qualquer texto", "Frases curtas, uma ideia por parágrafo, verbos fortes. Regras testadas por editores e confirmadas por métricas de leitura.", "conteudo", ["escrita", "conteúdo", "clareza"], "Marina Costa", "2026-02-12", [
    p("Ninguém lê na web — as pessoas escaneiam. Textos que respeitam isso são lidos até o fim; os outros são abandonados no segundo parágrafo."),
    h2("As regras"),
    ol(["Uma ideia por parágrafo; a ideia na primeira frase.", "Frases com até 20 palavras em média.", "Verbos no ativo: 'a equipe aprovou' em vez de 'foi aprovado pela equipe'.", "Corte advérbios e intensificadores ('muito', 'realmente').", "Subtítulos a cada 3–4 parágrafos.", "Listas para itens paralelos.", "Números em algarismos.", "Explique siglas na primeira vez.", "Termine com uma ação ou conclusão clara.", "Leia em voz alta antes de publicar."]),
    h2("Como medir"),
    p("Use um analisador de legibilidade para verificar tamanho médio de frases e palavras difíceis. Não é para escrever para crianças — é para não gastar a atenção do leitor com estrutura em vez de conteúdo."),
  ]),
  a("estrategia-de-produto-com-poucos-recursos", "Estratégia de produto com poucos recursos: o que cortar primeiro", "Times pequenos não perdem por falta de ideias, mas por excesso. Um framework para decidir o que não fazer.", "produto", ["produto", "estratégia", "priorização"], "Rafael Lima", "2026-02-08", [
    p("Em times pequenos, cada funcionalidade custa manutenção eterna. A pergunta certa não é 'isso é útil?' — quase tudo é — mas 'isso é mais útil do que melhorar o que já existe?'."),
    h2("Três filtros"),
    ul(["Frequência: quantos usuários usariam isso toda semana?", "Dor: quão ruim é a alternativa atual?", "Custo total: construir + manter + suportar + explicar."]),
    h2("O que cortar primeiro"),
    ol(["Configurações que menos de 5% usam.", "Integrações com plataformas que seus usuários não usam.", "Telas de administração que podem ser uma planilha.", "Personalizações visuais."]),
    callout("Um produto com 5 funcionalidades excelentes vence um com 30 medianas. Sempre."),
  ]),
];
