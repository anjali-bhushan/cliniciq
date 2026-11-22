// ClinicIQ AI assistant: Google Gemini with Google Search ("bring your own key")
// The key is stored only in the visitor's browser, never in this code.

const GEMINI_MODEL = "gemini-3.6-flash";   // change here if Google renames its models
const KEY_STORE = "cliniciq_gemini_key";

// 1. What the assistant knows: a summary of the data on the page + guardrails
function assistantInstructions() {
  const items = state.items.map(function (it) {
    const a = analyse(it);
    return "- " + it.name + " [" + it.category + "] stock " + it.stock + " " + it.unit + ", forecast " + a.weekly.toFixed(1) +
      "/week, " + (a.weeksLeft > 50 ? "50+" : a.weeksLeft.toFixed(1)) + " weeks left, lead " + it.leadDays + "d, ₹" + it.cost +
      " each, status " + a.status + (a.orderQty ? ", suggested order " + a.orderQty + " (₹" + Math.round(a.orderCost) + ")" : "");
  }).join("\n");
  const cases = state.cases.map(function (c) {
    return "- " + c.id + ": " + c.type + ", " + c.lab + ", sent " + c.sent + ", due " + c.due + ", status " + c.status + ", ₹" + c.cost;
  }).join("\n");
  const reqs = state.requests.map(function (r) { return "- " + r.what + " (" + r.qty + "), " + r.urgency + ", " + r.status; }).join("\n");

  return "You are the ClinicIQ assistant for a dental clinic's inventory, purchasing and dental-lab case management. Today is " + todayStr() + ".\n" +
    "This is a PROTOTYPE with SAMPLE data. Currency: Indian rupees (₹).\n\n" +
    "Inventory (forecast uses Holt's trend smoothing; reorder point = forecast weekly use × lead time + 1 week safety stock):\n" + items +
    "\n\nLab cases:\n" + cases + "\n\nStaff requirements:\n" + reqs + "\n\n" +
    "Rules (always follow):\n" +
    "1. Base stock, forecast and lab answers on the data above. Show quantities and ₹ totals where useful.\n" +
    "2. When asked where to buy or for suppliers or prices, use Google Search. Prefer Indian dental suppliers and official distributors. Give names and what you found, say prices change, and remind the user to verify before ordering.\n" +
    "3. Never place orders, never ask for payment details, never invent supplier contact details.\n" +
    "4. Don't give clinical treatment or drug-dosing advice; for medicines and emergency drugs only discuss stock, expiry and purchasing.\n" +
    "5. Never ask for or store patient names or personal data.\n" +
    "6. Be concise: about 150 words, short bullet points, bold key numbers. No tables.";
}

// 2. Turn **bold**, ### headings and * bullets into tidy HTML
function formatAnswer(text) {
  const safe = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  let html = "", inList = false;
  safe.split("\n").forEach(function (raw) {
    const t = raw.trim();
    const line = t.replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/(^|[^*])\*(?!\s)(.+?)\*(?!\*)/g, "$1<i>$2</i>");
    if (/^([*-]|\d+\.)\s+/.test(t)) {
      if (!inList) { html += "<ul>"; inList = true; }
      html += "<li>" + line.replace(/^([*-]|\d+\.)\s+/, "") + "</li>"; return;
    }
    if (inList) { html += "</ul>"; inList = false; }
    if (/^-{3,}$/.test(t)) html += "<hr>";
    else if (/^#{1,6}\s/.test(t)) html += "<h4>" + line.replace(/^#{1,6}\s/, "") + "</h4>";
    else if (t) html += "<p>" + line + "</p>";
  });
  if (inList) html += "</ul>";
  return html;
}

function addMessage(who, html) {
  const box = $("chatLog");
  const div = document.createElement("div");
  div.className = "msg " + who;
  div.innerHTML = html;
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
  return div;
}

// 3. Key handling
function getKey() { try { return localStorage.getItem(KEY_STORE) || ""; } catch (e) { return ""; } }
function refreshKeyStatus() {
  const has = !!getKey();
  $("keyStatus").textContent = has ? "✅ Key saved in this browser only." : "No key saved yet.";
  $("keyRow").style.display = has ? "none" : "flex";
  $("forgetBtn").style.display = has ? "inline" : "none";
}
$("saveKeyBtn").addEventListener("click", function () {
  const k = $("apiKey").value.trim(); if (!k) return;
  try { localStorage.setItem(KEY_STORE, k); } catch (e) {}
  $("apiKey").value = ""; refreshKeyStatus();
});
$("forgetBtn").addEventListener("click", function () { try { localStorage.removeItem(KEY_STORE); } catch (e) {} refreshKeyStatus(); });

// 4. Ask Gemini (with Google Search switched on)
const chatHistory = [];
async function ask() {
  const input = $("chatInput");
  const q = input.value.trim(); if (!q) return;
  if (!getKey()) { addMessage("bot", "Please add your free Gemini API key above first."); return; }
  input.value = "";
  addMessage("user", esc(q));
  chatHistory.push({ role: "user", parts: [{ text: q }] });
  const thinking = addMessage("bot", "<p>Thinking… 🔎</p>");
  try {
    const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/" + GEMINI_MODEL + ":generateContent", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": getKey() },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: assistantInstructions() }] },
        contents: chatHistory,
        tools: [{ google_search: {} }]
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error((data.error && data.error.message) || ("Error " + res.status));
    const cand = (data.candidates && data.candidates[0]) || {};
    const text = ((cand.content && cand.content.parts) || []).map(function (p) { return p.text || ""; }).join("").trim() || "Sorry, I couldn't answer that.";
    let html = formatAnswer(text);
    const chunks = (cand.groundingMetadata && cand.groundingMetadata.groundingChunks) || [];
    const links = chunks.filter(function (c) { return c.web && c.web.uri; }).slice(0, 6);
    if (links.length) {
      html += '<div class="sources"><b>Sources from Google Search</b> (verify before ordering):<ul>' +
        links.map(function (c) { return '<li><a href="' + esc(c.web.uri) + '" target="_blank" rel="noopener">' + esc(c.web.title || c.web.uri) + "</a></li>"; }).join("") + "</ul></div>";
    }
    thinking.innerHTML = html;
    chatHistory.push({ role: "model", parts: [{ text: text }] });
  } catch (err) {
    thinking.innerHTML = "<p>⚠️ " + esc(err.message) + "</p>";
    chatHistory.pop();
  }
}
$("askBtn").addEventListener("click", ask);
$("chatInput").addEventListener("keydown", function (e) { if (e.key === "Enter") ask(); });
document.querySelectorAll(".chip").forEach(function (c) { c.addEventListener("click", function () { $("chatInput").value = c.textContent; ask(); }); });
refreshKeyStatus();
