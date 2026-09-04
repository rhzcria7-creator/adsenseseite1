import { useState } from "react";
import { Link } from "react-router-dom";
import { allRoutes } from "@/lib/content";
import { useSEO } from "@/lib/seo";
import { useStore } from "@/lib/store";
import { Container, PageHeader } from "@/components/layout/Shell";
import { Accordion } from "@/components/ui/feedback";
import { AdSlot, AffiliateBox, ProductBox } from "@/components/ui/monetization";
import { Button, Field, Input, Select, Textarea } from "@/components/ui/primitives";

function Prose({ children }: { children: React.ReactNode }) {
  return <div className="prose-editorial mt-8 max-w-3xl">{children}</div>;
}

export function AboutPage() {
  useSEO({ title: "Sobre a Nexo", description: "Uma plataforma independente de ferramentas, prompts e conteúdo sobre IA e tecnologia — 100% no navegador.", path: "/sobre" });
  return (
    <Container wide>
      <PageHeader eyebrow="Sobre" title="Ferramentas que funcionam. Conteúdo que explica." crumbs={[{ label: "Sobre" }]} />
      <Prose>
        <p>A Nexo nasceu de uma frustração comum: buscar uma calculadora simples e cair em páginas lentas, cheias de anúncios, que escondem o resultado atrás de rolagem infinita. Ou procurar um prompt e encontrar listas copiadas sem contexto.</p>
        <h2>Princípios</h2>
        <ul>
          <li><strong>Tudo roda no navegador.</strong> Nenhum dado digitado nas ferramentas sai do seu dispositivo. Favoritos, histórico e preferências ficam no localStorage.</li>
          <li><strong>Explicação junto com o resultado.</strong> Toda ferramenta mostra a fórmula ou o método, exemplos e perguntas frequentes.</li>
          <li><strong>Conteúdo editorial próprio.</strong> Notícias e artigos são análises escritas pela equipe, não republicação automática. A estrutura está pronta para ingestão futura via RSS/API, sempre com atribuição.</li>
          <li><strong>Design sem ruído.</strong> Tipografia, grid e hierarquia no lugar de cards, sombras e gradientes.</li>
          <li><strong>Monetização transparente.</strong> Espaços de anúncio e links de afiliado são rotulados. Nada de anúncios disfarçados de conteúdo.</li>
        </ul>
        <h2>Tecnologia</h2>
        <p>React, TypeScript, Vite e Tailwind. Roteamento client-side, animações com Framer Motion, QR Code gerado localmente. Sem backend — por decisão, não por limitação. A camada de dados foi isolada para permitir conectar uma API sem reescrever a interface.</p>
        <h2>Roadmap</h2>
        <ul>
          <li>Ingestão de notícias via RSS com curadoria editorial</li>
          <li>Sincronização opcional de favoritos entre dispositivos</li>
          <li>Mais ferramentas de IA local (embeddings no navegador)</li>
          <li>Produtos digitais: kits de prompts e templates</li>
        </ul>
      </Prose>
    </Container>
  );
}

export function ContactPage() {
  useSEO({ title: "Contato", description: "Fale com a equipe da Nexo: sugestões de ferramentas, correções, parcerias e publicidade.", path: "/contato" });
  const { toast } = useStore();
  const [f, setF] = useState({ name: "", email: "", subject: "sugestao", message: "" });
  const [sent, setSent] = useState(false);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email) || f.message.trim().length < 10) { toast({ title: "Preencha nome, e-mail válido e uma mensagem com pelo menos 10 caracteres.", tone: "error" }); return; }
    try { const list = JSON.parse(localStorage.getItem("nexo:contact-drafts") ?? "[]"); list.push({ ...f, at: Date.now() }); localStorage.setItem("nexo:contact-drafts", JSON.stringify(list)); } catch { /* noop */ }
    setSent(true);
    toast({ title: "Mensagem registrada localmente", description: "Sem backend nesta versão — conecte um endpoint em ContactPage para envio real.", tone: "success" });
  };
  return (
    <Container wide>
      <PageHeader eyebrow="Contato" title="Fale com a gente" description="Sugestões de ferramentas, correções de conteúdo, parcerias e publicidade." crumbs={[{ label: "Contato" }]} />
      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        {sent ? (
          <div className="border border-mint p-8"><h2 className="font-display text-2xl font-bold">Recebido.</h2><p className="mt-2 text-muted">Sua mensagem foi guardada neste navegador. Quando a API de contato for conectada, este formulário passará a enviar automaticamente.</p><Button className="mt-5" variant="secondary" onClick={() => { setSent(false); setF({ name: "", email: "", subject: "sugestao", message: "" }); }}>Enviar outra</Button></div>
        ) : (
          <form onSubmit={submit} className="grid max-w-2xl gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nome"><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} required /></Field>
              <Field label="E-mail"><Input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} required /></Field>
            </div>
            <Field label="Assunto"><Select value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })}><option value="sugestao">Sugerir ferramenta</option><option value="correcao">Corrigir conteúdo</option><option value="parceria">Parceria / afiliados</option><option value="publicidade">Publicidade</option><option value="outro">Outro</option></Select></Field>
            <Field label="Mensagem"><Textarea rows={6} value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} required /></Field>
            <div><Button type="submit" size="lg">Enviar mensagem</Button></div>
            <p className="text-xs text-subtle">Este formulário não envia dados a servidores nesta versão. A estrutura está pronta para um endpoint (ex.: /api/contact).</p>
          </form>
        )}
        <aside className="space-y-8">
          <div><div className="eyebrow mb-2 border-b border-strong pb-2">Antes de escrever</div><Accordion items={[{ q: "Uma ferramenta deu resultado errado", a: "Envie os valores usados e o resultado esperado. Corrigimos e adicionamos um teste." }, { q: "Quero sugerir uma ferramenta", a: "Descreva o problema que ela resolve e um exemplo de uso. Priorizamos por demanda." }, { q: "Publicidade e afiliados", a: <>Veja as regras em <Link to="/anuncios" className="underline">Publicidade e afiliados</Link>.</>, }]} /></div>
        </aside>
      </div>
    </Container>
  );
}

