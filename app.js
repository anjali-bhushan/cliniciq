// ClinicIQ: inventory, lab cases, staff entries and demand forecasting
// All data is SAMPLE data and is saved only in this browser (localStorage).

const STORE_KEY = "cliniciq_v1";
let state = null;

// ---------- 1. SET UP SAMPLE DATA ----------

// A small "random" generator with a fixed seed, so the sample history is the same for everyone
function seeded(seed) {
  let s = seed % 2147483647; if (s <= 0) s += 2147483646;
  return function () { s = s * 16807 % 2147483647; return (s - 1) / 2147483646; };
}

function buildSampleState() {
  const items = ITEM_ROWS.map(function (r, i) {
    const rand = seeded(i + 7);
    const trend = (rand() - 0.4) * 0.04;            // slight up or down trend per item
    const history = [];
    for (let w = 0; w < 12; w++) {
      const base = r[7] * (1 + trend * (w - 6));
      const noise = 1 + (rand() - 0.5) * 0.5;
      history.push(Math.max(0, Math.round(base * noise * 10) / 10));
    }
    return {
      id: "I" + (i + 1), category: r[0], name: r[1], unit: r[2], stock: r[3],
      reorderLevel: r[4], leadDays: r[5], cost: r[6], history: history
    };
  });
  const today = new Date();
  const day = function (offset) { const d = new Date(today); d.setDate(d.getDate() + offset); return d.toISOString().slice(0, 10); };
  const cases = SAMPLE_CASES.map(function (c) {
    return { id: c.id, type: c.type, teeth: c.teeth, shade: c.shade, lab: c.lab, sent: day(c.sent), due: day(c.due), status: c.status, cost: c.cost };
  });
  const requests = [
    { id: 1, what: "Intraoral camera sleeves", qty: "2 boxes", by: "Assistant (Chair 2)", urgency: "This week", status: "Open", date: day(-1) },
    { id: 2, what: "Autoclave door gasket – replacement", qty: "1", by: "Sterilisation staff", urgency: "Urgent", status: "Ordered", date: day(-3) },
    { id: 3, what: "Kids' reward stickers", qty: "1 pack", by: "Front desk", urgency: "Later", status: "Open", date: day(-5) }
  ];
  return { items: items, cases: cases, requests: requests, nextReq: 4, savedAt: new Date().toISOString() };
}

function load() {
  try { const raw = localStorage.getItem(STORE_KEY); if (raw) { state = JSON.parse(raw); return; } } catch (e) {}
  state = buildSampleState();
}
function save() {
  state.savedAt = new Date().toISOString();
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) {}
}

// ---------- 2. DEMAND FORECAST (Holt's linear trend smoothing) ----------
function forecast(history, weeksAhead) {
  const a = 0.5, b = 0.3;
  let level = history[0], trend = history.length > 1 ? history[1] - history[0] : 0;
  for (let i = 1; i < history.length; i++) {
    const prev = level;
    level = a * history[i] + (1 - a) * (level + trend);
    trend = b * (level - prev) + (1 - b) * trend;
  }
  const out = [];
  for (let h = 1; h <= weeksAhead; h++) out.push(Math.max(0, level + h * trend));
  return out;
}

// Everything the screens need about one item
function analyse(item) {
  const next4 = forecast(item.history, 4);
  const weekly = next4.reduce(function (s, x) { return s + x; }, 0) / 4;   // forecast weekly use
  const leadWeeks = item.leadDays / 7;
  const safety = weekly * 1;                                               // one week of safety stock
  const reorderPoint = Math.max(item.reorderLevel, weekly * leadWeeks + safety);
  const weeksLeft = weekly > 0 ? item.stock / weekly : 99;
  let status = "OK";
  if (item.stock <= reorderPoint) status = "Reorder";
  if (weeksLeft < leadWeeks || item.stock === 0) status = "Critical";
  const orderQty = status === "OK" ? 0 : Math.max(1, Math.ceil(weekly * 4 + reorderPoint - item.stock));
  return { next4: next4, weekly: weekly, reorderPoint: reorderPoint, weeksLeft: weeksLeft, status: status, orderQty: orderQty, orderCost: orderQty * item.cost };
}

