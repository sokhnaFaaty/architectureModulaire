import { isAuthenticated } from "./services/authServices.js";
import { renderLogin }     from "./views/login.js";
import { renderContacts }  from "./views/contact.js";

const app = document.getElementById("app"); // mon seul div bissi html bi

// Table des routes : chemin fonction qui affiche la vue
const routes = {
  "/login"   : () => renderLogin(app),
  "/contacts": () => renderContacts(app),
};

// La garde : redirige si accès non autorisé
function guard(path) {
  if (path === "/contacts" && !isAuthenticated()) return "/login";
  if (path === "/login"    &&  isAuthenticated()) return "/contacts";
  return path;
}

// navigate() — la fonction principale, exportée pour être utilisée partout
export function navigate(path) {
  const safePath = guard(path);
  window.history.pushState({}, "", safePath); // change l'URL sans recharger
  const render = routes[safePath];
  if (render) render();
  else navigate("/login");
}

// Bouton ← du navigateur
window.addEventListener("popstate", () => navigate(window.location.pathname));

// moment de demarrage il lit l'URL actuelle et affiche la bonne vue
export function initRouter() {
  navigate(window.location.pathname);
}