export function PrivacyPage() {
  useSEO({ title: "Política de privacidade", description: "Como a Nexo trata dados: processamento local, localStorage, cookies de terceiros e anúncios.", path: "/privacidade" });
  return (
    <Container wide>
      <PageHeader eyebrow="Legal" title="Política de privacidade" description="Última atualização: março de 2026." crumbs={[{ label: "Privacidade" }]} />
      <Prose>
        <h2>Resumo</h2>
        <p>As ferramentas da Nexo processam tudo no seu navegador. Não coletamos o que você digita nas calculadoras, conversores, geradores ou no Prompt Builder.</p>
        <h2>Dados armazenados localmente</h2>
        <ul><li>Tema (claro/escuro)</li><li>Favoritos e histórico de navegação dentro do site</li><li>Histórico de buscas e de prompts gerados</li><li>Estado de ferramentas de produtividade (tarefas, notas, pomodoro)</li><li>E-mail informado na newsletter e mensagens do formulário de contato (até que uma API seja conectada)</li></ul>
        <p>Esses dados ficam no <code>localStorage</code> do seu navegador com o prefixo <code>nexo:</code>. Você pode apagá-los limpando os dados do site ou usando os botões de limpar disponíveis nas páginas de Favoritos e Histórico.</p>
        <h2>Cookies e terceiros</h2>
        <p>Nesta versão não há cookies próprios nem scripts de analytics. Quando anúncios (Google AdSense) forem ativados, o provedor poderá usar cookies conforme a política dele; exibiremos aviso de consentimento onde exigido por lei.</p>
        <h2>Links de afiliado</h2>
        <p>Alguns links levam a produtos de terceiros e podem gerar comissão sem custo para você. Eles são sempre identificados.</p>
        <h2>Seus direitos</h2>
        <p>Como não há conta nem servidor, você tem controle total: os dados estão no seu dispositivo. Para dúvidas, use a página de <Link to="/contato">contato</Link>.</p>
      </Prose>
    </Container>
  );
}

export function TermsPage() {
  useSEO({ title: "Termos de uso", description: "Condições de uso da plataforma Nexo, ferramentas e conteúdo.", path: "/termos" });
  return (
    <Container wide>
      <PageHeader eyebrow="Legal" title="Termos de uso" description="Última atualização: março de 2026." crumbs={[{ label: "Termos" }]} />
      <Prose>
        <h2>Uso das ferramentas</h2>
        <p>As ferramentas são fornecidas gratuitamente, sem garantia de precisão para fins profissionais, jurídicos, médicos ou financeiros. Calculadoras financeiras e de saúde são educativas: confirme com um profissional antes de decidir.</p>
        <h2>Conteúdo</h2>
        <p>Textos, guias e vídeos são de autoria da equipe Nexo ou de colaboradores identificados. Você pode citar trechos com link para a fonte. Reprodução integral requer autorização.</p>
        <h2>Prompts</h2>
        <p>Os prompts da biblioteca podem ser usados livremente, inclusive comercialmente. Não garantimos resultados de modelos de terceiros.</p>
        <h2>Publicidade</h2>
        <p>Espaços de anúncio e links de afiliado são identificados. Não aceitamos anúncios disfarçados de conteúdo editorial.</p>
        <h2>Alterações</h2>
        <p>Estes termos podem mudar. A data de atualização aparece no topo desta página.</p>
      </Prose>
    </Container>
  );
}