// ---------- 3. HELPERS ----------
const $ = function (id) { return document.getElementById(id); };
const rupees = function (n) { return "₹" + Math.round(n).toLocaleString("en-IN"); };
const esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
const todayStr = function () { return new Date().toISOString().slice(0, 10); };
function daysUntil(dateStr) { return Math.round((new Date(dateStr) - new Date(todayStr())) / 86400000); }
function toast(msg) { const t = $("toast"); t.textContent = msg; t.classList.add("show"); setTimeout(function () { t.classList.remove("show"); }, 2500); }
function openCase(c) { return c.status !== "Fitted"; }
function caseOverdue(c) { return openCase(c) && c.status !== "Received" && daysUntil(c.due) < 0; }

// ---------- 4. TABS ----------
function showTab(name) {
  document.querySelectorAll("#tabs button").forEach(function (b) { b.classList.toggle("active", b.dataset.tab === name); });
  document.querySelectorAll(".tab").forEach(function (s) { s.classList.toggle("active", s.id === "tab-" + name); });
  if (name !== "dashboard") document.getElementById("tabs").scrollIntoView({ behavior: "smooth" });
}
document.querySelectorAll("#tabs button").forEach(function (b) { b.addEventListener("click", function () { showTab(b.dataset.tab); }); });

// ---------- 5. DASHBOARD ----------
function renderDashboard() {
  const rows = state.items.map(function (it) { return { it: it, a: analyse(it) }; });
  const toOrder = rows.filter(function (r) { return r.a.status !== "OK"; })
    .sort(function (x, y) { return x.a.weeksLeft - y.a.weeksLeft; });
  const critical = toOrder.filter(function (r) { return r.a.status === "Critical"; }).length;
  const orderValue = toOrder.reduce(function (s, r) { return s + r.a.orderCost; }, 0);
  const stockValue = state.items.reduce(function (s, it) { return s + it.stock * it.cost; }, 0);
  const overdue = state.cases.filter(caseOverdue).length;
  const openCases = state.cases.filter(openCase).length;
  const openReq = state.requests.filter(function (r) { return r.status !== "Done"; }).length;

  $("kpis").innerHTML =
    kpi("📦", state.items.length, "items tracked", "") +
    kpi("⚠️", critical, "critical (may run out)", critical ? "red" : "") +
    kpi("🛒", toOrder.length, "to reorder · " + rupees(orderValue), toOrder.length ? "amber" : "") +
    kpi("💰", rupees(stockValue), "stock value", "") +
    kpi("🧪", openCases, "open lab cases · " + overdue + " overdue", overdue ? "red" : "") +
    kpi("📝", openReq, "open staff requirements", "");

  $("reorderTotal").textContent = toOrder.length ? "Est. " + rupees(orderValue) : "";
  $("reorderList").innerHTML = toOrder.length ? toOrder.slice(0, 10).map(function (r) {
    return '<div class="line"><div><b>' + esc(r.it.name) + '</b><div class="muted small">' + r.it.stock + " " + esc(r.it.unit) +
      " left · ~" + r.a.weeksLeft.toFixed(1) + " weeks · lead time " + r.it.leadDays + " days</div></div>" +
      '<div class="right">' + pill(r.a.status) + '<div class="small">Order ' + r.a.orderQty + " · " + rupees(r.a.orderCost) + "</div></div></div>";
  }).join("") + (toOrder.length > 10 ? '<p class="muted small">+ ' + (toOrder.length - 10) + ' more in the Inventory tab</p>' : "")
    : '<p class="muted">Everything is above its reorder point. 🎉</p>';

  const attention = state.cases.filter(function (c) { return openCase(c) && (caseOverdue(c) || daysUntil(c.due) <= 3 || c.status === "Remake" || c.status === "Received"); })
    .sort(function (x, y) { return new Date(x.due) - new Date(y.due); });
  $("labAlerts").innerHTML = attention.length ? attention.map(function (c) {
    const d = daysUntil(c.due);
    const when = c.status === "Received" ? "back from lab · ready to fit" : d < 0 ? '<span class="bad">' + (-d) + (d === -1 ? " day" : " days") + " overdue</span>" : d === 0 ? "due today" : "due in " + d + (d === 1 ? " day" : " days");
    return '<div class="line"><div><b>' + esc(c.id) + "</b> · " + esc(c.type) + '<div class="muted small">' + esc(c.lab) + " · " + when + "</div></div>" + casePill(c.status) + "</div>";
  }).join("") : '<p class="muted">No lab cases need attention.</p>';

  // forecast item picker
  const sel = $("fcItem");
  if (!sel.options.length) {
    sel.innerHTML = state.items.map(function (it) { return '<option value="' + it.id + '">' + esc(it.name) + "</option>"; }).join("");
    sel.value = "I2";
    sel.addEventListener("change", renderForecast);
  }
  renderForecast();
}

