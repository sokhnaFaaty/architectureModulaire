// ── app.js — Point d'entrée ───────────────────────────────────────────────────
// Orchestre les modules sans créer de cycle.
// Arbre d'imports :
//   app.js
//   ├── contactServices.js  (importe store, elements, messageRenderer)
//   └── modalRenderer.js    (importe elements, messageRenderer, contactServices)

import {
    contactList,
    modalDelete, modalDeleteDesc,
} from "./DOM/elements.js";
import {
    getContactById,
    setEditMode,
    setPendingDeleteId,
} from "./services/contactServices.js";
import { openModal } from "./UI/modalRenderer.js";

// DÉLÉGATION — boutons Modifier / Supprimer sur les cartes

contactList.addEventListener("click", (e) => {
    const editBtn   = e.target.closest(".btn-edit");
    const deleteBtn = e.target.closest(".btn-delete");

    // ── MODIFIER ──
    if (editBtn) {
        const id      = Number(editBtn.dataset.id);
        const contact = getContactById(id);
        if (!contact) return;
        setEditMode(contact);
    }

    // ── SUPPRIMER (ouvre le modal) ──
    if (deleteBtn) {
        const id      = Number(deleteBtn.dataset.id);
        const contact = getContactById(id);
        if (!contact) return;
        setPendingDeleteId(id);
        modalDeleteDesc.textContent =
            `Supprimer ${contact.firstName} ${contact.lastName} ? Cette action est irréversible.`;
        openModal(modalDelete);
    }
});