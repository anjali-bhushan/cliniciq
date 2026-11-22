// ClinicIQ sample data
// PROTOTYPE: all items, stock levels, prices and lab cases below are SAMPLE data.
// No real clinic, patient or supplier data is used.

// Each item: [category, name, unit, stock, reorderLevel, leadTimeDays, unitCost (₹), avgWeeklyUse]
const ITEM_ROWS = [
  // ---------- PPE & infection control ----------
  ["PPE & infection control", "Nitrile gloves – Small", "box of 100", 6, 4, 3, 450, 1.5],
  ["PPE & infection control", "Nitrile gloves – Medium", "box of 100", 1, 6, 3, 450, 3],
  ["PPE & infection control", "Nitrile gloves – Large", "box of 100", 4, 3, 3, 450, 1],
  ["PPE & infection control", "3-ply face masks", "box of 50", 7, 4, 3, 180, 2],
  ["PPE & infection control", "N95 respirators", "box of 20", 3, 2, 5, 900, 0.5],
  ["PPE & infection control", "Face shields", "pack of 10", 4, 2, 5, 350, 0.5],
  ["PPE & infection control", "Disposable surgical caps", "pack of 100", 2, 1, 4, 300, 0.4],
  ["PPE & infection control", "Disposable gowns", "pack of 10", 3, 2, 5, 600, 0.7],
  ["PPE & infection control", "Shoe covers", "pack of 100", 2, 1, 4, 250, 0.3],
  ["PPE & infection control", "Patient bibs", "pack of 125", 3, 2, 4, 400, 0.8],
  ["PPE & infection control", "Headrest covers", "pack of 250", 2, 1, 5, 500, 0.3],
  ["PPE & infection control", "Barrier film / plastic wrap", "roll", 3, 2, 5, 450, 0.5],
  ["PPE & infection control", "Surface disinfectant", "1 L bottle", 4, 3, 4, 650, 1],
  ["PPE & infection control", "Surface disinfectant wipes", "tub of 100", 3, 3, 4, 550, 1.2],
  ["PPE & infection control", "Hand sanitiser", "500 ml", 5, 3, 3, 250, 1],
  ["PPE & infection control", "Hand wash", "500 ml", 4, 2, 3, 150, 0.6],
  ["PPE & infection control", "Pre-procedural mouthwash", "500 ml", 3, 2, 4, 300, 0.7],

  // ---------- Sterilisation ----------
  ["Sterilisation", "Sterilisation pouches – small", "box of 200", 3, 2, 5, 600, 0.6],
  ["Sterilisation", "Sterilisation pouches – medium", "box of 200", 2, 2, 5, 750, 0.8],
  ["Sterilisation", "Sterilisation pouches – large", "box of 200", 2, 1, 5, 900, 0.3],
  ["Sterilisation", "Chemical indicator strips", "pack of 250", 2, 1, 6, 800, 0.3],
  ["Sterilisation", "Bowie-Dick test packs", "pack of 10", 2, 1, 7, 1500, 0.25],
  ["Sterilisation", "Biological indicators", "pack of 25", 1, 1, 10, 3500, 0.1],
  ["Sterilisation", "Enzymatic instrument cleaner", "1 L", 3, 2, 5, 900, 0.5],
  ["Sterilisation", "Ultrasonic cleaning solution", "1 L", 2, 1, 5, 800, 0.3],
  ["Sterilisation", "Distilled water (autoclave)", "5 L can", 6, 4, 2, 120, 2],
  ["Sterilisation", "High-level disinfectant (glutaraldehyde 2%)", "5 L", 1, 1, 7, 1800, 0.15],

  // ---------- Disposables ----------
  ["Disposables", "Saliva ejectors", "pack of 100", 5, 3, 3, 250, 1.5],
  ["Disposables", "HVE suction tips", "pack of 100", 3, 2, 4, 450, 0.8],
  ["Disposables", "Cotton rolls", "pack of 500", 4, 3, 3, 200, 1.2],
  ["Disposables", "Cotton pellets", "jar", 3, 2, 3, 150, 0.6],
  ["Disposables", "Gauze swabs", "pack of 100", 5, 3, 3, 220, 1.5],
  ["Disposables", "Disposable syringes 2 ml", "box of 100", 2, 1, 4, 400, 0.4],
  ["Disposables", "Irrigation syringes", "box of 100", 2, 1, 4, 600, 0.4],
  ["Disposables", "Dental needles 27G short", "box of 100", 2, 2, 5, 650, 0.6],
  ["Disposables", "Dental needles 30G short", "box of 100", 1, 1, 5, 650, 0.3],
  ["Disposables", "Disposable tumblers", "pack of 100", 6, 3, 3, 150, 1.5],
  ["Disposables", "Disposable 3-way syringe tips", "pack of 250", 2, 1, 5, 900, 0.3],
  ["Disposables", "Micro-brush applicators", "pack of 100", 3, 2, 4, 250, 0.6],
  ["Disposables", "Mixing pads", "pad", 4, 2, 4, 120, 0.5],
  ["Disposables", "Dappen dishes (disposable)", "pack of 100", 2, 1, 5, 300, 0.2],

  // ---------- Local anaesthesia ----------
  ["Local anaesthesia", "Lignocaine 2% + adrenaline cartridges", "box of 50", 3, 2, 4, 1400, 0.8],
  ["Local anaesthesia", "Lignocaine 2% plain vials", "vial 30 ml", 4, 2, 4, 90, 0.6],
  ["Local anaesthesia", "Articaine 4% cartridges", "box of 50", 2, 1, 6, 2600, 0.4],
  ["Local anaesthesia", "Topical anaesthetic gel", "tube", 2, 1, 5, 350, 0.3],

  // ---------- Restorative ----------
  ["Restorative", "Composite resin A2", "syringe 4 g", 4, 3, 5, 1100, 0.8],
  ["Restorative", "Composite resin A3", "syringe 4 g", 3, 2, 5, 1100, 0.6],
  ["Restorative", "Flowable composite", "syringe 2 g", 3, 2, 5, 900, 0.5],
  ["Restorative", "Bonding agent", "bottle 5 ml", 2, 2, 5, 2200, 0.4],
  ["Restorative", "Etchant gel 37%", "syringe", 4, 2, 4, 250, 0.6],
  ["Restorative", "Glass ionomer – restorative", "kit", 2, 1, 6, 1600, 0.3],
  ["Restorative", "Glass ionomer – luting", "kit", 2, 1, 6, 1500, 0.3],
  ["Restorative", "Resin-modified glass ionomer", "kit", 1, 1, 6, 2400, 0.2],
  ["Restorative", "Calcium hydroxide liner", "kit", 2, 1, 6, 700, 0.2],
  ["Restorative", "MTA", "pack", 1, 1, 10, 4500, 0.1],
  ["Restorative", "Temporary filling material", "jar", 3, 2, 4, 450, 0.5],
  ["Restorative", "Matrix bands", "pack of 12", 4, 2, 5, 300, 0.5],
  ["Restorative", "Sectional matrix system refills", "pack", 2, 1, 7, 1800, 0.2],
  ["Restorative", "Wooden wedges", "pack of 100", 3, 1, 5, 250, 0.3],
  ["Restorative", "Articulating paper", "book of 12", 5, 2, 4, 150, 0.6],
  ["Restorative", "Composite polishing kit", "kit", 1, 1, 7, 2800, 0.05],
  ["Restorative", "Polishing strips", "pack of 100", 2, 1, 5, 450, 0.2],

  // ---------- Endodontics ----------
  ["Endodontics", "K-files 15–40 (25 mm)", "pack of 6", 1, 5, 5, 300, 2],
  ["Endodontics", "H-files 15–40 (25 mm)", "pack of 6", 4, 3, 5, 320, 0.8],
  ["Endodontics", "Rotary NiTi files", "pack of 6", 1, 4, 7, 2600, 1.2],
  ["Endodontics", "Gutta-percha points", "box of 120", 3, 2, 5, 450, 0.6],
  ["Endodontics", "Paper points", "box of 200", 3, 2, 5, 350, 0.6],
  ["Endodontics", "Root canal sealer", "kit", 2, 1, 6, 1800, 0.3],
  ["Endodontics", "Sodium hypochlorite 3%", "500 ml", 4, 2, 3, 200, 0.8],
  ["Endodontics", "EDTA solution 17%", "bottle", 2, 1, 5, 450, 0.3],
  ["Endodontics", "Chlorhexidine 2% irrigant", "bottle", 2, 1, 5, 400, 0.3],
  ["Endodontics", "Side-vented irrigation needles", "pack of 100", 2, 1, 5, 900, 0.3],
  ["Endodontics", "Rubber dam sheets", "box of 36", 2, 1, 6, 800, 0.3],
  ["Endodontics", "Intracanal medicament (Ca(OH)2 paste)", "syringe", 3, 2, 5, 350, 0.5],

  // ---------- Prosthodontics & impressions ----------
  ["Prosthodontics & impressions", "Alginate impression material", "500 g pack", 4, 3, 4, 450, 1],
  ["Prosthodontics & impressions", "Addition silicone putty", "kit", 2, 1, 6, 3200, 0.3],
  ["Prosthodontics & impressions", "Addition silicone light body", "cartridge", 3, 2, 6, 1200, 0.5],
  ["Prosthodontics & impressions", "Mixing tips (silicone)", "pack of 50", 2, 1, 6, 900, 0.3],
  ["Prosthodontics & impressions", "Disposable impression trays", "pack of 10", 4, 2, 5, 350, 0.6],
  ["Prosthodontics & impressions", "Bite registration material", "cartridge", 2, 1, 6, 1100, 0.2],
  ["Prosthodontics & impressions", "Gingival retraction cord", "bottle", 3, 1, 6, 900, 0.3],
  ["Prosthodontics & impressions", "Temporary crown material", "cartridge", 2, 1, 6, 2400, 0.3],
  ["Prosthodontics & impressions", "Temporary cement", "kit", 2, 1, 5, 800, 0.3],
  ["Prosthodontics & impressions", "Resin cement", "kit", 1, 1, 7, 4200, 0.15],

  // ---------- Burs & rotary ----------
  ["Burs & rotary", "Diamond burs – round", "pack of 5", 6, 4, 4, 400, 1],
  ["Burs & rotary", "Diamond burs – flame / taper", "pack of 5", 6, 4, 4, 400, 1],
  ["Burs & rotary", "Carbide burs", "pack of 5", 4, 2, 5, 600, 0.5],
  ["Burs & rotary", "Endo access burs", "pack of 5", 3, 2, 5, 650, 0.4],
  ["Burs & rotary", "Prophy cups", "pack of 100", 3, 2, 5, 500, 0.4],
  ["Burs & rotary", "Prophy paste", "jar", 3, 2, 5, 600, 0.4],
  ["Burs & rotary", "Handpiece lubricant spray", "can", 2, 1, 6, 1200, 0.2],

  // ---------- Oral surgery & periodontics ----------
  ["Oral surgery & periodontics", "Silk sutures 3-0", "box of 12", 3, 2, 5, 900, 0.5],
  ["Oral surgery & periodontics", "Absorbable sutures 4-0", "box of 12", 2, 1, 6, 2400, 0.3],
  ["Oral surgery & periodontics", "Surgical blades #15", "box of 100", 2, 1, 5, 700, 0.2],
  ["Oral surgery & periodontics", "Absorbable gelatin sponge", "pack of 10", 3, 2, 5, 600, 0.4],
  ["Oral surgery & periodontics", "Dry socket paste", "jar", 1, 1, 7, 900, 0.1],
  ["Oral surgery & periodontics", "Periodontal dressing", "kit", 1, 1, 7, 1200, 0.1],
  ["Oral surgery & periodontics", "Bone graft (sample)", "0.5 g vial", 2, 1, 10, 4500, 0.1],

  // ---------- Radiology ----------
  ["Radiology", "Sensor barrier sleeves", "box of 500", 2, 1, 6, 1200, 0.3],
  ["Radiology", "X-ray positioning bite blocks", "pack of 100", 2, 1, 6, 900, 0.2],
  ["Radiology", "IOPA films (if analog)", "box of 150", 1, 1, 7, 3200, 0.1],

  // ---------- Orthodontics ----------
  ["Orthodontics", "Bracket kits (MBT 0.022)", "kit", 3, 2, 10, 2500, 0.3],
  ["Orthodontics", "NiTi archwires", "pack of 10", 3, 2, 7, 900, 0.4],
  ["Orthodontics", "Elastomeric ligatures", "pack", 4, 2, 7, 400, 0.5],
  ["Orthodontics", "Orthodontic bonding adhesive", "kit", 1, 1, 10, 3800, 0.1],
  ["Orthodontics", "Intra-oral elastics", "pack of 100", 3, 2, 7, 300, 0.3],

  // ---------- Paediatric & preventive ----------
  ["Paediatric & preventive", "Fluoride varnish", "pack of 50 doses", 2, 1, 6, 2200, 0.2],
  ["Paediatric & preventive", "Pit & fissure sealant", "syringe", 2, 1, 6, 1400, 0.2],
  ["Paediatric & preventive", "Stainless steel crowns", "refill pack", 2, 1, 10, 1800, 0.1],

  // ---------- Emergency kit (check expiry) ----------
  ["Emergency kit (check expiry)", "Oxygen cylinder – refill", "cylinder", 1, 1, 2, 600, 0.05],
  ["Emergency kit (check expiry)", "Adrenaline 1:1000 ampoules", "pack of 5", 1, 1, 3, 250, 0.05],
  ["Emergency kit (check expiry)", "Salbutamol inhaler", "inhaler", 1, 1, 3, 150, 0.02],
  ["Emergency kit (check expiry)", "Glucose (oral)", "pack", 2, 1, 2, 80, 0.05],
  ["Emergency kit (check expiry)", "Disposable airway / face mask set", "set", 1, 1, 7, 900, 0.02],

  // ---------- Dental lab materials ----------
  ["Dental lab materials", "Dental plaster (Type II)", "1 kg", 6, 4, 4, 120, 2],
  ["Dental lab materials", "Dental stone (Type III)", "1 kg", 5, 4, 4, 220, 1.5],
  ["Dental lab materials", "Die stone (Type IV)", "1 kg", 3, 2, 6, 650, 0.5],
  ["Dental lab materials", "Self-cure acrylic (powder + liquid)", "kit", 2, 2, 5, 900, 0.5],
  ["Dental lab materials", "Heat-cure acrylic", "kit", 2, 1, 6, 1100, 0.3],
  ["Dental lab materials", "Modelling wax sheets", "box", 3, 2, 5, 350, 0.5],
  ["Dental lab materials", "Sticky wax", "box", 2, 1, 5, 250, 0.2],
  ["Dental lab materials", "Separating medium", "bottle", 2, 1, 5, 300, 0.3],
  ["Dental lab materials", "Denture teeth sets", "set", 6, 4, 10, 450, 0.8],
  ["Dental lab materials", "Investment material", "kg", 2, 1, 7, 900, 0.2],
  ["Dental lab materials", "Pumice (polishing)", "kg", 2, 1, 5, 200, 0.2],
  ["Dental lab materials", "Acrylic trimming burs", "pack of 5", 3, 2, 5, 500, 0.3]
];