function kpi(icon, value, label, tone) {
  return '<div class="kpi ' + tone + '"><div class="kpi-icon">' + icon + '</div><div><strong>' + value + "</strong><span>" + label + "</span></div></div>";
}
function pill(status) { return '<span class="pill ' + status.toLowerCase() + '">' + status + "</span>"; }
function casePill(s) { return '<span class="pill case-' + s.toLowerCase().replace(/ /g, "-") + '">' + s + "</span>"; }

function renderForecast() {
  const it = state.items.find(function (x) { return x.id === $("fcItem").value; }) || state.items[0];
  const a = analyse(it);
  const all = it.history.concat(a.next4);
  const W = 720, H = 220, P = 34;
  const max = Math.max.apply(null, all.concat([1])) * 1.15;
  const x = function (i) { return P + i * (W - 2 * P) / (all.length - 1); };
  const y = function (v) { return H - P - v / max * (H - 2 * P); };
  const line = function (from, to) { let d = ""; for (let i = from; i <= to; i++) d += (i === from ? "M" : "L") + x(i).toFixed(1) + " " + y(all[i]).toFixed(1) + " "; return d; };
  let grid = "";
  for (let g = 0; g <= 4; g++) {
    const v = max * g / 4;
    grid += '<line x1="' + P + '" x2="' + (W - P) + '" y1="' + y(v) + '" y2="' + y(v) + '" class="grid"/>' +
      '<text x="' + (P - 6) + '" y="' + (y(v) + 4) + '" class="axis" text-anchor="end">' + v.toFixed(1) + "</text>";
  }
  let dots = "";
  all.forEach(function (v, i) { dots += '<circle cx="' + x(i) + '" cy="' + y(v) + '" r="3.5" class="' + (i < 12 ? "dot" : "dot fc") + '"><title>' + (i < 12 ? "Week " + (i - 11) : "Forecast +" + (i - 11)) + ": " + v.toFixed(1) + "</title></circle>"; });
  const labels = '<text x="' + x(0) + '" y="' + (H - 8) + '" class="axis">12 weeks ago</text>' +
    '<text x="' + x(11) + '" y="' + (H - 8) + '" class="axis" text-anchor="middle">This week</text>' +
    '<text x="' + x(15) + '" y="' + (H - 8) + '" class="axis" text-anchor="end">+4 weeks</text>';
  $("fcChart").innerHTML = '<svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Usage and forecast chart">' + grid +
    '<rect x="' + x(11) + '" y="' + P / 2 + '" width="' + (x(15) - x(11)) + '" height="' + (H - P * 1.5) + '" class="fc-zone"/>' +
    '<path d="' + line(0, 11) + '" class="actual"/><path d="' + line(11, 15) + '" class="predicted"/>' + dots + labels + "</svg>";
  $("fcInfo").innerHTML =
    "<div><span>Forecast use</span><b>" + a.weekly.toFixed(1) + " " + esc(it.unit) + "/week</b></div>" +
    "<div><span>In stock</span><b>" + it.stock + " (" + (a.weeksLeft > 50 ? "50+" : a.weeksLeft.toFixed(1)) + " weeks)</b></div>" +
    "<div><span>Reorder point</span><b>" + a.reorderPoint.toFixed(1) + "</b></div>" +
    "<div><span>Suggested order</span><b>" + (a.orderQty ? a.orderQty + " · " + rupees(a.orderCost) : "None needed") + "</b></div>";
}

