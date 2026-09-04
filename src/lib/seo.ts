import { useEffect } from "react";

export const SITE_NAME = "Nexo";
export const SITE_URL = "https://nexo.app";

interface SEOOptions {
  title: string; description: string; path?: string; type?: "website" | "article";
  keywords?: string[]; publishedAt?: string; noindex?: boolean;
  breadcrumbs?: { label: string; path: string }[];
}

function upsertMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) { el = document.createElement("meta"); el.setAttribute(attr, key); document.head.appendChild(el); }
  el.setAttribute("content", content);
}
function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) { el = document.createElement("link"); el.setAttribute("rel", rel); document.head.appendChild(el); }
  el.setAttribute("href", href);
}
function upsertLd(id: string, data: unknown) {
  let ld = document.getElementById(id) as HTMLScriptElement | null;
  if (!ld) { ld = document.createElement("script"); ld.type = "application/ld+json"; ld.id = id; document.head.appendChild(ld); }
  ld.textContent = JSON.stringify(data);
}

/** SEO client-side: title, description, OG, canonical, JSON-LD (WebPage/Article + BreadcrumbList). */
export function useSEO(opts: SEOOptions) {
  const { title, description, path = "", type = "website", keywords, publishedAt, noindex, breadcrumbs } = opts;
  const keywordKey = keywords?.join(",") ?? "";
  const crumbKey = breadcrumbs?.map((b) => b.path).join("|") ?? "";
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
    upsertMeta("name", "twitter:title", fullTitle);
    upsertMeta("name", "twitter:description", description);
    upsertLink("canonical", url);
    upsertLd("ld-json", type === "article"
      ? { "@context": "https://schema.org", "@type": "Article", headline: title, description, url, datePublished: publishedAt, publisher: { "@type": "Organization", name: SITE_NAME } }
      : { "@context": "https://schema.org", "@type": "WebPage", name: fullTitle, description, url });
    if (breadcrumbs?.length) {
      upsertLd("ld-breadcrumbs", { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: breadcrumbs.map((b, i) => ({ "@type": "ListItem", position: i + 1, name: b.label, item: `${SITE_URL}${b.path}` })) });
    }
  }, [title, description, path, type, keywordKey, publishedAt, noindex, crumbKey]); // eslint-disable-line react-hooks/exhaustive-deps
}
