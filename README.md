# Sito Composite Bonding – Studio Iuorio Odontoiatri

Sito statico pubblicato con Netlify (pubblicazione automatica a ogni modifica su `main`).

- `index.html` – landing Composite Bonding Aversa
- `composite-bonding-o-faccette.html`, `quanto-dura-composite-bonding.html`, `injection-technique-denti.html` – guide
- `grazie.html` – pagina dopo l'invio del modulo (Netlify Forms, modulo "prenotazione")
- `fonts/`, `fonts.css` – font in locale
- `netlify.toml`, `robots.txt` – configurazione

## Collegamento al CRM

`netlify/functions/submission-created.mjs` invia ogni richiesta del modulo "prenotazione" al webhook di GoHighLevel.
L'indirizzo del webhook va impostato su Netlify nella variabile d'ambiente `GHL_WEBHOOK_URL` (non nel codice: il repository è pubblico).
