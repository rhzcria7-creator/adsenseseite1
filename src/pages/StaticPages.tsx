import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Send } from "lucide-react";
import { allRoutes } from "@/lib/content";
import { useSEO } from "@/lib/seo";
import { useLocalStorage, useStore } from "@/lib/store";
import { Breadcrumbs } from "@/components/layout/Shell";
import { Button, Field, Input, PageHeader, Select, Textarea } from "@/components/ui/primitives";
import { AdSlot } from "@/components/ui/monetization";

function Static({ title, eyebrow, description, path, children }: { title: string; eyebrow: string; description: string; path: string; children: React.ReactNode }) {
  useSEO({ title, description, path, breadcrumbs: [{ label: title, path }] });
  return (
    <div className="container-x">
      <Breadcrumbs items={[{ label: title }]} />
      <PageHeader eyebrow={eyebrow} title={title} description={description} />
      <div className="prose-nexo max-w-3xl">{children}</div>
    </div>
  );
}

export function AboutPage() {
  return (
    <Static title="Sobre o Nexo" eyebrow="Nexo" description="Uma plataforma de utilidade real: ferramentas que funcionam, prompts que ajudam e conteúdo escrito para ser lido." path="/sobre">
      <h2>O que é</h2>
      <p>O Nexo reúne calculadoras, conversores, geradores, ferramentas de texto e IA, uma central de prompts e conteúdo editorial sobre inteligência artificial e tecnologia. Tudo roda no navegador — não há servidor, banco de dados ou cadastro.</p>
      <h2>Princípios</h2>
      <ul><li><strong>Funciona de verdade.</strong> Cada ferramenta faz o que promete, com validação, exemplos e explicação da fórmula.</li><li><strong>Privacidade por padrão.</strong> Favoritos, histórico e dados das ferramentas ficam no seu dispositivo (localStorage).</li><li><strong>Sem fingir atualização.</strong> O conteúdo é editorial e local; destaques e recomendações mudam por rotação interna, não por feed externo.</li><li><strong>Design que sai do caminho.</strong> Tipografia, espaço e hierarquia antes de efeitos.</li></ul>
      <h2>Tecnologia</h2>
      <p>React 19, TypeScript, Vite, Tailwind CSS v4, Framer Motion e React Router. Componentes de animação inspirados no React Bits (reveal, split text, count up, spotlight). Sem dependências pesadas.</p>
      <h2>Limitações conhecidas</h2>
      <ul><li>Conversor de moedas usa taxa informada por você (sem API).</li><li>Preços de modelos de IA são referências editoriais e podem estar desatualizados.</li><li>Calculadoras trabalhistas mostram valores brutos e simplificados.</li></ul>
      <p>Dúvidas ou sugestões? <Link to="/contato">Fale conosco</Link>.</p>
    </Static>
  );
}

export function ContactPage() {
  const [msgs, setMsgs] = useLocalStorage<{ name: string; email: string; topic: string; message: string; at: number }[]>("contact-drafts", []);
  const [f, setF] = useState({ name: "", email: "", topic: "sugestao", message: "" });
  const { toast } = useStore();
  const submit = (e: React.FormEvent) => { e.preventDefault(); if (!f.name || !f.email || !f.message) { toast({ title: "Preencha nome, e-mail e mensagem", tone: "error" }); return; } setMsgs([{ ...f, at: Date.now() }, ...msgs].slice(0, 10)); toast({ title: "Mensagem registrada localmente", description: "Como a plataforma não tem backend, use o e-mail abaixo para envio real." }); setF({ name: "", email: "", topic: "sugestao", message: "" }); };
  return (
    <Static title="Contato" eyebrow="Fale conosco" description="Sugestões de ferramentas, correções de conteúdo e parcerias." path="/contato">
      <div className="not-prose grid gap-8 md:grid-cols-[1fr_280px]">
        <form onSubmit={submit} className="space-y-4 rounded-2xl border bg-surface p-6">
          <div className="grid gap-4 sm:grid-cols-2"><Field label="Nome"><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field><Field label="E-mail"><Input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></Field></div>
          <Field label="Assunto"><Select value={f.topic} onChange={(e) => setF({ ...f, topic: e.target.value })}><option value="sugestao">Sugestão de ferramenta</option><option value="erro">Reportar erro</option><option value="conteudo">Correção de conteúdo</option><option value="parceria">Publicidade / parceria</option><option value="outro">Outro</option></Select></Field>
          <Field label="Mensagem"><Textarea rows={5} value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} /></Field>
          <Button type="submit"><Send className="h-4 w-4" />Enviar</Button>
          <p className="text-xs text-fg-3">Sem backend: o formulário salva um rascunho local. Para contato real, use o e-mail ao lado. Ao conectar uma API, troque o `setMsgs` por um `fetch("/api/contato")`.</p>
        </form>
        <div className="space-y-4"><div className="rounded-2xl border bg-surface p-5"><Mail className="h-5 w-5 text-fg-2" /><p className="mt-3 text-sm font-medium">E-mail</p><a href="mailto:contato@nexo.app" className="text-sm text-brand hover:underline">contato@nexo.app</a></div><div className="rounded-2xl border bg-surface p-5 text-sm text-fg-2"><p className="font-medium text-fg">Tempo de resposta</p><p className="mt-1">Até 3 dias úteis para sugestões e erros. Parcerias: até 7 dias.</p></div></div>
      </div>
    </Static>
  );
}

