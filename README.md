# I-ArtWorks — Frontend (LocalStorage stage)

Static HTML/CSS/vanilla-JS art gallery. No build step, no dependencies.
All data (cart, wishlist, accounts, orders, commissions) lives in the browser's LocalStorage until the backend stage.

## Run locally
Any static server works (opening `index.html` by double-click also works, but a server is closer to production):

```
cd I-ArtWorks-second
python3 -m http.server 8000      # then open http://localhost:8000
# or:  npx serve .
```

### Test on your Android phone
Run the server above, find your computer's IP (e.g. 192.168.1.20), and open `http://192.168.1.20:8000` on the phone (same Wi-Fi).

## Deploy (free options)
- **Netlify:** drag the project folder onto https://app.netlify.com/drop
- **GitHub Pages:** push the folder to a repo → Settings → Pages → deploy from `main` / root. Sub-folder URLs (`/repo-name/`) work: all paths are relative.
- **Cloudflare Pages / Vercel:** import the repo, no build command, output directory `/`.

## Where to edit things
| What | Where |
|---|---|
| Paintings, prices, titles, categories, descriptions | `data/artworks.js` (single source for every page) |
| WhatsApp number, convenience fee, social URLs | `script/utils.js` → `SITE_CONFIG` |
| Promo codes | `script/store.js` → `PROMOS` |
| New paintings | add an entry to `artworks` + put the image in `images/` |

## Architecture (for the backend stage)
`script/store.js` is the only file that reads/writes cart, wishlist and orders; `script/auth.js` owns accounts. Replace their method bodies with API calls and the UI needs no changes.

## Known limits of this stage
- Accounts/passwords are stored locally with a light hash — demo only, not secure. Forgot-password resets directly (no email without a backend).
- Payment is Cash on Delivery only; order status is simulated from dates.
- Social-login buttons were removed (they were non-functional placeholders; OAuth needs a backend).
- Footer Instagram/Facebook icons stay hidden until you paste real URLs into `SITE_CONFIG.social`.
