// Invia ogni richiesta del modulo "prenotazione" al CRM (GoHighLevel / LeadConnector).
// Netlify esegue questa funzione da sola dopo ogni invio valido del modulo (spam già filtrato).
// L'indirizzo del webhook NON sta nel codice: va impostato su Netlify nella variabile GHL_WEBHOOK_URL.

const FORM_NAME = "prenotazione";

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
  };
}

export const handler = async (event) => {
  let payload;
  try {
    payload = JSON.parse(event.body).payload;
  } catch (e) {
    console.error("Corpo della richiesta non valido", e);
    return { statusCode: 400, body: "bad request" };
  }
  if (!payload || payload.form_name !== FORM_NAME) {
    return { statusCode: 200, body: "ignorato" };
  }

  const url = process.env.GHL_WEBHOOK_URL;
  if (!url) {
    console.error("GHL_WEBHOOK_URL non impostata: richiesta non inviata al CRM", payload.id);
    return { statusCode: 200, body: "webhook non configurato" };
  }

  const lead = buildLead(payload);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lead),
    });
    if (!res.ok) {
      console.error("Il CRM ha risposto con errore", res.status, await res.text());
      return { statusCode: 502, body: "errore CRM" };
    }
    console.log("Richiesta inviata al CRM", payload.id);
    return { statusCode: 200, body: "ok" };
  } catch (e) {
    console.error("Invio al CRM non riuscito", e);
    return { statusCode: 502, body: "errore rete" };
  }
};