export function PrivacyPage() {
  return (
    <Static title="Política de privacidade" eyebrow="Legal" description="Como o Nexo trata (ou melhor, não trata) os seus dados." path="/privacidade">
      <h2>Dados que ficam no seu navegador</h2>
      <p>Favoritos, histórico de navegação interno, histórico de buscas, prompts salvos, tema e dados digitados em ferramentas com persistência (tarefas, notas, hábitos, Pomodoro) são armazenados via <code>localStorage</code>, apenas no seu dispositivo. Você pode apagá-los limpando os dados do site no navegador ou usando os botões "Limpar" na interface.</p>
      <h2>Dados que não coletamos</h2>
      <p>O Nexo não tem servidor próprio, banco de dados ou sistema de login. Textos, números e arquivos que você usa nas ferramentas não são enviados a lugar nenhum.</p>
      <h2>Publicidade</h2>
      <p>Usamos o Google AdSense para exibir anúncios. O Google pode usar cookies e identificadores para personalização, conforme a <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer">política de anúncios do Google</a>. Você pode desativar a personalização em <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">adssettings.google.com</a>. Não incentivamos cliques e os espaços são sempre identificados como "Publicidade".</p>
      <h2>Vídeos incorporados</h2>
      <p>Quando presentes, vídeos do YouTube usam o domínio <code>youtube-nocookie.com</code>, que só define cookies após a reprodução.</p>
      <h2>Fontes</h2>
      <p>As fontes tipográficas são carregadas do Google Fonts, que pode registrar o endereço IP da requisição.</p>
      <h2>Alterações</h2>
      <p>Esta política pode ser atualizada. A data de revisão é março de 2026.</p>
    </Static>
  );
}

export function TermsPage() {
  return (
    <Static title="Termos de uso" eyebrow="Legal" description="Regras simples para usar a plataforma." path="/termos">
      <h2>Uso das ferramentas</h2>
      <p>As ferramentas são fornecidas "como estão", para fins informativos e de produtividade. Resultados de calculadoras financeiras, trabalhistas e de saúde são estimativas e não substituem orientação de profissionais qualificados.</p>
      <h2>Conteúdo editorial</h2>
      <p>Notícias, artigos, guias e vídeos são produzidos editorialmente e refletem análises da equipe na data de publicação. Não há garantia de atualização em tempo real.</p>
      <h2>Prompts</h2>
      <p>Os templates de prompts podem ser usados livremente, inclusive comercialmente. Você é responsável pelo uso que faz das saídas geradas em ferramentas de terceiros.</p>
      <h2>Propriedade intelectual</h2>
      <p>Textos e design são do Nexo, salvo indicação contrária. É permitido citar trechos com link para a página original.</p>
      <h2>Limitação de responsabilidade</h2>
      <p>Não nos responsabilizamos por decisões tomadas com base nos resultados das ferramentas ou no conteúdo publicado.</p>
    </Static>
  );
}

export function AdsPage() {
  return (
    <Static title="Publicidade e afiliados" eyebrow="Transparência" description="Como o Nexo se mantém e como os anúncios são exibidos." path="/anuncios">
      <p>O Nexo é gratuito e financiado por publicidade contextual via Google AdSense. Os espaços são identificados, não bloqueiam conteúdo e não usam padrões enganosos (como botões falsos).</p>
      <h2>Onde os anúncios aparecem</h2>
      <ul><li>Banner horizontal no fim das listagens.</li><li>Unidade in-article no meio de artigos e abaixo das ferramentas.</li><li>Sidebar em páginas de conteúdo (desktop) e retângulo (mobile).</li></ul>
      <div className="not-prose my-8"><AdSlot format="rectangle" label="Exemplo de unidade" /></div>
      <h2>Afiliados</h2>
      <p>Quando um link for de afiliado, ele será sinalizado com a palavra "afiliado". Não recomendamos produtos que não usaríamos.</p>
      <h2>Anuncie</h2>
      <p>Para patrocínio de seções ou ferramentas, <Link to="/contato">entre em contato</Link>.</p>
    </Static>
  );
}

export function SitemapPage() {
  const routes = useMemo(() => allRoutes(), []);
  const groups = useMemo(() => { const g: Record<string, typeof routes> = {}; routes.forEach((r) => (g[r.group] ??= []).push(r)); return g; }, [routes]);
  return (
    <Static title="Mapa do site" eyebrow="Navegação" description={`${routes.length} páginas geradas a partir dos dados locais.`} path="/sitemap">
      <div className="not-prose grid gap-8 md:grid-cols-2">{Object.entries(groups).map(([g, items]) => <section key={g}><h2 className="mb-2 text-sm font-semibold uppercase tracking-[0.12em] text-fg-3">{g} <span className="font-normal">({items.length})</span></h2><ul className="max-h-72 space-y-1 overflow-auto pr-2 text-sm">{items.map((r) => <li key={r.path}><Link to={r.path} className="text-fg-2 hover:text-fg hover:underline underline-offset-4">{r.label}</Link></li>)}</ul></section>)}</div>
    </Static>
  );
}

export function NotFoundPage() {
  useSEO({ title: "Página não encontrada", description: "A página que você procura não existe.", noindex: true });
  return (
    <div className="container-x py-24 text-center">
      <p className="font-mono text-sm text-fg-3">404</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Página não encontrada</h1>
      <p className="mx-auto mt-3 max-w-md text-fg-2">O endereço pode ter mudado. Use a busca ou volte ao início.</p>
      <div className="mt-6 flex justify-center gap-3"><Button to="/">Início</Button><Button variant="outline" to="/buscar">Buscar</Button></div>
    </div>
  );
}
