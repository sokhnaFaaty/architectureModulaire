// ── Store — localStorage 
// Ce fichier n'importe RIEN. Il gère uniquement la persistance des données.

const STORAGE_KEY = "contacts_v2";

export function getContacts() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

export function saveContacts(contacts) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
}