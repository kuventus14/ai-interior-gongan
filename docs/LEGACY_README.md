# 공간 · AI Interior Studio

Desktop-first, public demo MVP based on the supplied 공간 reference board. Vanilla JavaScript, locally served images/fonts, no external runtime API required.

## Implemented flows

- Landing → B2B/B2C demo profile → dashboard and projects.
- PDF, JPG, PNG, WebP uploads with signature checks, image decoding, 20 MB size limit, drag/drop and preview. Upload originals persist in IndexedDB.
- Project name, space type, concept, brief, budget, ceiling height (default 2400 mm).
- Explicit sample analysis with editable room names/areas and calculated area/pyeong total.
- Six concepts, room reference photos, concept detail, three-way comparison, saved/applied concepts.
- Nine official-product catalog entries with brand, product name/code and source link; category filter, search, sort and favorites.
- JSON project export, UTF-8 BOM CSV materials export, reference JPEG and original-file downloads.
- SketchUp request demo only for B2B + floorplan sources. Screenshots and B2C disable the action. The JSON explicitly states `actualSkpGenerated: false`; no fake `.skp` file.
- B2B console: customer name, internal notes, status, search, counts and list export. B2C cannot open the console, including direct hash navigation.
- Local role-separated projects and favorites, reload persistence, deletion and profile editing.

## Demo boundaries

No AI generation, OCR/plan recognition, live material database, live prices/stock, actual SKU-image matching, SketchUp model generation, account/email verification, team sync or customer sharing. Reference photos are independent rooms, not renderings of the uploaded structure. Scores and costs are deterministic demonstration values. Catalog product identity is real, while texture graphics are illustrative. Confirm actual specification/availability with the official source. The website is public through Sites at the owner’s explicit request; anyone with its URL can open it. In-app profiles are local demo personas, not authentication. Projects and uploads remain browser-local and are not automatically shared with visitors.

Browser localStorage stores project metadata; IndexedDB stores uploaded files. Data does not sync to other devices and is removed if the browser's site data is cleared. Uploaded customer files are not sent to an AI service or bundled into a deployment.

## Development and deployment

Run `python3 server.py --port 5173` and open the local address. Run `python3 build.py` to copy the exact static assets from `public/` into `dist/`; `.openai/hosting.json` declares the `dist/` deployment directory. The source repository is the Sites-managed Git repository linked to project `appgprj_6aa0e0bc53c48191aa2989972df39290`.

`tests/e2e.cjs` exercises real Chromium interactions. Set `TEST_CHROME` if needed; it uses the Work runtime's Playwright and pdf-lib packages. Screenshots and results go to ignored `test-results/`.

## Asset and product sources

Interior reference photos: Unsplash, downloaded locally from images.unsplash.com. Photo IDs: `1600210492486-724fe5c67fb0`, `1600607687939-ce8a6c25118c`, `1600210492493-0946911123ea`, `1600566753086-00f18fb6b3ea`, `1600607687920-4e2a09cf159d`, `1600210491892-03d54c0aaf87`, `1556912172-45b7abe8b7e1`, `1611892440504-42a792e24d32`, `1620626011761-996317b8d101`. These are substitutes for the low-resolution reference board's interior photographs, not claims of pixel-identical source photography.

Fonts: Pretendard v1.3.9, SIL Open Font License. Icons: Lucide 0.468.0, ISC License. Third-party licenses are included under `public/assets/`.

Official product sources are stored per item in `public/data.js` (LX Z:IN and IKEA Korea). Product names/codes were checked against official web pages during creation; scores, costs and textures are demo content.
