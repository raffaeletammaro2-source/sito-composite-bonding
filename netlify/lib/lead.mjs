// Trasforma un invio del modulo "prenotazione" nei campi inviati al CRM GoHighLevel.

export function normalizePhone(raw) {
  if (!raw) return "";
  let p = String(raw).replace(/[^\d+]/g, "");
  if (p.startsWith("00")) p = "+" + p.slice(2);
  if (!p.startsWith("+")) {
    if (p.startsWith("39") && p.length >= 11) p = "+" + p;
    else p = "+39" + p;
  }
  return p;
}

export function splitName(full) {
  const parts = String(full || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { first: "", last: "" };
  if (parts.length === 1) return { first: parts[0], last: "" };
  return { first: parts[0], last: parts.slice(1).join(" ") };
}

function fileUrl(f) {
  if (!f) return "";
  if (typeof f === "string") return f;
  return f.url || "";
}

export function buildLead(payload) {
  const d = payload.data || {};
  const { first, last } = splitName(d.nome);
  const sede = (d.sede || "Aversa").trim();
  return {
    first_name: first,
    last_name: last,
    full_name: String(d.nome || "").trim(),
    phone: normalizePhone(d.tel),
    sede,
    messaggio: d.msg || "",
    foto_url: fileUrl(d.foto),
    privacy: d.privacy ? "accettata" : "",
    source: "Landing Composite Bonding Aversa",
    trattamento: "Composite bonding / Injection Technique",
    tags: ["composite-bonding", "landing-composite-bonding", `sede-${sede.toLowerCase()}`],
    pagina: d.referrer || payload.site_url || "",
    data_invio: payload.created_at || new Date().toISOString(),
    netlify_submission_id: payload.id || "",
    event_id: d.event_id || "",
  };
}
