import { logoutUser, getCurrentUser } from "../services/authServices.js";
import { navigate }                  from "../router.js";
import { initContactServices } from "../services/contactServices.js";
import { renderList }                from "../UI/pagination.js";

 import { initApp } from "../app.js";
import { initModalRenderer } from "../UI/modalRenderer.js";

export function renderContacts(app) {
  const user = getCurrentUser();

  app.innerHTML = `
    <!-- Toast -->
    <div class="toast-container" id="toastContainer"></div>

    <!-- Modals (identiques à votre index.html actuel) -->
    <div class="modal-overlay" id="modalDelete">
    <div class="modal">
        <div class="modal-icon modal-icon--danger">✕</div>
        <h3 class="modal-title">Supprimer ce contact ?</h3>
        <p class="modal-desc" id="modalDeleteDesc">Cette action est irréversible.</p>
        <div class="modal-actions">
            <button class="btn-modal-cancel" id="modalDeleteCancel">Annuler</button>
            <button class="btn-modal-confirm btn-modal-confirm--danger" id="modalDeleteConfirm">Supprimer</button>
        </div>
    </div>
    </div>
    <div class="modal-overlay" id="modalDeleteMulti"> 
    <div class="modal">
        <div class="modal-icon modal-icon--danger">✕</div>
        <h3 class="modal-title">Supprimer la sélection ?</h3>
        <p class="modal-desc" id="modalDeleteMultiDesc">Cette action est irréversible.</p>
        <div class="modal-actions">
            <button class="btn-modal-cancel" id="modalDeleteMultiCancel">Annuler</button>
            <button class="btn-modal-confirm btn-modal-confirm--danger" id="modalDeleteMultiConfirm">Supprimer</button>
        </div>
    </div>
    </div>

    <!-- Header avec déconnexion -->
    <div class="app-header">
      <div class="brand">
        <span class="brand-dot"></span>
        <span class="brand-name">Contacts</span>
      </div>
      <div class="header-right">
        <span class="header-user">👤 ${user?.login ?? ""}</span>
        <button class="btn-logout" id="logoutBtn">Déconnexion</button>
      </div>
    </div>

    <!-- Layout existant -->
    <div class="layout">
      <aside class="panel-form"><div class="panel-header">
            <div class="brand">
                <span class="brand-dot"></span>
                <span class="brand-name">Contacts</span>
            </div>
            <p class="panel-sub">Gérez vos contacts localement</p>
        </div>

        <form id="contactForm" novalidate>
            <input type="hidden" id="editId" />

            <div class="field">
                <label for="firstName">Prénom <span class="req">*</span></label>
                <input type="text" id="firstName" placeholder="Ex: Moussa" autocomplete="off" />
                <span class="field-error" id="err-firstName"></span>
            </div>

            <div class="field">
                <label for="lastName">Nom <span class="req">*</span></label>
                <input type="text" id="lastName" placeholder="Ex: Diallo" autocomplete="off" />
                <span class="field-error" id="err-lastName"></span>
            </div>

            <div class="field">
                <label for="email">Email <span class="req">*</span></label>
                <input type="email" id="email" placeholder="Ex: moussa@gmail.com" autocomplete="off" />
                <span class="field-error" id="err-email"></span>
            </div>

            <div class="field">
                <label for="phone">Téléphone <span class="req">*</span></label>
                <input type="text" id="phone" placeholder="Ex: 771234567" autocomplete="off" maxlength="9" />
                <span class="field-hint">Format : 70/71/75/76/77/78 + 7 chiffres</span>
                <span class="field-error" id="err-phone"></span>
            </div>

            <div class="field">
                <label for="role">Rôle <span class="req">*</span></label>
                <select id="role">
                    <option value="">-- Choisir un rôle --</option>
                    <option value="Développeur">Développeur</option>
                    <option value="Designer">Designer</option>
                    <option value="Manager">Manager</option>
                    <option value="Client">Client</option>
                    <option value="Autre">Autre</option>
                </select>
                <span class="field-error" id="err-role"></span>
            </div>

            <div class="form-actions">
                <button type="submit" class="btn-submit" id="submitBtn">
                    <span id="submitLabel">Ajouter</span>
                </button>
                <button type="button" class="btn-cancel" id="cancelBtn">Annuler</button>
            </div>
        </form>
         </aside>
      <main class="panel-list"> 
        <div class="list-header">
        <span class="list-count" id="listCount">0 contact</span>
        <div class="search-wrap">
            <input type="text" id="searchInput" class="search-input" placeholder="Rechercher…" />
        </div>
        <button class="btn-delete-sel" id="deleteSelBtn" disabled>
            Supprimer la sélection (<span id="selCount">0</span>)
        </button>
    </div>
    <div class="multi-bar" id="multiBar">
        <label class="check-label">
            <input type="checkbox" id="selectAllChk" />
            <span>Tout sélectionner</span>
        </label>
        <span class="multi-hint">Cochez au moins 3 contacts pour activer la suppression groupée</span>
    </div>
    <div class="empty-state" id="emptyState">
        <div class="empty-icon">◎</div>
        <p>Aucun contact pour le moment.<br/>Ajoutez-en un depuis le formulaire.</p>
    </div>
    <ul class="contact-list" id="contactList"></ul>
    <div class="pagination" id="pagination"></div>
</main>
      </main>
    </div>
  `;

  initContactServices();
initApp();
initModalRenderer();
renderList();
  // Bouton déconnexion
  document.getElementById("logoutBtn")
    .addEventListener("click", () => {
      logoutUser();
      navigate("/login");
    });
}
