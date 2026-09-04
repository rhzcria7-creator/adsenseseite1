import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, HashRouter } from "react-router-dom";
import "./index.css";
import App from "./App";
import { StoreProvider } from "./lib/store";

/**
 * Routing mode.
 * - "hash": works on any static host without rewrites (default; safe for single-file preview).
 * - "browser": clean URLs (/ferramentas/porcentagem). Requires SPA rewrites — vercel.json is included.
 * Switch by setting VITE_ROUTER=browser at build time on Vercel.
 */
const Router = import.meta.env.VITE_ROUTER === "browser" ? BrowserRouter : HashRouter;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Router>
      <StoreProvider>
        <App />
      </StoreProvider>
    </Router>
  </StrictMode>,
);
