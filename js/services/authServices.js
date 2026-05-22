const BASE_URL    = "http://localhost:3000/users";
const SESSION_KEY = "currentUser"; //sessionStorage

// vérifie les identifiants et sauvegarde la session
export async function loginUser({ login, password }) {
  const res   = await fetch(`${BASE_URL}?login=${login}&password=${password}`);
  const users = await res.json();

  if (users.length === 0) return null; // identifiants incorrects

  const user = users[0];
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
  return user;
}

//  supprime la session
export function logoutUser() {
  sessionStorage.removeItem(SESSION_KEY);
}

// retourne l'user connecté ou null
export function getCurrentUser() {
  const data = sessionStorage.getItem(SESSION_KEY);
  if (!data) return null;
  return JSON.parse(data);
}

// CONNECTÉet retournet rue/false pour le router
export function isAuthenticated() {
  return getCurrentUser() !== null;
}