import { useState, useEffect } from "react";

// ─── FLEET ────────────────────────────────────────────────────────────────────
const ISO_TANKS = [
  { id: "T11-24K", label: "T11 — 24,000 L", size: 24000, tare: 3650, maxGross: 36000, notes: "24,000L · T11 rated · food & industrial grade" },
  { id: "T11-25K", label: "T11 — 25,000 L", size: 25000, tare: 3750, maxGross: 36000, notes: "25,000L · T11 rated · food & industrial grade" },
  { id: "T11-26K", label: "T11 — 26,000 L", size: 26000, tare: 3850, maxGross: 36000, notes: "26,000L · T11 rated · food & industrial grade" },
];

const WW_GVW_KG = 36000;   // Tank structural max — default

// Per-country gross weight limits (kg) for ISO tank road transport
// Based on federal/national highway regulations as applied to 20ft ISO tank containers
const COUNTRY_GVW = {
  // North America — strict federal highway cap
  "USA":              { kg: 23995, note: "US federal highway limit — 23,995 kg gross (incl. tare)" },
  "Canada":           { kg: 23995, note: "Canadian national highway limit — 23,995 kg gross (incl. tare)" },
  "Mexico":           { kg: 24000, note: "Mexican federal highway limit (SCT NOM-012)" },

  // Oceania — state-based conservative standard chassis limit
  "Australia":        { kg: 26000, note: "Australian road limit on standard B-double chassis" },
  "New Zealand":      { kg: 26000, note: "NZ road limit on standard articulated combination" },

  // East & SE Asia — national road limits constrain ISO tanks
  "Japan":            { kg: 28000, note: "Japan road vehicle law gross limit for semi-trailer" },
  "China":            { kg: 30000, note: "China GB1589 gross limit for 6-axle semi-trailer (tank)" },
  "South Korea":      { kg: 30000, note: "Korea road limit for semi-trailer combination" },
  "Taiwan":           { kg: 28000, note: "Taiwan highway vehicle weight regulation" },
  "Myanmar":          { kg: 21000, note: "Myanmar road limit (lower infrastructure standard)" },

  // South Asia
  "India":            { kg: 30000, note: "India MV Act gross limit for articulated vehicle" },
  "Bangladesh":       { kg: 24000, note: "Bangladesh road transport limit" },
  "Pakistan":         { kg: 30000, note: "Pakistan NHA gross vehicle weight limit" },
  "Sri Lanka":        { kg: 24000, note: "Sri Lanka road transport gross limit" },

  // Default to tank structural max for all other countries
};

// Helper — get effective GVW limit for a country
function getCountryGVW(country) {
  return COUNTRY_GVW[country] || { kg: WW_GVW_KG, note: "Tank structural maximum (36,000 kg)" };
}

// ─── ALL COUNTRIES ────────────────────────────────────────────────────────────
const ALL_COUNTRIES = [
  "Argentina","Australia","Austria","Bangladesh","Belgium","Brazil",
  "Canada",   // NA limit applies
  "Chile","China","Colombia","Denmark","Egypt","Finland","France",
  "Germany","Greece","Hong Kong","India","Indonesia","Ireland","Israel",
  "Italy","Japan","Jordan","Kenya","Malaysia","Mexico","Morocco",
  "Myanmar","Netherlands","New Zealand","Nigeria","Norway","Oman",
  "Pakistan","Peru","Philippines","Poland","Portugal","Qatar",
  "Saudi Arabia","Singapore","South Africa","South Korea","Spain",
  "Sri Lanka","Sweden","Switzerland","Taiwan","Thailand","Turkey","UAE",
  "Ukraine","United Kingdom",
  "USA",      // NA limit applies
  "Vietnam","Zambia",
];

const NA_COUNTRIES = new Set(["USA","Canada","Mexico"]); // kept for legacy pill color logic

// ─── PRODUCTS ─────────────────────────────────────────────────────────────────
const COMMON_PRODUCTS = [
  { name:"Methanol",              sg:0.791, dg:true,  un:"UN1230", pg:"II",  cls:"3",   minFill:80, maxFill:95 },
  { name:"Ethanol",               sg:0.789, dg:true,  un:"UN1170", pg:"II",  cls:"3",   minFill:80, maxFill:95 },
  { name:"Isopropanol (IPA)",     sg:0.786, dg:true,  un:"UN1219", pg:"II",  cls:"3",   minFill:80, maxFill:95 },
  { name:"Toluene",               sg:0.867, dg:true,  un:"UN1294", pg:"II",  cls:"3",   minFill:80, maxFill:95 },
  { name:"Acetone",               sg:0.791, dg:true,  un:"UN1090", pg:"II",  cls:"3",   minFill:80, maxFill:95 },
  { name:"Ethyl Acetate",         sg:0.897, dg:true,  un:"UN1173", pg:"II",  cls:"3",   minFill:80, maxFill:95 },
  { name:"Xylene",                sg:0.864, dg:true,  un:"UN1307", pg:"III", cls:"3",   minFill:80, maxFill:95 },
  { name:"Caustic Soda 50%",      sg:1.525, dg:true,  un:"UN1824", pg:"II",  cls:"8",   minFill:80, maxFill:95 },
  { name:"Hydrochloric Acid 32%", sg:1.159, dg:true,  un:"UN1789", pg:"III", cls:"8",   minFill:80, maxFill:97 },
  { name:"Phosphoric Acid 85%",   sg:1.685, dg:true,  un:"UN1805", pg:"III", cls:"8",   minFill:80, maxFill:97 },
  { name:"Sulfuric Acid 98%",     sg:1.840, dg:true,  un:"UN1830", pg:"II",  cls:"8",   minFill:80, maxFill:93 },
  { name:"Acetic Acid 80%",       sg:1.064, dg:true,  un:"UN2790", pg:"III", cls:"8",   minFill:80, maxFill:97 },
  { name:"Hydrogen Peroxide 50%", sg:1.196, dg:true,  un:"UN2014", pg:"II",  cls:"5.1", minFill:80, maxFill:90 },
  { name:"Formaldehyde 37%",      sg:1.090, dg:true,  un:"UN1198", pg:"III", cls:"3",   minFill:80, maxFill:97 },
  { name:"Crude Palm Oil (CPO)",  sg:0.891, dg:false, un:"",       pg:"",    cls:"",    minFill:85, maxFill:98 },
  { name:"Refined Palm Olein",    sg:0.900, dg:false, un:"",       pg:"",    cls:"",    minFill:85, maxFill:98 },
  { name:"Refined Palm Stearin",  sg:0.904, dg:false, un:"",       pg:"",    cls:"",    minFill:85, maxFill:98 },
  { name:"Soybean Oil (RBD)",     sg:0.919, dg:false, un:"",       pg:"",    cls:"",    minFill:85, maxFill:98 },
  { name:"Sunflower Oil",         sg:0.920, dg:false, un:"",       pg:"",    cls:"",    minFill:85, maxFill:98 },
  { name:"Canola Oil",            sg:0.915, dg:false, un:"",       pg:"",    cls:"",    minFill:85, maxFill:98 },
  { name:"Coconut Oil (RBD)",     sg:0.912, dg:false, un:"",       pg:"",    cls:"",    minFill:85, maxFill:98 },
  { name:"Glycerin 99.5%",        sg:1.261, dg:false, un:"",       pg:"",    cls:"",    minFill:85, maxFill:98 },
  { name:"Propylene Glycol",      sg:1.036, dg:false, un:"",       pg:"",    cls:"",    minFill:85, maxFill:98 },
  { name:"Ethylene Glycol",       sg:1.113, dg:false, un:"",       pg:"",    cls:"",    minFill:85, maxFill:98 },
  { name:"Latex (Natural Rubber)",sg:0.960, dg:false, un:"",       pg:"",    cls:"",    minFill:85, maxFill:98 },
  { name:"Molasses",              sg:1.400, dg:false, un:"",       pg:"",    cls:"",    minFill:85, maxFill:97 },
  { name:"Corn Syrup",            sg:1.380, dg:false, un:"",       pg:"",    cls:"",    minFill:85, maxFill:97 },
  { name:"Water / Aqueous Sol.",  sg:1.000, dg:false, un:"",       pg:"",    cls:"",    minFill:85, maxFill:98 },
  { name:"Liquid Fertilizer (UAN)",sg:1.280,dg:false, un:"",       pg:"",    cls:"",    minFill:85, maxFill:97 },
];

