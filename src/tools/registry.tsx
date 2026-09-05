import type { ComponentType } from "react";
import * as C from "./calculators";
import * as V from "./converters";
import * as T from "./text";
import * as G from "./generators";
import * as A from "./ai";
import * as P from "./productivity";
import { PromptBuilder } from "./promptBuilder";

export const toolComponents: Record<string, ComponentType> = {
  /* calculadoras */
  "calculadora-de-porcentagem": C.Porcentagem,
  "calculadora-de-desconto": C.Desconto,
  "juros-simples": C.JurosSimples,
  "juros-compostos": C.JurosCompostos,
  "regra-de-tres": C.RegraDeTres,
  "calculadora-de-imc": C.IMC,
  "calculadora-de-agua": C.Agua,
  "media-ponderada": C.MediaPonderada,
  "margem-de-lucro": C.Margem,
  markup: C.Markup,
  "simulador-de-financiamento": C.Financiamento,
  "calculadora-de-roi": C.ROI,
  "aumento-percentual": C.AumentoPercentual,
  "divisao-de-conta": C.DivisaoConta,
  "meta-de-economia": C.MetaEconomia,
  "consumo-de-combustivel": C.Combustivel,
  "etanol-ou-gasolina": C.EtanolGasolina,
  "calculadora-de-horas": C.Horas,
  "valor-hora": C.ValorHora,
  /* datas */
  "calculadora-de-idade": C.Idade,
  "diferenca-entre-datas": C.DiferencaDatas,
  "somar-dias-a-data": C.SomarDias,
  "dia-da-semana": C.DiaSemana,
  "contagem-regressiva": C.Contagem,
  "dias-uteis": C.DiasUteis,
  /* conversores */
  "conversor-de-temperatura": V.Temperatura,
  "conversor-de-comprimento": V.Comprimento,
  "conversor-de-peso": V.Peso,
  "conversor-de-velocidade": V.Velocidade,
  "conversor-de-area": V.Area,
  "conversor-de-volume": V.Volume,
  "conversor-de-dados": V.Dados,
  "tempo-de-download": V.TempoDownload,
  "conversor-de-base": V.BaseNumerica,
  "numeros-romanos": V.Romanos,
  "conversor-de-cores": V.Cores,
  "px-para-rem": V.PxRem,
  "timestamp-unix": V.Timestamp,
  "codificador-base64": V.Base64,
  "url-encode": V.UrlEncode,
  "formatador-json": V.JsonFormat,
  "texto-para-binario": V.TextoBinario,
  /* texto */
  "contador-de-palavras": T.ContadorPalavras,
  "contador-de-caracteres": T.ContadorCaracteres,
  "maiusculas-e-minusculas": T.MaiusculasMinusculas,
  "remover-acentos": T.RemoverAcentos,
  "limpar-espacos": T.LimparEspacos,
  "inverter-texto": T.InverterTexto,
  "remover-linhas-duplicadas": T.RemoverDuplicadas,
  "ordenar-linhas": T.OrdenarLinhas,
  "gerador-de-slug": T.GeradorSlug,
  "frequencia-de-palavras": T.FrequenciaPalavras,
  "extrair-emails-e-links": T.ExtrairDados,
  "lorem-ipsum": T.LoremIpsum,
  "comparar-textos": T.CompararTextos,
  /* geradores */
  "gerador-de-senha": G.Senha,
  "gerador-de-qr-code": G.QR,
  "gerador-de-uuid": G.UUID,
  "gerador-de-hash": G.Hash,
  "gerador-de-paleta": G.Paleta,
  sorteador: G.Sorteador,
  "gerador-de-numero-aleatorio": G.NumeroAleatorio,
  "gerador-de-nome-de-usuario": G.NomeUsuario,
  /* ia */
  "prompt-builder": PromptBuilder,
  "estimador-de-tokens": A.Tokens,
  "resumidor-de-texto": A.Resumidor,
  "gerador-de-titulos": A.Titulos,
  "gerador-de-hashtags": A.Hashtags,
  "gerador-de-bio": A.Bio,
  legibilidade: A.Legibilidade,
  "reescritor-de-tom": A.Tom,
  "perguntas-de-entrevista": A.Entrevista,
  /* produtividade */
  pomodoro: P.Pomodoro,
  cronometro: P.Cronometro,
  "lista-de-tarefas": P.Tarefas,
  "notas-rapidas": P.Notas,
  "tempo-de-leitura": P.TempoLeitura,
  "roda-de-decisao": P.Roda,
};

export const wideTools = new Set(["prompt-builder", "gerador-de-qr-code", "comparar-textos", "formatador-json"]);
