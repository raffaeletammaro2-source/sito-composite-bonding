// Riceve la notifica "Outgoing webhook" di Netlify Forms (modulo "prenotazione")
// e invia il lead al CRM GoHighLevel.
//
// Variabili d'ambiente su Netlify:
//   GHL_WEBHOOK_URL       indirizzo del webhook GoHighLevel (obbligatoria)
//   LEAD_WEBHOOK_SECRET   lo stesso testo inserito come "JWS secret token" nella notifica Netlify
//                         (consigliata: impedisce a terzi di inviare lead finti al CRM)

import crypto from "node:crypto";
import { buildLead } from "../lib/lead.mjs";

const FORM_NAME = "prenotazione";

function b64url(buf) {
  return Buffer.from(buf).toString("base64").replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
}

// Verifica la firma JWS (HS256) che Netlify aggiunge nell'header X-Webhook-Signature
export function verifySignature(token, secret, rawBody) {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [h, p, s] = parts;
  const expected = b64url(crypto.createHmac("sha256", secret).update(`${h}.${p}`).digest());
  const a = Buffer.from(s), b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
  try {
    const claims = JSON.parse(Buffer.from(p.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString());
    if (claims.iss && claims.iss !== "netlify") return false;
    if (claims.sha256) {
      const hash = crypto.createHash("sha256").update(rawBody).digest("hex");
      if (hash !== claims.sha256) return false;
    }
  } catch (e) {
    return false;
  }
  return true;
}

export const handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Metodo non consentito" };

  const raw = event.isBase64Encoded ? Buffer.from(event.body || "", "base64").toString("utf8") : (event.body || "");
  const secret = process.env.LEAD_WEBHOOK_SECRET;
  if (secret) {
    const sig = event.headers["x-webhook-signature"] || event.headers["X-Webhook-Signature"];
    if (!verifySignature(sig, secret, raw)) {
      console.error("Firma della notifica non valida: richiesta rifiutata");
      return { statusCode: 401, body: "firma non valida" };
    }
  } else {
    console.warn("LEAD_WEBHOOK_SECRET non impostata: firma non verificata");
  }

  let body;
  try { body = JSON.parse(raw); } catch (e) {
    console.error("Corpo non valido", e);
    return { statusCode: 400, body: "bad request" };
  }
  const submission = body.payload || body; // accetta sia il formato evento sia quello della notifica
  if (!submission || (submission.form_name && submission.form_name !== FORM_NAME)) {
    return { statusCode: 200, body: "ignorato" };
  }

  const url = process.env.GHL_WEBHOOK_URL;
  if (!url) {
    console.error("GHL_WEBHOOK_URL non impostata: richiesta non inviata al CRM", submission.id);
    return { statusCode: 500, body: "webhook CRM non configurato" };
  }

  const lead = buildLead(submission);
  try {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(lead) });
    if (!res.ok) {
      console.error("Il CRM ha risposto con errore", res.status, await res.text());
      return { statusCode: 502, body: "errore CRM" };
    }
    console.log("Richiesta inviata al CRM", submission.id);
    return { statusCode: 200, body: "ok" };
  } catch (e) {
    console.error("Invio al CRM non riuscito", e);
    return { statusCode: 502, body: "errore rete" };
  }
};
