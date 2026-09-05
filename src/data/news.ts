import type { Article, Block } from "@/lib/types";

const P = (text: string): Block => ({ type: "p", text });
const H = (text: string): Block => ({ type: "h2", text });
const UL = (items: string[]): Block => ({ type: "ul", items });
const Q = (text: string): Block => ({ type: "quote", text });
const C = (text: string, tone: "info" | "tip" | "warn" = "info"): Block => ({ type: "callout", tone, text });
const AD: Block = { type: "ad" };

const n = (a: Omit<Article, "kind">): Article => ({ kind: "news", ...a });

export const news: Article[] = [
  n({
    slug: "agentes-de-ia-passam-a-executar-tarefas-completas", title: "Agentes de IA deixam o chat e passam a executar tarefas completas no navegador",
    excerpt: "A nova geração de assistentes navega, preenche formulários e conclui fluxos inteiros. Entenda o que muda para empresas e usuários.",
    category: "Inteligência Artificial", tags: ["agentes", "automação", "llm"], date: "2026-03-09T09:00:00Z", readTime: 5, author: "Redação Nexo", cover: "blue", popularity: 96,
    body: [
      P("Durante dois anos, a interação com modelos de linguagem foi essencialmente conversacional: você pergunta, o modelo responde. Esse paradigma está sendo substituído por **agentes** — sistemas que recebem um objetivo, planejam etapas, usam ferramentas e verificam o próprio resultado."),
      H("O que mudou tecnicamente"),
      P("Três avanços convergiram: modelos com janelas de contexto maiores e raciocínio em múltiplas etapas, protocolos padronizados para conectar ferramentas (como o MCP) e ambientes de execução isolados que permitem ao agente agir com segurança em navegadores e sistemas de arquivos."),
      UL(["Planejamento: o agente decompõe a tarefa em subtarefas verificáveis.", "Uso de ferramentas: chamadas a APIs, navegação web, execução de código.", "Autoavaliação: o próprio modelo revisa o resultado antes de finalizar."]),
      AD,
      H("Impacto para quem trabalha com tecnologia"),
      P("Fluxos repetitivos — reconciliação de planilhas, triagem de tickets, pesquisa de mercado — são os primeiros candidatos à automação. O papel humano migra para definir objetivos, revisar exceções e garantir governança."),
      C("Dica prática: comece com tarefas de baixo risco e alta repetição. Exija logs de cada ação do agente antes de expandir o escopo.", "tip"),
      Q("A pergunta deixou de ser 'o que a IA sabe' e passou a ser 'o que a IA pode fazer com segurança'."),
    ],
  }),
  n({
    slug: "modelos-pequenos-rodando-localmente-ganham-espaco", title: "Modelos pequenos rodando localmente ganham espaço em notebooks e celulares",
    excerpt: "Com 3 a 8 bilhões de parâmetros, os SLMs entregam qualidade suficiente para a maioria das tarefas do dia a dia — sem enviar dados para a nuvem.",
    category: "Inteligência Artificial", tags: ["slm", "privacidade", "edge"], date: "2026-03-06T12:00:00Z", readTime: 4, author: "Redação Nexo", cover: "teal", popularity: 88,
    body: [
      P("A corrida por modelos cada vez maiores encontrou um contraponto: modelos compactos, quantizados, que rodam em uma GPU de notebook ou no chip de um smartphone. Para resumir e-mails, classificar textos ou autocompletar código, a diferença de qualidade em relação aos gigantes é pequena — e a latência e a privacidade são incomparáveis."),
      H("Por que isso importa"),
      UL(["Privacidade: os dados não saem do dispositivo.", "Custo: zero por token após o download.", "Disponibilidade: funciona offline, em campo ou em redes instáveis."]),
      AD,
      P("Ferramentas como Ollama, LM Studio e o runtime WebGPU dos navegadores tornaram a instalação trivial. Para desenvolvedores, o padrão emergente é **híbrido**: um modelo local para tarefas simples e um modelo em nuvem apenas quando a complexidade exige."),
      C("Se você tem 16 GB de RAM, já consegue rodar um modelo de 7B quantizado em 4 bits com boa fluidez.", "info"),
    ],
  }),
  n({
    slug: "regulacao-de-ia-no-brasil-o-que-esperar", title: "Regulação de IA no Brasil: o que empresas e desenvolvedores devem acompanhar",
    excerpt: "O debate sobre o marco legal da inteligência artificial avança com foco em classificação de risco, transparência e direitos autorais.",
    category: "Política e Tecnologia", tags: ["regulação", "brasil", "lgpd"], date: "2026-03-04T15:30:00Z", readTime: 6, author: "Redação Nexo", cover: "ink", popularity: 80,
    body: [
      P("O modelo em discussão no Congresso segue a lógica europeia de classificação por risco: sistemas de alto risco (saúde, crédito, segurança pública) teriam obrigações reforçadas de documentação, auditoria e supervisão humana."),
      H("Pontos de atenção para times de produto"),
      UL(["Transparência: informar ao usuário quando ele interage com IA.", "Explicabilidade: manter registros que permitam auditar decisões automatizadas.", "Dados de treinamento: rastreabilidade e respeito a direitos autorais.", "Interação com a LGPD: base legal para uso de dados pessoais em treinamento."]),
      AD,
      P("Independentemente do texto final, a tendência é clara: documentação de modelos, avaliação de vieses e canais de contestação deixarão de ser diferenciais e passarão a ser requisitos."),
      C("Este texto é informativo e não constitui aconselhamento jurídico. Acompanhe fontes oficiais para o andamento da legislação.", "warn"),
    ],
  }),
  n({
    slug: "geracao-de-video-por-ia-chega-a-producao-profissional", title: "Geração de vídeo por IA chega à produção profissional — com limites claros",
    excerpt: "Ferramentas de text-to-video já produzem planos de 5 a 20 segundos com consistência suficiente para publicidade e B-roll.",
    category: "Criatividade", tags: ["vídeo", "ia generativa", "produção"], date: "2026-03-02T10:00:00Z", readTime: 5, author: "Redação Nexo", cover: "rose", popularity: 84,
    body: [
      P("Produtoras já usam modelos generativos para storyboards animados, B-roll de apoio e variações de anúncio. O que ainda não funciona bem: diálogos longos, continuidade de personagens entre cenas e texto legível dentro do vídeo."),
      H("Fluxo de trabalho que está se consolidando"),
      UL(["Imagem-chave gerada e aprovada primeiro (image-to-video).", "Planos curtos de 4–8 s, montados em edição tradicional.", "Correção de cor e som feitos por humanos."]),
      AD,
      P("Para criadores independentes, o ganho é acesso: cenas que exigiriam locação e equipe agora custam alguns créditos. Para profissionais, é velocidade na pré-produção."),
    ],
  }),
  n({
    slug: "copilotos-de-codigo-e-produtividade-de-times", title: "Copilotos de código: estudos apontam ganho real, mas exigem revisão disciplinada",
    excerpt: "Times relatam entrega mais rápida de tarefas rotineiras; a qualidade depende de testes e code review, não do assistente.",
    category: "Desenvolvimento", tags: ["programação", "copilot", "produtividade"], date: "2026-02-27T09:00:00Z", readTime: 4, author: "Redação Nexo", cover: "violet", popularity: 78,
    body: [
      P("Assistentes de código evoluíram do autocompletar para agentes que abrem pull requests. O ganho é consistente em tarefas bem definidas — testes, migrações, boilerplate — e menor em decisões arquiteturais."),
      H("O que times maduros estão fazendo"),
      UL(["Exigem testes automatizados para qualquer código gerado.", "Mantêm code review humano obrigatório.", "Documentam padrões do projeto em arquivos que o assistente lê (ex.: AGENTS.md).", "Medem defeitos em produção, não só velocidade."]),
      AD,
      C("Use o assistente para escrever o teste antes da implementação. É a forma mais barata de garantir que o código gerado faz o que você pediu.", "tip"),
    ],
  }),
  n({
    slug: "busca-com-ia-muda-o-seo", title: "Busca com IA muda o jogo do SEO: menos cliques, mais citações",
    excerpt: "Respostas geradas no topo dos resultados reduzem o tráfego para páginas informacionais. Estratégias de conteúdo precisam se adaptar.",
    category: "Marketing Digital", tags: ["seo", "busca", "conteúdo"], date: "2026-02-24T14:00:00Z", readTime: 5, author: "Redação Nexo", cover: "amber", popularity: 90,
    body: [
      P("Quando o buscador responde diretamente, o usuário não precisa clicar. Sites de conteúdo informacional genérico sentem a queda; sites com dados originais, ferramentas e experiência própria são citados como fonte."),
      H("O que ainda funciona"),
      UL(["Conteúdo com experiência real (casos, números próprios, testes).", "Ferramentas interativas que a IA não substitui — calculadoras, conversores, geradores.", "Marcação estruturada (FAQ, HowTo, Article) para facilitar a citação.", "Marca: pessoas buscam pelo nome quando confiam."]),
      AD,
      P("O termo em alta é **GEO** (Generative Engine Optimization): otimizar para ser citado pela IA, não apenas ranqueado."),
    ],
  }),
  n({
    slug: "chips-de-ia-e-a-corrida-pela-eficiencia-energetica", title: "Chips de IA: a corrida agora é por eficiência energética, não só por desempenho",
    excerpt: "Data centers pressionam redes elétricas; fabricantes respondem com arquiteturas focadas em inferência e menor consumo por token.",
    category: "Hardware", tags: ["chips", "energia", "data center"], date: "2026-02-20T11:00:00Z", readTime: 4, author: "Redação Nexo", cover: "green", popularity: 70,
    body: [
      P("O custo de treinar grandes modelos chamou atenção, mas é a **inferência** — atender bilhões de requisições por dia — que domina a conta de energia. A resposta da indústria é especialização: chips dedicados a inferência, memória mais próxima do processador e quantização agressiva."),
      AD,
      H("Consequências práticas"),
      UL(["Preço por token continua caindo.", "Modelos menores e destilados ganham prioridade.", "Sustentabilidade vira métrica de escolha de fornecedor."]),
    ],
  }),
  n({
    slug: "open-source-em-ia-reduz-distancia-para-modelos-fechados", title: "Modelos open source reduzem distância para os fechados e mudam a economia da IA",
    excerpt: "Com pesos abertos e licenças permissivas, empresas ganham controle e previsibilidade de custo.",
    category: "Inteligência Artificial", tags: ["open source", "llm", "custos"], date: "2026-02-17T09:30:00Z", readTime: 4, author: "Redação Nexo", cover: "blue", popularity: 82,
    body: [
      P("A diferença de qualidade entre os melhores modelos abertos e fechados encolheu para poucos meses. Para muitas aplicações — atendimento, classificação, RAG — modelos abertos ajustados superam modelos fechados genéricos."),
      H("Quando escolher open source"),
      UL(["Dados sensíveis que não podem sair da infraestrutura.", "Volume alto onde custo por token importa.", "Necessidade de fine-tuning ou controle total do comportamento."]),
      AD,
      C("Atenção às licenças: 'pesos abertos' nem sempre significa uso comercial irrestrito.", "warn"),
    ],
  }),
  n({
    slug: "deepfakes-e-verificacao-de-conteudo", title: "Deepfakes: padrões de proveniência de conteúdo começam a ser adotados por plataformas",
    excerpt: "Credenciais de conteúdo (C2PA) e marcas d'água invisíveis avançam como resposta à desinformação sintética.",
    category: "Segurança", tags: ["deepfake", "segurança", "c2pa"], date: "2026-02-13T16:00:00Z", readTime: 5, author: "Redação Nexo", cover: "ink", popularity: 75,
    body: [
      P("A detecção de conteúdo sintético é uma corrida perdida: cada detector é superado pela próxima geração de modelos. A alternativa em consolidação é **proveniência**: assinar criptograficamente a origem e as edições de uma mídia."),
      UL(["Câmeras e softwares de edição assinam metadados.", "Plataformas exibem o histórico de origem.", "Conteúdo sem credencial não é bloqueado, mas perde confiança."]),
      AD,
      C("Para se proteger: desconfie de urgência, verifique em múltiplas fontes e use busca reversa de imagens.", "tip"),
    ],
  }),
  n({
    slug: "educacao-e-ia-escolas-repensam-avaliacao", title: "Educação e IA: escolas repensam avaliação e apostam em processo, não em produto final",
    excerpt: "Com redações e exercícios facilmente gerados, instituições migram para avaliações orais, projetos e defesa de raciocínio.",
    category: "Educação", tags: ["educação", "ensino", "avaliação"], date: "2026-02-10T08:00:00Z", readTime: 4, author: "Redação Nexo", cover: "teal", popularity: 68,
    body: [
      P("Proibir a IA se mostrou ineficaz. A tendência é integrá-la como ferramenta declarada e avaliar o que ela não substitui: argumentação ao vivo, tomada de decisão, colaboração e capacidade de criticar a própria saída da IA."),
      AD,
      UL(["Rubricas que pontuam o processo (rascunhos, versões, justificativas).", "Uso de IA permitido com registro dos prompts usados.", "Foco em problemas locais e dados próprios da turma."]),
    ],
  }),
  n({
    slug: "assistentes-de-voz-com-llm-chegam-aos-carros-e-casas", title: "Assistentes de voz com LLM chegam a carros e casas — e finalmente entendem contexto",
    excerpt: "A troca de comandos rígidos por conversas naturais reacende a categoria de assistentes pessoais.",
    category: "Produtos", tags: ["voz", "assistentes", "iot"], date: "2026-02-06T13:00:00Z", readTime: 3, author: "Redação Nexo", cover: "violet", popularity: 64,
    body: [
      P("A primeira geração de assistentes de voz falhou na compreensão. Com modelos de linguagem e latência abaixo de 500 ms, é possível interromper, corrigir e encadear pedidos como em uma conversa."),
      AD,
      P("O desafio agora é **ação**: integrar de forma confiável com dispositivos e serviços sem que uma interpretação errada gere consequências físicas."),
    ],
  }),
  n({
    slug: "mercado-de-trabalho-e-ia-novas-funcoes", title: "Mercado de trabalho e IA: as funções que mais crescem exigem julgamento, não repetição",
    excerpt: "Levantamentos de vagas apontam alta em papéis de orquestração, curadoria de dados e governança de IA.",
    category: "Carreira", tags: ["carreira", "empregos", "habilidades"], date: "2026-02-03T09:00:00Z", readTime: 5, author: "Redação Nexo", cover: "amber", popularity: 86,
    body: [
      P("As tarefas mais automatizáveis são as previsíveis. As funções em crescimento combinam domínio de negócio com capacidade de definir problemas, avaliar saídas de IA e assumir responsabilidade pelas decisões."),
      H("Habilidades em alta"),
      UL(["Formulação de problemas e escrita de especificações claras.", "Avaliação crítica de resultados gerados por IA.", "Integração de sistemas e automação de fluxos.", "Comunicação e gestão de stakeholders."]),
      AD,
      C("Explore nossa central de prompts e ferramentas de produtividade para praticar essas habilidades no dia a dia.", "tip"),
    ],
  }),
];
