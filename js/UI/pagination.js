import { createCard } from "../services/contactServices.js";
import { getContacts } from "../stores/contactStores.js";

const PER_PAGE  = 8;
let currentPage = 1;
let searchQuery = "";

export function setCurrentPage(page) { currentPage = page; }
export function setSearchQuery(q)    { searchQuery = q; }

export function getTotalPages(filtered) {
    return Math.max(1, Math.ceil(filtered.length / PER_PAGE));
}

export function getPageSlice(filtered) {
    const start = (currentPage - 1) * PER_PAGE;
    return filtered.slice(start, start + PER_PAGE);
}

export async function getFiltered() {
    const contacts = await getContacts();
    const q = searchQuery.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter((c) =>
        `${c.firstName} ${c.lastName} ${c.email} ${c.phone} ${c.role}`
            .toLowerCase().includes(q)
    );
}

export async function renderList() {
    const filtered   = await getFiltered();
    const totalPages = getTotalPages(filtered);
    if (currentPage > totalPages) currentPage = totalPages;

    const slice       = getPageSlice(filtered);
    const contactList = document.getElementById("contactList");
    const listCount   = document.getElementById("listCount");
    const emptyState  = document.getElementById("emptyState");

    document.getElementById("contactList").innerHTML = "";

    const total = (await getContacts()).length;
    listCount.textContent = `${total} contact${total > 1 ? "s" : ""}`;

    if (filtered.length === 0) {
        emptyState.classList.remove("hidden");
    } else {
        emptyState.classList.add("hidden");
        slice.forEach((c) => contactList.appendChild(createCard(c)));
    }

    renderPagination(filtered.length, totalPages);
    import("../UI/modalRenderer.js").then(({ updateSelectionUI }) => updateSelectionUI());
}

export function renderPagination(total, totalPages) {
    const paginationEl = document.getElementById("pagination");
    paginationEl.innerHTML = "";
    if (total <= PER_PAGE) return;

    const prev = document.createElement("button");
    prev.className   = "page-btn";
    prev.textContent = "←";
    prev.disabled    = currentPage === 1;
    prev.addEventListener("click", async () => { currentPage--; await renderList(); });
    paginationEl.appendChild(prev);

    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement("button");
        btn.className   = "page-btn" + (i === currentPage ? " active" : "");
        btn.textContent = i;
        btn.addEventListener("click", async () => { currentPage = i; await renderList(); });
        paginationEl.appendChild(btn);
    }

    const next = document.createElement("button");
    next.className   = "page-btn";
    next.textContent = "→";
    next.disabled    = currentPage === totalPages;
    next.addEventListener("click", async () => { currentPage++; await renderList(); });
    paginationEl.appendChild(next);
}