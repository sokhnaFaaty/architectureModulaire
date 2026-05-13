import {
    getContacts,
    saveContact,
    updateContact  as updateContactInStore,
    deleteContact  as deleteContactInStore,
    deleteContacts as deleteContactsInStore,
} from "../stores/contactStores.js";

import {
    form, editIdInput, firstNameEl, lastNameEl, emailEl, phoneEl, roleEl,
    submitLabel, cancelBtn, contactList, listCount, emptyState,
    searchInput, paginationEl,
} from "../DOM/elements.js";
import { showToast } from "../UI/messageRenderer.js";
import{cardTemplate} from "../UI/card.js";
import{
    renderList,getTotalPages,getFiltered,setCurrentPage,setSearchQuery
}from "../UI/pagination.js"

import {
    validateForm
}from"../validations/validation.js"
import { dateFormater } from "../utils/dateFormater.js";
// ── Constantes
// const PER_PAGE    = 6;


// ── État partage (exporté pour modalRenderer et app) 
// export let currentPage     = 1;
// export let searchQuery     = "";
export let selectedIds     = new Set();
export let pendingDeleteId = null;
export function setPendingDeleteId(id) { pendingDeleteId = id; }
// export let pendingDeleteId = null;

// export function setCurrentPage(p)     { currentPage     = p; }
// export function setSearchQuery(q)     { searchQuery     = q; }
// export function setPendingDeleteId(id){ pendingDeleteId = id; }

// HELPERS FILTRE / PAGINATION

// export async function getFiltered() {
//     const contacts=await getContacts()
//     const q = searchQuery.trim().toLowerCase();
//     if (!q) return contacts;
//     return contacts.filter((c) =>
//         `${c.firstName} ${c.lastName} ${c.email} ${c.phone} ${c.role}`
//             .toLowerCase()
//             .includes(q)
//     );
// }

// export function getTotalPages(filtered) {
//     return Math.max(1, Math.ceil(filtered.length / PER_PAGE));
// }

// export function getPageSlice(filtered) {
//     const start = (currentPage - 1) * PER_PAGE;
//     return filtered.slice(start, start + PER_PAGE);
// }

// RENDU LISTE

// export async function renderList() {
//     const filtered   = await getFiltered();
//     const totalPages = getTotalPages(filtered);

//     if (currentPage > totalPages) currentPage = totalPages;

//     const slice = getPageSlice(filtered);

//     contactList.innerHTML = "";

//     const total =(await getContacts()).length;
//     listCount.textContent = `${total} contact${total > 1 ? "s" : ""}`;

//     if (filtered.length === 0) {
//         emptyState.classList.remove("hidden");
//     } else {
//         emptyState.classList.add("hidden");
//         slice.forEach((c) => contactList.appendChild(createCard(c)));
//     }

//     renderPagination(filtered.length, totalPages);

//     // Importer updateSelectionUI dynamiquement pour éviter le cycle
//     import("../UI/modalRenderer.js").then(({ updateSelectionUI }) => updateSelectionUI());
// }

// export function renderPagination(total, totalPages) {
//     paginationEl.innerHTML = "";
//     if (total <= PER_PAGE) return;

//     const prev = document.createElement("button");
//     prev.className = "page-btn";
//     prev.textContent = "←";
//     prev.disabled = currentPage === 1;
//     prev.addEventListener("click", async () => { currentPage--; await renderList(); });
//     paginationEl.appendChild(prev);

//     for (let i = 1; i <= totalPages; i++) {
//         const btn = document.createElement("button");
//         btn.className = "page-btn" + (i === currentPage ? " active" : "");
//         btn.textContent = i;
//         btn.addEventListener("click", async() => { currentPage = i;await renderList(); });
//         paginationEl.appendChild(btn);
//     }

//     const next = document.createElement("button");
//     next.className = "page-btn";
//     next.textContent = "→";
//     next.disabled = currentPage === totalPages;
//     next.addEventListener("click", async() => { currentPage++; await renderList(); });
//     paginationEl.appendChild(next);
// }

// CRUD

export async function createContact(data) {
   // const contacts = await getContacts();
    const contact = {
        firstName: data.firstName.trim(),
        lastName:  data.lastName.trim(),
        email:     data.email.trim().toLowerCase(),
        phone:     data.phone.trim(),
        role:      data.role,
        createdAt: dateFormater(),
    };
    //  json-server me retourne le contact créé avec son vrai id

   return await saveContact(contact);
}

