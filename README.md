# jardineriasmitre.com

Static site (HTML + CSS + vanilla JS, no build step). Upload the whole folder to the hosting.

- `index.html`, `jardines.html`, `piscinas.html`, `cesped.html`, `privacidad.html`, `proteccion.html`
- `assets/css/styles.css`: the whole design system (colours and type in `:root`)
- `assets/js/main.js`: logo intro, animations, gallery, lightbox and form
- `img/`: photos optimised to WebP, plus `brote.svg` (logo sprout as a vector)

The logo intro plays once per browser session. It is skipped when the visitor has "reduce motion" turned on, and a click skips it.