export function AdsPage() {
  useSEO({ title: "Publicidade e afiliados", description: "Como a Nexo se financia: anúncios rotulados, links de afiliado identificados e produtos digitais próprios.", path: "/anuncios" });
  return (
    <Container wide>
      <PageHeader eyebrow="Transparência" title="Publicidade, afiliados e produtos" description="Como financiamos uma plataforma gratuita sem comprometer o conteúdo." crumbs={[{ label: "Publicidade e afiliados" }]} />
      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="prose-editorial max-w-3xl">
          <h2>Três fontes de receita</h2>
          <ol>
            <li><strong>Anúncios display.</strong> Espaços reservados e rotulados como "Publicidade". Nunca no meio do resultado de uma ferramenta, nunca imitando botões.</li>
            <li><strong>Links de afiliado.</strong> Recomendações de produtos que usamos ou avaliamos, sempre com a etiqueta "Link de afiliado" e atributo <code>rel="sponsored"</code>.</li>
            <li><strong>Produtos digitais próprios.</strong> Kits de prompts, templates e guias em formato pago, claramente separados do conteúdo gratuito.</li>
          </ol>
          <h2>O que não fazemos</h2>
          <ul><li>Anúncios que bloqueiam o resultado ou exigem clique para revelar</li><li>Pop-ups, contadores falsos de escassez, "dark patterns"</li><li>Conteúdo editorial pago sem identificação</li><li>Venda de dados de usuários (não os coletamos)</li></ul>
          <h2>Para anunciantes e parceiros</h2>
          <p>Aceitamos parcerias alinhadas ao público: ferramentas de IA, produtividade, educação e desenvolvimento. Use o <Link to="/contato">formulário de contato</Link> com o assunto "Publicidade".</p>
          <h2>Como ativar o AdSense</h2>
          <p>Para o desenvolvedor: o componente <code>AdSlot</code> em <code>components/ui/monetization.tsx</code> já reserva os espaços com os tamanhos padrão. Basta adicionar o script do AdSense no <code>index.html</code> e substituir o placeholder pelo <code>&lt;ins class="adsbygoogle"&gt;</code>.</p>
        </div>
        <aside className="space-y-6">
          <div><div className="eyebrow mb-2">Exemplo de espaço de anúncio</div><AdSlot format="rectangle" id="ads-example" /></div>
          <div><div className="eyebrow mb-2">Exemplo de afiliado</div><AffiliateBox title="Produto parceiro" description="Assim aparecem as recomendações com link de afiliado." /></div>
          <div><div className="eyebrow mb-2">Exemplo de produto próprio</div><ProductBox title="Kit de prompts" description="Assim aparecem os produtos digitais da Nexo." price="R$ 49" /></div>
        </aside>
      </div>
    </Container>
  );
}

export function SitemapPage() {
  useSEO({ title: "Mapa do site", description: "Todas as páginas da Nexo organizadas por seção.", path: "/sitemap" });
  const routes = allRoutes();
  const groups = [...new Set(routes.map((r) => r.group))];
  const [open, setOpen] = useState<string | null>(null);
  return (
    <Container wide>
      <PageHeader eyebrow={`${routes.length} páginas`} title="Mapa do site" description="Todas as rotas da plataforma. Um sitemap.xml estático também está disponível em /sitemap.xml." crumbs={[{ label: "Mapa do site" }]} />
      <div className="mt-8 grid gap-x-10 gap-y-8 md:grid-cols-2 lg:grid-cols-3">
        {groups.map((g) => { const items = routes.filter((r) => r.group === g); const expanded = open === g || items.length <= 12; return (
          <section key={g}>
            <h2 className="flex items-center justify-between border-b border-strong pb-2 font-display text-lg font-bold">{g}<span className="font-mono text-xs text-subtle">{items.length}</span></h2>
            <ul className="mt-2 space-y-1">{(expanded ? items : items.slice(0, 12)).map((r) => <li key={r.path}><Link to={r.path} className="text-sm text-muted hover:text-fg">{r.label}</Link></li>)}</ul>
            {!expanded && <button onClick={() => setOpen(g)} className="mt-2 text-xs font-medium underline underline-offset-2">Ver todas ({items.length})</button>}
          </section>
        ); })}
      </div>
    </Container>
  );
}

export function NotFoundPage() {
  useSEO({ title: "Página não encontrada", description: "A página que você procura não existe.", path: "/404", noindex: true });
  return (
    <Container className="py-24 text-center">
      <div className="eyebrow">Erro 404</div>
      <h1 className="display-xl mt-4 text-6xl sm:text-8xl">Nada aqui.</h1>
      <p className="mx-auto mt-6 max-w-md text-muted">O endereço pode ter mudado ou nunca existiu. Use a busca ou volte para o início.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3"><Button to="/">Início</Button><Button to="/buscar" variant="secondary">Buscar</Button><Button to="/sitemap" variant="ghost">Mapa do site</Button></div>
    </Container>
  );
}
