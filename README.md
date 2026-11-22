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
| 📈 Demand forecast | Three methods (last week's value, 4-week average, Holt's trend) forecast the next 4 weeks from 12 weeks of usage |
| 🎯 Accuracy check (backtest) | Hides the last 4 weeks, forecasts them with each method and scores the error (WAPE). The app then uses the most accurate method **per item** |
| 🛒 Reorder suggestions | Reorder point = forecast weekly use × lead time + 1 week of safety stock; suggests quantity and ₹ cost |
| 🧪 Lab case register | Tracks crowns, bridges, dentures, retainers and more by **case ID only**, with due dates, status and overdue alerts |
| ＋ Staff entry | Staff record usage, deliveries, new requirements, new lab cases and new items |
| 📝 Requirements board | Requests from the team (Open → Ordered → Done) |
| 🤖 AI assistant | Google Gemini with **Google Search**: answers stock and lab questions from the page data and finds suppliers online, with sources |
| ⬇️ Export | Download inventory with forecasts and order suggestions as CSV (opens in Excel) |

## Inventory policy: ABC analysis + safety stock
- **ABC analysis:** items ranked by yearly spend. A = first 80% of spend, B = next 15%, C = last 5%.
- **Service level by class:** A 98%, B 95%, C 90% (how often we accept *not* running out).
- **Safety stock = z × standard deviation of weekly use × √lead time** (z from the service level).
- **Reorder point = forecast use over the lead time + safety stock**; order up to 4 more weeks of forecast use.

### Policy simulation (sample data, 8 weeks, all 126 items)
| Measure | Old fixed-level rule | ClinicIQ policy | Change |
|---|---|---|---|
| Weeks with a stock-out | 3 | 3 | same |
| Demand met on time | 99.3% | 99.3% | same |
| Average money tied up in stock | ₹3,01,905 | ₹1,62,318 | **−46%** |
| Purchase orders placed | 152 | 113 | **−26%** |

Old rule = reorder at the fixed shelf-card level and order 2 × that level (a common habit). The simulation forecasts only from past weeks (no peeking ahead). The 3 stock-out weeks come from items that are already low today, before any order can arrive.

## What the accuracy check found (sample data)
| Method | Error (WAPE) | Best for |
|---|---|---|
| 4-week average | 15.0% | 35 items |
| Last week's value | 17.2% | 80 items |
| Holt's trend | 21.9% | 11 items |
| **Best method per item (used in the app)** | **13.4%** | all 126 |

**Takeaway:** on short, noisy weekly data, simple methods beat the more complex trend model, so the app tests the methods and picks per item instead of assuming one is best. The per-item figure is slightly optimistic (the method is chosen on the same weeks it is scored on); with real clinic data it should be confirmed on later weeks.

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
