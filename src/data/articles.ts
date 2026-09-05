import type { Article, Block } from "@/lib/types";

const P = (text: string): Block => ({ type: "p", text });
const H = (text: string): Block => ({ type: "h2", text });
const H3 = (text: string): Block => ({ type: "h3", text });
const UL = (items: string[]): Block => ({ type: "ul", items });
const OL = (items: string[]): Block => ({ type: "ol", items });
const Q = (text: string): Block => ({ type: "quote", text });
const C = (text: string, tone: "info" | "tip" | "warn" = "info"): Block => ({ type: "callout", tone, text });
const CODE = (code: string, lang = "text"): Block => ({ type: "code", lang, code });
const AD: Block = { type: "ad" };

const b = (a: Omit<Article, "kind">): Article => ({ kind: "blog", ...a });

export const articles: Article[] = [
  b({
    slug: "como-escrever-prompts-que-funcionam", title: "Como escrever prompts que realmente funcionam: um método em 6 partes",
    excerpt: "Prompt não é mágica, é especificação. Aprenda a estrutura objetivo–contexto–público–tom–formato–resultado e pare de tentar na sorte.",
    category: "IA na prática", tags: ["prompts", "chatgpt", "produtividade"], date: "2026-03-08T10:00:00Z", readTime: 8, author: "Equipe Nexo", cover: "blue", popularity: 97,
    body: [
      P("A maioria dos prompts ruins tem o mesmo defeito: pedem um resultado sem descrever o problema. O modelo preenche as lacunas com o padrão mais provável — e o padrão raramente é o que você queria."),
      H("A estrutura em 6 partes"),
      OL(["**Objetivo** — o que você quer que exista ao final (um e-mail, uma tabela, uma decisão).", "**Contexto** — quem é você, qual a situação, o que já foi tentado.", "**Público** — quem vai ler ou usar o resultado.", "**Tom** — formal, didático, direto, bem-humorado.", "**Formato** — bullets, tabela, JSON, passo a passo, tamanho.", "**Resultado esperado** — critérios de sucesso e exemplos do que é bom."]),
      AD,
      H("Antes e depois"),
      CODE("❌ Escreva um e-mail para meu chefe pedindo aumento.\n\n✅ Escreva um e-mail para minha gestora pedindo revisão salarial. Contexto: trabalho há 2 anos como analista de dados, assumi 2 projetos além do escopo e entreguei um dashboard que reduziu 30% do tempo de relatório. Público: gestora direta, ocupada, valoriza objetividade. Tom: profissional e confiante, sem soar ansioso. Formato: até 150 palavras, com um pedido claro de reunião. Resultado esperado: ela entender meu impacto em 20 segundos e aceitar conversar."),
      H("Três erros comuns"),
      UL(["Pedir várias coisas em um único prompt sem separar as etapas.", "Não dar exemplos do que é bom (few-shot resolve 80% dos casos).", "Aceitar a primeira resposta em vez de pedir crítica e revisão."]),
      C("Use nosso Prompt Builder para montar essa estrutura automaticamente e salvar seus presets.", "tip"),
      Q("Um prompt bem escrito é uma boa especificação. E boas especificações são raras."),
    ],
  }),
  b({
    slug: "ia-local-vs-nuvem-qual-escolher", title: "IA local ou na nuvem? Um guia honesto para escolher",
    excerpt: "Privacidade, custo, latência e qualidade. Comparamos os dois caminhos com cenários reais para você decidir sem achismo.",
    category: "IA na prática", tags: ["llm", "privacidade", "infraestrutura"], date: "2026-03-05T09:00:00Z", readTime: 7, author: "Equipe Nexo", cover: "teal", popularity: 82,
    body: [
      P("Não existe resposta universal. Existe a resposta certa para o seu volume, a sensibilidade dos seus dados e a qualidade mínima aceitável."),
      H("Quando local vence"),
      UL(["Dados regulados (saúde, jurídico, financeiro).", "Volume alto e previsível: custo fixo de hardware amortiza rápido.", "Necessidade de funcionar offline."]),
      H("Quando nuvem vence"),
      UL(["Tarefas que exigem os melhores modelos (raciocínio complexo, código difícil).", "Volume baixo ou irregular.", "Time pequeno sem capacidade de operar infraestrutura."]),
      AD,
      H("O caminho híbrido"),
      P("A arquitetura mais comum em 2026 é roteamento: um classificador leve decide se a requisição vai para um modelo local barato ou para um modelo em nuvem premium. Em média, 70–80% das requisições ficam no local."),
      C("Meça antes de decidir: rode 200 exemplos reais nos dois caminhos e compare qualidade, latência e custo em uma planilha.", "tip"),
    ],
  }),
  b({
    slug: "10-ferramentas-online-que-substituem-apps-pagos", title: "10 ferramentas online gratuitas que substituem apps pagos no dia a dia",
    excerpt: "Do gerador de senha ao QR Code, passando por conversores e Pomodoro: tudo roda no navegador, sem instalar nada.",
    category: "Ferramentas", tags: ["ferramentas", "produtividade", "gratuito"], date: "2026-03-01T11:00:00Z", readTime: 6, author: "Equipe Nexo", cover: "amber", popularity: 88,
    body: [
      P("Instalar um app para cada pequena tarefa é um hábito caro em espaço, atenção e privacidade. Reunimos utilitários que resolvem o problema em segundos, direto no navegador."),
      OL(["[Gerador de Senha](/ferramentas/gerador-de-senha) — com entropia e frases-senha.", "[Gerador de QR Code](/ferramentas/gerador-de-qr-code) — links, Wi-Fi e contatos.", "[Juros Compostos](/ferramentas/juros-compostos) — com aportes mensais.", "[Contador de Palavras](/ferramentas/contador-de-palavras) — tempo de leitura incluso.", "[Formatador JSON](/ferramentas/formatador-json) — valida e aponta o erro.", "[Conversor de Cores](/ferramentas/conversor-de-cores) — HEX, RGB, HSL.", "[Pomodoro](/ferramentas/pomodoro) — foco com ciclos.", "[Diferença entre Datas](/ferramentas/diferenca-entre-datas) — com dias úteis.", "[Resumidor de Texto](/ferramentas/resumidor-de-texto) — local, sem API.", "[Sorteador](/ferramentas/sorteador) — nomes e números."]),
      AD,
      C("Todas processam os dados localmente. Nada é enviado a servidores.", "info"),
    ],
  }),
  b({
    slug: "juros-compostos-explicados-com-exemplos", title: "Juros compostos explicados com exemplos reais (e uma calculadora)",
    excerpt: "A fórmula, o efeito do tempo, o impacto dos aportes e os erros que corroem o rendimento. Sem economês.",
    category: "Finanças", tags: ["finanças", "investimentos", "juros compostos"], date: "2026-02-26T09:00:00Z", readTime: 9, author: "Equipe Nexo", cover: "green", popularity: 91,
    body: [
      P("Juros compostos são juros sobre juros: cada período, o rendimento é calculado sobre o montante acumulado, não sobre o capital inicial. Parece detalhe; ao longo de décadas, é a diferença entre uma reserva e um patrimônio."),
      H("A fórmula"),
      CODE("M = C × (1 + i)^t\n\nM = montante final\nC = capital inicial\ni = taxa por período (decimal)\nt = número de períodos"),
      H("Exemplo 1: sem aportes"),
      P("R$ 10.000 a 0,8% ao mês por 10 anos (120 meses): M = 10.000 × (1,008)^120 ≈ **R$ 26.000**. Os juros renderam mais do que o capital inicial."),
      H("Exemplo 2: com aportes mensais"),
      P("Os mesmos R$ 10.000 iniciais + R$ 500/mês, mesma taxa e prazo: M ≈ **R$ 122.000**. Os aportes somaram R$ 60.000; o restante veio dos juros."),
      AD,
      H("Os três erros que destroem o efeito"),
      UL(["Começar tarde: os últimos anos concentram a maior parte do ganho.", "Interromper aportes: quebra a base sobre a qual os juros incidem.", "Ignorar taxas e inflação: 0,5% de taxa de administração ao ano pode consumir 15% do resultado em 30 anos."]),
      C("Simule o seu cenário na [Calculadora de Juros Compostos](/ferramentas/juros-compostos) e veja a evolução ano a ano.", "tip"),
    ],
  }),
  b({
    slug: "senhas-fortes-guia-definitivo", title: "Senhas fortes em 2026: o que realmente importa (e o que é mito)",
    excerpt: "Tamanho vence complexidade, gerenciadores são obrigatórios e trocar senha todo mês é contraproducente. Entenda por quê.",
    category: "Segurança", tags: ["segurança", "senhas", "privacidade"], date: "2026-02-22T10:00:00Z", readTime: 6, author: "Equipe Nexo", cover: "ink", popularity: 79,
    body: [
      P("A regra 'letra maiúscula + número + símbolo' nasceu em 2003 e seu próprio autor já a reconsiderou. O que protege contra ataques modernos é **entropia** — e entropia vem principalmente de tamanho e aleatoriedade."),
      H("O que importa"),
      OL(["Tamanho: 16+ caracteres aleatórios ou 5+ palavras aleatórias.", "Unicidade: uma senha por serviço, sempre.", "Gerenciador de senhas: para não depender de memória.", "Autenticação em dois fatores: preferencialmente app ou chave física, não SMS."]),
      AD,
      H("Mitos"),
      UL(["Trocar senha periodicamente: só se houver suspeita de vazamento.", "Substituir letras por símbolos (P@ssw0rd): já está em todos os dicionários de ataque.", "Perguntas de segurança: respostas verdadeiras são fáceis de descobrir. Use respostas aleatórias guardadas no gerenciador."]),
      C("Gere senhas e frases-senha com medidor de entropia no nosso [Gerador de Senha](/ferramentas/gerador-de-senha).", "tip"),
    ],
  }),
  b({
    slug: "como-criar-um-site-com-react-e-vite-do-zero", title: "Como criar um site moderno com React, Vite e Tailwind do zero",
    excerpt: "Passo a passo prático, do primeiro comando ao deploy na Vercel, com estrutura de pastas que escala.",
    category: "Desenvolvimento", tags: ["react", "vite", "tailwind", "front-end"], date: "2026-02-18T09:00:00Z", readTime: 10, author: "Equipe Nexo", cover: "violet", popularity: 85,
    body: [
      P("Vite substituiu o Create React App como padrão por um motivo: inicia em milissegundos e o build é otimizado por padrão. Combinado com Tailwind v4, você tem um setup produtivo em minutos."),
      H("1. Criar o projeto"),
      CODE("npm create vite@latest meu-site -- --template react-ts\ncd meu-site\nnpm install\nnpm install tailwindcss @tailwindcss/vite", "bash"),
      H("2. Configurar o Tailwind v4"),
      CODE("// vite.config.ts\nimport tailwindcss from '@tailwindcss/vite'\nexport default defineConfig({ plugins: [react(), tailwindcss()] })\n\n/* src/index.css */\n@import \"tailwindcss\";", "ts"),
      AD,
      H("3. Estrutura que escala"),
      CODE("src/\n  components/   ui, layout\n  pages/        uma pasta por rota\n  lib/          utils, hooks, store\n  data/         conteúdo estático tipado"),
      H("4. Deploy"),
      P("Suba para o GitHub, importe na Vercel e pronto. Para SPAs com React Router, adicione um `vercel.json` com rewrite de todas as rotas para `/index.html`."),
      C("Veja o [guia completo de deploy na Vercel](/guias/deploy-de-spa-react-na-vercel).", "tip"),
    ],
  }),
  b({
    slug: "seo-para-sites-de-ferramentas", title: "SEO para sites de ferramentas: como ranquear calculadoras e conversores",
    excerpt: "Páginas de ferramenta são as que mais resistem à busca com IA. Veja como estruturá-las para ranquear e converter.",
    category: "Marketing Digital", tags: ["seo", "ferramentas", "conteúdo"], date: "2026-02-14T09:00:00Z", readTime: 7, author: "Equipe Nexo", cover: "amber", popularity: 76,
    body: [
      P("Uma calculadora resolve um problema que um parágrafo gerado por IA não resolve. Por isso, páginas de ferramenta mantêm cliques mesmo com respostas geradas no topo dos resultados."),
      H("Anatomia de uma página de ferramenta que ranqueia"),
      OL(["H1 com a intenção exata ('Calculadora de Juros Compostos').", "A ferramenta acima da dobra, funcional sem rolar.", "Explicação de como usar + fórmula + exemplos.", "FAQ com marcação schema.org/FAQPage.", "Links internos para ferramentas relacionadas."]),
      AD,
      UL(["Título até 60 caracteres, description até 155.", "URL curta e descritiva.", "Velocidade: sem bibliotecas pesadas na primeira carga."]),
    ],
  }),
  b({
    slug: "produtividade-com-ia-rotina-de-um-profissional", title: "Uma rotina de produtividade com IA que não depende de força de vontade",
    excerpt: "Blocos de foco, revisão semanal assistida e automações simples. Um sistema que funciona em dias ruins.",
    category: "Produtividade", tags: ["produtividade", "rotina", "ia"], date: "2026-02-11T09:00:00Z", readTime: 6, author: "Equipe Nexo", cover: "rose", popularity: 80,
    body: [
      P("Sistemas de produtividade falham quando exigem disciplina constante. O objetivo aqui é reduzir decisões: a IA prepara, você executa."),
      H("Manhã (10 min)"),
      UL(["Cole sua agenda e lista de tarefas em um prompt de planejamento diário.", "Peça 3 prioridades e blocos de foco de 90 min."]),
      H("Durante o dia"),
      UL(["Pomodoro para blocos de foco.", "Anotações rápidas em um único lugar — sem organizar na hora."]),
      AD,
      H("Sexta (20 min)"),
      UL(["Prompt de revisão semanal: o que foi feito, o que travou, o que ajustar.", "Limpe a lista: delegue, adie ou delete."]),
      C("Experimente o [Pomodoro](/ferramentas/pomodoro), a [Lista de Tarefas](/ferramentas/lista-de-tarefas) e o preset 'Planejamento semanal' no Prompt Builder.", "tip"),
    ],
  }),
  b({
    slug: "o-que-e-rag-e-por-que-importa", title: "O que é RAG e por que é a técnica mais usada em IA corporativa",
    excerpt: "Retrieval-Augmented Generation permite que modelos respondam com base nos seus documentos, sem retreinar. Entenda como funciona.",
    category: "IA na prática", tags: ["rag", "llm", "arquitetura"], date: "2026-02-07T09:00:00Z", readTime: 8, author: "Equipe Nexo", cover: "blue", popularity: 83,
    body: [
      P("Um modelo de linguagem sabe o que estava nos dados de treinamento até certa data. Ele não sabe o conteúdo do seu manual interno. RAG resolve isso: antes de responder, o sistema **busca** trechos relevantes nos seus documentos e os injeta no prompt."),
      H("As etapas"),
      OL(["Indexação: documentos são divididos em trechos e convertidos em embeddings (vetores).", "Busca: a pergunta vira um vetor e os trechos mais próximos são recuperados.", "Geração: o modelo responde usando apenas os trechos recuperados como contexto."]),
      AD,
      H("Onde os projetos falham"),
      UL(["Chunking ruim: trechos cortados no meio de uma ideia.", "Sem reranking: os 5 trechos mais 'próximos' não são os mais úteis.", "Sem avaliação: ninguém mede se as respostas estão corretas."]),
      Q("RAG não é um modelo mais inteligente. É um modelo com acesso à informação certa na hora certa."),
    ],
  }),
  b({
    slug: "dark-mode-bem-feito", title: "Dark mode bem feito: tokens de cor, contraste e o erro do preto puro",
    excerpt: "Não basta inverter as cores. Veja como projetar um tema escuro confortável e acessível com CSS moderno.",
    category: "Design", tags: ["design", "css", "acessibilidade"], date: "2026-02-04T09:00:00Z", readTime: 5, author: "Equipe Nexo", cover: "ink", popularity: 72,
    body: [
      P("Um tema escuro mal feito cansa mais do que o claro. Os erros são sempre os mesmos: fundo #000, texto #FFF, sombras que desaparecem e cores saturadas que vibram."),
      H("Regras práticas"),
      UL(["Fundo entre #0b0d12 e #16181d, nunca preto puro.", "Texto principal por volta de #f2f4f8, secundário com 60–70% de contraste.", "Elevação por tonalidade (superfícies mais claras), não por sombra.", "Dessature cores de destaque em 10–20%."]),
      AD,
      CODE(":root { --bg: #ffffff; --fg: #0b0d12; }\n.dark { --bg: #0b0d12; --fg: #f2f4f8; }\nbody { background: var(--bg); color: var(--fg); }", "css"),
      C("Este site usa exatamente essa abordagem: tokens semânticos em CSS e a classe .dark no <html>.", "info"),
    ],
  }),
  b({
    slug: "como-avaliar-uma-ferramenta-de-ia-antes-de-pagar", title: "Como avaliar uma ferramenta de IA antes de pagar por ela",
    excerpt: "Um checklist de 12 pontos para separar produto de promessa: dados, custo real, lock-in e qualidade medida.",
    category: "Negócios", tags: ["ia", "negócios", "avaliação"], date: "2026-01-30T09:00:00Z", readTime: 6, author: "Equipe Nexo", cover: "teal", popularity: 74,
    body: [
      P("O mercado está cheio de 'wrappers' — interfaces bonitas sobre a mesma API. Alguns entregam valor real; outros cobram caro por um prompt que você poderia escrever."),
      H("Checklist"),
      OL(["Qual modelo está por baixo e posso trocá-lo?", "Meus dados são usados para treinar?", "Existe exportação completa dos meus dados?", "Qual o custo real por resultado útil, não por assento?", "Há avaliação objetiva de qualidade (benchmarks próprios)?", "O que acontece se a empresa fechar?"]),
      AD,
      C("Teste com 20 casos reais do seu trabalho antes de assinar qualquer plano anual.", "tip"),
    ],
  }),
  b({
    slug: "engenharia-de-contexto-alem-do-prompt", title: "Engenharia de contexto: o próximo passo depois do prompt",
    excerpt: "Com agentes e janelas enormes, o que importa não é só o que você pede, mas o que o modelo tem à disposição para responder.",
    category: "IA na prática", tags: ["contexto", "agentes", "llm"], date: "2026-01-26T09:00:00Z", readTime: 7, author: "Equipe Nexo", cover: "violet", popularity: 78,
    body: [
      P("Prompt engineering otimiza a pergunta. **Context engineering** otimiza tudo o que acompanha a pergunta: instruções do sistema, documentos, histórico, ferramentas disponíveis e exemplos."),
      H("Princípios"),
      UL(["Menos é mais: contexto irrelevante degrada a resposta.", "Ordem importa: instruções críticas no início e no fim.", "Ferramentas bem descritas valem mais que exemplos longos.", "Memória seletiva: resuma o histórico em vez de anexá-lo inteiro."]),
      AD,
      H3("Um exemplo de arquivo de contexto para projetos"),
      CODE("# AGENTS.md\n- Stack: React 19, Vite, Tailwind v4\n- Convenções: componentes em PascalCase, hooks em use*\n- Testes: vitest; rode `npm test` antes de propor mudanças\n- Nunca editar: vite.config.ts, package.json", "md"),
    ],
  }),
];