// ---------- 6. INVENTORY TABLE ----------
function renderInventory() {
  const cats = Array.from(new Set(state.items.map(function (i) { return i.category; })));
  const catSel = $("invCat");
  const current = catSel.value;
  catSel.innerHTML = '<option value="">All categories</option>' + cats.map(function (c) { return "<option>" + esc(c) + "</option>"; }).join("");
  catSel.value = current;
  const q = $("invSearch").value.toLowerCase(), cat = catSel.value, st = $("invStatus").value;

  let html = "<thead><tr><th>Item</th><th>Stock</th><th>Forecast /wk</th><th>Weeks left</th><th>Status</th><th>Suggested order</th><th></th></tr></thead><tbody>";
  let lastCat = "";
  state.items.forEach(function (it) {
    const a = analyse(it);
    if (q && it.name.toLowerCase().indexOf(q) < 0) return;
    if (cat && it.category !== cat) return;
    if (st && a.status !== st) return;
    if (it.category !== lastCat) { html += '<tr class="cat-row"><td colspan="7">' + esc(it.category) + "</td></tr>"; lastCat = it.category; }
    html += "<tr><td><b>" + esc(it.name) + '</b><div class="muted small">' + esc(it.unit) + " · " + rupees(it.cost) + " · lead " + it.leadDays + "d</div></td>" +
      "<td>" + it.stock + "</td><td>" + a.weekly.toFixed(1) + "</td><td>" + (a.weeksLeft > 50 ? "50+" : a.weeksLeft.toFixed(1)) + "</td>" +
      "<td>" + pill(a.status) + "</td><td>" + (a.orderQty ? a.orderQty + " · " + rupees(a.orderCost) : "—") + "</td>" +
      '<td class="actions"><button title="Record usage" onclick="quick(\'' + it.id + '\',-1)">−1</button><button title="Stock received" onclick="quick(\'' + it.id + '\',1)">+1</button></td></tr>';
  });
  $("invTable").innerHTML = html + "</tbody>";
}
["invSearch", "invCat", "invStatus"].forEach(function (id) { $(id).addEventListener("input", renderInventory); });

function quick(id, delta) {
  const it = state.items.find(function (x) { return x.id === id; });
  if (!it) return;
  if (delta < 0 && it.stock <= 0) { toast("Stock is already 0"); return; }
  it.stock = Math.max(0, it.stock + delta);
  if (delta < 0) it.history[11] = Math.round((it.history[11] + 1) * 10) / 10;   // usage counts towards this week
  save(); renderAll();
  toast((delta < 0 ? "Used 1 × " : "Received 1 × ") + it.name);
}

// ---------- 7. LAB CASES ----------
function renderLab() {
  const f = $("labFilter").value;
  const list = state.cases.filter(function (c) { return f === "all" || (f === "open" ? openCase(c) : caseOverdue(c)); })
    .sort(function (x, y) { return new Date(x.due) - new Date(y.due); });
  let html = "<thead><tr><th>Case</th><th>Work</th><th>Lab</th><th>Sent</th><th>Due</th><th>Status</th><th>Cost</th></tr></thead><tbody>";
  list.forEach(function (c) {
    const d = daysUntil(c.due);
    const dueTxt = c.due + '<div class="small ' + (caseOverdue(c) ? "bad" : "muted") + '">' + (c.status === "Received" || c.status === "Fitted" ? (c.status === "Received" ? "back from lab" : "done") : d < 0 ? (-d) + "d overdue" : d === 0 ? "today" : "in " + d + "d") + "</div>";
    html += "<tr><td><b>" + esc(c.id) + "</b></td><td>" + esc(c.type) + '<div class="muted small">Tooth ' + esc(c.teeth) + " · shade " + esc(c.shade) + "</div></td>" +
      "<td>" + esc(c.lab) + "</td><td>" + c.sent + "</td><td>" + dueTxt + "</td>" +
      '<td><select onchange="setCaseStatus(\'' + c.id + '\', this.value)">' + CASE_STATUSES.map(function (s) { return "<option" + (s === c.status ? " selected" : "") + ">" + s + "</option>"; }).join("") + "</select></td>" +
      "<td>" + rupees(c.cost) + "</td></tr>";
  });
  $("labTable").innerHTML = html + "</tbody>" + (list.length ? "" : '<tr><td colspan="7" class="muted">No cases here.</td></tr>');
}
$("labFilter").addEventListener("change", renderLab);
function setCaseStatus(id, status) {
  const c = state.cases.find(function (x) { return x.id === id; });
  if (c) { c.status = status; save(); renderAll(); toast(id + " → " + status); }
}

