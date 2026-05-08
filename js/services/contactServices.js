// ── Services contacts 
// Dépendances : contactStore.js, elements.js, messageRenderer.js
import { getContacts, saveContacts } from "../stores/contactStores.js";
import {
    form, editIdInput, firstNameEl, lastNameEl, emailEl, phoneEl, roleEl,
    submitLabel, cancelBtn, contactList, listCount, emptyState,
    searchInput, paginationEl,
} from "../DOM/elements.js";
import { showToast } from "../UI/messageRenderer.js";

// ── Constantes
const PER_PAGE    = 6;
const PHONE_REGEX = /^(70|71|75|76|77|78)\d{7}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ── État partage (exporté pour modalRenderer et app) 
export let currentPage     = 1;
export let searchQuery     = "";
export let selectedIds     = new Set();
export let pendingDeleteId = null;

export function setCurrentPage(p)     { currentPage     = p; }
export function setSearchQuery(q)     { searchQuery     = q; }
export function setPendingDeleteId(id){ pendingDeleteId = id; }

// HELPERS FILTRE / PAGINATION

export function getFiltered() {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return getContacts();
    return getContacts().filter((c) =>
        `${c.firstName} ${c.lastName} ${c.email} ${c.phone} ${c.role}`
            .toLowerCase()
            .includes(q)
    );
}

export function getTotalPages(filtered) {
    return Math.max(1, Math.ceil(filtered.length / PER_PAGE));
}

export function getPageSlice(filtered) {
    const start = (currentPage - 1) * PER_PAGE;
    return filtered.slice(start, start + PER_PAGE);
}

// RENDU LISTE

export function renderList() {
    const filtered   = getFiltered();
    const totalPages = getTotalPages(filtered);

    if (currentPage > totalPages) currentPage = totalPages;

    const slice = getPageSlice(filtered);

    contactList.innerHTML = "";

    const total = getContacts().length;
    listCount.textContent = `${total} contact${total > 1 ? "s" : ""}`;

    if (filtered.length === 0) {
        emptyState.classList.remove("hidden");
    } else {
        emptyState.classList.add("hidden");
        slice.forEach((c) => contactList.appendChild(createCard(c)));
    }

    renderPagination(filtered.length, totalPages);

    // Importer updateSelectionUI dynamiquement pour éviter le cycle
    import("../UI/modalRenderer.js").then(({ updateSelectionUI }) => updateSelectionUI());
}

export function renderPagination(total, totalPages) {
    paginationEl.innerHTML = "";
    if (total <= PER_PAGE) return;

    const prev = document.createElement("button");
    prev.className = "page-btn";
    prev.textContent = "←";
    prev.disabled = currentPage === 1;
    prev.addEventListener("click", () => { currentPage--; renderList(); });
    paginationEl.appendChild(prev);

    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement("button");
        btn.className = "page-btn" + (i === currentPage ? " active" : "");
        btn.textContent = i;
        btn.addEventListener("click", () => { currentPage = i; renderList(); });
        paginationEl.appendChild(btn);
    }

    const next = document.createElement("button");
    next.className = "page-btn";
    next.textContent = "→";
    next.disabled = currentPage === totalPages;
    next.addEventListener("click", () => { currentPage++; renderList(); });
    paginationEl.appendChild(next);
}

// CRUD

export function createContact(data) {
    const contacts = getContacts();
    const contact = {
        id:        Date.now(),
        firstName: data.firstName.trim(),
        lastName:  data.lastName.trim(),
        email:     data.email.trim().toLowerCase(),
        phone:     data.phone.trim(),
        role:      data.role,
        createdAt: new Date().toLocaleDateString("fr-FR", {
            day: "2-digit", month: "short", year: "numeric",
        }),
    };
    contacts.push(contact);
    saveContacts(contacts);
    return contact;
}

export function getContactById(id) {
    return getContacts().find((c) => c.id === id) || null;
}

