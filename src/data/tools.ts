import type { ToolCategory, ToolMeta } from "@/lib/types";

export const toolCategories: { slug: ToolCategory; name: string; description: string; icon: string }[] = [
  { slug: "calculadoras", name: "Calculadoras", description: "Porcentagem, juros, financiamento, saúde e finanças pessoais.", icon: "Calculator" },
  { slug: "datas", name: "Datas e tempo", description: "Idade, diferença entre datas, contagem regressiva e dias úteis.", icon: "CalendarDays" },
  { slug: "conversores", name: "Conversores", description: "Unidades, bases numéricas, cores, dados e codificação.", icon: "ArrowLeftRight" },
  { slug: "texto", name: "Texto", description: "Contadores, formatação, limpeza e análise de textos.", icon: "Type" },
  { slug: "geradores", name: "Geradores", description: "Senhas, QR Code, UUID, hashes, paletas e sorteios.", icon: "Sparkles" },
  { slug: "ia", name: "IA e escrita", description: "Prompts, resumos, títulos, tokens e legibilidade — 100% local.", icon: "Bot" },
  { slug: "produtividade", name: "Produtividade", description: "Pomodoro, tarefas, notas e cronômetro no navegador.", icon: "Timer" },
];

type Partial = Omit<ToolMeta, "howTo" | "faq" | "examples" | "related"> & Partial2;
interface Partial2 {
  howTo?: string[];
  faq?: { q: string; a: string }[];
  examples?: string[];
  related?: string[];
}

const genericFaq = (name: string) => [
  { q: `O ${name} é gratuito?`, a: `Sim. Todas as ferramentas do Nexo são gratuitas, sem cadastro e sem limite de uso.` },
  { q: "Meus dados são enviados para algum servidor?", a: "Não. O cálculo acontece inteiramente no seu navegador. Nada é enviado ou armazenado fora do seu dispositivo." },
  { q: "Funciona no celular?", a: "Sim. A interface é responsiva e foi testada em telas pequenas, com botões de copiar e limpar acessíveis." },
];

function def(t: Partial): ToolMeta {
  return {
    howTo: t.howTo ?? ["Preencha os campos com os valores desejados.", "O resultado é calculado automaticamente enquanto você digita.", "Use “Copiar” para levar o resultado ou “Limpar” para recomeçar."],
    examples: t.examples ?? [],
    related: t.related ?? [],
    ...t,
    faq: [...(t.faq ?? []), ...genericFaq(t.name)],
  };
}

