import { useEffect } from "react";

export const SITE_NAME = "Nexo";
export const SITE_URL = "https://nexo.app";

interface SEOOptions {
  title: string;
  description: string;
  path?: string;
  type?: "website" | "article";
  keywords?: string[];
  publishedAt?: string;
  noindex?: boolean;
}

function upsertMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

/**
 * Client-side SEO: updates <title>, description, Open Graph, canonical and JSON-LD.
 * When a server/prerender layer is added, the same options can feed it.
 */
export function useSEO(opts: SEOOptions) {
  const { title, description, path = "", type = "website", keywords, publishedAt, noindex } = opts;
  const keywordKey = keywords?.join(",") ?? "";
  useEffect(() => {
    const fullTitle = title.includes(SITE_NAME) ? title : `${title} — ${SITE_NAME}`;
    document.title = fullTitle;
    const url = `${SITE_URL}${path}`;
    upsertMeta("name", "description", description);
    upsertMeta("name", "robots", noindex ? "noindex, nofollow" : "index, follow");
    if (keywordKey) upsertMeta("name", "keywords", keywordKey.split(",").join(", "));
    upsertMeta("property", "og:title", fullTitle);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:type", type);
    upsertMeta("property", "og:url", url);
    upsertMeta("property", "og:site_name", SITE_NAME);
    upsertMeta("property", "og:locale", "pt_BR");
    upsertMeta("name", "twitter:title", fullTitle);
    upsertMeta("name", "twitter:description", description);
    upsertLink("canonical", url);

    let ld = document.getElementById("ld-json") as HTMLScriptElement | null;
    if (!ld) {
      ld = document.createElement("script");
      ld.type = "application/ld+json";
      ld.id = "ld-json";
      document.head.appendChild(ld);
    }
    const schema =
      type === "article"
        ? { "@context": "https://schema.org", "@type": "Article", headline: title, description, url, datePublished: publishedAt, publisher: { "@type": "Organization", name: SITE_NAME } }
        : { "@context": "https://schema.org", "@type": "WebPage", name: fullTitle, description, url };
    ld.textContent = JSON.stringify(schema);
  }, [title, description, path, type, keywordKey, publishedAt, noindex]);
}
