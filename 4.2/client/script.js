// client/script.js

const API_URL = "http://localhost:3000/api/items";

const listEl = document.getElementById("list");
const reloadBtn = document.getElementById("reload");

// ---- UI helpers ----
function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function setLoading(isLoading) {
  if (!reloadBtn) return;
  reloadBtn.disabled = isLoading;
  reloadBtn.textContent = isLoading ? "Loading..." : "Reload Items";
}

function showMessage(type, text) {
  // type: "info" | "success" | "error"
  const existing = document.getElementById("msg");
  if (existing) existing.remove();

  const div = document.createElement("div");
  div.id = "msg";
  div.style.margin = "0 0 12px 0";
  div.style.padding = "10px 12px";
  div.style.borderRadius = "10px";
  div.style.fontWeight = "600";
  div.style.fontSize = "14px";
  div.style.textAlign = "center";
  div.style.background =
    type === "success" ? "#e6fffa" : type === "error" ? "#ffe5e5" : "#eef2ff";
  div.style.color =
    type === "success" ? "#2f855a" : type === "error" ? "#c53030" : "#3730a3";

  div.textContent = text;

  // insert above list
  listEl.parentElement.insertBefore(div, listEl);

  // auto-hide after 3.5s (except error)
  if (type !== "error") {
    setTimeout(() => {
      const m = document.getElementById("msg");
      if (m) m.remove();
    }, 3500);
  }
}

function renderStats(items) {
  const existing = document.getElementById("stats");
  if (existing) existing.remove();

  const total = items.length;
  const inStock = items.filter((x) => x.inStock).length;
  const outStock = total - inStock;
  const avgPrice =
    total === 0
      ? 0
      : items.reduce((sum, x) => sum + Number(x.price || 0), 0) / total;

  const div = document.createElement("div");
  div.id = "stats";
  div.style.display = "flex";
  div.style.gap = "10px";
  div.style.flexWrap = "wrap";
  div.style.justifyContent = "space-between";
  div.style.marginBottom = "12px";

  const card = (label, value) => `
    <div style="
      flex:1;
      min-width: 160px;
      background:#f7f7f7;
      padding:12px 14px;
      border-radius:10px;
      box-shadow: 0 6px 16px rgba(0,0,0,0.08);
    ">
      <div style="font-size:12px;color:#666;margin-bottom:4px;">${label}</div>
      <div style="font-size:18px;font-weight:800;color:#333;">${value}</div>
    </div>
  `;

  div.innerHTML =
    card("Total Items", total) +
    card("In Stock", inStock) +
    card("Out of Stock", outStock) +
    card("Avg Price", `$${avgPrice.toFixed(2)}`);

  listEl.parentElement.insertBefore(div, listEl);
}

function renderControls(items) {
  const existing = document.getElementById("controls");
  if (existing) existing.remove();

  const wrapper = document.createElement("div");
  wrapper.id = "controls";
  wrapper.style.display = "flex";
  wrapper.style.gap = "10px";
  wrapper.style.flexWrap = "wrap";
  wrapper.style.marginBottom = "12px";

  const search = document.createElement("input");
  search.type = "text";
  search.placeholder = "Search by title/category...";
  search.id = "search";
  search.style.flex = "1";
  search.style.minWidth = "220px";
  search.style.padding = "10px 12px";
  search.style.borderRadius = "10px";
  search.style.border = "1px solid #e5e7eb";
  search.style.outline = "none";

  const stockFilter = document.createElement("select");
  stockFilter.id = "stockFilter";
  stockFilter.style.padding = "10px 12px";
  stockFilter.style.borderRadius = "10px";
  stockFilter.style.border = "1px solid #e5e7eb";
  stockFilter.innerHTML = `
    <option value="all">All</option>
    <option value="in">In Stock</option>
    <option value="out">Out of Stock</option>
  `;

  const sort = document.createElement("select");
  sort.id = "sort";
  sort.style.padding = "10px 12px";
  sort.style.borderRadius = "10px";
  sort.style.border = "1px solid #e5e7eb";
  sort.innerHTML = `
    <option value="new">Newest</option>
    <option value="az">Title A → Z</option>
    <option value="za">Title Z → A</option>
    <option value="priceLow">Price Low → High</option>
    <option value="priceHigh">Price High → Low</option>
  `;

  wrapper.appendChild(search);
  wrapper.appendChild(stockFilter);
  wrapper.appendChild(sort);

  listEl.parentElement.insertBefore(wrapper, listEl);

  const apply = () => applyFilters(items);
  search.addEventListener("input", apply);
  stockFilter.addEventListener("change", apply);
  sort.addEventListener("change", apply);
}

function renderList(items) {
  listEl.innerHTML = "";

  if (!items.length) {
    const li = document.createElement("li");
    li.className = "error";
    li.textContent = "No items found.";
    listEl.appendChild(li);
    return;
  }

  items.forEach((item) => {
    const li = document.createElement("li");

    const title = escapeHtml(item.title ?? "");
    const category = escapeHtml(item.category ?? "");
    const price = Number(item.price ?? 0).toFixed(2);

    li.innerHTML = `
      <span>${title} (${category}) - $${price}</span>
      <span class="${item.inStock ? "in-stock" : "out-stock"}">
        ${item.inStock ? "In Stock" : "Out of Stock"}
      </span>
    `;

    listEl.appendChild(li);
  });
}

let allItems = [];

function applyFilters(sourceItems) {
  const q = (document.getElementById("search")?.value || "").trim().toLowerCase();
  const stock = document.getElementById("stockFilter")?.value || "all";
  const sort = document.getElementById("sort")?.value || "new";

  let filtered = [...sourceItems];

  if (q) {
    filtered = filtered.filter((x) => {
      const t = String(x.title || "").toLowerCase();
      const c = String(x.category || "").toLowerCase();
      return t.includes(q) || c.includes(q);
    });
  }

  if (stock === "in") filtered = filtered.filter((x) => !!x.inStock);
  if (stock === "out") filtered = filtered.filter((x) => !x.inStock);

  filtered.sort((a, b) => {
    const at = String(a.title || "");
    const bt = String(b.title || "");
    const ap = Number(a.price || 0);
    const bp = Number(b.price || 0);
    const ad = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bd = b.createdAt ? new Date(b.createdAt).getTime() : 0;

    if (sort === "az") return at.localeCompare(bt);
    if (sort === "za") return bt.localeCompare(at);
    if (sort === "priceLow") return ap - bp;
    if (sort === "priceHigh") return bp - ap;

    // newest first (default)
    return bd - ad;
  });

  renderStats(filtered);
  renderList(filtered);
}

// ---- Data loading ----
async function loadItems() {
  setLoading(true);

  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Failed to fetch items");

    allItems = await res.json();

    showMessage("success", "Items loaded successfully ✅");
    renderControls(allItems);
    renderStats(allItems);
    applyFilters(allItems);
  } catch (err) {
    listEl.innerHTML = "";
    const li = document.createElement("li");
    li.className = "error";
    li.textContent =
      "Error loading items. Make sure server is running on http://localhost:3000";
    listEl.appendChild(li);
    showMessage("error", err.message);
  } finally {
    setLoading(false);
  }
}

// Events
if (reloadBtn) reloadBtn.addEventListener("click", loadItems);

// Initial load
loadItems();
