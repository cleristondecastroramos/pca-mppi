import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Auto-recover from stale chunk errors after a new deploy.
// When index.html references chunk hashes that no longer exist,
// dynamic import() rejects with "Failed to fetch dynamically imported module".
// We reload once to pick up the fresh index.html + new chunk hashes.
const RELOAD_FLAG = "__chunk_reload_attempted__";
function isChunkLoadError(msg?: string) {
  if (!msg) return false;
  return (
    msg.includes("Failed to fetch dynamically imported module") ||
    msg.includes("Importing a module script failed") ||
    msg.includes("error loading dynamically imported module")
  );
}
function handleChunkError(msg?: string) {
  if (!isChunkLoadError(msg)) return;
  if (sessionStorage.getItem(RELOAD_FLAG)) return;
  sessionStorage.setItem(RELOAD_FLAG, "1");
  window.location.reload();
}
window.addEventListener("error", (e) => handleChunkError(e?.message));
window.addEventListener("unhandledrejection", (e) => {
  const reason: any = e?.reason;
  handleChunkError(typeof reason === "string" ? reason : reason?.message);
});
// Clear the flag once the app has successfully booted.
window.addEventListener("load", () => sessionStorage.removeItem(RELOAD_FLAG));

createRoot(document.getElementById("root")!).render(<App />);