// ─── CALCULATION ENGINE ───────────────────────────────────────────────────────
// Returns MIN and MAX permitted volume & weight for each tank,
// constrained by BOTH fill % limits AND gross weight limit.
function calculateAllocation({ sg, minFill, maxFill, gwLimit }) {
  return ISO_TANKS.map(tank => {
    const effectiveLimit = Math.min(gwLimit, tank.maxGross);
    const maxCargoByWeight = effectiveLimit - tank.tare;

    // ── MAX side (highest permitted load) ──────────────────────────────
    const maxVolByFill   = tank.size * (maxFill / 100);          // vol at max fill %
    const maxVolByWeight = maxCargoByWeight / sg;                 // vol at weight limit
    const maxVol         = Math.min(maxVolByFill, maxVolByWeight); // binding constraint
    const maxFillPct     = (maxVol / tank.size) * 100;
    const maxCargoKg     = Math.round(maxVol * sg);
    const maxGrossKg     = maxCargoKg + tank.tare;
    const maxLimitedByWeight = maxVolByWeight < maxVolByFill;

    // ── MIN side (lowest permitted load) ──────────────────────────────
    const minVol         = tank.size * (minFill / 100);          // vol at min fill %
    const minCargoKg     = Math.round(minVol * sg);
    const minGrossKg     = minCargoKg + tank.tare;
    // Check if minimum load itself exceeds weight limit
    const minExceedsLimit = minGrossKg > effectiveLimit;

    const isViable = !minExceedsLimit && maxVol >= minVol;

    const warnings = [];
    if (minExceedsLimit)
      warnings.push(`Min fill ${minFill}% already exceeds ${effectiveLimit.toLocaleString()} kg limit (${minGrossKg.toLocaleString()} kg)`);
    if (maxLimitedByWeight && !minExceedsLimit)
      warnings.push(`Weight limit caps max fill at ${maxFillPct.toFixed(1)}% — below product max of ${maxFill}%`);
    if (sg > 1.5)
      warnings.push("High SG — verify pump, hose & valve pressure ratings");

    const limitingFactor = maxLimitedByWeight ? `${effectiveLimit.toLocaleString()} kg gross limit` : `${maxFill}% max fill`;

    return {
      tank, isViable, warnings, effectiveLimit, limitingFactor, maxLimitedByWeight,
      // MIN
      minVol:     Math.round(minVol),
      minCargoKg,
      minGrossKg,
      minFillPct: minFill,
      // MAX
      maxVol:     Math.round(maxVol),
      maxCargoKg,
      maxGrossKg,
      maxFillPct: maxFillPct.toFixed(1),
      // Headroom at max load
      headroomKg: Math.max(0, effectiveLimit - maxGrossKg),
    };
  });
}

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export default function ISOTankAllocator() {
  const [destination, setDestination]     = useState("");
  const [isDG, setIsDG]                   = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [customSG, setCustomSG]           = useState("");
  const [customMinFill, setCustomMinFill] = useState("");
  const [customMaxFill, setCustomMaxFill] = useState("");
  const [results, setResults]             = useState(null);
  const [showDropdown, setShowDropdown]   = useState(false);
  const [aiAnalysis, setAiAnalysis]       = useState("");
  const [loadingAI, setLoadingAI]         = useState(false);
  const [activeTab, setActiveTab]         = useState("calculator");

  const isNA        = NA_COUNTRIES.has(destination);
  const countryGVW  = destination ? getCountryGVW(destination) : { kg: WW_GVW_KG, note: "Tank structural maximum (36,000 kg)" };
  const gwLimit     = countryGVW.kg;
  const isRestricted = gwLimit < WW_GVW_KG;

  const filteredProducts = COMMON_PRODUCTS
    .filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()))
    .slice(0, 10);

  const effectiveSG      = parseFloat(customSG)      || selectedProduct?.sg      || null;
  const effectiveMinFill = 80;                  // Always 80% of tank capacity
  const effectiveMaxFill = isDG ? 95 : 97;      // 95% for DG, 97% for Non-DG
  const canCalculate     = !!effectiveSG && !!destination;

  useEffect(() => {
    if (canCalculate) {
      setResults(calculateAllocation({
        sg: effectiveSG, minFill: effectiveMinFill,
        maxFill: effectiveMaxFill, gwLimit,
      }));
    } else {
      setResults(null);
    }
    setAiAnalysis("");
  }, [effectiveSG, effectiveMinFill, effectiveMaxFill, destination]);

  const handleAIAnalysis = async () => {
    if (!results || !canCalculate) return;
    setLoadingAI(true); setAiAnalysis("");
    const viable = results.filter(r => r.isViable);

    const prompt = `You are a bulk liquid ISO tank logistics expert. Analyse this T11 ISO tank allocation showing MIN and MAX permitted loading ranges.

FLEET: T11 ISO tanks — 24,000L (tare 3,650kg), 25,000L (tare 3,750kg), 26,000L (tare 3,850kg)
WEIGHT LIMIT: ${isRestricted ? `${gwLimit.toLocaleString()} kg gross — ${countryGVW.note}` : `36,000 kg tank structural max (worldwide)`}
Product: ${selectedProduct?.name || "Custom product"}
SG: ${effectiveSG}
DG: ${isDG ? `YES — Class ${selectedProduct?.cls || "?"}, ${selectedProduct?.un || "UN TBC"}, PG ${selectedProduct?.pg || "?"}` : "Non-DG"}
Fill Range: ${effectiveMinFill}% min — ${effectiveMaxFill}% max
Destination: ${destination}

ALLOCATION RESULTS (MIN → MAX permitted):
${viable.map(r =>
  `${r.tank.label}:
  MIN: ${r.minVol.toLocaleString()}L / ${r.minCargoKg.toLocaleString()}kg cargo / ${r.minGrossKg.toLocaleString()}kg gross @ ${r.minFillPct}% fill
  MAX: ${r.maxVol.toLocaleString()}L / ${r.maxCargoKg.toLocaleString()}kg cargo / ${r.maxGrossKg.toLocaleString()}kg gross @ ${r.maxFillPct}% fill
  Limited by: ${r.limitingFactor} | Headroom at max: ${r.headroomKg.toLocaleString()}kg
  ${r.warnings.length ? "WARNINGS: " + r.warnings.join("; ") : ""}`
).join("\n\n")}
Non-viable: ${results.filter(r => !r.isViable).map(r => `${r.tank.label} (${r.warnings[0]})`).join(", ") || "None"}

Provide:
1. **BEST TANK** — which T11 size maximises cargo yield and why, reference the MAX load figures
2. **LOAD RANGE NOTE** — practical guidance on operating between MIN and MAX (when to load min vs max)
3. **OPERATIONAL NOTES** — temperature, cleaning standard, inert gas blanket if needed
4. **${isDG ? "DG COMPLIANCE" : "NON-DG HANDLING"}** — key requirements for ${destination}
5. **RISK FLAG** — one sentence on the biggest risk for this shipment

Under 320 words. Bold headers. Direct and operational.`;

    try {
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1000, messages:[{role:"user",content:prompt}] })
      });
      const data = await resp.json();
      setAiAnalysis(data.content?.map(c => c.text||"").join("\n") || "No response.");
    } catch { setAiAnalysis("AI analysis unavailable. Check connection."); }
    setLoadingAI(false);
  };

  const viable    = results?.filter(r => r.isViable) || [];
  const nonViable = results?.filter(r => !r.isViable) || [];
  const bestIdx   = viable.length > 0
    ? viable.reduce((bi,r,i) => r.maxCargoKg > viable[bi].maxCargoKg ? i : bi, 0)
    : -1;

  // ─── CSS ──────────────────────────────────────────────────────────────────
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');
    *{box-sizing:border-box;margin:0;padding:0;}
    ::-webkit-scrollbar{width:4px;} ::-webkit-scrollbar-track{background:#0A0F1E;} ::-webkit-scrollbar-thumb{background:#1E3A5F;border-radius:2px;}

    .hdr{background:linear-gradient(160deg,#071830 0%,#060A14 100%);padding:20px 32px 16px;border-bottom:1px solid rgba(0,180,255,0.12);position:relative;}
    .hdr::after{content:'';position:absolute;bottom:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(0,180,255,0.4),transparent);}
    .eyebrow{font-family:'DM Mono',monospace;font-size:10px;letter-spacing:3px;color:#0090FF;text-transform:uppercase;margin-bottom:5px;}
    .htitle{font-family:'Bebas Neue',sans-serif;font-size:38px;letter-spacing:3px;color:#F0F6FF;line-height:1;margin-bottom:4px;}
    .hsub{font-family:'DM Mono',monospace;font-size:11px;color:#4A6A8A;letter-spacing:1px;}

    .wpill{display:inline-flex;align-items:center;gap:7px;border-radius:5px;padding:5px 14px;font-family:'DM Mono',monospace;font-size:11px;letter-spacing:1px;margin-top:9px;transition:all 0.35s;}
    .wpill.na{background:rgba(255,140,0,0.12);border:1px solid rgba(255,140,0,0.4);color:#FFA030;}
    .wpill.ww{background:rgba(0,144,255,0.1);border:1px solid rgba(0,144,255,0.3);color:#4DB8FF;}

    .tabs{display:flex;padding:0 32px;background:#07122A;border-bottom:1px solid rgba(255,255,255,0.05);}
    .tab{padding:12px 20px;font-family:'DM Mono',monospace;font-size:11px;letter-spacing:2px;text-transform:uppercase;cursor:pointer;color:#4A6A8A;border-bottom:2px solid transparent;transition:all 0.2s;}
    .tab.on{color:#0090FF;border-bottom-color:#0090FF;} .tab:hover{color:#DCE4F0;}

    .layout{display:flex;min-height:calc(100vh - 146px);}
    .lp{width:330px;flex-shrink:0;padding:20px;border-right:1px solid rgba(255,255,255,0.05);background:rgba(7,18,42,0.5);overflow-y:auto;}
    .rp{flex:1;padding:20px;overflow-y:auto;}

    .stitle{font-family:'DM Mono',monospace;font-size:10px;letter-spacing:3px;color:#0090FF;text-transform:uppercase;margin-bottom:10px;padding-bottom:6px;border-bottom:1px solid rgba(0,144,255,0.15);}
    .fg{margin-bottom:15px;}
    .fl{font-family:'DM Mono',monospace;font-size:10px;letter-spacing:1.5px;color:#6B8AAA;text-transform:uppercase;margin-bottom:5px;display:block;}
    .fi{width:100%;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:6px;padding:9px 12px;color:#DCE4F0;font-family:'DM Mono',monospace;font-size:13px;outline:none;transition:border-color 0.2s;}
    .fi:focus{border-color:rgba(0,144,255,0.4);background:rgba(0,144,255,0.04);} .fi::placeholder{color:#2A4060;}
    .fi option{background:#0D1E3A;color:#DCE4F0;}

    .tg{display:flex;gap:7px;}
    .tb{flex:1;padding:8px 10px;border-radius:6px;border:1px solid rgba(255,255,255,0.08);background:transparent;color:#6B8AAA;font-family:'DM Mono',monospace;font-size:11px;letter-spacing:1px;cursor:pointer;transition:all 0.15s;text-transform:uppercase;}
    .tb.adg{background:rgba(255,60,60,0.15);border-color:rgba(255,60,60,0.4);color:#FF6B6B;}
    .tb.anon{background:rgba(0,200,120,0.12);border-color:rgba(0,200,120,0.3);color:#00C878;}

    .dd{position:absolute;top:100%;left:0;right:0;background:#0D1E3A;border:1px solid rgba(0,144,255,0.2);border-radius:0 0 8px 8px;z-index:50;max-height:250px;overflow-y:auto;}
    .ddo{padding:9px 12px;cursor:pointer;font-family:'DM Mono',monospace;font-size:12px;display:flex;justify-content:space-between;align-items:center;transition:background 0.1s;border-bottom:1px solid rgba(255,255,255,0.03);}
    .ddo:hover{background:rgba(0,144,255,0.1);}
    .dgb{font-size:9px;padding:2px 6px;border-radius:2px;font-family:'DM Mono',monospace;letter-spacing:1px;}
    .dgy{background:rgba(255,60,60,0.15);color:#FF6B6B;border:1px solid rgba(255,60,60,0.3);}
    .dgn{background:rgba(0,200,120,0.1);color:#00C878;border:1px solid rgba(0,200,120,0.2);}

    .wbox{border-radius:6px;padding:11px 13px;transition:all 0.3s;margin-top:0;}
    .wbox.na{background:rgba(255,140,0,0.06);border:1px solid rgba(255,140,0,0.2);}
    .wbox.ww{background:rgba(0,144,255,0.05);border:1px solid rgba(0,144,255,0.15);}
    .wbox-lbl{font-family:'DM Mono',monospace;font-size:10px;letter-spacing:1px;margin-bottom:6px;}
    .wbox.na .wbox-lbl{color:#FFA030;} .wbox.ww .wbox-lbl{color:#4DB8FF;}
    .wbox-body{font-family:'DM Mono',monospace;font-size:11px;line-height:2;}
    .wbox.na .wbox-body{color:#D0B070;} .wbox.ww .wbox-body{color:#80A8D0;}

    /* Result cards */
    .rc{background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:20px;margin-bottom:14px;position:relative;transition:all 0.2s;}
    .rc:hover{border-color:rgba(255,255,255,0.13);}
    .rc.best{border-color:rgba(0,200,120,0.35);background:rgba(0,200,120,0.03);}
    .rc.best::before{content:'★ BEST YIELD';position:absolute;top:12px;right:14px;font-family:'DM Mono',monospace;font-size:9px;letter-spacing:2px;color:#00C878;background:rgba(0,200,120,0.1);padding:3px 8px;border-radius:2px;border:1px solid rgba(0,200,120,0.25);}
    .rc.warn{border-color:rgba(255,180,0,0.2);}
    .rc.fail{border-color:rgba(255,60,60,0.15);opacity:0.5;}

    .tlabel{font-family:'Bebas Neue',sans-serif;font-size:24px;letter-spacing:2px;color:#F0F6FF;margin-bottom:2px;}
    .tsub{font-family:'DM Mono',monospace;font-size:11px;color:#4A6A8A;margin-bottom:16px;}

    /* MIN/MAX range grid */
    .range-grid{display:grid;grid-template-columns:1fr 3px 1fr;gap:0;margin-bottom:12px;border-radius:8px;overflow:hidden;}
    .range-half{padding:14px 16px;background:rgba(0,0,0,0.25);}
    .range-half.min-half{background:rgba(0,60,120,0.2);border:1px solid rgba(0,144,255,0.15);border-right:none;border-radius:8px 0 0 8px;}
    .range-half.max-half{background:rgba(0,80,50,0.2);border:1px solid rgba(0,200,120,0.15);border-left:none;border-radius:0 8px 8px 0;}
    .range-divider{background:rgba(255,255,255,0.08);width:1px;}
    .range-header{font-family:'DM Mono',monospace;font-size:10px;letter-spacing:2px;text-transform:uppercase;margin-bottom:10px;}
    .range-half.min-half .range-header{color:#4DB8FF;}
    .range-half.max-half .range-header{color:#00C878;}
    .range-row{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:5px;}
    .range-label{font-family:'DM Mono',monospace;font-size:10px;color:#4A6A8A;}
    .range-val{font-family:'Bebas Neue',sans-serif;font-size:18px;letter-spacing:1px;line-height:1;}
    .range-unit{font-family:'DM Mono',monospace;font-size:9px;color:#4A6A8A;letter-spacing:1px;margin-left:3px;}
    .range-sub{font-family:'DM Mono',monospace;font-size:10px;color:#4A6A8A;margin-top:2px;}

    /* fill bar */
    .fill-track{position:relative;height:8px;background:rgba(255,255,255,0.04);border-radius:4px;overflow:visible;margin:6px 0 10px;}
    .fill-range-bar{position:absolute;height:100%;border-radius:4px;background:linear-gradient(90deg,rgba(0,144,255,0.5),rgba(0,200,120,0.7));}
    .fill-tick{position:absolute;top:-3px;width:2px;height:14px;border-radius:1px;background:#FFA030;}
    .fill-labels{display:flex;justify-content:space-between;font-family:'DM Mono',monospace;font-size:10px;color:#4A6A8A;margin-top:2px;}

    /* weight compliance bar */
    .wt-bar-wrap{background:rgba(0,0,0,0.25);border-radius:6px;padding:10px 13px;margin-bottom:10px;}
    .wt-bar-row{display:flex;align-items:center;gap:8px;margin-bottom:6px;font-family:'DM Mono',monospace;font-size:11px;}
    .wt-bar-bg{flex:1;height:6px;background:rgba(255,255,255,0.05);border-radius:3px;overflow:hidden;}
    .wt-bar-fill{height:100%;border-radius:3px;transition:width 0.5s ease;}

    .wtag{display:inline-block;background:rgba(255,180,0,0.1);border:1px solid rgba(255,180,0,0.25);color:#FFB400;font-family:'DM Mono',monospace;font-size:10px;padding:3px 8px;border-radius:2px;margin:2px;}
    .ftag{display:inline-block;background:rgba(255,60,60,0.1);border:1px solid rgba(255,60,60,0.25);color:#FF6B6B;font-family:'DM Mono',monospace;font-size:10px;padding:3px 8px;border-radius:2px;margin:2px;}
    .oktag{display:inline-block;background:rgba(0,200,120,0.08);border:1px solid rgba(0,200,120,0.2);color:#00C878;font-family:'DM Mono',monospace;font-size:10px;padding:3px 8px;border-radius:2px;margin:2px;}

    .aip{background:rgba(0,144,255,0.04);border:1px solid rgba(0,144,255,0.15);border-radius:10px;padding:15px;margin-bottom:18px;}
    .aibtn{background:linear-gradient(135deg,#0060CC,#0090FF);border:none;border-radius:6px;padding:9px 18px;color:#fff;font-family:'DM Mono',monospace;font-size:11px;letter-spacing:2px;text-transform:uppercase;cursor:pointer;transition:all 0.2s;}
    .aibtn:hover{background:linear-gradient(135deg,#0070DD,#00A0FF);} .aibtn:disabled{opacity:0.45;cursor:not-allowed;}
    .aitxt{font-family:'DM Sans',sans-serif;font-size:13px;line-height:1.8;color:#B8CDE0;white-space:pre-wrap;margin-top:12px;}

    .srow{display:flex;gap:10px;margin-bottom:16px;flex-wrap:wrap;}
    .sbox{flex:1;min-width:100px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:8px;padding:10px 12px;}
    .snum{font-family:'Bebas Neue',sans-serif;font-size:22px;letter-spacing:2px;line-height:1;}
    .slbl{font-family:'DM Mono',monospace;font-size:10px;color:#4A6A8A;letter-spacing:1px;margin-top:3px;}

    .nores{text-align:center;padding:52px 20px;color:#2A4060;font-family:'DM Mono',monospace;font-size:12px;letter-spacing:1px;line-height:2.4;}

    .rt{width:100%;border-collapse:collapse;font-family:'DM Mono',monospace;font-size:11px;}
    .rt th{padding:9px 10px;text-align:left;background:rgba(0,144,255,0.08);color:#0090FF;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;border-bottom:1px solid rgba(0,144,255,0.15);}
    .rt td{padding:8px 10px;border-bottom:1px solid rgba(255,255,255,0.04);color:#9BB5D0;vertical-align:middle;}
    .rt tr:hover td{background:rgba(255,255,255,0.02);}

    .flinfo{background:rgba(0,144,255,0.05);border:1px solid rgba(0,144,255,0.15);border-radius:8px;padding:12px 14px;}
    .flrow{display:flex;justify-content:space-between;font-family:'DM Mono',monospace;font-size:11px;padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.04);}
    .flrow:last-child{border-bottom:none;} .flk{color:#6B8AAA;} .flv{color:#DCE4F0;}

    .pulse{animation:pulse 2s infinite;} @keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.4;}}
  `;

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily:"Georgia,serif", background:"#060A14", minHeight:"100vh", color:"#DCE4F0" }}>
      <style>{css}</style>

      {/* ── HEADER ── */}
      <div className="hdr">
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:"16px", flexWrap:"wrap" }}>
          <div>
            <div className="eyebrow">⚗ Bulk Liquid Operations · T11 Fleet Intelligence</div>
            <h1 className="htitle">ISO Tank Load Allocator</h1>
            <div className="hsub">T11 Only · 24,000 / 25,000 / 26,000 L · DG &amp; Non-DG · Worldwide</div>
            <div className={`wpill ${destination && isRestricted ? "na" : "ww"}`}>
              {destination && isRestricted
                ? `⚖ ${destination.toUpperCase()} — ROAD LIMIT: ${gwLimit.toLocaleString()} KG GROSS`
                : destination
                  ? `🌍 ${destination.toUpperCase()} — TANK STRUCTURAL MAX: 36,000 KG`
                  : "🌍 SELECT DESTINATION — WEIGHT LIMIT APPLIES AUTOMATICALLY"}
            </div>
          </div>
        </div>
      </div>

      {/* ── TABS ── */}
      <div className="tabs">
        {[["calculator","⚗ ALLOCATOR"],["fleet","🚢 FLEET"],["reference","📋 PRODUCTS"]].map(([id,lbl]) => (
          <div key={id} className={`tab ${activeTab===id?"on":""}`} onClick={() => setActiveTab(id)}>{lbl}</div>
        ))}
      </div>

      {/* ══════════════════════ CALCULATOR TAB ══════════════════════ */}
      {activeTab === "calculator" && (
        <div className="layout">

          {/* LEFT PANEL */}
          <div className="lp">
            <div className="fg">
              <span className="fl">Cargo Classification</span>
              <div className="tg">
                <button className={`tb ${!isDG?"anon":""}`} onClick={() => setIsDG(false)}>✅ Non-DG</button>
                <button className={`tb ${isDG?"adg":""}`}   onClick={() => setIsDG(true)}>⚠️ DG</button>
              </div>
            </div>

            {/* Product search */}
            <div className="fg" style={{ position:"relative" }}>
              <span className="fl">Product</span>
              <input className="fi" placeholder="Search product library..."
                value={productSearch}
                onChange={e => {
                  setProductSearch(e.target.value); setShowDropdown(true);
                  if (!e.target.value) { setSelectedProduct(null); setCustomSG(""); }
                }}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
              />
              {showDropdown && productSearch && (
                <div className="dd">
                  {filteredProducts.map((p,i) => (
                    <div key={i} className="ddo" onMouseDown={() => {
                      setSelectedProduct(p); setProductSearch(p.name);
                      setCustomSG(p.sg.toString()); setIsDG(p.dg); setShowDropdown(false);
                    }}>
                      <span style={{ color:"#DCE4F0" }}>{p.name}</span>
                      <div style={{ display:"flex", gap:"6px", alignItems:"center" }}>
                        <span style={{ fontSize:"11px", color:"#4A6A8A" }}>SG {p.sg}</span>
                        <span className={`dgb ${p.dg?"dgy":"dgn"}`}>{p.dg?"DG":"NON-DG"}</span>
                      </div>
                    </div>
                  ))}
                  {filteredProducts.length===0 && (
                    <div style={{ padding:"11px 12px", color:"#4A6A8A", fontFamily:"DM Mono,monospace", fontSize:"11px" }}>No match</div>
                  )}
                </div>
              )}
            </div>

            {isDG && selectedProduct?.un && (
              <div style={{ background:"rgba(255,60,60,0.06)", border:"1px solid rgba(255,60,60,0.2)", borderRadius:"6px", padding:"10px 12px", marginBottom:"14px" }}>
                <div style={{ fontFamily:"DM Mono,monospace", fontSize:"10px", color:"#FF6B6B", letterSpacing:"1px", marginBottom:"4px" }}>⚠ DG DETAILS</div>
                <div style={{ fontFamily:"DM Mono,monospace", fontSize:"11px", color:"#CC9090", lineHeight:1.9 }}>
                  {selectedProduct.un} &nbsp;|&nbsp; Class {selectedProduct.cls} &nbsp;|&nbsp; PG {selectedProduct.pg}
                </div>
              </div>
            )}

            <div className="fg">
              <span className="fl">Specific Gravity (SG)</span>
              <input className="fi" type="number" step="0.001" min="0.5" max="2.5"
                placeholder="e.g. 1.025" value={customSG} onChange={e => setCustomSG(e.target.value)} />
              {customSG && (
                <div style={{ fontFamily:"DM Mono,monospace", fontSize:"10px", color:"#4A6A8A", marginTop:"4px" }}>
                  ≈ {(parseFloat(customSG)*1000).toFixed(0)} kg/m³
                </div>
              )}
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px" }}>
              <div className="fg">
                <span className="fl" style={{ display:"flex", alignItems:"center", gap:"5px" }}>
                  Min Fill % <span style={{ fontSize:"9px", letterSpacing:"1px", color:"#2A5A3A", background:"rgba(0,200,120,0.08)", border:"1px solid rgba(0,200,120,0.15)", borderRadius:"2px", padding:"1px 5px" }}>🔒 LOCKED</span>
                </span>
                <div className="fi" style={{ cursor:"not-allowed", opacity:0.6, userSelect:"none", color:"#6B8AAA", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <span>{effectiveMinFill}%</span>
                  <span style={{ fontSize:"11px", color:"#2A4A3A" }}>🔒</span>
                </div>
                <div style={{ fontFamily:"DM Mono,monospace", fontSize:"10px", color:"#2A4A3A", marginTop:"3px" }}>Fixed — 80% of tank capacity</div>
              </div>
              <div className="fg">
                <span className="fl" style={{ display:"flex", alignItems:"center", gap:"5px" }}>
                  Max Fill % <span style={{ fontSize:"9px", letterSpacing:"1px", color:"#2A5A3A", background:"rgba(0,200,120,0.08)", border:"1px solid rgba(0,200,120,0.15)", borderRadius:"2px", padding:"1px 5px" }}>🔒 LOCKED</span>
                </span>
                <div className="fi" style={{ cursor:"not-allowed", opacity:0.6, userSelect:"none", color:"#6B8AAA", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <span>{effectiveMaxFill}%</span>
                  <span style={{ fontSize:"11px", color:"#2A4A3A" }}>🔒</span>
                </div>
                <div style={{ fontFamily:"DM Mono,monospace", fontSize:"10px", color:"#2A4A3A", marginTop:"3px" }}>{isDG ? "DG — 95% of tank capacity" : "Non-DG — 97% of tank capacity"}</div>
              </div>
            </div>
            <div style={{ fontFamily:"DM Mono,monospace", fontSize:"10px", color:"#6B4A20", background:"rgba(255,140,0,0.06)", border:"1px solid rgba(255,140,0,0.18)", borderRadius:"5px", padding:"7px 10px", marginBottom:"14px", lineHeight:1.7 }}>
              ⚠ Fill limits above apply to <strong style={{ color:"#FFA030" }}>standard (non-baffled) tanks only</strong>.<br/>
              Baffle tanks have no fill limit restrictions — load to weight limit.
            </div>

            <div className="stitle" style={{ marginTop:"4px" }}>Destination</div>

            <div className="fg">
              <span className="fl">Country</span>
              <select className="fi" value={destination} onChange={e => setDestination(e.target.value)} style={{ cursor:"pointer" }}>
                <option value="">-- Select Country --</option>
                {ALL_COUNTRIES.map(c => (
                  <option key={c} value={c}>{c}{NA_COUNTRIES.has(c) ? " ⚖" : ""}</option>
                ))}
              </select>
              <div style={{ fontFamily:"DM Mono,monospace", fontSize:"10px", color:"#4A6A8A", marginTop:"4px" }}>
                ⚖ = 23,955 kg fixed limit applies
              </div>
            </div>

            {/* Weight info box — auto-switches */}
            {destination && (
              <div className={`wbox ${isRestricted?"na":"ww"}`}>
                <div className="wbox-lbl">⚖ WEIGHT LIMIT APPLIED</div>
                <div className="wbox-body">
                  {isRestricted ? (
                    <>
                      <strong>{gwLimit.toLocaleString()} kg gross</strong><br/>
                      {countryGVW.note}<br/>
                      Cargo = {gwLimit.toLocaleString()} kg − tare<br/>
                      <span style={{ color:"#7A6040", fontSize:"10px" }}>Road limit is below tank structural max of 36,000 kg</span>
                    </>
                  ) : (
                    <>
                      <strong>36,000 kg gross</strong><br/>
                      Tank structural maximum<br/>
                      Cargo = 36,000 kg − tare<br/>
                      <span style={{ color:"#3A6070", fontSize:"10px" }}>Verify local road &amp; port weight limits at {destination}</span>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT PANEL */}
          <div className="rp">
            {!canCalculate ? (
              <div className="nores">
                <div style={{ fontSize:"36px", marginBottom:"12px" }}>⚗</div>
                Enter product SG and select a destination country<br/>
                <span style={{ fontSize:"11px" }}>Results will show MIN and MAX permitted volume &amp; weight</span>
                <div style={{ marginTop:"18px", display:"flex", gap:"12px", justifyContent:"center", flexWrap:"wrap" }}>
                  <div style={{ background:"rgba(255,140,0,0.07)", border:"1px solid rgba(255,140,0,0.2)", borderRadius:"6px", padding:"8px 14px", fontSize:"11px", color:"#8A7040", fontFamily:"DM Mono,monospace" }}>
                    ⚖ USA / Canada / Mexico / AU / JP + more → country road limit
                  </div>
                  <div style={{ background:"rgba(0,144,255,0.06)", border:"1px solid rgba(0,144,255,0.15)", borderRadius:"6px", padding:"8px 14px", fontSize:"11px", color:"#3A6090", fontFamily:"DM Mono,monospace" }}>
                    🌍 All other countries → 36,000 kg structural max
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Summary strip */}
                <div className="srow">
                  <div className="sbox">
                    <div className="snum" style={{ color:"#00C878" }}>{viable.length}</div>
                    <div className="slbl">Viable Tanks</div>
                  </div>
                  <div className="sbox">
                    <div className="snum" style={{ color:"#FF6B6B" }}>{nonViable.length}</div>
                    <div className="slbl">Not Viable</div>
                  </div>
                  <div className="sbox">
                    <div className="snum" style={{ color:"#0090FF" }}>{effectiveSG}</div>
                    <div className="slbl">SG</div>
                  </div>
                  <div className="sbox">
                    <div className="snum" style={{ color:"#4DB8FF", fontSize:"16px" }}>{effectiveMinFill}% → {effectiveMaxFill}%</div>
                    <div className="slbl">Fill Range</div>
                  </div>
                  <div className="sbox">
                    <div className="snum" style={{ color: isRestricted?"#FFA030":"#4DB8FF", fontSize:"15px" }}>
                      {gwLimit.toLocaleString()}
                    </div>
                    <div className="slbl">kg {isRestricted?"Road Limit":"Tank Max"}</div>
                  </div>
                </div>

                {/* AI Panel */}
                <div className="aip">
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div>
                      <div style={{ fontFamily:"DM Mono,monospace", fontSize:"10px", color:"#0090FF", letterSpacing:"2px", marginBottom:"3px" }}>AI OPERATIONS ADVISOR</div>
                      <div style={{ fontFamily:"DM Sans,sans-serif", fontSize:"12px", color:"#6B8AAA" }}>
                        Analyses yield, compliance &amp; ops for <strong style={{ color:"#DCE4F0" }}>{destination}</strong>
                      </div>
                    </div>
                    <button className="aibtn" onClick={handleAIAnalysis} disabled={loadingAI || viable.length===0}>
                      {loadingAI ? "⟳ Analysing..." : "▶ AI Analysis"}
                    </button>
                  </div>
                  {loadingAI && <div className="aitxt pulse" style={{ color:"#0090FF", fontSize:"12px" }}>Analysing allocation, weight compliance and requirements...</div>}
                  {aiAnalysis && !loadingAI && <div className="aitxt">{aiAnalysis}</div>}
                </div>

                {/* VIABLE RESULTS */}
                {viable.length > 0 && (
                  <>
                    <div className="stitle">✅ Viable Tank Options — Min &amp; Max Permitted Load</div>
                    {viable.map((r, i) => {
                      const isBest = i === bestIdx;
                      const minFillN = r.minFillPct;
                      const maxFillN = parseFloat(r.maxFillPct);
                      const limitColor = isRestricted ? "#FFA030" : "#4DB8FF";
                      // fill bar positions (as % of 100)
                      const barLeft  = minFillN;
                      const barWidth = maxFillN - minFillN;
                      const minGrossPct = (r.minGrossKg / r.effectiveLimit * 100).toFixed(1);
                      const maxGrossPct = (r.maxGrossKg / r.effectiveLimit * 100).toFixed(1);

                      return (
                        <div key={r.tank.id} className={`rc ${isBest?"best":r.warnings.length>0?"warn":""}`}>
                          <div className="tlabel">{r.tank.label}</div>
                          <div className="tsub">
                            T11 · {r.tank.tare.toLocaleString()} kg tare · Gross limit: {r.effectiveLimit.toLocaleString()} kg
                            {isRestricted ? ` (${destination} road limit)` : " (tank structural max)"}
                          </div>

                          {/* MIN ↔ MAX grid */}
                          <div className="range-grid">
                            {/* MIN half */}
                            <div className="range-half min-half">
                              <div className="range-header">▼ MINIMUM LOAD</div>
                              <div className="range-row">
                                <span className="range-label">Volume</span>
                                <span><span className="range-val" style={{ color:"#4DB8FF" }}>{(r.minVol/1000).toFixed(3)}</span><span className="range-unit">KL</span></span>
                              </div>
                              <div className="range-sub" style={{ textAlign:"right", marginBottom:"6px" }}>{r.minVol.toLocaleString()} L</div>
                              <div className="range-row">
                                <span className="range-label">Cargo</span>
                                <span><span className="range-val" style={{ color:"#4DB8FF" }}>{(r.minCargoKg/1000).toFixed(3)}</span><span className="range-unit">MT</span></span>
                              </div>
                              <div className="range-sub" style={{ textAlign:"right", marginBottom:"6px" }}>{r.minCargoKg.toLocaleString()} kg</div>
                              <div className="range-row">
                                <span className="range-label">Gross wt</span>
                                <span><span className="range-val" style={{ color:"#6B8AAA", fontSize:"15px" }}>{r.minGrossKg.toLocaleString()}</span><span className="range-unit">kg</span></span>
                              </div>
                              <div className="range-row" style={{ marginTop:"4px" }}>
                                <span className="range-label">Fill</span>
                                <span className="range-val" style={{ color:"#4DB8FF", fontSize:"15px" }}>{r.minFillPct}%</span>
                              </div>
                            </div>

                            <div className="range-divider"/>

                            {/* MAX half */}
                            <div className="range-half max-half">
                              <div className="range-header">▲ MAXIMUM LOAD</div>
                              <div className="range-row">
                                <span className="range-label">Volume</span>
                                <span><span className="range-val" style={{ color:"#00C878" }}>{(r.maxVol/1000).toFixed(3)}</span><span className="range-unit">KL</span></span>
                              </div>
                              <div className="range-sub" style={{ textAlign:"right", marginBottom:"6px" }}>{r.maxVol.toLocaleString()} L</div>
                              <div className="range-row">
                                <span className="range-label">Cargo</span>
                                <span><span className="range-val" style={{ color:"#00C878" }}>{(r.maxCargoKg/1000).toFixed(3)}</span><span className="range-unit">MT</span></span>
                              </div>
                              <div className="range-sub" style={{ textAlign:"right", marginBottom:"6px" }}>{r.maxCargoKg.toLocaleString()} kg</div>
                              <div className="range-row">
                                <span className="range-label">Gross wt</span>
                                <span><span className="range-val" style={{ color: r.maxGrossKg > r.effectiveLimit?"#FF6B6B":limitColor, fontSize:"15px" }}>{r.maxGrossKg.toLocaleString()}</span><span className="range-unit">kg</span></span>
                              </div>
                              <div className="range-row" style={{ marginTop:"4px" }}>
                                <span className="range-label">Fill</span>
                                <span className="range-val" style={{ color:"#00C878", fontSize:"15px" }}>{r.maxFillPct}%</span>
                              </div>
                            </div>
                          </div>

                          {/* Fill range bar */}
                          <div style={{ fontFamily:"DM Mono,monospace", fontSize:"10px", color:"#4A6A8A", marginBottom:"4px" }}>
                            Fill range: <span style={{ color:"#4DB8FF" }}>{r.minFillPct}%</span> min → <span style={{ color:"#00C878" }}>{r.maxFillPct}%</span> max &nbsp;|&nbsp; Span: <span style={{ color:"#DCE4F0" }}>{(maxFillN - minFillN).toFixed(1)}%</span>
                          </div>
                          <div className="fill-track">
                            <div className="fill-range-bar" style={{ left:`${barLeft}%`, width:`${barWidth}%` }}/>
                            <div className="fill-tick" style={{ left:`${minFillN}%`, transform:"translateX(-50%)" }}/>
                            <div className="fill-tick" style={{ left:`${Math.min(maxFillN,99.5)}%`, transform:"translateX(-50%)", background:"#00C878" }}/>
                          </div>
                          <div className="fill-labels"><span>0%</span><span>50%</span><span>100%</span></div>

                          {/* Gross weight compliance bars */}
                          <div className="wt-bar-wrap" style={{ marginTop:"10px" }}>
                            <div style={{ fontFamily:"DM Mono,monospace", fontSize:"10px", color:"#4A6A8A", marginBottom:"8px", letterSpacing:"1px" }}>
                              GROSS WEIGHT vs LIMIT ({r.effectiveLimit.toLocaleString()} kg)
                            </div>
                            <div className="wt-bar-row">
                              <span style={{ color:"#4DB8FF", width:"30px" }}>MIN</span>
                              <div className="wt-bar-bg">
                                <div className="wt-bar-fill" style={{ width:`${Math.min(parseFloat(minGrossPct),100)}%`, background:"rgba(77,184,255,0.5)" }}/>
                              </div>
                              <span style={{ color:"#4A6A8A", width:"60px", textAlign:"right" }}>{r.minGrossKg.toLocaleString()} kg</span>
                              <span style={{ color:"#4DB8FF", width:"36px", textAlign:"right" }}>{minGrossPct}%</span>
                            </div>
                            <div className="wt-bar-row">
                              <span style={{ color:"#00C878", width:"30px" }}>MAX</span>
                              <div className="wt-bar-bg">
                                <div className="wt-bar-fill" style={{ width:`${Math.min(parseFloat(maxGrossPct),100)}%`, background: parseFloat(maxGrossPct)>=99 ? "rgba(255,100,100,0.5)" : "rgba(0,200,120,0.5)" }}/>
                              </div>
                              <span style={{ color:"#4A6A8A", width:"60px", textAlign:"right" }}>{r.maxGrossKg.toLocaleString()} kg</span>
                              <span style={{ color: parseFloat(maxGrossPct)>=99?"#FF6B6B":"#00C878", width:"36px", textAlign:"right" }}>{maxGrossPct}%</span>
                            </div>
                            <div style={{ fontFamily:"DM Mono,monospace", fontSize:"10px", color:"#4A6A8A", marginTop:"6px" }}>
                              Headroom at max load: <span style={{ color: r.headroomKg > 200 ? "#6B8AAA":"#FF6B6B" }}>{r.headroomKg.toLocaleString()} kg</span>
                              &nbsp;|&nbsp; Limiting factor: <span className="oktag" style={{ fontSize:"10px", padding:"1px 6px" }}>{r.limitingFactor}</span>
                            </div>
                          </div>

                          {r.warnings.length > 0 && (
                            <div style={{ marginTop:"6px" }}>
                              {r.warnings.map((w,j) => <span key={j} className="wtag">⚠ {w}</span>)}
                            </div>
                          )}
                          <div style={{ marginTop:"6px", fontFamily:"DM Mono,monospace", fontSize:"10px", color:"#2A4060" }}>{r.tank.notes}</div>
                        </div>
                      );
                    })}
                  </>
                )}

                {/* NON-VIABLE */}
                {nonViable.length > 0 && (
                  <>
                    <div className="stitle" style={{ color:"#FF6B6B", borderColor:"rgba(255,60,60,0.15)", marginTop:"6px" }}>❌ Not Viable</div>
                    <div style={{ display:"flex", gap:"10px", flexWrap:"wrap" }}>
                      {nonViable.map(r => (
                        <div key={r.tank.id} className="rc fail" style={{ flex:"1", minWidth:"160px" }}>
                          <div className="tlabel" style={{ fontSize:"18px" }}>{r.tank.label}</div>
                          {r.warnings.map((w,j) => <div key={j}><span className="ftag">✕ {w}</span></div>)}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════ FLEET TAB ══════════════════════ */}
      {activeTab === "fleet" && (
        <div style={{ padding:"24px 32px" }}>
          <div style={{ fontFamily:"Bebas Neue,sans-serif", fontSize:"26px", letterSpacing:"3px", color:"#F0F6FF", marginBottom:"4px" }}>Your T11 ISO Tank Fleet</div>
          <div style={{ fontFamily:"DM Mono,monospace", fontSize:"11px", color:"#4A6A8A", marginBottom:"22px" }}>
            USA / Canada / Mexico → 23,955–24,000 kg road limit &nbsp;|&nbsp; AU / NZ / JP / CN / KR → 26,000–30,000 kg &nbsp;|&nbsp; All others → 36,000 kg tank structural max
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"16px", marginBottom:"24px" }}>
            {ISO_TANKS.map(tank => {
              const naLimit = 23955;
              const cNA = naLimit - tank.tare;
              const cWW = WW_GVW_KG - tank.tare;
              return (
                <div key={tank.id} style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(0,144,255,0.15)", borderRadius:"10px", padding:"18px" }}>
                  <div style={{ fontFamily:"Bebas Neue,sans-serif", fontSize:"28px", letterSpacing:"2px", color:"#0090FF", marginBottom:"3px" }}>{tank.label}</div>
                  <div style={{ fontFamily:"DM Mono,monospace", fontSize:"10px", color:"#4A6A8A", marginBottom:"14px", letterSpacing:"1px" }}>T11 · FOOD &amp; INDUSTRIAL GRADE</div>
                  <div className="flinfo">
                    <div className="flrow"><span className="flk">Tank capacity</span><span className="flv">{tank.size.toLocaleString()} L</span></div>
                    <div className="flrow"><span className="flk">Tare (typical)</span><span className="flv">{tank.tare.toLocaleString()} kg</span></div>
                    <div className="flrow"><span className="flk">⚖ USA/CA/MX Gross limit</span><span className="flv" style={{ color:"#FFA030" }}>{naLimit.toLocaleString()} kg</span></div>
                    <div className="flrow"><span className="flk">⚖ USA/CA/MX Max cargo</span><span className="flv" style={{ color:"#FFA030" }}>{cNA.toLocaleString()} kg</span></div>
                    <div className="flrow"><span className="flk">🌍 Gross limit</span><span className="flv" style={{ color:"#4DB8FF" }}>{WW_GVW_KG.toLocaleString()} kg</span></div>
                    <div className="flrow"><span className="flk">🌍 Max cargo</span><span className="flv" style={{ color:"#4DB8FF" }}>{cWW.toLocaleString()} kg</span></div>
                  </div>
                  <div style={{ marginTop:"14px", fontFamily:"DM Mono,monospace", fontSize:"10px", color:"#4A6A8A", marginBottom:"6px" }}>MAX LOAD BY SG (at weight limit)</div>
                  <div style={{ display:"grid", gridTemplateColumns:"auto 1fr 1fr", gap:"2px 6px", fontFamily:"DM Mono,monospace", fontSize:"10px", alignItems:"center" }}>
                    <span style={{ color:"#4A6A8A" }}>SG</span>
                    <span style={{ color:"#FFA030", textAlign:"right" }}>⚖ NA KL</span>
                    <span style={{ color:"#4DB8FF", textAlign:"right" }}>🌍 KL</span>
                    {[0.79,0.90,1.00,1.10,1.20,1.40,1.60,1.84].map(sg => {
                      const vNA = cNA/sg; const vWW = cWW/sg;
                      const ovNA = vNA > tank.size; const ovWW = vWW > tank.size;
                      return [
                        <span key={`s${sg}`} style={{ color:"#6B8AAA", paddingTop:"2px" }}>{sg.toFixed(2)}</span>,
                        <span key={`n${sg}`} style={{ color:ovNA?"#FF6B6B":"#FFA030", textAlign:"right", paddingTop:"2px" }}>{ovNA?"cap":(vNA/1000).toFixed(2)+" KL"}</span>,
                        <span key={`w${sg}`} style={{ color:ovWW?"#FF6B6B":"#4DB8FF", textAlign:"right", paddingTop:"2px" }}>{ovWW?"cap":(vWW/1000).toFixed(2)+" KL"}</span>,
                      ];
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px" }}>
            <div style={{ background:"rgba(255,140,0,0.05)", border:"1px solid rgba(255,140,0,0.15)", borderRadius:"8px", padding:"16px 20px" }}>
              <div style={{ fontFamily:"Bebas Neue,sans-serif", fontSize:"18px", letterSpacing:"2px", color:"#FFA030", marginBottom:"10px" }}>⚖ RESTRICTED MARKETS — ROAD LIMITS APPLY</div>
              <div style={{ fontFamily:"DM Mono,monospace", fontSize:"11px", color:"#9BB5D0", lineHeight:2 }}>
                🇺🇸🇨🇦 USA / Canada: <strong style={{ color:"#FFA030" }}>23,955 kg</strong> (US federal highway)<br/>
                🇲🇽 Mexico: <strong style={{ color:"#FFA030" }}>24,000 kg</strong> (SCT NOM-012)<br/>
                🇦🇺🇳🇿 Australia / NZ: <strong style={{ color:"#FFB850" }}>26,000 kg</strong> (standard B-double chassis)<br/>
                🇯🇵🇹🇼 Japan / Taiwan: <strong style={{ color:"#FFB850" }}>28,000 kg</strong> (national highway law)<br/>
                🇨🇳🇰🇷🇮🇳🇵🇰 China / Korea / India / Pakistan: <strong style={{ color:"#FFB850" }}>30,000 kg</strong><br/>
                🇧🇩🇱🇰 Bangladesh / Sri Lanka: <strong style={{ color:"#FFB850" }}>24,000 kg</strong><br/>
                🇲🇲 Myanmar: <strong style={{ color:"#FF8840" }}>21,000 kg</strong> (lower infrastructure standard)<br/>
                <span style={{ color:"#6B8AAA" }}>✓ Cargo limit = Road limit − tare weight</span>
              </div>
            </div>
            <div style={{ background:"rgba(0,144,255,0.04)", border:"1px solid rgba(0,144,255,0.12)", borderRadius:"8px", padding:"16px 20px" }}>
              <div style={{ fontFamily:"Bebas Neue,sans-serif", fontSize:"18px", letterSpacing:"2px", color:"#4DB8FF", marginBottom:"10px" }}>🌍 UNRESTRICTED — 36,000 KG STRUCTURAL MAX</div>
              <div style={{ fontFamily:"DM Mono,monospace", fontSize:"11px", color:"#9BB5D0", lineHeight:2 }}>
                No fixed customer limit applied<br/>
                Tank structural max: <strong style={{ color:"#4DB8FF" }}>36,000 kg gross</strong><br/>
                Covers: Europe, Middle East, SE Asia, Africa, South America<br/>
                Typical country road limits: 40–65 t GVW (well above tank max)<br/>
                <span style={{ color:"#6B8AAA" }}>⚠ Always verify local road, port &amp; rail weight regulations at destination.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════ PRODUCTS TAB ══════════════════════ */}
      {activeTab === "reference" && (
        <div style={{ padding:"24px 32px" }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"28px" }}>
            {[true,false].map(dg => (
              <div key={String(dg)}>
                <div style={{ fontFamily:"Bebas Neue,sans-serif", fontSize:"22px", letterSpacing:"2px", color:dg?"#FF6B6B":"#00C878", marginBottom:"12px" }}>
                  {dg?"⚠️ Dangerous Goods":"✅ Non-DG Products"}
                </div>
                <table className="rt">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>SG</th>
                      {dg&&<><th>UN</th><th>Cls</th><th>PG</th></>}
                      <th>Fill %</th>
                      <th style={{ color:"#FFA030" }}>26K 🇺🇸🇨🇦 Max</th>
                      <th style={{ color:"#4DB8FF" }}>26K 🌍 Max</th>
                    </tr>
                  </thead>
                  <tbody>
                    {COMMON_PRODUCTS.filter(p=>p.dg===dg).map((p,i) => {
                      const t26 = ISO_TANKS[2]; // 26K
                      // NA 26K (using US/Canada 23,955 kg limit as reference)
                      const naRef = 23955;
                      const cNA = naRef - t26.tare;
                      const vNA = Math.round(cNA / p.sg);
                      const maxVNA = Math.round(t26.size * p.maxFill/100);
                      const capNA = vNA > maxVNA;
                      const fvNA = capNA ? maxVNA : vNA;
                      const fkgNA = Math.round(fvNA * p.sg);
                      const fpNA = ((fvNA/t26.size)*100).toFixed(1);
                      // WW 26K
                      const cWW = WW_GVW_KG - t26.tare;
                      const vWW = Math.round(cWW / p.sg);
                      const maxVWW = Math.round(t26.size * p.maxFill/100);
                      const capWW = vWW > maxVWW;
                      const fvWW = capWW ? maxVWW : vWW;
                      const fkgWW = Math.round(fvWW * p.sg);
                      const fpWW = ((fvWW/t26.size)*100).toFixed(1);
                      return (
                        <tr key={i}>
                          <td style={{ color:"#DCE4F0" }}>{p.name}</td>
                          <td style={{ color:"#0090FF" }}>{p.sg}</td>
                          {dg&&<><td style={{ color:"#FF9090" }}>{p.un}</td><td>{p.cls}</td><td>{p.pg}</td></>}
                          <td style={{ color:"#FFB400" }}>{p.minFill}–{p.maxFill}%</td>
                          <td>
                            <div style={{ color:capNA?"#FFB400":"#FFA030", fontWeight:"bold" }}>{fkgNA.toLocaleString()} kg</div>
                            <div style={{ color:"#4A6A8A", fontSize:"10px" }}>{(fvNA/1000).toFixed(2)} KL · {fpNA}%{capNA?" ⬆cap":""}</div>
                          </td>
                          <td>
                            <div style={{ color:capWW?"#FFB400":"#4DB8FF", fontWeight:"bold" }}>{fkgWW.toLocaleString()} kg</div>
                            <div style={{ color:"#4A6A8A", fontSize:"10px" }}>{(fvWW/1000).toFixed(2)} KL · {fpWW}%{capWW?" ⬆cap":""}</div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <div style={{ fontFamily:"DM Mono,monospace", fontSize:"10px", color:"#2A4060", marginTop:"6px" }}>
                  26K tank shown · ⚖ USA/CA = 23,955 kg limit · 🌍 = 36,000 kg structural max · ⬆ = fill % cap applies
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
