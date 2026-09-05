import { Link } from "react-router-dom";
import { ArrowLeft, Mail } from "lucide-react";
import { useSeo } from "@/lib/seo";
import { SITE } from "@/lib/utils";
import { stats, trending } from "@/lib/content";
import { Breadcrumbs, PageHeader } from "@/components/layout/Shell";
import { Button, Field, Input, Textarea } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/feedback";
import { useState } from "react";

function Prose({ children }: { children: React.ReactNode }) {
  return <div className="prose-nexo max-w-3xl">{children}</div>;
}

export function NotFound() {
  useSeo({ title: "Página não encontrada", noindex: true });
  const hot = trending(5);
  return (
    <div className="container-x py-24 text-center">
      <div className="font-mono text-7xl font-semibold text-fg-3">404</div>
      <h1 className="h-display mt-4 text-3xl">Essa página não existe</h1>
      <p className="mx-auto mt-3 max-w-md text-fg-2">O link pode estar quebrado ou o conteúdo foi movido. Aqui vão alguns caminhos populares:</p>
      <div className="mx-auto mt-6 flex max-w-md flex-col gap-2">{hot.map((h) => <Link key={h.id} to={h.path} className="rounded-xl border border-line px-4 py-2.5 text-sm font-medium text-fg hover:bg-bg-2">{h.title}</Link>)}</div>
      <Link to="/" className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-accent"><ArrowLeft size={15} /> Voltar ao início</Link>
    </div>
  );
}

export function About() {
  useSeo({ title: "Sobre o Nexo", description: "Conheça o Nexo: plataforma independente de IA, tecnologia, ferramentas online e prompts — 100% gratuita e processada no navegador.", path: "/sobre" });
  return (
    <div className="container-x py-8">
      <Breadcrumbs items={[{ name: "Sobre" }]} />
      <PageHeader eyebrow="Sobre" title="Tecnologia útil, explicada sem ruído" />
      <Prose>
        <p>O {SITE.name} nasceu de uma frustração comum: a maior parte do conteúdo sobre inteligência artificial e tecnologia é ou hype vazio ou jargão impenetrável. Queríamos um lugar que explicasse o que importa, mostrasse como usar na prática e entregasse ferramentas que funcionam.</p>
        <h2>O que você encontra aqui</h2>
        <ul>
          <li><strong>{stats.tools} ferramentas</strong> — calculadoras, conversores, geradores e utilitários de texto e IA que rodam inteiramente no navegador.</li>
          <li><strong>{stats.prompts} prompts profissionais</strong> e um Prompt Builder para estruturar pedidos a qualquer assistente de IA.</li>
          <li><strong>{stats.articles} conteúdos</strong> entre notícias explicadas, artigos, tutoriais, guias e vídeos selecionados.</li>
        </ul>
        <h2>Princípios</h2>
        <ol>
          <li><strong>Privacidade por padrão.</strong> Nenhuma ferramenta envia seus dados a servidores. Favoritos e histórico ficam no seu dispositivo.</li>
          <li><strong>Sem cadastro.</strong> Tudo é acessível imediatamente.</li>
          <li><strong>Honestidade.</strong> Não fingimos atualização em tempo real nem resultados que a tecnologia não entrega. O conteúdo é curado e revisado.</li>
        </ol>
        <h2>Monetização</h2>
        <p>O site é mantido por anúncios discretos (Google AdSense), sempre identificados como publicidade e posicionados para não atrapalhar o uso das ferramentas.</p>
      </Prose>
    </div>
  );
}