// Sample lab partners (fictional)
const LABS = ["In-house lab", "Partner Lab A", "Partner Lab B"];

// Sample lab cases. Case IDs only: no patient names or personal data.
const SAMPLE_CASES = [
  { id: "LC-1041", type: "PFM crown", teeth: "36", shade: "A2", lab: "Partner Lab A", sent: -9, due: -2, status: "In progress", cost: 2500 },
  { id: "LC-1042", type: "Zirconia crown", teeth: "11", shade: "A1", lab: "Partner Lab B", sent: -6, due: 2, status: "In progress", cost: 6500 },
  { id: "LC-1043", type: "Complete denture (upper)", teeth: "Upper arch", shade: "A3", lab: "In-house lab", sent: -12, due: -1, status: "Trial", cost: 4000 },
  { id: "LC-1044", type: "3-unit bridge (PFM)", teeth: "45–47", shade: "A3", lab: "Partner Lab A", sent: -4, due: 5, status: "Sent", cost: 7500 },
  { id: "LC-1045", type: "Night guard", teeth: "Upper arch", shade: "—", lab: "In-house lab", sent: -3, due: 3, status: "Sent", cost: 1500 },
  { id: "LC-1046", type: "Removable partial denture", teeth: "Lower arch", shade: "A2", lab: "Partner Lab B", sent: -15, due: -5, status: "Received", cost: 3500 },
  { id: "LC-1047", type: "Ortho retainer (Hawley)", teeth: "Both arches", shade: "—", lab: "In-house lab", sent: -2, due: 4, status: "Sent", cost: 1800 },
  { id: "LC-1048", type: "Implant crown", teeth: "46", shade: "A2", lab: "Partner Lab B", sent: -10, due: 1, status: "In progress", cost: 9000 },
  { id: "LC-1049", type: "Zirconia crown", teeth: "26", shade: "A3", lab: "Partner Lab A", sent: -20, due: -10, status: "Fitted", cost: 6500 },
  { id: "LC-1050", type: "PFM crown", teeth: "14", shade: "A2", lab: "Partner Lab A", sent: -8, due: -3, status: "Remake", cost: 2500 }
];

const CASE_STATUSES = ["Sent", "In progress", "Trial", "Received", "Fitted", "Remake"];
