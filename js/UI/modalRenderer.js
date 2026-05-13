// ── Modals & Sélection 
// Dépendances : elements.js, messageRenderer.js, contactServices.js
import {
    modalDelete, modalDeleteDesc, modalDeleteCancel, modalDeleteConfirm,
    modalDeleteMulti, modalDeleteMultiDesc, modalDeleteMultiCancel, modalDeleteMultiConfirm,
    contactList, selectAllChk, deleteSelBtn, selCountEl,    editIdInput,

} from "../DOM/elements.js";
import { showToast } from "./messageRenderer.js";
import {
    selectedIds, pendingDeleteId, setPendingDeleteId,
    deleteContact, deleteContacts, getContactById,
    resetForm
} from "../services/contactServices.js";
import{
    renderList, setCurrentPage,getFiltered, getPageSlice,getTotalPages

}from "../UI/pagination.js"

// HELPERS MODAL

export function openModal(overlay)  { overlay.classList.add("open");    }
export function closeModal(overlay) { overlay.classList.remove("open"); }

// Fermer en cliquant sur l'overlay
[modalDelete, modalDeleteMulti].forEach((overlay) => {
    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) closeModal(overlay);
    });
});

// SÉLECTION

export async function updateSelectionUI() {
    const count = selectedIds.size;
    selCountEl.textContent = count;
    deleteSelBtn.disabled  = count < 3;

    const visibleIds = getPageSlice(await getFiltered()).map((c) => c.id);
    const allChecked = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.has(id));
    selectAllChk.checked       = allChecked;
    selectAllChk.indeterminate = !allChecked && visibleIds.some((id) => selectedIds.has(id));
}

// Délégation — checkbox sur chaque carte
contactList.addEventListener("change", (e) => {
    const chk = e.target.closest(".card-checkbox");
    if (!chk) return;
    const id = String(chk.dataset.id);
    if (chk.checked) selectedIds.add(id);
    else             selectedIds.delete(id);

    chk.closest(".contact-card").classList.toggle("selected", chk.checked);
    updateSelectionUI();
});

// "Tout sélectionner" — uniquement la page courante
selectAllChk.addEventListener("change",async () => {
    const visibleIds = getPageSlice(await getFiltered()).map((c) => c.id);
    if (selectAllChk.checked) visibleIds.forEach((id) => selectedIds.add(id));
    else                      visibleIds.forEach((id) => selectedIds.delete(id));
    await renderList();
});

// SUPPRESSION GROUPÉE

deleteSelBtn.addEventListener("click", () => {
    if (selectedIds.size < 3) return;
    const count = selectedIds.size;
    modalDeleteMultiDesc.textContent =
        `Vous allez supprimer ${count} contact${count > 1 ? "s" : ""}. Cette action est irréversible.`;
    openModal(modalDeleteMulti);
});

modalDeleteMultiCancel.addEventListener("click", () => closeModal(modalDeleteMulti));

modalDeleteMultiConfirm.addEventListener("click",async () => {
    const count = selectedIds.size;
    await deleteContacts(new Set(selectedIds));
    selectedIds.clear();
    closeModal(modalDeleteMulti);
    setCurrentPage(1);
   await renderList();
    showToast("danger", "Contacts supprimés", `${count} contacts ont été supprimés.`);
});

// SUPPRESSION SIMPLE

modalDeleteCancel.addEventListener("click", () => {
    closeModal(modalDelete);
    setPendingDeleteId(null);
});

modalDeleteConfirm.addEventListener("click",async () => {
    const pid =pendingDeleteId;
        if (!pid) return;
        const contact = await getContactById(pid);
        const name    = contact ? `${contact.firstName} ${contact.lastName}` : "le contact";
        await deleteContact(pid);
        selectedIds.delete(pid);

        // Si on supprimait la carte en cours d'édition → reset formulaire
        if (String(editIdInput.value) === pid) resetForm();

        setPendingDeleteId(null);
        closeModal(modalDelete);
        await renderList();
        showToast("danger", "Contact supprimé", `${name} a été supprimé avec succès.`);
    });