import { loginUser } from "../services/authServices.js";
import { showToast }  from "../UI/messageRenderer.js";
import { navigate }   from "../router.js";

export function renderLogin(app) {

  app.innerHTML = `
  <div class="toast-container" id="toastContainer"></div>  
    <div class="login-wrapper">
      <div class="login-card">
        <div class="login-header">
          <div class="brand">
            <span class="brand-dot"></span>
            <span class="brand-name">Contacts</span>
          </div>
          <p class="login-sub">Connectez-vous pour continuer</p>
        </div>

        <form id="loginForm" novalidate>
          <div class="field">
            <label for="loginInput">Identifiant</label>
            <input type="text" id="loginInput" placeholder="Ex: admin" />
            <span class="field-error" id="err-login"></span>
          </div>
          <div class="field">
            <label for="passwordInput">Mot de passe</label>
            <input type="password" id="passwordInput" placeholder="••••••••" />
            <span class="field-error" id="err-password"></span>
          </div>
          <button type="submit" class="btn-submit" style="width:100%">
            Se connecter
          </button>
        </form>
      </div>
    </div>
  `;

 const form     = document.getElementById("loginForm");
  const loginEl  = document.getElementById("loginInput");
   const passEl   = document.getElementById("passwordInput");
  const errLogin = document.getElementById("err-login");
  const errPass  = document.getElementById("err-password");
  

  // ÉTAPE 3 — on écoute la soumission
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errLogin.textContent = errPass.textContent = "";

    const login    = loginEl.value.trim();
    const password = passEl.value.trim();

    // Validation basique
    if (!login)    { errLogin.textContent = "Identifiant requis."; return; }
    if (!password) { errPass.textContent  = "Mot de passe requis."; return; }

    // Appel au service → json-server vérifie les identifiants
    const user = await loginUser({ login, password });

    if (!user) {
      errLogin.textContent = "Identifiants incorrects.";
      return;
    }

    // Succès → toast + redirection
    showToast("success", "Bienvenue !", `Connecté en tant que ${user.login}.`);
    navigate("/contacts");
  });
}