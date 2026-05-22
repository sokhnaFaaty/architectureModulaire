

import {
    getContacts, saveContact,
    updateContact  as updateContactInStore,
    deleteContact  as deleteContactInStore,
    deleteContacts as deleteContactsInStore,
} from "../stores/contactStores.js";

import { showToast }   from "../UI/messageRenderer.js";
import { cardTemplate } from "../UI/card.js";
import { renderList, getTotalPages, getFiltered, setCurrentPage, setSearchQuery } from "../UI/pagination.js";
import { validateForm } from "../validations/validation.js";
import { dateFormater } from "../utils/dateFormater.js";

export let selectedIds     = new Set();
export let pendingDeleteId = null;
export function setPendingDeleteId(id) { pendingDeleteId = id; }

// CRUD
export async function createContact(data) {
    return await saveContact({
        firstName: data.firstName.trim(),
        lastName:  data.lastName.trim(),
        email:     data.email.trim().toLowerCase(),
        phone:     data.phone.trim(),
        role:      data.role,
        createdAt: dateFormater(),
    });
}
export async function updateContact(id, data) { return await updateContactInStore(id, data); }
export async function deleteContact(id)       { return await deleteContactInStore(id); }
export async function deleteContacts(ids)     { return await deleteContactsInStore(ids); }
export async function getContactById(id) {
    const contacts = await getContacts();
    return contacts.find((c) => c.id === String(id)) || null;
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

export function setEditMode(contact) {
    document.getElementById("editId").value              = contact.id;
    document.getElementById("firstName").value           = contact.firstName;
    document.getElementById("lastName").value            = contact.lastName;
    document.getElementById("email").value               = contact.email;
    document.getElementById("phone").value               = contact.phone;
    document.getElementById("role").value                = contact.role;
    document.getElementById("submitLabel").textContent   = "Mettre à jour";
    document.getElementById("cancelBtn").classList.add("visible");
    clearErrors();
    document.querySelectorAll(".contact-card").forEach((el) => {
        el.classList.toggle("editing", String(el.dataset.id) === contact.id);
    });
    document.querySelector(".panel-form").scrollTo({ top: 0, behavior: "smooth" });
    document.getElementById("firstName").focus();
}

export function resetForm() {
    document.getElementById("contactForm").reset();
    document.getElementById("editId").value            = "";
    document.getElementById("submitLabel").textContent = "Ajouter";
    document.getElementById("cancelBtn").classList.remove("visible");
    clearErrors();
    document.querySelectorAll(".contact-card.editing").forEach((el) => {
        el.classList.remove("editing");
    });
}

//cancelBtn.addEventListener("click", () => resetForm());

// // SOUMISSION — CREATE + UPDATE

// form.addEventListener("submit", async (e) => {
//     e.preventDefault();

//     const data = {
//         firstName: firstNameEl.value,
//         lastName:  lastNameEl.value,
//         email:     emailEl.value,
//         phone:     phoneEl.value,
//         role:      roleEl.value,
//     };

//     const errors     = validateForm(data);
//     const id         = editIdInput.value;
//     const allContacts = await getContacts();

//     const isDuplicateEmail = allContacts.find(
//         (c) => c.email === data.email.trim().toLowerCase() && c.id !== String(id)
//     );
//     const isDuplicatePhone = allContacts.find(
//         (c) => c.phone === data.phone.trim() && c.id !== String(id)
//     );

//     if (isDuplicateEmail) errors.email = "Cet email est déjà utilisé.";
//     else if (isDuplicatePhone) errors.phone = "Ce numéro de téléphone est déjà utilisé.";

//     if (Object.keys(errors).length > 0) {
//         showErrors(errors);
//         return;
//     }

//     clearErrors();

//     if (id) {
//         const updated = await updateContact(String(id), data);
//         resetForm();
//       await  renderList();
//         showToast("success", "Contact mis à jour",
//             `${updated.firstName} ${updated.lastName} a été modifié avec succès.`);
//     } else {
//         const created = await createContact(data);
//         resetForm();
//         setCurrentPage(getTotalPages(await getFiltered()));
//       await  renderList();
//         showToast("success", "Contact ajouté",
//             `${created.firstName} ${created.lastName} a été ajouté avec succès.`);
//     }
// });

// // RECHERCHE

// searchInput.addEventListener("input",async () => {
//     setSearchQuery(searchInput.value)
//     //searchQuery = searchInput.value;
//     setCurrentPage(1)
//    // currentPage = 1;
//    await renderList();
// });

export function initContactServices() {
    document.getElementById("cancelBtn").addEventListener("click", () => resetForm());

    document.getElementById("contactForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        const data = {
            firstName: document.getElementById("firstName").value,
            lastName:  document.getElementById("lastName").value,
            email:     document.getElementById("email").value,
            phone:     document.getElementById("phone").value,
            role:      document.getElementById("role").value,
        };
        const errors      = validateForm(data);
        const id          = document.getElementById("editId").value;
        const allContacts = await getContacts();

        if (allContacts.find((c) => c.email === data.email.trim().toLowerCase() && c.id !== String(id)))
            errors.email = "Cet email est déjà utilisé.";
        else if (allContacts.find((c) => c.phone === data.phone.trim() && c.id !== String(id)))
            errors.phone = "Ce numéro de téléphone est déjà utilisé.";

        if (Object.keys(errors).length > 0) { showErrors(errors); return; }
        clearErrors();

        if (id) {
            const updated = await updateContact(String(id), data);
            resetForm();
            await renderList();
            showToast("success", "Contact mis à jour",
                `${updated.firstName} ${updated.lastName} a été modifié avec succès.`);
        } else {
            const created = await createContact(data);
            resetForm();
            setCurrentPage(getTotalPages(await getFiltered()));
            await renderList();
            showToast("success", "Contact ajouté",
                `${created.firstName} ${created.lastName} a été ajouté avec succès.`);
        }
    });

    document.getElementById("searchInput").addEventListener("input", async () => {
        setSearchQuery(document.getElementById("searchInput").value);
        setCurrentPage(1);
        await renderList();
    });
}

export function initials(f, l) {
    return ((f[0] || "") + (l[0] || "")).toUpperCase();
}

export function createCard(contact) {
    const li = document.createElement("li");
    li.className  = "contact-card" + (selectedIds.has(contact.id) ? " selected" : "");
    li.dataset.id = contact.id;
    li.innerHTML  = cardTemplate(contact);
    return li;
}

//init
// renderList();