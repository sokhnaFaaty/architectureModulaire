const Base_KEY = "http://localhost:3000/contacts";

// export function getContacts() {
//     const data = localStorage.getItem(Base_KEY);
//     return data ? JSON.parse(data) : [];
// }

// export function saveContacts(contacts) {
//     localStorage.setItem(Base_KEY, JSON.stringify(contacts));
// }

function normalizeRaw(raw) {
  return {
    firstName: raw.firstName,
    lastName: raw.lastName,
    email: raw.email,
    phone: raw.phone,
    role: raw.role,
    // createdAt: raw.createdAt ? new Date(raw.createdAt) : new Date(),
    createdAt: raw.createdAt ?? "",
    id: raw.id,
  };
}

export async function getContacts() {
  const response = await fetch(Base_KEY);
  const data = await response.json();
  return Array.isArray(data) ? data.map(normalizeRaw) : [];
}
export async function saveContact(contact) {
  const response = await fetch(Base_KEY, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(contact),
  });
  return await response.json();
}
export async function updateContact(id, data) {
  const response = await fetch(`${Base_KEY}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return response.json();
}
export async function deleteContact(id) {
  await fetch(`${Base_KEY}/${id}`, {
    method: "DELETE",
  });
}

export async function deleteContacts(ids) {
  for (const id of ids) {
    await fetch(`${Base_KEY}/${id}`, {
      method: "DELETE",
    });
  }
}