export async function updateContact(id, data) {
    return await updateContactInStore(id, data);
}

export async function deleteContact(id) {
    return await deleteContactInStore(id);
}

export async function deleteContacts(ids) {
    return await deleteContactsInStore(ids);
}

export async  function getContactById(id) {
    const contacts=await getContacts();
    return contacts.find((c) => c.id === String(id))|| null;
}





export function showErrors(errors) {
    clearErrors();
    const fields = ["firstName", "lastName", "email", "phone", "role"];
    fields.forEach((f) => {
        const errEl   = document.getElementById(`err-${f}`);
        const inputEl = document.getElementById(f);
        if (errors[f]) {
            errEl.textContent = errors[f];
            inputEl.classList.add("invalid");
        }
    });
    const first = fields.find((f) => errors[f]);
    if (first) document.getElementById(first).focus();
}

export function clearErrors() {
    ["firstName", "lastName", "email", "phone", "role"].forEach((f) => {
        document.getElementById(`err-${f}`).textContent = "";
        document.getElementById(f).classList.remove("invalid");
    });
}

// Effacer l'erreur au focus
["firstName", "lastName", "email", "phone", "role"].forEach((f) => {
    document.getElementById(f).addEventListener("input", () => {
        document.getElementById(`err-${f}`).textContent = "";
        document.getElementById(f).classList.remove("invalid");
    });
});

// FORMULAIRE — état ajout / édition

export function setEditMode(contact) {
    editIdInput.value       = contact.id;
    firstNameEl.value       = contact.firstName;
    lastNameEl.value        = contact.lastName;
    emailEl.value           = contact.email;
    phoneEl.value           = contact.phone;
    roleEl.value            = contact.role;
    submitLabel.textContent = "Mettre à jour";
    cancelBtn.classList.add("visible");
    clearErrors();

    document.querySelectorAll(".contact-card").forEach((el) => {
        el.classList.toggle("editing", String(el.dataset.id) === contact.id);
    });

    document.querySelector(".panel-form").scrollTo({ top: 0, behavior: "smooth" });
    firstNameEl.focus();
}

export function resetForm() {
    form.reset();
    editIdInput.value       = "";
    submitLabel.textContent = "Ajouter";
    cancelBtn.classList.remove("visible");
    clearErrors();
    document.querySelectorAll(".contact-card.editing").forEach((el) => {
        el.classList.remove("editing");
    });
}

cancelBtn.addEventListener("click", () => resetForm());

// SOUMISSION — CREATE + UPDATE

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
        firstName: firstNameEl.value,
        lastName:  lastNameEl.value,
        email:     emailEl.value,
        phone:     phoneEl.value,
        role:      roleEl.value,
    };

    const errors     = validateForm(data);
    const id         = editIdInput.value;
    const allContacts = await getContacts();

    const isDuplicateEmail = allContacts.find(
        (c) => c.email === data.email.trim().toLowerCase() && c.id !== String(id)
    );
    const isDuplicatePhone = allContacts.find(
        (c) => c.phone === data.phone.trim() && c.id !== String(id)
    );

    if (isDuplicateEmail) errors.email = "Cet email est déjà utilisé.";
    else if (isDuplicatePhone) errors.phone = "Ce numéro de téléphone est déjà utilisé.";

    if (Object.keys(errors).length > 0) {
        showErrors(errors);
        return;
    }

    clearErrors();

    if (id) {
        const updated = await updateContact(String(id), data);
        resetForm();
      await  renderList();
        showToast("success", "Contact mis à jour",
            `${updated.firstName} ${updated.lastName} a été modifié avec succès.`);
    } else {
        const created = await createContact(data);
        resetForm();
        setCurrentPage(getTotalPages(await getFiltered()));
      await  renderList();
        showToast("success", "Contact ajouté",
            `${created.firstName} ${created.lastName} a été ajouté avec succès.`);
    }
});

// RECHERCHE

searchInput.addEventListener("input",async () => {
    setSearchQuery(searchInput.value)
    //searchQuery = searchInput.value;
    setCurrentPage(1)
   // currentPage = 1;
   await renderList();
});

// CARTE

export function initials(f, l) {
    return ((f[0] || "") + (l[0] || "")).toUpperCase();
}

export function createCard(contact) {
    const li = document.createElement("li");
    li.className = "contact-card" + (selectedIds.has(contact.id) ? " selected" : "");
    li.dataset.id = contact.id;

    li.innerHTML = cardTemplate(contact);

    return li;
}

//init
renderList();