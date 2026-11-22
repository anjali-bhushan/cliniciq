# 🦷 ClinicIQ: dental clinic inventory & lab management (prototype)

**Live demo:** https://anjali-bhushan.github.io/cliniciq/

ClinicIQ helps a dental clinic answer three everyday questions:
1. **What are we about to run out of, and what should we order this week?**
2. **Which lab cases are overdue or at risk?**
3. **Where can we buy it, and at what price?**

> ⚠️ **Prototype.** For security and safety reasons, every item, stock level, price, supplier and lab case in this demo is **sample data**. No real clinic, patient or supplier records are used. Entries are saved only in the visitor's own browser.

## Why I built it
I ran operations at a dental clinic, where stock-outs of everyday consumables (gloves, files, impression material) and late lab cases caused rescheduled appointments and emergency purchases. ClinicIQ is a prototype of the tool I wanted: one screen showing stock, demand and lab work, with AI help for purchasing.

## Features
| Feature | What it does |
|---|---|
| 📦 Inventory (126 items, 14 categories) | PPE, sterilisation, disposables, anaesthesia, restorative, endo, prostho, burs, surgery, radiology, ortho, paediatric, emergency kit and dental lab materials |
| 📈 Demand forecast | Holt's linear trend smoothing on 12 weeks of usage, forecasting the next 4 weeks |
| 🛒 Reorder suggestions | Reorder point = forecast weekly use × lead time + 1 week of safety stock; suggests quantity and ₹ cost |
| 🧪 Lab case register | Tracks crowns, bridges, dentures, retainers and more by **case ID only**, with due dates, status and overdue alerts |
| ＋ Staff entry | Staff record usage, deliveries, new requirements, new lab cases and new items |
| 📝 Requirements board | Requests from the team (Open → Ordered → Done) |
| 🤖 AI assistant | Google Gemini with **Google Search**: answers stock and lab questions from the page data and finds suppliers online, with sources |
| ⬇️ Export | Download inventory with forecasts and order suggestions as CSV (opens in Excel) |

## Guardrails
- The AI **never places orders** and never asks for payment details.
- It gives **no clinical or drug-dosing advice**: medicines are handled only as stock (quantity, expiry, purchasing).
- Supplier results come from web search and must be **verified before ordering**.
- **No patient data**: lab cases use IDs only.
- The AI uses the visitor's **own** Gemini API key, stored only in their browser.

## Tech
Plain HTML, CSS and JavaScript (no frameworks) · GitHub Pages hosting · browser localStorage · Google Gemini API with Google Search grounding.

| File | Purpose |
|---|---|
| `index.html` | Page structure |
| `style.css` | Design |
| `data.js` | Sample inventory list and lab cases |
| `app.js` | Forecasting, reorder logic, inventory, lab cases, staff entries, export |
| `agent.js` | AI assistant (Gemini + Google Search) |

## Roadmap
- Shared database (Google Sheets / Firebase) so all staff see the same data
- Expiry-date tracking with alerts
- Barcode scanning for usage and deliveries
- Supplier price history and automatic purchase-order drafts (with approval)

---
Built by **Anjali Bhushan** · IIM Kozhikode
