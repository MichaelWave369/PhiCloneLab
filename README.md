# Φ CloneLab

An open-source, dependency-free, evidence-aware educational research simulator exploring cloning concepts, cell identity, developmental divergence and scientific provenance.

## Try it

Open `site/index.html` directly in a browser, or enable GitHub Pages using **Settings → Pages → Build and deployment → GitHub Actions**. The workflow deploys `site/` on every push to `main`.

## v0.2 Evidence Atlas

- [Evidence Atlas](site/atlas.html) lets visitors inspect individual scientific and historical claims and see exactly which sources support them.
- Evidence categories distinguish demonstrated animal/cell science, documented proposals, professional guidance, and unverified outcomes.
- Chronological timeline, side-by-side comparisons, research limitations, and local JSON export.
- Structured and versioned dataset: [site/data/research.json](site/data/research.json).
- To run locally: `python -m http.server 8000 --directory site` from the repository root, then open `http://localhost:8000/atlas.html`.
- Run `npm test` to validate registry integrity with no external npm dependencies.

## v0.1 features

- Four distinct conceptual research pathways: animal SCNT, embryo splitting, induced pluripotent stem cells, and Bryan Bishop's proposal.
- Qualitative uncertainty lenses for epigenetic and developmental context, explicitly **not** calibrated probabilities or protocols.
- Dynamic lineage relationship graph and stage-by-stage explanations.
- Searchable evidence ledger with category filters and external primary/reference links.
- Local JSON session export; no authentication, cloud dependency, or data uploads.
- Responsive dark interface and reduced-motion support.

## Scientific boundaries

This system does **not** reproduce an experimental cloning workflow, provide biological operating parameters, claim any cloned humans exist, or predict reproductive outcomes. Research proposals, animal demonstrations, and established cell biology are separated in the UI. See [RESEARCH_BOUNDARIES.md](docs/RESEARCH_BOUNDARIES.md).

## Development

The site uses plain HTML/CSS/JavaScript to eliminate build steps and avoid blank-page failures caused by bundler configuration. It runs locally and on GitHub Pages without a package manager.

## License

MIT. Original repository license retained.