export function Contact() {
  useSeo({ title: "Contato", description: "Fale com a equipe do Nexo: sugestões de ferramentas, correções e parcerias.", path: "/contato" });
  const { toast } = useToast();
  const [f, setF] = useState({ name: "", email: "", msg: "" });
  return (
    <div className="container-x py-8">
      <Breadcrumbs items={[{ name: "Contato" }]} />
      <PageHeader eyebrow="Contato" title="Fale com a gente" description="Sugestões de ferramentas, correções de conteúdo ou parcerias. Este formulário abre seu cliente de e-mail — não há backend." />
      <form className="max-w-xl space-y-4" onSubmit={(e) => { e.preventDefault(); const body = encodeURIComponent(`${f.msg}\n\n— ${f.name} (${f.email})`); window.location.href = `mailto:${SITE.email}?subject=${encodeURIComponent("Contato via Nexo")}&body=${body}`; toast({ title: "Abrindo seu e-mail…", tone: "info" }); }}>
        <Field label="Nome"><Input required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
        <Field label="E-mail"><Input type="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></Field>
        <Field label="Mensagem"><Textarea required value={f.msg} onChange={(e) => setF({ ...f, msg: e.target.value })} /></Field>
        <Button type="submit"><Mail size={15} /> Enviar por e-mail</Button>
      </form>
    </div>
  );
}

export function Privacy() {
  useSeo({ title: "Política de Privacidade", description: "Como o Nexo trata dados: processamento local, cookies de anúncios e armazenamento no navegador.", path: "/privacidade" });
  return (
    <div className="container-x py-8">
      <Breadcrumbs items={[{ name: "Privacidade" }]} />
      <PageHeader eyebrow="Legal" title="Política de Privacidade" />
      <Prose>
        <p>Última atualização: março de 2026.</p>
        <h2>Dados que não coletamos</h2>
        <p>O {SITE.name} não possui cadastro, login ou banco de dados. Os textos, números e arquivos que você usa nas ferramentas são processados exclusivamente no seu navegador e nunca são enviados aos nossos servidores.</p>
        <h2>Armazenamento local</h2>
        <p>Preferências (tema), favoritos, histórico de navegação interno, tarefas, notas e prompts salvos ficam no <code>localStorage</code> do seu dispositivo, sob o prefixo <code>nexo:</code>. Você pode apagá-los a qualquer momento nas páginas de Favoritos e Histórico ou limpando os dados do site no navegador.</p>
        <h2>Publicidade</h2>
        <p>Exibimos anúncios do Google AdSense. O Google e seus parceiros podem usar cookies para veicular anúncios com base em visitas anteriores a este e a outros sites. Você pode desativar a personalização em <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">Configurações de anúncios do Google</a>.</p>
        <h2>Vídeos incorporados</h2>
        <p>Páginas de vídeo incorporam o player do YouTube (modo de privacidade aprimorada). Ao reproduzir, aplicam-se as políticas do YouTube/Google.</p>
        <h2>Contato</h2>
        <p>Dúvidas: <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.</p>
      </Prose>
    </div>
  );
}

export function Terms() {
  useSeo({ title: "Termos de Uso", description: "Termos de uso do Nexo: conteúdo informativo, ferramentas sem garantia e responsabilidades.", path: "/termos" });
  return (
    <div className="container-x py-8">
      <Breadcrumbs items={[{ name: "Termos de uso" }]} />
      <PageHeader eyebrow="Legal" title="Termos de Uso" />
      <Prose>
        <h2>1. Natureza do conteúdo</h2>
        <p>Todo o conteúdo do {SITE.name} tem caráter informativo e educacional. Não constitui aconselhamento financeiro, jurídico, médico ou profissional. Consulte um especialista antes de tomar decisões.</p>
        <h2>2. Ferramentas</h2>
        <p>As ferramentas são fornecidas “como estão”, sem garantia de exatidão para todos os cenários. Verifique resultados críticos por outros meios.</p>
        <h2>3. Propriedade intelectual</h2>
        <p>Textos e código originais são de propriedade do {SITE.name}. Prompts podem ser usados livremente. Vídeos incorporados pertencem aos respectivos canais.</p>
        <h2>4. Links externos</h2>
        <p>Não nos responsabilizamos pelo conteúdo de sites de terceiros.</p>
        <h2>5. Alterações</h2>
        <p>Estes termos podem ser atualizados sem aviso prévio. O uso continuado implica aceitação.</p>
      </Prose>
    </div>
  );
}