export const tools: ToolMeta[] = [
  /* ---------------- CALCULADORAS ---------------- */
  def({
    slug: "calculadora-de-porcentagem", name: "Calculadora de Porcentagem", short: "Quanto é X% de Y, variação e proporção.",
    description: "Calcule quanto é X% de um valor, qual porcentagem um número representa de outro e a variação percentual entre dois valores — tudo em uma única tela.",
    category: "calculadoras", tags: ["porcentagem", "matemática", "finanças"], icon: "Percent", popularity: 98,
    examples: ["Quanto é 15% de 240? → 36", "30 é quanto por cento de 120? → 25%", "De 80 para 100 a variação é +25%"],
    faq: [{ q: "Como calcular porcentagem de um valor?", a: "Multiplique o valor pela porcentagem e divida por 100. Ex.: 15% de 240 = 240 × 15 ÷ 100 = 36." }, { q: "Como calcular variação percentual?", a: "(novo − antigo) ÷ antigo × 100. De 80 para 100: (100 − 80) ÷ 80 × 100 = 25%." }],
    related: ["calculadora-de-desconto", "aumento-percentual", "regra-de-tres"],
  }),
  def({
    slug: "calculadora-de-desconto", name: "Calculadora de Desconto", short: "Preço final, valor economizado e descontos em cascata.",
    description: "Descubra o preço final após um desconto, quanto você economiza e aplique um segundo desconto cumulativo (ex.: 20% + 10%).",
    category: "calculadoras", tags: ["desconto", "compras", "preço"], icon: "Tag", popularity: 92,
    examples: ["R$ 199,90 com 25% de desconto → R$ 149,93", "20% + 10% não é 30%: é 28%"],
    faq: [{ q: "Dois descontos somam?", a: "Não. Descontos sucessivos são multiplicativos: 20% + 10% = 1 − (0,8 × 0,9) = 28% de desconto total." }],
    related: ["calculadora-de-porcentagem", "margem-de-lucro", "markup"],
  }),
  def({
    slug: "juros-simples", name: "Calculadora de Juros Simples", short: "Juros, montante e taxa em regime simples.",
    description: "Calcule juros simples, montante final e compare com juros compostos a partir de capital, taxa e período.",
    category: "calculadoras", tags: ["juros", "finanças", "investimento"], icon: "TrendingUp", popularity: 80,
    examples: ["R$ 1.000 a 2% ao mês por 12 meses → juros de R$ 240"],
    faq: [{ q: "Qual a fórmula de juros simples?", a: "J = C × i × t, onde C é o capital, i a taxa por período (decimal) e t o número de períodos." }],
    related: ["juros-compostos", "simulador-de-financiamento", "calculadora-de-roi"],
  }),
  def({
    slug: "juros-compostos", name: "Calculadora de Juros Compostos", short: "Montante com aportes mensais e evolução ano a ano.",
    description: "Simule o crescimento de um investimento com juros compostos, aportes mensais e veja a evolução do patrimônio período a período.",
    category: "calculadoras", tags: ["juros compostos", "investimento", "finanças"], icon: "LineChart", popularity: 96,
    examples: ["R$ 5.000 iniciais + R$ 500/mês a 0,9% a.m. por 10 anos → mais de R$ 100 mil"],
    faq: [{ q: "Qual a fórmula de juros compostos?", a: "M = C × (1 + i)^t. Com aportes mensais P: M = C(1+i)^t + P × [((1+i)^t − 1) ÷ i]." }, { q: "Como converter taxa anual para mensal?", a: "i_mensal = (1 + i_anual)^(1/12) − 1. 12% a.a. ≈ 0,949% a.m." }],
    related: ["juros-simples", "meta-de-economia", "calculadora-de-roi"],
  }),
  def({
    slug: "regra-de-tres", name: "Regra de Três", short: "Simples, direta ou inversa.",
    description: "Resolva proporções com regra de três simples direta ou inversa, com explicação passo a passo do cálculo.",
    category: "calculadoras", tags: ["proporção", "matemática", "escola"], icon: "Divide", popularity: 85,
    examples: ["Se 3 kg custam R$ 27, 5 kg custam R$ 45 (direta)", "Se 4 pedreiros levam 6 dias, 8 levam 3 (inversa)"],
    faq: [{ q: "Quando usar regra de três inversa?", a: "Quando uma grandeza aumenta e a outra diminui na mesma proporção, como número de trabalhadores × dias de obra." }],
    related: ["calculadora-de-porcentagem", "media-ponderada"],
  }),
  def({
    slug: "calculadora-de-imc", name: "Calculadora de IMC", short: "Índice de massa corporal e faixa de peso ideal.",
    description: "Calcule seu IMC, veja a classificação da OMS e a faixa de peso considerada saudável para a sua altura.",
    category: "calculadoras", tags: ["saúde", "imc", "peso"], icon: "HeartPulse", popularity: 88,
    examples: ["70 kg e 1,75 m → IMC 22,9 (peso normal)"],
    faq: [{ q: "O IMC é preciso?", a: "É uma triagem populacional. Não diferencia massa muscular de gordura — atletas podem ter IMC alto sem excesso de gordura." }],
    related: ["calculadora-de-idade", "calculadora-de-agua"],
  }),
  def({
    slug: "calculadora-de-agua", name: "Ingestão Diária de Água", short: "Quantidade recomendada de água por dia.",
    description: "Estime a quantidade de água recomendada por dia a partir do peso corporal e nível de atividade física.",
    category: "calculadoras", tags: ["saúde", "hidratação"], icon: "Droplets", popularity: 62,
    examples: ["70 kg, atividade moderada → ~2,8 L/dia"],
    related: ["calculadora-de-imc"],
  }),
  def({
    slug: "media-ponderada", name: "Média Ponderada", short: "Média com pesos diferentes para cada nota.",
    description: "Calcule médias simples ou ponderadas de até 8 valores, ideal para notas escolares e indicadores.",
    category: "calculadoras", tags: ["média", "notas", "escola"], icon: "Sigma", popularity: 70,
    examples: ["Notas 7 (peso 2), 8 (peso 3), 6 (peso 5) → média 6,8"],
    related: ["regra-de-tres", "calculadora-de-porcentagem"],
  }),
  def({
    slug: "margem-de-lucro", name: "Margem de Lucro", short: "Margem bruta e lucro a partir de custo e preço.",
    description: "Calcule margem de lucro, lucro em reais e preço de venda necessário para atingir a margem desejada.",
    category: "calculadoras", tags: ["negócios", "preço", "lucro"], icon: "PiggyBank", popularity: 78,
    examples: ["Custo R$ 60, venda R$ 100 → margem 40%, markup 66,7%"],
    faq: [{ q: "Margem e markup são a mesma coisa?", a: "Não. Margem é lucro ÷ preço de venda; markup é lucro ÷ custo. Com custo 60 e venda 100, margem = 40% e markup = 66,7%." }],
    related: ["markup", "calculadora-de-desconto", "calculadora-de-roi"],
  }),
  def({
    slug: "markup", name: "Calculadora de Markup", short: "Preço de venda a partir do custo e markup.",
    description: "Defina preços aplicando markup sobre o custo e veja a margem equivalente.",
    category: "calculadoras", tags: ["negócios", "preço"], icon: "Receipt", popularity: 60,
    related: ["margem-de-lucro", "calculadora-de-desconto"],
  }),
  def({
    slug: "simulador-de-financiamento", name: "Simulador de Financiamento", short: "Parcela, total pago e juros (Tabela Price).",
    description: "Simule parcelas fixas de financiamento ou empréstimo pelo sistema Price, com total pago e custo dos juros.",
    category: "calculadoras", tags: ["financiamento", "empréstimo", "parcelas"], icon: "Landmark", popularity: 90,
    examples: ["R$ 30.000 em 48× a 1,5% a.m. → parcela ≈ R$ 880,58"],
    faq: [{ q: "O que é Tabela Price?", a: "Sistema de parcelas fixas em que a parte de juros diminui e a amortização aumenta ao longo do contrato." }],
    related: ["juros-compostos", "juros-simples"],
  }),
  def({
    slug: "calculadora-de-roi", name: "Calculadora de ROI", short: "Retorno sobre investimento em % e múltiplo.",
    description: "Calcule o retorno sobre investimento (ROI) de campanhas, projetos ou aplicações.",
    category: "calculadoras", tags: ["marketing", "investimento", "roi"], icon: "BadgeDollarSign", popularity: 72,
    examples: ["Investiu R$ 2.000, retornou R$ 5.000 → ROI 150%"],
    related: ["margem-de-lucro", "juros-compostos"],
  }),
  def({
    slug: "aumento-percentual", name: "Aumento e Redução Percentual", short: "Aplique aumento ou redução sobre um valor.",
    description: "Aplique aumento ou redução percentual e descubra o valor original a partir do resultado.",
    category: "calculadoras", tags: ["porcentagem", "reajuste"], icon: "ArrowUpRight", popularity: 68,
    related: ["calculadora-de-porcentagem", "calculadora-de-desconto"],
  }),
  def({
    slug: "divisao-de-conta", name: "Divisão de Conta e Gorjeta", short: "Rateio por pessoa com taxa de serviço.",
    description: "Divida a conta do restaurante entre pessoas incluindo a taxa de serviço ou gorjeta.",
    category: "calculadoras", tags: ["gorjeta", "conta", "restaurante"], icon: "Utensils", popularity: 65,
    related: ["calculadora-de-porcentagem"],
  }),
  def({
    slug: "meta-de-economia", name: "Meta de Economia", short: "Quanto guardar por mês para atingir uma meta.",
    description: "Descubra quanto precisa guardar por mês para atingir um objetivo financeiro em um prazo, com ou sem rendimento.",
    category: "calculadoras", tags: ["finanças pessoais", "economia"], icon: "Target", popularity: 66,
    related: ["juros-compostos", "simulador-de-financiamento"],
  }),
  def({
    slug: "consumo-de-combustivel", name: "Consumo de Combustível", short: "km/l, custo por km e custo da viagem.",
    description: "Calcule o consumo do seu carro, o custo por quilômetro e quanto vai gastar em uma viagem.",
    category: "calculadoras", tags: ["carro", "viagem", "combustível"], icon: "Fuel", popularity: 64,
    related: ["etanol-ou-gasolina"],
  }),
  def({
    slug: "etanol-ou-gasolina", name: "Etanol ou Gasolina?", short: "Qual compensa mais abastecer hoje.",
    description: "Compare o preço do etanol e da gasolina usando a regra dos 70% e descubra qual compensa.",
    category: "calculadoras", tags: ["carro", "combustível"], icon: "Fuel", popularity: 70,
    faq: [{ q: "Por que 70%?", a: "O etanol rende cerca de 70% da gasolina. Se o preço do etanol for menor que 70% do da gasolina, ele compensa." }],
    related: ["consumo-de-combustivel"],
  }),
  def({
    slug: "calculadora-de-horas", name: "Calculadora de Horas", short: "Some e subtraia horas e minutos.",
    description: "Some, subtraia e calcule intervalos de horas e minutos — útil para folha de ponto e freelancers.",
    category: "calculadoras", tags: ["horas", "trabalho", "ponto"], icon: "Clock", popularity: 74,
    related: ["diferenca-entre-datas", "valor-hora"],
  }),
  def({
    slug: "valor-hora", name: "Calculadora de Valor-Hora", short: "Quanto cobrar por hora como freelancer.",
    description: "Calcule seu valor-hora a partir da renda desejada, custos fixos, horas produtivas e férias.",
    category: "calculadoras", tags: ["freelancer", "preço", "trabalho"], icon: "Briefcase", popularity: 69,
    related: ["calculadora-de-horas", "margem-de-lucro"],
  }),

  /* ---------------- DATAS ---------------- */
  def({
    slug: "calculadora-de-idade", name: "Calculadora de Idade", short: "Idade exata em anos, meses e dias.",
    description: "Calcule sua idade exata em anos, meses, dias, total de dias vividos e quanto falta para o próximo aniversário.",
    category: "datas", tags: ["idade", "aniversário", "datas"], icon: "Cake", popularity: 90,
    related: ["diferenca-entre-datas", "dia-da-semana", "contagem-regressiva"],
  }),
  def({
    slug: "diferenca-entre-datas", name: "Diferença entre Datas", short: "Dias, semanas, meses e anos entre duas datas.",
    description: "Calcule o intervalo entre duas datas em dias, semanas, meses e anos, incluindo dias úteis aproximados.",
    category: "datas", tags: ["datas", "prazo", "dias"], icon: "CalendarRange", popularity: 86,
    related: ["somar-dias-a-data", "dias-uteis", "calculadora-de-idade"],
  }),
  def({
    slug: "somar-dias-a-data", name: "Somar ou Subtrair Dias", short: "Que dia será daqui a N dias?",
    description: "Some ou subtraia dias, semanas ou meses de uma data e descubra a data resultante e o dia da semana.",
    category: "datas", tags: ["datas", "prazo"], icon: "CalendarPlus", popularity: 72,
    related: ["diferenca-entre-datas", "dias-uteis"],
  }),
  def({
    slug: "dia-da-semana", name: "Dia da Semana de uma Data", short: "Descubra em que dia da semana caiu uma data.",
    description: "Descubra o dia da semana de qualquer data, passada ou futura, e o número da semana no ano.",
    category: "datas", tags: ["datas", "calendário"], icon: "Calendar", popularity: 58,
    related: ["calculadora-de-idade", "somar-dias-a-data"],
  }),
  def({
    slug: "contagem-regressiva", name: "Contagem Regressiva", short: "Quanto falta para uma data importante.",
    description: "Contagem regressiva ao vivo para qualquer evento: dias, horas, minutos e segundos.",
    category: "datas", tags: ["evento", "datas"], icon: "Hourglass", popularity: 67,
    related: ["diferenca-entre-datas", "calculadora-de-idade"],
  }),
  def({
    slug: "dias-uteis", name: "Calculadora de Dias Úteis", short: "Dias úteis entre datas (sem fins de semana).",
    description: "Conte dias úteis entre duas datas desconsiderando sábados e domingos, com opção de descontar feriados informados.",
    category: "datas", tags: ["trabalho", "prazo", "datas"], icon: "BriefcaseBusiness", popularity: 71,
    faq: [{ q: "Feriados são considerados?", a: "Você pode informar a quantidade de feriados em dias úteis no período e eles serão descontados." }],
    related: ["diferenca-entre-datas", "somar-dias-a-data"],
  }),

  /* ---------------- CONVERSORES ---------------- */
  def({
    slug: "conversor-de-temperatura", name: "Conversor de Temperatura", short: "Celsius, Fahrenheit e Kelvin.",
    description: "Converta temperaturas entre Celsius, Fahrenheit e Kelvin instantaneamente.",
    category: "conversores", tags: ["temperatura", "unidades"], icon: "Thermometer", popularity: 80,
    examples: ["100 °C = 212 °F = 373,15 K"], related: ["conversor-de-comprimento", "conversor-de-peso"],
  }),
  def({
    slug: "conversor-de-comprimento", name: "Conversor de Comprimento", short: "Metros, km, milhas, pés, polegadas.",
    description: "Converta unidades de comprimento e distância: mm, cm, m, km, polegadas, pés, jardas e milhas.",
    category: "conversores", tags: ["comprimento", "unidades"], icon: "Ruler", popularity: 76,
    related: ["conversor-de-area", "conversor-de-velocidade"],
  }),
  def({
    slug: "conversor-de-peso", name: "Conversor de Peso e Massa", short: "kg, g, libras, onças e toneladas.",
    description: "Converta unidades de massa entre gramas, quilogramas, toneladas, libras e onças.",
    category: "conversores", tags: ["peso", "unidades"], icon: "Weight", popularity: 70,
    related: ["conversor-de-volume", "conversor-de-comprimento"],
  }),
  def({
    slug: "conversor-de-velocidade", name: "Conversor de Velocidade", short: "km/h, m/s, mph e nós.",
    description: "Converta velocidades entre km/h, m/s, mph, nós e pés por segundo.",
    category: "conversores", tags: ["velocidade", "unidades"], icon: "Gauge", popularity: 55,
    related: ["conversor-de-comprimento"],
  }),
  def({
    slug: "conversor-de-area", name: "Conversor de Área", short: "m², km², hectares, acres e pés².",
    description: "Converta áreas entre metros quadrados, hectares, acres, alqueires e mais.",
    category: "conversores", tags: ["área", "unidades", "imóveis"], icon: "Square", popularity: 52,
    related: ["conversor-de-comprimento"],
  }),
  def({
    slug: "conversor-de-volume", name: "Conversor de Volume", short: "Litros, ml, galões, xícaras.",
    description: "Converta volumes entre litros, mililitros, m³, galões, xícaras e colheres.",
    category: "conversores", tags: ["volume", "cozinha", "unidades"], icon: "Beaker", popularity: 58,
    related: ["conversor-de-peso"],
  }),
  def({
    slug: "conversor-de-dados", name: "Conversor de Dados (Bytes)", short: "KB, MB, GB, TB e bits.",
    description: "Converta unidades de armazenamento digital entre bits, bytes, KB, MB, GB, TB e suas versões binárias.",
    category: "conversores", tags: ["dados", "tecnologia"], icon: "HardDrive", popularity: 66,
    faq: [{ q: "1 GB são 1000 ou 1024 MB?", a: "No SI (fabricantes), 1 GB = 1000 MB. No binário (GiB), 1 GiB = 1024 MiB. A ferramenta mostra ambos." }],
    related: ["conversor-de-base", "tempo-de-download"],
  }),
  def({
    slug: "tempo-de-download", name: "Tempo de Download", short: "Quanto tempo leva para baixar um arquivo.",
    description: "Estime o tempo de download ou upload a partir do tamanho do arquivo e da velocidade da conexão.",
    category: "conversores", tags: ["internet", "dados"], icon: "Download", popularity: 54,
    related: ["conversor-de-dados"],
  }),
  def({
    slug: "conversor-de-base", name: "Conversor de Base Numérica", short: "Binário, octal, decimal e hexadecimal.",
    description: "Converta números entre binário, octal, decimal e hexadecimal com visualização simultânea.",
    category: "conversores", tags: ["programação", "binário", "hex"], icon: "Binary", popularity: 60,
    related: ["texto-para-binario", "conversor-de-dados"],
  }),
  def({
    slug: "numeros-romanos", name: "Números Romanos", short: "Arábico ↔ romano.",
    description: "Converta números arábicos em romanos e vice-versa (1 a 3999).",
    category: "conversores", tags: ["matemática", "história"], icon: "Landmark", popularity: 50,
    related: ["conversor-de-base"],
  }),
  def({
    slug: "conversor-de-cores", name: "Conversor de Cores", short: "HEX, RGB e HSL com prévia.",
    description: "Converta cores entre HEX, RGB e HSL, veja a prévia e copie no formato que precisar.",
    category: "conversores", tags: ["design", "css", "cores"], icon: "Palette", popularity: 74,
    related: ["gerador-de-paleta", "px-para-rem"],
  }),
  def({
    slug: "px-para-rem", name: "Conversor PX ↔ REM", short: "Unidades CSS com base configurável.",
    description: "Converta pixels para rem/em e vice-versa, com base de fonte configurável (padrão 16px).",
    category: "conversores", tags: ["css", "front-end"], icon: "Code2", popularity: 62,
    related: ["conversor-de-cores"],
  }),
  def({
    slug: "timestamp-unix", name: "Conversor de Timestamp Unix", short: "Epoch ↔ data legível.",
    description: "Converta timestamps Unix (segundos ou milissegundos) em datas legíveis e vice-versa, com fuso local e UTC.",
    category: "conversores", tags: ["programação", "datas"], icon: "Clock4", popularity: 63,
    related: ["diferenca-entre-datas", "conversor-de-base"],
  }),
  def({
    slug: "codificador-base64", name: "Base64 Encode / Decode", short: "Codifique e decodifique Base64 (UTF-8).",
    description: "Codifique texto em Base64 ou decodifique de volta, com suporte completo a UTF-8 e acentos.",
    category: "conversores", tags: ["programação", "codificação"], icon: "FileCode", popularity: 68,
    related: ["url-encode", "gerador-de-hash"],
  }),
  def({
    slug: "url-encode", name: "URL Encode / Decode", short: "Escape de caracteres para URLs.",
    description: "Codifique e decodifique componentes de URL (percent-encoding) de forma segura.",
    category: "conversores", tags: ["programação", "web"], icon: "Link", popularity: 56,
    related: ["codificador-base64", "gerador-de-slug"],
  }),
  def({
    slug: "formatador-json", name: "Formatador e Validador JSON", short: "Indente, minifique e valide JSON.",
    description: "Formate JSON com indentação, minifique e detecte erros de sintaxe com a posição do problema.",
    category: "conversores", tags: ["programação", "json", "dev"], icon: "Braces", popularity: 77,
    related: ["codificador-base64", "texto-para-binario"],
  }),
  def({
    slug: "texto-para-binario", name: "Texto ↔ Binário", short: "Converta texto em binário e volte.",
    description: "Converta qualquer texto em código binário (UTF-8) e decodifique binário de volta em texto.",
    category: "conversores", tags: ["binário", "programação"], icon: "Binary", popularity: 48,
    related: ["conversor-de-base", "codificador-base64"],
  }),

  /* ---------------- TEXTO ---------------- */
  def({
    slug: "contador-de-palavras", name: "Contador de Palavras", short: "Palavras, caracteres, frases e tempo de leitura.",
    description: "Conte palavras, caracteres (com e sem espaços), frases, parágrafos, tempo de leitura e de fala em tempo real.",
    category: "texto", tags: ["texto", "redação", "seo"], icon: "FileText", popularity: 95,
    related: ["contador-de-caracteres", "frequencia-de-palavras", "tempo-de-leitura"],
  }),
  def({
    slug: "contador-de-caracteres", name: "Contador de Caracteres", short: "Limites de Twitter/X, Instagram, meta tags.",
    description: "Conte caracteres e compare com os limites de redes sociais e de SEO (title, description, X, Instagram, LinkedIn).",
    category: "texto", tags: ["texto", "redes sociais", "seo"], icon: "Hash", popularity: 84,
    related: ["contador-de-palavras", "gerador-de-hashtags"],
  }),
  def({
    slug: "maiusculas-e-minusculas", name: "Maiúsculas e Minúsculas", short: "UPPER, lower, Title Case, Sentence case.",
    description: "Converta textos para maiúsculas, minúsculas, Title Case, Sentence case, camelCase, snake_case e kebab-case.",
    category: "texto", tags: ["texto", "formatação"], icon: "CaseSensitive", popularity: 79,
    related: ["remover-acentos", "gerador-de-slug"],
  }),
  def({
    slug: "remover-acentos", name: "Remover Acentos", short: "Limpe acentos e caracteres especiais.",
    description: "Remova acentos, cedilhas e caracteres especiais de textos, útil para nomes de arquivos e sistemas legados.",
    category: "texto", tags: ["texto", "limpeza"], icon: "Eraser", popularity: 66,
    related: ["gerador-de-slug", "limpar-espacos"],
  }),
  def({
    slug: "limpar-espacos", name: "Limpar Espaços e Quebras", short: "Remova espaços duplicados e linhas vazias.",
    description: "Normalize textos removendo espaços duplicados, tabs, quebras de linha extras e espaços no início/fim.",
    category: "texto", tags: ["texto", "limpeza"], icon: "Eraser", popularity: 57,
    related: ["remover-linhas-duplicadas", "remover-acentos"],
  }),
  def({
    slug: "inverter-texto", name: "Inverter Texto", short: "Inverta caracteres, palavras ou linhas.",
    description: "Inverta a ordem dos caracteres, das palavras ou das linhas de um texto.",
    category: "texto", tags: ["texto", "diversão"], icon: "FlipHorizontal", popularity: 40,
    related: ["ordenar-linhas"],
  }),
  def({
    slug: "remover-linhas-duplicadas", name: "Remover Linhas Duplicadas", short: "Deixe apenas linhas únicas.",
    description: "Remova linhas repetidas de listas, mantendo a ordem original ou ordenando o resultado.",
    category: "texto", tags: ["texto", "listas", "dados"], icon: "ListX", popularity: 61,
    related: ["ordenar-linhas", "limpar-espacos"],
  }),
  def({
    slug: "ordenar-linhas", name: "Ordenar Linhas", short: "A–Z, Z–A, numérico ou por tamanho.",
    description: "Ordene linhas alfabeticamente, em ordem inversa, numérica ou por comprimento.",
    category: "texto", tags: ["texto", "listas"], icon: "ArrowDownAZ", popularity: 55,
    related: ["remover-linhas-duplicadas", "inverter-texto"],
  }),
  def({
    slug: "gerador-de-slug", name: "Gerador de Slug", short: "URLs amigáveis a partir de títulos.",
    description: "Transforme títulos em slugs amigáveis para URLs: sem acentos, minúsculas e separados por hífen.",
    category: "texto", tags: ["seo", "url", "web"], icon: "Link2", popularity: 73,
    related: ["remover-acentos", "url-encode"],
  }),
  def({
    slug: "frequencia-de-palavras", name: "Frequência de Palavras", short: "Palavras mais usadas e densidade.",
    description: "Analise a frequência e densidade de palavras de um texto — útil para SEO e revisão de repetição.",
    category: "texto", tags: ["seo", "análise", "texto"], icon: "BarChart3", popularity: 59,
    related: ["contador-de-palavras", "legibilidade"],
  }),
  def({
    slug: "extrair-emails-e-links", name: "Extrair E-mails e Links", short: "Extraia e-mails, URLs e telefones de um texto.",
    description: "Extraia automaticamente endereços de e-mail, URLs e números de telefone de qualquer texto colado.",
    category: "texto", tags: ["dados", "texto", "produtividade"], icon: "AtSign", popularity: 52,
    related: ["remover-linhas-duplicadas"],
  }),
  def({
    slug: "lorem-ipsum", name: "Gerador de Lorem Ipsum", short: "Parágrafos, frases ou palavras.",
    description: "Gere texto de preenchimento Lorem Ipsum por parágrafos, frases ou palavras para layouts e protótipos.",
    category: "texto", tags: ["design", "texto", "protótipo"], icon: "AlignLeft", popularity: 64,
    related: ["contador-de-palavras"],
  }),
  def({
    slug: "comparar-textos", name: "Comparar Textos (Diff)", short: "Veja diferenças linha a linha.",
    description: "Compare dois textos e destaque linhas adicionadas, removidas e iguais.",
    category: "texto", tags: ["texto", "dev", "revisão"], icon: "GitCompare", popularity: 56,
    related: ["remover-linhas-duplicadas", "formatador-json"],
  }),

  /* ---------------- GERADORES ---------------- */
  def({
    slug: "gerador-de-senha", name: "Gerador de Senha", short: "Senhas fortes e frases-senha com medidor.",
    description: "Gere senhas seguras com controle de tamanho, símbolos, números e caracteres ambíguos, ou frases-senha memoráveis. Inclui medidor de força e entropia.",
    category: "geradores", tags: ["segurança", "senha"], icon: "KeyRound", popularity: 97,
    faq: [{ q: "A senha gerada é segura?", a: "Sim. Usa a API criptográfica do navegador (crypto.getRandomValues) e nunca sai do seu dispositivo." }, { q: "Qual tamanho ideal?", a: "Pelo menos 16 caracteres com letras, números e símbolos, ou uma frase-senha com 5+ palavras." }],
    related: ["gerador-de-hash", "gerador-de-uuid"],
  }),
  def({
    slug: "gerador-de-qr-code", name: "Gerador de QR Code", short: "Links, texto, Wi-Fi e contatos. Baixe em PNG.",
    description: "Crie QR Codes para links, textos, redes Wi-Fi, e-mails e telefones com tamanho e correção de erro configuráveis. Baixe em PNG.",
    category: "geradores", tags: ["qr code", "marketing", "utilidade"], icon: "QrCode", popularity: 94,
    related: ["gerador-de-slug", "url-encode"],
  }),
  def({
    slug: "gerador-de-uuid", name: "Gerador de UUID", short: "UUID v4 em lote.",
    description: "Gere identificadores únicos universais (UUID v4) individualmente ou em lote, com opções de formatação.",
    category: "geradores", tags: ["dev", "programação"], icon: "Fingerprint", popularity: 58,
    related: ["gerador-de-hash", "gerador-de-senha"],
  }),
  def({
    slug: "gerador-de-hash", name: "Gerador de Hash", short: "SHA-1, SHA-256, SHA-384 e SHA-512.",
    description: "Calcule hashes SHA-1, SHA-256, SHA-384 e SHA-512 de qualquer texto usando a Web Crypto API.",
    category: "geradores", tags: ["segurança", "dev", "hash"], icon: "ShieldCheck", popularity: 60,
    faq: [{ q: "Por que não tem MD5?", a: "MD5 é considerado inseguro e não é suportado nativamente pela Web Crypto API. Prefira SHA-256." }],
    related: ["codificador-base64", "gerador-de-senha"],
  }),
  def({
    slug: "gerador-de-paleta", name: "Gerador de Paleta de Cores", short: "Paletas harmônicas a partir de uma cor.",
    description: "Gere paletas complementares, análogas, triádicas e monocromáticas a partir de uma cor base, com códigos prontos para CSS.",
    category: "geradores", tags: ["design", "cores", "css"], icon: "SwatchBook", popularity: 71,
    related: ["conversor-de-cores"],
  }),
  def({
    slug: "sorteador", name: "Sorteador de Nomes e Números", short: "Sorteie nomes de uma lista ou números.",
    description: "Sorteie um ou mais nomes de uma lista, ou números em um intervalo, sem repetição.",
    category: "geradores", tags: ["sorteio", "diversão"], icon: "Dices", popularity: 75,
    related: ["gerador-de-numero-aleatorio"],
  }),
  def({
    slug: "gerador-de-numero-aleatorio", name: "Número Aleatório", short: "Números aleatórios em um intervalo.",
    description: "Gere números aleatórios em um intervalo, com opção de vários números únicos de uma vez.",
    category: "geradores", tags: ["sorteio", "matemática"], icon: "Shuffle", popularity: 57,
    related: ["sorteador"],
  }),
  def({
    slug: "gerador-de-nome-de-usuario", name: "Gerador de Nome de Usuário", short: "Ideias de @ para redes e jogos.",
    description: "Gere sugestões de nomes de usuário criativas a partir de uma palavra-chave ou tema.",
    category: "geradores", tags: ["redes sociais", "criatividade"], icon: "AtSign", popularity: 53,
    related: ["gerador-de-bio", "gerador-de-hashtags"],
  }),

  /* ---------------- IA ---------------- */
  def({
    slug: "prompt-builder", name: "Prompt Builder", short: "Monte prompts profissionais em segundos.",
    description: "Construa prompts estruturados combinando objetivo, contexto, público, tom, formato, plataforma, nível de detalhe e resultado esperado — sem API externa.",
    category: "ia", tags: ["prompt", "chatgpt", "ia"], icon: "Wand2", popularity: 99,
    related: ["estimador-de-tokens", "gerador-de-titulos", "reescritor-de-tom"],
  }),
  def({
    slug: "estimador-de-tokens", name: "Estimador de Tokens", short: "Estime tokens e custo de prompts.",
    description: "Estime a quantidade de tokens de um texto e o custo aproximado em modelos de linguagem populares.",
    category: "ia", tags: ["tokens", "llm", "custo"], icon: "Coins", popularity: 70,
    faq: [{ q: "A contagem é exata?", a: "É uma estimativa baseada em heurística (≈ 4 caracteres/token para inglês, ≈ 3,3 para português). Tokenizadores reais variam por modelo." }],
    related: ["prompt-builder", "contador-de-palavras"],
  }),
  def({
    slug: "resumidor-de-texto", name: "Resumidor de Texto", short: "Resumo extrativo local, sem IA externa.",
    description: "Gere um resumo extrativo de textos longos selecionando as frases mais relevantes por frequência de termos — processado localmente.",
    category: "ia", tags: ["resumo", "estudos", "texto"], icon: "ScrollText", popularity: 76,
    related: ["legibilidade", "frequencia-de-palavras"],
  }),
  def({
    slug: "gerador-de-titulos", name: "Gerador de Títulos", short: "Headlines para blog, YouTube e anúncios.",
    description: "Gere dezenas de variações de títulos a partir de um tema usando fórmulas comprovadas de copywriting.",
    category: "ia", tags: ["copywriting", "blog", "youtube"], icon: "Heading", popularity: 78,
    related: ["gerador-de-hashtags", "gerador-de-bio", "prompt-builder"],
  }),
  def({
    slug: "gerador-de-hashtags", name: "Gerador de Hashtags", short: "Hashtags a partir de palavras-chave.",
    description: "Crie conjuntos de hashtags para Instagram, TikTok e LinkedIn a partir de palavras-chave e nicho.",
    category: "ia", tags: ["instagram", "redes sociais", "marketing"], icon: "Hash", popularity: 72,
    related: ["gerador-de-titulos", "contador-de-caracteres"],
  }),
  def({
    slug: "gerador-de-bio", name: "Gerador de Bio", short: "Bios para Instagram, LinkedIn e X.",
    description: "Gere bios curtas e profissionais para redes sociais a partir do que você faz, para quem e seu diferencial.",
    category: "ia", tags: ["redes sociais", "perfil"], icon: "UserRound", popularity: 63,
    related: ["gerador-de-nome-de-usuario", "gerador-de-titulos"],
  }),
  def({
    slug: "legibilidade", name: "Analisador de Legibilidade", short: "Índice Flesch adaptado ao português.",
    description: "Avalie a legibilidade de um texto com o índice de Flesch adaptado ao português, tamanho médio de frases e palavras complexas.",
    category: "ia", tags: ["redação", "seo", "texto"], icon: "BookOpenCheck", popularity: 58,
    related: ["resumidor-de-texto", "contador-de-palavras"],
  }),
  def({
    slug: "reescritor-de-tom", name: "Ajustador de Tom", short: "Deixe o texto mais formal, direto ou amigável.",
    description: "Aplique regras locais para tornar textos mais formais, informais, diretos ou entusiasmados, com sugestões de substituição.",
    category: "ia", tags: ["redação", "e-mail"], icon: "MessageSquareText", popularity: 55,
    related: ["prompt-builder", "legibilidade"],
  }),
  def({
    slug: "perguntas-de-entrevista", name: "Gerador de Perguntas de Entrevista", short: "Perguntas por cargo e nível.",
    description: "Gere listas de perguntas de entrevista técnicas e comportamentais por cargo, nível e competências.",
    category: "ia", tags: ["carreira", "rh"], icon: "MessagesSquare", popularity: 51,
    related: ["prompt-builder"],
  }),

  /* ---------------- PRODUTIVIDADE ---------------- */
  def({
    slug: "pomodoro", name: "Timer Pomodoro", short: "Foco 25/5 com ciclos e notificação sonora.",
    description: "Timer Pomodoro configurável com ciclos de foco e pausas, contador de sessões e aviso sonoro.",
    category: "produtividade", tags: ["foco", "estudos", "trabalho"], icon: "Timer", popularity: 82,
    howTo: ["Escolha a duração do foco e das pausas.", "Clique em Iniciar e mantenha a aba aberta.", "Ao fim de cada ciclo, o timer avisa e avança automaticamente."],
    related: ["cronometro", "lista-de-tarefas"],
  }),
  def({
    slug: "cronometro", name: "Cronômetro com Voltas", short: "Cronômetro preciso com marcação de voltas.",
    description: "Cronômetro com precisão de centésimos, marcação de voltas e exportação dos tempos.",
    category: "produtividade", tags: ["tempo", "esporte"], icon: "Watch", popularity: 60,
    related: ["pomodoro", "calculadora-de-horas"],
  }),
  def({
    slug: "lista-de-tarefas", name: "Lista de Tarefas", short: "To-do local, com prioridades e progresso.",
    description: "Lista de tarefas salva no navegador com prioridades, filtro, progresso e exportação em texto.",
    category: "produtividade", tags: ["tarefas", "organização"], icon: "ListChecks", popularity: 74,
    related: ["notas-rapidas", "pomodoro"],
  }),
  def({
    slug: "notas-rapidas", name: "Notas Rápidas", short: "Bloco de notas que salva automaticamente.",
    description: "Bloco de notas minimalista com salvamento automático no navegador, contador de palavras e download em .txt.",
    category: "produtividade", tags: ["notas", "escrita"], icon: "StickyNote", popularity: 65,
    related: ["lista-de-tarefas", "contador-de-palavras"],
  }),
  def({
    slug: "tempo-de-leitura", name: "Calculadora de Tempo de Leitura", short: "Minutos para ler ou narrar um texto.",
    description: "Calcule quanto tempo leva para ler ou narrar um texto com velocidade ajustável (palavras por minuto).",
    category: "produtividade", tags: ["leitura", "conteúdo", "vídeo"], icon: "BookOpen", popularity: 57,
    related: ["contador-de-palavras", "resumidor-de-texto"],
  }),
  def({
    slug: "roda-de-decisao", name: "Roda de Decisão", short: "Não consegue decidir? Deixe a roda escolher.",
    description: "Adicione opções e gire a roda para tomar decisões rápidas — do almoço à próxima tarefa.",
    category: "produtividade", tags: ["decisão", "diversão"], icon: "Disc3", popularity: 59,
    related: ["sorteador"],
  }),
];

export const toolBySlug = (slug: string) => tools.find((t) => t.slug === slug);
export const toolsByCategory = (cat: ToolCategory) => tools.filter((t) => t.category === cat);
export const categoryBySlug = (slug: string) => toolCategories.find((c) => c.slug === slug);
