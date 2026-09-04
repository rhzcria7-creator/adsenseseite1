import type { ContentBlock, NewsItem } from "@/lib/types";

const p = (text: string): ContentBlock => ({ type: "p", text });
const h2 = (text: string): ContentBlock => ({ type: "h2", text });
const ul = (items: string[]): ContentBlock => ({ type: "ul", items });
const callout = (text: string): ContentBlock => ({ type: "callout", text });
const quote = (text: string): ContentBlock => ({ type: "quote", text });

function n(slug: string, title: string, excerpt: string, category: string, tags: string[], publishedAt: string, body: ContentBlock[], featured = false): NewsItem {
  return { kind: "news", slug, title, excerpt, category, tags, author: "Redação Nexo", publishedAt, readingTime: Math.max(2, Math.round(body.reduce((a, b) => a + (b.text?.length ?? 0) + (b.items?.join(" ").length ?? 0), 0) / 1100)), body, featured, source: { name: "Análise editorial Nexo" } };
}

export const NEWS: NewsItem[] = [
  n("agentes-de-ia-passam-a-executar-tarefas-de-ponta-a-ponta", "Agentes de IA deixam o laboratório e passam a executar tarefas de ponta a ponta", "A nova geração de assistentes não só responde: navega, preenche formulários, escreve código e revisa o próprio trabalho. Entenda o que muda para quem usa e para quem constrói.", "inteligencia-artificial", ["agentes", "LLM", "automação"], "2026-03-18", [
    p("Durante dois anos, a conversa sobre IA generativa girou em torno de chat. Em 2026 o centro de gravidade se moveu: os grandes provedores lançaram agentes capazes de operar navegadores, planilhas e terminais de forma autônoma, com supervisão humana em pontos de decisão."),
    h2("O que é diferente agora"),
    ul(["Planejamento em múltiplos passos com verificação intermediária dos resultados.", "Uso de ferramentas (APIs, navegador, sistema de arquivos) via protocolos padronizados.", "Memória de sessão mais longa, com contexto de centenas de milhares de tokens.", "Mecanismos de 'pedir permissão' antes de ações irreversíveis, como pagamentos e envios."]),
    p("Na prática, tarefas que exigiam dez janelas abertas — comparar fornecedores, preencher um cadastro, consolidar um relatório — passam a ser descritas em linguagem natural e delegadas."),
    h2("Impacto para pequenas empresas"),
    p("O ganho mais imediato está em operações repetitivas de back-office. Mas há um custo escondido: agentes erram com confiança. Empresas que adotaram cedo relatam que a etapa de revisão humana continua sendo indispensável e que os melhores resultados vêm quando o escopo da tarefa é estreito e bem definido."),
    callout("Dica prática: antes de delegar uma tarefa a um agente, escreva o critério de sucesso em uma frase. Se você não consegue, o agente também não vai conseguir."),
    h2("O que observar nos próximos meses"),
    ul(["Padrões abertos de comunicação entre agentes e ferramentas.", "Auditoria e registro de ações para conformidade.", "Precificação por tarefa concluída, e não por token."]),
  ], true),
  n("modelos-abertos-alcancam-paridade-em-tarefas-de-codigo", "Modelos de pesos abertos alcançam paridade com os proprietários em tarefas de código", "Benchmarks independentes mostram que modelos abertos rodando em hardware acessível já resolvem a maior parte dos problemas práticos de programação.", "programacao", ["open source", "LLM", "desenvolvimento"], "2026-03-15", [
    p("A distância entre modelos abertos e fechados em programação encolheu a ponto de, em muitos cenários corporativos, deixar de ser um fator de decisão. O que pesa agora é custo, privacidade e integração."),
    h2("Por que isso importa"),
    p("Equipes que não podem enviar código para servidores de terceiros — bancos, saúde, governo — passam a ter alternativas reais para assistentes de programação locais. Um servidor com uma única GPU de consumo já atende um time pequeno."),
    ul(["Autocompletar e refatoração com latência baixa.", "Revisão de pull requests com contexto do repositório inteiro.", "Geração de testes a partir de especificações."]),
    quote("A pergunta deixou de ser 'qual modelo é o melhor' e passou a ser 'qual modelo é bom o bastante para este fluxo, ao menor custo'."),
    h2("Ressalvas"),
    p("Os modelos abertos ainda ficam atrás em raciocínio longo e em tarefas com muitos arquivos interdependentes. Para arquitetura e decisões de design, os proprietários seguem à frente."),
  ], true),
  n("regulacao-de-ia-no-brasil-avanca-com-regras-para-sistemas-de-alto-risco", "Regulação de IA no Brasil avança com regras para sistemas de alto risco", "Texto em tramitação define obrigações de transparência, avaliação de impacto e direito à explicação. Saiba o que muda para empresas e usuários.", "tecnologia", ["regulação", "governo", "privacidade"], "2026-03-12", [
    p("O marco regulatório brasileiro para inteligência artificial ganhou contornos mais claros. A abordagem segue o modelo baseado em risco: quanto maior o potencial de dano de um sistema, maiores as obrigações."),
    h2("Categorias de risco"),
    ul(["Risco excessivo: práticas proibidas, como manipulação subliminar e pontuação social.", "Alto risco: saúde, crédito, segurança pública, educação e emprego.", "Risco limitado: dever de informar que o usuário interage com IA.", "Risco mínimo: sem obrigações específicas."]),
    h2("O que empresas precisam preparar"),
    p("Avaliação de impacto algorítmico, documentação técnica, registro de decisões automatizadas e canal para contestação. Para quem já se adequou à LGPD, boa parte da estrutura de governança pode ser reaproveitada."),
    callout("Empresas pequenas que apenas usam ferramentas de IA de terceiros têm obrigações menores, mas ainda respondem pela transparência com seus clientes."),
  ]),
  n("chips-dedicados-a-ia-chegam-a-notebooks-de-entrada", "Chips dedicados a IA chegam a notebooks de entrada e mudam o que roda offline", "NPUs com dezenas de TOPS deixam de ser exclusividade de máquinas premium. Transcrição, tradução e geração de imagem local passam a ser padrão.", "hardware", ["NPU", "notebooks", "computação local"], "2026-03-10", [
    p("A promessa de 'PC com IA' finalmente chegou às faixas de preço mais populares. Os novos processadores integram unidades de processamento neural capazes de rodar modelos de linguagem pequenos e modelos de imagem sem depender da nuvem."),
    h2("O que funciona bem localmente"),
    ul(["Transcrição de reuniões em tempo real.", "Tradução de documentos.", "Remoção de fundo e melhoria de fotos.", "Assistentes de escrita com modelos de 3 a 8 bilhões de parâmetros."]),
    p("O ganho não é só privacidade: aplicações locais respondem instantaneamente e funcionam sem internet. A troca é qualidade — os modelos locais ainda são notavelmente mais fracos em raciocínio complexo."),
    h2("Para quem compra"),
    p("Se seu uso é escrita, planilha e navegador, a NPU faz pouca diferença hoje. Se você edita vídeo, transcreve muito ou quer experimentar modelos locais, vale priorizar."),
  ]),
  n("google-atualiza-diretrizes-para-conteudo-gerado-por-ia", "Buscador atualiza diretrizes: conteúdo gerado por IA sem valor agregado perde alcance", "Nova rodada de atualizações de qualidade mira páginas produzidas em escala. O critério não é a ferramenta, e sim a utilidade para quem lê.", "marketing", ["SEO", "conteúdo", "algoritmo"], "2026-03-08", [
    p("A atualização reforça uma direção que já vinha sendo sinalizada: páginas criadas para ranquear, sem experiência própria ou informação nova, perdem visibilidade — independentemente de terem sido escritas por humanos ou por modelos."),
    h2("Sinais que ganharam peso"),
    ul(["Experiência em primeira mão demonstrada no texto.", "Dados originais, exemplos concretos e casos reais.", "Autoria identificável e consistente.", "Atualização real do conteúdo, não apenas da data."]),
    h2("O que fazer com um site que usa IA"),
    p("Usar IA para rascunhar, estruturar e revisar segue seguro. O problema é publicar sem edição e sem acrescentar nada. A recomendação prática: para cada artigo, pergunte o que um leitor encontra aqui que não encontraria em outro lugar."),
    callout("Ferramentas úteis: o analisador de legibilidade e o contador de palavras do Nexo ajudam a revisar textos antes da publicação."),
  ]),
  n("vazamento-de-credenciais-reforca-alerta-para-autenticacao-sem-senha", "Vazamento massivo de credenciais reforça alerta para autenticação sem senha", "Bilhões de combinações de e-mail e senha circulam em fóruns. Especialistas repetem: senhas únicas, gerenciador e passkeys.", "seguranca", ["senhas", "passkeys", "vazamento"], "2026-03-05", [
    p("Uma compilação de vazamentos antigos e recentes voltou a circular, com bilhões de registros. A maior parte não é nova, mas a consolidação facilita ataques de credential stuffing — testar a mesma senha em vários serviços."),
    h2("O que fazer agora"),
    ul(["Verifique se o seu e-mail aparece em bases de vazamentos conhecidas.", "Troque senhas repetidas por senhas únicas geradas por um gerenciador.", "Ative autenticação em dois fatores, preferindo aplicativo ou chave física a SMS.", "Onde disponível, migre para passkeys."]),
    p("Passkeys eliminam a senha como segredo compartilhado: a autenticação usa criptografia de chave pública ligada ao dispositivo. Grandes plataformas já suportam, e a adoção acelerou em 2026."),
    callout("Use o gerador de senha do Nexo para criar senhas longas e únicas — tudo é gerado no seu navegador, nada é enviado."),
  ]),
  n("vagas-em-tecnologia-mudam-de-perfil-com-ia", "Vagas em tecnologia mudam de perfil: menos código repetitivo, mais especificação e revisão", "Anúncios de emprego passam a exigir fluência em ferramentas de IA. Cargos de entrada encolhem, mas surgem funções híbridas.", "carreira", ["mercado", "vagas", "IA"], "2026-03-02", [
    p("Levantamentos de plataformas de recrutamento mostram uma mudança clara nos requisitos: a capacidade de especificar problemas, revisar saídas de IA e integrar sistemas passou a valer mais do que velocidade de digitação de código."),
    h2("Funções em alta"),
    ul(["Engenharia de prompts aplicada a produtos.", "Avaliação e testes de sistemas de IA.", "Integração de agentes com sistemas legados.", "Governança de dados e IA."]),
    h2("O dilema do júnior"),
    p("Se a IA faz as tarefas de entrada, como formar seniores? Empresas experientes respondem com programas de mentoria onde o iniciante usa IA sob supervisão, aprendendo a julgar o resultado em vez de apenas produzi-lo."),
    quote("Quem sabe fazer a pergunta certa e verificar a resposta continua insubstituível."),
  ]),
  n("tutores-de-ia-em-escolas-publicas-resultados-do-primeiro-ano", "Tutores de IA em escolas públicas: o que os resultados do primeiro ano mostram", "Programas-piloto apontam ganhos em matemática e leitura quando a ferramenta complementa, e não substitui, o professor.", "educacao", ["educação", "tutores", "escolas"], "2026-02-26", [
    p("Redes de ensino que testaram tutores baseados em modelos de linguagem divulgaram os primeiros resultados. O padrão que se repete: efeito positivo quando o professor define o uso, e nulo ou negativo quando o aluno é deixado sozinho com a ferramenta."),
    h2("O que funcionou"),
    ul(["Explicações alternativas sob demanda para quem não entendeu a aula.", "Prática de exercícios com feedback imediato.", "Apoio à produção de texto com correções comentadas."]),
    h2("Riscos observados"),
    p("Dependência para tarefas simples e respostas confiantes, porém erradas, em conteúdos específicos do currículo brasileiro. Escolas com melhores resultados treinaram professores antes de liberar a ferramenta."),
  ]),
  n("pagamentos-instantaneos-ganham-recorrencia-e-parcelamento", "Pagamentos instantâneos ganham recorrência e parcelamento nativo", "Novas funcionalidades do sistema de pagamentos instantâneos brasileiro miram assinaturas e crédito. Entenda o impacto para negócios e consumidores.", "negocios", ["pagamentos", "fintech", "pix"], "2026-02-22", [
    p("O sistema de pagamentos instantâneos brasileiro completou uma nova fase com pagamentos recorrentes automáticos e parcelamento oferecido diretamente pela instituição do pagador."),
    h2("Para negócios"),
    ul(["Assinaturas sem cartão, com menor taxa de falha de cobrança.", "Parcelamento sem antecipação de recebíveis: o lojista recebe à vista.", "Conciliação simplificada por identificador único."]),
    h2("Para consumidores"),
    p("Mais controle sobre autorizações recorrentes e possibilidade de parcelar sem cartão de crédito. O cuidado: parcelamento tem juros, e é fácil perder a noção do total. Use a calculadora de parcelamento para comparar antes de aceitar."),
  ]),
  n("frameworks-front-end-convergem-para-renderizacao-hibrida", "Frameworks front-end convergem para renderização híbrida e menos JavaScript", "Server components, streaming e ilhas de interatividade deixam de ser experimentos e viram padrão em novas versões.", "programacao", ["front-end", "React", "performance"], "2026-02-18", [
    p("Os principais frameworks web lançaram versões que compartilham a mesma tese: renderizar o máximo no servidor ou no build e enviar JavaScript apenas para o que precisa ser interativo."),
    h2("Padrões que se consolidaram"),
    ul(["Componentes de servidor com acesso direto a dados.", "Streaming de HTML com suspense granular.", "Hidratação parcial (ilhas) e lazy loading por interação.", "Transições de visualização nativas no navegador."]),
    p("O resultado prático: sites mais rápidos em conexões ruins e menos código para manter. O custo é uma curva de aprendizado nova sobre onde cada trecho executa."),
    callout("Para projetos 100% estáticos, como ferramentas que rodam no navegador, uma SPA leve continua sendo uma escolha perfeitamente válida."),
  ]),
  n("energia-para-data-centers-vira-gargalo-da-expansao-de-ia", "Energia para data centers vira o principal gargalo da expansão de IA", "Operadores anunciam contratos de longo prazo com fontes renováveis e nucleares. O debate ambiental chega ao centro da estratégia das big techs.", "tecnologia", ["data centers", "energia", "sustentabilidade"], "2026-02-14", [
    p("A corrida por capacidade de computação encontrou um limite físico: eletricidade. Novos data centers dedicados a IA demandam gigawatts, e a rede elétrica de várias regiões não acompanha."),
    h2("Respostas do setor"),
    ul(["Contratos de compra de energia renovável de longo prazo.", "Reativação e construção de usinas nucleares dedicadas.", "Localização de data centers perto de geração barata, incluindo o Brasil."]),
    h2("Eficiência como vantagem"),
    p("Modelos menores e mais eficientes deixam de ser apenas uma questão de custo: passam a ser uma questão de viabilidade. Técnicas como destilação e quantização viraram prioridade nos roadmaps."),
  ]),
  n("modelos-multimodais-transformam-atendimento-por-video", "Modelos multimodais em tempo real transformam atendimento e suporte técnico", "Assistentes que enxergam a câmera do celular guiam consertos, instalações e diagnósticos. Empresas de telecom e varejo lideram a adoção.", "inteligencia-artificial", ["multimodal", "atendimento", "voz"], "2026-02-10", [
    p("Aponte a câmera para o roteador, descreva o problema em voz alta e receba instruções passo a passo enquanto o assistente acompanha o que você faz. Cenários assim saíram das demonstrações e entraram em operação."),
    h2("Onde já funciona"),
    ul(["Suporte técnico de provedores de internet.", "Montagem de móveis e instalação de eletrodomésticos.", "Triagem de sinistros em seguradoras.", "Acessibilidade: descrição do ambiente para pessoas com deficiência visual."]),
    p("A latência caiu para menos de um segundo, o suficiente para uma conversa natural. A limitação atual é o custo por minuto, ainda alto para uso massivo."),
  ]),
  n("design-systems-adotam-tokens-semanticos-e-temas-automaticos", "Design systems adotam tokens semânticos e temas automáticos como padrão", "Grandes empresas publicam novas versões de seus sistemas de design com foco em acessibilidade, modo escuro e densidade adaptável.", "design", ["design system", "tokens", "acessibilidade"], "2026-02-06", [
    p("A nova geração de design systems trata cor, espaçamento e tipografia como tokens semânticos — 'superfície', 'texto secundário', 'borda' — em vez de valores fixos. Isso permite temas claro/escuro, alto contraste e densidades diferentes sem reescrever componentes."),
    h2("Tendências observadas"),
    ul(["Menos gradientes e efeitos; mais hierarquia por tipografia e espaço.", "Contraste mínimo AA em todos os estados, inclusive desabilitado.", "Movimento com propósito: transições curtas que explicam mudanças de estado.", "Componentes headless com estilos por camada."]),
    quote("A melhor interface é a que você não percebe. Se o usuário elogia a animação, ela provavelmente é longa demais."),
  ]),
  n("ferramentas-no-code-integram-agentes-e-ampliam-automacao", "Plataformas no-code integram agentes de IA e ampliam automação para não programadores", "Fluxos que antes exigiam scripts agora aceitam instruções em linguagem natural. Especialistas alertam para a governança.", "produtividade", ["no-code", "automação", "agentes"], "2026-02-02", [
    p("Plataformas de automação incorporaram blocos de IA capazes de interpretar e-mails, classificar documentos e decidir o próximo passo de um fluxo. Para pequenos negócios, é a primeira vez que automações sofisticadas ficam acessíveis sem código."),
    h2("Casos comuns"),
    ul(["Triagem de e-mails e criação de tarefas.", "Extração de dados de notas fiscais e recibos.", "Respostas iniciais em canais de atendimento.", "Resumos diários de métricas."]),
    h2("Cuidados"),
    p("Automação com IA pode falhar silenciosamente. Defina alertas, revise amostras periodicamente e nunca conecte um fluxo diretamente a ações financeiras sem aprovação humana."),
  ]),
];
