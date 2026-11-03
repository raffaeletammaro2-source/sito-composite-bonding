# Sito Composite Bonding – Studio Iuorio Odontoiatri

Sito statico pubblicato con Netlify (pubblicazione automatica a ogni modifica su `main`).

- `index.html` – landing Composite Bonding Aversa
- `composite-bonding-o-faccette.html`, `quanto-dura-composite-bonding.html`, `injection-technique-denti.html` – guide
- `grazie.html` – pagina dopo l'invio del modulo (Netlify Forms, modulo "prenotazione")
- `fonts/`, `fonts.css` – font in locale
- `netlify.toml`, `robots.txt` – configurazione

## Collegamento al CRM

`netlify/functions/lead-to-crm.mjs` riceve la notifica "Outgoing webhook" di Netlify Forms (modulo "prenotazione")
e invia ogni richiesta al webhook di GoHighLevel. I campi inviati sono definiti in `netlify/lib/lead.mjs`.

Variabili d'ambiente su Netlify (non nel codice: il repository è pubblico):
- `GHL_WEBHOOK_URL`: indirizzo del webhook GoHighLevel
- `LEAD_WEBHOOK_SECRET`: lo stesso testo impostato come "JWS secret token" nella notifica di Netlify Forms