export function updateContact(id, data) {
    const contacts = getContacts();
    const i = contacts.findIndex((c) => c.id === id);
    if (i === -1) return null;
    contacts[i] = {
        ...contacts[i],
        firstName: data.firstName.trim(),
        lastName:  data.lastName.trim(),
        email:     data.email.trim().toLowerCase(),
        phone:     data.phone.trim(),
        role:      data.role,
    };
    saveContacts(contacts);
    return contacts[i];
}

export function deleteContact(id) {
    saveContacts(getContacts().filter((c) => c.id !== id));
}

export function deleteContacts(ids) {
    saveContacts(getContacts().filter((c) => !ids.has(c.id)));
}

// VALIDATION

export function validateForm(data) {
    const errors = {};

    if (!data.firstName.trim())
        errors.firstName = "Le prénom est requis.";
    if (!data.lastName.trim())
        errors.lastName = "Le nom est requis.";
    if (!data.email.trim())
        errors.email = "L'email est requis.";
    else if (!EMAIL_REGEX.test(data.email.trim()))
        errors.email = "Format invalide. Ex: nom@domaine.com";
    if (!data.phone.trim())
        errors.phone = "Le numéro est requis.";
    else if (!PHONE_REGEX.test(data.phone.trim()))
        errors.phone = "Format invalide. Ex: 771234567 (70/71/75/76/77/78 + 7 chiffres)";
    if (!data.role)
        errors.role = "Veuillez choisir un rôle.";

    return errors;
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
        el.classList.toggle("editing", Number(el.dataset.id) === contact.id);
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

form.addEventListener("submit", (e) => {
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
    const allContacts = getContacts();

    const isDuplicateEmail = allContacts.find(
        (c) => c.email === data.email.trim().toLowerCase() && c.id !== Number(id)
    );
    const isDuplicatePhone = allContacts.find(
        (c) => c.phone === data.phone.trim() && c.id !== Number(id)
    );

    if (isDuplicateEmail) errors.email = "Cet email est déjà utilisé.";
    else if (isDuplicatePhone) errors.phone = "Ce numéro de téléphone est déjà utilisé.";

    if (Object.keys(errors).length > 0) {
        showErrors(errors);
        return;
    }

    clearErrors();

    if (id) {
        const updated = updateContact(Number(id), data);
        resetForm();
        renderList();
        showToast("success", "Contact mis à jour",
            `${updated.firstName} ${updated.lastName} a été modifié avec succès.`);
    } else {
        const created = createContact(data);
        resetForm();
        currentPage = getTotalPages(getFiltered());
        renderList();
        showToast("success", "Contact ajouté",
            `${created.firstName} ${created.lastName} a été ajouté avec succès.`);
    }
});

// RECHERCHE

searchInput.addEventListener("input", () => {
    searchQuery = searchInput.value;
    currentPage = 1;
    renderList();
});

// CARTE

export function initials(f, l) {
    return ((f[0] || "") + (l[0] || "")).toUpperCase();
}

export function createCard(contact) {
    const li = document.createElement("li");
    li.className = "contact-card" + (selectedIds.has(contact.id) ? " selected" : "");
    li.dataset.id = contact.id;

    li.innerHTML = `
        <input type="checkbox" class="card-checkbox" data-id="${contact.id}"
               ${selectedIds.has(contact.id) ? "checked" : ""} title="Sélectionner" />
        <div class="card-top">
            <div class="card-avatar">${initials(contact.firstName, contact.lastName)}</div>
            <div>
                <div class="card-name">${contact.firstName} ${contact.lastName}</div>
                <div class="card-role">${contact.role}</div>
            </div>
        </div>
        <div class="card-info">
            <div class="card-info-row"><span>@</span>${contact.email}</div>
            <div class="card-info-row"><span>☏</span>${contact.phone}</div>
            <div class="card-info-row"><span>↗</span>Ajouté le ${contact.createdAt}</div>
        </div>
        <div class="card-actions">
            <button class="btn-edit" data-id="${contact.id}">Modifier</button>
            <button class="btn-delete" data-id="${contact.id}">Supprimer</button>
        </div>
    `;

    return li;
}

//init
renderList();