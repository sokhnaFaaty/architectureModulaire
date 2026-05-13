import {
    selectedIds,initials
}from "../services/contactServices.js"
export function cardTemplate(contact){
    return `
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
 } 