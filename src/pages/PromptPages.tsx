import { motion } from "framer-motion";
import { Clock, Heart, Search, Sparkles, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { BUILDER, BUILDER_TEMPLATES, PROMPTS, PROMPT_CATEGORIES, promptBySlug, promptCategory, promptsByCategory, type BuilderKey } from "@/data/prompts";
import { useSEO } from "@/lib/seo";
import { useLocalStorage, useStore } from "@/lib/store";
import type { PromptCategory } from "@/lib/types";
import { formatDate, normalize } from "@/lib/utils";
import { Container, PageHeader } from "@/components/layout/Shell";
import { PromptCard } from "@/components/content/Cards";
import { Accordion, CopyButton, Empty, FavoriteButton, Tabs } from "@/components/ui/feedback";
import { AdSlot, AffiliateBox } from "@/components/ui/monetization";
import { Badge, Button, Field, Input, Select, Textarea } from "@/components/ui/primitives";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/motion";

/* ----------------------------------- Hub ---------------------------------- */

export function PromptsHub() {
  useSEO({ title: "Central de prompts — biblioteca e Prompt Builder", description: `${PROMPTS.length} prompts prontos para ChatGPT, Claude, Gemini e Midjourney, organizados por categoria, com variáveis, favoritos e histórico.`, path: "/prompts" });
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<"all" | "fav" | PromptCategory>("all");
  const { favorites, promptHistory, clearPromptHistory } = useStore();
  const favIds = new Set(favorites.filter((f) => f.kind === "prompt").map((f) => f.slug));
  const list = useMemo(() => {
    const nq = normalize(q);
    return PROMPTS.filter((p) => (cat === "all" ? true : cat === "fav" ? favIds.has(p.slug) : p.category === cat)).filter((p) => !nq || normalize(`${p.title} ${p.description} ${p.tags.join(" ")} ${p.platform.join(" ")}`).includes(nq));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, cat, favorites]);
  return (
    <Container wide>
      <PageHeader
        eyebrow={`${PROMPTS.length} prompts · ${PROMPT_CATEGORIES.length} categorias`}
        title="Central de prompts"
        description="Templates com variáveis destacadas para preencher, copiar e salvar. Ou monte o seu do zero no Prompt Builder, sem API."
        crumbs={[{ label: "Prompts" }]}
        aside={
          <Button to="/prompts/builder" size="lg">
            <Sparkles className="h-4 w-4" /> Prompt Builder
          </Button>
        }
      />
      <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar prompts…" className="pl-9" aria-label="Buscar prompts" />
        </div>
        <Tabs value={cat} onChange={setCat} tabs={[{ value: "all" as const, label: "Todos", count: PROMPTS.length }, { value: "fav" as const, label: "Favoritos", count: favIds.size }, ...PROMPT_CATEGORIES.map((c) => ({ value: c.slug, label: c.name, count: promptsByCategory(c.slug).length }))]} className="border-b-0" />
      </div>
      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div>
          {list.length ? (
            <Stagger className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" gap={0.03}>
              {list.map((p) => (
                <StaggerItem key={p.slug} className="h-full">
                  <PromptCard prompt={p} />
                </StaggerItem>
              ))}
            </Stagger>
          ) : (
            <Empty title={cat === "fav" ? "Nenhum prompt favorito" : "Nada encontrado"} description={cat === "fav" ? "Abra um prompt e clique em Favoritar." : "Tente outro termo."} />
          )}
        </div>
        <aside className="space-y-8">
          <div>
            <div className="mb-2 flex items-center justify-between border-b border-strong pb-2">
              <span className="eyebrow">Histórico de prompts</span>
              {promptHistory.length > 0 && (
                <button onClick={clearPromptHistory} className="text-subtle hover:text-red-600" aria-label="Limpar histórico">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            {promptHistory.length ? (
              <ul className="divide-y divide-[var(--line)]">
                {promptHistory.slice(0, 6).map((h) => (
                  <li key={h.id} className="flex items-center justify-between gap-2 py-2">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{h.title}</div>
                      <div className="flex items-center gap-1 text-[11px] text-subtle">
                        <Clock className="h-3 w-3" /> {formatDate(new Date(h.createdAt).toISOString(), { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                    <CopyButton text={h.prompt} label="" size="sm" variant="ghost" className="h-7 w-7 shrink-0 px-0" />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-subtle">Prompts gerados no Builder e nas ferramentas de IA aparecem aqui.</p>
            )}
          </div>
          <AdSlot format="rectangle" id="prompts-side" />
          <AffiliateBox tag="Leitura recomendada" title="Livro: escrevendo para máquinas" description="Espaço para recomendação de livro ou curso sobre prompt engineering com link de afiliado." />
        </aside>
      </div>
    </Container>
  );
}

/* -------------------------------- Category -------------------------------- */

export function PromptCategoryPage() {
  const { cat } = useParams<{ cat: string }>();
  const c = PROMPT_CATEGORIES.find((x) => x.slug === cat);
  useSEO({ title: c ? `Prompts de ${c.name}` : "Categoria", description: c?.description ?? "", path: `/prompts/categoria/${cat}` });
  if (!c) return <Navigate to="/404" replace />;
  const list = promptsByCategory(c.slug);
  return (
    <Container wide>
      <PageHeader eyebrow={`${list.length} prompts`} title={`Prompts de ${c.name}`} description={c.description} crumbs={[{ label: "Prompts", to: "/prompts" }, { label: c.name }]} />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((p) => (
          <PromptCard key={p.slug} prompt={p} />
        ))}
      </div>
      <div className="mt-10 flex flex-wrap gap-2">
        {PROMPT_CATEGORIES.filter((x) => x.slug !== c.slug).map((x) => (
          <Link key={x.slug} to={`/prompts/categoria/${x.slug}`} className="border border-line px-3 py-1.5 text-sm transition-colors hover:border-strong">
            {x.name}
          </Link>
        ))}
      </div>
    </Container>
  );
}

/* --------------------------------- Detail --------------------------------- */

export function PromptDetail() {
  const { slug } = useParams<{ slug: string }>();
  const p = slug ? promptBySlug(slug) : undefined;
  const { pushHistory, pushPrompt } = useStore();
  const [vars, setVars] = useState<Record<string, string>>({});
  useSEO({ title: p ? `${p.title} — prompt pronto` : "Prompt", description: p?.description ?? "", path: `/prompts/${slug}`, keywords: p?.tags });
  useEffect(() => {
    if (p) pushHistory({ kind: "prompt", slug: p.slug, title: p.title, path: `/prompts/${p.slug}` });
    setVars({});
  }, [p, pushHistory]);
  if (!p) return <Navigate to="/404" replace />;
  const cat = promptCategory(p.category);
  const filled = p.prompt.replace(/\{\{(\w+)\}\}/g, (_, k: string) => vars[k]?.trim() || `{{${k}}}`);
  const allFilled = p.variables.every((v) => vars[v]?.trim());
  const related = PROMPTS.filter((x) => x.category === p.category && x.slug !== p.slug).slice(0, 3);
  return (
    <Container wide>
      <PageHeader eyebrow={cat.name} title={p.title} description={p.description} crumbs={[{ label: "Prompts", to: "/prompts" }, { label: cat.name, to: `/prompts/categoria/${cat.slug}` }, { label: p.title }]} aside={<FavoriteButton kind="prompt" slug={p.slug} title={p.title} path={`/prompts/${p.slug}`} />} />
      <div className="grid gap-10 py-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="outline">{p.difficulty}</Badge>
            {p.platform.map((pl) => (
              <span key={pl} className="border border-line px-1.5 py-0.5 font-mono text-[10px] text-muted">
                {pl}
              </span>
            ))}
          </div>
          {p.variables.length > 0 && (
            <section className="mt-6 border border-line p-5">
              <div className="eyebrow mb-3">Preencha as variáveis</div>
              <div className="grid gap-3 sm:grid-cols-2">
                {p.variables.map((v) => (
                  <Field key={v} label={v.replace(/_/g, " ")}>
                    {["texto", "codigo", "prompt", "resposta", "anotacoes", "roteiro", "conteudo", "explicacao", "lista", "esquema_json"].includes(v) ? <Textarea rows={3} value={vars[v] ?? ""} onChange={(e) => setVars((s) => ({ ...s, [v]: e.target.value }))} /> : <Input value={vars[v] ?? ""} onChange={(e) => setVars((s) => ({ ...s, [v]: e.target.value }))} />}
                  </Field>
                ))}
              </div>
            </section>
          )}
          <section className="mt-6 border border-strong bg-elev">
            <div className="flex items-center justify-between border-b border-line px-4 py-2">
              <span className="font-mono text-[11px] uppercase tracking-wider text-muted">prompt {allFilled ? "· pronto" : p.variables.length ? "· com variáveis" : ""}</span>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => pushPrompt(p.title, filled)}>
                  Salvar no histórico
                </Button>
                <CopyButton text={filled} variant="primary" />
              </div>
            </div>
            <pre className="whitespace-pre-wrap p-4 font-mono text-[13px] leading-relaxed sm:p-5">
              {filled.split(/(\{\{\w+\}\})/g).map((part, i) => (/^\{\{\w+\}\}$/.test(part) ? <mark key={i} className="bg-accent-soft px-1 text-accent-strong dark:bg-accent/20 dark:text-accent">{part}</mark> : part))}
            </pre>
          </section>
          <Reveal className="mt-10">
            <h2 className="mb-2 font-display text-xl font-bold">Como usar</h2>
            <Accordion items={[{ q: "Em qual modelo funciona melhor?", a: `Foi desenhado para ${p.platform.join(", ")}. Funciona em qualquer modelo de linguagem atual; ajuste o tamanho da resposta se o modelo for pequeno.` }, { q: "Posso mudar o formato?", a: "Sim. As linhas de formato são as mais seguras de editar. Mantenha o papel e o objetivo." }, { q: "E se o resultado vier genérico?", a: "Adicione contexto específico: nomes, números, exemplos do seu caso. Use o Melhorador de prompt para uma checklist." }]} />
          </Reveal>
        </div>
        <aside className="space-y-8 lg:sticky lg:top-24 lg:self-start">
          <div>
            <div className="eyebrow mb-2 border-b border-strong pb-2">Relacionados</div>
            <ul className="divide-y divide-[var(--line)]">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link to={`/prompts/${r.slug}`} className="block py-2.5 text-sm font-medium transition-colors hover:text-accent">
                    {r.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="eyebrow mb-2 border-b border-strong pb-2">Ferramentas úteis</div>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/ferramentas/melhorar-prompt" className="link-underline">
                  Melhorador de prompt
                </Link>
              </li>
              <li>
                <Link to="/ferramentas/estimador-de-tokens" className="link-underline">
                  Estimador de tokens
                </Link>
              </li>
              <li>
                <Link to="/prompts/builder" className="link-underline">
                  Prompt Builder
                </Link>
              </li>
            </ul>
          </div>
          <AdSlot format="rectangle" id="prompt-side" />
        </aside>
      </div>
    </Container>
  );
}

/* --------------------------------- Builder -------------------------------- */

type BuilderState = Record<BuilderKey, string> & { tema: string; contexto: string; extra: string };
const DEFAULT: BuilderState = { papel: "especialista", objetivo: "escrever", publico: "profissionais", tom: "direto", formato: "lista", detalhe: "medio", plataforma: "chatgpt", resultado: "pronto", tema: "", contexto: "", extra: "" };

export function buildPrompt(s: BuilderState): string {
  const get = (k: BuilderKey) => BUILDER[k].find((o) => o.value === s[k]);
  const papel = get("papel");
  const lines: string[] = [];
  if (papel?.text) lines.push(`Você é ${papel.text}.`);
  const isImage = s.objetivo === "criar-imagem";
  lines.push(`${get("objetivo")?.text} ${s.tema.trim() || "[tema / tarefa]"}${isImage ? "" : ` para ${get("publico")?.text}`}.`);
  if (s.contexto.trim()) lines.push("", `Contexto: ${s.contexto.trim()}`);
  lines.push("", `Tom: ${get("tom")?.text}.`, `Formato: ${get("formato")?.text}.`, get("detalhe")?.text ?? "");
  if (s.extra.trim()) lines.push(`Restrições: ${s.extra.trim()}`);
  lines.push("", get("resultado")?.text ?? "");
  if (["midjourney", "dalle", "sd"].includes(s.plataforma)) lines.push("", "Entregue o prompt final em inglês, em uma única linha, no formato aceito pela plataforma de imagem.");
  if (s.plataforma === "llama") lines.push("", "Seja explícito e evite instruções implícitas: este prompt será usado em um modelo aberto.");
  return lines.filter((l, i, arr) => !(l === "" && arr[i - 1] === "")).join("\n").trim();
}

export function PromptBuilder() {
  useSEO({ title: "Prompt Builder — monte prompts profissionais sem API", description: "Combine objetivo, contexto, público, tom, formato, nível de detalhe, plataforma e resultado esperado. Copie, salve e reutilize. 100% local.", path: "/prompts/builder" });
  const [s, setS] = useLocalStorage<BuilderState>("builder-state", DEFAULT);
  const { pushPrompt, promptHistory, toast, toggleFavorite, isFavorite } = useStore();
  const prompt = useMemo(() => buildPrompt(s), [s]);
  const set = (k: keyof BuilderState, v: string) => setS((p) => ({ ...p, [k]: v }));
  const completeness = [s.tema, s.contexto, s.extra].filter((x) => x.trim()).length;
  const favId = `builder-${s.objetivo}-${s.tema.slice(0, 20)}`;
  const OptGroup = ({ k, label }: { k: BuilderKey; label: string }) => (
    <Field label={label}>
      <Select value={s[k]} onChange={(e) => set(k, e.target.value)}>
        {BUILDER[k].map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </Select>
    </Field>
  );
  return (
    <Container wide>
      <PageHeader eyebrow="Ferramenta local · sem API" title="Prompt Builder" description="Monte prompts estruturados combinando oito dimensões. O resultado é atualizado em tempo real e fica salvo no seu navegador." crumbs={[{ label: "Prompts", to: "/prompts" }, { label: "Prompt Builder" }]} />
      <div className="grid gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <div>
            <div className="eyebrow mb-2">Templates</div>
            <div className="flex flex-wrap gap-1.5">
              {BUILDER_TEMPLATES.map((t) => (
                <button key={t.name} onClick={() => { setS((p) => ({ ...p, ...t.values, tema: t.values.tema ?? p.tema })); toast({ title: `Template "${t.name}" aplicado` }); }} className="border border-line px-2.5 py-1.5 text-xs transition-colors hover:border-strong">
                  {t.name}
                </button>
              ))}
              <button onClick={() => setS(DEFAULT)} className="border border-dashed border-line px-2.5 py-1.5 text-xs text-muted hover:border-strong">
                Limpar
              </button>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <OptGroup k="papel" label="1 · Papel do modelo" />
            <OptGroup k="objetivo" label="2 · Objetivo" />
          </div>
          <Field label="Tema / tarefa específica" hint="O que exatamente você quer. Quanto mais concreto, melhor.">
            <Input value={s.tema} onChange={(e) => set("tema", e.target.value)} placeholder="ex.: um artigo sobre juros compostos para quem nunca investiu" />
          </Field>
          <Field label="3 · Contexto" hint="O que o modelo precisa saber e não tem como saber.">
            <Textarea rows={3} value={s.contexto} onChange={(e) => set("contexto", e.target.value)} placeholder="ex.: blog de finanças pessoais, leitores de 25–40 anos, já publicamos sobre reserva de emergência" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <OptGroup k="publico" label="4 · Público" />
            <OptGroup k="tom" label="5 · Tom" />
            <OptGroup k="formato" label="6 · Formato" />
            <OptGroup k="detalhe" label="7 · Nível de detalhe" />
            <OptGroup k="plataforma" label="8 · Plataforma" />
            <OptGroup k="resultado" label="9 · Resultado esperado" />
          </div>
          <Field label="Restrições e critérios (opcional)" hint="Tamanho, palavras a evitar, exemplos, critérios de qualidade.">
            <Textarea rows={2} value={s.extra} onChange={(e) => set("extra", e.target.value)} placeholder="ex.: máximo 600 palavras; sem a palavra 'revolucionário'; um exemplo por tópico" />
          </Field>
        </div>
        <div className="lg:sticky lg:top-24 lg:self-start">
          <motion.div layout className="border border-strong bg-elev">
            <div className="flex items-center justify-between border-b border-line px-4 py-2">
              <span className="font-mono text-[11px] uppercase tracking-wider text-muted">prompt gerado · {prompt.length} caracteres</span>
              <span className="flex items-center gap-1.5 font-mono text-[11px] text-subtle">
                <span className={`h-1.5 w-1.5 ${completeness === 3 ? "bg-mint" : completeness > 0 ? "bg-amber" : "bg-[var(--line)]"}`} /> {completeness}/3 campos livres
              </span>
            </div>
            <motion.pre key={prompt} initial={{ opacity: 0.6 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="min-h-[280px] whitespace-pre-wrap p-4 font-mono text-[13px] leading-relaxed sm:p-5">
              {prompt}
            </motion.pre>
            <div className="flex flex-wrap items-center gap-2 border-t border-line p-3">
              <CopyButton text={prompt} variant="primary" size="md" label="Copiar prompt" />
              <Button variant="secondary" onClick={() => { pushPrompt(s.tema.trim() ? `Builder: ${s.tema.slice(0, 40)}` : "Prompt do Builder", prompt); toast({ title: "Salvo no histórico", tone: "success" }); }}>
                Salvar no histórico
              </Button>
              <Button variant="ghost" onClick={() => { toggleFavorite({ kind: "prompt", slug: favId, title: s.tema.trim() ? `Builder: ${s.tema.slice(0, 40)}` : "Prompt do Builder", path: "/prompts/builder" }); }}>
                <Heart className={`h-3.5 w-3.5 ${isFavorite(`prompt:${favId}`) ? "fill-current text-accent" : ""}`} /> Favorito
              </Button>
            </div>
          </motion.div>
          {!s.tema.trim() && <p className="mt-3 text-xs text-amber">Preencha o tema para o prompt fazer sentido.</p>}
          {promptHistory.length > 0 && (
            <div className="mt-8">
              <div className="eyebrow mb-2 border-b border-strong pb-2">Histórico recente</div>
              <ul className="divide-y divide-[var(--line)]">
                {promptHistory.slice(0, 5).map((h) => (
                  <li key={h.id} className="flex items-center justify-between gap-2 py-2">
                    <span className="truncate text-sm">{h.title}</span>
                    <CopyButton text={h.prompt} label="" size="sm" variant="ghost" className="h-7 w-7 shrink-0 px-0" />
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="mt-8">
            <AdSlot format="horizontal" id="builder" />
          </div>
        </div>
      </div>
    </Container>
  );
}
