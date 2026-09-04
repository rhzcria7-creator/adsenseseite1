import type { ComponentType } from "react";
import { FormulaTool, type ToolProps } from "./ToolShell";
import * as C from "./calculators";
import * as V from "./converters";
import * as T from "./text";
import * as G from "./generators";
import * as A from "./ai";
import * as P from "./productivity";

/** slug → componente. Ferramentas baseadas em fórmula usam CALC_CONFIGS. */
const CUSTOM: Record<string, ComponentType<ToolProps>> = {
  "media-ponderada": C.MediaPonderada, "contagem-regressiva": C.ContagemRegressiva, sorteador: C.Sorteador, "fuso-horario": C.FusoHorario,
  temperatura: V.Temperatura, comprimento: V.UnitConverter, peso: V.UnitConverter, velocidade: V.UnitConverter, area: V.UnitConverter, volume: V.UnitConverter, energia: V.UnitConverter, pressao: V.UnitConverter, tempo: V.UnitConverter, "dados-digitais": V.UnitConverter,
  "base-numerica": V.BaseNumerica, cores: V.Cores, "timestamp-unix": V.TimestampUnix, base64: V.Base64, "url-encode": V.UrlEncode, "json-formatter": V.JsonFormatter, "csv-para-json": V.CsvParaJson, "markdown-para-html": V.MarkdownParaHtml, "html-entities": V.HtmlEntities, "texto-para-binario": V.TextoParaBinario, "numero-romano": V.NumeroRomano, "numero-por-extenso": V.NumeroPorExtenso, moeda: V.Moeda,
  "contador-de-palavras": T.ContadorDePalavras, "contador-de-caracteres": T.ContadorDeCaracteres, "maiusculas-minusculas": T.MaiusculasMinusculas, "limpar-texto": T.LimparTexto, "remover-duplicatas": T.RemoverDuplicatas, "inverter-texto": T.InverterTexto, "gerador-de-slug": T.GeradorDeSlug, "lorem-ipsum": T.LoremIpsum, "extrair-emails-urls": T.ExtrairEmailsUrls, "ordenar-linhas": T.OrdenarLinhas, "frequencia-de-palavras": T.FrequenciaDePalavras, "resumidor-de-texto": T.ResumidorDeTexto, "tempo-de-leitura": T.TempoDeLeitura, "comparar-textos": T.ComparadorDeTextos, "localizar-substituir": T.LocalizarSubstituir,
  "gerador-de-senha": G.GeradorDeSenha, "qr-code": G.QrCode, uuid: G.Uuid, "gerador-de-numeros-aleatorios": G.GeradorDeNumerosAleatorios, "gerador-de-ideias": G.GeradorDeIdeias, "nomes-de-negocio": G.NomesDeNegocio, "nome-de-usuario": G.NomeDeUsuario, "paleta-de-cores": G.PaletaDeCores, "gradiente-css": G.GradienteCss, "box-shadow-css": G.BoxShadowCss, "gerador-de-hashtags": G.GeradorDeHashtags, "gerador-de-titulos": G.GeradorDeTitulos, "gerador-de-bio": G.GeradorDeBio, "gerador-de-meta-tags": G.GeradorDeMetaTags, "gerador-de-utm": G.GeradorDeUtm, "assinatura-de-email": G.AssinaturaDeEmail, "validador-de-cpf-cnpj": G.ValidadorDeCpfCnpj,
  "gerador-de-prompt-de-imagem": A.GeradorDePromptDeImagem, "melhorar-prompt": A.MelhorarPrompt, "gerador-de-system-prompt": A.GeradorDeSystemPrompt, "estimador-de-tokens": A.EstimadorDeTokens, "custo-de-api-ia": A.CustoDeApiIa, "comparador-de-modelos": A.ComparadorDeModelos, "gerador-de-persona": A.GeradorDePersona, "roteiro-de-video": A.RoteiroDeVideo, "post-linkedin": A.PostLinkedin, "email-frio": A.EmailFrio, "analisador-de-legibilidade": A.AnalisadorDeLegibilidade, "detector-de-tom": A.DetectorDeTom,
  pomodoro: P.Pomodoro, cronometro: P.Cronometro, "lista-de-tarefas": P.ListaDeTarefas, "notas-rapidas": P.NotasRapidas, "matriz-eisenhower": P.MatrizEisenhower, "roleta-de-decisao": P.RoletaDeDecisao, "gerador-de-okr": P.GeradorDeOkr, "rastreador-de-habitos": P.RastreadorDeHabitos, "calculadora-de-metas": P.CalculadoraDeMetas,
};

const cache = new Map<string, ComponentType<ToolProps>>();
export function resolveTool(slug: string): ComponentType<ToolProps> | null {
  if (CUSTOM[slug]) return CUSTOM[slug];
  const cached = cache.get(slug);
  if (cached) return cached;
  const cfg = C.CALC_CONFIGS[slug];
  if (cfg) { const Cmp = () => <FormulaTool config={cfg} />; Cmp.displayName = `Formula(${slug})`; cache.set(slug, Cmp); return Cmp; }
  return null;
}
export const hasTool = (slug: string) => Boolean(CUSTOM[slug] || C.CALC_CONFIGS[slug]);
