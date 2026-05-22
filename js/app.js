import {
    getContactById,
    deleteContact,
    deleteContacts,
    updateContact,
    setEditMode,
    setPendingDeleteId,
} from "./services/contactServices.js";
import { openModal } from "./UI/modalRenderer.js";

export function initApp() {
    const contactList     = document.getElementById("contactList");
    const modalDelete     = document.getElementById("modalDelete");
    const modalDeleteDesc = document.getElementById("modalDeleteDesc");

    contactList.addEventListener("click", async (e) => {
        const editBtn   = e.target.closest(".btn-edit");
        const deleteBtn = e.target.closest(".btn-delete");

        if (editBtn) {
            const id      = String(editBtn.dataset.id);
            const contact = await getContactById(id);
            if (!contact) return;
            setEditMode(contact);
        }

        if (deleteBtn) {
            const id      = String(deleteBtn.dataset.id);
            const contact = await getContactById(id);
            if (!contact) return;
            setPendingDeleteId(id);
            modalDeleteDesc.textContent =
                `Supprimer ${contact.firstName} ${contact.lastName} ? Cette action est irréversible.`;
            openModal(modalDelete);
        }
    });
}