// ---------- 8. REQUIREMENTS ----------
function renderRequests() {
  const order = { "Urgent": 0, "This week": 1, "Later": 2 };
  const list = state.requests.slice().sort(function (a, b) { return (a.status === "Done") - (b.status === "Done") || order[a.urgency] - order[b.urgency]; });
  $("reqList").innerHTML = list.length ? list.map(function (r) {
    return '<div class="req ' + (r.status === "Done" ? "done" : "") + '"><div><b>' + esc(r.what) + "</b> · " + esc(r.qty) +
      '<div class="muted small">' + esc(r.by) + " · " + r.date + ' · <span class="urg ' + r.urgency.replace(/ /g, "-").toLowerCase() + '">' + esc(r.urgency) + "</span></div></div>" +
      '<select onchange="setReqStatus(' + r.id + ', this.value)">' + ["Open", "Ordered", "Done"].map(function (s) { return "<option" + (s === r.status ? " selected" : "") + ">" + s + "</option>"; }).join("") + "</select></div>";
  }).join("") : '<p class="muted">No requirements yet.</p>';
}
function setReqStatus(id, status) {
  const r = state.requests.find(function (x) { return x.id === id; });
  if (r) { r.status = status; save(); renderAll(); }
}

// ---------- 9. STAFF ENTRY FORM ----------
let entryMode = "usage";
function itemOptions() { return state.items.map(function (it) { return '<option value="' + it.id + '">' + esc(it.name) + " (" + it.stock + " in stock)</option>"; }).join(""); }

const FORMS = {
  usage: function () {
    return field("Item", '<select name="item" required>' + itemOptions() + "</select>") +
      field("Quantity used", '<input name="qty" type="number" min="0.1" step="any" value="1" required>') +
      '<button class="btn-primary" type="submit">Save usage</button>';
  },
  receive: function () {
    return field("Item", '<select name="item" required>' + itemOptions() + "</select>") +
      field("Quantity received", '<input name="qty" type="number" min="1" step="any" value="1" required>') +
      field("Unit price paid (₹, optional)", '<input name="price" type="number" min="0" step="any" placeholder="Leave blank to keep current">') +
      '<button class="btn-primary" type="submit">Save delivery</button>';
  },
  request: function () {
    return field("What is needed?", '<input name="what" required placeholder="e.g. Composite shade A3.5, suction tubing">') +
      field("Quantity", '<input name="qty" placeholder="e.g. 2 boxes">') +
      field("Requested by (role)", '<input name="by" placeholder="e.g. Assistant, Chair 1">') +
      field("Urgency", '<select name="urgency"><option>Urgent</option><option selected>This week</option><option>Later</option></select>') +
      '<button class="btn-primary" type="submit">Add requirement</button>';
  },
  case: function () {
    return field("Work type", '<input name="type" required placeholder="e.g. Zirconia crown">') +
      '<div class="two">' + field("Tooth / arch", '<input name="teeth" placeholder="e.g. 36">') + field("Shade", '<input name="shade" placeholder="e.g. A2">') + "</div>" +
      field("Lab", '<select name="lab">' + LABS.map(function (l) { return "<option>" + l + "</option>"; }).join("") + "</select>") +
      '<div class="two">' + field("Sent on", '<input name="sent" type="date" value="' + todayStr() + '">') + field("Due on", '<input name="due" type="date" required>') + "</div>" +
      field("Lab cost (₹)", '<input name="cost" type="number" min="0" value="0">') +
      '<p class="small muted">A case ID is created automatically. No patient names.</p>' +
      '<button class="btn-primary" type="submit">Add lab case</button>';
  },
  item: function () {
    return field("Item name", '<input name="name" required placeholder="e.g. Nitrile gloves – XS">') +
      field("Category", '<input name="category" list="catList" required placeholder="Pick or type a category"><datalist id="catList">' +
        Array.from(new Set(state.items.map(function (i) { return i.category; }))).map(function (c) { return '<option value="' + esc(c) + '">'; }).join("") + "</datalist>") +
      '<div class="two">' + field("Unit", '<input name="unit" placeholder="e.g. box of 100" required>') + field("Unit cost (₹)", '<input name="cost" type="number" min="0" value="0">') + "</div>" +
      '<div class="two">' + field("In stock", '<input name="stock" type="number" min="0" value="0">') + field("Reorder level", '<input name="reorder" type="number" min="0" value="1">') + "</div>" +
      '<div class="two">' + field("Lead time (days)", '<input name="lead" type="number" min="0" value="5">') + field("Typical weekly use", '<input name="weekly" type="number" min="0" step="any" value="1">') + "</div>" +
      '<button class="btn-primary" type="submit">Add item</button>';
  }
};
function field(label, input) { return "<label>" + label + input + "</label>"; }

function openEntry(mode) {
  entryMode = mode || "usage";
  document.querySelectorAll("#entryTabs button").forEach(function (b) { b.classList.toggle("active", b.dataset.entry === entryMode); });
  $("entryForm").innerHTML = FORMS[entryMode]();
  $("entryModal").classList.add("open");
}
function closeEntry() { $("entryModal").classList.remove("open"); }
document.querySelectorAll("#entryTabs button").forEach(function (b) { b.addEventListener("click", function () { openEntry(b.dataset.entry); }); });
$("entryModal").addEventListener("click", function (e) { if (e.target.id === "entryModal") closeEntry(); });

$("entryForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const f = Object.fromEntries(new FormData(e.target).entries());
  const it = f.item ? state.items.find(function (x) { return x.id === f.item; }) : null;
  if (entryMode === "usage") {
    const q = Number(f.qty);
    it.stock = Math.max(0, Math.round((it.stock - q) * 10) / 10);
    it.history[11] = Math.round((it.history[11] + q) * 10) / 10;
    toast("Recorded: used " + q + " × " + it.name);
  } else if (entryMode === "receive") {
    it.stock = Math.round((it.stock + Number(f.qty)) * 10) / 10;
    if (f.price) it.cost = Number(f.price);
    toast("Recorded: received " + f.qty + " × " + it.name);
  } else if (entryMode === "request") {
    state.requests.push({ id: state.nextReq++, what: f.what, qty: f.qty || "—", by: f.by || "Staff", urgency: f.urgency, status: "Open", date: todayStr() });
    toast("Requirement added");
  } else if (entryMode === "case") {
    const n = state.cases.reduce(function (m, c) { return Math.max(m, Number(c.id.split("-")[1]) || 0); }, 1000) + 1;
    state.cases.push({ id: "LC-" + n, type: f.type, teeth: f.teeth || "—", shade: f.shade || "—", lab: f.lab, sent: f.sent, due: f.due, status: "Sent", cost: Number(f.cost) || 0 });
    toast("Lab case LC-" + n + " added");
  } else if (entryMode === "item") {
    const w = Number(f.weekly) || 0;
    state.items.push({ id: "I" + (Date.now() % 100000), category: f.category, name: f.name, unit: f.unit, stock: Number(f.stock) || 0,
      reorderLevel: Number(f.reorder) || 0, leadDays: Number(f.lead) || 0, cost: Number(f.cost) || 0, history: new Array(12).fill(w) });
    $("fcItem").innerHTML = "";
    toast("Item added: " + f.name);
  }
  save(); closeEntry(); renderAll();
});

// ---------- 10. EXPORT & RESET ----------
function exportCSV() {
  const cell = function (v) { v = String(v == null ? "" : v); return '"' + v.replace(/"/g, '""') + '"'; };
  const lines = [["Category", "Item", "Unit", "In stock", "Reorder level", "Lead time (days)", "Unit cost (Rs)", "Forecast weekly use", "Weeks left", "Status", "Suggested order qty", "Suggested order cost (Rs)"].map(cell).join(",")];
  state.items.forEach(function (it) {
    const a = analyse(it);
    lines.push([it.category, it.name, it.unit, it.stock, it.reorderLevel, it.leadDays, it.cost, a.weekly.toFixed(1), a.weeksLeft > 50 ? "50+" : a.weeksLeft.toFixed(1), a.status, a.orderQty, Math.round(a.orderCost)].map(cell).join(","));
  });
  const blob = new Blob(["﻿" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = "ClinicIQ-inventory-" + todayStr() + ".csv"; a.click();
}
function resetData() {
  if (!confirm("Reset everything to the sample data? Your entries in this browser will be removed.")) return;
  state = buildSampleState(); save(); $("fcItem").innerHTML = ""; renderAll(); toast("Sample data restored");
}

// ---------- 11. START ----------
function renderAll() { renderDashboard(); renderInventory(); renderLab(); renderRequests(); }
load(); renderAll();
